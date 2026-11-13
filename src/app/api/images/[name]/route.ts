import fs from "node:fs/promises";
import path from "node:path";
import { uploadsDir } from "@/db";
import { IMAGE_NAME_RE, IMAGE_TYPES } from "@/lib/images";

const MIME_BY_EXT = Object.fromEntries(Object.entries(IMAGE_TYPES).map(([mime, ext]) => [ext, mime]));

export async function GET(_req: Request, ctx: RouteContext<"/api/images/[name]">) {
  const { name } = await ctx.params;
  if (!IMAGE_NAME_RE.test(name)) return new Response("Not found", { status: 404 });
  try {
    const data = await fs.readFile(path.join(/*turbopackIgnore: true*/ uploadsDir, name));
    return new Response(data, {
      headers: {
        "Content-Type": MIME_BY_EXT[name.split(".").pop()!],
        // Names are random and files are never overwritten, so cache forever.
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
