import "server-only";
import { connection } from "next/server";
import { asc, count, desc, eq, max } from "drizzle-orm";
import { db, schema } from "@/db";

const { quizzes, questions, attempts, answers } = schema;

export async function listQuizzes() {
  await connection();
  const qCount = db
    .select({ quizId: questions.quizId, n: count().as("n") })
    .from(questions)
    .groupBy(questions.quizId)
    .as("q_count");
  const aStats = db
    .select({
      quizId: attempts.quizId,
      tries: count().as("tries"),
      best: max(attempts.score).as("best"),
    })
    .from(attempts)
    .groupBy(attempts.quizId)
    .as("a_stats");

  return db
    .select({
      id: quizzes.id,
      title: quizzes.title,
      createdAt: quizzes.createdAt,
      questionCount: qCount.n,
      attemptCount: aStats.tries,
      bestScore: aStats.best,
    })
    .from(quizzes)
    .leftJoin(qCount, eq(qCount.quizId, quizzes.id))
    .leftJoin(aStats, eq(aStats.quizId, quizzes.id))
    .orderBy(desc(quizzes.createdAt))
    .all();
}

export async function getQuiz(id: number) {
  await connection();
  const quiz = db.select().from(quizzes).where(eq(quizzes.id, id)).get();
  if (!quiz) return null;
  const qs = db
    .select()
    .from(questions)
    .where(eq(questions.quizId, id))
    .orderBy(asc(questions.position))
    .all();
  return { ...quiz, questions: qs };
}

export async function listAttempts(quizId: number) {
  await connection();
  return db
    .select()
    .from(attempts)
    .where(eq(attempts.quizId, quizId))
    .orderBy(desc(attempts.createdAt))
    .all();
}

export async function getAttempt(id: number) {
  await connection();
  const attempt = db.select().from(attempts).where(eq(attempts.id, id)).get();
  if (!attempt) return null;
  const quiz = db.select().from(quizzes).where(eq(quizzes.id, attempt.quizId)).get();
  const rows = db
    .select()
    .from(answers)
    .where(eq(answers.attemptId, id))
    .orderBy(asc(answers.position))
    .all();
  return { ...attempt, quizTitle: quiz?.title ?? "", answers: rows };
}
