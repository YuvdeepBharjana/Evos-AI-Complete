# Onboarding System Schema & Flow

## Goal of Onboarding (ONE Sentence)
**Create an initial identity profile (nodes) to enable personalized daily actions and identity engineering.**

---

## Current Onboarding Flow

### Step Order:
1. **Choice Screen** (`OnboardingChoice.tsx`)
   - User selects one of three methods:
     - **Upload** (ChatGPT export) - Recommended
     - **Questionnaire** (8 questions)
     - **Manual** (build nodes step-by-step)

2. **Method-Specific Flow:**
   - **Upload**: Copy prompt → Paste AI response → Extract nodes
   - **Questionnaire**: Answer 8 questions sequentially
   - **Manual**: Add nodes by category (goals, habits, traits, emotions, struggles, interests)

3. **Completion Screen** (animated success)

4. **Mentor Selection** (AI mentor style picker)

5. **Redirect to Mirror** (`/mirror`)

---

## Database Schema

### Table: `users`
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,  -- Nullable for OAuth users
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  onboarding_complete INTEGER DEFAULT 0,  -- Boolean (0/1)
  onboarding_method TEXT,  -- 'questionnaire' | 'upload' | 'manual'
  email_verified INTEGER DEFAULT 0,
  email_verified_at DATETIME,
  experiment_start_date DATE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_active_date DATE,
  ai_mentor_style TEXT DEFAULT 'ruthless'
);
```

**Fields written during onboarding:**
- `onboarding_complete` → Set to `1` (true)
- `onboarding_method` → Set to `'questionnaire'`, `'upload'`, or `'manual'`
- `updated_at` → Set to `CURRENT_TIMESTAMP`

### Table: `nodes`
```sql
CREATE TABLE nodes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  label TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('goal', 'habit', 'trait', 'emotion', 'struggle', 'interest')),
  strength INTEGER DEFAULT 50,  -- 0-100
  status TEXT DEFAULT 'developing' CHECK(status IN ('mastered', 'active', 'developing', 'neglected')),
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Fields written during onboarding:**
- All fields are populated when nodes are created
- `strength` defaults to 50 (or method-specific defaults)
- `status` defaults to `'developing'` (or method-specific)

---

## TypeScript Types

