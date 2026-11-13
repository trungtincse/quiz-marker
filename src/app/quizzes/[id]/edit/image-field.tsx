"use client";

import { useRef } from "react";
import { QuestionImage } from "@/components/question-image";
import { IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/lib/images";

export async function uploadImage(file: File): Promise<string> {
  if (!IMAGE_TYPES[file.type]) throw new Error("Chỉ hỗ trợ ảnh PNG, JPG, GIF, WEBP.");
  if (file.size > MAX_IMAGE_BYTES) throw new Error("Ảnh tối đa 5MB.");
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/images", { method: "POST", body });
  const json = (await res.json().catch(() => ({}))) as { name?: string; error?: string };
  if (!res.ok || !json.name) throw new Error(json.error ?? "Tải ảnh thất bại.");
  return json.name;
}

export function ImageField({
  image,
  onPick,
  onRemove,
}: {
  image: string | null;
  onPick: (file: File) => void;
  onRemove: () => void;
}) {
  const input = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-2">
      {image && <QuestionImage name={image} />}
      <div className="flex gap-3 text-sm">
        <button type="button" className="text-violet-600 hover:underline" onClick={() => input.current?.click()}>
          {image ? "Đổi ảnh" : "🖼️ Thêm ảnh"}
        </button>
        {image && (
          <button type="button" className="text-red-600 hover:underline" onClick={onRemove}>
            Xoá ảnh
          </button>
        )}
      </div>
      <input
        ref={input}
        type="file"
        accept={Object.keys(IMAGE_TYPES).join(",")}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onPick(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
