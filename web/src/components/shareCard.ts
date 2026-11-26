import type { SeasonInfo, ToneInfo } from "@/lib/tones";

const FONT = `-apple-system, "Apple SD Gothic Neo", "Pretendard", "Noto Sans KR", "Malgun Gothic", sans-serif`;

/** Draws a 1080×1920 story-format result card (no photo, so it is safe to post). */
export function drawResultCard(tone: ToneInfo, season: SeasonInfo): HTMLCanvasElement {
  const W = 1080;
  const H = 1920;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#fbf8f5";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = season.accent;
  ctx.fillRect(0, 0, W, 24);

  ctx.textAlign = "center";
  ctx.fillStyle = "#6f6870";
  ctx.font = `600 44px ${FONT}`;
  ctx.fillText("나의 퍼스널 컬러는", W / 2, 260);
  ctx.fillStyle = "#221f24";
  ctx.font = `800 150px ${FONT}`;
  ctx.fillText(tone.ko, W / 2, 450);
  ctx.fillStyle = "#6f6870";
  ctx.font = `500 48px ${FONT}`;
  ctx.fillText(`${season.emoji} ${season.ko} · ${tone.en}`, W / 2, 540);
  ctx.font = `600 42px ${FONT}`;
  ctx.fillStyle = season.accent;
  ctx.fillText(tone.keywords.map((k) => `#${k}`).join("  "), W / 2, 630);

  const cols = 4;
  const size = 200;
  const gap = 28;
  const x0 = (W - (cols * size + (cols - 1) * gap)) / 2;
  tone.best.slice(0, 12).forEach((hex, i) => {
    const x = x0 + (i % cols) * (size + gap);
    const y = 740 + Math.floor(i / cols) * (size + gap);
    ctx.fillStyle = hex;
    ctx.beginPath();
    ctx.roundRect(x, y, size, size, 36);
    ctx.fill();
  });

  ctx.fillStyle = "#221f24";
  ctx.font = `700 46px ${FONT}`;
  ctx.fillText(`립 ${tone.lip[0]}  ·  헤어 ${tone.hair[0]}`, W / 2, 1530);
  ctx.fillText(`액세서리 ${tone.metal}`, W / 2, 1610);
  ctx.fillStyle = "#a69fa8";
  ctx.font = `500 38px ${FONT}`;
  ctx.fillText("톤픽 · AI 퍼스널 컬러 진단", W / 2, 1800);
  return c;
}

export async function shareResultCard(tone: ToneInfo, season: SeasonInfo) {
  const canvas = drawResultCard(tone, season);
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/png"));
  if (!blob) return;
  const file = new File([blob], `personal-color-${tone.en.replace(/\s+/g, "-").toLowerCase()}.png`, { type: "image/png" });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: `나의 퍼스널 컬러: ${tone.ko}` });
      return;
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
    }
  }
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
