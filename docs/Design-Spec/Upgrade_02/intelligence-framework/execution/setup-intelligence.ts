// execution/setup-intelligence.ts

import Database from 'better-sqlite3'
import * as fs from 'fs'
import * as path from 'path'

const DB_PATH = '.framework/data/intelligence.db'

function setupIntelligenceDatabase(): void {
  console.log('🧠 Setting up Intelligence Database...\n')
  
  // Ensure directory exists
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })
  
  const db = new Database(DB_PATH)
  
  // Enable WAL mode for better concurrency
  db.pragma('journal_mode = WAL')
  
  // Create tables
  console.log('Creating tables...')
  
  // 1. Patterns table
  db.exec(`
    CREATE TABLE IF NOT EXISTS patterns (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      description TEXT NOT NULL,
      conditions TEXT NOT NULL,
      confidence REAL NOT NULL,
      occurrences INTEGER DEFAULT 1,
      auto_approve_eligible INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `)
  console.log('✓ Created patterns table')
  
  // 2. Decisions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS decisions (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      context TEXT NOT NULL,
      decision TEXT NOT NULL,
      time_to_decide_ms INTEGER,
      confidence REAL,
      auto_approved INTEGER DEFAULT 0,
      reversed_later INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    )
  `)
  console.log('✓ Created decisions table')
  
  // 3. Metrics table (telemetry)
  db.exec(`
    CREATE TABLE IF NOT EXISTS metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      metric_type TEXT NOT NULL,
      metric_name TEXT NOT NULL,
      value REAL NOT NULL,
      unit TEXT,
      context TEXT,
      recorded_at TEXT NOT NULL
    )
  `)
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_metrics_type_name 
    ON metrics(metric_type, metric_name)
  `)
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_metrics_recorded_at 
    ON metrics(recorded_at)
  `)
  console.log('✓ Created metrics table')
  
  // 4. Errors table
  db.exec(`
    CREATE TABLE IF NOT EXISTS errors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      error_type TEXT NOT NULL,
      error_message TEXT NOT NULL,
      stack_trace TEXT,
      context TEXT,
      resolved INTEGER DEFAULT 0,
      resolution TEXT,
      occurred_at TEXT NOT NULL
    )
  `)
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_errors_type 
    ON errors(error_type)
  `)
  console.log('✓ Created errors table')
  
  // 5. Experiments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS experiments (
      id TEXT PRIMARY KEY,
      hypothesis TEXT NOT NULL,
      branch_name TEXT NOT NULL,
      status TEXT NOT NULL,
      approach TEXT NOT NULL,
      results TEXT,
      started_at TEXT NOT NULL,
      completed_at TEXT
    )
  `)
  console.log('✓ Created experiments table')
  
  // 6. Performance baselines table
  db.exec(`
    CREATE TABLE IF NOT EXISTS performance_baselines (
      metric_name TEXT PRIMARY KEY,
      baseline_value REAL NOT NULL,
      unit TEXT NOT NULL,
      sample_size INTEGER NOT NULL,
      established_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `)
  console.log('✓ Created performance_baselines table')
  
  // 7. Risk assessments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS risk_assessments (
      id TEXT PRIMARY KEY,
      change_type TEXT NOT NULL,
      risk_level TEXT NOT NULL,
      risk_score REAL NOT NULL,
      factors TEXT NOT NULL,
      mitigations TEXT,
      approved INTEGER DEFAULT 0,
      assessed_at TEXT NOT NULL
    )
  `)
  console.log('✓ Created risk_assessments table')
  
  // 8. User behavior table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_behavior (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action_type TEXT NOT NULL,
      action_result TEXT NOT NULL,
      time_taken_ms INTEGER,
      context TEXT,
      recorded_at TEXT NOT NULL
    )
  `)
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_user_behavior_type 
    ON user_behavior(action_type)
  `)
  console.log('✓ Created user_behavior table')
  
  // 9. Temporal patterns table
  db.exec(`
    CREATE TABLE IF NOT EXISTS temporal_patterns (
      id TEXT PRIMARY KEY,
      pattern_type TEXT NOT NULL,
      pattern_data TEXT NOT NULL,
      frequency TEXT NOT NULL,
      confidence REAL NOT NULL,
      detected_at TEXT NOT NULL,
      last_occurred TEXT NOT NULL
    )
  `)
  console.log('✓ Created temporal_patterns table')
  
  // 10. Meta learnings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS meta_learnings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      learning_type TEXT NOT NULL,
      description TEXT NOT NULL,
      impact TEXT NOT NULL,
      confidence REAL NOT NULL,
      applied INTEGER DEFAULT 0,
      learned_at TEXT NOT NULL
    )
  `)
  console.log('✓ Created meta_learnings table')
  
  db.close()
  
  console.log('\n✅ Intelligence database setup complete!')
  console.log(`📁 Database location: ${DB_PATH}`)
}

// Run setup
setupIntelligenceDatabase()
