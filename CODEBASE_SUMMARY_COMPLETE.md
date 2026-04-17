# Evos AI - Complete Codebase Summary

**Version:** 1.0.0  
**Last Updated:** December 2024  
**Branch:** evos-ai-for-traders

---

## 🎯 Overview

Evos AI is a dual-purpose platform combining:
1. **Personal Growth & Identity Visualization** (Original Evos AI)
2. **Trading Discipline System** (Evos AI for Traders)

The platform helps users understand their identity through a psychological mirror visualization while also providing professional trading discipline tools for day traders.

---

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- React 19 + TypeScript
- Vite (build tool)
- Tailwind CSS 4.1
- Framer Motion (animations)
- React Router 7 (routing)
- Zustand (state management)
- React Flow / Force Graph (visualizations)
- Lucide React (icons)

**Backend:**
- Node.js + Express
- TypeScript
- SQLite (better-sqlite3)
- OpenAI API (GPT-4o-mini)
- Passport.js (OAuth: Google, Apple)
- JWT (authentication)
- Resend (email)

**Deployment:**
- Fly.io (backend)
- Vercel (frontend)
- Docker support

---

## 📁 Project Structure

```
Evos-AI/
├── src/                          # Frontend React app
│   ├── components/              # React components
│   │   ├── chat/                # AI chat interface
│   │   ├── daily/               # Daily actions/tracking
│   │   ├── layout/               # Layout components
│   │   │   ├── AppLayout.tsx    # Authenticated app layout
│   │   │   ├── AppSidebar.tsx   # Left sidebar navigation
│   │   │   ├── PublicLayout.tsx # Public pages layout
│   │   │   └── PublicTopNav.tsx # Public top navigation
│   │   ├── onboarding/          # Onboarding flows
│   │   ├── psychmirror/         # Identity network visualization
│   │   ├── tracking/            # Daily tracking components
│   │   └── ui/                  # Reusable UI components
│   ├── features/                # Feature modules
│   │   └── premarket/           # Premarket calibration feature
│   ├── lib/                     # Utility functions
│   │   ├── api.ts               # API client
│   │   ├── generateDailyActions.ts
│   │   ├── extractIdentityFromChat.ts
│   │   └── networkLayoutEngine.ts
│   ├── pages/                   # Route pages
│   │   ├── LandingPage.tsx      # Public landing
│   │   ├── LoginPage.tsx        # Authentication
│   │   ├── HomePage.tsx         # Main dashboard
│   │   ├── PremarketCalibrationPage.tsx
│   │   ├── PostMarketReviewPage.tsx
│   │   ├── DisciplineCalendarPage.tsx
│   │   ├── OnboardingPage.tsx
│   │   ├── MirrorPage.tsx       # Identity visualization
│   │   └── ProfilePage.tsx
│   ├── store/                   # Zustand stores
│   │   ├── useAuthStore.ts      # Auth state
│   │   ├── useUserStore.ts      # User data & identity nodes
│   │   └── useTradingDayStore.ts # Trading day management
│   ├── types/                   # TypeScript definitions
│   │   ├── auth.ts              # Auth types
│   │   ├── index.ts             # Identity node types
│   │   ├── tradingDay.ts        # Trading day types
│   │   └── tracking.ts           # Tracking types
│   └── data/                    # Static data
│       ├── questions.ts         # Onboarding questions
│       └── onboardingV2.ts     # Onboarding flow config
│
├── server/                      # Backend Express API
│   ├── index.ts                # Main server & routes
│   ├── db.ts                   # Database setup
│   ├── auth.ts                 # Authentication logic
│   ├── oauth.ts                # OAuth providers
│   ├── ai.ts                   # OpenAI integration
│   ├── email.ts                # Email service
│   ├── env.ts                  # Environment validation
│   └── prompts/                # AI system prompts
│       ├── disciplineJudge.system.ts
│       └── premarketCoach.system.ts
│
└── public/                      # Static assets
```

---

## 🎯 Core Features

