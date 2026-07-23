# Local Package Development (HMR without publishing)

How to edit the workspace packages (`packages/*`) **in place** and see the changes
live in the **`dash-system`** app — no Verdaccio, no `npm publish`, no version bumps.

---

## 1. Mental model

This is a [pnpm workspace](./../pnpm-workspace.yaml) + [Turborepo](./../turbo.json) monorepo:

```
dash-frontend-core/
├── apps/
│   └── dash-system/          ← the app you run (Vite)
└── packages/
    ├── dash-admin/           ← workspace packages, consumed by the app
    ├── dash-admin-state/        as  "dash-admin": "workspace:*"
    ├── dash-utils/
    └── … (the `dash-*` framework packages + react-18-beautiful-dnd-grid)
```

The app depends on packages with the `workspace:*` protocol, so pnpm **symlinks**
`node_modules/dash-admin` → `packages/dash-admin`. You are always editing the real
source; there is no copy step.

> **Scope:** this repo holds only the reusable **`dash-*`** framework packages. The
> DashAdmin-specific **`kt-*`** packages (`kt-utils`, `kt-pages`, `kt-ecommerce`,
> `kt-cashcount`, `kt-kiosk`) live in the **`dash-frontend-refactored`** repo as
> its own workspace packages; that repo consumes the `dash-*` packages from Verdaccio.

### The one thing you must understand: two resolution targets

Each package is wired so that **runtime** and **type-checking** resolve to *different*
places. This is deliberate — it lets the same `package.json` serve both local dev and
published (Verdaccio/npm) consumers.

| Concern | Mechanism | Resolves to |
|---|---|---|
| **Runtime** (Vite/Rollup/esbuild) | `exports` field | `dist/**` (built output) |
| **Types** (`tsc`, IDE) | `types` + `typesVersions` | `src/**` (original source) |

Consequence: **the app executes the built `dist/`, not your `src/`.** So when you edit
a package's `src`, you must get that change into `dist` for the running app to see it.
There are two ways to do that — pick one (Workflow A or B below).

> Why not just point runtime at `src` too? Because published packages ship `dist` and
> must work in plain Node/other bundlers. Keeping `exports → dist` means "what you test
> is what you publish." Workflow B below gives you `src` HMR *for local dev only*,
> without weakening the published contract.

---

## 2. Quick start

```bash
# from the repo root: dash-frontend-core/

# 1) install (first time, or after dependency changes)
pnpm install

# 2) build all packages once (produces every packages/*/dist)
pnpm build:packages

# 3) run the app
pnpm dev:web:dash-system:development
#    → http://localhost:3000
```

`dev:web:dash-system:development` does two things: generates the app's
`build_config.json` (env/mode), then `cd apps/dash-system && pnpm dev` (Vite).

At this point the app runs against the **built** packages. To make package edits show
up live, use one of the workflows below.

---

## 3. Workflow A — watch mode (works today, zero config)

Keep package `dist/` continuously rebuilt while you edit. Vite then HMRs from the
updated `dist`.

Open **two terminals** at the repo root:

```bash
# Terminal 1 — rebuild any package whose src changes
pnpm turbo watch build

# Terminal 2 — run the app
pnpm dev:web:dash-system:development
```

Flow when you save `packages/dash-admin/src/foo.tsx`:

```
edit src  →  turbo/tsup rebuilds dash-admin/dist  →  Vite sees dist change  →  HMR
```

- **Pro:** zero config; exactly mirrors what gets published; works for every package
  including the asset ones (`dash-styles` LESS, `dash-modal` MP3, `dash-icons`).
- **Con:** a rebuild step sits between your save and the HMR update (usually well under
  a second per package, but not instant), and it's a full module replace rather than
  fine-grained React Fast Refresh.

To watch just the packages you're touching (faster):

```bash
pnpm turbo watch build --filter=dash-admin --filter=dash-admin-state
```

---

## 4. Workflow B — direct `src` HMR (instant, opt-in)

For the tightest loop (instant React Fast Refresh, no rebuild), make **Vite** read the
package `src` directly in dev by aliasing the bare package names. This only affects the
dev server; `exports → dist` still governs production builds and publishing.

Add this to [`apps/dash-system/vite.config.mts`](../apps/dash-system/vite.config.mts)
inside the returned config's `resolve.alias` (it already has `@app` / `@packages`):

```ts
// --- dev-only: resolve workspace packages to their src for instant HMR ---
// Asset packages (dash-styles/.less, dash-modal/.mp3, dash-icons) are intentionally
// left on their built dist so their bundled assets resolve correctly.
const SRC_HMR_PACKAGES = [
  "dash-admin", "dash-admin-state", "dash-app-common", "dash-auto-admin",
  "dash-axios-hook", "dash-utils", "dash-constants", "dash-dialog",
  "dash-components", "dash-auth", "dash-boilerplate", "dash-info",
  "dash-interfaces",
];

const devSrcAliases = isDevelopment
  ? SRC_HMR_PACKAGES.map((name) => ({
      // matches "pkg" and "pkg/sub/path", routes to packages/pkg/src/...
      find: new RegExp(`^${name}(/.*)?$`),
      replacement: path.resolve(__dirname, `../../packages/${name}/src$1`),
    }))
  : [];
```

