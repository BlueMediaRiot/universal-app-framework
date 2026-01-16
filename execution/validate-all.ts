#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';

console.log('\n🔍 Validating all cores and apps...\n');

const coresDir = path.join(process.cwd(), 'packages', 'cores');
const appsDir = path.join(process.cwd(), 'packages', 'apps');

let totalErrors = 0;
let totalWarnings = 0;

// Validate cores
if (fs.existsSync(coresDir)) {
    const cores = fs.readdirSync(coresDir)
        .filter(item => {
            const itemPath = path.join(coresDir, item);
            return fs.statSync(itemPath).isDirectory() && item.startsWith('core-');
        });

    console.log(`📦 Validating ${cores.length} cores...\n`);

    cores.forEach(coreName => {
        const coreDir = path.join(coresDir, coreName);
        const errors: string[] = [];
        const warnings: string[] = [];

        // Check package.json
        const pkgPath = path.join(coreDir, 'package.json');
        if (!fs.existsSync(pkgPath)) {
            errors.push('Missing package.json');
        }

        // Check src/index.ts
        const indexPath = path.join(coreDir, 'src', 'index.ts');
        if (!fs.existsSync(indexPath)) {
            errors.push('Missing src/index.ts');
        }

        // Check tsconfig.json
        const tsconfigPath = path.join(coreDir, 'tsconfig.json');
        if (!fs.existsSync(tsconfigPath)) {
            warnings.push('Missing tsconfig.json');
        }

        if (errors.length > 0 || warnings.length > 0) {
            console.log(`${coreName}:`);
            errors.forEach(e => console.log(`  ❌ ${e}`));
            warnings.forEach(w => console.log(`  ⚠️  ${w}`));
            console.log('');
        } else {
            console.log(`${coreName}: ✅`);
        }

        totalErrors += errors.length;
        totalWarnings += warnings.length;
    });
}

// Validate apps
if (fs.existsSync(appsDir)) {
    const apps = fs.readdirSync(appsDir)
        .filter(item => {
            const itemPath = path.join(appsDir, item);
            return fs.statSync(itemPath).isDirectory() && item.startsWith('app-');
        });

    console.log(`\n📱 Validating ${apps.length} apps...\n`);

    apps.forEach(appName => {
        const appDir = path.join(appsDir, appName);
        const errors: string[] = [];

        // Check package.json
        const pkgPath = path.join(appDir, 'package.json');
        if (!fs.existsSync(pkgPath)) {
            errors.push('Missing package.json');
        }

        // Check index.ts
        const indexPath = path.join(appDir, 'index.ts');
        if (!fs.existsSync(indexPath)) {
            errors.push('Missing index.ts');
        }

        if (errors.length > 0) {
            console.log(`${appName}:`);
            errors.forEach(e => console.log(`  ❌ ${e}`));
            console.log('');
        } else {
            console.log(`${appName}: ✅`);
        }

        totalErrors += errors.length;
    });
}

console.log(`\n📊 Summary:`);
console.log(`  Errors: ${totalErrors}`);
console.log(`  Warnings: ${totalWarnings}`);

if (totalErrors > 0) {
    console.log('\n❌ Validation failed\n');
    process.exit(1);
} else {
    console.log('\n✅ All validation passed!\n');
    process.exit(0);
}
