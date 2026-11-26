// Training-data contribution: what we collect (with consent) to retrain the model on Korean selfies.
// No photo is ever included — only the 30 color statistics the model already uses, the expert
// diagnosis the person enters, and photo-condition answers. Shared by client and server.

import type { Season, ToneId } from "../analysis/classifier";
import { MODEL } from "../analysis/classifier";

export const SCHEMA_VERSION = 1;
export const CONSENT_VERSION = "2026-11-v1";

export const SEASON_IDS: Season[] = ["Spring", "Summer", "Autumn", "Winter"];
export const TONE_IDS = MODEL.tones as ToneId[];
export const FEATURE_NAMES = MODEL.featureNames;

/** Tone names as Korean consultants commonly write them, mapped to the model's 12 tones. */
export const KOREAN_TONE_OPTIONS: { label: string; tone: ToneId }[] = [
  { label: "봄 라이트", tone: "Spring_Light" },
  { label: "봄 트루 (봄 웜)", tone: "Spring_Warm" },
  { label: "봄 브라이트", tone: "Spring_Bright" },
  { label: "여름 라이트", tone: "Summer_Light" },
  { label: "여름 트루 (여름 쿨)", tone: "Summer_Cool" },
  { label: "여름 뮤트 (여름 소프트)", tone: "Summer_Soft" },
  { label: "가을 뮤트 (가을 소프트)", tone: "Autumn_Soft" },
  { label: "가을 트루 (가을 웜)", tone: "Autumn_Warm" },
  { label: "가을 딥", tone: "Autumn_Deep" },
  { label: "겨울 딥", tone: "Winter_Deep" },
  { label: "겨울 트루 (겨울 쿨)", tone: "Winter_Cool" },
  { label: "겨울 브라이트", tone: "Winter_Bright" },
];

export type Source = "user" | "consultant";
export type LabelConfidence = "sure" | "unsure";
export type Makeup = "none" | "base" | "full";
export type Lighting = "daylight" | "indoor" | "mixed" | "unknown";

export interface Contribution {
  schema: number;
  /** Random client-generated id (also the document id). */
  id: string;
  createdAt: string; // ISO 8601
  source: Source;
  label: {
    season: Season;
    /** null when the diagnosis named only a season or a tone outside the 12. */
    tone: ToneId | null;
    /** What the diagnosis said, as written (e.g. a 16-type name). Max 40 chars. */
    rawName: string | null;
    confidence: LabelConfidence;
    /** Free-form shop/consultant code entered in consultant mode. Max 40 chars. */
    consultantCode: string | null;
    /** YYYY-MM of the professional diagnosis, if known. */
    diagnosedAt: string | null;
  };
  conditions: {
    hairDyed: boolean | null;
    makeup: Makeup | null;
    lighting: Lighting;
  };
  /** The model's 30 inputs, rounded; null for a feature that could not be measured. */
  features: Record<string, number | null>;
  measurement: {
    wbApplied: boolean;
    wbGains: [number, number, number];
    wbCast: number;
    qualityScore: number;
    issues: string[];
    pixels: { skin: number; hair: number; eye: number };
  };
  /** What the AI said, to measure how often it agrees with experts. */
  ai: {
    modelSource: string;
    tones: { id: ToneId; p: number }[]; // top 3
  };
  consent: { version: string; agreedAt: string };
}

const round = (v: number, d = 3) => Math.round(v * 10 ** d) / 10 ** d;

export function randomId(): string {
  const b = new Uint8Array(16);
  crypto.getRandomValues(b);
  return Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
}

export interface BuildArgs {
  source: Source;
  season: Season;
  tone: ToneId | null;
  rawName?: string | null;
  confidence: LabelConfidence;
  consultantCode?: string | null;
  diagnosedAt?: string | null;
  hairDyed: boolean | null;
  makeup: Makeup | null;
  lighting: Lighting;
  features: Record<string, number>;
  wb: { applied: boolean; gains: [number, number, number]; cast: number };
  quality: { score: number; issues: { code: string }[] };
  pixels: { skin: number; hair: number; eye: number };
  aiTones: { id: ToneId; p: number }[];
  now?: Date;
}

