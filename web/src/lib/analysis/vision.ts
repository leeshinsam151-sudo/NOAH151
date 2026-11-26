"use client";

import type { FaceLandmarker, ImageSegmenter } from "@mediapipe/tasks-vision";

const BASE = "/mediapipe";

let loading: Promise<{ landmarker: FaceLandmarker; segmenter: ImageSegmenter }> | null = null;

async function create(delegate: "GPU" | "CPU") {
  const { FaceLandmarker, FilesetResolver, ImageSegmenter } = await import("@mediapipe/tasks-vision");
  const fileset = await FilesetResolver.forVisionTasks(`${BASE}/wasm`);
  const [landmarker, segmenter] = await Promise.all([
    FaceLandmarker.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: `${BASE}/face_landmarker.task`, delegate },
      runningMode: "IMAGE",
      numFaces: 4,
    }),
    ImageSegmenter.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: `${BASE}/selfie_multiclass_256x256.tflite`, delegate },
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
