# Quick Start Guide

## Prerequisites
- Node.js 20+
- pnpm 8+
- Git

## 1. Setup
```bash
pnpm install
pnpm build
pnpm check-env
```

## 2. Creating a New Core
Refer to `directives/create-core.md`.
Basically:
1. Create `packages/cores/core-name`
2. Implement `CoreDefinition`
3. export `setup()` function

## 3. Creating a New App
Refer to `directives/create-app.md`.
Basically:
1. Create `packages/apps/app-name`
2. Import `Runtime`
3. Load cores and start!

## 4. Useful Commands
- `pnpm sync-rules`: Update agent knowledge
- `pnpm build`: Build entire monorepo
- `pnpm format`: Prettify code

## 5. Troubleshooting
If the build fails:
- Run `pnpm clean`
- Delete `node_modules`
- Re-run `pnpm install`
