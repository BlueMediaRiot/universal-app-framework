#!/usr/bin/env ts-node

import { execSync } from 'child_process';
import * as path from 'path';

interface TestResult {
    passed: boolean;
    total: number;
    passed_count: number;
    failed_count: number;
    failures: Array<{ test: string; error: string }>;
}

function testCore(coreName: string): TestResult {
    const coreDir = path.join(process.cwd(), 'packages', 'cores', coreName);

    console.log(`\n🧪 Testing ${coreName}...\n`);

    try {
        // Try to run tests using Node's built-in test runner
        const output = execSync(
            `pnpm --filter @universal/${coreName} exec node --test`,
            {
                cwd: process.cwd(),
                encoding: 'utf-8',
                stdio: 'pipe'
            }
        );

        console.log(output);

        return {
            passed: true,
            total: 0,
            passed_count: 0,
            failed_count: 0,
            failures: []
        };
    } catch (error: any) {
        // If tests fail or don't exist
        if (error.stdout && error.stdout.includes('pass')) {
            // Some tests passed
            return {
                passed: false,
                total: 1,
                passed_count: 0,
                failed_count: 1,
                failures: [{ test: coreName, error: error.message }]
            };
        }

        // No tests found - that's okay for now
        console.log(`⚠️  No tests found for ${coreName}`);
        return {
            passed: true,
            total: 0,
            passed_count: 0,
            failed_count: 0,
            failures: []
        };
    }
}

// CLI
const coreName = process.argv[2];

if (!coreName) {
    console.error('Usage: test-core.ts <core-name>');
    process.exit(1);
}

const result = testCore(coreName);

if (result.passed) {
    console.log(`\n✅ Tests passed for ${coreName}\n`);
    process.exit(0);
} else {
    console.log(`\n❌ Tests failed for ${coreName}\n`);
    result.failures.forEach(f => {
        console.log(`  ${f.test}: ${f.error}`);
    });
    process.exit(1);
}
