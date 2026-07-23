# Dash Frontend Core — Development & Publishing Guide

This monorepo hosts the **`@dashadmin`** package family: the reusable building blocks
(`dash-admin`, `dash-components`, `dash-auto-admin`, …) that power Dash-based admin
applications such as **KitchnTabs**.

It is consumed two different ways, and understanding that split is the key to the whole
workflow:

| Consumer | How it consumes `dash-*` | Registry |
| --- | --- | --- |
| **`dash-frontend-core` apps** (`apps/dash-app`, `dash-web`, `dash-system`) | Directly from **workspace source** (`src/`) — instant HMR | none (workspace) |
| **`kitchntabs-frontend-refactored`** | From **published packages** | Verdaccio (local, unscoped `dash-*`) or npm (`@dashadmin/*`) |

> **Golden rule:** inside this repo you edit *source*. Consumers outside this repo get
> *published artifacts*. A source change is only visible to `kitchntabs` **after you
> republish**.

---

## 1. Repository topology

```mermaid
flowchart TB
    subgraph core["dash-frontend-core (this repo)"]
        direction TB
        subgraph pkgs["packages/*  (source of truth)"]
            utils["dash-utils"]
            consts["dash-constants"]
            iface["dash-interfaces"]
            styles["dash-styles"]
            dialog["dash-dialog"]
            modal["dash-modal"]
            auth["dash-auth"]
            axios["dash-axios-hook"]
            state["dash-admin-state"]
            auto["dash-auto-admin"]
            comps["dash-components"]
            admin["dash-admin"]
            common["dash-app-common"]
            boiler["dash-boilerplate"]
        end
        subgraph apps["apps/*  (dev harness)"]
            dashapp["dash-app"]
            dashweb["dash-web"]
            dashsys["dash-system"]
        end
        apps -. "workspace:* + devSrcAliases (HMR)" .-> pkgs
    end

    subgraph registries["Publish targets"]
        verd["Verdaccio<br/>localhost:4873<br/>(unscoped dash-*)"]
        npm["npm registry<br/>(@dashadmin/*)"]
    end

    subgraph kt["kitchntabs-frontend-refactored"]
        ktapps["apps/*"]
    end

    pkgs -- "pnpm publish:local" --> verd
    pkgs -- "node scripts/publish-npm.mjs" --> npm
    verd --> ktapps
    npm --> ktapps
```

### Internal dependency layers

```mermaid
flowchart LR
    consts["dash-constants"] --> utils["dash-utils"]
    consts --> auto["dash-auto-admin"]
    consts --> axios["dash-axios-hook"]
    consts --> state["dash-admin-state"]
    utils --> axios
    utils --> state
    utils --> comps["dash-components"]
    dialog["dash-dialog"] --> auto
    dialog --> modal["dash-modal"]
    styles["dash-styles"] --> modal
    auto --> state
    auto --> comps
    auto --> modal
    state --> admin["dash-admin"]
    axios --> admin
    auth["dash-auth"] --> admin
    comps --> admin
    dialog --> admin
    modal --> admin
    admin --> common["dash-app-common"]
    admin --> boiler["dash-boilerplate"]
```

Foundation packages (`dash-constants`, `dash-utils`, `dash-interfaces`, `dash-styles`)
have **no internal deps** and change the most rarely. `dash-admin` sits on top and
re-exports the assembled application.

---

## 2. Development workflow (editing source)

Inside `dash-frontend-core`, apps resolve every `dash-*` import to its **`src/`
directory** via the `devSrcAliases` mechanism in each app's `vite.config.mts`. This means:

- ✅ Edit any file under `packages/<pkg>/src/**` → the running dev app hot-reloads
  instantly. **No build, no publish, no version bump.**
