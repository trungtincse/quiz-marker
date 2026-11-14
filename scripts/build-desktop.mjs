// Builds Next.js in standalone mode and stages it, together with the Electron
// entry point, into dist-desktop/app. Run with `npm run desktop` or
// `npm run desktop:dist`.
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const out = path.join(root, "dist-desktop", "app");
const standalone = path.join(root, ".next", "standalone");
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));

execSync("npm run build", { cwd: root, stdio: "inherit" });

fs.rmSync(path.join(root, "dist-desktop"), { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

const server = path.join(out, "server");
fs.cpSync(standalone, server, { recursive: true });
fs.cpSync(path.join(root, ".next", "static"), path.join(server, ".next", "static"), { recursive: true });
if (fs.existsSync(path.join(root, "public"))) {
  fs.cpSync(path.join(root, "public"), path.join(server, "public"), { recursive: true });
}
// Output tracing copies the local ./data folder; never ship personal data.
fs.rmSync(path.join(server, "data"), { recursive: true, force: true });

for (const file of ["main.cjs", "preload.cjs"]) {
  fs.copyFileSync(path.join(root, "desktop", file), path.join(out, file));
}
fs.copyFileSync(path.join(root, "desktop", "icon.png"), path.join(out, "icon.png"));
fs.writeFileSync(
  path.join(out, "package.json"),
  JSON.stringify(
    {
      name: pkg.name,
      productName: "Quiz Marker",
      version: pkg.version,
      description: "Soạn câu hỏi trắc nghiệm, làm bài và lưu lại kết quả",
      main: "main.cjs",
      desktopName: "quiz-marker.desktop",
      author: "Quiz Marker",
    },
    null,
    2,
  ),
);

console.log(`\nDesktop app staged in ${path.relative(root, out)}`);