…then spread it into `resolve.alias` (Vite accepts an **array** of `{find,replacement}`):

```ts
resolve: {
  alias: [
    { find: "@app", replacement: path.resolve(currentPath, "./src") },
    { find: "@packages", replacement: path.resolve(currentPath, "../../packages") },
    ...devSrcAliases,
  ],
  dedupe: ["react", "react-dom", "query-string"],
},
```

Flow when you save `packages/dash-admin/src/foo.tsx`:

```
edit src  →  Vite serves src directly  →  React Fast Refresh (instant, state preserved)
```

- **Pro:** instant, true Fast Refresh, no build step, no second terminal.
- **Con:** dev runs `src` while prod runs `dist` — so **always do a
  `pnpm build:packages` + `pnpm build:web:dash-system:production` before shipping** to
  catch anything that only breaks in the built output (see §7).

> Both workflows can coexist: use B day-to-day, and run A's `turbo watch build` (or a
> one-off `pnpm build:packages`) before a production build to validate the real `dist`.

---

## 5. Importing from packages (what resolves, and how)

Package builds use **`bundle: false`** for the "mirror" packages, so `dist/` mirrors
`src/` file-for-file. You can import three ways:

```ts
// 1) Root / barrel  — from the package's index
import { dashStorage } from "dash-utils";

// 2) Deep subpath (clean form, preferred)
import { applyPlatformBodyClasses } from "dash-utils/utils/platformDetection";
import DASHAuthenticationService from "dash-admin/contexts/auth/DASHAuthenticationService";

// 3) Directory import (resolves to that folder's index)
import configureStore from "dash-admin-state/redux/store"; // → src/redux/store/index.tsx
```

A `pkg/src/...` form also resolves (a compatibility alias exists for it), but **prefer
the clean `pkg/...` form** in app code.

### Adding a NEW deep import to a package

If you import a brand-new file or folder from a package and it fails to resolve:

1. The file must exist under the package's `src/` (it will after the next build appear
   under `dist/` too).
2. **New directory imports** (`pkg/some/folder`) need the folder to contain an
   `index.ts`/`index.tsx`. The export map and `typesVersions` already pattern-match new
   files automatically — but directory entries are generated per package, so after
   adding a new `index`-bearing folder, re-run:
   ```bash
   node scripts/mirror-packages.mjs      # regenerates exports + typesVersions
   pnpm turbo build --filter=<that-package>
   ```

---

## 6. Common tasks

```bash
# Build one package
pnpm turbo build --filter=dash-admin

# Build every package
pnpm build:packages          # = pnpm -r --filter './packages/*' run build

# Force a clean rebuild (ignore Turbo cache + Vite cache)
pnpm _build                  # rimraf .turbo/.vite then turbo build --force

# Type-check the app
cd apps/dash-system && npx tsc --noEmit

# Production build of the app (validates the real dist)
pnpm build:web:dash-system:production
```

---

## 7. Before you push / publish

Because dev *can* run `src` (Workflow B) while production runs `dist`, validate the
built output:

```bash
pnpm build:packages                       # rebuild all dist
pnpm build:web:dash-system:production     # app build against dist  → must pass
```

---

## 8. Publishing & re-publishing to Verdaccio (versioning)

Local HMR (Workflows A/B) **never** needs publishing. But **consumer repos** — e.g.
`dash-frontend-refactored` — install these packages from the Verdaccio registry
(`http://localhost:4873`). So whenever you change a package that a consumer uses, you must
**rebuild → bump → re-publish** it.

### Why you must bump the version every time

Verdaccio (like npm) is **immutable per version**. Re-publishing the same version fails:

```
npm error 409 Conflict - this package is already present
```

Earlier runs may also have left **higher "phantom" versions** in the registry, so bump
*past the highest existing version*, not just `current + 1`:

```bash
# see what versions already exist
curl -s http://localhost:4873/dash-utils | python3 -c "import sys,json;print(list(json.load(sys.stdin)['versions']))"
```

### Build → bump → publish

```bash
# 1) rebuild the changed package(s) — dist must be current
pnpm turbo build --filter=dash-utils

# 2) bump "version" in packages/dash-utils/package.json (past the registry max)

# 3) publish with PNPM (not npm) to Verdaccio
cd packages/dash-utils && pnpm publish --registry http://localhost:4873 --no-git-checks --access public
```

> Use **`pnpm publish`**, never `npm publish`. A package whose `package.json` has
> `"dash-admin-state": "workspace:*"` would publish that literal string with `npm`
> (broken for registry consumers). `pnpm publish` rewrites each `workspace:*` to the
> sibling's **current** version at publish time.

To publish several at once (build runs first via the task graph):

```bash
pnpm build:packages
pnpm -r --filter './packages/**' publish --registry http://localhost:4873 --no-git-checks --access public
```

