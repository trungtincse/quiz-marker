"use client";

import { useState } from "react";

declare global {
  interface Window {
    /** Provided by the desktop app's preload script. */
    quizMarker?: { exportPdf(path: string, fileName: string): Promise<string | null> };
  }
}

export function ExportPdf({ quizId, title }: { quizId: number; title: string }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string>();

  const exportPdf = async (withAnswers: boolean) => {
    const path = `/quizzes/${quizId}/print${withAnswers ? "?answers=1" : ""}`;
    if (!window.quizMarker) {
      window.open(`${path}${withAnswers ? "&" : "?"}auto=1`, "_blank");
      return;
    }
    setBusy(true);
    setMessage(undefined);
    try {
      const saved = await window.quizMarker.exportPdf(path, withAnswers ? `${title} - đáp án` : title);
      if (saved) setMessage(`Đã lưu: ${saved}`);
    } catch {
      setMessage("Xuất PDF thất bại.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative">
      <details className="group">
        <summary className="btn-ghost cursor-pointer list-none [&::-webkit-details-marker]:hidden">
          {busy ? "Đang xuất…" : "Xuất PDF ▾"}
        </summary>
        <div className="absolute right-0 z-20 mt-1 w-48 overflow-hidden rounded-xl border border-zinc-200 bg-white text-sm shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
          {([
            { withAnswers: false, label: "Đề trống" },
            { withAnswers: true, label: "Có đáp án" },
          ] as const).map(({ withAnswers, label }) => (
            <button
              key={label}
              disabled={busy}
              className="block w-full px-4 py-2 text-left hover:bg-zinc-100 disabled:opacity-50 dark:hover:bg-zinc-800"
              onClick={(e) => {
                e.currentTarget.closest("details")?.removeAttribute("open");
                exportPdf(withAnswers);
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </details>
      {message && <p className="absolute right-0 mt-1 w-max max-w-xs text-xs text-green-700">{message}</p>}
    </div>
  );
}
