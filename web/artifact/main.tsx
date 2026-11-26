// Standalone entry used to publish a preview build (claude.ai artifact / any static host)
// where assets live next to the page and single files are capped at 15MB.
import { createRoot } from "react-dom/client";
import PersonalColorApp from "@/components/PersonalColorApp";
import { configureVision } from "@/lib/analysis/vision";
import { configureContributions } from "@/lib/contribute/store";

configureVision({
  base: "./mediapipe",
  // Model binaries are published with a .wasm name only because the host serves a fixed set of
  // extensions; they are fetched as raw bytes, never instantiated as WebAssembly.
  faceModel: "./mediapipe/face_landmarker.model.wasm",
  segmenterParts: ["./mediapipe/segmenter.part1.model.wasm", "./mediapipe/segmenter.part2.model.wasm"],
});

// Contributions go to the artifact's own database (owner exports them from #admin).
configureContributions("artifact-db");

createRoot(document.getElementById("root")!).render(<PersonalColorApp />);
