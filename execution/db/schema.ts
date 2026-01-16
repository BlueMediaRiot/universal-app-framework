
export const reviewSchema = `
-- .framework/data/framework.db

CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,                    -- 'core_creation', 'app_creation', etc.
  creator_agent TEXT NOT NULL,
  reviewer_agent TEXT,
  
  status TEXT NOT NULL,                  -- 'pending', 'in_progress', 'approved', 'changes_requested', 'rejected', 'escalated'
  title TEXT,                            -- Display title for dashboard
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  
  -- Artifacts
  artifacts_json TEXT,                   -- JSON: { code, tests, docs, plan, ... }
  context_json TEXT,                     -- JSON: { spec_id, dependencies, ... }
  creator_questions TEXT,                -- JSON array of questions
  
  -- Review results
  reviewer_feedback_json TEXT,           -- JSON: { overall, strengths, concerns, suggestions }
  checklist_json TEXT,                   -- JSON: { criterion: boolean }
  confidence INTEGER,                    -- 0-100
  
  -- Metrics
  time_to_review_ms INTEGER,
  revision_count INTEGER DEFAULT 0,

  -- Escalation
  escalation_reason TEXT,
  creator_argument TEXT
);

CREATE TABLE IF NOT EXISTS review_revisions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  review_id TEXT REFERENCES reviews(id),
  revision_number INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  changes_requested TEXT,                -- What needed fixing
  changes_made TEXT                      -- What was changed
);

CREATE TABLE IF NOT EXISTS review_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date DATE NOT NULL,
  review_type TEXT NOT NULL,
  creator_agent TEXT NOT NULL,
  reviewer_agent TEXT NOT NULL,
  
  total_reviews INTEGER DEFAULT 0,
  approved INTEGER DEFAULT 0,
  changes_requested INTEGER DEFAULT 0,
  rejected INTEGER DEFAULT 0,
  
  avg_review_time_ms INTEGER,
  avg_confidence INTEGER,
  
  UNIQUE(date, review_type, creator_agent, reviewer_agent)
);

CREATE TABLE IF NOT EXISTS auto_skip_patterns (
  id TEXT PRIMARY KEY,
  action_type TEXT NOT NULL,             -- 'create_core', 'create_app', etc.
  creator_agent TEXT NOT NULL,
  
  total_attempts INTEGER DEFAULT 0,
  successful_reviews INTEGER DEFAULT 0,
  avg_confidence REAL,
  
  eligible_for_skip BOOLEAN DEFAULT 0,
  skip_enabled BOOLEAN DEFAULT 0,
  skip_enabled_at TIMESTAMP,
  skip_suggested BOOLEAN DEFAULT 0,
  skip_suggested_at TIMESTAMP,
  
  last_review_at TIMESTAMP,
  
  confidences_json TEXT,                 -- JSON array of last N confidences
  
  UNIQUE(action_type, creator_agent)
);
`;
