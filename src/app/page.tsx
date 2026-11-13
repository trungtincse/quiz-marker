import Link from "next/link";
import { listQuizzes } from "@/lib/data";
import { formatDate } from "@/lib/format";

export default async function Home() {
  const quizzes = await listQuizzes();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Đề của bạn</h1>
        <p className="text-sm text-zinc-500">Soạn câu hỏi trắc nghiệm, làm bài và xem lại kết quả.</p>
      </div>

      {quizzes.length === 0 ? (
        <div className="card flex flex-col items-center gap-4 py-12 text-center">
          <p className="text-zinc-500">Chưa có đề nào.</p>
          <Link href="/quizzes/new" className="btn-primary">Tạo đề đầu tiên</Link>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {quizzes.map((q) => (
            <li key={q.id}>
              <Link href={`/quizzes/${q.id}`} className="card block h-full transition hover:border-violet-400">
                <h2 className="mb-1 line-clamp-2 font-semibold">{q.title}</h2>
                <p className="text-xs text-zinc-500">{formatDate(q.createdAt)}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-zinc-100 px-2 py-1 dark:bg-zinc-800">{q.questionCount ?? 0} câu</span>
                  <span className="rounded-full bg-zinc-100 px-2 py-1 dark:bg-zinc-800">{q.attemptCount ?? 0} lượt làm</span>
                  {q.bestScore != null && (
                    <span className="rounded-full bg-violet-100 px-2 py-1 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                      Cao nhất: {q.bestScore}/{q.questionCount ?? 0}
                    </span>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
