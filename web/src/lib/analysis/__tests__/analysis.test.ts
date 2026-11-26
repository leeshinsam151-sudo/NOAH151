import { describe, expect, it } from "vitest";
import { labToHex, rgbToLab } from "../color";
import { predict } from "../classifier";
import { CAT, measureFace } from "../features";
import { assessQuality } from "../quality";
import { fillPolygon, Pt } from "../regions";
import fixtures from "./fixtures.json";

describe("color", () => {
  it("converts sRGB to CIELAB (D65) like skimage", () => {
    const white = rgbToLab(255, 255, 255);
    expect(white[0]).toBeCloseTo(100, 1);
    expect(Math.abs(white[1])).toBeLessThan(0.05);
    expect(Math.abs(white[2])).toBeLessThan(0.05);
    const red = rgbToLab(255, 0, 0);
    expect(red[0]).toBeCloseTo(53.24, 1);
    expect(red[1]).toBeCloseTo(80.09, 0);
    expect(red[2]).toBeCloseTo(67.2, 0);
  });

  it("round-trips Lab to hex", () => {
    expect(labToHex(rgbToLab(200, 150, 120))).toBe("#c89678");
  });
});

describe("classifier", () => {
  it("matches the Python reference probabilities", () => {
    for (const fx of fixtures as { features: Record<string, number>; probs: number[] }[]) {
      const pred = predict(fx.features);
      const byId = Object.fromEntries(pred.tones.map((t) => [t.id, t.p]));
      const tones = ["Spring_Light", "Spring_Warm", "Spring_Bright", "Summer_Light", "Summer_Cool", "Summer_Soft",
        "Autumn_Soft", "Autumn_Warm", "Autumn_Deep", "Winter_Deep", "Winter_Cool", "Winter_Bright"];
      tones.forEach((t, i) => expect(byId[t]).toBeCloseTo(fx.probs[i], 6));
      const total = pred.seasons.reduce((s, x) => s + x.p, 0);
      expect(total).toBeCloseTo(1, 6);
    }
  });

  it("imputes missing features", () => {
    const pred = predict({ L_mean_skin: 60 });
    expect(pred.imputed.length).toBe(29);
  });
});

describe("regions", () => {
  it("fills a square polygon", () => {
    const m = new Uint8Array(100);
    fillPolygon(m, 10, 10, [{ x: 2, y: 2 }, { x: 8, y: 2 }, { x: 8, y: 8 }, { x: 2, y: 8 }]);
    expect(m.reduce((s, v) => s + v, 0)).toBe(36);
  });
});

/** Synthetic face: uniform skin, hair band on top, eyes with white sclera and dark iris. */
function syntheticFace(skin: [number, number, number], cast: [number, number, number] = [1, 1, 1]) {
  const w = 200;
  const h = 240;
  const rgba = new Uint8ClampedArray(w * h * 4);
  const category = new Uint8Array(w * h);
  const lm: Pt[] = Array.from({ length: 478 }, () => ({ x: 100, y: 130 }));
  // Face oval: ellipse centered (100,130), radii 60x80.
  const ovalIdx = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148,
    176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109];
  ovalIdx.forEach((id, k) => {
    const t = (k / ovalIdx.length) * 2 * Math.PI - Math.PI / 2;
    lm[id] = { x: 100 + 60 * Math.cos(t), y: 130 + 80 * Math.sin(t) };
  });
  lm[234] = { x: 40, y: 130 };
  lm[454] = { x: 160, y: 130 };
  lm[1] = { x: 100, y: 140 };
  const eye = (idx: number[], cx: number, iris: number, ring: number[]) => {
    idx.forEach((id, k) => {
      const t = (k / idx.length) * 2 * Math.PI;
      lm[id] = { x: cx + 14 * Math.cos(t), y: 115 + 6 * Math.sin(t) };
    });
    lm[iris] = { x: cx, y: 115 };
    ring.forEach((id, k) => (lm[id] = { x: cx + 4 * Math.cos(k * 1.57), y: 115 + 4 * Math.sin(k * 1.57) }));
  };
  eye([263, 249, 390, 373, 374, 380, 381, 382, 362, 398, 384, 385, 386, 387, 388, 466], 125, 473, [474, 475, 476, 477]);
  eye([33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246], 75, 468, [469, 470, 471, 472]);
  // Push brows/lips far away so they don't exclude much.
  for (const id of [300, 293, 334, 296, 336, 285, 295, 282, 283, 276, 70, 63, 105, 66, 107, 55, 65, 52, 53, 46]) lm[id] = { x: 0, y: 0 };
  for (const id of [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17, 84, 181, 91, 146]) lm[id] = { x: 0, y: 0 };

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      let c: [number, number, number] = [235, 235, 235];
      let cat: number = CAT.background;
      if (((x - 100) / 60) ** 2 + ((y - 130) / 80) ** 2 <= 1) {
        c = skin;
        cat = CAT.faceSkin;
      }
      if (y < 55) {
        c = [40, 30, 25];
        cat = CAT.hair;
      }
      for (const cx of [75, 125]) {
        if (((x - cx) / 14) ** 2 + ((y - 115) / 6) ** 2 <= 1) {
          c = Math.hypot(x - cx, y - 115) < 4.5 ? [60, 40, 30] : [235, 228, 218];
        }
      }
      const lin = (v: number, g: number) => {
        const l = (v / 255) ** 2.2 * g;
        return Math.round(Math.min(1, l) ** (1 / 2.2) * 255);
      };
      rgba.set([lin(c[0], cast[0]), lin(c[1], cast[1]), lin(c[2], cast[2]), 255], i * 4);
      category[i] = cat;
    }
  }
  return { rgba, width: w, height: h, category, landmarks: lm };
}