### User Type (from API)
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  onboarding_complete: boolean;  // Converted from INTEGER 0/1
  onboarding_method?: 'questionnaire' | 'upload' | 'manual';
  // ... other fields
}
```

### IdentityNode Type
```typescript
interface IdentityNode {
  id: string;
  label: string;  // 2-5 words (cleaned from user input)
  type: NodeType;  // 'goal' | 'habit' | 'trait' | 'emotion' | 'struggle' | 'interest'
  strength: number;  // 0-100, default 50
  status: NodeStatus;  // 'developing' | 'active' | 'mastered' | 'neglected'
  connections: string[];  // Array of connected node IDs (empty on creation)
  lastUpdated: Date;
  createdAt?: Date;
  description?: string;  // Full text description (for upload/questionnaire)
}
```

---

## Onboarding Methods & Data Collection

### 1. Upload Method (`DataUploadFlow.tsx`)

**Steps:**
1. User copies extraction prompt
2. User pastes AI response (formatted text)
3. System parses response and extracts nodes

**Data Collected:**
- **Input**: AI-generated text response (structured format)
- **Extracted Fields**:
  - `label`: 2-5 word cleaned title (from `generateShortTitle()`)
  - `type`: Mapped from section (GOALS→goal, STRUGGLES→struggle, etc.)
  - `strength`: Section-based defaults (80-85 for strengths, 40-45 for struggles, 70-75 for goals)
  - `description`: Full cleaned text
  - `status`: Defaults to `'active'` or `'developing'`

**Sections Parsed:**
- `CORE IDENTITY TRAITS` → `trait` (strength: 80)
- `STRENGTHS` → `trait` (strength: 85)
- `WEAKNESSES` → `struggle` (strength: 45)
- `GOALS` → `goal` (strength: 70)
- `STRUGGLES` → `struggle` (strength: 40)
- `INTERESTS` → `interest` (strength: 75)
- `EMOTIONAL FRAMEWORK` → `emotion` (strength: 55-65)
- `BEHAVIOR PATTERNS` → `habit` (strength: 60)
- `ACTION CODE` → `goal` (strength: 75)

**Validation:**
- Minimum 3 nodes required
- Maximum node label length: 150 characters
- Minimum node label length: 3 characters

---

### 2. Questionnaire Method (`QuestionnaireFlow.tsx`)

**Steps:**
1. User answers 8 questions sequentially
2. Each question has textarea input (10-2000 characters)
3. Answers are collected in `Record<string, string>` (questionId → answer)
4. On completion, answers are sent to `generateNodesFromQuestionnaire()`

**Questions (from `questions.ts`):**
```typescript
[
  { id: 'q1', question: "What are your main goals right now?", category: 'goal' },
  { id: 'q2', question: "What daily habits are you currently working on?", category: 'habit' },
  { id: 'q3', question: "What are your biggest challenges or struggles?", category: 'struggle' },
  { id: 'q4', question: "What are your core values and what matters most to you?", category: 'trait' },
  { id: 'q5', question: "How would you describe your work style?", category: 'trait' },
  { id: 'q6', question: "What skills or habits have you already mastered?", category: 'trait' },
  { id: 'q7', question: "What typically motivates you to take action?", category: 'emotion' },
  { id: 'q8', question: "What would success look like for you in 6 months?", category: 'goal' }
]
```

**Data Collected:**
- **Input**: 8 text answers (10-2000 characters each)
- **Processing**: Answers sent to backend `/api/onboarding/analyze` (AI analysis)
- **Output**: Array of `IdentityNode` objects generated from answers

**Validation:**
- Each answer: 10-2000 characters
- All questions must be answered
- Cannot skip questions (must go sequentially)

---

### 3. Manual Method (`ManualOnboardingFlow.tsx`)

**Steps:**
1. User cycles through 6 node type categories:
   - Goals
   - Habits
   - Traits
   - Emotions
   - Struggles
   - Interests
2. For each category, user adds nodes one-by-one (text input)
3. User can add multiple nodes per category
4. User can remove nodes before moving to next category
5. On completion, all nodes are converted to `IdentityNode[]`

**Data Collected:**
- **Input**: User-typed labels (one per node)
- **Output**: Array of `IdentityNode` objects

**Node Creation:**
```typescript
{
  id: uuidv4(),
  label: userInput.trim(),
  type: currentCategory,  // 'goal' | 'habit' | etc.
  strength: 50,  // Default
  status: 'developing',  // Default
  connections: [],
  lastUpdated: new Date(),
  createdAt: new Date()
}
```

**Validation:**
- Each label: trimmed, non-empty
- No minimum/maximum count per category
- User can skip categories (leave empty)
- User can go back and edit previous categories

---

## Completion Logic

### Frontend (`useUserStore.completeOnboarding()`)

**Flow:**
1. If user is authenticated (`authToken` exists):
   - Call `apiCompleteOnboarding(method, nodes)`
   - Backend saves nodes and updates `users.onboarding_complete = 1`
   - Frontend updates local state with returned nodes
2. If not authenticated (fallback):
   - Update local state only
   - Set `onboardingComplete = true`
   - Set `onboardingMethod = method`
   - Set `identityNodes = nodes`

### Backend (`/api/onboarding/complete`)

**Endpoint:** `POST /api/onboarding/complete`

**Request Body:**
```typescript
{
  method: 'questionnaire' | 'upload' | 'manual',
  nodes: IdentityNode[]  // Array of nodes to create
}
```

**Process:**
1. Validate `method` (must be one of the three)
2. Update `users` table:
   ```sql
   UPDATE users 
   SET onboarding_complete = 1, 
       onboarding_method = ?,
       updated_at = CURRENT_TIMESTAMP
   WHERE id = ?
   ```
3. Delete existing nodes for user (clean slate):
   ```sql
   DELETE FROM nodes WHERE user_id = ?
   ```
4. Bulk insert new nodes:
   ```sql
   INSERT INTO nodes (id, user_id, label, type, strength, status, description, created_at, updated_at)
   VALUES (?,?,?,?,?,?,?,?,?)
   ```
5. Return created nodes

**Response:**
```typescript
{
  success: true,
  nodes: IdentityNode[]  // Created nodes with IDs
}
```

---

## Constraints & Rules

### Required Fields
- **User**: `name`, `email` (already set during registration)
- **Onboarding Completion**: `method` must be provided
- **Nodes**: `label`, `type` are required
- **Questionnaire**: All 8 questions must be answered (10+ characters each)

### Optional Fields
- **Nodes**: `description` (optional, used in upload/questionnaire)
- **Nodes**: `strength` (defaults to 50 if not provided)
- **Nodes**: `status` (defaults to 'developing' if not provided)
- **Manual Method**: User can skip categories (leave empty)
- **Upload Method**: User can retry if extraction fails

### Skipping Rules
- **Questionnaire**: Cannot skip questions (must answer sequentially)
- **Manual**: Can skip categories (move to next without adding nodes)
- **Upload**: Can retry if parsing fails
- **All Methods**: Can go back to previous steps (except questionnaire which is sequential)

### Editing Rules
- **During Onboarding**: 
  - Manual: Can go back and edit previous categories
  - Questionnaire: Can go back and edit previous answers
  - Upload: Can retry with new paste
- **After Onboarding**: 
  - Users can edit nodes in the Mirror (`/mirror`)
  - Nodes can be added/deleted/updated anytime
  - `onboarding_method` is stored but not editable (historical record)

---

## Storage & Updates

### Where Data is Stored

**Database (SQLite):**
- `users.onboarding_complete` (INTEGER: 0 or 1)
- `users.onboarding_method` (TEXT: 'questionnaire' | 'upload' | 'manual')
- `nodes.*` (all node fields for the user)

**Frontend State (Zustand + localStorage):**
- `user.onboardingComplete` (boolean)
- `user.onboardingMethod` (string)
- `user.identityNodes` (IdentityNode[])

### When Data is Updated

**During Onboarding:**
- Nodes created → Saved to backend immediately on completion
- User record updated → `onboarding_complete = 1`, `onboarding_method set`

**After Onboarding:**
- Nodes can be modified in Mirror → Updates `nodes` table
- `onboarding_complete` and `onboarding_method` are **never changed** after initial completion (historical record)

---

## API Endpoints

### Complete Onboarding
```
POST /api/onboarding/complete
Headers: { Authorization: Bearer <token> }
Body: { method: string, nodes: IdentityNode[] }
Response: { success: boolean, nodes: IdentityNode[] }
```

### Analyze Questionnaire (AI Processing)
```
POST /api/onboarding/analyze
Headers: { Authorization: Bearer <token> } (optional)
Body: { answers: Record<string, string> }
Response: { nodes: IdentityNode[] }
```

---

## Summary

**Goal**: Create initial identity profile for personalized daily actions

**Flow**: Choice → Method-Specific Flow → Completion → Mentor Selection → Mirror

**Storage**: 
- `users.onboarding_complete` (boolean)
- `users.onboarding_method` (string)
- `nodes.*` (all user's identity nodes)

**Completion**: 
- Boolean flag (`onboarding_complete = 1`)
- Method stored for historical reference
- Nodes created and linked to user

**Constraints**:
- Questionnaire: All questions required, sequential
- Manual: Can skip categories, can edit
- Upload: Can retry on failure
- All: Can edit nodes after onboarding in Mirror