export function buildContribution(a: BuildArgs): Contribution {
  const now = (a.now ?? new Date()).toISOString();
  const features: Record<string, number | null> = {};
  for (const name of FEATURE_NAMES) {
    const v = a.features[name];
    features[name] = Number.isFinite(v) ? round(v) : null;
  }
  return {
    schema: SCHEMA_VERSION,
    id: randomId(),
    createdAt: now,
    source: a.source,
    label: {
      season: a.season,
      tone: a.tone,
      rawName: a.rawName?.trim().slice(0, 40) || null,
      confidence: a.confidence,
      consultantCode: a.consultantCode?.trim().slice(0, 40) || null,
      diagnosedAt: a.diagnosedAt || null,
    },
    conditions: { hairDyed: a.hairDyed, makeup: a.makeup, lighting: a.lighting },
    features,
    measurement: {
      wbApplied: a.wb.applied,
      wbGains: a.wb.gains.map((g) => round(g, 4)) as [number, number, number],
      wbCast: round(a.wb.cast, 2),
      qualityScore: round(a.quality.score, 3),
      issues: a.quality.issues.map((i) => i.code),
      pixels: a.pixels,
    },
    ai: {
      modelSource: MODEL.version ?? "unknown",
      tones: a.aiTones.slice(0, 3).map((t) => ({ id: t.id, p: round(t.p, 4) })),
    },
    consent: { version: CONSENT_VERSION, agreedAt: now },
  };
}

/** Strict validation for untrusted input (server side, and before export). Returns error or null. */
export function validateContribution(x: unknown): string | null {
  const o = x as Contribution;
  if (!o || typeof o !== "object" || Array.isArray(o)) return "not an object";
  const top = ["schema", "id", "createdAt", "source", "label", "conditions", "features", "measurement", "ai", "consent"];
  const keys0 = Object.keys(o);
  if (keys0.length !== top.length || !top.every((k) => keys0.includes(k))) return "keys";
  if (o.schema !== SCHEMA_VERSION) return "schema";
  if (typeof o.id !== "string" || !/^[0-9a-f]{32}$/.test(o.id)) return "id";
  if (typeof o.createdAt !== "string" || Number.isNaN(Date.parse(o.createdAt))) return "createdAt";
  if (o.source !== "user" && o.source !== "consultant") return "source";
  const l = o.label;
  if (!l || !SEASON_IDS.includes(l.season)) return "label.season";
  if (l.tone !== null && !TONE_IDS.includes(l.tone)) return "label.tone";
  if (l.tone !== null && !l.tone.startsWith(l.season)) return "label.tone/season mismatch";
  if (l.confidence !== "sure" && l.confidence !== "unsure") return "label.confidence";
  for (const k of ["rawName", "consultantCode"] as const) {
    if (l[k] !== null && (typeof l[k] !== "string" || l[k]!.length > 40)) return `label.${k}`;
  }
  if (l.diagnosedAt !== null && !(typeof l.diagnosedAt === "string" && /^\d{4}-\d{2}$/.test(l.diagnosedAt))) {
    return "label.diagnosedAt";
  }
  const c = o.conditions;
  if (!c || ![true, false, null].includes(c.hairDyed)) return "conditions.hairDyed";
  if (![null, "none", "base", "full"].includes(c.makeup)) return "conditions.makeup";
  if (!["daylight", "indoor", "mixed", "unknown"].includes(c.lighting)) return "conditions.lighting";
  if (!o.features || typeof o.features !== "object") return "features";
  const keys = Object.keys(o.features);
  if (keys.length !== FEATURE_NAMES.length || !FEATURE_NAMES.every((n) => n in o.features)) return "features.keys";
  for (const n of FEATURE_NAMES) {
    const v = o.features[n];
    if (v !== null && !(typeof v === "number" && Number.isFinite(v) && Math.abs(v) < 1000)) return `features.${n}`;
  }
  if (o.features.L_mean_skin === null) return "features.L_mean_skin missing";
  const m = o.measurement;
  if (!m || typeof m.wbApplied !== "boolean" || !Array.isArray(m.wbGains) || m.wbGains.length !== 3) return "measurement";
  if (!m.wbGains.every((g) => typeof g === "number" && g > 0.5 && g < 2)) return "measurement.wbGains";
  if (typeof m.qualityScore !== "number" || m.qualityScore < 0 || m.qualityScore > 1) return "measurement.qualityScore";
  if (!Array.isArray(m.issues) || m.issues.length > 20 || !m.issues.every((s) => typeof s === "string" && s.length < 32)) {
    return "measurement.issues";
  }
  if (!m.pixels || !["skin", "hair", "eye"].every((k) => Number.isInteger(m.pixels[k as "skin"]))) return "measurement.pixels";
  if (!o.ai || !Array.isArray(o.ai.tones) || o.ai.tones.length > 3) return "ai";
  if (!o.ai.tones.every((t) => TONE_IDS.includes(t.id) && typeof t.p === "number")) return "ai.tones";
  if (!o.consent || o.consent.version !== CONSENT_VERSION) return "consent";
  if (JSON.stringify(o).length > 8000) return "too large";
  return null;
}
