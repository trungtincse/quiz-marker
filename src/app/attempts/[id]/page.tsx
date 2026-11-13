import Link from "next/link";
import { notFound } from "next/navigation";
import { getAttempt } from "@/lib/data";
import { formatDate, LETTERS, percent } from "@/lib/format";
import { QuestionImage } from "@/components/question-image";

export default async function AttemptPage({ params }: PageProps<"/attempts/[id]">) {
  const { id } = await params;
  const attempt = await getAttempt(Number(id));
  if (!attempt) notFound();
  const pct = percent(attempt.score, attempt.total);

  return (
    <div className="space-y-4">
      <div className="card flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-zinc-500">{attempt.quizTitle} · {formatDate(attempt.createdAt)}</p>
          <p className="text-3xl font-bold">
            {attempt.score}/{attempt.total}
            <span className={`ml-3 text-lg ${pct >= 80 ? "text-green-600" : pct >= 50 ? "text-amber-600" : "text-red-600"}`}>{pct}%</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/quizzes/${attempt.quizId}/take`} className="btn-primary">Làm lại</Link>
          <Link href={`/quizzes/${attempt.quizId}`} className="btn-ghost">Về đề</Link>
        </div>
      </div>

      {attempt.answers.map((a) => {
        const correct = a.selectedIndex === a.correctIndex;
        return (
          <div key={a.id} className={`card space-y-3 border-l-4 ${correct ? "border-l-green-500" : "border-l-red-500"}`}>
            <p className="font-medium">
              <span className="mr-2">{correct ? "✅" : "❌"}</span>
              <span className="mr-2 text-zinc-500">Câu {a.position + 1}.</span>
              {a.prompt}
            </p>
            {a.image && <QuestionImage name={a.image} />}
            <ul className="space-y-1 text-sm">
              {a.options.map((opt, oi) => {
                const isCorrect = oi === a.correctIndex;
                const isPicked = oi === a.selectedIndex;
                return (
                  <li
                    key={oi}
                    className={`rounded-lg px-3 py-2 ${
                      isCorrect
                        ? "bg-green-50 font-medium text-green-800 dark:bg-green-950 dark:text-green-200"
                        : isPicked
                          ? "bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200"
                          : "text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    <span className="mr-2 font-semibold">{LETTERS[oi]}.</span>
                    <span className={isPicked && !isCorrect ? "line-through" : ""}>{opt}</span>
                    {isPicked && <span className="ml-2 text-xs">(bạn chọn)</span>}
                  </li>
                );
              })}
            </ul>
            {a.selectedIndex == null && <p className="text-sm text-amber-600">Bạn chưa trả lời câu này.</p>}
            {a.explanation && <p className="rounded-lg bg-zinc-50 p-3 text-sm text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">💡 {a.explanation}</p>}
          </div>
        );
      })}
    </div>
  );
}
