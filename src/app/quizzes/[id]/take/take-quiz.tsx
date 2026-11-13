"use client";

import { useState, useTransition } from "react";
import { submitAttemptAction } from "@/app/actions";
import { LETTERS } from "@/lib/format";
import { QuestionImage } from "@/components/question-image";

type Q = { id: number; prompt: string; image: string | null; options: string[] };

export function TakeQuiz({ quizId, title, questions }: { quizId: number; title: string; questions: Q[] }) {
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const answered = Object.keys(selected).length;

  const submit = () => {
    const missing = questions.length - answered;
    if (missing > 0 && !confirm(`Còn ${missing} câu chưa trả lời. Vẫn nộp bài?`)) return;
    startTransition(async () => {
      const res = await submitAttemptAction(quizId, selected);
      if (res?.error) setError(res.error);
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-sm text-zinc-500">Đã trả lời {answered}/{questions.length}</p>
      </div>

      {questions.map((q, i) => (
        <fieldset key={q.id} className="card space-y-3">
          <legend className="sr-only">Câu {i + 1}</legend>
          <p className="font-medium">
            <span className="mr-2 text-violet-600">Câu {i + 1}.</span>
            {q.prompt}
          </p>
          {q.image && <QuestionImage name={q.image} />}
          <div className="space-y-2">
            {q.options.map((opt, oi) => {
              const checked = selected[q.id] === oi;
              return (
                <label
                  key={oi}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm transition ${
                    checked
                      ? "border-violet-500 bg-violet-50 dark:bg-violet-950"
                      : "border-zinc-200 hover:border-zinc-400 dark:border-zinc-800"
                  }`}
                >
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    checked={checked}
                    onChange={() => setSelected((s) => ({ ...s, [q.id]: oi }))}
                    className="mt-0.5 size-4 accent-violet-600"
                  />
                  <span className="font-semibold text-zinc-500">{LETTERS[oi]}.</span>
                  <span>{opt}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}

      <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-zinc-200 bg-background/90 py-3 backdrop-blur dark:border-zinc-800">
        {error && <p className="mr-auto text-sm text-red-600">{error}</p>}
        <button className="btn-primary" onClick={submit} disabled={pending}>
          {pending ? "Đang nộp…" : "Nộp bài"}
        </button>
      </div>
    </div>
  );
}
