import type { FaceMeasurement } from "./features";
import { CHEEK_LEFT, CHEEK_RIGHT, LEFT_EYE, NOSE_TIP, Pt, RIGHT_EYE } from "./regions";

export type IssueLevel = "error" | "warn";

export interface QualityIssue {
  code: string;
  level: IssueLevel;
  message: string;
}

export interface QualityReport {
  issues: QualityIssue[];
  /** 1 = ideal photo, lower = less trustworthy colors. */
  score: number;
  canAnalyze: boolean;
}

export const MIN_HAIR_PIXELS = 150;
export const MIN_SKIN_PIXELS = 400;

function centroid(lm: Pt[], idx: number[]): Pt {
  return {
    x: idx.reduce((s, i) => s + lm[i].x, 0) / idx.length,
    y: idx.reduce((s, i) => s + lm[i].y, 0) / idx.length,
  };
}

export function facePose(lm: Pt[]) {
  const l = lm[CHEEK_RIGHT];
  const r = lm[CHEEK_LEFT];
  const width = Math.hypot(r.x - l.x, r.y - l.y);
  const midX = (l.x + r.x) / 2;
  const yaw = (lm[NOSE_TIP].x - midX) / width; // ~0 when frontal
  const le = centroid(lm, LEFT_EYE);
  const re = centroid(lm, RIGHT_EYE);
  const roll = (Math.atan2(le.y - re.y, le.x - re.x) * 180) / Math.PI;
  return { width, yaw, roll };
}

export function assessQuality(args: {
  faceCount: number;
  /** Face width in pixels in the original upload. */
  faceWidthPx?: number;
  landmarks?: Pt[];
  measurement?: FaceMeasurement;
}): QualityReport {
  const issues: QualityIssue[] = [];
  const add = (code: string, level: IssueLevel, message: string) => issues.push({ code, level, message });

  if (args.faceCount === 0) {
    add("no_face", "error", "얼굴을 찾지 못했어요. 얼굴 전체가 정면으로 잘 보이는 사진을 올려주세요.");
    return { issues, score: 0, canAnalyze: false };
  }
  if (args.faceCount > 1) {
    add("multi_face", "warn", "여러 얼굴이 보여요. 가장 큰 얼굴로 진단했어요. 혼자 찍은 사진이 가장 정확해요.");
  }
  if (args.faceWidthPx !== undefined && args.faceWidthPx < 120) {
    add("low_res", args.faceWidthPx < 60 ? "error" : "warn", "얼굴이 너무 작게 찍혔어요. 얼굴이 화면을 크게 채우도록 가까이서 찍어주세요.");
  }
  if (args.landmarks) {
    const { yaw, roll } = facePose(args.landmarks);
    if (Math.abs(yaw) > 0.12) add("yaw", "warn", "얼굴이 옆으로 돌아가 있어요. 카메라를 정면으로 바라봐 주세요.");
    if (Math.abs(roll) > 15) add("roll", "warn", "얼굴이 기울어져 있어요. 고개를 똑바로 해주세요.");
  }

  const m = args.measurement;
  if (m) {
    const L = m.features.L_mean_skin;
    // Exposure is judged from the brightest 5% of the frame (eye whites, teeth, background,
    // clothes), not from skin lightness — that would wrongly reject deep skin tones.
    const ref = m.diagnostics.brightL;
    const tooDark = ref < 35;
    const dark = ref < 50;
    if (m.pixels.skin < MIN_SKIN_PIXELS || !Number.isFinite(L)) {
      add("no_skin", "error", "피부 영역이 충분히 보이지 않아요. 앞머리·손·마스크가 얼굴을 가리지 않게 해주세요.");
    } else if (tooDark) {
      add("too_dark", "error", "사진이 너무 어두워요. 창가처럼 밝은 자연광에서 다시 찍어주세요.");
    } else if (dark) {
      add("dark", "warn", "사진이 조금 어두워요. 더 밝은 곳에서 찍으면 정확해져요.");
    } else if (L > 88) {
      add("too_bright", "error", "빛이 너무 강해 피부색이 날아갔어요. 직사광선이나 플래시를 피해주세요.");
    }
    if (m.diagnostics.clipFraction > 0.08) {
      add("clipped", "warn", "피부 일부가 하얗게 번쩍여요. 정면 조명이나 플래시를 피해주세요.");
    }
    if (m.diagnostics.sideDiffL > 14) {
      add("side_light", "warn", "얼굴 한쪽에만 빛이 들어와요. 빛을 정면으로 마주하고 찍어주세요.");
    }
    if (m.wb.applied && m.wb.cast > 15) {
      add("color_cast", "warn", "조명 색이 한쪽으로 치우쳐 있어요(노란/푸른 조명). 보정했지만 자연광에서 찍는 게 가장 정확해요.");
    } else if (!m.wb.applied) {
      add("no_wb", "warn", "눈 흰자가 잘 보이지 않아 조명 색 보정을 하지 못했어요. 눈을 자연스럽게 뜨고 찍으면 더 정확해요.");
    }
    if (m.pixels.hair < MIN_HAIR_PIXELS) {
      add("no_hair", "warn", "머리카락이 잘 보이지 않아요(모자·탈색 등). 머리색은 평균값으로 대신했어요.");
    }
  }

  const penalty: Record<string, number> = {
    multi_face: 0.05, low_res: 0.15, yaw: 0.1, roll: 0.05, dark: 0.15, clipped: 0.1,
    side_light: 0.15, color_cast: 0.15, no_wb: 0.1, no_hair: 0.15,
  };
  const canAnalyze = !issues.some((i) => i.level === "error");
  const score = canAnalyze
    ? Math.max(0.3, issues.reduce((s, i) => s * (1 - (penalty[i.code] ?? 0)), 1))
    : 0;
  return { issues, score, canAnalyze };
}
