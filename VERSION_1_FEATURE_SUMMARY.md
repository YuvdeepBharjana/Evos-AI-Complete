# Evos AI - Version 1 Feature Summary

## Executive Overview

Evos AI is a **psychological mirror and identity transformation platform** that helps users visualize and evolve their identity through:
- Interactive neural network visualization of identity nodes
- AI-powered personalized coaching
- Daily action protocols tied to identity growth
- Closed-loop tracking system with real-time feedback

---

## Core Philosophy

**"You are what you repeatedly do. Identity is the result of habits."**

The system operates on a closed-loop feedback cycle:
1. **Identity** → Know who you want to be
2. **Action** → Daily micro-tasks aligned with identity
3. **Measure** → Track completion
4. **Reinforce** → Strengthen or weaken nodes based on actions
5. **Evolve** → Watch your mirror transform
6. **Repeat** → New identity unlocked

---

## 1. USER AUTHENTICATION & ONBOARDING

### Authentication System
- **Sign up/Login**: Email + password authentication
- **Email verification**: Required for account activation
- **Password reset**: Forgot password flow with email token
- **Session management**: JWT tokens with auto-restore on app load
- **Demo mode**: Quick demo login without creating account

### Onboarding Flow (3 Methods)
Users choose how to build their initial identity profile:

#### A. Smart Questionnaire
- 8 thoughtful questions across different identity categories
- Questions target: goals, habits, traits, emotions, struggles
- AI analyzes answers and generates initial identity nodes
- Fast path (~5 minutes)

#### B. ChatGPT Export Upload
- Upload ChatGPT conversation history (JSON)
- AI extracts patterns, traits, goals, struggles from conversations
- Automatically generates identity nodes from conversation data
- Great for users with extensive AI chat history

#### C. Manual Entry
- Manually add identity nodes one by one
- Choose node type: habit, goal, trait, emotion, struggle, interest
- Set initial strength levels
- Full control over identity profile creation

### Mentor Style Selection
After onboarding, users select their AI mentor personality:
- **Ruthless Mentor**: High-pressure, uncompromising truth
- **Strategic Architect**: System-building, logical frameworks  
- **Psychological Mirror**: Self-awareness, pattern reflection
- **Supportive Coach**: Encouraging but honest growth partner

---

## 2. PSYCHOLOGICAL MIRROR (THE STAR FEATURE)

### Overview
A **3D force-directed network visualization** showing your identity as an interconnected neural network using React Flow.

### Identity Nodes
Each node represents an aspect of your identity with:

**Node Types** (color-coded):
- 🟢 **Habits** (Green): Daily actions and routines
- 🔵 **Goals** (Blue): Objectives and aspirations  
- 🟣 **Traits** (Purple): Core values and character
- 🟡 **Emotions** (Orange): Emotional patterns
- 🔴 **Struggles** (Red): Challenges and fears
- 🔷 **Interests** (Cyan): Passions and curiosities

**Node Properties**:
- `label`: Name/description
- `strength`: 0-100 score (determines size, brightness, opacity)
- `desiredStrength`: Target strength (creates identity gap)
- `status`: developing → active → mastered → neglected
- `connections`: Links to related nodes
- `lastUpdated`: Timestamp of last change

**Visual Indicators**:
- **Size**: Larger = stronger/more developed
- **Brightness**: Brighter = higher strength
- **Opacity**: More opaque = more consistent
- **Color**: Type-based gradient
- **Glow**: Special effects for mastered nodes or daily actions
- **Pulsing**: Active daily action nodes pulse

### Growth Core Node
Central purple node representing overall identity evolution:
- Shows average strength across all nodes
- Displays total active, completed, and developing nodes
- Clicking opens full identity summary modal

### Interactive Features
- **Click node**: Opens detailed side panel with:
  - Node information
  - Current strength vs desired strength
  - Status and last updated time
  - Connection to other nodes
  - Quick actions (edit, delete)
  
