# Fix OAuth Database Migration Error

## Problem
Error: `SqliteError: NOT NULL constraint failed: users.password_hash`

The database still has `password_hash` as NOT NULL, but OAuth users don't have passwords.

## Solution: Run Database Migration

### Step 1: Stop the Backend Server
```bash
pkill -f "tsx watch index.ts"
```

Wait a few seconds to ensure the database is unlocked.

### Step 2: Run SQL Migration
```bash
cd /Users/bharjana/Evos-AI/server
sqlite3 evos.db << 'SQL'
BEGIN TRANSACTION;

CREATE TABLE users_new (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
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

INSERT INTO users_new SELECT * FROM users;

DROP TABLE users;

ALTER TABLE users_new RENAME TO users;

COMMIT;
SQL
```

### Step 3: Verify Migration
```bash
sqlite3 evos.db "PRAGMA table_info(users);" | grep password_hash
```

Should show: `2|password_hash|TEXT|0||0` (the `0` means nullable)

### Step 4: Restart Backend
```bash
cd /Users/bharjana/Evos-AI/server
npm run dev
```

### Step 5: Test Google Sign-In
Go to `http://localhost:8080/login` and click "Continue with Google"

## What This Does
- Makes `password_hash` nullable (allows NULL for OAuth users)
- Preserves all existing user data
- Enables OAuth users to be created without passwords

## Notes
- Must stop backend before running migration (database will be locked otherwise)
- Migration is safe - it preserves all existing data
- After migration, both email/password and OAuth users will work

