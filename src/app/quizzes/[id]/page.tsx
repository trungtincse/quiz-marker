import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteQuizAction } from "@/app/actions";
import { getQuiz, listAttempts } from "@/lib/data";
import { formatDate, LETTERS, percent } from "@/lib/format";
import { ConfirmButton } from "@/components/confirm-button";
import { QuestionImage } from "@/components/question-image";

export default async function QuizPage({ params }: PageProps<"/quizzes/[id]">) {
  const { id } = await params;
  const quiz = await getQuiz(Number(id));
  if (!quiz) notFound();
  const history = await listAttempts(quiz.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{quiz.title}</h1>
          <p className="text-sm text-zinc-500">{quiz.questions.length} câu · tạo lúc {formatDate(quiz.createdAt)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {quiz.questions.length > 0 && <Link href={`/quizzes/${quiz.id}/take`} className="btn-primary">▶ Làm bài</Link>}
          <Link href={`/quizzes/${quiz.id}/edit`} className="btn-ghost">Sửa</Link>
          <form action={deleteQuizAction}>
            <input type="hidden" name="id" value={quiz.id} />
            <ConfirmButton message="Xoá đề này cùng toàn bộ lịch sử làm bài?" className="btn-danger">Xoá</ConfirmButton>
          </form>
        </div>
      </div>

      <section className="card">
        <h2 className="mb-3 font-semibold">Lịch sử làm bài</h2>
        {history.length === 0 ? (
          <p className="text-sm text-zinc-500">Chưa có lượt làm nào.</p>
        ) : (
          <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {history.map((a) => (
              <li key={a.id}>
                <Link href={`/attempts/${a.id}`} className="flex items-center justify-between py-2 text-sm hover:text-violet-600">
                  <span>{formatDate(a.createdAt)}</span>
                  <span className="font-medium">{a.score}/{a.total} ({percent(a.score, a.total)}%)</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card">
        <h2 className="mb-3 font-semibold">Danh sách câu hỏi</h2>
        {quiz.questions.length === 0 ? (
          <p className="text-sm text-zinc-500">Chưa có câu hỏi. <Link href={`/quizzes/${quiz.id}/edit`} className="text-violet-600 underline">Thêm câu hỏi</Link></p>
        ) : (
          <ol className="space-y-6">
            {quiz.questions.map((q, i) => (
              <li key={q.id} className="space-y-2">
                <p className="font-medium">
                  <span className="mr-2 text-violet-600">Câu {i + 1}.</span>
                  {q.prompt}
                </p>
                {q.image && <QuestionImage name={q.image} />}
                <ul className="space-y-1 text-sm">
                  {q.options.map((opt, oi) => (
                    <li
                      key={oi}
                      className={`rounded-lg px-3 py-2 ${
                        oi === q.correctIndex
                          ? "bg-green-50 font-medium text-green-800 dark:bg-green-950 dark:text-green-200"
                          : "text-zinc-600 dark:text-zinc-400"
                      }`}
                    >
                      <span className="mr-2 font-semibold">{LETTERS[oi]}.</span>
                      {opt}
                      {oi === q.correctIndex && <span className="ml-2">✓</span>}
                    </li>
                  ))}
                </ul>
                {q.explanation && (
                  <p className="rounded-lg bg-zinc-50 p-3 text-sm text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">💡 {q.explanation}</p>
                )}
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