- **Filter by type**: Show only habits, goals, traits, etc.
- **Zoom controls**: Zoom in/out, fit to view
- **Pan/drag**: Navigate large networks
- **Add nodes**: Create new identity nodes on the fly
- **Edit nodes**: Modify strength, desired strength, connections

### Real-time Updates
- Nodes glow when strength changes from completed actions
- Strength changes animate smoothly
- Connections strengthen/weaken based on interactions
- Nodes hide automatically when reaching 100% (mastered)

### Brain Region Legend
Bottom-left legend shows:
- Mapping of node types to "brain regions" (gamified neuroscience)
- Count of each node type
- Stats: Active nodes, average strength, completed nodes
- Collapsible for clean view

### Network Layout Engine
Custom force-directed layout algorithm:
- Arranges nodes by type in regional clusters
- Stronger nodes positioned more centrally
- Connections create visual relationships
- Automatic repositioning as network evolves

---

## 3. DAILY ACTION PROTOCOL

### Overview
**The engine that drives identity transformation.** Each day, the AI generates 3-5 micro-tasks tied to specific identity nodes.

### Action Generation
- **AI-powered**: Uses OpenAI to create personalized actions based on:
  - Current node strengths
  - Identity gaps (desired vs current strength)  
  - Recent progress/struggles
  - User context and mentor style
  
- **Smart targeting**: Prioritizes nodes with biggest gaps
- **Time-bound**: Each action has estimated time (5-30 min)
- **Node-linked**: Every action tied to specific identity node

### Action Lifecycle
```
Pending → Completed/Skipped → Strength Change → Node Update
```

**States**:
- `undefined`: Not yet attempted (default)
- `true`: Completed successfully
- `false`: Skipped/failed

### Strength Changes
- **Completed**: +5 to +10 strength points (randomized)
- **Skipped**: -3 to -7 strength points
- **Special**: Tracking node actions don't affect strength

### Daily Reset System
- Automatic at midnight (checks on app load)
- Clears previous day's actions
- Loads fresh actions from backend (or generates if none exist)
- Resets strength change trackers

### Backend Persistence
- Actions stored in SQLite database
- Tracked by date (YYYY-MM-DD)
- Status synced: pending → done → skipped
- Historical data retained for analytics

---

## 4. AI CHAT SYSTEM

### General Chat (Dashboard)
- Context-aware conversations with chosen mentor
- AI knows your identity profile, recent actions, strengths/weaknesses
- Chat history persisted per user (survives logout)
- Session-based (can have multiple conversation threads)
- References specific nodes in responses

### Work Session Chat (Deep Work Mode)
**Full-screen focused work mode** for intensive work on specific nodes:

**Features**:
- Select identity node to work on
- Dedicated chat interface for that node
- AI acts as accountability partner during work
- Real-time conversation during work session
- Session tracking: start time, messages, duration

**AI Behavior**:
- Tailored to selected node and mentor style
- Asks probing questions
- Provides guidance and encouragement  
- Challenges assumptions
- Tracks progress in real-time

**Session End**:
- AI determines strength change based on session quality
- Generates summary of work done
- Updates node strength accordingly
- Session saved for history/analytics

### Message Structure
Each message includes:
- Content, sender (user/ai), timestamp
- Optional `nodeId` (which node it references)
- Optional `context` (work-session, daily-action, general)
- Optional `sessionId` (conversation thread)

---

## 5. DASHBOARD & TRACKING

### Dashboard Layout
Two-tab interface:
1. **Daily Actions Tab** (default)
2. **Chat Tab**

### Daily Actions View Components:

#### A. Daily Tracker
**Multi-metric tracking system** with default metrics:
- 🔥 **Calories**: Nutrition tracking with target
- 💪 **Exercise**: Minutes of physical activity
- 💼 **Deep Work**: Hours of focused work
- 🌙 **Sleep**: Hours of sleep
- ❤️ **Mood**: 1-10 scale emotional state