describe("features", () => {
  it("measures skin color from the skin region only", () => {
    const m = measureFace(syntheticFace([224, 172, 140]), { whiteBalance: false });
    const ref = rgbToLab(224, 172, 140);
    expect(m.features.L_mean_skin).toBeCloseTo(ref[0], 1);
    expect(m.features.b_mean_skin).toBeCloseTo(ref[2], 1);
    expect(m.features.L_std_skin).toBeLessThan(0.01);
    expect(m.pixels.hair).toBeGreaterThan(1000);
    expect(m.features.L_mean_hair).toBeLessThan(25);
    expect(m.pixels.eye).toBeGreaterThan(100);
  });

  it("white balance pulls a yellow cast back toward neutral", () => {
    const yellow: [number, number, number] = [1.1, 1.0, 0.7];
    const raw = measureFace(syntheticFace([224, 172, 140], yellow), { whiteBalance: false });
    const wb = measureFace(syntheticFace([224, 172, 140], yellow));
    const truth = rgbToLab(224, 172, 140);
    expect(wb.wb.applied).toBe(true);
    expect(wb.wb.cast).toBeGreaterThan(10);
    expect(Math.abs(wb.features.b_mean_skin - truth[2])).toBeLessThan(Math.abs(raw.features.b_mean_skin - truth[2]));
  });

  it("produces a valid prediction and quality report end to end", () => {
    const m = measureFace(syntheticFace([224, 172, 140]));
    const q = assessQuality({ faceCount: 1, faceWidthPx: 300, landmarks: syntheticFace([0, 0, 0]).landmarks, measurement: m });
    expect(q.canAnalyze).toBe(true);
    const p = predict(m.features);
    expect(p.tones).toHaveLength(12);
    expect(p.imputed).toHaveLength(0);
  });

  it("rejects underexposed photos (judged by the whites of the eyes)", () => {
    const m = measureFace(syntheticFace([224, 172, 140], [0.06, 0.06, 0.06]));
    const q = assessQuality({ faceCount: 1, faceWidthPx: 300, measurement: m });
    expect(q.canAnalyze).toBe(false);
    expect(q.issues.map((i) => i.code)).toContain("too_dark");
  });

  it("accepts deep skin tones in a well-exposed photo", () => {
    const m = measureFace(syntheticFace([92, 60, 45]));
    expect(m.features.L_mean_skin).toBeLessThan(30);
    const q = assessQuality({ faceCount: 1, faceWidthPx: 300, measurement: m });
    expect(q.canAnalyze).toBe(true);
    expect(q.issues.map((i) => i.code)).not.toContain("dark");
  });
});
