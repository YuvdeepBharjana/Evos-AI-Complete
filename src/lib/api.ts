const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Token management
let authToken: string | null = localStorage.getItem('evos_token');

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem('evos_token', token);
  } else {
    localStorage.removeItem('evos_token');
  }
}

export function getAuthToken(): string | null {
  return authToken;
}

// Auth headers
function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  return headers;
}

// ============================================
// AUTHENTICATION
// ============================================

export interface User {
  id: string;
  email: string;
  name: string;
  onboarding_complete: boolean;
  onboarding_method?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export async function register(
  email: string, 
  password: string, 
  name: string,
  acceptedTerms: boolean = true
): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name, acceptedTerms }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Registration failed');
  }
  
  const data = await response.json();
  setAuthToken(data.token);
  return data;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }
  
  const data = await response.json();
  setAuthToken(data.token);
  return data;
}

export async function demoLogin(): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE}/auth/demo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  
  if (!response.ok) {
    throw new Error('Demo login failed');
  }
  
  const data = await response.json();
  setAuthToken(data.token);
  return data;
}

export async function getCurrentUser(): Promise<User | null> {
  if (!authToken) return null;
  
  try {
    const response = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      setAuthToken(null);
      return null;
    }
    
    const data = await response.json();
    return data.user;
  } catch {
    return null;
  }
}

export function logout() {
  setAuthToken(null);
}

// ============================================
// MENTOR STYLE
// ============================================

export type AIMentorStyle = 'ruthless' | 'architect' | 'mirror' | 'coach';

export interface MentorStyleInfo {
  id: AIMentorStyle;
  name: string;
  description: string;
  traits: string[];
}

export const MENTOR_STYLES: MentorStyleInfo[] = [
  {
    id: 'ruthless',
    name: 'The Ruthless Mentor',
    description: 'No excuses. No sugarcoating. Delivers uncompromising truth that cuts through emotional fog.',
    traits: ['Brutally honest', 'High expectations', 'Pressure-tested accountability', 'Zero tolerance for excuses']
  },
  {
    id: 'architect',
    name: 'The Strategic Architect',
    description: 'Systems thinking mastermind. Helps you build frameworks and optimize your identity engineering.',
    traits: ['Pattern recognition', 'Systems design', 'Strategic planning', 'Optimization focused']
  },
  {
    id: 'mirror',
    name: 'The Psychological Mirror',
    description: 'Deep self-awareness guide. Reflects your patterns back to you with profound psychological insight.',
    traits: ['Self-reflection', 'Pattern awareness', 'Emotional intelligence', 'Deep questioning']
  },
  {
    id: 'coach',
    name: 'The Supportive Coach',
    description: 'Encouraging and empathetic. Celebrates progress while gently pushing you toward your goals.',
    traits: ['Encouraging', 'Empathetic', 'Celebrates wins', 'Gentle guidance']
  }
];

export async function getMentorStyle(): Promise<AIMentorStyle | null> {
  try {
    const response = await fetch(`${API_BASE}/profile/mentor-style`, {
      headers: getHeaders(),
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return data.mentorStyle || null;
  } catch {
    return null;
  }
}

export async function setMentorStyle(style: AIMentorStyle): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/profile/mentor-style`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ mentorStyle: style }),
    });
    
    return response.ok;
  } catch {
    return false;
  }
}

// ============================================
// ONBOARDING
// ============================================

export interface OnboardingResult {
  success: boolean;
  user: User;
  nodes: any[];
}

export async function completeOnboarding(
  method: 'questionnaire' | 'upload' | 'manual',
  nodes: any[]
): Promise<OnboardingResult | null> {
  try {
    const response = await fetch(`${API_BASE}/onboarding/complete`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ method, nodes }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Onboarding error:', error);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Onboarding request failed:', error);
    return null;
  }
}

// ============================================
// DATA PROTECTION
// ============================================

export async function exportUserData(): Promise<Blob | null> {
  try {
    const response = await fetch(`${API_BASE}/user/data-export`, {
      headers: getHeaders(),
    });
    
    if (!response.ok) return null;
    
    return await response.blob();
  } catch {
    return null;
  }
}

export async function deleteAccount(password: string, confirmation: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/user/delete-account`, {
      method: 'DELETE',
      headers: getHeaders(),
      body: JSON.stringify({ password, confirmation }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return { success: false, error: data.error };
    }
    
    setAuthToken(null);
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to delete account' };
  }
}

export async function deleteUserData(type: 'chat' | 'tracking' | 'actions' | 'summaries'): Promise<{ success: boolean; deleted?: number }> {
  try {
    const response = await fetch(`${API_BASE}/user/data/${type}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    
    if (!response.ok) return { success: false };
    
    const data = await response.json();
    return { success: true, deleted: data.deleted };
  } catch {
    return { success: false };
  }
}

export async function getPrivacyInfo(): Promise<any> {
  try {
    const response = await fetch(`${API_BASE}/user/privacy`, {
      headers: getHeaders(),
    });
    
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

// ============================================
// EMAIL VERIFICATION & PASSWORD RESET
// ============================================

export async function resendVerification(): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/auth/resend-verification`, {
      method: 'POST',
      headers: getHeaders(),
    });
    
    const data = await response.json();
    if (!response.ok) return { success: false, error: data.error };
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to send verification email' };
  }
}

export async function verifyEmail(token: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    
    const data = await response.json();
    if (!response.ok) return { success: false, error: data.error };
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to verify email' };
  }
}

