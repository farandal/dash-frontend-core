# @dashadmin/dash-admin

> The Dash admin application shell — a batteries-included, react-admin based admin UI.

## Overview

Top-level composition package that wires together state, auth, data providers, layout, theming and the auto-admin engine into a single mountable `DASHAdmin` component. This is the main entry point most applications consume.

## Key exports & features

- `DASHAdmin` root component (resources, routing, layout, providers)
- Built-in `DashThemeProvider` / `useDashThemeContext` theming context
- Auth flows: login, recover password, verify account, change password
- Integrates `dash-admin-state`, `dash-auto-admin`, `dash-auth`, `dash-components`, `dash-dialog`, `dash-modal`

## Installation

```bash
# From the public npm registry
npm install @dashadmin/dash-admin

# Or the local Verdaccio registry (unscoped)
npm install dash-admin --registry http://localhost:4873
```

## Internal Dash dependencies

`@dashadmin/dash-admin-state`, `@dashadmin/dash-auto-admin`, `@dashadmin/dash-constants`, `@dashadmin/dash-dialog`, `@dashadmin/dash-styles`, `@dashadmin/dash-modal`, `@dashadmin/dash-components`, `@dashadmin/dash-axios-hook`, `@dashadmin/dash-utils`, `@dashadmin/dash-auth`

## Development & publishing

This package is part of the **dash-frontend-core** monorepo. See [`DEVELOPMENT.md`](../../DEVELOPMENT.md) for the source-modification workflow, local Verdaccio publishing, npm publishing and version-bump policy.

---

_Part of the [Dash Framework](https://www.npmjs.com/org/dashadmin) · `@dashadmin` scope._
