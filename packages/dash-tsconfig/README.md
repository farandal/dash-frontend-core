# @dashadmin/dash-tsconfig

> Shared TypeScript base configuration.

## Overview

Base `tsconfig` extended by every package and app in the workspace.

## Key exports & features

- Reusable `tsconfig` base

## Installation

```bash
# From the public npm registry
npm install @dashadmin/dash-tsconfig

# Or the local Verdaccio registry (unscoped)
npm install dash-tsconfig --registry http://localhost:4873
```

## Usage

```json
// tsconfig.json
{ "extends": "dash-tsconfig/tsconfig.json" }
```

## Development & publishing

This package is part of the **dash-frontend-core** monorepo. See [`DEVELOPMENT.md`](../../DEVELOPMENT.md) for the source-modification workflow, local Verdaccio publishing, npm publishing and version-bump policy.

---

_Part of the [Dash Framework](https://www.npmjs.com/org/dashadmin) · `@dashadmin` scope._
