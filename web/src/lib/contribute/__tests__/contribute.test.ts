import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { DELETE, POST } from "@/app/api/contributions/route";
import { GET as EXPORT } from "@/app/api/contributions/export/route";
import fixtures from "@/lib/analysis/__tests__/fixtures.json";
import { buildContribution, BuildArgs, FEATURE_NAMES, validateContribution } from "../schema";
import { JsonlStore, setStoreForTests } from "../server-store";

const features = (fixtures as { features: Record<string, number> }[])[0].features;

function args(over: Partial<BuildArgs> = {}): BuildArgs {
  return {
    source: "user",
    season: "Summer",
    tone: "Summer_Soft",
    confidence: "sure",
    hairDyed: false,
    makeup: "base",
    lighting: "daylight",
    features,
    wb: { applied: true, gains: [0.98, 1.0, 1.03], cast: 6.2 },
    quality: { score: 0.85, issues: [{ code: "dark" }] },
    pixels: { skin: 9000, hair: 3000, eye: 120 },
    aiTones: [
      { id: "Summer_Soft", p: 0.31 },
      { id: "Autumn_Soft", p: 0.22 },
      { id: "Summer_Light", p: 0.12 },
      { id: "Winter_Cool", p: 0.05 },
    ],
    ...over,
  };
}

describe("contribution schema", () => {
  it("builds a valid record with all 30 features and no photo", () => {
    const c = buildContribution(args());
    expect(validateContribution(c)).toBeNull();
    expect(Object.keys(c.features)).toEqual(FEATURE_NAMES);
    expect(c.ai.tones).toHaveLength(3);
    expect(JSON.stringify(c)).not.toMatch(/data:image|base64/);
  });

  it("stores unmeasurable features as null", () => {
    const c = buildContribution(args({ features: { ...features, L_mean_hair: NaN } }));
    expect(c.features.L_mean_hair).toBeNull();
    expect(validateContribution(c)).toBeNull();
  });

  it("accepts season-only labels", () => {
    expect(validateContribution(buildContribution(args({ tone: null, season: "Autumn", rawName: "가을 스트롱" })))).toBeNull();
  });

  it("rejects tampered records", () => {
    const c = buildContribution(args());
    expect(validateContribution({ ...c, label: { ...c.label, tone: "Winter_Deep" } })).toMatch(/mismatch/);
    expect(validateContribution({ ...c, photo: "data:image/png;base64,AAAA" })).toBe("keys");
    expect(validateContribution({ ...c, features: { ...c.features, L_mean_skin: 1e9 } })).toMatch(/features/);
    expect(validateContribution({ ...c, consent: { version: "old", agreedAt: c.createdAt } })).toBe("consent");
  });
});

describe("contributions API", () => {
  let dir: string;
  beforeAll(async () => {
    dir = await mkdtemp(join(tmpdir(), "contrib-"));
    setStoreForTests(new JsonlStore(dir));
    process.env.CONTRIBUTIONS_ADMIN_TOKEN = "test-admin-token-123456";
  });
  afterAll(async () => {
    setStoreForTests(null);
    await rm(dir, { recursive: true, force: true });
  });

  const post = (body: unknown) =>
    POST(new Request("http://x/api/contributions", { method: "POST", body: JSON.stringify(body) }));
  const del = (body: unknown) =>
    DELETE(new Request("http://x/api/contributions", { method: "DELETE", body: JSON.stringify(body) }));
  const exportAll = async (token: string) =>
    EXPORT(new Request("http://x/api/contributions/export", { headers: { authorization: `Bearer ${token}` } }));

  it("stores, exports and withdraws a contribution", async () => {
    const c = buildContribution(args());
    const res = await post(c);
    expect(res.status).toBe(201);
    const { deleteToken } = (await res.json()) as { deleteToken: string };
    expect((await post(c)).status).toBe(409);

    expect((await exportAll("wrong")).status).toBe(401);
    const exported = (await (await exportAll("test-admin-token-123456")).text()).trim().split("\n");
    expect(exported).toHaveLength(1);
    expect(JSON.parse(exported[0]).id).toBe(c.id);

    expect((await del({ id: c.id, deleteToken: "nope" })).status).toBe(404);
    expect((await del({ id: c.id, deleteToken })).status).toBe(200);
    expect((await (await exportAll("test-admin-token-123456")).text()).trim()).toBe("");
  });

  it("rejects invalid bodies", async () => {
    expect((await post({ hello: 1 })).status).toBe(400);
    const bad = await POST(new Request("http://x/api/contributions", { method: "POST", body: "{" }));
    expect(bad.status).toBe(400);
  });
});
