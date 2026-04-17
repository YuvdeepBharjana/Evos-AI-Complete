/**
 * Trading Day Store
 * 
 * Manages the current trading day and historical days.
 * Implements discipline rules and ensures data integrity.
 * 
 * DISCIPLINE LOGIC:
 * - GREEN: Pre-market done + Post-market done + Rules followed
 * - RED: Missing any ritual OR broke rules
 * - NEUTRAL: No trades, but completed rituals
 */

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { TradingDay, TradingDayStatus } from '../types/tradingDay';
import { getTodayDateKey, addDays } from '../lib/dateKey';

// ============================================
// TYPES
// ============================================

interface TradingDayState {
  // Current active trading day (today)
  currentDay: TradingDay | null;
  
  // Historical days (closed days only)
  history: TradingDay[];
  
  // Actions
  initializeToday: () => void;
  completePreMarket: () => void;
  setPremarketPlan: (plan: string) => void;
  completePostMarket: () => void;
  setRulesFollowed: (value: boolean | null) => void;
  closeDay: () => void;
  
  // Helper to compute status (can be called anytime)
  computeFinalStatus: (tradingDay: TradingDay) => TradingDayStatus;
  
  // Discipline Engine: Calculate green/red status
  calculateDisciplineStatus: (day: TradingDay) => "green" | "red";
  
  // Discipline gate selector
  isTradingUnlocked: () => boolean;
  
  // Discipline Streak Selectors
  currentStreak: () => number;
  longestStreak: () => number;
  disciplineRate30: () => number;
  
