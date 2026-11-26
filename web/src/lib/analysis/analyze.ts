"use client";

import { MODEL, predict, Prediction, zScore } from "./classifier";
import { estimateWhiteBalance, FaceMeasurement, measureFace } from "./features";
import { assessQuality, MIN_HAIR_PIXELS, QualityReport } from "./quality";
import type { Pt } from "./regions";
import { loadVision, segmentCategories } from "./vision";

const MAX_SIDE = 1280;
/** Face width (px) of the crop used for color features — close to the training images' scale. */
const ANALYSIS_FACE_WIDTH = 140;
/** Face width (px) of the crop shown to the user / used for draping. */
const DISPLAY_FACE_WIDTH = 220;

export interface Axes {
  warmth: number; // + warm, - cool
  value: number; // + light, - deep
  chroma: number; // + clear, - muted
  contrast: number; // + high contrast
}

export interface Crop {
  dataUrl: string;
  width: number;
  height: number;
  category: Uint8Array | null;
  landmarks: Pt[];
}

export interface AnalysisResult {
  quality: QualityReport;
  prediction: Prediction | null;
  measurement: FaceMeasurement | null;
  axes: Axes | null;
  confidence: number;
  display: Crop | null;
}

async function loadImage(file: Blob): Promise<HTMLCanvasElement> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const s = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * s);
  canvas.height = Math.round(bitmap.height * s);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas;
}

function cropFace(src: HTMLCanvasElement, lm: Pt[], faceWidth: number) {
  const xs = lm.map((p) => p.x);
  const ys = lm.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const w = maxX - minX;
  const h = maxY - minY;
  const x0 = Math.max(0, minX - 0.6 * w);
  const x1 = Math.min(src.width, maxX + 0.6 * w);
  const y0 = Math.max(0, minY - 0.7 * h);
  const y1 = Math.min(src.height, maxY + 0.45 * h);
  const s = Math.min(2, faceWidth / w);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round((x1 - x0) * s));
  canvas.height = Math.max(1, Math.round((y1 - y0) * s));
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(src, x0, y0, x1 - x0, y1 - y0, 0, 0, canvas.width, canvas.height);
  const landmarks = lm.map((p) => ({ x: (p.x - x0) * s, y: (p.y - y0) * s }));
  return { canvas, ctx, landmarks };
}

function computeAxes(m: FaceMeasurement): Axes {
  const f = m.features;
  const hue = (Math.atan2(f.b_mean_skin, f.a_mean_skin) * 180) / Math.PI;
  const contrast = f.L_mean_skin - (Number.isFinite(f.L_mean_hair) ? f.L_mean_hair : 37);
  const clamp = (v: number) => Math.max(-2.5, Math.min(2.5, v));
  return {
    // Dataset statistics: skin hue 50.7±11.1°, skin–hair ΔL 30.2±14.4 (Deep Armocromia features).
    warmth: clamp((hue - 50.7) / 11.1),
    value: clamp(0.6 * zScore("L_mean_skin", f.L_mean_skin) + 0.4 * zScore("L_mean_hair", f.L_mean_hair)),
    chroma: clamp(0.6 * zScore("Chroma_mean_skin", f.Chroma_mean_skin) + 0.4 * zScore("Chroma_mean_eye", f.Chroma_mean_eye)),
    contrast: clamp((contrast - 30.2) / 14.4),
  };
}

export async function analyzePhoto(file: Blob, onStep?: (step: string) => void): Promise<AnalysisResult> {
  onStep?.("모델 불러오는 중");
  const { landmarker, segmenter } = await loadVision();
  onStep?.("얼굴 찾는 중");
  const image = await loadImage(file);
  const det = landmarker.detect(image);
  const faces = det.faceLandmarks ?? [];
  const empty: AnalysisResult = {
    quality: assessQuality({ faceCount: 0 }),
    prediction: null,
    measurement: null,
    axes: null,
    confidence: 0,
    display: null,
  };
  if (!faces.length) return empty;

  const toPx = (f: { x: number; y: number }[]) => f.map((p) => ({ x: p.x * image.width, y: p.y * image.height }));
  const widthOf = (lm: Pt[]) => Math.max(...lm.map((p) => p.x)) - Math.min(...lm.map((p) => p.x));
  const all = faces.map(toPx);
  const lm = all.reduce((a, b) => (widthOf(b) > widthOf(a) ? b : a));

  onStep?.("피부·머리·눈 영역 나누는 중");
  const a = cropFace(image, lm, ANALYSIS_FACE_WIDTH);
  const aCat = segmentCategories(segmenter, a.canvas);
  const aData = a.ctx.getImageData(0, 0, a.canvas.width, a.canvas.height);

  onStep?.("조명 색 확인하는 중");
  // White balance from the eye whites at full resolution (the small analysis crop blurs them).
  const full = cropFace(image, lm, widthOf(lm));
  const wb = estimateWhiteBalance({
    rgba: full.ctx.getImageData(0, 0, full.canvas.width, full.canvas.height).data,
    width: full.canvas.width,
    height: full.canvas.height,
    category: null,
    landmarks: full.landmarks,
  });

  onStep?.("색 측정하는 중");
  const measurement = measureFace(
    { rgba: aData.data, width: a.canvas.width, height: a.canvas.height, category: aCat, landmarks: a.landmarks },
    { whiteBalance: wb },
  );
  if (measurement.pixels.hair < MIN_HAIR_PIXELS) {
    for (const k of Object.keys(measurement.features)) if (k.endsWith("_hair")) measurement.features[k] = NaN;
  }

  const quality = assessQuality({ faceCount: faces.length, faceWidthPx: widthOf(lm), landmarks: lm, measurement });

  const d = cropFace(image, lm, DISPLAY_FACE_WIDTH);
  const display: Crop = {
    dataUrl: d.canvas.toDataURL("image/jpeg", 0.9),
    width: d.canvas.width,
    height: d.canvas.height,
    category: segmentCategories(segmenter, d.canvas),
    landmarks: d.landmarks,
  };

  if (!quality.canAnalyze) return { ...empty, quality, measurement, display };

  onStep?.("퍼스널 컬러 계산 중");
  const prediction = predict(measurement.features);
  const confidence = prediction.seasons[0].p * quality.score;
  return { quality, prediction, measurement, axes: computeAxes(measurement), confidence, display };
}

export const MODEL_METRICS = MODEL.testMetrics;
