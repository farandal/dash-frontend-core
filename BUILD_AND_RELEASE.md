# KitchnTabs Build & Release Guide

Build and release instructions for `kitchntabs-app` (and, where noted, `kitchntabs-mall`), grounded in the actual `pnpm` scripts, `build-service.js` / `build-python-service.js`, and `electron-builder.config.js` in this repo — not idealized/assumed commands.

**System Tray**: `kt_status_tray` (PyQt6 + pystray) ships alongside `kt_service`/`print_service`/`tts_service` on macOS, Windows, Linux x64, and Linux arm64. **Not available on the Debian Buster (armv7l) target** — see [Platform Support Matrix](#platform-support-matrix).

---

## Table of Contents

1. [Platform Support Matrix](#platform-support-matrix)
2. [Prerequisites](#prerequisites)
3. [How the Build Pipeline Actually Works](#how-the-build-pipeline-actually-works)
4. [Building the Python Services](#building-the-python-services)
5. [macOS: Build & Test](#macos-build--test)
6. [Windows: Build & Test](#windows-build--test)
7. [Debian / Raspberry Pi (multiarch): Build & Test](#debian--raspberry-pi-multiarch-build--test)
8. [Publishing a Real Release](#publishing-a-real-release)
9. [Troubleshooting](#troubleshooting)
10. [Tray Architecture Reference](#tray-architecture-reference)

---

## Platform Support Matrix

| Target | Python | kt_status_tray? | Built via | Notes |
|---|---|---|---|---|
| macOS (arm64) | 3.9 (`pw_env`, native) | ✅ | `build-service.js` (native) | Must build **on** an Apple Silicon Mac |
| macOS (x64) | 3.9 (`pw_env`, native) | ✅ | `build-service.js` (native) | Must build **on** an Intel Mac (or Rosetta) |
| Windows (x64) | 3.9 (`pw_env`, native) | ✅ | `build-service.js` (native) | Must build **on** Windows |
| Linux x64 | 3.11 (Docker) | ✅ | `build-docker.js` (Docker) | manylinux wheels, low risk |
| Linux arm64 (Bookworm, Pi 4/5) | 3.11 (Docker) | ✅ | `build-docker.js` (Docker) | PyQt6 has official aarch64 wheels |
| Linux armv7l (Bullseye, Pi 3) | 3.9 (Docker) | ⚠️ best-effort | `build-docker.js` (Docker) | PyQt6 has no official PyPI wheel for 32-bit ARM; installed from piwheels if available. If the wheel is missing, the Docker build **still succeeds** and just skips the tray — `kt_service` is unaffected. |
| Linux armv7l-buster (Pi 3, old OS) | 3.9 (Docker) | ❌ not supported | `build-docker.js` (Docker) | Qt6 requires GLIBC ≥ 2.31; Buster ships 2.28. Tray is intentionally omitted; `kt_service` runs headless. |

**Key implication**: PyInstaller does not cross-compile across CPU architecture. Native builds (macOS/Windows/Linux-x64 without Docker) only produce a binary for the machine you run them on.

---

## Prerequisites

```bash
node >= 18.0.0
pnpm >= 8.0.0 (repo pins pnpm@9.15.0 via packageManager field)
git

# macOS / Windows / Linux-x64 native Python service build:
python3.9        # Must be exactly pw_env's interpreter - see below
docker + buildx  # Only needed for Linux arm64 / armv7l cross-builds
```

```bash
cd ~/DASH-FRAMEWORK/kitchntabs-frontend-refactored
pnpm install
```

---

## How the Build Pipeline Actually Works

Every `pnpm release:electron:...` script runs the same shape of pipeline:

```
pnpm config:electron:kitchntabs-app:<mode>   # writes build_config.json (CUSTOM_MODE, TARGET_TYPE, etc.)
  → turbo build --filter=kitchntabs-app       # builds the React app
  → node build-python-service.js              # builds/verifies Python service binaries (see below)
  → electron-icon-builder                     # generates app icons
  → vite build -c electron.vite.config.mts    # builds the Electron main/preload process
  → node build-electron.js --config electron-builder.config.js [--macos|--win|--linux deb] [--arch] [--publish always]
```

`build-python-service.js` (in this repo) decides HOW to get Python binaries:

- **Native platform** (macOS, Windows, or you're running on Linux x64): calls `../dash-python-service/build-service.js`, which uses a **Python 3.9 virtualenv named exactly `pw_env`** inside `dash-python-service/` and runs PyInstaller directly. Output goes to `dash-python-service/kt_service/` (yes, that directory is named `kt_service` but holds all 4 binaries: `kt_service`, `print_service`, `tts_service`, `kt_status_tray`).
- **Linux ARM** (only when the CLI args include `--linux`/`--armv7l`/`--arm64`/`deb`): calls `../dash-python-service/build-docker.js`, which cross-compiles via Docker/QEMU. Output goes to `dash-python-service/kt_service_builds/<arch>/`.
- It hashes `dash-python-service/src/**`, `requirements.txt`, etc. and **skips rebuilding** if nothing changed and the expected binaries already exist. Use `FORCE_PYTHON_REBUILD=true` to force a rebuild.

`electron-builder.config.js` then packages whichever binaries exist:
- **macOS/Windows**: binaries come straight from `dash-python-service/kt_service/` via `extraResources`.
- **Linux**: an `afterPack` hook copies architecture-specific binaries from `dash-python-service/kt_service_builds/<arch>/`.

Packaged output always lands in **`release/`** (set by `directories.output` in `electron-builder.config.js`) — not `output/kitchntabs/...`.

---

## Building the Python Services

### One-time setup: create `pw_env` (macOS / Windows / Linux-x64 native)

```bash
cd ~/DASH-FRAMEWORK/dash-python-service

# macOS / Linux
python3.9 -m venv pw_env
source ./pw_env/bin/activate
pip install -r requirements.txt   # now includes PyQt6==6.7.1 + pystray==0.19.5
deactivate

# Windows (PowerShell)
python -m venv pw_env
.\pw_env\Scripts\Activate.ps1
pip install -r requirements.txt
deactivate
```

You only need to do this once per machine/architecture. After that, `node build-python-service.js` (which every `pnpm release:electron:...` script calls automatically) will build/rebuild the 4 binaries as needed — **you do not need to invoke PyInstaller by hand**.

> ⚠️ **Apple Silicon vs Intel**: `pw_env` built on an M-series Mac produces **arm64** binaries only. To also produce x64 binaries you need a second `pw_env` built under a Rosetta (`arch -x86_64`) shell, or a real Intel Mac. Same logic applies in reverse.

### Standalone Python-only build (skip the Electron app entirely)

`dash-python-service/package.json` exposes its own scripts around `build-service.js`, useful when you just want to sanity-check the Python side (e.g. rerun `kt_status_tray` by hand after a code change) without doing a full Electron repackage each time:

```bash
cd ~/DASH-FRAMEWORK/dash-python-service
npm run build:prod   # node build-service.js --custom-mode=kitchntabs.prod --service=all
```

Builds natively for whatever machine you run it on (macOS binaries on a Mac, Windows binaries on Windows) into `dash-python-service/kt_service/`. Requires `pw_env` to already exist with `requirements.txt` installed (see above) — it does **not** create the venv for you.

> ⚠️ **`--service=all` (and `build:kt` / `build:print` / `build:tts`) don't actually do anything different** — `build-service.js` never reads that flag. Every invocation always builds all 4 binaries (`kt_service`, `print_service`, `tts_service`, `kt_status_tray`) in one pass. Don't rely on `build:kt` etc. to build only one service.

> This only produces the Python binaries — it does not build or package the Electron app. The `pnpm release:electron:...` scripts in `kitchntabs-frontend-refactored` already call this same pipeline automatically (via `build-python-service.js` → `build-service.js`) as one of their build steps, so you don't need to run this separately as part of a normal release build.

### Linux ARM (Docker cross-compile)

No manual setup needed beyond Docker + buildx — `build-python-service.js` invokes `dash-python-service/build-docker.js` automatically whenever the electron-builder CLI args target Linux (`--linux deb --arm64` etc.). To pre-build manually:

```bash
cd ~/DASH-FRAMEWORK/dash-python-service
node build-docker.js --arch=arm64 --config=prod    # Raspberry Pi 4/5 (Bookworm)
node build-docker.js --arch=armv7l --config=prod   # Raspberry Pi 3 (Bullseye) - tray best-effort
node build-docker.js --arch=armv7l-buster --config=prod  # Legacy Pi OS - no tray
```

---

## macOS: Build & Test

There is **no universal/dmg build configured** — `electron-builder.config.js` only defines a `zip` target for mac, built separately per architecture (`--arm64` or `--x64`).

### Local test build (no publish — use this first)

```bash
cd ~/DASH-FRAMEWORK/kitchntabs-frontend-refactored

# One-time: create pw_env with PyQt6 (see above), matching your Mac's chip

# Apple Silicon:
pnpm release:electron:kitchntabs-app:macos:arm64:local

# Intel:
pnpm release:electron:kitchntabs-app:macos:x64:local
```

Output: `release/*.zip` (unzip it to get `KitchenTabs.app`).

> These `:local` scripts were added specifically for local testing — the pre-existing `:production` scripts (below) publish straight to a private S3 bucket and require AWS credentials.

### Test it

```bash
cd release
unzip *-arm64.zip -d /tmp/kt-test   # adjust filename to what was produced
open /tmp/kt-test/*.app
```

Verify:
- App launches and connects.
- A tray icon appears in the macOS menu bar (green = connected, red = disconnected).
- Right-click → **Show Status** shows an overlay with uptime, message/print/TTS counts.
- Right-click → **Settings** toggles TTS/Print.
- If you also build/launch `kitchntabs-mall` at the same time (see note below), only **one** tray icon should exist, and it should survive closing either app individually.

> **kitchntabs-mall on macOS**: `package.json` currently defines no `macos` release script for `kitchntabs-mall` (only a Debian arm64 one exists). If you need a mall build on Mac, add a `release:electron:kitchntabs-mall:macos:...` script mirroring the `kitchntabs-app` ones above — same `electron-builder.config.js`, just swap the `config:electron:kitchntabs-mall:*` config step and `turbo build --filter=kitchntabs-mall`.

### Diagnostics

```bash
tail -f ~/Library/Logs/kitchntabs-app/main.log
cat ~/.kt_service/status.json        # what kt_service is exporting
cat ~/.kt_service/tray_apps.json     # which apps are registered + tray PID
```

Look for these lines confirming the tray path resolved correctly:
```
[TrayCoordinator] Resolved tray binary path: /path/to/.../Resources/python-service/kt_status_tray
[TrayCoordinator] Initialized - tray PID: 12345
```

---

## Windows: Build & Test

The Windows `nsis` target is only added to the `win:` config block **when the build itself runs on `process.platform === 'win32'`** — there is no cross-build path from mac/Linux to a Windows installer in this config. Build on an actual Windows machine (or a Windows CI runner).

```powershell
cd DASH-FRAMEWORK\kitchntabs-frontend-refactored

# One-time: create pw_env (Windows section above), pip install -r requirements.txt

# Dev/test build (no publish):
pnpm release:electron:kitchntabs-app:development:win

# Production build (no publish either - this script has no --publish flag):
pnpm release:electron:kitchntabs-app:production:win
```

Output: `release/*.exe` (NSIS installer).

Verify after install:
- `kt_status_tray.exe` runs without a console window popping up (it's built with `--windowed`).
- Tray icon appears in the system tray.
- Check `%APPDATA%\kitchntabs-app\logs\main.log` and `%APPDATA%\Local\kitchntabs\.kt_service\status.json`.

---

## Debian / Raspberry Pi (multiarch): Build & Test

### Local test builds (no publish)

```bash
cd ~/DASH-FRAMEWORK/kitchntabs-frontend-refactored

# Both arm64 + armv7l in one .deb bundle, dev config, no publish:
pnpm release:electron:kitchntabs-app:debian:dev

# arm64 only, dev config, no publish:
pnpm release:electron:kitchntabs-app:debian:arm64:development

# x64 only, dev config, no publish:
pnpm release:electron:kitchntabs-app:debian:amd64:development
```

Output: `release/*-arm64.deb`, `release/*-armv7l.deb`, etc. (per `artifactName: '${productName}-${version}-${arch}.${ext}'`).

Install and test on the Pi:
```bash
sudo dpkg -i kitchntabs-*-arm64.deb
kitchntabs   # symlinked by scripts/after-install.sh
cat ~/.kt_service/status.json
ps aux | grep kt_status_tray   # absent on armv7l-buster - expected
```

---

## Publishing a Real Release

Scripts **without** `:dev`/`:development`/`:local` in the name run with `AWS_PROFILE=kitchntabs` and `--publish always`, uploading straight to the private `kitchntabs-releases` S3 bucket (see `publish` block in `electron-builder.config.js`). Only run these when you actually intend to ship and have that AWS profile configured:

```bash
# macOS
pnpm release:electron:kitchntabs-app:macos:arm64:production
pnpm release:electron:kitchntabs-app:macos:x64:production

# Debian (arm64+armv7l bundle)
pnpm release:electron:kitchntabs-app:debian

# Debian (single arch)
pnpm release:electron:kitchntabs-app:debian:arm64
pnpm release:electron:kitchntabs-app:debian:amd64

# Windows has no auto-publish script; production:win only builds locally.
```

---

## Troubleshooting

**"pw_env not found"**
```
❌ Virtual environment not found at: .../dash-python-service/pw_env
```
Create it exactly as shown in [Building the Python Services](#building-the-python-services) — the name `pw_env` and Python 3.9 are hardcoded in `build-service.js`.

**Tray binary missing at runtime ("Tray binary not found at ...")**
- Confirm `dash-python-service/kt_service/kt_status_tray` exists after a native build, or `dash-python-service/kt_service_builds/<arch>/kt_status_tray` after a Docker build.
- Confirm `electron-builder.config.js`'s `extraResources`/`afterPack` actually copied it into the packaged app — check `release/.../Resources/python-service/` (mac) or `resources/python-service/` (win/linux) after unpacking.

**armv7l build succeeds but no tray in the .deb**
Expected sometimes — PyQt6 has no official PyPI wheel for 32-bit ARM. The Dockerfile installs it best-effort from piwheels and silently skips the tray step if unavailable, without failing the rest of the build. Check the Docker build log for `PyQt6/kt_status_tray unavailable for armv7l - skipping tray`.

**armv7l-buster has no tray at all**
By design — Qt6 needs GLIBC ≥ 2.31, Buster has 2.28. `kt_service`/`print_service`/`tts_service` are unaffected and run headless.

**Multiple tray icons appear**
`TrayCoordinator` (in each app's `electron/main/TrayCoordinator.ts`) should prevent this via `~/.kt_service/tray_apps.json` + a `mkdir`-based mutex. If you see duplicates, check that both apps are pointing at the same `~/.kt_service/` directory (same OS user) and inspect `tray_apps.json` for stale entries from a crashed app.

**macOS Gatekeeper blocks the app**
The `:local`/`:production` builds have `notarize: false`. Right-click → Open the first time, or strip quarantine manually:
```bash
xattr -cr /path/to/KitchenTabs.app
```

---

## Tray Architecture Reference

```
App 1 (kitchntabs-app)                    App 2 (kitchntabs-mall)
  TrayCoordinator.initialize()              TrayCoordinator.initialize()
  → registers in tray_apps.json             → registers in tray_apps.json
  → spawns kt_status_tray (first app)       → sees tray already running, reuses it
        │                                          │
        └──────────────┬───────────────────────────┘
                        ▼
              kt_status_tray (PyQt6 GUI)
              - polls ~/.kt_service/status.json every 1s
              - green/red tray icon, overlay, settings dialog
                        ▲
                        │ exported every 5s
              kt_service (StatusManager)
```

Key runtime files (all under `~/.kt_service/`, or `%APPDATA%\Local\kitchntabs\.kt_service\` on Windows):
- `status.json` — live kt_service state (connected, uptime, metrics)
- `tray_apps.json` — registered app PIDs + the shared tray's PID
- `.tray_mutex/` — mkdir-based lock directory for atomic registration

Path resolution in each app's `electron/main/index.ts` mirrors the existing `PYTHON_SERVICE_PATH_PROD` pattern exactly:
- Packaged: `<resourcesPath>/python-service/kt_status_tray[.exe]`
- Dev (unpackaged): `<appPath>/../../../dash-python-service/kt_service/kt_status_tray`
