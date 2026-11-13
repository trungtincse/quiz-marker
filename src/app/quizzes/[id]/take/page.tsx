import { notFound } from "next/navigation";
import { getQuiz } from "@/lib/data";
import { TakeQuiz } from "./take-quiz";

export default async function TakeQuizPage({ params }: PageProps<"/quizzes/[id]/take">) {
  const { id } = await params;
  const quiz = await getQuiz(Number(id));
  if (!quiz || quiz.questions.length === 0) notFound();

  // Only send what's needed to answer — correct answers stay on the server.
  return (
    <TakeQuiz
      quizId={quiz.id}
      title={quiz.title}
      questions={quiz.questions.map((q) => ({ id: q.id, prompt: q.prompt, image: q.image, options: q.options }))}
    />
  );
}
