import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { uploadsDir } from "@/db";
import { IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/lib/images";

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return Response.json({ error: "Không có file." }, { status: 400 });

  const ext = IMAGE_TYPES[file.type];
  if (!ext) return Response.json({ error: "Chỉ hỗ trợ PNG, JPG, GIF, WEBP." }, { status: 400 });
  if (file.size > MAX_IMAGE_BYTES) return Response.json({ error: "Ảnh tối đa 5MB." }, { status: 400 });

  const name = `${randomUUID()}.${ext}`;
  await fs.writeFile(path.join(/*turbopackIgnore: true*/ uploadsDir, name), Buffer.from(await file.arrayBuffer()));
  return Response.json({ name });
}