**Features**:
- Visual progress bars with targets
- Color-coded by metric type
- Quick entry (click to edit)
- Can add custom metrics
- Syncs with backend (saved daily)

#### B. Alignment Score
**Visual representation of identity alignment**:
- Calculates gap between desired and current strength
- Shows as percentage (0-100%)
- Color gradient: red (low) → yellow (mid) → green (high)
- Updates in real-time as nodes change

#### C. Daily Proof Card
**Today's completed actions showcase**:
- Lists all completed actions for the day
- Shows strength changes per action (+5, +8, etc.)
- Visual celebration of progress
- Gamified "proof" you're becoming who you want to be

#### D. Today's Actions Card
**Action completion interface**:
- Shows all pending actions for today
- Check/skip buttons for each action
- Shows associated node for each action
- Real-time strength change feedback
- Regenerate actions button (if unhappy with suggestions)

#### E. End of Day Summary
**AI-generated reflection** (appears at end of day):
- Summary of day's progress
- Net strength changes across all nodes
- Top performing node
- Nodes needing attention
- Motivational message from AI mentor

### The Circuit Explanation
Visual guide showing the 6-step feedback loop:
1. Identity → 2. Action → 3. Measure → 4. Reinforce → 5. Evolve → 6. Repeat

---

## 6. PROFILE & SETTINGS

### User Profile
- Name, email display
- Account creation date
- Onboarding method used
- Email verification status

### Identity Overview
- Total nodes count by type
- Average strength across all nodes
- Mastered nodes count
- Active goals, developing traits, etc.

### Mentor Style Management
- View current mentor selection
- Change mentor at any time
- Each switch applies to future AI interactions

### Account Management
- Change password
- Export data (full JSON export of identity + actions)
- Delete specific data types (nodes, tracking, messages)
- Delete account (irreversible)

### Privacy Controls
- View data retention policies
- Clear chat history
- Clear work session history
- Export before deletion

---

## 7. BACKEND ARCHITECTURE

### Technology Stack
- **Server**: Express.js (TypeScript)
- **Database**: SQLite with better-sqlite3
- **AI**: OpenAI GPT-4
- **Email**: Resend API
- **Auth**: JWT tokens, bcrypt password hashing

### Database Schema

**Users Table**:
```
id, email, password_hash, name, created_at, email_verified, 
verification_token, reset_token, reset_token_expiry, 
onboarding_complete, onboarding_method, mentor_style
```

**Identity Nodes Table**:
```
id, user_id, label, type, strength, status, description, 
connections, created_at, updated_at
```

**Daily Actions Table**:
```
id, user_id, node_id, node_name, action_text, time_estimate,
date, status (pending/done/skipped), created_at, completed_at
```

**Daily Tracking Table**:
```
id, user_id, date, calories, exercise_minutes, deep_work_hours,
sleep_hours, mood, created_at, updated_at
```

**Work Sessions Table**:
```
id, user_id, node_id, node_name, started_at, ended_at,
strength_change, summary, created_at
```

**Work Session Messages Table**:
```
id, user_id, session_id, node_id, content, sender, created_at
```

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/me` - Get current user
- `POST /api/auth/verify-email` - Verify email with token
- `POST /api/auth/forgot-password` - Send reset email
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/resend-verification` - Resend verification email

#### Onboarding
- `POST /api/onboarding/complete` - Complete onboarding
- `POST /api/onboarding/analyze` - Analyze questionnaire/upload

#### Identity Nodes
- `GET /api/nodes` - Get all nodes for user
- `POST /api/nodes` - Create new node
- `POST /api/nodes/bulk` - Create multiple nodes
- `PATCH /api/nodes/:id` - Update node
- `DELETE /api/nodes/:id` - Delete node