export async function forgotPassword(email: string): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    
    const data = await response.json();
    if (!response.ok) return { success: false, error: data.error };
    return { success: true, message: data.message };
  } catch {
    return { success: false, error: 'Failed to process request' };
  }
}

export async function resetPassword(token: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });
    
    const data = await response.json();
    if (!response.ok) return { success: false, error: data.error };
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to reset password' };
  }
}

// ============================================
// PROFILE
// ============================================

export interface ProfileData {
  user: {
    id: string;
    email: string;
    name: string;
    created_at: string;
    email_verified: boolean;
    experiment_start_date: string | null;
    current_streak: number;
    longest_streak: number;
  };
  stats: {
    nodesCreated: number;
    trackingDays: number;
    actionsCompleted: number;
    workSessions: number;
  };
}

export async function getProfile(): Promise<ProfileData | null> {
  try {
    const response = await fetch(`${API_BASE}/profile`, {
      headers: getHeaders(),
    });
    
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

export async function updateProfile(name: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/profile`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ name }),
    });
    
    const data = await response.json();
    if (!response.ok) return { success: false, error: data.error };
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to update profile' };
  }
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/profile/change-password`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    
    const data = await response.json();
    if (!response.ok) return { success: false, error: data.error };
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to change password' };
  }
}

// ============================================
// 30-DAY EXPERIMENT
// ============================================

export interface ExperimentData {
  started: boolean;
  startDate?: string;
  endDate?: string;
  dayNumber?: number;
  daysRemaining?: number;
  isCompleted?: boolean;
  currentStreak?: number;
  longestStreak?: number;
  progress?: number;
  activities?: Array<{ date: string; actions_done: number; actions_total?: number; tracked: number }>;
  milestones?: Array<{ type: string; achieved_at: string; metadata: string }>;
  message?: string;
}

export async function getExperiment(): Promise<ExperimentData | null> {
  try {
    const response = await fetch(`${API_BASE}/experiment`, {
      headers: getHeaders(),
    });
    
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

export async function startExperiment(): Promise<{ success: boolean; startDate?: string; endDate?: string; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/experiment/start`, {
      method: 'POST',
      headers: getHeaders(),
    });
    
    const data = await response.json();
    if (!response.ok) return { success: false, error: data.error };
    return { success: true, startDate: data.startDate, endDate: data.endDate };
  } catch {
    return { success: false, error: 'Failed to start experiment' };
  }
}

export async function checkIn(): Promise<{ streak?: number; longestStreak?: number; message?: string; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/experiment/checkin`, {
      method: 'POST',
      headers: getHeaders(),
    });
    
    return await response.json();
  } catch {
    return { error: 'Failed to check in' };
  }
}

// ============================================
// IDENTITY NODES
// ============================================

export interface IdentityNode {
  id: string;
  label: string;
  type: 'goal' | 'habit' | 'trait' | 'emotion' | 'struggle' | 'interest';
  strength: number;
  status: 'mastered' | 'active' | 'developing' | 'neglected';
  description?: string;
}

export async function getNodes(): Promise<IdentityNode[]> {
  try {
    const response = await fetch(`${API_BASE}/nodes`, {
      headers: getHeaders(),
    });
    
    if (!response.ok) return [];
    
    const data = await response.json();
    return data.nodes;
  } catch {
    return [];
  }
}

export async function createNode(node: Partial<IdentityNode>): Promise<IdentityNode | null> {
  try {
    const response = await fetch(`${API_BASE}/nodes`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(node),
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return data.node;
  } catch {
    return null;
  }
}

export async function updateNode(id: string, updates: Partial<IdentityNode>): Promise<IdentityNode | null> {
  try {
    const response = await fetch(`${API_BASE}/nodes/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return data.node;
  } catch {
    return null;
  }
}

export async function deleteNode(id: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/nodes/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return response.ok;
  } catch {
    return false;
  }
}

// ============================================
// DAILY TRACKING
// ============================================

export interface DailyTracking {
  id?: string;
  date: string;
  calories?: number;
  exercise_mins?: number;
  deep_work_hrs?: number;
  sleep_hrs?: number;
  mood?: number;
  notes?: string;
}

export async function getTracking(date?: string): Promise<DailyTracking | null> {
  try {
    const url = date ? `${API_BASE}/tracking/${date}` : `${API_BASE}/tracking`;
    const response = await fetch(url, {
      headers: getHeaders(),
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return data.tracking;
  } catch {
    return null;
  }
}

export async function saveTracking(tracking: DailyTracking): Promise<DailyTracking | null> {
  try {
    const response = await fetch(`${API_BASE}/tracking`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(tracking),
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return data.tracking;
  } catch {
    return null;
  }
}

export async function getTrackingHistory(days: number = 7): Promise<DailyTracking[]> {
  try {
    const response = await fetch(`${API_BASE}/tracking/history/${days}`, {
      headers: getHeaders(),
    });
    
    if (!response.ok) return [];
    
    const data = await response.json();
    return data.history;
  } catch {
    return [];
  }
}

// ============================================
// DAILY ACTIONS
// ============================================

export interface DailyAction {
  id: string;
  date: string;
  node_id?: string;
  node_name: string;
  action_text: string;
  time_estimate?: string;
  status: 'pending' | 'done' | 'skipped';
}

export async function getDailyActions(date?: string): Promise<DailyAction[]> {
  try {
    const url = date ? `${API_BASE}/actions/${date}` : `${API_BASE}/actions`;
    const response = await fetch(url, {
      headers: getHeaders(),
    });
    
    if (!response.ok) return [];
    
    const data = await response.json();
    return data.actions;
  } catch {
    return [];
  }
}

export async function updateActionStatus(id: string, status: 'done' | 'skipped'): Promise<DailyAction | null> {
  try {
    const response = await fetch(`${API_BASE}/actions/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return data.action;
  } catch {
    return null;
  }
}

export async function regenerateActions(): Promise<DailyAction[]> {
  try {
    const response = await fetch(`${API_BASE}/actions/regenerate`, {
      method: 'POST',
      headers: getHeaders(),
    });
    
    if (!response.ok) return [];
    
    const data = await response.json();
    return data.actions;
  } catch {
    return [];
  }
}

// ============================================
// CHAT
// ============================================

export interface ChatMessage {
  content: string;
  sender: 'user' | 'ai';
}

export async function sendChatMessage(
  message: string, 
  history: ChatMessage[] = []
): Promise<string> {
  try {
    const response = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ message, history }),
    });

    if (!response.ok) {
      throw new Error('Failed to get response');
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Chat API error:', error);
    return generateLocalResponse(message);
  }
}

