import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';
import { reviewSchema } from './schema';

const DB_DIR = path.resolve(process.cwd(), '.framework/data');
const DB_PATH = path.join(DB_DIR, 'framework.db');

async function setupDatabase() {
    console.log('📦 Setting up Framework Database...');

    // Ensure directory exists
    if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
        console.log(`   Created directory: ${DB_DIR}`);
    }

    try {
        const db = new Database(DB_PATH);

        // Execute schema
        db.exec(reviewSchema);

        console.log(`   ✅ Database initialized at: ${DB_PATH}`);
        console.log('   ✅ Review tables created successfully');

        db.close();
    } catch (error) {
        console.error('   ❌ Failed to setup database:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    setupDatabase();
}

export { setupDatabase, DB_PATH };
