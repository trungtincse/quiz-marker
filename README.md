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

## Desktop app (Electron)

Đóng gói thành app cài đặt:

```bash
npm run desktop:dist
```

File cài nằm trong `dist-desktop/release/`:

- `quiz-marker_<version>_amd64.deb`: cài bằng `sudo apt install ./dist-desktop/release/quiz-marker_*.deb`, sau đó mở **Quiz Marker** từ menu ứng dụng.
- `Quiz Marker-<version>.AppImage`: file chạy trực tiếp, không cần cài.

Dữ liệu của bản desktop nằm ở `~/.config/Quiz Marker/` (`quiz.db` + `uploads/`), tách riêng với `data/` của bản web. Muốn chuyển dữ liệu cũ sang thì copy `data/quiz.db` và `data/uploads/` vào thư mục đó khi app đang tắt.

Chạy thử bản desktop không cần đóng gói: `npm run desktop`. Trên Ubuntu 24+ cần cấp quyền sandbox cho Electron một lần:

```bash
sudo chown root:root node_modules/electron/dist/chrome-sandbox
sudo chmod 4755 node_modules/electron/dist/chrome-sandbox
```

Build cho Windows/macOS: chạy `npm run desktop:dist` trên máy Windows/macOS.

## Chức năng

- **Soạn / sửa đề**: thêm, xoá, sắp xếp câu hỏi; 1–6 phương án (phương án để trống tự bỏ khi lưu); chọn đáp án đúng; đính kèm ảnh cho câu hỏi (chọn file hoặc dán Ctrl+V, PNG/JPG/GIF/WEBP, tối đa 5MB).
- **Làm bài**: đáp án đúng không được gửi xuống trình duyệt, chấm điểm trên server.
- **Xuất PDF**: bản đề trống (có ô họ tên/điểm để in ra làm bài) hoặc bản có đáp án (tô đáp án đúng, giải thích, bảng đáp án). Desktop app lưu thẳng ra file PDF; bản web mở trang in → chọn "Lưu thành PDF".
- **Lịch sử**: mỗi lượt làm lưu lại từng câu trả lời, kèm bản chụp câu hỏi lúc làm (sửa đề sau không ảnh hưởng lịch sử). Xem lại đúng/sai và giải thích.

## Cấu trúc

```
desktop/main.cjs      Electron: chạy server Next.js ẩn, mở cửa sổ app, xuất PDF
desktop/preload.cjs   cầu nối window.quizMarker.exportPdf cho trang web
scripts/build-desktop.mjs  build Next standalone + gom file cho Electron
electron-builder.yml  cấu hình đóng gói (.deb, AppImage, Windows, macOS)
src/
  db/schema.ts        bảng quizzes, questions, attempts, answers
  db/index.ts         kết nối SQLite, tự tạo bảng lần đầu chạy
  lib/data.ts         truy vấn đọc
  app/api/images/     upload và trả ảnh (lưu trong data/uploads/)
  app/actions.ts      server actions: tạo/sửa/xoá đề, nộp bài
  app/...             các trang: /, /quizzes/new, /quizzes/[id], /edit, /take, /attempts/[id]
```

Sao lưu dữ liệu: copy cả thư mục `data/` (gồm `quiz.db` và ảnh trong `uploads/`).
