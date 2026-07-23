# @dashadmin/dash-boilerplate

> Bootstrap helpers to stand up a new Dash application fast.

## Overview

Application initialisation utilities and layout/panel scaffolding (`AppInitializationResult`, `LayoutDimensions`, `PanelSettingsOptions`) that assemble the admin, state, auth and data layers into a working app.

## Key exports & features

- App initialisation flow
- Layout dimension helpers
- Panel/settings scaffolding

## Installation

```bash
# From the public npm registry
npm install @dashadmin/dash-boilerplate

# Or the local Verdaccio registry (unscoped)
npm install dash-boilerplate --registry http://localhost:4873
```

## Internal Dash dependencies

`@dashadmin/dash-admin`, `@dashadmin/dash-admin-state`, `@dashadmin/dash-auth`, `@dashadmin/dash-auto-admin`, `@dashadmin/dash-axios-hook`, `@dashadmin/dash-constants`, `@dashadmin/dash-utils`

## Development & publishing

This package is part of the **dash-frontend-core** monorepo. See [`DEVELOPMENT.md`](../../DEVELOPMENT.md) for the source-modification workflow, local Verdaccio publishing, npm publishing and version-bump policy.

---

_Part of the [Dash Framework](https://www.npmjs.com/org/dashadmin) · `@dashadmin` scope._