export async function sendWorkSessionMessage(
  message: string,
  nodeName: string,
  history: ChatMessage[] = []
): Promise<string> {
  try {
    const response = await fetch(`${API_BASE}/chat/work-session`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ message, nodeName, history }),
    });

    if (!response.ok) {
      throw new Error('Failed to get response');
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Work session API error:', error);
    return generateLocalWorkResponse(message, nodeName);
  }
}

// ============================================
// WORK SESSION MESSAGE HISTORY
// ============================================

export interface WorkSessionMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

// Get previous work session messages for a node
export async function getWorkSessionMessages(nodeId: string, limit: number = 50): Promise<WorkSessionMessage[]> {
  try {
    const response = await fetch(`${API_BASE}/work-session/messages/${nodeId}?limit=${limit}`, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.messages || [];
  } catch (error) {
    console.error('Failed to load work session messages:', error);
    return [];
  }
}

// Save a work session message
export async function saveWorkSessionMessage(
  nodeId: string,
  role: 'user' | 'assistant',
  content: string
): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/work-session/messages`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ nodeId, role, content }),
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to save work session message:', error);
    return false;
  }
}

// Clear work session history for a node
export async function clearWorkSessionMessages(nodeId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/work-session/messages/${nodeId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to clear work session messages:', error);
    return false;
  }
}

// ============================================
// SUMMARIES & ANALYTICS
// ============================================

export interface DailySummary {
  headline: string;
  proved: string[];
  strengthened: string[];
  watchPattern: string;
  tomorrowFocus: string;
  alignmentScore: number;
}

export async function getDailySummary(date?: string): Promise<DailySummary | null> {
  try {
    const url = date ? `${API_BASE}/summary/${date}` : `${API_BASE}/summary`;
    const response = await fetch(url, {
      headers: getHeaders(),
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return data.summary;
  } catch {
    return null;
  }
}

export interface Analytics {
  nodeStats: Array<{ type: string; count: number; avgStrength: number; mastered: number }>;
  trackingDays: number;
  actionCompletionRate: number;
  recentAlignmentScores: Array<{ date: string; alignment_score: number }>;
}

export async function getAnalytics(): Promise<Analytics | null> {
  try {
    const response = await fetch(`${API_BASE}/analytics`, {
      headers: getHeaders(),
    });
    
    if (!response.ok) return null;
    
    return await response.json();
  } catch {
    return null;
  }
}

// ============================================
// ONBOARDING
// ============================================

export async function analyzeIdentity(text: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE}/onboarding/analyze`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error('Failed to analyze');
    }

    return await response.json();
  } catch (error) {
    console.error('Analysis API error:', error);
    return null;
  }
}

