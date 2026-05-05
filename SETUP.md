# dash-frontend — Setup Guide

This is a **pnpm monorepo** (Turborepo) with the following apps:

| App | Path | Purpose |
|-----|------|---------|
| `fablab-os` | `apps/fablab-os` | Main desktop/Electron app |
| `fablab-os-app` | `apps/fablab-os-app` | Web app variant |
| `fablab-os-web` | `apps/fablab-os-web` | Public web build |
| `fablab-os-system` | `apps/fablab-os-system` | System/admin panel |

---

## Requirements

- **Node.js** `>=20.19.0`
- **pnpm** `>=9`
- **Windows only:** WSL2 required

---

## 1. Install Node.js via nvm

### macOS / Linux

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

# Load nvm in current shell
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Install and use the required Node version
nvm install 20.19.0
nvm use 20.19.0

# Verify
node -v  # should print v20.19.0 (or newer)
```

To make it permanent, add the `export NVM_DIR` block above to your `~/.zshrc` or `~/.bashrc` (the installer does this automatically — open a new terminal or run `source ~/.zshrc`).

### Windows

Run inside WSL:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc
nvm install 20.19.0
nvm use 20.19.0
```

---

## 2. Install pnpm

pnpm must be installed **per Node version**. After switching Node versions, reinstall pnpm:

```bash
npm install -g pnpm
```

---

## 3. Install dependencies

```bash
pnpm install
```

> **Note:** If you see `Unsupported engine` warnings, your Node version is below `20.19.0`. Go back to step 1.

---

## 4. Initialize a new domain app (first time only)

```bash
pnpm new
# or directly:
chmod +x ./new.sh && sh ./new.sh
```

This copies the `apps/demo` template into `apps/dash` and sets up the domain app.

---

## 5. Run in development

| Target | Command |
|--------|---------|
| Web (fablab-os-app, local) | `pnpm dev:web:fablab-os-app:local` |
| Web (fablab-os-app, dev) | `pnpm dev:web:fablab-os-app:development` |
| Web (fablab-os-web, dev) | `pnpm dev:web:fablab-os-web:development` |
| Web (fablab-os-system, dev) | `pnpm dev:web:fablab-os-system:development` |
| Electron (dev) | `pnpm dev:electron:fablab-os:development` |
| Android (dev) | `pnpm dev:android:fablab-os:development` |

---

## Troubleshooting

### Stale/broken install

```bash
rm -rf node_modules pnpm-lock.yaml
pnpm store prune
pnpm install
```

### Native binaries fail after switching Node versions

Reinstall to rebuild native packages (`sharp`, `@napi-rs/canvas`, etc.):

```bash
pnpm install
```

### Windows: file lock errors during install

Close all terminals, editors, and Node processes. Open Task Manager and end any `node.exe` processes, then retry. If it persists, restart the machine.

### pnpm not found after `nvm use`

pnpm is installed per Node version. Run `npm install -g pnpm` again after switching versions.
