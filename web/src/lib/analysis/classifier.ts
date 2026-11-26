import model from "./model.json";

export type ToneId =
  | "Spring_Light" | "Spring_Warm" | "Spring_Bright"
  | "Summer_Light" | "Summer_Cool" | "Summer_Soft"
  | "Autumn_Soft" | "Autumn_Warm" | "Autumn_Deep"
  | "Winter_Deep" | "Winter_Cool" | "Winter_Bright";

export type Season = "Spring" | "Summer" | "Autumn" | "Winter";

export interface Layer {
  W: number[][];
  b: number[];
  act: string;
}

export interface Model {
  version?: string;
  /** Korean summary of the training data, shown on the result page. */
  dataDescription?: string;
  featureNames: string[];
  fill: number[];
  mean: number[];
  scale: number[];
  tones: string[];
  layers: Layer[];
  testMetrics: Record<string, number>;
}

export const MODEL = model as Model;

export type Features = Record<string, number>;

export interface Prediction {
  tones: { id: ToneId; p: number }[]; // sorted desc
  seasons: { id: Season; p: number }[]; // sorted desc
  imputed: string[]; // feature names that were missing and filled with dataset means
}

function softmax(z: number[]) {
  const m = Math.max(...z);
  const e = z.map((v) => Math.exp(v - m));
  const s = e.reduce((a, b) => a + b, 0);
  return e.map((v) => v / s);
}

export function standardize(features: Features, m: Model = MODEL) {
  const imputed: string[] = [];
  const x = m.featureNames.map((name, i) => {
    let v = features[name];
    if (!Number.isFinite(v)) {
      v = m.fill[i];
      imputed.push(name);
    }
    return (v - m.mean[i]) / m.scale[i];
  });
  return { x, imputed };
}

export function forward(x: number[], layers: Layer[]): number[] {
  let h = x;
  for (const { W, b, act } of layers) {
    const out = b.slice();
    for (let i = 0; i < h.length; i++) {
      const hi = h[i];
      const row = W[i];
      for (let j = 0; j < out.length; j++) out[j] += hi * row[j];
    }
    h = act === "relu" ? out.map((v) => Math.max(0, v)) : act === "softmax" ? softmax(out) : out;
  }
  return h;
}

export function predict(features: Features, m: Model = MODEL): Prediction {
  const { x, imputed } = standardize(features, m);
  const p = forward(x, m.layers);
  const tones = m.tones
    .map((id, i) => ({ id: id as ToneId, p: p[i] }))
    .sort((a, b) => b.p - a.p);
  const seasonP: Record<Season, number> = { Spring: 0, Summer: 0, Autumn: 0, Winter: 0 };
  for (const t of tones) seasonP[t.id.split("_")[0] as Season] += t.p;
  const seasons = (Object.keys(seasonP) as Season[])
    .map((id) => ({ id, p: seasonP[id] }))
    .sort((a, b) => b.p - a.p);
  return { tones, seasons, imputed };
}

/** z-score of a single feature relative to the training data (for explanatory axes). */
export function zScore(name: string, value: number, m: Model = MODEL): number {
  const i = m.featureNames.indexOf(name);
  if (i < 0 || !Number.isFinite(value)) return 0;
  return (value - m.mean[i]) / m.scale[i];
}
