import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin", "vietnamese"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Quiz Marker",
  description: "Tự soạn câu hỏi trắc nghiệm và lưu lại kết quả làm bài",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
          <nav className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <span className="grid size-7 place-items-center rounded-lg bg-violet-600 text-sm text-white">Q</span>
              Quiz Marker
            </Link>
            <Link href="/quizzes/new" className="btn-primary">
              + Tạo đề
            </Link>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
