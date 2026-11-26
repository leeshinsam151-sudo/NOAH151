// MediaPipe Face Mesh landmark indices for the regions we sample.

export const FACE_OVAL = [
  10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150,
  136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109,
];
export const LEFT_EYE = [263, 249, 390, 373, 374, 380, 381, 382, 362, 398, 384, 385, 386, 387, 388, 466];
export const RIGHT_EYE = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];
export const LEFT_BROW = [300, 293, 334, 296, 336, 285, 295, 282, 283, 276];
export const RIGHT_BROW = [70, 63, 105, 66, 107, 55, 65, 52, 53, 46];
export const LIPS = [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17, 84, 181, 91, 146];
export const LEFT_IRIS = { center: 473, ring: [474, 475, 476, 477] };
export const RIGHT_IRIS = { center: 468, ring: [469, 470, 471, 472] };
export const NOSE_TIP = 1;
export const CHEEK_RIGHT = 234; // image-left side for a front-facing selfie
export const CHEEK_LEFT = 454;
export const CHIN = 152;
export const FOREHEAD = 10;

export type Pt = { x: number; y: number };

export function polygon(landmarks: Pt[], idx: number[]): Pt[] {
  return idx.map((i) => landmarks[i]);
}

/** Rasterize a polygon into a mask (even-odd scanline fill). */
export function fillPolygon(mask: Uint8Array, w: number, h: number, poly: Pt[], value = 1) {
  if (poly.length < 3) return;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const p of poly) {
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }
  const y0 = Math.max(0, Math.floor(minY));
  const y1 = Math.min(h - 1, Math.ceil(maxY));
  const xs: number[] = [];
  for (let y = y0; y <= y1; y++) {
    const cy = y + 0.5;
    xs.length = 0;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const a = poly[i];
      const b = poly[j];
      if (a.y > cy !== b.y > cy) xs.push(a.x + ((cy - a.y) / (b.y - a.y)) * (b.x - a.x));
    }
    xs.sort((p, q) => p - q);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const xa = Math.max(0, Math.ceil(xs[k] - 0.5));
      const xb = Math.min(w - 1, Math.floor(xs[k + 1] - 0.5));
      for (let x = xa; x <= xb; x++) mask[y * w + x] = value;
    }
  }
}

/** Scale a polygon around its centroid (used to give eyes/lips a safety margin). */
export function inflate(poly: Pt[], factor: number): Pt[] {
  const cx = poly.reduce((s, p) => s + p.x, 0) / poly.length;
  const cy = poly.reduce((s, p) => s + p.y, 0) / poly.length;
  return poly.map((p) => ({ x: cx + (p.x - cx) * factor, y: cy + (p.y - cy) * factor }));
}

export function dist(a: Pt, b: Pt) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
