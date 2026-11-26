import { validateContribution, type Contribution } from "@/lib/contribute/schema";
import { getStore, hashToken, newDeleteToken } from "@/lib/contribute/server-store";

const MAX_BODY = 16 * 1024;
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 30;
const hits = new Map<string, number[]>();

/** Best-effort per-IP limit (per server instance). */
function rateLimited(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 10_000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

async function readJson(req: Request): Promise<unknown> {
  const text = await req.text();
  if (text.length > MAX_BODY) throw new Error("too large");
  return JSON.parse(text);
}

const bad = (error: string, status = 400) => Response.json({ error }, { status });

/** Store one consented contribution. Returns a delete token the client keeps for withdrawal. */
export async function POST(req: Request) {
  if (rateLimited(req)) return bad("rate_limited", 429);
  let body: unknown;
  try {
    body = await readJson(req);
  } catch {
    return bad("invalid_json");
  }
  const err = validateContribution(body);
  if (err) return bad(`invalid: ${err}`);
  const c = body as Contribution;
  // Server clock decides when it was received; client createdAt is kept inside the record.
  const deleteToken = newDeleteToken();
  const inserted = await (await getStore()).insert(c, hashToken(deleteToken));
  if (!inserted) return bad("duplicate", 409);
  return Response.json({ ok: true, deleteToken }, { status: 201 });
}

/** Withdraw consent: delete a contribution with its delete token. */
export async function DELETE(req: Request) {
  let body: { id?: unknown; deleteToken?: unknown };
  try {
    body = (await readJson(req)) as typeof body;
  } catch {
    return bad("invalid_json");
  }
  if (typeof body.id !== "string" || typeof body.deleteToken !== "string") return bad("missing id or token");
  const removed = await (await getStore()).remove(body.id, hashToken(body.deleteToken));
  return removed ? Response.json({ ok: true }) : bad("not_found", 404);
}
