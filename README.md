# Cervify — Desktop CAD App

Cervify is an Electron-based desktop application that bundles a compiled backend to provide a computer-aided diagnosis (CAD) system for early detection of cervical cancer. This repository contains the Electron frontend/packaging module and a small launcher that starts the bundled backend executable.

**Project**: Desktop Electron wrapper that launches a prebuilt backend and serves the frontend UI from `frontend_dist`.

**Key features**
- Lightweight Electron shell and loader UI while backend starts
- Bundles a compiled backend executable for offline desktop distribution
- Ready-to-package with `electron-builder` (Windows, macOS, Linux icons configured)

**Prerequisites**
- Node.js (v16 or later recommended)
- npm (or yarn)
- A compiled backend executable built by the backend project (Cervify_backend). In development the launcher expects the backend at `../../backend/dist/Cervify_backend/Cervify_backend.exe`.

**Installation (development)**
1. Clone this repository and open the project folder.
2. Install dependencies:

```bash
npm install
```

3. Make sure the backend executable exists at the path expected by the launcher while developing:

- Dev path: `../../backend/dist/Cervify_backend/Cervify_backend.exe` (relative to this Electron project)

If you don't have the backend built yet, build the backend project first (see backend repo instructions).

**Run (development)**

```bash
npm start
```

This runs Electron and the local launcher will attempt to spawn the backend executable and poll `http://127.0.0.1:8000/health` until the backend is ready. A small `loading.html` window is shown while waiting.

**Packaging / Distribution**

This project uses `electron-builder` and includes packaging configuration in `package.json`. Relevant scripts:

- `npm run pack` — Build unpacked app directory
- `npm run dist` — Create distributable installers (platform-specific)

When packaging, the backend binary is included via the `build.extraFiles` config. By default the build manifest copies files from `../../backend/dist/Cervify_backend/` into the packaged app under a `backend` folder so the Electron launcher can find it at runtime.

Notes:
- Packagers place the packaged app's resources in a different location than development. The launcher implements logic to locate the bundled `backend/Cervify_backend.exe` when `app.isPackaged` is true.
- Ensure `public/icon.ico` (Windows) and the other icons are present — they are referenced by the build config.

**Project structure**
- `main.js` — Electron main process and launcher (spawns the backend, shows `loading.html`, opens main window)
- `loading.html` — Minimal loader UI displayed while backend starts
- `frontend_dist/` — Pre-built frontend static files (served to the main BrowserWindow)
- `public/` — Icons and extra public assets
- `package.json` — npm scripts and `electron-builder` configuration

For quick references see: [main.js](main.js) and [package.json](package.json).

**Troubleshooting**
- Backend not starting: verify the backend executable exists and is runnable. Check the console output where the Electron process logs backend stdout/stderr.
- Health endpoint failures: the launcher waits for `http://127.0.0.1:8000/health`. If your backend uses a different port or path, update `main.js` accordingly.
- Packaging errors: ensure `electron-builder` is installed (`npm install`) and that the backend build artifacts exist when running `npm run dist`.

**Contributing**
If you'd like to contribute improvements to the Electron wrapper, please open an issue or a PR. Useful contributions include packaging CI, cross-platform backend handling, and better updater support.

**Authors**
Wassim Lourimi and Yasmin Chlif

**License**
This repository uses the ISC license (see `package.json`).
