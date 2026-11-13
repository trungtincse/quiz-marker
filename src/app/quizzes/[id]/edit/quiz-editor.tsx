"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { saveQuizAction } from "@/app/actions";
import { LETTERS } from "@/lib/format";
import { ImageField, uploadImage } from "./image-field";

type Draft = {
  key: number;
  prompt: string;
  image: string | null;
  options: string[];
  correctIndex: number;
  explanation: string;
};
type QuestionData = Omit<Draft, "key">;

let nextKey = 0;
const withKey = (q: QuestionData): Draft => ({ ...q, key: nextKey++ });
const blank = (): Draft => withKey({ prompt: "", image: null, options: ["", "", "", ""], correctIndex: 0, explanation: "" });

export function QuizEditor({
  quizId,
  initialTitle,
  initialQuestions,
}: {
  quizId: number;
  initialTitle: string;
  initialQuestions: QuestionData[];
}) {
  const [title, setTitle] = useState(initialTitle);
  const [items, setItems] = useState<Draft[]>(() =>
    initialQuestions.length ? initialQuestions.map(withKey) : [blank()],
  );
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(0);

  const attachImage = async (key: number, file: File) => {
    setError(undefined);
    setUploading((n) => n + 1);
    try {
      update(key, { image: await uploadImage(file) });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tải ảnh thất bại.");
    } finally {
      setUploading((n) => n - 1);
    }
  };

  const update = (key: number, patch: Partial<Draft>) =>
    setItems((xs) => xs.map((x) => (x.key === key ? { ...x, ...patch } : x)));
  const move = (i: number, d: -1 | 1) =>
    setItems((xs) => {
      const j = i + d;
      if (j < 0 || j >= xs.length) return xs;
      const copy = [...xs];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });

  const save = () =>
    startTransition(async () => {
      setError(undefined);
      const res = await saveQuizAction(quizId, {
        title,
        questions: items.map(({ prompt, image, options, correctIndex, explanation }) => ({ prompt, image, options, correctIndex, explanation })),
      });
      if (res?.error) setError(res.error);
    });

  return (
    <div className="space-y-4">
      <div className="card space-y-2">
        <label className="label" htmlFor="title">Tiêu đề</label>
        <input id="title" className="input text-lg font-semibold" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      {items.map((q, i) => (
        <div key={q.key} className="card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-violet-600">Câu {i + 1}</span>
            <div className="flex gap-1 text-sm">
              <button type="button" className="btn-ghost px-2 py-1" onClick={() => move(i, -1)} disabled={i === 0}>↑</button>
              <button type="button" className="btn-ghost px-2 py-1" onClick={() => move(i, 1)} disabled={i === items.length - 1}>↓</button>
              <button type="button" className="btn-danger px-2 py-1" onClick={() => setItems((xs) => xs.filter((x) => x.key !== q.key))}>Xoá</button>
            </div>
          </div>
          <textarea
            className="input"
            rows={2}
            placeholder="Nội dung câu hỏi (có thể dán ảnh bằng Ctrl+V)"
            value={q.prompt}
            onChange={(e) => update(q.key, { prompt: e.target.value })}
            onPaste={(e) => {
              const file = Array.from(e.clipboardData.files).find((f) => f.type.startsWith("image/"));
              if (file) {
                e.preventDefault();
                attachImage(q.key, file);
              }
            }}
          />
          <ImageField
            image={q.image}
            onPick={(file) => attachImage(q.key, file)}
            onRemove={() => update(q.key, { image: null })}
          />
          <div className="space-y-2">
            {q.options.map((opt, oi) => (
              <div key={oi} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`correct-${q.key}`}
                  checked={q.correctIndex === oi}
                  onChange={() => update(q.key, { correctIndex: oi })}
                  className="size-4 accent-violet-600"
                  title="Đáp án đúng"
                />
                <span className="w-5 text-sm font-medium text-zinc-500">{LETTERS[oi]}</span>
                <input
                  className="input"
                  value={opt}
                  placeholder={`Phương án ${LETTERS[oi]}`}
                  onChange={(e) => update(q.key, { options: q.options.map((o, k) => (k === oi ? e.target.value : o)) })}
                />
                <button
                  type="button"
                  className="text-zinc-400 hover:text-red-600 disabled:opacity-30"
                  disabled={q.options.length <= 2}
                  onClick={() =>
                    update(q.key, {
                      options: q.options.filter((_, k) => k !== oi),
                      correctIndex: q.correctIndex === oi ? 0 : q.correctIndex > oi ? q.correctIndex - 1 : q.correctIndex,
                    })
                  }
                  title="Xoá phương án"
                >
                  ✕
                </button>
              </div>
            ))}
            {q.options.length < 6 && (
              <button type="button" className="text-sm text-violet-600 hover:underline" onClick={() => update(q.key, { options: [...q.options, ""] })}>
                + Thêm phương án
              </button>
            )}
          </div>
          <input className="input" placeholder="Giải thích (tuỳ chọn)" value={q.explanation} onChange={(e) => update(q.key, { explanation: e.target.value })} />
        </div>
      ))}

      <button type="button" className="btn-ghost w-full" onClick={() => setItems((xs) => [...xs, blank()])}>
        + Thêm câu hỏi
      </button>

      <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-zinc-200 bg-background/90 py-3 backdrop-blur dark:border-zinc-800">
        {error && <p className="mr-auto text-sm text-red-600">{error}</p>}
        <Link href={`/quizzes/${quizId}`} className="btn-ghost">Huỷ</Link>
        <button type="button" className="btn-primary" onClick={save} disabled={pending || uploading > 0}>
          {uploading > 0 ? "Đang tải ảnh…" : pending ? "Đang lưu…" : "Lưu"}
        </button>
      </div>
    </div>
  );
}
