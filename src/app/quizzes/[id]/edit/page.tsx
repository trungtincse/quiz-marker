import { notFound } from "next/navigation";
import { getQuiz } from "@/lib/data";
import { QuizEditor } from "./quiz-editor";

export default async function EditQuizPage({ params }: PageProps<"/quizzes/[id]/edit">) {
  const { id } = await params;
  const quiz = await getQuiz(Number(id));
  if (!quiz) notFound();

  return (
    <QuizEditor
      quizId={quiz.id}
      initialTitle={quiz.title}
      initialQuestions={quiz.questions.map((q) => ({
        prompt: q.prompt,
        image: q.image,
        options: q.options,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
      }))}
    />
  );
}
