import { imageUrl } from "@/lib/images";

export function QuestionImage({ name, className = "" }: { name: string; className?: string }) {
  const src = imageUrl(name);
  return (
    <a href={src} target="_blank" rel="noreferrer" title="Mở ảnh gốc" className="block w-fit">
      {/* eslint-disable-next-line @next/next/no-img-element -- user-uploaded image of unknown size */}
      <img
        src={src}
        alt="Hình minh hoạ câu hỏi"
        className={`max-h-80 max-w-full rounded-xl border border-zinc-200 object-contain dark:border-zinc-800 ${className}`}
      />
    </a>
  );
}
