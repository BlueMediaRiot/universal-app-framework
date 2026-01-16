#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';

interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
    stats?: {
        lines: number;
        methods: number;
    };
}

function validateCore(coreName: string): ValidationResult {
    const coreDir = path.join(process.cwd(), 'packages', 'cores', coreName);
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if core exists
    if (!fs.existsSync(coreDir)) {
        return {
            valid: false,
            errors: [`Core directory not found: ${coreDir}`],
            warnings: []
        };
    }

    // Check package.json
    const pkgPath = path.join(coreDir, 'package.json');
    if (!fs.existsSync(pkgPath)) {
        errors.push('Missing package.json');
    } else {
        try {
            const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

            if (!pkg.name || !pkg.name.startsWith('@universal/')) {
                errors.push('package.json name must start with @universal/');
            }

            if (!pkg.version) {
                warnings.push('package.json missing version');
            }

            if (!pkg.main) {
                warnings.push('package.json missing main field');
            }
        } catch (e) {
            errors.push(`Invalid package.json: ${e}`);
        }
    }

    // Check src/index.ts
    const indexPath = path.join(coreDir, 'src', 'index.ts');
    if (!fs.existsSync(indexPath)) {
        errors.push('Missing src/index.ts');
    } else {
        const content = fs.readFileSync(indexPath, 'utf-8');
        const lines = content.split('\n').length;

        if (!content.includes('CoreDefinition')) {
            errors.push('src/index.ts must export a CoreDefinition');
        }

        if (!content.includes('export default')) {
            errors.push('src/index.ts must have a default export');
        }

        // Count methods (simple heuristic)
        const methods = (content.match(/async \w+\(/g) || []).length;

        return {
            valid: errors.length === 0,
            errors,
            warnings,
            stats: { lines, methods }
        };
    }

    // Check tsconfig.json
    const tsconfigPath = path.join(coreDir, 'tsconfig.json');
    if (!fs.existsSync(tsconfigPath)) {
        warnings.push('Missing tsconfig.json');
    }

    // Check README.md
    const readmePath = path.join(coreDir, 'README.md');
    if (!fs.existsSync(readmePath)) {
        warnings.push('Missing README.md');
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
}

// CLI
const coreName = process.argv[2];

if (!coreName) {
    console.error('Usage: validate-core.ts <core-name>');
    process.exit(1);
}

const result = validateCore(coreName);

console.log(`\n🔍 Validating ${coreName}...\n`);

if (result.errors.length > 0) {
    console.log('❌ Errors:');
    result.errors.forEach(err => console.log(`  - ${err}`));
}

if (result.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    result.warnings.forEach(warn => console.log(`  - ${warn}`));
}

if (result.stats) {
    console.log(`\n📊 Stats:`);
    console.log(`  Lines: ${result.stats.lines}`);
    console.log(`  Methods: ${result.stats.methods}`);
}

if (result.valid) {
    console.log('\n✅ Core is valid!\n');
    process.exit(0);
} else {
    console.log('\n❌ Core validation failed\n');
    process.exit(1);
}
