export type NodeType = 'habit' | 'goal' | 'trait' | 'emotion' | 'struggle';
export type NodeStatus = 'developing' | 'active' | 'mastered' | 'neglected';

export interface IdentityNode {
  id: string;
  label: string;
  type: NodeType;
  strength: number; // 0-100
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
}

export interface UserProfile {
  id: string;
  name: string;
  onboardingComplete: boolean;
  onboardingMethod?: 'questionnaire' | 'upload';
  identityNodes: IdentityNode[];
  chatHistory: Message[];
  createdAt: Date;
}

export interface OnboardingQuestion {
  id: string;
  question: string;
  placeholder: string;
  category: NodeType;
}


