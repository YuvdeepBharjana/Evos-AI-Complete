import type { UserProfile, IdentityNode, Message } from '../types';

export const DEMO_USER_EMAIL = 'demo@evos.ai';

export const demoIdentityNodes: IdentityNode[] = [
  // GOALS (Blue)
  {
    id: 'demo-1',
    label: 'Launch MVP',
    type: 'goal',
    strength: 85,
    status: 'active',
    connections: ['demo-6', 'demo-7'],
    lastUpdated: new Date(),
    description: 'Ship the first version of my product by Q1'
  },
  {
    id: 'demo-2',
    label: 'Secure Seed Funding',
    type: 'goal',
    strength: 70,
    status: 'active',
    connections: ['demo-1', 'demo-10'],
    lastUpdated: new Date(),
    description: 'Raise $500K to scale the team'
  },
  {
    id: 'demo-3',
    label: 'Build a Great Team',
    type: 'goal',
    strength: 65,
    status: 'developing',
    connections: ['demo-9'],
    lastUpdated: new Date(),
    description: 'Hire 3 key people in the next 6 months'
  },

  // HABITS (Green)
  {
    id: 'demo-4',
    label: 'Morning Meditation',
    type: 'habit',
    strength: 75,
    status: 'active',
    connections: ['demo-8'],
    lastUpdated: new Date(),
    description: '15 minutes every morning to center myself'
  },
  {
    id: 'demo-5',
    label: 'Daily Standups',
    type: 'habit',
    strength: 90,
    status: 'mastered',
    connections: ['demo-1', 'demo-3'],
    lastUpdated: new Date(),
    description: 'Keep the team aligned with quick syncs'
  },
  {
    id: 'demo-6',
    label: 'Deep Work Blocks',
    type: 'habit',
    strength: 60,
    status: 'developing',
    connections: ['demo-1', 'demo-11'],
    lastUpdated: new Date(),
    description: '3 hours of focused coding in the morning'
  },
  {
    id: 'demo-7',
    label: 'Weekly Reflection',
    type: 'habit',
    strength: 55,
    status: 'developing',
    connections: ['demo-8'],
    lastUpdated: new Date(),
    description: 'Sunday evening review of wins and lessons'
  },

  // TRAITS (Purple)
  {
    id: 'demo-8',
    label: 'Resilience',
    type: 'trait',
    strength: 85,
    status: 'mastered',
    connections: ['demo-10', 'demo-12'],
    lastUpdated: new Date(),
    description: 'Bouncing back from setbacks quickly'
  },
  {
    id: 'demo-9',
    label: 'Visionary Thinking',
    type: 'trait',
    strength: 80,
    status: 'mastered',
    connections: ['demo-1', 'demo-2'],
    lastUpdated: new Date(),
    description: 'Seeing the big picture and inspiring others'
  },
  {
    id: 'demo-10',
    label: 'Perfectionism',
    type: 'trait',
    strength: 70,
    status: 'active',
    connections: ['demo-11'],
    lastUpdated: new Date(),
    description: 'High standards, sometimes to a fault'
  },

  // STRUGGLES (Red)
  {
    id: 'demo-11',
    label: 'Delegation',
    type: 'struggle',
    strength: 45,
    status: 'developing',
    connections: ['demo-3', 'demo-10'],
    lastUpdated: new Date(),
    description: 'Learning to trust others with important tasks'
  },
  {
    id: 'demo-12',
    label: 'Work-Life Balance',
    type: 'struggle',
    strength: 40,
    status: 'developing',
    connections: ['demo-4'],
    lastUpdated: new Date(),
    description: 'Startup life bleeds into personal time'
  },
  {
    id: 'demo-13',
    label: 'Imposter Syndrome',
    type: 'struggle',
    strength: 35,
    status: 'developing',
    connections: ['demo-2', 'demo-8'],
    lastUpdated: new Date(),
    description: 'Sometimes doubting if I belong here'
  },

  // EMOTIONS (Orange)
  {
    id: 'demo-14',
    label: 'Excitement',
    type: 'emotion',
    strength: 80,
    status: 'active',
    connections: ['demo-1', 'demo-9'],
    lastUpdated: new Date(),
    description: 'The thrill of building something new'
  },
  {
    id: 'demo-15',
    label: 'Anxiety',
    type: 'emotion',
    strength: 50,
    status: 'active',
    connections: ['demo-2', 'demo-13'],
    lastUpdated: new Date(),
    description: 'Worry about runway and competition'
  },
  {
    id: 'demo-16',
    label: 'Determination',
    type: 'emotion',
    strength: 90,
    status: 'mastered',
    connections: ['demo-8', 'demo-1'],
    lastUpdated: new Date(),
    description: 'Unwavering commitment to the mission'
  }
];

export const demoChatHistory: Message[] = [
  {
    id: 'msg-demo-1',
    content: "I've been feeling overwhelmed with everything on my plate. How do I prioritize?",
    sender: 'user',
    timestamp: new Date(Date.now() - 86400000)
  },
  {
    id: 'msg-demo-2',
    content: "I can see from your identity mirror that you're juggling Launch MVP and Secure Seed Funding as your top goals, while also working on Delegation as an area of growth.\n\nHere's what I suggest:\n\n1. **Block time for MVP work** - Your Deep Work Blocks habit is developing. Protect 3 hours every morning for coding.\n\n2. **Delegate investor prep** - This connects to your Delegation struggle. Can someone on your team help with the pitch deck?\n\n3. **Use your Resilience** - It's one of your strongest traits at 85%. When things get tough, remember you've bounced back before.\n\nWhat feels most urgent right now?",
    sender: 'ai',
    timestamp: new Date(Date.now() - 86300000)
  }
];

export const createDemoProfile = (_email: string, name: string = 'Alex Chen'): UserProfile => ({
  id: 'demo-user-alex',
  name,
  onboardingComplete: true,
  onboardingMethod: 'questionnaire',
  identityNodes: demoIdentityNodes,
  chatHistory: demoChatHistory,
  createdAt: new Date(Date.now() - 604800000)
});

