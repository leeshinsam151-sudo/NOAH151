import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { appendFile, mkdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Contribution } from "./schema";

/** Server-side storage for contributions: Postgres when DATABASE_URL is set, else JSONL files. */
export interface ContributionStore {
  insert(c: Contribution, tokenHash: string): Promise<boolean>;
  remove(id: string, tokenHash: string): Promise<boolean>;
  all(): Promise<Contribution[]>;
}

export const newDeleteToken = () => randomBytes(24).toString("hex");
export const hashToken = (t: string) => createHash("sha256").update(t).digest("hex");

export function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/** Append-only JSONL: contributions.jsonl + deletions.jsonl (single instance / development). */
export class JsonlStore implements ContributionStore {
  constructor(private dir: string) {}
  private file(name: string) {
    return join(this.dir, name);
  }
  private async lines<T>(name: string): Promise<T[]> {
    try {
      return (await readFile(this.file(name), "utf8"))
        .split("\n")
        .filter(Boolean)
        .map((l) => JSON.parse(l) as T);
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === "ENOENT") return [];
      throw e;
    }
  }
  private async rows() {
    const deleted = new Set((await this.lines<{ id: string }>("deletions.jsonl")).map((d) => d.id));
    return (await this.lines<{ tokenHash: string; data: Contribution }>("contributions.jsonl")).filter(
      (r) => !deleted.has(r.data.id),
    );
  }
  async insert(c: Contribution, tokenHash: string) {
    await mkdir(this.dir, { recursive: true });
    if ((await this.rows()).some((r) => r.data.id === c.id)) return false;
    await appendFile(this.file("contributions.jsonl"), JSON.stringify({ tokenHash, data: c }) + "\n");
    return true;
  }
  async remove(id: string, tokenHash: string) {
    const row = (await this.rows()).find((r) => r.data.id === id);
    if (!row || !safeEqual(row.tokenHash, tokenHash)) return false;
    await appendFile(this.file("deletions.jsonl"), JSON.stringify({ id, at: new Date().toISOString() }) + "\n");
    return true;
  }
  async all() {
    return (await this.rows()).map((r) => r.data);
  }
}

export class PgStore implements ContributionStore {
  private ready: Promise<void> | null = null;
  constructor(private pool: import("pg").Pool) {}
  private init() {
    this.ready ??= this.pool
      .query(
        `CREATE TABLE IF NOT EXISTS contributions (
           id text PRIMARY KEY,
           token_hash text NOT NULL,
           created_at timestamptz NOT NULL DEFAULT now(),
           data jsonb NOT NULL
         )`,
      )
      .then(() => undefined);
    return this.ready;
  }
  async insert(c: Contribution, tokenHash: string) {
    await this.init();
    const r = await this.pool.query(
      "INSERT INTO contributions (id, token_hash, data) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING",
      [c.id, tokenHash, c],
    );
    return r.rowCount === 1;
  }
  async remove(id: string, tokenHash: string) {
    await this.init();
    const r = await this.pool.query("DELETE FROM contributions WHERE id = $1 AND token_hash = $2", [id, tokenHash]);
    return r.rowCount === 1;
  }
  async all() {
    await this.init();
    const r = await this.pool.query("SELECT data FROM contributions ORDER BY created_at");
    return r.rows.map((x) => x.data as Contribution);
  }
}

let store: ContributionStore | null = null;
export async function getStore(): Promise<ContributionStore> {
  if (store) return store;
  if (process.env.DATABASE_URL) {
    const { Pool } = await import("pg");
    store = new PgStore(new Pool({ connectionString: process.env.DATABASE_URL, max: 5 }));
  } else {
    store = new JsonlStore(process.env.CONTRIBUTIONS_DIR ?? join(process.cwd(), ".data"));
  }
  return store;
}

export function setStoreForTests(s: ContributionStore | null) {
  store = s;
}
