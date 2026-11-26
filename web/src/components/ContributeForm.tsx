"use client";

import { useId, useState } from "react";
import type { AnalysisResult } from "@/lib/analysis/analyze";
import type { Season, ToneId } from "@/lib/analysis/classifier";
import {
  buildContribution,
  KOREAN_TONE_OPTIONS,
  LabelConfidence,
  Lighting,
  Makeup,
  SEASON_IDS,
  Source,
} from "@/lib/contribute/schema";
import { submitContribution } from "@/lib/contribute/store";
import { SEASONS } from "@/lib/tones";

export function ConsentText({ source }: { source: Source }) {
  return (
    <div className="consent-text">
      <p>
        <b>수집 항목</b>: 사진에서 계산한 색 수치 30개(피부·머리카락·눈 영역의 평균 밝기·색), 사진 품질 정보, 입력한 진단 결과와
        촬영 조건, AI 진단 결과. <b>사진 원본은 수집하지 않아요.</b>
      </p>
      <p>
        <b>목적</b>: 한국인에게 맞는 퍼스널 컬러 AI 모델의 학습과 정확도 평가.
      </p>
      <p>
        <b>보유 기간</b>: 수집일로부터 3년 또는 동의 철회 시까지. 이 기기의 &lsquo;내가 보낸 데이터&rsquo;에서 언제든 삭제할 수
        있어요.
      </p>
      <p>
        동의하지 않아도 진단 서비스는 그대로 이용할 수 있어요.
        {source === "consultant" && " 컨설턴트는 고객에게 이 내용을 설명하고 동의를 받은 경우에만 제출해 주세요. 만 14세 미만 고객은 제출하지 마세요."}
      </p>
    </div>
  );
}

type ToneChoice = ToneId | "season-only" | "other" | "";

