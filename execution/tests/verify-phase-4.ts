import * as assert from 'assert';
import { execSync } from 'child_process';

console.log('🧪 Phase 4 Verification: Tooling & Automation\n');

// Test 1: validate-core.ts
console.log('Test 1: Validate core-logger');
try {
    execSync('pnpm exec tsx execution/validate-core.ts core-logger', {
        cwd: process.cwd(),
        stdio: 'pipe'
    });
    console.log('✅ validate-core.ts works\n');
} catch (error) {
    console.error('❌ validate-core.ts failed');
    process.exit(1);
}

// Test 2: validate-all.ts
console.log('Test 2: Validate all cores and apps');
try {
    execSync('pnpm exec tsx execution/validate-all.ts', {
        cwd: process.cwd(),
        stdio: 'pipe'
    });
    console.log('✅ validate-all.ts works\n');
} catch (error) {
    console.error('❌ validate-all.ts failed');
    process.exit(1);
}

// Test 3: generate-docs.ts
console.log('Test 3: Generate documentation');
try {
    execSync('pnpm exec tsx execution/generate-docs.ts core-logger', {
        cwd: process.cwd(),
        stdio: 'pipe'
    });
    console.log('✅ generate-docs.ts works\n');
} catch (error) {
    console.error('❌ generate-docs.ts failed');
    process.exit(1);
}

console.log('✅ Phase 4 Verification Complete!\n');
console.log('All tooling and automation scripts functional.');
process.exit(0);
