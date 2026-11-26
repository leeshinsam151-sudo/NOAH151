"use client";

import { useEffect, useRef, useState } from "react";
import type { Crop } from "@/lib/analysis/analyze";
import { CAT } from "@/lib/analysis/features";

/** Paints the background and clothes with a drape color so the face can be judged against it. */
function DrapeCanvas({ crop, color, label }: { crop: Crop; color: string; label: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const i = new Image();
    i.onload = () => setImg(i);
    i.src = crop.dataUrl;
  }, [crop.dataUrl]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !img) return;
    const { width: w, height: h, category } = crop;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0, w, h);
    if (!category) return;

    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    const layer = new ImageData(w, h);
    for (let i = 0; i < category.length; i++) {
      const c = category[i];
      if (c === CAT.background || c === CAT.clothes || c === CAT.other) {
        layer.data[i * 4] = r;
        layer.data[i * 4 + 1] = g;
        layer.data[i * 4 + 2] = b;
        layer.data[i * 4 + 3] = 255;
      }
    }
    const off = document.createElement("canvas");
    off.width = w;
    off.height = h;
    off.getContext("2d")!.putImageData(layer, 0, 0);
    ctx.save();
    ctx.filter = "blur(1.5px)";
    ctx.drawImage(off, 0, 0);
    ctx.restore();
  }, [img, crop, color]);

  return <canvas ref={ref} role="img" aria-label={label} />;
}

export default function Draping({ crop, best, worst }: { crop: Crop; best: string[]; worst: string[] }) {
  const [mode, setMode] = useState<"single" | "compare">("compare");
  const [color, setColor] = useState(best[0]);
  const [bi, setBi] = useState(0);
  const [wi, setWi] = useState(0);

  return (
    <section className="card drape">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <h2 style={{ margin: 0 }}>가상 드레이핑</h2>
        <div className="seg">
          <button aria-pressed={mode === "compare"} onClick={() => setMode("compare")}>
            비교
          </button>
          <button aria-pressed={mode === "single"} onClick={() => setMode("single")}>
            자유 체험
          </button>
        </div>
      </div>
      <p className="note" style={{ margin: 0 }}>
        얼굴 주변을 색 천으로 감싼 것처럼 보여드려요. 피부가 맑아 보이고 그림자·잡티가 덜 보이는 쪽이 어울리는 색이에요.
      </p>

      {mode === "compare" ? (
        <>
          <div className="drape-compare">
            <figure>
              <DrapeCanvas crop={crop} color={best[bi]} label="베스트 컬러 드레이핑" />
              <figcaption>👍 베스트</figcaption>
            </figure>
            <figure>
              <DrapeCanvas crop={crop} color={worst[wi]} label="워스트 컬러 드레이핑" />
              <figcaption>👎 워스트</figcaption>
            </figure>
          </div>
          <button
            className="btn btn-secondary"
            onClick={() => {
              setBi((i) => (i + 1) % best.length);
              setWi((i) => (i + 1) % worst.length);
            }}
          >
            다른 색으로 비교하기
          </button>
        </>
      ) : (
        <>
          <DrapeCanvas crop={crop} color={color} label="선택한 색 드레이핑" />
          <div className="palette">
            {[...best.slice(0, 6), ...worst.slice(0, 6)].map((c) => (
              <button
                key={c}
                style={{ background: c }}
                aria-label={`${c} 색 입혀보기`}
                aria-pressed={color === c}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
          <p className="note" style={{ margin: 0 }}>
            윗줄은 베스트, 아랫줄은 워스트 컬러예요.
          </p>
        </>
      )}
    </section>
  );
}
