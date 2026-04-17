import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use data directory if it exists (for Fly.io persistent volumes), otherwise use current directory
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'evos.db');
const dbDir = path.dirname(dbPath);

// Ensure directory exists
try {
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
} catch (e) {
  console.error('Failed to create database directory:', e);
  // Continue anyway - directory might already exist
}

const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Initialize database schema
db.exec(`
  -- Users table
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    onboarding_complete INTEGER DEFAULT 0,
    onboarding_method TEXT,
    email_verified INTEGER DEFAULT 0,
    email_verified_at DATETIME,
    experiment_start_date DATE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_active_date DATE
  );

  -- Email verification tokens
  CREATE TABLE IF NOT EXISTS email_tokens (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('verification', 'password_reset')),
    expires_at DATETIME NOT NULL,
    used INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Work sessions
  CREATE TABLE IF NOT EXISTS work_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    node_id TEXT,
    node_name TEXT NOT NULL,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ended_at DATETIME,
    duration_mins INTEGER,
    strength_change INTEGER DEFAULT 0,
    summary TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Work session messages (persistent chat history per node)
  CREATE TABLE IF NOT EXISTS work_session_messages (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    node_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Index for fast retrieval of node conversation history
  CREATE INDEX IF NOT EXISTS idx_work_session_messages_node ON work_session_messages(user_id, node_id);

  -- User milestones and achievements
  CREATE TABLE IF NOT EXISTS milestones (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    achieved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    metadata TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Identity nodes table
  CREATE TABLE IF NOT EXISTS nodes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    label TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('goal', 'habit', 'trait', 'emotion', 'struggle', 'interest')),
    strength INTEGER DEFAULT 50,
    status TEXT DEFAULT 'developing' CHECK(status IN ('mastered', 'active', 'developing', 'neglected')),
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Node connections (edges)
  CREATE TABLE IF NOT EXISTS node_connections (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    source_id TEXT NOT NULL,
    target_id TEXT NOT NULL,
    weight REAL DEFAULT 0.5,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (source_id) REFERENCES nodes(id) ON DELETE CASCADE,
    FOREIGN KEY (target_id) REFERENCES nodes(id) ON DELETE CASCADE
  );

  -- Daily tracking entries
  CREATE TABLE IF NOT EXISTS daily_tracking (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    date DATE NOT NULL,
    calories INTEGER,
    exercise_mins INTEGER,
    deep_work_hrs REAL,
    sleep_hrs REAL,
    mood INTEGER CHECK(mood >= 1 AND mood <= 10),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, date)
  );

  -- Daily proof actions
  CREATE TABLE IF NOT EXISTS daily_actions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    date DATE NOT NULL,
    node_id TEXT,
    node_name TEXT NOT NULL,
    action_text TEXT NOT NULL,
    time_estimate TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'done', 'skipped')),
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Chat messages
  CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    session_id TEXT,
    role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    context TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- End of day summaries
  CREATE TABLE IF NOT EXISTS daily_summaries (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    date DATE NOT NULL,
    summary TEXT NOT NULL,
    alignment_score INTEGER,
    insights TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, date)
  );

  -- Create indexes
  CREATE INDEX IF NOT EXISTS idx_nodes_user ON nodes(user_id);
  CREATE INDEX IF NOT EXISTS idx_tracking_user_date ON daily_tracking(user_id, date);
  CREATE INDEX IF NOT EXISTS idx_actions_user_date ON daily_actions(user_id, date);
  CREATE INDEX IF NOT EXISTS idx_messages_user ON chat_messages(user_id);
`);

// Migration: Add new columns if they don't exist
const migrations = [
  "ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0",
  "ALTER TABLE users ADD COLUMN email_verified_at DATETIME",
  "ALTER TABLE users ADD COLUMN experiment_start_date DATE",
  "ALTER TABLE users ADD COLUMN current_streak INTEGER DEFAULT 0",
  "ALTER TABLE users ADD COLUMN longest_streak INTEGER DEFAULT 0",
  "ALTER TABLE users ADD COLUMN last_active_date DATE",
  "ALTER TABLE users ADD COLUMN ai_mentor_style TEXT DEFAULT 'ruthless'",
  "ALTER TABLE daily_actions ADD COLUMN strength_change INTEGER DEFAULT 0",
];

for (const migration of migrations) {
  try {
    db.exec(migration);
  } catch (e: any) {
    // Column probably already exists, ignore
    if (!e.message.includes('duplicate column')) {
      // console.log('Migration skipped:', e.message);
    }
  }
}

export default db;
export { db };

