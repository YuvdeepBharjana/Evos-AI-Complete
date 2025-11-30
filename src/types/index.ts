export type NodeType = 'habit' | 'goal' | 'trait' | 'emotion' | 'struggle';
export type NodeStatus = 'developing' | 'active' | 'mastered' | 'neglected';

export interface IdentityNode {
  id: string;
  label: string;
  type: NodeType;
  strength: number; // 0-100
  desiredStrength?: number; // 0-100, target strength user wants
  status: NodeStatus;
  connections: string[];
  lastUpdated: Date;
  description?: string;
}

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  nodeId?: string; // If message is related to a specific node work session
}

export interface UserProfile {
  id: string;
  name: string;
  onboardingComplete: boolean;
  onboardingMethod?: 'questionnaire' | 'upload' | 'manual';
  identityNodes: IdentityNode[];
  chatHistory: Message[];
  createdAt: Date;
  dailyActions?: DailyAction[];
  workSessions?: WorkSession[];
  alignmentScore?: number; // 0-100
  lastDailySummary?: DailySummary;
  trackingData?: TrackingData[]; // Daily tracking history
  trackingGoals?: TrackingGoals; // User's custom daily goals
}

export interface OnboardingQuestion {
  id: string;
  question: string;
  placeholder: string;
  category: NodeType;
}

// Daily Action Protocol Types
export interface DailyAction {
  id: string;
  nodeId: string;
  nodeName: string;
  action: string;
  timeEstimate: string; // e.g., "5 min", "15 min"
  completed: boolean | null; // null = not yet marked
  createdAt: Date;
  completedAt?: Date;
  strengthChange?: number; // +5 to +10 if completed, -3 to -7 if failed
}

export interface WorkSession {
  id: string;
  nodeId: string;
  nodeName: string;
  startedAt: Date;
  endedAt?: Date;
  messages: Message[];
  strengthChange?: number; // AI-determined change based on work quality
  summary?: string;
}

export interface DailySummary {
  date: Date;
  actionsCompleted: number;
  actionsFailed: number;
  totalStrengthChange: number;
  alignmentScore: number;
  reflection: string;
  topPerformingNode?: string;
  needsAttentionNode?: string;
}

// Helper type for gap analysis
export interface IdentityGap {
  node: IdentityNode;
  gap: number; // desiredStrength - strength
  suggestedAction: string;
}

// Daily tracking data
export interface TrackingData {
  date: Date;
  calories?: number;
  exerciseMinutes?: number;
  deepWorkHours?: number;
  sleepHours?: number;
  mood?: number; // 1-10
}

// Customizable tracking goals
export interface TrackingGoals {
  calories?: number;      // e.g., 2800
  exerciseMinutes?: number; // e.g., 60
  deepWorkHours?: number;   // e.g., 4
  sleepHours?: number;      // e.g., 8
  mood?: number;            // e.g., 7
}