### 1. Personal Growth & Identity System

#### Identity Nodes
- **Types:** Habits (green), Goals (blue), Traits (purple), Emotions (orange), Struggles (red)
- **Strength Score:** 0-100, determines visual appearance
- **Status:** Mastered, Active, Developing, Neglected
- **Connections:** Nodes can connect to show relationships

#### Psychological Mirror
- Interactive 3D/2D network visualization
- Nodes positioned by strength and relationships
- Real-time updates as user completes actions
- Filter by type, status, or search

#### Daily Actions (Proof-Moves)
- AI-generated binary actions from identity nodes
- Always includes tracking proof-move
- Completion affects node strength (+5 to +10 or -3 to -7)
- Adaptable via chat interface

#### Onboarding
- **Questionnaire:** 8 thoughtful questions
- **ChatGPT Import:** Extract identity from conversation history
- **Manual:** Direct node creation

---

### 2. Trading Discipline System

#### Trading Day Lifecycle

**1. Premarket Calibration** (`PremarketCalibrationPage.tsx`)
- Chatbot interface with AI coach
- Refines raw market thoughts into structured plan
- Returns:
  - `refinedAnalysis`: Human-readable analysis
  - `structuredPlan`: JSON structure with:
    - `bias`: "bullish" | "bearish" | "range"
    - `setup`: Primary setup description
    - `levels`: Array of key levels
    - `invalidation`: Explicit invalidation rule
    - `scenarios`: Optional if/then scenarios
- Locks plan before trading unlocks
- Displays "Active Trading Plan — LOCKED" panel after commit

**2. Trading Session**
- Unlocked only after premarket plan committed
- User tracks:
  - `tradesTaken`: Number of trades
  - `maxTradesAllowed`: Limit (default: 2)
  - `stopLossRespected`: Boolean
  - `revengeTrades`: Boolean
  - `impulsiveTrades`: Boolean

**3. Post-Market Review** (`PostMarketReviewPage.tsx`)
- Checklist for post-market ritual
- Close day workflow
- Discipline Judge AI evaluation:
  - `verdict`: "PASS" | "FAIL"
  - `violations`: Array of rule violations
  - `strengths`: Array of correct behaviors
  - `correction`: Actionable improvement instruction

**4. Discipline Calendar** (`DisciplineCalendarPage.tsx`)
- Visual calendar showing green/red days
- Streak tracking:
  - `currentStreak`: Consecutive green days
  - `longestStreak`: Best streak in history
  - `disciplineRate30`: % green days (last 30)

#### Discipline Engine

**Automatic Status Calculation** (`calculateDisciplineStatus`)
- Returns "green" ONLY IF ALL true:
  - `preMarketCompleted === true`
  - `preMarketPlan` exists
  - `tradesTaken <= maxTradesAllowed` (default: 2)
  - `stopLossRespected === true`
  - `revengeTrades === false`
  - `impulsiveTrades === false`
- Otherwise returns "red"
- Fail-safe: Missing booleans treated as failures

**Status Types:**
- `green`: Full discipline maintained
- `red`: Discipline broken
- `neutral`: No trades, but rituals completed

---

### 3. Authentication & User Management

#### Auth Methods
- Email/Password (JWT)
- Google OAuth
- Apple Sign-In

#### User Tiers
- `free`: Default tier
- `pro`: Premium tier (future Stripe integration)

#### Feature Gating
- Post-Market Review: PRO only
- Lock icons on locked features
- Upgrade CTA in sidebar for free users
- Redirects to `/pricing` when locked features clicked

---

### 4. AI Agents

#### Premarket Coach (`POST /api/ai/premarket-coach`)
- **Input:** Raw trader thoughts/analysis
- **Output:** Structured plan + refined analysis
- **Model:** GPT-4o-mini, temperature 0.3
- **Format:** Strict JSON with validation

#### Discipline Judge (`POST /api/ai/discipline-judge`)
- **Input:** Closed TradingDay object
- **Output:** Verdict, violations, strengths, correction
- **Model:** GPT-4o-mini
- **Behavior:** Strict, professional, behavior-focused (not PnL)