### Cross-package coherence — bump dependents too

Because `pnpm publish` stamps `workspace:*` deps with the sibling's *current* version, if
you bump `dash-utils` but a dependent (`dash-admin`) still references the old one, a
consumer can end up with **two copies** of `dash-utils` (and CJS/ESM "no known
conditions" / "does not provide an export" errors). When in doubt, **bump and re-publish
all changed packages together**, and pin them on the consumer side (below).

### Mirror vs single packages

- **Mirror** packages (`bundle:false`, dir mirrors `src/`, ESM-only, string `exports`,
  `dts:false`) — most `dash-*`. Re-run `node scripts/mirror-packages.mjs` if you changed
  their structure, then build + publish.
- **Single-bundled** packages (`dash-auth`, `dash-boilerplate`, `dash-styles`,
  `dash-modal`, `dash-icons`, `dash-info`, `dash-interfaces`) — one bundled entry,
  `"type": "module"` so `dist/index.js` is **ESM**. If a consumer hits *"does not provide
  an export named X"* from one of these, its registry copy is a **stale CJS build** from
  before the ESM config — rebuild and re-publish it.

### Updating a consumer to the new version

pnpm pins resolutions and **caches the registry `latest` tag**, so on the consumer side:

```bash
# 1) point at the new version — PIN it (and/or use pnpm.overrides) in package.json:
#      "dependencies": { "dash-utils": "0.0.3" }
#      "pnpm": { "overrides": { "dash-utils": "0.0.3" } }   // forces ONE version tree-wide
# 2) bust pnpm's stale metadata cache + lockfile:
rm -rf ~/Library/Caches/pnpm/metadata
rm -f pnpm-lock.yaml
pnpm install
# 3) clear Vite's optimize cache so it re-bundles the new code:
rm -rf apps/*/node_modules/.vite
```

> **Pin exact versions**, don't rely on `"latest"` — pnpm's cached `latest` tag resolves
> stale copies. `pnpm.overrides` in the consumer root is the single source of truth that
> forces one coherent version of each `dash-*` package across the whole dependency tree.

---

## 9. Troubleshooting

**`ReferenceError: React is not defined` (or a stale crash) in the browser**
The package `dist` is out of date or the dev server cached old deps. Rebuild and clear
Vite's optimize cache:
```bash
pnpm build:packages
rm -rf apps/dash-system/node_modules/.vite
# restart the dev server
```
(The package builds use the **automatic** JSX runtime; if you ever see classic
`React.createElement` crashes from a package, confirm its `tsup.config.ts` sets
`options.jsx = 'automatic'`.)

**IDE shows `Cannot find module 'pkg/...'` but the CLI build passes**
The TS language server cached an old `package.json`. Run **"TypeScript: Restart TS
Server"** (Cmd/Ctrl+Shift+P). Type resolution is driven by each package's `types` +
`typesVersions` (→ `src`); a fresh `tsc --noEmit` is the source of truth.

**Edited a package's `src` but the app didn't update**
You're on Workflow A without the watcher running (start `pnpm turbo watch build`), or on
plain `dev` with neither workflow — the app is serving the old `dist`. Use Workflow A or
B from §3–4.

**`Two output files share the same path` during a package build**
A folder has two files with the same basename and different extensions (e.g.
`useThing.ts` and `useThing.tsx`). With `bundle:false` both map to one `dist/*.js`.
Rename or remove one.

**A package's `dist/index.js` "does not export X"**
For a single-bundled package, only what its `src/index.ts` barrel re-exports is
reachable from the root import. Add the missing re-export to the barrel, or import it
from a deep subpath (mirror packages only).

**In a CONSUMER repo: `does not provide an export named 'X'` / `No known conditions for
'.'`** from a `dash-*` package
The registry copy is **stale** — a CJS build (or old `exports`) published before the
current ESM config. Rebuild and **re-publish** that package with a version bump, then
update the consumer (pin version + `rm -rf ~/Library/Caches/pnpm/metadata` + reinstall).
See §8. If it's a *duplicate-version* mismatch, force one version via `pnpm.overrides` in
the consumer root.

---

## 10. Reference

- [`scripts/mirror-packages.mjs`](../scripts/mirror-packages.mjs) — generates each
  package's `exports`, `typesVersions`, `tsup.config.ts`. Re-run after adding new
  index-bearing folders; idempotent.
- **Publishing** (§8): `pnpm turbo build --filter=<pkg>` → bump `version` → `pnpm publish
  --registry http://localhost:4873`. Consumers pin the new version + clear pnpm metadata
  cache + reinstall.
- [`turbo.json`](../turbo.json) — `build` task (others depend on it).
- [`apps/dash-system/vite.config.mts`](../apps/dash-system/vite.config.mts) — app dev
  server, aliases, optimizeDeps.
- Package build config: each `packages/*/tsup.config.ts`
  (`bundle:false` + `jsx:'automatic'` for mirror packages; single bundled entry for
  `dash-auth`, `dash-boilerplate`, `dash-styles`, `dash-modal`, `dash-icons`, …).
