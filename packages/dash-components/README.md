# @dashadmin/dash-components

> Shared React component library for Dash UIs.

## Overview

Reusable presentational and interactive components used across Dash apps, including the drag-and-drop `SortableDataGrid` (powered by `@hello-pangea/dnd`), the notifications centre and the `useDraggable` hook.

## Key exports & features

- `SortableDataGrid` (drag-and-drop reordering via `@hello-pangea/dnd`)
- Notifications centre
- `useDraggable` hook and assorted shared widgets

## Installation

```bash
# From the public npm registry
npm install @dashadmin/dash-components

# Or the local Verdaccio registry (unscoped)
npm install dash-components --registry http://localhost:4873
```

## Internal Dash dependencies

`@dashadmin/dash-auto-admin`, `@dashadmin/dash-dialog`, `@dashadmin/dash-modal`, `@dashadmin/dash-utils`, `@dashadmin/dash-auth`, `@dashadmin/dash-admin-state`, `@dashadmin/dash-axios-hook`, `@dashadmin/dash-interfaces`, `@dashadmin/dash-styles`

## Development & publishing

This package is part of the **dash-frontend-core** monorepo. See [`DEVELOPMENT.md`](../../DEVELOPMENT.md) for the source-modification workflow, local Verdaccio publishing, npm publishing and version-bump policy.

---

_Part of the [Dash Framework](https://www.npmjs.com/org/dashadmin) · `@dashadmin` scope._
