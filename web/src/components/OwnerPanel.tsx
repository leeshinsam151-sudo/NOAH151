"use client";

import { useEffect, useState } from "react";
import type { Contribution } from "@/lib/contribute/schema";
import { exportAll, isDataOwner, saveExport } from "@/lib/contribute/store";
import { TONES } from "@/lib/tones";

/** Preview-only: lets the artifact owner see collection progress and export the data. */
export default function OwnerPanel() {
  const [owner, setOwner] = useState<boolean | null>(null);
  const [data, setData] = useState<{ rows: Contribution[]; invalid: number } | null>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    isDataOwner().then(setOwner).catch(() => setOwner(false));
  }, []);

  if (owner === null) return <section className="card note">권한 확인 중…</section>;
  if (!owner) return <section className="card note">이 화면은 관리자만 볼 수 있어요.</section>;

  const rows = data?.rows ?? [];
  const byTone = new Map<string, number>();
  for (const r of rows) {
    const k = r.label.tone ? TONES[r.label.tone].ko : `${r.label.season} (계절만)`;
    byTone.set(k, (byTone.get(k) ?? 0) + 1);
  }
  const agree = rows.filter((r) => r.ai.tones[0]?.id.split("_")[0] === r.label.season).length;

  return (
    <section className="card">
      <h2>수집 현황 (관리자)</h2>
      <button
        className="btn btn-secondary"
        onClick={async () => {
          setMsg("불러오는 중…");
          try {
            setData(await exportAll());
            setMsg("");
          } catch {
            setMsg("데이터를 불러오지 못했어요.");
          }
        }}
      >
        데이터 불러오기
      </button>
      {msg && <p className="note">{msg}</p>}
      {data && (
        <>
          <p>
            총 <b>{rows.length}</b>건 (컨설턴트 {rows.filter((r) => r.source === "consultant").length} · 사용자{" "}
            {rows.filter((r) => r.source === "user").length}){data.invalid > 0 && ` · 형식 오류 ${data.invalid}건 제외`}
          </p>
          {rows.length > 0 && <p className="note">AI 1순위 계절이 전문가와 일치: {Math.round((agree / rows.length) * 100)}%</p>}
          <ul className="note">
            {[...byTone.entries()]
              .sort((a, b) => b[1] - a[1])
              .map(([k, n]) => (
                <li key={k}>
                  {k}: {n}
                </li>
              ))}
          </ul>
          <button
            className="btn btn-primary"
            disabled={!rows.length}
            onClick={async () => {
              try {
                const ok = await saveExport(rows);
                setMsg(ok ? "" : "이 화면에서는 파일 저장을 쓸 수 없어요.");
              } catch {
                setMsg("저장이 취소되었거나 실패했어요.");
              }
            }}
          >
            JSONL로 내보내기 (재학습용)
          </button>
        </>
      )}
    </section>
  );
}
