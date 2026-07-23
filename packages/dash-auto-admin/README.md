# @dashadmin/dash-auto-admin

> Schema-driven auto-generation of admin CRUD views.

## Overview

Generates List, Create, Edit, Drawer and dynamic Form layouts (groups, tabs) from resource configuration, dramatically reducing hand-written CRUD screens.

## Key exports & features

- `DashAutoList`, `DashAutoCreate`, `DashAutoEdit`, `DashAutoDrawer`
- `DashAutoAdminForm` with form groups, tabs and layouts
- Config-driven fields and validation

## Installation

```bash
# From the public npm registry
npm install @dashadmin/dash-auto-admin

# Or the local Verdaccio registry (unscoped)
npm install dash-auto-admin --registry http://localhost:4873
```

## Internal Dash dependencies

`@dashadmin/dash-constants`, `@dashadmin/dash-dialog`

## Development & publishing

This package is part of the **dash-frontend-core** monorepo. See [`DEVELOPMENT.md`](../../DEVELOPMENT.md) for the source-modification workflow, local Verdaccio publishing, npm publishing and version-bump policy.

---

_Part of the [Dash Framework](https://www.npmjs.com/org/dashadmin) · `@dashadmin` scope._
