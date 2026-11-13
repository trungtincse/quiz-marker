import { createEmptyQuizAction } from "@/app/actions";

export default function NewQuizPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Tạo đề mới</h1>
      <form action={createEmptyQuizAction} className="card space-y-3">
        <label className="label" htmlFor="title">Tiêu đề</label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input id="title" name="title" required autoFocus placeholder="VD: Ôn tập chương 1" className="input" />
          <button className="btn-primary shrink-0">Tạo và soạn câu hỏi</button>
        </div>
      </form>
    </div>
  );
}
