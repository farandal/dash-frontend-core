# @dashadmin/dash-eslint

> Shared ESLint configuration for Dash packages and apps.

## Overview

Centralised ESLint rules so every package in the monorepo lints consistently.

## Key exports & features

- Reusable ESLint config
- Consistent lint rules across the workspace

## Installation

```bash
# From the public npm registry
npm install @dashadmin/dash-eslint

# Or the local Verdaccio registry (unscoped)
npm install dash-eslint --registry http://localhost:4873
```

## Usage

```js
// .eslintrc.js
module.exports = { extends: ['dash-eslint'] };
```

## Development & publishing

This package is part of the **dash-frontend-core** monorepo. See [`DEVELOPMENT.md`](../../DEVELOPMENT.md) for the source-modification workflow, local Verdaccio publishing, npm publishing and version-bump policy.

---

_Part of the [Dash Framework](https://www.npmjs.com/org/dashadmin) · `@dashadmin` scope._