#### Identity Analysis (`POST /api/ai/analyze-identity`)
- Extracts identity nodes from text
- Used in onboarding flows

#### Daily Actions Generator (`POST /api/ai/actions/generate`)
- Generates proof-moves from identity nodes
- Context-aware using node connections

#### Chat (`POST /api/ai/chat`)
- Personalized conversations
- Context-aware responses
- Mentor styles (Socratic, Direct, Supportive)

---

## 🔄 Key Workflows

### Trading Day Workflow

```
1. User opens app → HomePage
   ↓
2. Clicks "Premarket Calibration"
   ↓
3. PremarketCalibrationPage:
   - Chat with AI coach
   - Refine market analysis
   - Commit structured plan
   ↓
4. Trading unlocks (isTradingUnlocked = true)
   ↓
5. User trades (tracks behavior)
   ↓
6. Market closes → PostMarketReviewPage
   ↓
7. Complete post-market checklist
   ↓
8. Close day → Discipline Engine calculates finalStatus
   ↓
9. Discipline Judge AI provides feedback
   ↓
10. Day appears in DisciplineCalendarPage
```

### Identity Growth Workflow

```
1. Onboarding → Create identity nodes
   ↓
2. Daily actions generated from nodes
   ↓
3. User completes actions
   ↓
4. Node strength updates
   ↓
5. Status recalculated (mastered/active/etc)
   ↓
6. Psych Mirror visualization updates
   ↓
7. Alignment score recalculated
```

---

## 💾 Data Models

### TradingDay
```typescript
{
  id: string;
  date: string; // YYYY-MM-DD
  preMarketCompleted: boolean;
  preMarketPlan?: string;
  preMarketStructuredPlan?: {
    bias: 'bullish' | 'bearish' | 'range';
    setup: string;
    levels: string[];
    invalidation: string;
    scenarios?: string[];
  };
  postMarketCompleted: boolean;
  rulesFollowed: boolean | null;
  tradesTaken?: number;
  maxTradesAllowed?: number;
  stopLossRespected?: boolean;
  revengeTrades?: boolean;
  impulsiveTrades?: boolean;
  finalStatus: 'green' | 'red' | 'neutral' | null;
  isClosed: boolean;
  createdAt: string;
  closedAt?: string;
}
```

### IdentityNode
```typescript
{
  id: string;
  label: string;
  type: 'habit' | 'goal' | 'trait' | 'emotion' | 'struggle';
  strength: number; // 0-100
  desiredStrength: number; // 0-100
  status: 'mastered' | 'active' | 'developing' | 'neglected';
  connections: string[]; // Node IDs
  description?: string;
  createdAt: string;
}
```

### AppUser
```typescript
{
  id: string;
  email: string;
  name: string;
  onboardingComplete: boolean;
  onboardingMethod?: 'questionnaire' | 'upload' | 'manual';
  tier?: 'free' | 'pro';
}
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Email/password registration
- `POST /api/auth/login` - Email/password login
- `GET /api/auth/me` - Get current user
- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/apple` - Apple Sign-In
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Reset password

### AI
- `POST /api/ai/chat` - Chat with AI
- `POST /api/ai/analyze-identity` - Extract identity from text
- `POST /api/ai/premarket-coach` - Premarket analysis
- `POST /api/ai/discipline-judge` - Evaluate trading day
- `POST /api/ai/actions/generate` - Generate daily actions
- `POST /api/ai/summary` - Generate daily summary

### User Data
- `GET /api/user/nodes` - Get identity nodes
- `POST /api/user/nodes` - Create/update nodes
- `DELETE /api/user/nodes/:id` - Delete node
- `GET /api/actions/:date?` - Get daily actions
- `PATCH /api/actions/:id` - Update action status
- `POST /api/actions/regenerate` - Regenerate actions

---

## 🎨 UI/UX Patterns

