import Database from 'better-sqlite3';
import * as fs from 'fs';

const db = new Database('.framework/data/coordination.db');
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS work_queue (
    task_id TEXT PRIMARY KEY,
    claimed_by TEXT,
    claimed_at INTEGER,
    heartbeat_at INTEGER,
    status TEXT DEFAULT 'pending'
  );
  
  CREATE TABLE IF NOT EXISTS file_locks (
    file_path TEXT PRIMARY KEY,
    locked_by TEXT NOT NULL,
    lock_type TEXT CHECK(lock_type IN ('read', 'write')),
    expires_at INTEGER NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS agent_status (
    agent_id TEXT PRIMARY KEY,
    current_task TEXT,
    status TEXT,
    last_heartbeat INTEGER
  );
`);

const agents = ['architect', 'core-developer', 'app-developer', 'tester', 'auditor', 'optimizer'];
agents.forEach(agent => {
    db.prepare('INSERT OR IGNORE INTO agent_status (agent_id, status) VALUES (?, ?)').run(agent, 'idle');
});

db.close();
console.log('✅ Coordination database created');
