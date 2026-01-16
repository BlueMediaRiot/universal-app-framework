# Universal App Framework - Agent Development Guide

## Build Commands

### Primary Commands

- `pnpm build` - Build all packages using Turborepo
- `pnpm dev` - Start development mode with watch
- `pnpm test` - Run tests across all packages
- `pnpm lint` - Run linting across all packages
- `pnpm format` - Format code with Prettier
- `pnpm clean` - Clean build artifacts

### Single Package Commands

Navigate to specific package directory first:

```bash
cd packages/cores/core-math
pnpm build     # Build single package
pnpm dev        # Watch mode for single package
```

### Environment Setup

- `pnpm check-env` - Verify development environment
- `pnpm sync-rules` - Sync directives to Antigravity rules

## Project Architecture

### Monorepo Structure

```
packages/
├── core-system/     # Runtime engine and framework core
├── cores/          # Reusable feature modules (core-{name})
└── apps/           # End-user applications (app-{name})
```

### Core Package Pattern

Each core follows this structure:

```
core-{name}/
├── src/
│   ├── index.ts      # Core definition export
│   ├── types.ts      # TypeScript interfaces
│   └── [service].ts  # Implementation
├── package.json
└── tsconfig.json
```

## Code Style Guidelines

### TypeScript Configuration

- Target: ES2020, Module: CommonJS, Strict mode enabled
- All packages export both CommonJS (`main`) and TypeScript declarations (`types`)
- Use esModuleInterop for module compatibility

### Import Patterns

```typescript
// Core system imports first
import { AppContext, CoreDefinition } from "@universal/core-system";

// Type imports
import type { IMathService } from "./types";

// Core/service imports
import { MathService } from "./math";
import { IMathService } from "./types";
```

### Naming Conventions

- **Cores**: `core-{name}` (e.g., `core-math`, `core-logger`)
- **Apps**: `app-{name}` (e.g., `app-example`)
- **Services**: PascalCase classes, camelCase methods
- **Interfaces**: Prefix with `I` (e.g., `IMathService`, `ILogger`)
- **Files**: kebab-case for directories, PascalCase for classes

### Core Definition Pattern

```typescript
export const MathCore: CoreDefinition = {
  metadata: {
    name: "core-math",
    version: "1.0.0",
    description: "Basic math operations",
  },
  setup: (context: AppContext) => {
    const service = new MathService();
    context.registerService<IMathService>("math", service);
    console.log("➕ Math Core initialized");
  },
};
```

### Service Implementation Pattern

```typescript
export class MathService implements IMathService {
  add(a: number, b: number): number {
    return a + b;
  }

  divide(a: number, b: number): number {
    if (b === 0) {
      throw new Error("Cannot divide by zero");
    }
    return a / b;
  }
}
```

## Testing Framework

### Test Location

- Tests should be at the bottom of core implementation files
- Use `node:test` and `node:assert` modules
- Browser tests via Antigravity Browser Agent for UI apps

### Test Pattern (TDD Required)

```typescript
import { test, describe } from "node:test";
import { strict as assert } from "node:assert";

describe("MathService", () => {
  test("should add numbers correctly", () => {
    const service = new MathService();
    assert.equal(service.add(2, 3), 5);
  });
});
```

## Error Handling

### Service Errors

- Throw descriptive Error objects with clear messages
- Validate inputs and fail fast
- Log errors appropriately using core-logger

### Core Setup Errors

- Handle core initialization failures gracefully
- Use try-catch blocks around service registration
- Provide meaningful error messages for missing dependencies

## Development Workflow

### Package Management

- Use `pnpm` with workspace configuration
- Dependencies between packages use `workspace:*`
- Build order managed by Turborepo dependency graph

### Code Organization

- Define interfaces in `types.ts` before implementation
- Export all types from `index.ts`
- Use dependency injection through AppContext
- Emit events via context.events for inter-core communication

### Development Process

1. RED: Write failing test first
2. GREEN: Implement minimal code to pass test
3. REFACTOR: Clean up while maintaining green tests
4. Run `pnpm lint` and fix all errors
5. Run `pnpm test` to ensure all tests pass

## Frontend Apps (Vite + React)

### App Structure

- Use Vite for bundling and development server
- React 19 with TypeScript
- Tailwind CSS for styling
- Zustand for state management
- ESLint for code quality

### Build Commands (Apps)

```bash
cd packages/apps/video-editor
pnpm dev          # Start Vite dev server
pnpm build        # TypeScript build + Vite bundle
pnpm lint         # ESLint check
pnpm preview      # Preview production build
```

## Git Hooks

### Pre-commit Hook

- Automatically runs `pnpm test` before commits
- Fails commit if tests don't pass
- Ensures code quality before pushing

### Commit Convention

Format: `[{agent}] {type}: {subject}`

- Agents: architect, core-dev, app-dev, tester
- Types: feat, fix, docs, style, refactor, test, chore

## Framework Integration

### MCP Servers

- Custom framework server for framework operations
- GitHub server for repository management
- Filesystem server for enhanced file access

### Dashboard Communication

- Human-agent communication via `.dashboard/` markdown files
- Track decisions and activities
- Maintain transparency in agent operations

### Autonomy Levels

- Currently set to "aggressive" for maximum agent autonomy
- Configurable via `.framework/autonomy.yaml`
- Agents can self-approve most actions

## Key Dependencies

### Core Stack

- **Validation**: Zod for schema validation
- **Events**: RxJS for reactive programming
- **Runtime**: Custom dependency injection system
- **Development**: tsx for TypeScript execution

### Frontend Stack

- **Framework**: React 19.2.0 with TypeScript
- **Bundler**: Vite 7.2.4
- **Styling**: Tailwind CSS v4
- **State**: Zustand 5.0.10
- **Icons**: Lucide React

## Best Practices

### Core Development

- Single responsibility principle
- Interface-first development
- Event-driven communication between cores
- Service registration through context
- Comprehensive error handling and logging

### Code Quality

- Strict TypeScript mode always enabled
- No implicit any types
- Use JSDoc for public APIs
- Follow existing naming conventions
- Maintain consistent code formatting

### Performance

- Lazy load services when possible
- Use RxJS operators efficiently
- Avoid unnecessary re-renders in React apps
- Optimize bundle sizes with code splitting
