import { Database } from "bun:sqlite";

console.log("Creating coordination database with Bun...");
const db = new Database(".framework/data/coordination.db");
db.exec("PRAGMA journal_mode = WAL;");

db.run(`
  CREATE TABLE IF NOT EXISTS work_queue (
    task_id TEXT PRIMARY KEY,
    claimed_by TEXT,
    claimed_at INTEGER,
    heartbeat_at INTEGER,
    status TEXT DEFAULT 'pending'
  );
`);

db.run(`
  CREATE TABLE IF NOT EXISTS file_locks (
    file_path TEXT PRIMARY KEY,
    locked_by TEXT NOT NULL,
    lock_type TEXT CHECK(lock_type IN ('read', 'write')),
    expires_at INTEGER NOT NULL
  );
`);

db.run(`
  CREATE TABLE IF NOT EXISTS agent_status (
    agent_id TEXT PRIMARY KEY,
    current_task TEXT,
    status TEXT,
    last_heartbeat INTEGER
  );
`);

const agents = ['architect', 'core-developer', 'app-developer', 'tester', 'auditor', 'optimizer'];
const insert = db.prepare('INSERT OR IGNORE INTO agent_status (agent_id, status) VALUES (?, ?)');
agents.forEach(agent => {
    insert.run(agent, 'idle');
});

db.close();
console.log('✅ Coordination database created');
