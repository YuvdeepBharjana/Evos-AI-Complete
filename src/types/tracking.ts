export type TrackingCategory = 'calories' | 'exercise' | 'work' | 'finances' | 'sleep' | 'mood';

export interface DailyLog {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  calories?: number;
  exercise?: number; // minutes
  workHours?: number;
  financesLogged?: boolean;
  sleepHours?: number;
  mood?: number; // 1-10
  notes?: string;
  completedAt: Date;
}

export interface TrackingStreak {
  category: TrackingCategory;
  currentStreak: number;
  longestStreak: number;
  lastLoggedDate: string;
}

export interface UserTracking {
  dailyLogs: DailyLog[];
  streaks: TrackingStreak[];
  totalDaysTracked: number;
}

// Tracking targets
export const TRACKING_TARGETS = {
  calories: { min: 1500, max: 2500, unit: 'cal' },
  exercise: { min: 20, max: 60, unit: 'min' },
  workHours: { min: 4, max: 10, unit: 'hrs' },
  sleepHours: { min: 7, max: 9, unit: 'hrs' },
  mood: { min: 1, max: 10, unit: '' }
};