#### Daily Actions
- `GET /api/actions/:date?` - Get actions for date (or today)
- `PATCH /api/actions/:id` - Mark action complete/skipped
- `POST /api/actions/regenerate` - Generate new actions for today

#### Daily Tracking
- `GET /api/tracking/:date?` - Get tracking data for date
- `POST /api/tracking` - Save/update tracking data
- `GET /api/tracking/history/:days` - Get last N days of tracking

#### Chat
- `POST /api/chat` - Send message, get AI response
- `POST /api/chat/work-session` - Work session chat

#### Work Sessions
- `GET /api/work-session/messages/:nodeId` - Get session history for node
- `POST /api/work-session/messages` - Save session message
- `DELETE /api/work-session/messages/:nodeId` - Clear session history

#### Profile & Settings
- `GET /api/profile` - Get user profile
- `PATCH /api/profile` - Update profile
- `POST /api/profile/change-password` - Change password
- `GET /api/profile/mentor-style` - Get mentor style
- `PATCH /api/profile/mentor-style` - Update mentor style

#### Data & Privacy
- `GET /api/user/data-export` - Export all user data
- `DELETE /api/user/data/:type` - Delete specific data type
- `DELETE /api/user/delete-account` - Delete account

#### Analytics & Summaries
- `GET /api/summary/:date?` - Get daily summary
- `GET /api/analytics` - Get analytics dashboard data

---

## 8. STATE MANAGEMENT (ZUSTAND)

### Core State
```typescript
{
  user: UserProfile | null,
  authToken: string | null,
  activeWorkSession: WorkSession | null,
  recentStrengthChanges: Record<string, number>, // For animations
  todayStrengthChanges: Record<string, number>, // Persistent daily total
  lastResetDate: string | null, // YYYY-MM-DD
  customMetrics: DailyMetric[], // Tracking metrics
  metricEntries: DailyMetricEntry[], // Tracking data
  chatSessionNames: Record<string, string>, // Session names
  userChatHistories: Record<userId, Message[]>, // Per-user chat history
}
```

### Key Actions
- **Auth**: setUser, login, logout, setUserFromApi
- **Nodes**: updateNodes, addNodes, deleteNode, updateNodeStrength
- **Chat**: addMessage, clearChatHistory, setChatSessionName
- **Actions**: setDailyActions, markActionComplete, loadDailyActionsFromBackend
- **Tracking**: updateTrackingData, setTrackingGoals
- **Sessions**: startWorkSession, endWorkSession, addWorkSessionMessage
- **Reset**: checkDailyReset (runs on app load)

### Persistence
- Entire state persisted to localStorage via Zustand persist middleware
- Survives page refresh, browser close
- Restored on app load
- Chat history persisted per user ID (survives logout/login)

---

## 9. USER INTERFACE & UX

### Design System
- **Theme**: Dark-first (optimized for extended use)
- **Style**: Glassmorphism with backdrop blur
- **Colors**: Purple → Blue → Teal gradient accent
- **Animations**: Framer Motion throughout
- **Icons**: Lucide React
- **Responsive**: Mobile-first, works on all screen sizes

### Layout Structure
```
AppLayout (Protected Routes)
├── Sidebar (desktop) / Bottom Nav (mobile)
│   ├── Mirror
│   ├── Dashboard  
│   ├── Profile
│   └── Experiment
└── Main Content Area
    └── Page Content
```

### Key UI Components

#### Sidebar Navigation
- **Mirror**: View psychological mirror
- **Dashboard**: Daily actions + chat
- **Profile**: Settings and account
- **Experiment**: (placeholder for future features)
- **Logout**: Sign out

#### Floating Mirror Button
- Always accessible from any page
- Quick access to view mirror
- Pulsing animation to draw attention

#### Modal Components
- Mentor selection
- Add/edit node
- Node details panel
- End of day summary
- Identity summary (Growth Core)

