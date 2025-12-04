# Evos AI Codebase Summary: Daily Actions & Node Connections

## 📋 Table of Contents
1. [Daily Actions System](#daily-actions-system)
2. [Node Connections System](#node-connections-system)
3. [Data Flow](#data-flow)
4. [Key Files & Functions](#key-files--functions)

---

## 🎯 Daily Actions System

### Overview
Daily Actions (also called "Proof-Moves") are **binary, concrete behaviors** that users either complete or don't. They're generated from identity nodes and directly impact node strength.

### Core Philosophy
- **Not suggestions** - They're binary: done or not done
- **Concrete** - Specific actions, not vague ideas
- **Time-bound** - Clear time estimates
- **Measurable** - Clear completion criteria

### Architecture

#### 1. **Generation Logic** (`src/lib/generateDailyActions.ts`)

**Key Function: `generateDailyActions(nodes: IdentityNode[]): DailyAction[]`**

**Process:**
1. **Find Top Gaps** - Uses `findTopGaps()` to identify nodes with largest gaps between `strength` and `desiredStrength`
2. **Priority Order:**
   - Struggles first (highest priority)
   - Developing nodes
   - Highest gap nodes
3. **Generate Actions** - Uses `PROOF_MOVE_TEMPLATES` based on node type
4. **Always Includes Tracking** - First action is always a tracking proof-move

**Proof-Move Templates by Node Type:**

```typescript
// Each template receives: (node, allNodes) => string
- habit: Links habits to goals, emphasizes consistency
- goal: Focuses on shipping deliverables, removing blockers
- trait: Uses traits to respond to struggles, external feedback
- emotion: Pauses, tracking intensity, using traits to manage
- struggle: Facing the struggle directly, using traits to attack it
```

**Example Generated Actions:**
- `"Spend exactly 15 minutes on the hardest part of 'Imposter Syndrome'. Set a timer."`
- `"Use 'Resilience' (85%) as your response to 'Work-Life Balance' today."`
- `"Tracking proof: Screenshot your completed Daily Tracker with all 5 categories filled."`

#### 2. **Storage & Persistence**

**Frontend (Zustand Store):**
- `useUserStore.dailyActions: DailyAction[]` - Stored in user profile
- Persisted via `zustand/middleware/persist` to localStorage

**Backend (SQLite):**
```sql
CREATE TABLE daily_actions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  date DATE NOT NULL,
  node_id TEXT,
  node_name TEXT NOT NULL,
  action_text TEXT NOT NULL,
  time_estimate TEXT,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'done', 'skipped')),
  completed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

**API Endpoints:**
- `GET /api/actions/:date?` - Get actions for a date (auto-generates if none exist)
- `PATCH /api/actions/:id` - Update action status (done/skipped)
- `POST /api/actions/regenerate` - Generate new actions for today

#### 3. **Completion & Impact**

**When User Marks Action Complete:**

```typescript
// src/store/useUserStore.ts - markActionComplete()
1. If action.nodeId === 'tracking' → No strength change
2. Otherwise:
   - Completed: +5 to +10 strength (random)
   - Failed: -3 to -7 strength (random)
3. Updates node strength in identityNodes array
4. Recalculates node status (mastered/active/developing/neglected)
5. Updates alignmentScore
6. Stores strengthChange in action object
```

**Status Calculation:**
```typescript
newStrength >= 80 → 'mastered'
newStrength >= 50 → 'active'
newStrength >= 20 → 'developing'
newStrength < 20  → 'neglected'
```

#### 4. **UI Components**

**`src/components/daily/DailyProofCard.tsx`**
- Displays list of daily actions
- Shows completion status (Done/Didn't do it)
- "Change Task" button → Opens chat to adapt task
- Reflection modal for failed actions
- Progress bar showing completion rate

**Features:**
- Auto-generates actions on mount if none exist
- Regenerate button to create new actions
- Feedback messages after completion
- Strength change indicators

---

## 🔗 Node Connections System

### Overview
Nodes can be **connected** to each other, representing relationships in the identity graph. Connections are used for:
- Visual edges in Psych Mirror
- Context in action generation
- Understanding relationships between identity elements

### Architecture

#### 1. **Data Structure**

**Frontend Type:**
```typescript
interface IdentityNode {
  id: string;
  label: string;
  type: NodeType;
  strength: number;
  connections: string[];  // Array of node IDs this node connects to
  // ... other fields
}
```

**Backend Storage:**
```sql
-- Two storage methods:

-- 1. In nodes table (JSON array in connections column - NOT CURRENTLY USED)
-- 2. In node_connections table (separate edges table)
CREATE TABLE node_connections (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  source_id TEXT NOT NULL,  -- Node that connects FROM
  target_id TEXT NOT NULL,   -- Node that connects TO
  weight REAL DEFAULT 0.5,   -- Connection strength (0-1)
  created_at DATETIME
)
```

**Current Implementation:**
- Frontend uses `connections: string[]` array on each node
- Backend has `node_connections` table but it's **not actively used**
- Connections are primarily set during onboarding/mock data generation

#### 2. **Connection Creation**

**During Onboarding:**
```typescript
// src/lib/generateMockProfile.ts
// Creates connections based on logical relationships:

// Goals → connect to related habits
node.connections = relatedHabits.map(n => n.id);

// Habits → connect to related traits
node.connections = relatedTraits.map(n => n.id);

// Struggles → connect to related goals (blocking relationships)
node.connections = relatedGoals.map(n => n.id);
```

**Manual Creation:**
- Users can add nodes via `AddNodeModal.tsx`
- Connections start as empty array: `connections: []`
- Currently no UI to manually add connections (future feature)

#### 3. **Usage in Action Generation**

**Connections Provide Context:**
```typescript
// src/lib/generateDailyActions.ts

// Habits can reference connected goals:
const relatedGoal = goals[0];  // Uses connections to find related goal
proofMove = `Use ${habit.label} to make progress on "${relatedGoal.label}"`

// Struggles can reference connected goals:
const affectedGoal = goals[0];
proofMove = `"${struggle.label}" is blocking "${affectedGoal.label}". Remove one obstacle.`

// Traits can be used to attack connected struggles:
const relatedStruggle = struggles[0];
proofMove = `When "${relatedStruggle.label}" appears, respond with "${trait.label}"`
```

#### 4. **Visual Representation**

**Psych Mirror (`src/components/psychmirror/PsychMirror.tsx`):**

**Edge Generation:**
```typescript
function generateEdges(nodes: PsychNode[]): PsychEdge[] {
  // Creates edges between:
  // 1. Nodes in same category (clustered)
  // 2. Nodes with high value correlation
  // 3. Nearest neighbors (if no explicit connections)
}
```

**Edge Rendering:**
- Color: Based on source node category
- Opacity: Based on connection weight
- Style: Semi-transparent lines, dotted for some relationships

**Note:** The current Psych Mirror uses **auto-generated edges** based on proximity and category, not the explicit `connections` array. This is a design choice for visual density.

#### 5. **Connection Types (Logical)**

**Based on Node Types:**
- **Goal → Habit**: "This habit supports this goal"
- **Habit → Trait**: "This habit builds this trait"
- **Struggle → Goal**: "This struggle blocks this goal"
- **Trait → Struggle**: "This trait can overcome this struggle"
- **Emotion → Trait**: "This emotion relates to this trait"

---

## 🔄 Data Flow

### Daily Actions Flow

```
1. User opens Dashboard
   ↓
2. DailyProofCard component mounts
   ↓
3. Checks: user.dailyActions exists?
   ├─ NO → generateDailyActions(user.identityNodes)
   └─ YES → Display existing actions
   ↓
4. User marks action complete
   ↓
5. markActionComplete(actionId, completed)
   ↓
6. Calculate strength change (+5 to +10 or -3 to -7)
   ↓
7. Update node strength in identityNodes
   ↓
8. Recalculate node status
   ↓
9. Update alignmentScore
   ↓
10. Persist to localStorage (Zustand)
   ↓
11. (Optional) Sync to backend via API
```

### Node Connections Flow

```
1. Onboarding creates nodes
   ↓
2. generateMockProfile() or extractIdentityFromChat()
   ↓
3. Creates connections based on type relationships:
   - Goals → find related habits → set connections[]
   - Habits → find related traits → set connections[]
   - Struggles → find related goals → set connections[]
   ↓
4. Nodes stored with connections array
   ↓
5. Connections used in:
   - Action generation (context)
   - Psych Mirror visualization (edges - currently auto-generated)
   - Node details panel (shows connection count)
```

---

## 📁 Key Files & Functions

### Daily Actions

| File | Purpose | Key Functions |
|------|---------|---------------|
| `src/lib/generateDailyActions.ts` | Core generation logic | `generateDailyActions()`, `findTopGaps()`, `PROOF_MOVE_TEMPLATES` |
| `src/components/daily/DailyProofCard.tsx` | UI component | `handleMarkComplete()`, `handleChangeTask()`, `regenerateActions()` |
| `src/store/useUserStore.ts` | State management | `setDailyActions()`, `markActionComplete()` |
| `server/index.ts` | API endpoints | `GET /api/actions/:date?`, `PATCH /api/actions/:id`, `POST /api/actions/regenerate` |
| `server/ai.ts` | AI-powered generation | `generateDailyActions()` (OpenAI version) |

### Node Connections

| File | Purpose | Key Functions |
|------|---------|---------------|
| `src/types/index.ts` | Type definitions | `IdentityNode.connections: string[]` |
| `src/lib/generateMockProfile.ts` | Mock data generation | Creates connections based on relationships |
| `src/lib/extractIdentityFromChat.ts` | Chat extraction | Creates connections for new nodes |
| `src/components/psychmirror/PsychMirror.tsx` | Visualization | `generateEdges()` (auto-generates edges) |
| `server/db.ts` | Database schema | `node_connections` table definition |

---

## 🎯 Key Insights

### Daily Actions
1. **Always includes tracking** - First action is always a tracking proof-move
2. **Binary outcomes** - Done or not done, no partial credit
3. **Context-aware** - Uses node connections to create relevant actions
4. **Strength impact** - Directly affects node strength (+5 to +10 or -3 to -7)
5. **Adaptable** - Users can "Change Task" via chat to get more realistic actions

### Node Connections
1. **Currently underutilized** - Connections exist but Psych Mirror uses auto-generated edges
2. **Logical relationships** - Based on node types (goals→habits, traits→struggles)
3. **Context for actions** - Used to generate more relevant proof-moves
4. **Future potential** - Could enable manual connection editing, relationship analysis

### Integration Points
- **Daily Actions → Node Strength** - Actions directly update node strength
- **Node Strength → Status** - Strength determines node status (mastered/active/etc)
- **Connections → Action Context** - Connections help generate relevant actions
- **Actions → Psych Mirror** - Completed actions can highlight nodes in visualization

---

## 🚀 Future Enhancements

### Daily Actions
- [ ] AI-powered action adaptation based on user feedback
- [ ] Recurring actions for habits
- [ ] Action templates library
- [ ] Strength change based on action difficulty

### Node Connections
- [ ] Manual connection editing UI
- [ ] Connection strength visualization
- [ ] Relationship analysis ("This struggle blocks 3 goals")
- [ ] Connection-based recommendations

---

**Last Updated:** December 2, 2025


