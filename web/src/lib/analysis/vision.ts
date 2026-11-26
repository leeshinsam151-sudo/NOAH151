"use client";

import type { FaceLandmarker, ImageSegmenter } from "@mediapipe/tasks-vision";

let config = {
  base: "/mediapipe",
  /** Optional: segmenter model split into parts (hosts with a per-file size limit). */
  segmenterParts: null as string[] | null,
  /** Optional: face landmarker model URL (defaults to `${base}/face_landmarker.task`). */
  faceModel: null as string | null,
};

/** Override where the MediaPipe runtime and models are served from (call before loadVision). */
export function configureVision(c: Partial<typeof config>) {
  config = { ...config, ...c };
}

async function fetchParts(parts: string[]) {
  const bufs = await Promise.all(parts.map(async (u) => new Uint8Array(await (await fetch(u)).arrayBuffer())));
  const out = new Uint8Array(bufs.reduce((n, b) => n + b.length, 0));
  let o = 0;
  for (const b of bufs) {
    out.set(b, o);
    o += b.length;
  }
  return out;
}

let loading: Promise<{ landmarker: FaceLandmarker; segmenter: ImageSegmenter }> | null = null;

async function create(delegate: "GPU" | "CPU") {
  const { FaceLandmarker, FilesetResolver, ImageSegmenter } = await import("@mediapipe/tasks-vision");
  const BASE = config.base;
  const fileset = await FilesetResolver.forVisionTasks(`${BASE}/wasm`);
  const segmenterModel = config.segmenterParts
    ? { modelAssetBuffer: await fetchParts(config.segmenterParts) }
    : { modelAssetPath: `${BASE}/selfie_multiclass_256x256.tflite` };
  const [landmarker, segmenter] = await Promise.all([
    FaceLandmarker.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: config.faceModel ?? `${BASE}/face_landmarker.task`, delegate },
      runningMode: "IMAGE",
      numFaces: 4,
    }),
    ImageSegmenter.createFromOptions(fileset, {
      baseOptions: { ...segmenterModel, delegate },
      runningMode: "IMAGE",
      outputCategoryMask: true,
      outputConfidenceMasks: false,
    }),
  ]);
  return { landmarker, segmenter };
}

/** Loads (once) the MediaPipe face landmarker and selfie segmenter, preferring the GPU. */
export function loadVision() {
  if (!loading) {
    loading = create("GPU").catch(() => create("CPU"));
    loading.catch(() => {
      loading = null;
    });
  }
  return loading;
}

/** Runs the segmenter and returns a category mask resampled to the canvas size. */
export function segmentCategories(segmenter: ImageSegmenter, canvas: HTMLCanvasElement): Uint8Array | null {
  const result = segmenter.segment(canvas);
  try {
    const mask = result.categoryMask;
    if (!mask) return null;
    const src = mask.getAsUint8Array();
    const { width: mw, height: mh } = mask;
    const { width: w, height: h } = canvas;
    if (mw === w && mh === h) return src.slice();
    const out = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) {
      const sy = Math.min(mh - 1, Math.floor(((y + 0.5) * mh) / h));
      for (let x = 0; x < w; x++) {
        const sx = Math.min(mw - 1, Math.floor(((x + 0.5) * mw) / w));
        out[y * w + x] = src[sy * mw + sx];
      }
    }
    return out;
  } finally {
    result.close();
  }
}
