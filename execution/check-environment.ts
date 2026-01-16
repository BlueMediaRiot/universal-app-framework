import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';

function check(name: string, command: string, versionCheck?: RegExp) {
    process.stdout.write(`Checking ${name}... `);
    try {
        const output = execSync(command, { stdio: 'pipe' }).toString();
        if (versionCheck && !versionCheck.test(output)) {
            console.log(`${RED}❌ (Version mismatch)${RESET}`);
            return false;
        }
        console.log(`${GREEN}✅${RESET}`);
        return true;
    } catch (e) {
        console.log(`${RED}❌${RESET}`);
        return false;
    }
}

function checkFile(name: string, filePath: string) {
    process.stdout.write(`Checking ${name}... `);
    if (fs.existsSync(filePath)) {
        console.log(`${GREEN}✅${RESET}`);
        return true;
    }
    console.log(`${RED}❌${RESET}`);
    return false;
}

console.log('🔍 Verifying Environment & Setup...\n');

const checks = [
    check('Node.js', 'node --version'),
    check('pnpm', 'pnpm --version'),
    check('Git', 'git --version'),
    checkFile('Root Config', 'package.json'),
    checkFile('Workspace Config', 'pnpm-workspace.yaml'),
    checkFile('Core System', 'packages/core-system/package.json'),
];

console.log('\n-------------------');
if (checks.every(Boolean)) {
    console.log(`${GREEN}✨ All systems go!${RESET}`);
    process.exit(0);
} else {
    console.error(`${RED}⚠️ Some checks failed.${RESET}`);
    process.exit(1);
}