export default function ContributeForm({
  result,
  source,
  consultantCode,
  onDone,
}: {
  result: AnalysisResult;
  source: Source;
  consultantCode?: string;
  onDone?: () => void;
}) {
  const uid = useId();
  const [tone, setTone] = useState<ToneChoice>("");
  const [season, setSeason] = useState<Season | "">("");
  const [rawName, setRawName] = useState("");
  const [confidence, setConfidence] = useState<LabelConfidence>("sure");
  const [diagnosedAt, setDiagnosedAt] = useState("");
  const [hairDyed, setHairDyed] = useState<"yes" | "no" | "unknown" | "">("");
  const [makeup, setMakeup] = useState<Makeup | "">("");
  const [lighting, setLighting] = useState<Lighting>("unknown");
  const [agree, setAgree] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const m = result.measurement;
  const p = result.prediction;
  if (!m || !p) return null;

  const pickedTone = tone && tone !== "season-only" && tone !== "other" ? (tone as ToneId) : null;
  const effectiveSeason: Season | "" = pickedTone ? (pickedTone.split("_")[0] as Season) : season;
  const ready = !!effectiveSeason && !!hairDyed && !!makeup && agree && state !== "sending";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!ready || !m || !p || !effectiveSeason) return;
    setState("sending");
    setError("");
    try {
      const c = buildContribution({
        source,
        season: effectiveSeason,
        tone: pickedTone,
        rawName: tone === "other" ? rawName : (KOREAN_TONE_OPTIONS.find((o) => o.tone === pickedTone)?.label ?? null),
        confidence,
        consultantCode: consultantCode ?? null,
        diagnosedAt: diagnosedAt || null,
        hairDyed: hairDyed === "yes" ? true : hairDyed === "no" ? false : null,
        makeup: makeup || null,
        lighting,
        features: m.features,
        wb: m.wb,
        quality: result.quality,
        pixels: m.pixels,
        aiTones: p.tones,
      });
      const label = pickedTone
        ? KOREAN_TONE_OPTIONS.find((o) => o.tone === pickedTone)!.label
        : `${SEASONS[effectiveSeason].ko}${rawName ? ` (${rawName})` : ""}`;
      await submitContribution(c, label);
      setState("done");
      onDone?.();
    } catch (err) {
      console.error(err);
      setError(
        (err as Error).message === "no_permission"
          ? "이 링크로는 데이터를 보낼 권한이 없어요. 링크를 공유한 분에게 '참여자' 권한을 요청해 주세요."
          : "보내지 못했어요. 네트워크를 확인하고 다시 시도해 주세요.",
      );
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="issue ok" role="status">
        고마워요! 보내주신 진단 결과는 한국인 셀카에 맞는 AI를 만드는 데 쓰여요.
      </div>
    );
  }

  return (
    <form className="contrib" onSubmit={submit}>
      <label htmlFor={`${uid}-tone`}>{source === "consultant" ? "컨설턴트 진단 결과" : "전문가에게 받은 진단 결과"}</label>
      <select id={`${uid}-tone`} value={tone} onChange={(e) => setTone(e.target.value as ToneChoice)} required>
        <option value="">선택해 주세요</option>
        {KOREAN_TONE_OPTIONS.map((o) => (
          <option key={o.tone} value={o.tone}>
            {o.label}
          </option>
        ))}
        <option value="season-only">세부 톤은 모르고 계절만 알아요</option>
        <option value="other">목록에 없어요 (직접 입력)</option>
      </select>

      {(tone === "season-only" || tone === "other") && (
        <>
          <label htmlFor={`${uid}-season`}>계절</label>
          <select id={`${uid}-season`} value={season} onChange={(e) => setSeason(e.target.value as Season)} required>
            <option value="">선택해 주세요</option>
            {SEASON_IDS.map((s) => (
              <option key={s} value={s}>
                {SEASONS[s].ko}
              </option>
            ))}
          </select>
        </>
      )}
      {tone === "other" && (
        <>
          <label htmlFor={`${uid}-raw`}>진단서에 적힌 이름</label>
          <input
            id={`${uid}-raw`}
            value={rawName}
            maxLength={40}
            placeholder="예: 여름 브라이트, 가을 스트롱"
            onChange={(e) => setRawName(e.target.value)}
          />
        </>
      )}

      <fieldset>
        <legend>진단이 얼마나 확실했나요?</legend>
        <label className="opt">
          <input type="radio" name={`${uid}-conf`} checked={confidence === "sure"} onChange={() => setConfidence("sure")} />
          확실해요
        </label>
        <label className="opt">
          <input type="radio" name={`${uid}-conf`} checked={confidence === "unsure"} onChange={() => setConfidence("unsure")} />
          애매했어요 (두 톤 사이 등)
        </label>
      </fieldset>

      {source === "user" && (
        <>
          <label htmlFor={`${uid}-when`}>진단받은 시기 (선택)</label>
          <input id={`${uid}-when`} type="month" value={diagnosedAt} onChange={(e) => setDiagnosedAt(e.target.value)} />
        </>
      )}

      <fieldset>
        <legend>사진 속 머리카락은?</legend>
        {(
          [
            ["no", "타고난 머리색"],
            ["yes", "염색·탈색한 머리"],
            ["unknown", "잘 모르겠어요"],
          ] as const
        ).map(([v, t]) => (
          <label key={v} className="opt">
            <input type="radio" name={`${uid}-hair`} checked={hairDyed === v} onChange={() => setHairDyed(v)} />
            {t}
          </label>
        ))}
      </fieldset>

      <fieldset>
        <legend>사진 속 메이크업은?</legend>
        {(
          [
            ["none", "맨얼굴"],
            ["base", "선크림·기초만"],
            ["full", "색조 메이크업"],
          ] as const
        ).map(([v, t]) => (
          <label key={v} className="opt">
            <input type="radio" name={`${uid}-makeup`} checked={makeup === v} onChange={() => setMakeup(v)} />
            {t}
          </label>
        ))}
      </fieldset>

      <label htmlFor={`${uid}-light`}>촬영한 곳의 빛</label>
      <select id={`${uid}-light`} value={lighting} onChange={(e) => setLighting(e.target.value as Lighting)}>
        <option value="daylight">자연광 (창가·야외)</option>
        <option value="indoor">실내 조명</option>
        <option value="mixed">자연광 + 실내 조명</option>
        <option value="unknown">잘 모르겠어요</option>
      </select>

      <details className="consent">
        <summary>AI 학습용 데이터 제공 안내 (필수 확인)</summary>
        <ConsentText source={source} />
      </details>
      <label className="opt agree">
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
        {source === "consultant"
          ? "고객에게 위 내용을 설명했고, 고객이 동의했어요 (만 14세 이상)"
          : "위 내용을 확인했고, AI 학습용 데이터 제공에 동의해요 (만 14세 이상)"}
      </label>

      {error && <div className="issue error">{error}</div>}
      <button className="btn btn-primary" type="submit" disabled={!ready}>
        {state === "sending" ? "보내는 중…" : "진단 결과 보내기"}
      </button>
    </form>
  );
}
