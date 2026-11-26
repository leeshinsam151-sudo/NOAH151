import { Lab, linearToLab, newRegionStats, pushLab, RegionStats, srgbToLinear, Stat } from "./color";
import type { Features } from "./classifier";
import {
  dist,
  FACE_OVAL,
  fillPolygon,
  inflate,
  LEFT_BROW,
  LEFT_EYE,
  LEFT_IRIS,
  LIPS,
  NOSE_TIP,
  polygon,
  Pt,
  RIGHT_BROW,
  RIGHT_EYE,
  RIGHT_IRIS,
} from "./regions";

/** MediaPipe selfie_multiclass_256x256 categories. */
export const CAT = { background: 0, hair: 1, bodySkin: 2, faceSkin: 3, clothes: 4, other: 5 } as const;

export interface FaceInput {
  rgba: Uint8ClampedArray;
  width: number;
  height: number;
  /** Per-pixel segmentation category (same size as rgba), or null if segmentation failed. */
  category: Uint8Array | null;
  /** 478 face landmarks in crop pixel coordinates. */
  landmarks: Pt[];
}

export interface WhiteBalance {
  applied: boolean;
  gains: [number, number, number];
  /** Lab distance of the sclera from the expected near-neutral white (bigger = stronger color cast). */
  cast: number;
  scleraPixels: number;
  /** CIELAB L* of the sclera before correction — exposure reference independent of skin tone. */
  scleraL: number;
}

export interface FaceMeasurement {
  features: Features;
  wb: WhiteBalance;
  pixels: { skin: number; hair: number; eye: number };
  colors: { skin: Lab; hair: Lab | null; eye: Lab | null };
  /** brightL: 95th-percentile L* of the whole crop — exposure reference independent of skin tone. */
  diagnostics: { clipFraction: number; sideDiffL: number; brightL: number };
  masks: { skin: Uint8Array; hair: Uint8Array; eye: Uint8Array };
}

// Expected sclera chromaticity in a well-balanced photo (slightly warm white), as ratios to G.
const SCLERA_TARGET = { r: 1.03, b: 0.95 };
// Conservative: the model was trained on uncorrected photos, so we only remove strong casts.
const WB_STRENGTH = 0.5;
const WB_CLAMP: [number, number] = [0.9, 1.1];
const MIN_SCLERA_PX = 20;
/** Below this the "brightest eye pixels" are probably lashes/skin, not sclera. */
const MIN_SCLERA_L = 50;

const NO_WB: WhiteBalance = { applied: false, gains: [1, 1, 1], cast: 0, scleraPixels: 0, scleraL: NaN };

function buildMasks(input: FaceInput) {
  const { width: w, height: h, landmarks: lm, category } = input;
  const n = w * h;
  const oval = new Uint8Array(n);
  fillPolygon(oval, w, h, polygon(lm, FACE_OVAL));

  const eye = new Uint8Array(n);
  fillPolygon(eye, w, h, polygon(lm, LEFT_EYE));
  fillPolygon(eye, w, h, polygon(lm, RIGHT_EYE));

  const exclude = new Uint8Array(n);
  fillPolygon(exclude, w, h, inflate(polygon(lm, LEFT_EYE), 1.5));
  fillPolygon(exclude, w, h, inflate(polygon(lm, RIGHT_EYE), 1.5));
  fillPolygon(exclude, w, h, inflate(polygon(lm, LEFT_BROW), 1.25));
  fillPolygon(exclude, w, h, inflate(polygon(lm, RIGHT_BROW), 1.25));
  fillPolygon(exclude, w, h, inflate(polygon(lm, LIPS), 1.15));

  const skin = new Uint8Array(n);
  const hair = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    const c = category ? category[i] : CAT.faceSkin;
    if (oval[i] && !exclude[i] && c === CAT.faceSkin) skin[i] = 1;
    if (category && c === CAT.hair) hair[i] = 1;
  }
  return { skin, hair, eye };
}

/**
 * Estimates the lighting color from the whites of the eyes. Call it on the highest-resolution
 * crop available: at low resolution narrow (e.g. smiling) eyes mix sclera with lashes and skin.
 */