  // Internal helpers
  _saveToLocalStorage: () => void;
  _loadFromLocalStorage: () => void;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get today's date in YYYY-MM-DD format (local timezone)
 */
function getTodayDate(): string {
  return getTodayDateKey();
}

/**
 * Discipline Engine: Calculate green/red status based on rule-based logic
 * 
 * Returns "green" ONLY IF ALL are true:
 * - preMarketCompleted === true
 * - preMarketPlan exists
 * - tradesTaken <= maxTradesAllowed (default maxTradesAllowed = 2)
 * - stopLossRespected === true
 * - revengeTrades === false
 * - impulsiveTrades === false
 * 
 * Else returns "red".
 * 
 * @param day - The trading day to evaluate
 * @returns "green" | "red"
 */
function calculateDisciplineStatus(day: TradingDay): "green" | "red" {
  // Default maxTradesAllowed to 2 if undefined
  const maxTradesAllowed = day.maxTradesAllowed ?? 2;
  
  // Fail-safe: treat missing boolean values as failures
  // Check all required conditions
  
  // 1. Pre-market must be completed
  if (day.preMarketCompleted !== true) {
    return 'red';
  }
  
  // 2. Pre-market plan must exist
  if (!day.preMarketPlan) {
    return 'red';
  }
  
  // 3. Trades taken must be within limit
  const tradesTaken = day.tradesTaken ?? 0;
  if (tradesTaken > maxTradesAllowed) {
    return 'red';
  }
  
  // 4. Stop loss must be respected (fail-safe: undefined = false)
  if (day.stopLossRespected !== true) {
    return 'red';
  }
  
  // 5. No revenge trades (must be explicitly false, undefined = failure)
  if (day.revengeTrades !== false) {
    return 'red';
  }
  
  // 6. No impulsive trades (must be explicitly false, undefined = failure)
  if (day.impulsiveTrades !== false) {
    return 'red';
  }
  
  // All conditions met - GREEN day
  return 'green';
}

/**
 * Compute the final status of a trading day based on discipline rules
 * 
 * RULES:
 * - GREEN: All rituals completed + rules followed
 * - RED: Any ritual skipped OR rules broken
 * - NEUTRAL: Rituals completed but no trades taken (rulesFollowed = null)
 * 
 * @deprecated Use calculateDisciplineStatus for automatic discipline grading
 */
function computeFinalStatus(tradingDay: TradingDay): TradingDayStatus {
  const { preMarketCompleted, postMarketCompleted, rulesFollowed } = tradingDay;
  
  // RED: Any ritual incomplete
  if (!preMarketCompleted || !postMarketCompleted) {
    return 'red';
  }
  
  // RED: Rules were broken
  if (rulesFollowed === false) {
    return 'red';
  }
  
  // GREEN: All rituals done + rules followed
  if (rulesFollowed === true) {
    return 'green';
  }
  
  // NEUTRAL: Rituals done, but no trades taken (rulesFollowed = null)
  return 'neutral';
}

/**
 * Create a new TradingDay for today
 */
function createTradingDay(date: string): TradingDay {
  return {
    id: uuidv4(),
    date,
    preMarketCompleted: false,
    preMarketPlan: undefined,
    preMarketStructuredPlan: undefined,
    preMarketTimestamp: undefined,
    postMarketCompleted: false,
    rulesFollowed: null,
    tradesTaken: undefined,
    maxTradesAllowed: 2, // Default to 2
    stopLossRespected: undefined,
    revengeTrades: undefined,
    impulsiveTrades: undefined,
    finalStatus: null,
    isClosed: false,
    contextTags: [],
    createdAt: new Date().toISOString(),
  };
}

// ============================================
// LOCAL STORAGE KEYS
// ============================================

const STORAGE_KEYS = {
  CURRENT_DAY: 'evos.currentTradingDay',
  HISTORY: 'evos.tradingDayHistory',
};

// ============================================
// ZUSTAND STORE
// ============================================

export const useTradingDayStore = create<TradingDayState>((set, get) => ({
  currentDay: null,
  history: [],
  
  /**
   * Initialize today's trading day
   * - If today already exists in localStorage, load it
   * - If not, create a new one
   * - If yesterday exists but wasn't closed, archive it as RED
   */
  initializeToday: () => {
    const todayDate = getTodayDate();
    const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_DAY);
    
    if (stored) {
      const currentDay = JSON.parse(stored) as TradingDay;
      
      // Check if stored day is actually today
      if (currentDay.date === todayDate) {
        // It's still today, load it
        set({ currentDay });
        get()._loadFromLocalStorage();
        return;
      } else {
        // Stored day is from the past and wasn't closed properly
        // Archive it as RED (incomplete ritual)
        if (!currentDay.isClosed) {
          const archivedDay: TradingDay = {
            ...currentDay,
            isClosed: true,
            finalStatus: 'red', // Auto-red for unclosed days
            closedAt: new Date().toISOString(),
          };
          
          const history = get().history;
          set({ 
            history: [...history, archivedDay],
            currentDay: createTradingDay(todayDate)
          });
          get()._saveToLocalStorage();
          return;
        }
      }
    }
    
    // No stored day or it's been handled - create new
    const newDay = createTradingDay(todayDate);
    set({ currentDay: newDay });
    get()._saveToLocalStorage();
  },
  
  /**
   * Mark Pre-Market Calibration as complete
   * SAFETY: Cannot modify if day is closed
   * 
   * @deprecated Use setPremarketPlan instead - it sets both the plan and completed flag
   */
  completePreMarket: () => {
    const { currentDay } = get();
    
    if (!currentDay) {
      console.error('No current trading day exists. Call initializeToday() first.');
      return;
    }
    
    if (currentDay.isClosed) {
      console.error('Cannot modify a closed trading day.');
      return;
    }
    
    const updatedDay: TradingDay = {
      ...currentDay,
      preMarketCompleted: true,
    };
    
    set({ currentDay: updatedDay });
    get()._saveToLocalStorage();
  },
  
  /**
   * Set the premarket plan and mark premarket as completed
   * SAFETY: 
   * - Cannot modify if day is closed
   * - Cannot overwrite if already committed (immutable once set)
   * 
   * @param plan - The refined analysis plan from Premarket Coach
   * @param structuredPlan - Optional structured plan data for UI display
   */
  setPremarketPlan: (plan: string, structuredPlan?: TradingDay['preMarketStructuredPlan']) => {
    const { currentDay } = get();
    
    if (!currentDay) {
      console.error('No current trading day exists. Call initializeToday() first.');
      return;
    }
    
    if (currentDay.isClosed) {
      console.error('Cannot modify a closed trading day.');
      return;
    }
    
    // SAFETY: Prevent overwrite if plan already committed
    if (currentDay.preMarketCompleted && currentDay.preMarketPlan) {
      console.error('Premarket plan already committed for today. Cannot overwrite.');
      return;
    }
    
    const updatedDay: TradingDay = {
      ...currentDay,
      preMarketPlan: plan.trim(),
      preMarketStructuredPlan: structuredPlan,
      preMarketCompleted: true,
      preMarketTimestamp: new Date().toISOString(),
    };
    
    set({ currentDay: updatedDay });
    get()._saveToLocalStorage();
    
    console.log('✅ Premarket plan committed for today');
  },
  
  /**
   * Mark Post-Market Review as complete
   * SAFETY: 
   * - Cannot modify if day is closed
   * - Pre-market must be completed first
   * - Trading must be unlocked (premarket plan committed)
   */
  completePostMarket: () => {
    const { currentDay, isTradingUnlocked } = get();
    
    if (!currentDay) {
      console.error('No current trading day exists. Call initializeToday() first.');
      return;
    }
    
    if (currentDay.isClosed) {
      console.error('Cannot modify a closed trading day.');
      return;
    }
    
    // SAFETY: Trading must be unlocked (premarket plan committed)
    if (!isTradingUnlocked()) {
      console.error('Cannot complete post-market: Trading is locked. Commit premarket plan first.');
      return;
    }
    
    // SAFETY: Pre-market must be done first
    if (!currentDay.preMarketCompleted) {
      console.error('Cannot complete post-market without completing pre-market first.');
      return;
    }
    
    const updatedDay: TradingDay = {
      ...currentDay,
      postMarketCompleted: true,
    };
    
    set({ currentDay: updatedDay });
    get()._saveToLocalStorage();
  },
  
  /**
   * Set whether rules were followed today
   * SAFETY: Cannot modify if day is closed
   * 
   * @param value - true (followed), false (broke rules), null (no trades)
   */
  setRulesFollowed: (value: boolean | null) => {
    const { currentDay } = get();
    
    if (!currentDay) {
      console.error('No current trading day exists. Call initializeToday() first.');
      return;
    }
    
    if (currentDay.isClosed) {
      console.error('Cannot modify a closed trading day.');
      return;
    }
    
    const updatedDay: TradingDay = {
      ...currentDay,
      rulesFollowed: value,
    };
    
    set({ currentDay: updatedDay });
    get()._saveToLocalStorage();
  },
  
  /**
   * Close the current trading day
   * - Computes final status
   * - Marks as immutable
   * - Moves to history
   * 
   * SAFETY:
   * - Cannot close if trading is locked (no premarket plan)
   * - Cannot close if post-market is incomplete
   * - Cannot close if already closed
   */
  closeDay: () => {
    const { currentDay, isTradingUnlocked } = get();
    
    if (!currentDay) {
      console.error('No current trading day exists. Call initializeToday() first.');
      return;
    }
    
    if (currentDay.isClosed) {
      console.error('Trading day is already closed.');
      return;
    }
    
    // SAFETY: Trading must be unlocked (premarket plan committed)
    if (!isTradingUnlocked()) {
      console.error('Cannot close day: Trading is locked. Commit premarket plan first.');
      return;
    }
    
    // SAFETY: Post-market must be completed before closing
    if (!currentDay.postMarketCompleted) {
      console.error('Cannot close day: Post-market review not completed.');
      return;
    }
    
    // Compute final status using Discipline Engine
    const { calculateDisciplineStatus } = get();
    const finalStatus = calculateDisciplineStatus(currentDay);
    
    // Create closed day
    const closedDay: TradingDay = {
      ...currentDay,
      finalStatus,
      isClosed: true,
      closedAt: new Date().toISOString(),
    };
    
    // Move to history and clear current
    const history = get().history;
    set({ 
      history: [...history, closedDay],
      currentDay: null // Current day is now closed and archived
    });
    
    get()._saveToLocalStorage();
    
    console.log(`✅ Trading day closed with status: ${finalStatus.toUpperCase()}`);
  },
  
  /**
   * Compute what the final status would be for a given trading day
   * (Does not modify the day, just returns the status)
   * 
   * @deprecated Use calculateDisciplineStatus for automatic discipline grading
   */
  computeFinalStatus,
  
  /**
   * Discipline Engine: Calculate green/red status based on rule-based logic
   * Returns "green" only if all discipline rules are met, else "red"
   * 
   * @param day - The trading day to evaluate
   * @returns "green" | "red"
   */
  calculateDisciplineStatus,
  
  /**
   * Discipline Gate: Check if trading is unlocked
   * Trading is unlocked ONLY if:
   * - preMarketCompleted === true
   * - preMarketPlan exists
   * 
   * Returns false if no current day exists
   */
  isTradingUnlocked: () => {
    const { currentDay } = get();
    
    if (!currentDay) {
      return false;
    }
    
    // Trading is unlocked only if premarket plan is committed
    return currentDay.preMarketCompleted === true && 
           !!currentDay.preMarketPlan;
  },
  
  /**
   * Current Discipline Streak
   * Count consecutive calendar days with green status from most recent backward
   * Requires actual consecutive calendar days (not just consecutive entries in history)
   * Only counts closed days with finalStatus === "green"
   * Breaks on first missing day, red day, or neutral day
   */
  currentStreak: () => {
    const { history } = get();

    const closed = history
      .filter(d => d.isClosed && d.finalStatus)
      .sort((a, b) => b.date.localeCompare(a.date));

    if (closed.length === 0) return 0;

    let streak = 0;
    let expected = closed[0].date; // start from most recent closed day

    for (const day of closed) {
      if (day.date !== expected) break; // gap breaks streak
      if (day.finalStatus !== 'green') break;

      streak++;
      expected = addDays(expected, -1);
    }

    return streak;
  },
  
  /**
   * Longest Discipline Streak
   * Computes the longest run of consecutive calendar days with green status
   * Requires actual consecutive calendar days (not just consecutive entries in history)
   * Only counts closed days with finalStatus === "green"
   * Does not count neutral days or missing days
   */
  longestStreak: () => {
    const { history } = get();

    const closed = history
      .filter(d => d.isClosed && d.finalStatus)
      .sort((a, b) => a.date.localeCompare(b.date));

    let longest = 0;
    let current = 0;

    for (let i = 0; i < closed.length; i++) {
      const day = closed[i];

      if (day.finalStatus !== 'green') {
        current = 0;
        continue;
      }

      if (i === 0) {
        current = 1;
      } else {
        const prev = closed[i - 1];
        const expected = addDays(prev.date, 1);

        if (day.date === expected && prev.finalStatus === 'green') {
          current += 1;
        } else {
          current = 1; // restart streak
        }
      }

      longest = Math.max(longest, current);
    }

    return longest;
  },
  
  /**
   * 30-Day Discipline Rate
   * Percentage of green days over last 30 closed days
   * Only counts closed days
   * Returns 0 if fewer than 30 days exist
   */
  disciplineRate30: () => {
    const { history } = get();
    
    // Only include closed days, sorted by date (most recent first)
    const closedDays = history
      .filter(day => day.isClosed && day.finalStatus !== null)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 30); // Last 30 days
    
    if (closedDays.length === 0) {
      return 0;
    }
    
    // Count green days
    const greenDays = closedDays.filter(day => day.finalStatus === 'green').length;
    
    // Calculate percentage
    return Math.round((greenDays / closedDays.length) * 100);
  },
  
  /**
   * Save current state to localStorage
   * INTERNAL USE ONLY
   */
  _saveToLocalStorage: () => {
    const { currentDay, history } = get();
    
    if (currentDay) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_DAY, JSON.stringify(currentDay));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_DAY);
    }
    
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  },
  
  /**
   * Load history from localStorage
   * INTERNAL USE ONLY
   */
  _loadFromLocalStorage: () => {
    const storedHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
    
    if (storedHistory) {
      try {
        const history = JSON.parse(storedHistory) as TradingDay[];
        set({ history });
      } catch (error) {
        console.error('Failed to load trading day history from localStorage:', error);
      }
    }
  },
}));

// ============================================
// UTILITY EXPORTS
// ============================================

/**
 * Get the current trading day's status preview
 * (What would it be if closed right now?)
 */
export function getCurrentDayStatusPreview(): TradingDayStatus | null {
  const { currentDay, computeFinalStatus } = useTradingDayStore.getState();
  if (!currentDay) return null;
  return computeFinalStatus(currentDay);
}

/**
 * Get trading day statistics
 */
export function getTradingDayStats() {
  const { history } = useTradingDayStore.getState();
  
  const totalDays = history.length;
  const greenDays = history.filter(d => d.finalStatus === 'green').length;
  const redDays = history.filter(d => d.finalStatus === 'red').length;
  const neutralDays = history.filter(d => d.finalStatus === 'neutral').length;
  
  return {
    totalDays,
    greenDays,
    redDays,
    neutralDays,
    greenPercentage: totalDays > 0 ? Math.round((greenDays / totalDays) * 100) : 0,
  };
}
