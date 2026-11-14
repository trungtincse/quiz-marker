"use client";

import Link from "next/link";
import { useEffect } from "react";

async function waitForImages() {
  await Promise.all(
    Array.from(document.images).map((img) =>
      img.complete
        ? null
        : new Promise((resolve) => {
            img.addEventListener("load", resolve);
            img.addEventListener("error", resolve);
          }),
    ),
  );
  await document.fonts.ready;
}

export function PrintToolbar({ quizId, withAnswers, autoPrint }: { quizId: number; withAnswers: boolean; autoPrint: boolean }) {
  useEffect(() => {
    if (autoPrint) waitForImages().then(() => window.print());
  }, [autoPrint]);

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2 rounded-xl bg-zinc-100 p-3 text-sm print:hidden">
      <button className="btn-primary" onClick={() => waitForImages().then(() => window.print())}>
        In / Lưu PDF
      </button>
      <Link href={`/quizzes/${quizId}/print${withAnswers ? "" : "?answers=1"}`} className="btn-ghost">
        {withAnswers ? "Xem bản đề trống" : "Xem bản có đáp án"}
      </Link>
      <Link href={`/quizzes/${quizId}`} className="btn-ghost">Về đề</Link>
      <span className="text-zinc-500">Trong hộp thoại in, chọn “Lưu thành PDF”.</span>
    </div>
  );
}
