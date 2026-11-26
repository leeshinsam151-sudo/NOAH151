"use client";

import { useState } from "react";
import type { AnalysisResult } from "@/lib/analysis/analyze";
import { MODEL } from "@/lib/analysis/classifier";
import { labToHex } from "@/lib/analysis/color";
import { SEASONS, TONES } from "@/lib/tones";
import Draping from "./Draping";
import { shareResultCard } from "./shareCard";

const pct = (p: number) => `${Math.round(p * 100)}%`;

function Axis({ left, right, value, gradient }: { left: string; right: string; value: number; gradient: string }) {
  // value in [-2.5, 2.5]; positive = left label side.
  const pos = 50 - (value / 2.5) * 50;
  return (
    <div>
      <div className="axis-labels">
        <span className={value > 0.3 ? "on" : ""}>{left}</span>
        <span className={value < -0.3 ? "on" : ""}>{right}</span>
      </div>
      <div className="axis-track" style={{ background: gradient }}>
        <span className="axis-dot" style={{ left: `${pos}%` }} />
      </div>
    </div>
  );
}

export default function Result({ result, onRetry }: { result: AnalysisResult; onRetry: () => void }) {
  const { prediction, measurement, axes, quality, display, confidence } = result;
  const [sharing, setSharing] = useState(false);
  const [cardUrl, setCardUrl] = useState<string | null>(null);
  if (!prediction || !measurement || !axes) return null;

  const top = prediction.tones[0];
  const tone = TONES[top.id];
  const season = SEASONS[tone.season];
  const alternatives = prediction.tones.slice(1, 3);
  const metrics = MODEL.testMetrics;
  const colors = measurement.colors;

  return (
    <>
      <section className="card result-hero" style={{ borderTop: `6px solid ${season.accent}` }}>
        <div className="season">
          {season.emoji} {season.ko}
        </div>
        <h1>{tone.ko}</h1>
        <div className="en">{tone.en}</div>
        <div className="chips">
          {tone.keywords.map((k) => (
            <span key={k} className="chip">
              #{k}
            </span>
          ))}
        </div>
        <div className="swatch-strip" aria-hidden>
          {tone.best.slice(0, 8).map((c) => (
            <span key={c} style={{ background: c }} />
          ))}
        </div>
        <p className="note" style={{ margin: "12px 0 0" }}>
          {tone.description}
        </p>
        <div className="meter">
          진단 신뢰도 <b style={{ color: "var(--text)" }}>{pct(confidence)}</b>
          <div className="bar" style={{ marginTop: 6 }}>
            <span style={{ width: pct(confidence), background: season.accent }} />
          </div>
        </div>
      </section>

      {quality.issues.length > 0 && (
        <section className="issues">
          {quality.issues.map((i) => (
            <div key={i.code} className={`issue ${i.level}`}>
              {i.message}
            </div>
          ))}
        </section>
      )}

      <section className="card">
        <h2>이런 톤일 수도 있어요</h2>
        <div className="rank">
          {[top, ...alternatives].map((t, k) => (
            <div key={t.id} className="rank-row">
              <span style={{ fontWeight: k === 0 ? 700 : 500 }}>
                {k + 1}. {TONES[t.id].ko}
              </span>
              <div className="bar">
                <span style={{ width: pct(t.p / top.p), background: SEASONS[TONES[t.id].season].accent }} />
              </div>
              <span className="pct">{pct(t.p)}</span>
            </div>
          ))}
        </div>
        <h2 style={{ marginTop: 20 }}>계절별 확률</h2>
        <div className="rank">
          {prediction.seasons.map((s) => (
            <div key={s.id} className="rank-row">
              <span>
                {SEASONS[s.id].emoji} {SEASONS[s.id].ko}
              </span>
              <div className="bar">
                <span style={{ width: pct(s.p), background: SEASONS[s.id].accent }} />
              </div>
              <span className="pct">{pct(s.p)}</span>
            </div>
          ))}
        </div>
      </section>

      {display && <Draping crop={display} best={tone.best} worst={tone.worst} />}

      <section className="card">
        <h2>베스트 컬러</h2>
        <div className="palette">
          {tone.best.map((c) => (
            <span key={c} className="sw" style={{ background: c }} title={c} />
          ))}
        </div>
        <h2 style={{ marginTop: 20 }}>피하면 좋은 컬러</h2>
        <div className="palette small worst">
          {tone.worst.map((c) => (
            <span key={c} className="sw" style={{ background: c }} title={c} />
          ))}
        </div>
        <div className="tip">💡 {tone.tip}</div>
      </section>

      <section className="card">
        <h2>스타일링 추천</h2>
        <dl className="reco">
          <div>
            <dt>립</dt>
            <dd>{tone.lip.join(" · ")}</dd>
          </div>
          <div>
            <dt>블러셔</dt>
            <dd>{tone.blush.join(" · ")}</dd>
          </div>
          <div>
            <dt>아이</dt>
            <dd>{tone.eye.join(" · ")}</dd>
          </div>
          <div>
            <dt>헤어</dt>
            <dd>{tone.hair.join(" · ")}</dd>
          </div>
          <div>
            <dt>액세서리</dt>
            <dd>{tone.metal}</dd>
          </div>
        </dl>
      </section>

      <section className="card">
        <h2>측정된 나의 색</h2>
        <div className="measured">
          <div>
            <div className="dot" style={{ background: labToHex(colors.skin) }} />
            피부
          </div>
          <div>
            <div className="dot" style={{ background: colors.hair ? labToHex(colors.hair) : "transparent" }} />
            {colors.hair ? "머리카락" : "머리카락 (측정 안 됨)"}
          </div>
          <div>
            <div className="dot" style={{ background: colors.eye ? labToHex(colors.eye) : "transparent" }} />눈
          </div>
        </div>
        <h2 style={{ marginTop: 22 }}>색 특성</h2>
        <div className="axes">
          <Axis left="웜" right="쿨" value={axes.warmth} gradient="linear-gradient(90deg,#f6b26b,#e8e4e0,#8fb3e0)" />
          <Axis left="라이트" right="딥" value={axes.value} gradient="linear-gradient(90deg,#f7efe6,#8c7b6b,#2d2520)" />
          <Axis left="클리어" right="뮤트" value={axes.chroma} gradient="linear-gradient(90deg,#ff5e7e,#c9a0a8,#a99fa1)" />
          <Axis left="고대비" right="저대비" value={axes.contrast} gradient="linear-gradient(90deg,#1f1f1f,#9a9a9a,#e4d9cf)" />
        </div>
        <p className="note" style={{ marginBottom: 0 }}>
          전문가 진단 데이터의 평균과 비교한 위치예요. 실제 톤 판정은 피부·머리카락·눈 색 30가지 수치를 함께 사용해요.
        </p>
      </section>

      <section className="card">
        <h2>진단 방식 안내</h2>
        <p className="note" style={{ margin: 0 }}>
          퍼스널 컬러 전문가가 진단한 얼굴 사진 4,920장(Deep Armocromia 데이터셋)으로 학습한 모델이에요. 테스트 결과 계절
          1순위 적중률은 {pct(metrics.season_top1)}, 상위 2개 안에 정답이 있을 확률은 {pct(metrics.season_top2)}였어요. 12톤
          기준으로는 상위 3개 안에 정답이 있을 확률이 {pct(metrics.tone_top3)}예요. 조명과 카메라에 따라 결과가 달라질 수 있으니
          다른 사진으로도 진단해 보고, 가상 드레이핑으로 직접 비교해 보세요.
        </p>
      </section>

      {cardUrl && (
        <section className="card">
          <h2>결과 카드</h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="preview" src={cardUrl} alt={`퍼스널 컬러 결과 카드: ${tone.ko}`} />
          <p className="note" style={{ marginBottom: 0 }}>
            이미지를 길게 누르거나(휴대폰) 오른쪽 클릭해서(PC) 저장하세요.
          </p>
        </section>
      )}

      <div className="btn-row">
        <button
          className="btn btn-primary"
          disabled={sharing}
          onClick={async () => {
            setSharing(true);
            try {
              setCardUrl(await shareResultCard(tone, season));
            } finally {
              setSharing(false);
            }
          }}
        >
          결과 카드 저장·공유
        </button>
        <button className="btn btn-secondary" onClick={onRetry}>
          다른 사진으로 다시 진단하기
        </button>
      </div>
    </>
  );
}
