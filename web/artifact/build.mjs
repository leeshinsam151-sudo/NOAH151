// Builds a self-contained static preview into artifact/dist:
//   index.html (page), app.js, mediapipe/{wasm/*, face_landmarker.model.wasm, segmenter.part{1,2}.model.wasm}
import { build } from "vite";
import { copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const web = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(web, "artifact", "dist");
rmSync(out, { recursive: true, force: true });

await build({
  configFile: false,
  root: web,
  logLevel: "warn",
  resolve: { alias: { "@": join(web, "src") } },
  define: { "process.env.NODE_ENV": '"production"' },
  oxc: { jsx: { runtime: "automatic" } },
  build: {
    outDir: out,
    emptyOutDir: false,
    copyPublicDir: false,
    lib: { entry: join(web, "artifact", "main.tsx"), formats: ["iife"], name: "TonePick", fileName: () => "app.js" },
  },
});

const mp = join(web, "public", "mediapipe");
mkdirSync(join(out, "mediapipe", "wasm"), { recursive: true });
for (const f of ["vision_wasm_internal.js", "vision_wasm_internal.wasm"]) {
  copyFileSync(join(mp, "wasm", f), join(out, "mediapipe", "wasm", f));
}
copyFileSync(join(mp, "face_landmarker.task"), join(out, "mediapipe", "face_landmarker.model.wasm"));
const seg = readFileSync(join(mp, "selfie_multiclass_256x256.tflite"));
const half = Math.ceil(seg.length / 2);
writeFileSync(join(out, "mediapipe", "segmenter.part1.model.wasm"), seg.subarray(0, half));
writeFileSync(join(out, "mediapipe", "segmenter.part2.model.wasm"), seg.subarray(half));

const css = readFileSync(join(web, "src", "app", "globals.css"), "utf8");
writeFileSync(
  join(out, "index.html"),
  `<title>톤픽 퍼스널 컬러</title>
<style>
${css}
</style>
<div id="root"></div>
<script src="app.js"></script>
`,
);
console.log("built", out);
