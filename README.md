# quiz-marker

Ứng dụng cá nhân để tự soạn câu hỏi trắc nghiệm, làm bài và lưu lại toàn bộ câu trả lời.

## Tech stack

- **Next.js 16** (App Router, Server Actions) + **React 19** + **TypeScript**
- **Tailwind CSS v4**
- **SQLite** (`better-sqlite3`) + **Drizzle ORM**: dữ liệu nằm trong file `data/quiz.db`

## Chạy

```bash
npm install
npm run dev     # http://localhost:3000
```

## Chức năng

- **Soạn / sửa đề**: thêm, xoá, sắp xếp câu hỏi; 2–6 phương án; chọn đáp án đúng; đính kèm ảnh cho câu hỏi (chọn file hoặc dán Ctrl+V, PNG/JPG/GIF/WEBP, tối đa 5MB).
- **Làm bài**: đáp án đúng không được gửi xuống trình duyệt, chấm điểm trên server.
- **Lịch sử**: mỗi lượt làm lưu lại từng câu trả lời, kèm bản chụp câu hỏi lúc làm (sửa đề sau không ảnh hưởng lịch sử). Xem lại đúng/sai và giải thích.

## Cấu trúc

```
src/
  db/schema.ts        bảng quizzes, questions, attempts, answers
  db/index.ts         kết nối SQLite, tự tạo bảng lần đầu chạy
  lib/data.ts         truy vấn đọc
  app/api/images/     upload và trả ảnh (lưu trong data/uploads/)
  app/actions.ts      server actions: tạo/sửa/xoá đề, nộp bài
  app/...             các trang: /, /quizzes/new, /quizzes/[id], /edit, /take, /attempts/[id]
```

Sao lưu dữ liệu: copy cả thư mục `data/` (gồm `quiz.db` và ảnh trong `uploads/`).
