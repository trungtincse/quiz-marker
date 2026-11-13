import Link from "next/link";

export default function NotFound() {
  return (
    <div className="card text-center">
      <p className="mb-4">Không tìm thấy nội dung này.</p>
      <Link href="/" className="btn-ghost">Về trang chủ</Link>
    </div>
  );
}
