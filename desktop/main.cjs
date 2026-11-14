// Electron entry point: runs the bundled Next.js server in a child process
// and shows it in a desktop window.
const { app, BrowserWindow, dialog, ipcMain, shell } = require("electron");
const { spawn } = require("node:child_process");
const fs = require("node:fs/promises");
const net = require("node:net");
const path = require("node:path");

let server;
let mainWindow;
let baseUrl;

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (!mainWindow) return;
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  });
  app.whenReady().then(main);
}

function freePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.once("error", reject);
    srv.listen(0, "127.0.0.1", () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });
}

async function waitForServer(url, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) throw new Error(`Server exited with code ${server.exitCode}`);
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 150));
  }
  throw new Error("Server did not start in time");
}

async function startServer() {
  const port = await freePort();
  const serverDir = app.isPackaged
    ? path.join(process.resourcesPath, "server")
    : path.join(__dirname, "server");

  server = spawn(process.execPath, [path.join(serverDir, "server.js")], {
    cwd: serverDir,
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: "1",
      NODE_ENV: "production",
      PORT: String(port),
      HOSTNAME: "127.0.0.1",
      NEXT_TELEMETRY_DISABLED: "1",
      // ~/.config/Quiz Marker on Linux, %APPDATA%\Quiz Marker on Windows
      DATABASE_PATH: path.join(app.getPath("userData"), "quiz.db"),
    },
    stdio: ["ignore", "inherit", "inherit"],
  });

  const url = `http://127.0.0.1:${port}`;
  await waitForServer(url);
  return url;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 850,
    minWidth: 400,
    minHeight: 500,
    title: "Quiz Marker",
    icon: path.join(__dirname, "icon.png"),
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, "preload.cjs"),
    },
  });
  mainWindow.once("ready-to-show", () => mainWindow.show());
  mainWindow.on("closed", () => (mainWindow = null));

  // Links inside the app (e.g. full-size images) open in a new app window;
  // anything external goes to the system browser.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith(baseUrl)) return { action: "allow", overrideBrowserWindowOptions: { autoHideMenuBar: true } };
    shell.openExternal(url);
    return { action: "deny" };
  });
  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (!url.startsWith(baseUrl)) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  mainWindow.loadURL(baseUrl);
}

// Renders a print page in a hidden window and saves it as a PDF file.
async function exportPdf(event, { path: pagePath, fileName }) {
  if (typeof pagePath !== "string" || !/^\/quizzes\/\d+\/print(\?answers=1)?$/.test(pagePath)) {
    throw new Error("Invalid page");
  }
  const safeName = String(fileName || "quiz").replace(/[\\/:*?"<>|]+/g, "-").trim().slice(0, 120) || "quiz";
  const { canceled, filePath } = await dialog.showSaveDialog(BrowserWindow.fromWebContents(event.sender), {
    defaultPath: path.join(app.getPath("documents"), `${safeName}.pdf`),
    filters: [{ name: "PDF", extensions: ["pdf"] }],
  });
  if (canceled || !filePath) return null;

  const win = new BrowserWindow({ show: false, webPreferences: { contextIsolation: true, sandbox: true } });
  try {
    await win.loadURL(baseUrl + pagePath);
    // Wait until the page content (streamed after the loading state), its images and fonts are in.
    await win.webContents.executeJavaScript(`new Promise((resolve) => {
      const check = () => {
        if (!document.querySelector("[data-print-ready]")) return setTimeout(check, 50);
        Promise.all(Array.from(document.images).map((img) => img.complete ? null :
          new Promise((r) => { img.addEventListener("load", r); img.addEventListener("error", r); })))
          .then(() => document.fonts.ready).then(() => resolve(true));
      };
      check();
    })`);
    const pdf = await win.webContents.printToPDF({ pageSize: "A4", printBackground: true, preferCSSPageSize: true });
    await fs.writeFile(filePath, pdf);
    return filePath;
  } finally {
    win.destroy();
  }
}

async function main() {
  ipcMain.handle("export-pdf", exportPdf);
  try {
    baseUrl = await startServer();
  } catch (err) {
    dialog.showErrorBox("Quiz Marker", `Không khởi động được: ${err.message}`);
    app.quit();
    return;
  }
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("quit", () => {
  if (server && server.exitCode === null) server.kill();
});
