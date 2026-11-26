"use client";

// Where contributions go. The Next.js app posts to its own API; the static preview stores them in
// the claude.ai artifact database. Both keep a small local registry so the person can withdraw.

import { Contribution, validateContribution } from "./schema";

export type Backend = "api" | "artifact-db" | "none";

let backend: Backend = "api";
export function configureContributions(b: Backend) {
  backend = b;
}
export function contributionBackend() {
  return backend;
}

// ---- claude.ai artifact runtime (only the calls we use) ----
interface DocRef {
  set(d: Record<string, unknown>): Promise<void>;
  delete(): Promise<void>;
  get(): Promise<{ exists: boolean; data(): Record<string, unknown> | undefined }>;
}
interface QuerySnap {
  docs: { id: string; exists: boolean; data(): Record<string, unknown> | undefined }[];
}
interface ArtifactDb {
  doc(path: string): DocRef;
  collection(path: string): { get(): Promise<QuerySnap> };
}
interface ArtifactUser {
  id(): Promise<string | null>;
  isOwner(): Promise<boolean>;
  canEdit(): Promise<boolean>;
}
interface ArtifactDownloads {
  save(r: { filename: string; data: string | Blob }): Promise<unknown>;
}
type ClaudeRuntime = { use(name: string): Promise<unknown> };

function runtime(): ClaudeRuntime | null {
  return (globalThis as unknown as { claude?: ClaudeRuntime }).claude ?? null;
}

async function artifact() {
  const rt = runtime();
  if (!rt) return null;
  const [db, user] = (await Promise.all([rt.use("db"), rt.use("user")])) as [ArtifactDb | null, ArtifactUser | null];
  if (!db || !user) return null;
  const uid = await user.id();
  return { db, user, uid };
}

// ---- local registry (for withdrawal) ----
const KEY = "tonepick.contributions.v1";
export interface LocalEntry {
  id: string;
  createdAt: string;
  label: string;
  backend: Backend;
  deleteToken?: string;
}

const EMPTY: LocalEntry[] = [];
let cache: LocalEntry[] | null = null;
const listeners = new Set<() => void>();

export function localEntries(): LocalEntry[] {
  if (cache) return cache;
  try {
    cache = JSON.parse(localStorage.getItem(KEY) ?? "[]") as LocalEntry[];
  } catch {
    cache = EMPTY;
  }
  return cache;
}
export const serverEntries = () => EMPTY;

/** useSyncExternalStore subscription for the local registry. */
export function subscribeEntries(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function saveLocal(entries: LocalEntry[]) {
  cache = entries;
  try {
    localStorage.setItem(KEY, JSON.stringify(entries));
  } catch {
    /* storage unavailable: entries live only for this visit */
  }
  listeners.forEach((fn) => fn());
}

/** Whether this viewer can contribute at all (preview: signed in with write access). */
export async function canContribute(): Promise<boolean> {
  if (backend === "none") return false;
  if (backend === "api") return true;
  const a = await artifact();
  return !!a?.uid;
}

export async function submitContribution(c: Contribution, label: string): Promise<void> {
  const err = validateContribution(c);
  if (err) throw new Error(`invalid contribution: ${err}`);
  let deleteToken: string | undefined;
  if (backend === "api") {
    const res = await fetch("/api/contributions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(c),
    });
    if (!res.ok) throw new Error(`server ${res.status}`);
    deleteToken = ((await res.json()) as { deleteToken: string }).deleteToken;
  } else if (backend === "artifact-db") {
    const a = await artifact();
    if (!a?.uid) throw new Error("not signed in");
    try {
      await a.db.doc(`contributions/${a.uid}/entries/${c.id}`).set(c as unknown as Record<string, unknown>);
      // A stub at contributions/<uid> lets the owner enumerate contributors.
      await a.db.doc(`contributions/${a.uid}`).set({ updatedAt: c.createdAt });
    } catch (e) {
      // Below the Contributor level the store rejects writes with invalid_argument.
      if ((e as { code?: string }).code === "invalid_argument") throw new Error("no_permission");
      throw e;
    }
  } else {
    throw new Error("contributions disabled");
  }
  saveLocal([...localEntries(), { id: c.id, createdAt: c.createdAt, label, backend, deleteToken }]);
}

export async function withdrawContribution(entry: LocalEntry): Promise<void> {
  if (entry.backend === "api") {
    const res = await fetch("/api/contributions", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: entry.id, deleteToken: entry.deleteToken }),
    });
    if (!res.ok && res.status !== 404) throw new Error(`server ${res.status}`);
  } else if (entry.backend === "artifact-db") {
    const a = await artifact();
    if (!a?.uid) throw new Error("not signed in");
    await a.db.doc(`contributions/${a.uid}/entries/${entry.id}`).delete();
  }
  saveLocal(localEntries().filter((e) => e.id !== entry.id));
}

// ---- owner tools (preview only) ----
export async function isDataOwner(): Promise<boolean> {
  if (backend !== "artifact-db") return false;
  const a = await artifact();
  return !!a && (await a.user.canEdit());
}

/** Reads every contribution (owner/editors only, by the db rules) and drops invalid ones. */
export async function exportAll(): Promise<{ rows: Contribution[]; invalid: number }> {
  const a = await artifact();
  if (!a) throw new Error("database unavailable");
  const contributors = await a.db.collection("contributions").get();
  const rows: Contribution[] = [];
  let invalid = 0;
  for (const d of contributors.docs) {
    const entries = await a.db.collection(`contributions/${d.id}/entries`).get();
    for (const e of entries.docs) {
      const c = e.data() as unknown as Contribution;
      if (validateContribution(c)) invalid++;
      else rows.push(c);
    }
  }
  return { rows, invalid };
}

export async function saveExport(rows: Contribution[]): Promise<boolean> {
  const rt = runtime();
  const downloads = rt ? ((await rt.use("downloads")) as ArtifactDownloads | null) : null;
  if (!downloads) return false;
  const data = rows.map((r) => JSON.stringify(r)).join("\n") + "\n";
  await downloads.save({ filename: `contributions-${new Date().toISOString().slice(0, 10)}.jsonl`, data });
  return true;
}
