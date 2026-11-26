// sRGB (8-bit) -> CIELAB (D65), matching skimage.color.rgb2lab which produced the training features.

const LUT = new Float64Array(256);
for (let i = 0; i < 256; i++) {
  const c = i / 255;
  LUT[i] = c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

const XN = 0.95047;
const YN = 1.0;
const ZN = 1.08883;

function f(t: number) {
  return t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116;
}

export type Lab = [number, number, number];

export function linearToLab(r: number, g: number, b: number): Lab {
  const x = (0.412453 * r + 0.35758 * g + 0.180423 * b) / XN;
  const y = (0.212671 * r + 0.71516 * g + 0.072169 * b) / YN;
  const z = (0.019334 * r + 0.119193 * g + 0.950227 * b) / ZN;
  const fx = f(x);
  const fy = f(y);
  const fz = f(z);
  const L = y > 0.008856 ? 116 * fy - 16 : 903.3 * y;
  return [L, 500 * (fx - fy), 200 * (fy - fz)];
}

export function srgbToLinear(v: number): number {
  return LUT[Math.max(0, Math.min(255, Math.round(v)))];
}

export function rgbToLab(r: number, g: number, b: number): Lab {
  return linearToLab(LUT[r], LUT[g], LUT[b]);
}

/** Individual Typology Angle in degrees (numpy semantics: b=0 -> ±90). */
export function ita(L: number, b: number): number {
  return (Math.atan((L - 50) / b) * 180) / Math.PI;
}

export function labToHex([L, a, b]: Lab): string {
  const fy = (L + 16) / 116;
  const fx = fy + a / 500;
  const fz = fy - b / 200;
  const inv = (t: number) => (t ** 3 > 0.008856 ? t ** 3 : (t - 16 / 116) / 7.787);
  const x = inv(fx) * XN;
  const y = inv(fy) * YN;
  const z = inv(fz) * ZN;
  const lin = [
    3.240479 * x - 1.53715 * y - 0.498535 * z,
    -0.969256 * x + 1.875992 * y + 0.041556 * z,
    0.055648 * x - 0.204043 * y + 1.057311 * z,
  ];
  return (
    "#" +
    lin
      .map((c) => {
        const s = c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
        return Math.round(Math.max(0, Math.min(1, s)) * 255)
          .toString(16)
          .padStart(2, "0");
      })
      .join("")
  );
}

/** Running mean / population std (ddof=0, numpy default). */
export class Stat {
  n = 0;
  private sum = 0;
  private sq = 0;
  push(v: number) {
    if (!Number.isFinite(v)) return;
    this.n++;
    this.sum += v;
    this.sq += v * v;
  }
  get mean() {
    return this.n ? this.sum / this.n : NaN;
  }
  get std() {
    if (!this.n) return NaN;
    const m = this.mean;
    return Math.sqrt(Math.max(0, this.sq / this.n - m * m));
  }
}

export interface RegionStats {
  L: Stat;
  a: Stat;
  b: Stat;
  ITA: Stat;
  Chroma: Stat;
}

export function newRegionStats(): RegionStats {
  return { L: new Stat(), a: new Stat(), b: new Stat(), ITA: new Stat(), Chroma: new Stat() };
}

export function pushLab(s: RegionStats, [L, a, b]: Lab) {
  s.L.push(L);
  s.a.push(a);
  s.b.push(b);
  s.ITA.push(ita(L, b));
  s.Chroma.push(Math.hypot(a, b));
}