### Mobile Optimizations
- Collapsible sidebar → bottom navigation
- Touch-friendly action buttons
- Responsive text sizing
- Swipe gestures supported
- Mini-map hidden on mobile

---

## 10. AI INTEGRATION

### OpenAI Usage
**Model**: GPT-4 (configurable)

**Use Cases**:
1. **Onboarding Analysis**
   - Questionnaire response analysis
   - ChatGPT export parsing and pattern extraction
   - Initial node generation

2. **Daily Action Generation**
   - Analyzes current identity state
   - Identifies priority nodes
   - Generates micro-tasks with time estimates
   - Considers mentor style

3. **Chat Conversations**
   - Context-aware responses
   - References user's identity nodes
   - Adapts to chosen mentor style
   - Provides guidance and accountability

4. **Work Session Coaching**
   - Real-time guidance during deep work
   - Probing questions
   - Progress assessment
   - Strength change determination

5. **Daily Summaries**
   - End-of-day reflection generation
   - Pattern identification
   - Motivational messaging
   - Node performance analysis

### Mentor Style System
Four distinct AI personalities with different prompts:

**1. Ruthless Mentor**
- Direct, brutal honesty
- Calls out excuses
- High expectations
- "No pain, no gain" approach

**2. Strategic Architect**
- Systems thinking
- Framework building
- Logical analysis
- Process-oriented

**3. Psychological Mirror**
- Self-awareness focus
- Pattern reflection
- Questions over answers
- Socratic method

**4. Supportive Coach**
- Encouraging tone
- Celebrates wins
- Constructive criticism
- Growth mindset

### AI Prompts Structure
Each interaction includes:
- Base system prompt (defines mentor style)
- User context (identity nodes, recent actions, current strengths)
- Conversation history (for continuity)
- Specific task instruction
- Output format requirements

---

## 11. KEY USER FLOWS

### New User Journey
```
Landing Page 
  → Sign Up 
  → Email Verification 
  → Onboarding Choice 
  → Complete Onboarding Method 
  → Mentor Selection 
  → Psychological Mirror (First View)
  → Dashboard (Daily Actions)
```

### Daily User Flow
```
Login 
  → Daily Reset Check 
  → Dashboard 
  → View Today's Actions 
  → Complete Actions (+ Track Metrics)
  → See Strength Changes 
  → View Mirror Updates 
  → Chat with AI (optional)
  → End of Day Summary
```

### Deep Work Flow
```
Dashboard 
  → Select Node 
  → Start Work Session 
  → Full-Screen Focus Mode 
  → Chat with AI During Work 
  → Complete Session 
  → AI Determines Strength Change 
  → Return to Dashboard
```

---

## 12. DATA FLOW ARCHITECTURE

### Frontend → Backend
```
User Action (React) 
  → API Call (lib/api.ts) 
  → Express Route Handler 
  → Database Operation (db.ts) 
  → Response
```

### Backend → AI
```
Backend Receives Request 
  → Build Context (user data + nodes + history)
  → Format Prompt (ai.ts) 
  → OpenAI API Call 
  → Parse Response 
  → Return to Frontend
```

### State Updates
```
API Response 
  → Zustand Action 
  → State Update 
  → Component Re-render 
  → UI Update 
  → Persist to LocalStorage
```

---

## 13. CURRENT LIMITATIONS & KNOWN ISSUES

### Version 1 Constraints
1. **No Mobile App**: Web-only (responsive but not native)
2. **Limited Analytics**: Basic tracking, no advanced insights
3. **No Social Features**: Single-player experience
4. **No Notifications**: No push notifications or reminders
5. **No Export Formats**: JSON only (no PDF, CSV)
6. **No Voice**: Text-only interactions
7. **Basic Visualization**: 2D only (no true 3D)
8. **No Team/Shared**: Individual use only
9. **No Integrations**: No Fitbit, Apple Health, etc.
10. **Limited Customization**: Fixed color scheme, limited UI options

