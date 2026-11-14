import { notFound } from "next/navigation";
import { getQuiz } from "@/lib/data";
import { LETTERS } from "@/lib/format";
import { imageUrl } from "@/lib/images";
import { PrintToolbar } from "./print-toolbar";

export default async function PrintQuizPage({ params, searchParams }: PageProps<"/quizzes/[id]/print">) {
  const { id } = await params;
  const sp = await searchParams;
  const withAnswers = sp.answers === "1";
  const quiz = await getQuiz(Number(id));
  if (!quiz) notFound();

  return (
    <article data-print-ready className="print-doc mx-auto max-w-3xl bg-white p-8 text-black shadow-sm print:max-w-none print:p-0 print:shadow-none">
      <PrintToolbar quizId={quiz.id} withAnswers={withAnswers} autoPrint={sp.auto === "1"} />

      <header className="mb-6 border-b border-zinc-300 pb-4">
        <h1 className="text-2xl font-bold">{quiz.title}</h1>
        <p className="mt-1 text-sm text-zinc-600">
          {quiz.questions.length} câu{withAnswers && " · Đáp án"}
        </p>
        {!withAnswers && (
          <div className="mt-4 grid grid-cols-2 gap-6 text-sm">
            <p>Họ tên: ……………………………………</p>
            <p>Điểm: ……………</p>
          </div>
        )}
      </header>

      <ol className="space-y-5">
        {quiz.questions.map((q, i) => (
          <li key={q.id} className="break-inside-avoid space-y-2">
            <p className="font-medium">
              <span className="mr-1 font-bold">Câu {i + 1}.</span> {q.prompt}
            </p>
            {q.image && (
              // eslint-disable-next-line @next/next/no-img-element -- user-uploaded image of unknown size
              <img src={imageUrl(q.image)} alt="" className="max-h-64 max-w-full rounded border border-zinc-300 object-contain" />
            )}
            <ul className="space-y-1 pl-2 text-sm">
              {q.options.map((opt, oi) => {
                const correct = withAnswers && oi === q.correctIndex;
                return (
                  <li key={oi} className={`flex gap-2 ${correct ? "font-semibold text-green-700" : ""}`}>
                    <span className="inline-block w-4 shrink-0">{correct ? "✓" : "○"}</span>
                    <span className="shrink-0 font-semibold">{LETTERS[oi]}.</span>
                    <span>{opt}</span>
                  </li>
                );
              })}
            </ul>
            {withAnswers && q.explanation && <p className="pl-2 text-sm italic text-zinc-600">Giải thích: {q.explanation}</p>}
          </li>
        ))}
      </ol>

      {withAnswers && quiz.questions.length > 0 && (
        <section className="mt-8 break-inside-avoid border-t border-zinc-300 pt-4">
          <h2 className="mb-2 font-bold">Bảng đáp án</h2>
          <div className="grid grid-cols-5 gap-x-4 gap-y-1 text-sm sm:grid-cols-8 print:grid-cols-8">
            {quiz.questions.map((q, i) => (
              <span key={q.id}>
                {i + 1}. <b>{LETTERS[q.correctIndex]}</b>
              </span>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