### Layouts
- **PublicLayout:** Top navigation for marketing pages
- **AppLayout:** Left sidebar for authenticated app

### Navigation
- **PublicTopNav:** Logo, Vision, Pricing, Testimonials, Contact, Login
- **AppSidebar:** Home, Premarket, Post-Market, Calendar, Profile, Settings
  - Tier badge (FREE/PRO)
  - Upgrade CTA for free users
  - Lock icons on PRO features

### Design System
- Dark theme (`bg-[#030014]`)
- Glassmorphic UI
- Gradient accents (indigo → cyan)
- Framer Motion animations
- Mobile-responsive (Tailwind breakpoints)

---

## 🔒 Security & Privacy

- JWT authentication
- Password hashing (bcrypt)
- OAuth 2.0 (Google, Apple)
- CORS configuration
- Rate limiting (future)
- SQL injection protection (parameterized queries)
- Environment variable validation

---

## 📊 State Management

### Zustand Stores

**useAuthStore:**
- Auth status (loading/authed/unauthed)
- Token management
- OAuth flow state

**useUserStore:**
- User profile
- Identity nodes
- Daily actions
- Onboarding state
- Persisted to localStorage

**useTradingDayStore:**
- Current trading day
- Historical days
- Discipline calculations
- Streak tracking
- Persisted to localStorage

---

## 🚀 Deployment

### Backend (Fly.io)
- Docker container
- SQLite database
- Environment variables via Fly secrets
- Health check endpoint

### Frontend (Vercel)
- Static build (Vite)
- Environment variables
- Custom domain support

---

## 🔮 Future Enhancements

### Trading Features
- [ ] Advanced analytics dashboard
- [ ] Trade journal integration
- [ ] Performance metrics
- [ ] Risk management tools
- [ ] Market sentiment analysis

### Personal Growth
- [ ] Social features (anonymous sharing)
- [ ] Mobile app
- [ ] Voice interaction
- [ ] Habit tracking with reminders
- [ ] Progress analytics
- [ ] Export/backup functionality

### Platform
- [ ] Stripe integration for PRO tier
- [ ] Email notifications
- [ ] Push notifications
- [ ] Multi-language support
- [ ] API rate limiting
- [ ] Advanced caching

---

## 📝 Key Files Reference

### Frontend Core
- `src/App.tsx` - Main router configuration
- `src/store/useTradingDayStore.ts` - Trading day state & discipline engine
- `src/store/useUserStore.ts` - User & identity state
- `src/lib/api.ts` - API client

### Trading Features
- `src/pages/PremarketCalibrationPage.tsx` - Premarket chatbot
- `src/pages/PostMarketReviewPage.tsx` - Post-market review
- `src/pages/DisciplineCalendarPage.tsx` - Calendar visualization
- `src/features/premarket/components/ActiveTradingPlanPanel.tsx` - Locked plan display

### Backend Core
- `server/index.ts` - Express server & routes
- `server/ai.ts` - OpenAI integration
- `server/auth.ts` - Authentication logic
- `server/prompts/disciplineJudge.system.ts` - Discipline Judge prompt
- `server/prompts/premarketCoach.system.ts` - Premarket Coach prompt

---

## 🎯 Design Philosophy

1. **Discipline Over PnL:** Focus on behavior, not profit
2. **Ritual-Based:** Premarket and post-market rituals are mandatory
3. **Visual Feedback:** Calendar and streaks provide immediate feedback
4. **AI-Assisted:** AI coaches guide but don't replace trader judgment
5. **Fail-Safe:** Missing data defaults to "red" (strict discipline)

---

## 📚 Documentation Files

- `README.md` - Getting started guide
- `CODEBASE_SUMMARY.md` - Daily actions & node connections
- `CODEBASE_SUMMARY_COMPLETE.md` - This file
- `OAUTH_SETUP.md` - OAuth configuration
- `DEPLOY.md` - Deployment guide
- `TRADING_DAY_SYSTEM.md` - Trading day system details

---

**Built with passion for trading discipline and personal growth.**