### Technical Debt
- No comprehensive testing suite
- Rate limiting basic (IP-based only)
- Email sending requires Resend API key
- No database migrations system
- No API versioning
- Frontend/backend tightly coupled

---

## 14. DEPLOYMENT

### Current Setup
- **Frontend**: Can deploy to Vercel, Netlify, or any static host
- **Backend**: Deployed to Fly.io
- **Database**: SQLite file (co-located with backend)
- **Domain**: evosai.ca

### Environment Variables Required
```
# Backend (.env)
OPENAI_API_KEY=sk-...
RESEND_API_KEY=re_...
APP_URL=https://evosai.ca
FRONTEND_URL=https://evosai.ca
PORT=3001
JWT_SECRET=your-secret

# Frontend (.env.local)
VITE_API_URL=https://evos-ai-hvb34q.fly.dev
```

---

## 15. VERSION 1 STRENGTHS

✅ **Core Loop Works**: Identity → Action → Measure → Reinforce → Evolve
✅ **Beautiful UI**: Polished, professional design
✅ **AI Integration**: Real personalization through OpenAI
✅ **Real-time Updates**: Instant feedback on actions
✅ **Persistent State**: Nothing lost on refresh/logout
✅ **Multiple Entry Points**: 3 onboarding methods
✅ **Customizable AI**: 4 mentor styles
✅ **Closed-loop Tracking**: Data → Actions → Growth
✅ **Visual Impact**: Mirror visualization is compelling
✅ **Mobile Responsive**: Works on all devices

---

## 16. WHAT VERSION 2 NEEDS TO ADDRESS

### Usability Improvements
- **Onboarding too long**: Need faster path to value
- **Mirror overwhelming**: Initial view can be complex
- **Action generation unclear**: Users don't know when they'll get new actions
- **Tracking friction**: Too many manual inputs
- **No guidance**: Users don't know what to do first
- **No tutorials**: No tooltips or walkthrough
- **Chat buried**: Hard to find/access

### Feature Gaps
- **No reminders**: Users forget to complete actions
- **No streaks/gamification**: Limited motivation loops
- **No progress visualization**: Can't see growth over time
- **No social proof**: No community or shared progress
- **No integrations**: Can't auto-import data
- **No voice input**: All typing required
- **Limited AI proactivity**: AI waits for user, doesn't prompt

### Technical Needs
- **Performance**: Large networks can lag
- **Mobile UX**: Some interactions clunky on touch
- **Offline mode**: Doesn't work without internet
- **Data export**: Need more formats and automation
- **Search**: Can't search nodes or chat history
- **Accessibility**: Limited screen reader support

---

## 17. SUCCESS METRICS (V1)

### User Engagement
- Daily Active Users (DAU)
- Actions completed per day
- Chat messages sent per user
- Time spent in mirror
- Onboarding completion rate

### Identity Progress
- Average node strength growth over time
- Nodes reaching "mastered" status
- Alignment score improvements
- Daily action completion rate

### AI Effectiveness
- Message response quality (qualitative)
- Action relevance (user skips vs completes)
- Mentor style preference distribution
- Work session completion rate

### Technical Metrics
- API response times
- Database query performance
- Frontend load times
- Error rates

---

## SUMMARY

**Evos AI Version 1** is a functional, beautiful identity transformation platform with a working closed-loop system connecting identity visualization, AI coaching, daily actions, and tracking.

**The core innovation works**: Users can see their identity as a network, take actions to change it, and watch it evolve in real-time.

**The main challenges for V2** are reducing friction, increasing engagement through better UX/gamification, and making the AI more proactive and integrated throughout the experience.

**Foundation is solid** - now it's about refinement, polish, and user-centered improvements.

---

*Generated: December 2024*
*Document Version: 1.0*
*Status: Complete - Ready for V2 Planning*
