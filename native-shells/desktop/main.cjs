const { app, BrowserWindow, shell } = require("electron");
const path = require("node:path");
const release = require(path.join(__dirname, "pwa-release.json"));

const isAllowedUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && release.allowedHosts.includes(url.host);
  } catch {
    return false;
  }
};

function createWindow() {
  const window = new BrowserWindow({
    minWidth: 360,
    minHeight: 640,
    width: 1280,
    height: 900,
    title: release.applicationName,
    backgroundColor: "#ffffff",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, "preload.cjs"),
    },
  });

  window.webContents.setWindowOpenHandler(({ url }) => {
    if (!isAllowedUrl(url)) shell.openExternal(url);
    return { action: "deny" };
  });
  window.webContents.on("will-navigate", (event, url) => {
    if (!isAllowedUrl(url)) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });
  window.loadURL(release.pwaUrl);
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
