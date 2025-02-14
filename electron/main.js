const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs').promises;
require('@electron/remote/main').initialize();
const path = require('path');
const isDev = process.env.NODE_ENV !== 'production';

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    titleBarStyle: 'hidden',
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

ipcMain.handle('read-file', async (event, filePath) => {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return content;
  } catch (error) {
    console.error('Error reading file:', error);
    return null;
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Workspace handling
let currentWorkspace = null;

ipcMain.handle('get-workspace', async () => {
  return currentWorkspace;
});

ipcMain.on('set-workspace', (event, workspace) => {
  currentWorkspace = workspace;
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

const ignore = require('ignore');

async function getAllFiles(dir) {
  const files = [];
  let ig;

  try {
    const gitignoreContent = await fs.readFile(path.join(dir, '.gitignore'), 'utf8');
    ig = ignore().add(gitignoreContent);
  } catch (error) {
    ig = ignore();
  }

  // Always ignore node_modules
  ig.add('node_modules');

  async function traverse(currentDir) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      const relativePath = path.relative(dir, fullPath);

      // Skip if path matches gitignore patterns
      if (ig.ignores(relativePath)) {
        continue;
      }

      if (entry.isDirectory()) {
        await traverse(fullPath);
      } else {
        files.push({
          path: fullPath,
          name: entry.name,
          relativePath
        });
      }
    }
  }

  await traverse(dir);
  return files;
}

ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });

  if (!result.canceled) {
    const dirPath = result.filePaths[0];
    try {
      const files = await getAllFiles(dirPath);
      return {
        path: dirPath,
        files: files
      };
    } catch (error) {
      console.error('Error reading directory:', error);
      return null;
    }
  }
  return null;
});
