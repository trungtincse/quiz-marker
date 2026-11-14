"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db, schema } from "@/db";
import { IMAGE_NAME_RE } from "@/lib/images";

const { quizzes, questions, attempts, answers } = schema;

export type FormState = { error?: string };

export async function createEmptyQuizAction(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim() || "Đề mới";
  const quiz = db.insert(quizzes).values({ title }).returning({ id: quizzes.id }).get();
  revalidatePath("/");
  redirect(`/quizzes/${quiz.id}/edit`);
}

const QuestionInput = z.object({
  prompt: z.string().trim(),
  image: z.string().regex(IMAGE_NAME_RE).nullable().default(null),
  options: z.array(z.string().trim()).max(6),
  correctIndex: z.number().int().min(0),
  explanation: z.string().trim().default(""),
});

const SaveQuizInput = z.object({
  title: z.string().trim().min(1, "Tiêu đề không được để trống."),
  questions: z.array(QuestionInput),
});

export async function saveQuizAction(
  quizId: number,
  payload: z.input<typeof SaveQuizInput>,
): Promise<FormState> {
  const parsed = SaveQuizInput.safeParse(payload);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ." };

  // Blank options are dropped; the correct answer index is remapped to match.
  const cleaned = [];
  for (const [i, q] of parsed.data.questions.entries()) {
    const label = `Câu ${i + 1}`;
    if (!q.prompt) return { error: `${label}: nội dung câu hỏi đang để trống.` };
    const kept = q.options.map((text, idx) => ({ text, idx })).filter((o) => o.text);
    if (kept.length === 0) return { error: `${label}: cần ít nhất 1 phương án.` };
    const correctIndex = kept.findIndex((o) => o.idx === q.correctIndex);
    if (correctIndex < 0) return { error: `${label}: đáp án đúng đang để trống.` };
    cleaned.push({ ...q, options: kept.map((o) => o.text), correctIndex });
  }
  const data = { title: parsed.data.title, questions: cleaned };

  db.transaction((tx) => {
    tx.update(quizzes).set({ title: data.title }).where(eq(quizzes.id, quizId)).run();
    tx.delete(questions).where(eq(questions.quizId, quizId)).run();
    if (data.questions.length) {
      tx.insert(questions)
        .values(data.questions.map((q, i) => ({ ...q, quizId, position: i })))
        .run();
    }
  });

  revalidatePath("/");
  revalidatePath(`/quizzes/${quizId}`);
  redirect(`/quizzes/${quizId}`);
}

export async function deleteQuizAction(formData: FormData) {
  const id = Number(formData.get("id"));
  db.delete(quizzes).where(eq(quizzes.id, id)).run();
  revalidatePath("/");
  redirect("/");
}

export async function submitAttemptAction(
  quizId: number,
  selections: Record<number, number>,
): Promise<FormState> {
  const qs = db.select().from(questions).where(eq(questions.quizId, quizId)).all();
  if (qs.length === 0) return { error: "Đề này chưa có câu hỏi." };
  qs.sort((a, b) => a.position - b.position);

  const rows = qs.map((q, i) => {
    const sel = selections[q.id];
    const selectedIndex = Number.isInteger(sel) && sel >= 0 && sel < q.options.length ? sel : null;
    return {
      position: i,
      prompt: q.prompt,
      image: q.image,
      options: q.options,
      correctIndex: q.correctIndex,
      selectedIndex,
      explanation: q.explanation,
    };
  });
  const score = rows.filter((r) => r.selectedIndex === r.correctIndex).length;

  const attemptId = db.transaction((tx) => {
    const attempt = tx
      .insert(attempts)
      .values({ quizId, score, total: rows.length })
      .returning({ id: attempts.id })
      .get();
    tx.insert(answers)
      .values(rows.map((r) => ({ ...r, attemptId: attempt.id })))
      .run();
    return attempt.id;
  });

  revalidatePath("/");
  revalidatePath(`/quizzes/${quizId}`);
  redirect(`/attempts/${attemptId}`);
}

