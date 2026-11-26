"use client";

import { useRef, useState } from "react";
import type { AnalysisResult } from "@/lib/analysis/analyze";
import { SEASONS, TONES } from "@/lib/tones";
import ContributeForm from "./ContributeForm";
import MyContributions from "./MyContributions";

const CODE_KEY = "tonepick.consultantCode";

type Step =
  | { kind: "ready" }
  | { kind: "analyzing" }
  | { kind: "rejected"; result: AnalysisResult | null }
  | { kind: "label"; result: AnalysisResult }
  | { kind: "reveal"; result: AnalysisResult };

/**
 * Consultant mode: the consultant photographs a customer, enters their own diagnosis without
 * seeing the AI (avoids anchoring), then sees how the AI compared.
 */
export default function ConsultantMode() {
  // Mounted only on the client (after the hash is read), so reading storage here is safe.
  const [code, setCode] = useState(() => {
    try {
      return localStorage.getItem(CODE_KEY) ?? "";
    } catch {
      return "";
    }
  });
  const [step, setStep] = useState<Step>({ kind: "ready" });
  const [count, setCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setStep({ kind: "analyzing" });
    try {
      const { analyzePhoto } = await import("@/lib/analysis/analyze");
      const result = await analyzePhoto(file);
      setStep(result.prediction ? { kind: "label", result } : { kind: "rejected", result });
    } catch (e) {
      console.error(e);
      setStep({ kind: "rejected", result: null });
    }
  }

  const picker = (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        data-testid="consultant-input"
        onChange={(e) => {
          onFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <button className="btn btn-primary" onClick={() => inputRef.current?.click()} disabled={!code.trim()}>
        📷 고객 사진 선택
      </button>
    </>
  );

  return (
    <>
      <section className="card">
        <h2>컨설턴트 모드</h2>
        <p className="note" style={{ marginTop: 0 }}>
          고객을 진단한 결과를 입력하면 한국인 셀카로 AI를 다시 학습하는 데 쓰여요. AI 결과는 진단을 입력한 뒤에 보여드려요(선입견
          방지). 사진은 저장하지 않고 색 수치만 보내요.
        </p>
        <label htmlFor="consultant-code" className="field-label">
          매장·컨설턴트 코드
        </label>
        <input
          id="consultant-code"
          className="text-input"
          value={code}
          maxLength={40}
          placeholder="예: seoul-studio-01"
          onChange={(e) => {
            setCode(e.target.value);
            try {
              localStorage.setItem(CODE_KEY, e.target.value);
            } catch {
              /* ignore */
            }
          }}
        />
        <ul className="note" style={{ paddingLeft: 18, marginBottom: 0 }}>
          <li>자연광 창가, 정면, 맨얼굴 또는 기초만, 컬러렌즈 없이 촬영해 주세요.</li>
          <li>드레이핑 진단을 마친 뒤 최종 결과를 입력해 주세요.</li>
          <li>오늘 입력한 고객: {count}명</li>
        </ul>
      </section>

      {step.kind === "ready" && picker}
      {step.kind === "analyzing" && (
        <section className="card progress" role="status">
          <div className="spinner" />
          <b>색 측정 중이에요</b>
        </section>
      )}
      {step.kind === "rejected" && (
        <>
          <section className="card">
            <h2>다시 촬영해 주세요</h2>
            <div className="issues">
              {(step.result?.quality.issues ?? [{ code: "x", level: "error", message: "사진을 분석하지 못했어요." }]).map((i) => (
                <div key={i.code} className={`issue ${i.level}`}>
                  {i.message}
                </div>
              ))}
            </div>
          </section>
          {picker}
        </>
      )}
      {step.kind === "label" && (
        <section className="card">
          <h2>진단 결과 입력</h2>
          {step.result.quality.issues.length > 0 && (
            <div className="issues" style={{ marginBottom: 12 }}>
              {step.result.quality.issues.map((i) => (
                <div key={i.code} className={`issue ${i.level}`}>
                  {i.message}
                </div>
              ))}
            </div>
          )}
          <ContributeForm
            result={step.result}
            source="consultant"
            consultantCode={code}
            onDone={() => {
              setCount((n) => n + 1);
              setStep({ kind: "reveal", result: step.result });
            }}
          />
        </section>
      )}
      {step.kind === "reveal" && step.result.prediction && (
        <>
          <section className="card">
            <h2>AI 결과와 비교</h2>
            <div className="rank">
              {step.result.prediction.tones.slice(0, 3).map((t, k) => (
                <div key={t.id} className="rank-row">
                  <span>
                    {k + 1}. {TONES[t.id].ko}
                  </span>
                  <div className="bar">
                    <span style={{ width: `${Math.round(t.p * 100)}%`, background: SEASONS[TONES[t.id].season].accent }} />
                  </div>
                  <span className="pct">{Math.round(t.p * 100)}%</span>
                </div>
              ))}
            </div>
          </section>
          <button className="btn btn-primary" onClick={() => setStep({ kind: "ready" })}>
            다음 고객
          </button>
        </>
      )}
      <MyContributions />
    </>
  );
}
