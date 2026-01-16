# How to Create an App

**Role**: Application Developer
**Trigger**: New feature request or product idea

## Step 1: Scaffolding
- Create folder in `packages/apps/`
- Initialize `package.json` with dependencies on needed cores
- Configure `tsconfig.json`

## Step 2: Entry Point
- Initialize `Runtime`
- Load required Cores
- Call `runtime.start()`

## Step 3: Business Logic
- Use services via `runtime.getService<T>()`
- Handle missing services gracefully
- implement application specific logic

## Step 4: Run & Test
- usage `pnpm dev` to run locally
- Verify logs output
