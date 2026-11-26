"use client";

import { useEffect, useRef, useState } from "react";
import type { AnalysisResult } from "@/lib/analysis/analyze";
import ConsultantMode from "./ConsultantMode";
import MyContributions from "./MyContributions";
import OwnerPanel from "./OwnerPanel";
import Result from "./Result";

type Stage =
  | { kind: "intro" }
  | { kind: "analyzing"; preview: string; step: string }
  | { kind: "rejected"; preview: string; result: AnalysisResult | null; error?: string }
  | { kind: "result"; result: AnalysisResult };

const GUIDE = [
  { icon: "☀️", title: "자연광 아래에서", desc: "낮 시간 창가가 가장 좋아요. 형광등·노란 조명·플래시는 피해주세요." },
  { icon: "🙂", title: "정면을 바라보고", desc: "얼굴이 화면을 크게 채우게, 고개를 기울이지 말고 찍어주세요." },
  { icon: "🚫", title: "필터·보정 끄기", desc: "뷰티 모드, 필터, 보정 앱을 거치지 않은 원본 사진이 필요해요." },
  { icon: "💄", title: "맨얼굴 또는 기초만", desc: "파운데이션·컬러 렌즈는 피부·눈 색을 바꿔서 결과가 달라져요." },
  { icon: "💇", title: "머리카락이 보이게", desc: "앞머리가 눈을 가리지 않게, 모자는 벗고 찍어주세요." },
];

const HERO_STRIP = ["#FFB7A5", "#FFD966", "#B5E3A1", "#9FD8E8", "#B7A9C9", "#C4A4A7", "#CC5500", "#808000", "#0F52BA", "#C71585"];

type Mode = "diagnose" | "consultant" | "admin";
const modeFromHash = (): Mode =>
  typeof location === "undefined" ? "diagnose" : location.hash === "#consultant" ? "consultant" : location.hash === "#admin" ? "admin" : "diagnose";

export default function PersonalColorApp() {
  const [stage, setStage] = useState<Stage>({ kind: "intro" });
  const [mode, setMode] = useState<Mode>("diagnose");
  useEffect(() => {
    const sync = () => setMode(modeFromHash());
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);
  const cameraRef = useRef<HTMLInputElement>(null);
  const albumRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<string | null>(null);

  // Warm up the models while the user reads the guide.
  useEffect(() => {
    import("@/lib/analysis/vision").then((m) => m.loadVision()).catch(() => undefined);
  }, []);

  useEffect(() => () => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
  }, []);

  async function onFile(file: File | undefined) {
    if (!file) return;
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    const preview = URL.createObjectURL(file);
    previewRef.current = preview;
    setStage({ kind: "analyzing", preview, step: "준비 중" });
    window.scrollTo({ top: 0 });
    try {
      const { analyzePhoto } = await import("@/lib/analysis/analyze");
      const result = await analyzePhoto(file, (step) =>
        setStage((s) => (s.kind === "analyzing" ? { ...s, step } : s)),
      );
      if (!result.prediction) setStage({ kind: "rejected", preview, result });
      else setStage({ kind: "result", result });
    } catch (e) {
      console.error(e);
      setStage({
        kind: "rejected",
        preview,
        result: null,
        error: "사진을 분석하지 못했어요. 다른 사진으로 시도하거나 브라우저를 새로고침해 주세요.",
      });
    }
  }

  const reset = () => {
    setStage({ kind: "intro" });
    window.scrollTo({ top: 0 });
  };

  const pickers = (
    <>
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="user"
        hidden
        onChange={(e) => {
          onFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <input
        ref={albumRef}
        type="file"
        accept="image/*"
        hidden
        data-testid="album-input"
        onChange={(e) => {
          onFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <div className="btn-row">
        <button className="btn btn-primary" onClick={() => cameraRef.current?.click()}>
          📷 셀카 찍기
        </button>
        <button className="btn btn-secondary" onClick={() => albumRef.current?.click()}>
          🖼️ 앨범에서 사진 선택
        </button>
      </div>
    </>
  );

  return (
    <main className="app">
      <header className="brand">
        <a href="#" className="brand-link" onClick={() => setStage({ kind: "intro" })}>
          톤픽
        </a>
        <small>{mode === "consultant" ? "컨설턴트 모드" : mode === "admin" ? "관리자" : "AI 퍼스널 컬러 · 12톤"}</small>
      </header>

      {mode === "consultant" && <ConsultantMode />}
      {mode === "admin" && <OwnerPanel />}

      {mode === "diagnose" && stage.kind === "intro" && (
        <>
          <section className="card hero">
            <h1>셀카 한 장으로 찾는 나의 퍼스널 컬러</h1>
            <p>피부·머리카락·눈동자 색을 측정해 12가지 톤 중 가장 가까운 톤과 어울리는 색을 알려드려요.</p>
            <div className="swatch-strip" aria-hidden>
              {HERO_STRIP.map((c) => (
                <span key={c} style={{ background: c }} />
              ))}
            </div>
          </section>

          <section className="card">
            <h2>정확한 진단을 위한 촬영 가이드</h2>
            <ul className="checklist">
              {GUIDE.map((g) => (
                <li key={g.title}>
                  <span className="icon" aria-hidden>
                    {g.icon}
                  </span>
                  <div>
                    <b>{g.title}</b>
                    <span className="desc">{g.desc}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {pickers}
          <p className="privacy">
            🔒 사진은 서버로 전송되지 않고 이 기기 안에서만 분석돼요.
            <br />
            결과는 참고용 자가 진단이며 전문가 진단을 대체하지 않아요.
          </p>
          <MyContributions />
          <p className="privacy">
            퍼스널 컬러 컨설턴트이신가요? <a href="#consultant">컨설턴트 모드</a>로 고객 진단 결과를 기록해 AI 학습에 참여할 수
            있어요.
          </p>
        </>
      )}

      {mode === "diagnose" && stage.kind === "analyzing" && (
        <section className="card">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="preview" src={stage.preview} alt="업로드한 사진" />
          <div className="progress" role="status" aria-live="polite">
            <div className="spinner" />
            <div>
              <b>분석 중이에요</b>
              <div className="muted" style={{ fontSize: 14, marginTop: 4 }}>
                {stage.step}…
              </div>
            </div>
          </div>
        </section>
      )}

      {mode === "diagnose" && stage.kind === "rejected" && (
        <>
          <section className="card">
            <h2>사진을 다시 찍어주세요</h2>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="preview" src={stage.result?.display?.dataUrl ?? stage.preview} alt="업로드한 사진" />
            <div className="issues" style={{ marginTop: 14 }}>
              {stage.error && <div className="issue error">{stage.error}</div>}
              {stage.result?.quality.issues.map((i) => (
                <div key={i.code} className={`issue ${i.level}`}>
                  {i.message}
                </div>
              ))}
            </div>
          </section>
          {pickers}
          <button className="btn btn-secondary" onClick={reset}>
            촬영 가이드 다시 보기
          </button>
        </>
      )}

      {mode === "diagnose" && stage.kind === "result" && <Result result={stage.result} onRetry={reset} />}
    </main>
  );
}
