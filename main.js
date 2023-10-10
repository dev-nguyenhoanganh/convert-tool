const { app, BrowserWindow } = require("electron");
const { dialog, ipcMain } = require("electron");
const path = require("node:path");

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 800,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      enableRemoteModule: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // win.openDevTools();

  win.loadFile("./src/index.html");

  ipcMain.handle("dialog:openDirectory", async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
      properties: ["openDirectory"],
    });
    if (canceled) {
      return;
    } else {
      return filePaths[0];
    }
  });

  ipcMain.handle("dialog:showMessageBoxSync", async (_, type, message) => {
    await dialog.showMessageBox(win, { type, message });
  });
};

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// try {
//   require("electron-reloader")(module);
// } catch (_) {}

// electron-packager "C:\Web Developer\Side Project\convert-tool" convert-tool --platform=win32 --arch=x64
