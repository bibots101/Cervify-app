const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

let pythonProcess = null;
let loadingWindow = null;

function createWindow() {
    const win = new BrowserWindow({
        width: 1000,
        height: 700,
        icon:"public/icon.ico",
        webPreferences: {
        contextIsolation: true,
        webSecurity: false,
        allowRunningInsecureContent: true,
        nodeIntegration: true,
        }
    });
    const frontendPath = path.join(__dirname, 'frontend_dist/index.html');
    win.loadFile(frontendPath);
}

function createLoadingWindow() {
    loadingWindow = new BrowserWindow({
        width: 375,
        height: 188,
        icon:"public/icon.ico",
        frame: false,
        resizable: false,
        show: false,
        transparent: false,
        alwaysOnTop: true,
        webPreferences: {
        contextIsolation: true
        }
    });
    const loadingPath = path.join(__dirname, 'loading.html');
    loadingWindow.loadFile(loadingPath);
    loadingWindow.once("ready-to-show", () => {
        loadingWindow.show();
    });
}

function waitForBackend(url, timeout = 100000, interval = 1000) {
    return new Promise((resolve, reject) => {
        const start = Date.now();

        const check = () => {
        http.get(url, (res) => {
            if (res.statusCode === 200) {
            resolve(true);
            } else {
            retry();
            }
        }).on('error', retry);
        };

        const retry = () => {
        if (Date.now() - start > timeout) {
            reject(new Error('Backend failed to start in time'));
        } else {
            setTimeout(check, interval);
        }
        };

        check();
    });
}

function killBackendProcess() {
    if (pythonProcess) {
        try {
        process.kill(-pythonProcess.pid);
        console.log("Backend process terminated.");
        } catch (err) {
        console.error("Error killing backend process:", err);
        }
    }
}

app.whenReady().then(async () => {
  const isDev = !app.isPackaged;
  const execPath = isDev
    ? path.join(__dirname, '../../backend/dist/Cervify_backend/Cervify_backend.exe')
    : path.join(path.dirname(process.execPath), 'backend', 'Cervify_backend.exe');
  console.log(process.resourcesPath)

  pythonProcess = spawn(execPath, [], { detached: false });

  createLoadingWindow();


  pythonProcess.stdout.on('data', (data) => {
    console.log(`Backend: ${data}`);
  });

  pythonProcess.stderr.on("data", (data) => {
    console.error(`Backend Error: ${data}`);
  });
  
  pythonProcess.on('error', (err) => {
    console.error('Failed to start backend:', err);
  });
  pythonProcess.unref();
  try {
    console.log('Waiting for backend...');
    await waitForBackend('http://127.0.0.1:8000/health');
    if (loadingWindow) {
      loadingWindow.close();
    }

    createWindow();
  } catch (err) {
    console.error('Backend did not start in time:', err);
    if (loadingWindow) {
      loadingWindow.loadURL(`data:text/html,<h2 style="color:red;text-align:center;">Failed to start backend.</h2>`);
    }
  }
});

app.on('before-quit', () => {
  killBackendProcess();
});

app.on('window-all-closed', () => {
  killBackendProcess();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
