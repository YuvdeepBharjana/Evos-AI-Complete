# Evos AI - Your Identity, Visualized 🧠

**Most apps give answers — we give identity.**

Evos AI is a revolutionary personal growth platform that creates a living, breathing psychological mirror of who you are. Instead of static dashboards or generic advice, Evos builds a dynamic neural network visualization of your habits, goals, traits, and challenges.

## ✨ Key Features

### 🎯 Dual Onboarding Options
- **Smart Questionnaire**: Answer 8 thoughtful questions for instant personalization
- **ChatGPT Import**: Upload your AI conversation history for automatic identity extraction

### 🧠 Psychological Mirror
The star feature - a beautiful, interactive neural network visualization showing:
- **Nodes**: Represent habits, goals, traits, emotions, and struggles
- **Brightness**: Indicates strength and consistency
- **Connections**: Shows relationships between different aspects of your identity
- **Real-time Updates**: Evolves as you grow and interact with the AI

### 💬 AI Chat Companion
- Personalized conversations based on your identity profile
- Context-aware responses that reference your goals and challenges
- Continuous learning about your patterns and preferences

### 📊 Profile & Analytics
- Track your growth over time
- View identity breakdowns by category
- Monitor active goals and mastered traits

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- OpenAI API key (required for AI features)
- (Optional) Google OAuth credentials
- (Optional) Apple Sign-In credentials
- (Optional) Resend API key for emails

### Installation

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server && npm install
```

### Environment Setup

#### Backend (.env in root directory)
Copy `server/.env.example` to `.env` in the root directory and configure:

**Required:**
```bash
OPENAI_API_KEY=sk-your-key-here
JWT_SECRET=your-secure-random-string
APP_URL=http://localhost:5173
BACKEND_URL=http://localhost:3001
```

**Optional - Google OAuth:**
```bash
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

Setup: https://console.cloud.google.com/apis/credentials
- Create OAuth 2.0 Client ID
- Add redirect URI: `http://localhost:3001/api/auth/google/callback`
- For production: `https://yourdomain.com/api/auth/google/callback`

**Optional - Apple Sign-In:**
```bash
APPLE_CLIENT_ID=com.yourcompany.yourapp
APPLE_TEAM_ID=YOUR10DIGIT
APPLE_KEY_ID=YOUR10CHAR
APPLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
```

Setup: https://developer.apple.com
1. Create Service ID in Identifiers
2. Enable "Sign in with Apple"
3. Add return URL: `http://localhost:3001/api/auth/apple/callback`
4. Create Key for Sign in with Apple
5. Download .p8 private key file

**Optional - Email:**
```bash
RESEND_API_KEY=re_your_resend_key
```

#### Frontend (.env.local)
```bash
VITE_API_URL=http://localhost:3001/api
```

### Running the App

```bash
# Terminal 1: Start backend server
cd server && npm run dev

# Terminal 2: Start frontend
npm run dev
```

App will be available at: http://localhost:5173

### Build for Production

```bash
# Build frontend
npm run build

# Build backend
cd server && npm run build

# Start production server
cd server && npm run start:prod
```

## 🛠 Tech Stack

- **React 18** + **TypeScript** - Type-safe component architecture
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations and transitions
- **React Flow** - Interactive node-based visualization
- **Zustand** - Lightweight state management
- **React Router** - Client-side routing
- **React Dropzone** - File upload handling

## 🎨 Design Philosophy

- **Dark-first**: Beautiful glassmorphic UI optimized for extended use
- **Micro-interactions**: Every action feels alive and responsive
- **Visual storytelling**: Data visualization that tells your story
- **Minimalist with personality**: Clean but never boring

## 📁 Project Structure

```
src/
├── components/
│   ├── chat/           # AI chat interface
│   ├── layout/         # App layout components
│   ├── onboarding/     # Onboarding flows
│   ├── psychmirror/    # Neural network visualization
│   └── ui/             # Reusable UI components
├── lib/                # Utility functions
├── pages/              # Route pages
├── store/              # Zustand state management
├── types/              # TypeScript definitions
└── data/               # Static data (questions, etc.)
```

## 🎯 Core Concepts

### Identity Nodes
Each node represents an aspect of your identity:
- **💚 Habits** (Green): Daily actions and routines
- **🔵 Goals** (Blue): Objectives and aspirations
- **🟣 Traits** (Purple): Core values and characteristics
- **🟡 Emotions** (Orange): Emotional patterns
- **🔴 Struggles** (Red): Challenges and areas for growth

### Node Status
- **💚 Mastered**: Strong, consistent, core strengths
- **⚡ Active**: Currently working on, good momentum
- **🌱 Developing**: Early stages, building up
- **💤 Neglected**: Needs attention

### Strength Score
Every node has a strength score (0-100) that determines:
- Visual brightness and opacity
- Node size
- Connection thickness
- Position in the network

## 🔒 Privacy & Data

- All data stored locally in browser
- No server-side processing in this demo
- ChatGPT imports process YOUR data, not OpenAI's models
- Complete user ownership of personal information

## 🚧 Future Enhancements

- [ ] Real AI backend integration
- [ ] Advanced NLP for better pattern extraction
- [ ] Social features (share anonymous progress)
- [ ] Mobile app
- [ ] Voice interaction
- [ ] Habit tracking with reminders
- [ ] Progress analytics and insights
- [ ] Export/backup functionality

## 💡 Why Evos?

Traditional productivity apps treat you like a checklist. Therapy apps treat you like a patient. AI chatbots treat you like a conversation partner.

**Evos treats you like a complete person.**

By visualizing your entire identity as an interconnected system, Evos helps you:
- See patterns you couldn't see before
- Understand how different parts of your life connect
- Track growth in a meaningful, visual way
- Stay motivated through gamified progress
- Feel truly understood by technology

## 🎬 Demo Flow

1. **Choose onboarding method**
2. **Complete setup** (questionnaire or upload)
3. **See your mirror generated** instantly
4. **Explore the visualization** - zoom, filter, click nodes
5. **Chat with AI** that knows you
6. **Watch your identity evolve** over time

## 📝 License

This is a demo project. All rights reserved.

## 🙏 Credits

Built with passion for psychological insight and beautiful UX.

---

**Evos AI** - Know Yourself. Grow Yourself.