// ============================================
// HEALTH CHECK
// ============================================

export async function checkApiHealth(): Promise<{ ok: boolean; aiAvailable: boolean }> {
  try {
    const response = await fetch(`${API_BASE}/health`);
    if (!response.ok) return { ok: false, aiAvailable: false };
    
    const data = await response.json();
    return { ok: true, aiAvailable: data.aiAvailable };
  } catch {
    return { ok: false, aiAvailable: false };
  }
}

// ============================================
// LOCAL FALLBACKS
// ============================================

function generateLocalResponse(message: string): string {
  const lower = message.toLowerCase();
  
  if (lower.includes('hello') || lower.includes('hi')) {
    return "Welcome to Evos. I'm here to help you understand and engineer your identity. What's on your mind today?";
  }
  
  if (lower.includes('help') || lower.includes('stuck')) {
    return "Being stuck often signals a growth edge. What's the smallest step you could take right now? Sometimes progress starts with just one tiny action.";
  }
  
  if (lower.includes('anxious') || lower.includes('worried')) {
    return "Anxiety often points to something that matters deeply to us. What's at the root of this feeling? What pattern do you notice?";
  }
  
  if (lower.includes('goal') || lower.includes('want')) {
    return "That's a meaningful aspiration. What would achieving it change about how you see yourself? And what's the smallest step you could take today?";
  }
  
  return "Tell me more about that. What patterns do you notice in how you're feeling or thinking? Every insight is data for your identity map.";
}

function generateLocalWorkResponse(message: string, nodeName: string): string {
  const lower = message.toLowerCase();
  
  if (lower.includes('done') || lower.includes('finished')) {
    return `Great progress on ${nodeName}! What did you accomplish, and how does it feel? That's identity in action.`;
  }
  
  if (lower.includes('stuck')) {
    return `Being stuck is part of growth. What's the tiniest step you could take on ${nodeName} right now? Even 2 minutes counts.`;
  }
  
  return `Good insight about ${nodeName}. What action could you take in the next 5 minutes to prove this matters to you?`;
}