export function estimateWhiteBalance(input: FaceInput): WhiteBalance {
  const { width: w, height: h, rgba, landmarks: lm } = input;
  const eye = new Uint8Array(w * h);
  fillPolygon(eye, w, h, polygon(lm, LEFT_EYE));
  fillPolygon(eye, w, h, polygon(lm, RIGHT_EYE));
  const irises = [LEFT_IRIS, RIGHT_IRIS].map(({ center, ring }) => ({
    c: lm[center],
    r: (ring.reduce((s, i) => s + dist(lm[center], lm[i]), 0) / ring.length) * 1.2,
  }));
  const px: { Y: number; r: number; g: number; b: number }[] = [];
  for (let i = 0; i < eye.length; i++) {
    if (!eye[i]) continue;
    const x = (i % w) + 0.5;
    const y = Math.floor(i / w) + 0.5;
    if (irises.some(({ c, r }) => Math.hypot(x - c.x, y - c.y) < r)) continue;
    const r = srgbToLinear(rgba[i * 4]);
    const g = srgbToLinear(rgba[i * 4 + 1]);
    const b = srgbToLinear(rgba[i * 4 + 2]);
    px.push({ Y: 0.2127 * r + 0.7152 * g + 0.0722 * b, r, g, b });
  }
  // Brightest 40% of the non-iris eye pixels ≈ sclera (drops lashes and eyelid shadow).
  px.sort((p, q) => q.Y - p.Y);
  const top = px.slice(0, Math.floor(px.length * 0.4));
  const n = top.length;
  if (n < MIN_SCLERA_PX) return { ...NO_WB, scleraPixels: n };
  const m = top.reduce((s, p) => ({ r: s.r + p.r, g: s.g + p.g, b: s.b + p.b }), { r: 0, g: 0, b: 0 });
  const scleraL = linearToLab(m.r / n, m.g / n, m.b / n)[0];
  if (m.g <= 0 || scleraL < MIN_SCLERA_L) return { ...NO_WB, scleraPixels: n, scleraL };
  const rr = m.r / m.g;
  const bb = m.b / m.g;
  const clamp = (v: number) => Math.min(WB_CLAMP[1], Math.max(WB_CLAMP[0], v));
  let gains: [number, number, number] = [
    clamp(Math.pow(SCLERA_TARGET.r / rr, WB_STRENGTH)),
    1,
    clamp(Math.pow(SCLERA_TARGET.b / bb, WB_STRENGTH)),
  ];
  // Keep luminance unchanged.
  const k = 1 / (0.2127 * gains[0] + 0.7152 + 0.0722 * gains[2]);
  gains = [gains[0] * k, k, gains[2] * k];

  const actual = linearToLab(rr, 1, bb);
  const target = linearToLab(SCLERA_TARGET.r, 1, SCLERA_TARGET.b);
  const cast = Math.hypot(actual[1] - target[1], actual[2] - target[2]);
  return { applied: true, gains, cast, scleraPixels: n, scleraL };
}

function regionFeatures(prefix: string, s: RegionStats, out: Features) {
  for (const key of ["L", "a", "b", "ITA", "Chroma"] as const) {
    out[`${key}_mean_${prefix}`] = s[key].mean;
    out[`${key}_std_${prefix}`] = s[key].std;
  }
}

/**
 * @param opts.whiteBalance false to skip correction, a precomputed estimate (e.g. from a
 *   higher-resolution crop), or omitted to estimate from this input.
 */
export function measureFace(
  input: FaceInput,
  opts: { whiteBalance?: false | WhiteBalance } = {},
): FaceMeasurement {
  const { width: w, rgba, landmarks: lm } = input;
  const masks = buildMasks(input);
  const wb = opts.whiteBalance === false ? NO_WB : (opts.whiteBalance ?? estimateWhiteBalance(input));
  const [gr, gg, gb] = wb.gains;

  const stats = { skin: newRegionStats(), hair: newRegionStats(), eye: newRegionStats() };
  const counts = { skin: 0, hair: 0, eye: 0 };
  let clipped = 0;
  const noseX = lm[NOSE_TIP].x;
  const leftL = new Stat();
  const rightL = new Stat();

  for (let i = 0; i < masks.skin.length; i++) {
    const inSkin = masks.skin[i];
    const inHair = masks.hair[i];
    const inEye = masks.eye[i];
    if (!inSkin && !inHair && !inEye) continue;
    const R = rgba[i * 4];
    const G = rgba[i * 4 + 1];
    const B = rgba[i * 4 + 2];
    const lab = linearToLab(
      Math.min(1, srgbToLinear(R) * gr),
      Math.min(1, srgbToLinear(G) * gg),
      Math.min(1, srgbToLinear(B) * gb),
    );
    if (inSkin) {
      pushLab(stats.skin, lab);
      counts.skin++;
      if (Math.max(R, G, B) >= 250) clipped++;
      ((i % w) + 0.5 < noseX ? leftL : rightL).push(lab[0]);
    }
    if (inHair) {
      pushLab(stats.hair, lab);
      counts.hair++;
    }
    if (inEye) {
      pushLab(stats.eye, lab);
      counts.eye++;
    }
  }

  // Exposure: the brightest parts of the frame (sclera, teeth, background, clothes) should be
  // reasonably bright whatever the person's skin tone.
  const hist = new Uint32Array(101);
  for (let i = 0; i < masks.skin.length; i++) {
    const Y = 0.2127 * srgbToLinear(rgba[i * 4]) + 0.7152 * srgbToLinear(rgba[i * 4 + 1]) + 0.0722 * srgbToLinear(rgba[i * 4 + 2]);
    hist[Math.round(linearToLab(Y, Y, Y)[0])]++;
  }
  let brightL = 0;
  for (let L = 100, acc = 0; L >= 0; L--) {
    acc += hist[L];
    if (acc >= masks.skin.length * 0.05) {
      brightL = L;
      break;
    }
  }

  const features: Features = {};
  regionFeatures("skin", stats.skin, features);
  regionFeatures("hair", stats.hair, features);
  regionFeatures("eye", stats.eye, features);

  const meanLab = (s: RegionStats, n: number): Lab | null => (n ? [s.L.mean, s.a.mean, s.b.mean] : null);
  return {
    features,
    wb,
    pixels: counts,
    colors: {
      skin: meanLab(stats.skin, counts.skin) ?? [NaN, NaN, NaN],
      hair: meanLab(stats.hair, counts.hair),
      eye: meanLab(stats.eye, counts.eye),
    },
    diagnostics: {
      clipFraction: counts.skin ? clipped / counts.skin : 0,
      sideDiffL: leftL.n && rightL.n ? Math.abs(leftL.mean - rightL.mean) : 0,
      brightL,
    },
    masks,
  };
}
