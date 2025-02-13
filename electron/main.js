const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs').promises;
require('@electron/remote/main').initialize();
const path = require('path');
const isDev = process.env.NODE_ENV !== 'production';

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      webSecurity: false
    }
  });

  require("@electron/remote/main").enable(mainWindow.webContents);

  // Load the index.html from a url in development
  // and from the dist folder in production
  if (isDev) {
    mainWindow.loadURL('http://localhost:3006');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// File handling IPC events
ipcMain.handle('open-file-dialog', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections']
  });

  if (!result.canceled) {
    const files = await Promise.all(
      result.filePaths.map(async (filePath) => {
        const content = await fs.readFile(filePath, 'utf8');
        return {
          path: filePath,
          name: path.basename(filePath),
          content
        };
      })
    );
    return files;
  }
  return [];
});
