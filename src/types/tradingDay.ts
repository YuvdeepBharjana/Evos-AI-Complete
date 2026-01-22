/**
 * TradingDay Type Definition
 * 
 * Represents a single trading day with discipline tracking.
 * Core concept: Every day is either GREEN (disciplined), RED (broken rules), or NEUTRAL (no trades).
 */

export type TradingDayStatus = 'green' | 'red' | 'neutral';

export type TradingDay = {
  // Unique identifier for this trading day
  id: string;
  
  // Date in ISO format (YYYY-MM-DD)
  // Example: "2024-01-15"
  date: string;
  
  // Pre-Market Identity Calibration completed?
  // User must lock their rules and mindset before trading
  preMarketCompleted: boolean;
  
  // The official premarket trading plan (locked once committed)
  // This is the refined analysis from the Premarket Coach
  preMarketPlan?: string;
  
  // Structured plan data from Premarket Coach (for UI display)
  preMarketStructuredPlan?: {
    bias: 'bullish' | 'bearish' | 'range';
    setup: string;
    levels: string[];
    invalidation: string;
    scenarios?: string[];
  };
  
  // Timestamp when premarket plan was committed
  preMarketTimestamp?: string; // ISO timestamp
  
  // Post-Market Pattern Extraction completed?
  // User must review what happened after the session ends
  postMarketCompleted: boolean;
  
  // Did the user follow their rules today?
  // true = followed all rules
  // false = broke at least one rule
  // null = no trades taken (no rule adherence to evaluate)
  rulesFollowed: boolean | null;
  
  // Discipline Engine Fields
  // Number of trades taken today
  tradesTaken?: number;
  
  // Maximum trades allowed (default: 2)
  maxTradesAllowed?: number;
  
  // Was stop loss respected?
  stopLossRespected?: boolean;
  
  // Were there any revenge trades?
  revengeTrades?: boolean;
  
  // Were there any impulsive trades?
  impulsiveTrades?: boolean;
  
  // Final status of the day (COMPUTED, NOT MANUALLY SET)
  // green = full discipline
  // red = broke discipline
  // neutral = no trades, but completed rituals
  // null = day not yet evaluated/closed
  finalStatus: TradingDayStatus | null;
  
  // Is this day closed and immutable?
  // Once true, no fields can be modified
  isClosed: boolean;
  
  // Optional context tags for filtering/analysis
  // Examples: ["HIGH_IMPACT_NEWS", "MARKET_HOLIDAY", "LOW_VOLUME"]
  contextTags?: string[];
  
  // Timestamps for audit trail
  createdAt: string; // ISO timestamp
  closedAt?: string; // ISO timestamp when day was closed
};

/**
 * Helper type for creating a new TradingDay
 * Omits computed/system fields that should be set programmatically
 */
export type CreateTradingDayInput = {
  date: string;
  contextTags?: string[];
};
