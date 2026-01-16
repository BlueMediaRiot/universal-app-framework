import fs from 'fs';
import path from 'path';

const DIRECTIVES_DIR = path.join(process.cwd(), 'directives');
const RULES_DIR = path.join(process.cwd(), '.antigravity/rules');

if (!fs.existsSync(RULES_DIR)) {
    fs.mkdirSync(RULES_DIR, { recursive: true });
}

console.log('🔄 Syncing directives to Antigravity rules...');

if (fs.existsSync(DIRECTIVES_DIR)) {
    const files = fs.readdirSync(DIRECTIVES_DIR);
    for (const file of files) {
        if (file.endsWith('.md')) {
            const src = path.join(DIRECTIVES_DIR, file);
            const dest = path.join(RULES_DIR, file);
            fs.copyFileSync(src, dest);
            console.log(`✅ Synced: ${file}`);
        }
    }
} else {
    console.log('ℹ️ No directives directory found yet.');
}

console.log('✨ Sync complete.');
