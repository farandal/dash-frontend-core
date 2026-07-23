# @dashadmin/dash-interfaces

> Shared TypeScript interfaces and domain types.

## Overview

Central type definitions (e.g. `IClient`, `IPackage`, `ITag`, delivery and tracking types) shared across packages to keep contracts consistent.

## Key exports & features

- Domain interfaces (`IClient`, `IPackage`, `ITag`, …)
- Type-only package (no runtime code)

## Installation

```bash
# From the public npm registry
npm install @dashadmin/dash-interfaces

# Or the local Verdaccio registry (unscoped)
npm install dash-interfaces --registry http://localhost:4873
```

## Development & publishing

This package is part of the **dash-frontend-core** monorepo. See [`DEVELOPMENT.md`](../../DEVELOPMENT.md) for the source-modification workflow, local Verdaccio publishing, npm publishing and version-bump policy.

---

_Part of the [Dash Framework](https://www.npmjs.com/org/dashadmin) · `@dashadmin` scope._
