"use client";

import { useState, useSyncExternalStore } from "react";
import { localEntries, serverEntries, subscribeEntries, withdrawContribution } from "@/lib/contribute/store";

/** Lists contributions sent from this device and lets the person withdraw them. */
export default function MyContributions() {
  const entries = useSyncExternalStore(subscribeEntries, localEntries, serverEntries);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  if (!entries.length) return null;

  return (
    <details className="card mine">
      <summary>내가 보낸 데이터 ({entries.length}건)</summary>
      <ul>
        {entries.map((e) => (
          <li key={e.id}>
            <span>
              {e.label}
              <small className="muted"> · {new Date(e.createdAt).toLocaleDateString("ko-KR")}</small>
            </span>
            <button
              className="link-btn"
              disabled={busy === e.id}
              onClick={async () => {
                setBusy(e.id);
                setError("");
                try {
                  await withdrawContribution(e);
                } catch {
                  setError("삭제하지 못했어요. 잠시 후 다시 시도해 주세요.");
                } finally {
                  setBusy(null);
                }
              }}
            >
              삭제
            </button>
          </li>
        ))}
      </ul>
      {error && <div className="issue error">{error}</div>}
      <p className="note" style={{ margin: 0 }}>
        삭제하면 저장된 데이터가 지워지고, 이후 학습에서 빠져요.
      </p>
    </details>
  );
}
