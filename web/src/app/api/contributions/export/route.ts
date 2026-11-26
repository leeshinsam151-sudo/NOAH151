import { getStore, safeEqual } from "@/lib/contribute/server-store";

/**
 * Export all contributions as JSONL for retraining (ml/export_contributions.py).
 * Requires `Authorization: Bearer $CONTRIBUTIONS_ADMIN_TOKEN`; disabled when the token is unset.
 */
export async function GET(req: Request) {
  const token = process.env.CONTRIBUTIONS_ADMIN_TOKEN;
  const auth = req.headers.get("authorization") ?? "";
  if (!token || token.length < 16 || !safeEqual(auth, `Bearer ${token}`)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const rows = await (await getStore()).all();
  return new Response(rows.map((r) => JSON.stringify(r)).join("\n") + (rows.length ? "\n" : ""), {
    headers: { "content-type": "application/x-ndjson; charset=utf-8", "cache-control": "no-store" },
  });
}
