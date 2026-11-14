// Exposes a minimal, explicit API to the web page (window.quizMarker).
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("quizMarker", {
  exportPdf: (path, fileName) => ipcRenderer.invoke("export-pdf", { path, fileName }),
});
