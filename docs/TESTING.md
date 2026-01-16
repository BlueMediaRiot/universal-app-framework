# Universal App Framework - Testing Guide

## Test Structure

The framework includes comprehensive test coverage across multiple layers:

### Unit Tests
- **[core-system.test.ts](file:///r:/Code/universal-app-framework/tests/core-system.test.ts)** - Tests for ConfigStore, SecretStore, ServiceRegistry, PluginRegistry, CoreLoader

### Integration Tests
- **[cores.test.ts](file:///r:/Code/universal-app-framework/tests/cores.test.ts)** - Tests for all cores (logger, math, ai-api)
- **[automation.test.ts](file:///r:/Code/universal-app-framework/tests/automation.test.ts)** - Tests for Git workflow, rollback, self-annealing, etc.

### End-to-End Tests
- **[e2e.test.ts](file:///r:/Code/universal-app-framework/tests/e2e.test.ts)** - Complete application lifecycle tests

## Running Tests

```bash
# Run all tests
pnpm exec tsx --test tests/**/*.test.ts

# Run specific test suites
pnpm exec tsx --test tests/core-system.test.ts
pnpm exec tsx --test tests/cores.test.ts
pnpm exec tsx --test tests/automation.test.ts
pnpm exec tsx --test tests/e2e.test.ts

# Watch mode
pnpm exec tsx --test --watch tests/**/*.test.ts

# With coverage (experimental)
pnpm exec tsx --test --experimental-test-coverage tests/**/*.test.ts
```

## Test Coverage

- ✅ ConfigStore (dot-notation, environments, defaults)
- ✅ SecretStore (environment variables, required secrets)
- ✅ ServiceRegistry (register, retrieve, unregister)
- ✅ PluginRegistry (plugins, hooks, initialization)
- ✅ CoreLoader (loading, lifecycle, error handling)
- ✅ All cores (logger, math, ai-api)
- ✅ Git workflow automation
- ✅ Rollback system
- ✅ Self-annealing system
- ✅ Idea refiner
- ✅ Decision learner
- ✅ Complete application flows
- ✅ Error handling
- ✅ Environment-specific configuration

## Writing New Tests

Use Node.js built-in test runner:

```typescript
import { describe, it } from 'node:test';
import * as assert from 'node:assert';

describe('My Feature', () => {
    it('should work correctly', () => {
        assert.strictEqual(1 + 1, 2);
    });
    
    it('should handle async operations', async () => {
        const result = await someAsyncFunction();
        assert.ok(result);
    });
});
```

## CI/CD Integration

Add to your CI pipeline:

```yaml
- name: Run tests
  run: pnpm exec tsx --test tests/**/*.test.ts
```