- The alias regex `^pkgname(?:/src)?(/.*)?$` maps both `dash-x/foo` and
  `dash-x/src/foo` onto the real source, so deep imports work.

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant Src as packages/*/src
    participant Vite as Vite dev server (devSrcAliases)
    participant App as Browser (dash-app / dash-web / dash-system)

    Dev->>Src: edit component / hook
    Src-->>Vite: file change event
    Vite->>Vite: resolve dash-* → src/ (alias)
    Vite-->>App: HMR patch
    App-->>Dev: instant update (no rebuild)
```

### Start a dev app

```bash
# from repo root
pnpm dev:web:dash-system:development   # dash-system app
pnpm dev:web:dash-web:development       # dash-web app
pnpm dev:web:dash-app:development       # dash-app app
```

### When do I need to build?

You only build packages when producing **published artifacts** (`dist/`) — i.e. right
before publishing to Verdaccio or npm. Day-to-day source editing never needs it.

```bash
pnpm build:packages            # build every packages/* (dist/)
pnpm --filter dash-admin run build   # build a single package
```

> ⚠️ **Two-instance context bug reminder.** Never let a built file in `dist/` import
> back into `../src/` (a wrong relative path that escapes `dist/`). It loads a *second*
> copy of a React context (e.g. `DashThemeContext`) and you get
> `useDashThemeContext must be used within a DashThemeProvider`. Keep `dist` imports
> inside `dist`.

---

## 3. Source modifications → propagating to consumers

```mermaid
flowchart TD
    edit["Edit packages/*/src/**"] --> q1{Consumer?}
    q1 -- "dash-frontend-core app" --> hmr["Nothing to do —<br/>HMR picks it up"]
    q1 -- "kitchntabs-frontend-refactored" --> bump["Bump version"]
    bump --> build["pnpm build:packages"]
    build --> q2{Which registry?}
    q2 -- "Local QA" --> verd["pnpm publish:local<br/>(Verdaccio, unscoped)"]
    q2 -- "Release" --> npmpub["node scripts/publish-npm.mjs<br/>(@dashadmin/*)"]
    verd --> ktinstall["cd kitchntabs-frontend-refactored<br/>pnpm install"]
    npmpub --> ktinstall
    ktinstall --> done["Consumer sees changes"]
```

The essential rule: **a change is invisible to `kitchntabs` until you (1) bump, (2)
build, (3) publish, and (4) re-install in the consumer.**

---

## 4. Version bump policy

All `dash-*` packages are published under a **single, aligned version** (the publish
scripts default to one flat version). Follow **semver against consumer impact**:

```mermaid
flowchart TD
    change["What changed?"] --> t1{Breaking API<br/>or removed export?}
    t1 -- yes --> major["MAJOR<br/>x.0.0"]
    t1 -- no --> t2{New export /<br/>new feature?}
    t2 -- yes --> minor["MINOR<br/>1.x.0"]
    t2 -- no --> patch["PATCH<br/>1.3.x<br/>(bugfix, dep fix, internal refactor)"]
```

| Change type | Bump | Example |
| --- | --- | --- |
| Bugfix, dependency cleanup, internal refactor | **patch** | the `react-beautiful-dnd → @hello-pangea/dnd` peer cleanup |
| New component / hook / prop (backwards-compatible) | **minor** | added a new `DashAuto*` view |
| Removed/renamed export, changed prop contract | **major** | renamed `DASHAdmin` prop |

> Removing a **required peer dependency** (as we did with `react-beautiful-dnd`) only
> *relaxes* the consumer's constraints, so it is **non-breaking → patch**.

Set the version at publish time:

```bash
# Verdaccio — edit each package.json version, or let publish:local use current
# npm — pass the flat version explicitly:
NPM_TOKEN=*** node scripts/publish-npm.mjs --version 1.3.27
```

---

## 5. Publishing to **Verdaccio** (local QA registry)

Verdaccio hosts **unscoped** `dash-*` packages at `http://localhost:4873`, which is what
`kitchntabs-frontend-refactored` installs during local QA.

```bash
pnpm publish:local
```

What `scripts/publish-local.sh` does, in order:

```mermaid
flowchart TD
    a["Start / ensure Verdaccio<br/>(localhost:4873)"] --> b["Authenticate<br/>(admin / admin123)"]
    b --> c["pnpm turbo build --filter=./packages/*"]
    c --> d{"build ok?"}
    d -- no --> stop["Abort (registry untouched)"]
    d -- yes --> e["Clear dash-* from<br/>Verdaccio storage"]
    e --> f["pnpm -r publish --registry localhost:4873"]
    f --> g["Done"]
```

> **Why clear storage before publishing?** Verdaccio 6 rejects re-publishing the same
> version with `409 Conflict` and has **no `allow_republish` flag**. Deleting the
> `dash-*` folders from storage lets the same version be re-published. The clear step
> runs **after** a successful build so a build failure never leaves the registry empty
> (which previously caused `ERR_PNPM_UNPUBLISHED_PKG`).

Consume in the app:

```bash
cd ../kitchntabs-frontend-refactored
pnpm install          # pulls dash-* from Verdaccio
```

Verify what's published:

```bash
curl http://localhost:4873/-/v1/search?text=dash
```

---

## 6. Publishing to **npm** (`@dashadmin` scope, public release)

`scripts/publish-npm.mjs` transforms each unscoped `dash-*` package into
`@dashadmin/dash-*` on the fly, rewrites internal cross-deps to the scoped name, bumps
the version, publishes, and restores the original `package.json`.

```mermaid
flowchart TD
    a["NPM_TOKEN in env"] --> b["Write temp .npmrc<br/>(auth, cleaned on exit)"]
    b --> c["npm whoami (verify token)"]
    c --> d["Unpublish existing<br/>@dashadmin/* (best-effort)"]
    d --> e["pnpm turbo build --filter=./packages/*"]
    e --> loop["For each package:"]
    loop --> t1["name → @dashadmin/name"]
    t1 --> t2["version → --version"]
    t2 --> t3["rewrite dash-* deps → @dashadmin/dash-*"]
    t3 --> t4["npm publish --access public"]
    t4 --> t5["restore original package.json"]
    t5 --> loop
    loop --> done["Summary"]
```

Run it:

```bash
# dry run first — prints what would publish, no writes to npm
NPM_TOKEN=*** node scripts/publish-npm.mjs --version 1.3.27 --dry-run

# real publish
NPM_TOKEN=*** node scripts/publish-npm.mjs --version 1.3.27
```

> 🔒 **Token hygiene.** The token lives only in the `NPM_TOKEN` env var and a temp
> `.npmrc` that is deleted on exit — never commit it. **Rotate immediately any token that
> has been pasted into chat, logs, or shell history.**

Consume in the app:

```bash
cd ../kitchntabs-frontend-refactored
pnpm install          # pulls @dashadmin/* from npm
```

---

## 7. Worked example — the `react-beautiful-dnd` → `@hello-pangea/dnd` migration

This is the exact change that motivated this guide, end to end.

**Problem.** `pnpm install` in `kitchntabs-frontend-refactored` failed with
`Conflicting peer dependencies: react-beautiful-dnd`. Five published packages
(`dash-components`, `dash-dialog`, `dash-info`, `dash-auto-admin`, `dash-modal`) declared
a stale `"react-beautiful-dnd": "latest"` **peer dependency** — a now-deprecated library
that could not be satisfied. The actual source code had already moved to
`@hello-pangea/dnd`.

**Fix applied to source (this repo):**

1. Removed the `react-beautiful-dnd` peer from all 5 `packages/*/package.json`.
2. `dash-components` already bundles `@hello-pangea/dnd@^18.0.1` in `dependencies`
   (self-contained `SortableDataGrid`) — nothing else needed.
3. Aligned `react-18-beautiful-dnd-grid` to `@hello-pangea/dnd@^18.0.1`.
4. Relaxed the `react-custom-scrollbars-2` peer from `"latest"` → `"^4.5.0"` to clear
   the related unmet-peer warnings.

No component code changed — `@hello-pangea/dnd` is an API-compatible drop-in.

**Because this only *removes* a required peer, it is non-breaking → PATCH bump.**

**Republish (do both registries):**

```bash
# 1. Build + publish to Verdaccio for local QA
pnpm publish:local

# 2. QA the consumer
cd ../kitchntabs-frontend-refactored && pnpm install && pnpm dev   # conflict gone

# 3. Release to npm at the next patch
cd ../dash-frontend-core
NPM_TOKEN=*** node scripts/publish-npm.mjs --version 1.3.27
```

---

## 8. Command quick-reference

| Task | Command |
| --- | --- |
| Run a dev app (source HMR) | `pnpm dev:web:dash-system:development` |
| Build all packages | `pnpm build:packages` |
| Build one package | `pnpm --filter dash-admin run build` |
| Publish → Verdaccio (local) | `pnpm publish:local` |
| Publish → npm (scoped) | `NPM_TOKEN=*** node scripts/publish-npm.mjs --version X.Y.Z` |
| npm dry-run | `NPM_TOKEN=*** node scripts/publish-npm.mjs --version X.Y.Z --dry-run` |
| Search Verdaccio | `curl http://localhost:4873/-/v1/search?text=dash` |
| Re-install in consumer | `cd ../kitchntabs-frontend-refactored && pnpm install` |

---

_Each package also carries its own `README.md` describing its role. See the
[`@dashadmin` org on npm](https://www.npmjs.com/org/dashadmin)._
