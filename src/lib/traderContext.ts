/**
 * Trader Context Utility
 * 
 * Functions for loading and building trader context from localStorage.
 * Used to provide strategy and edge readiness data to AI prompts.
 */

/**
 * Load strategy profile from localStorage
 * 
 * @returns Parsed strategy profile object or null if missing/invalid
 */
export function loadStrategyProfile(): any | null {
  try {
    const strategyProfileJson = localStorage.getItem('evos.strategyProfile');
    if (!strategyProfileJson) {
      return null;
    }

    const profile = JSON.parse(strategyProfileJson);
    return profile;
  } catch (error) {
    // If parsing fails, return null
    console.error('Failed to parse strategy profile from localStorage:', error);
    return null;
  }
}

/**
 * Load edge profile from localStorage
 * 
 * @returns Parsed edge profile object or null if missing/invalid
 */
export function loadEdgeProfile(): any | null {
  try {
    const edgeProfileJson = localStorage.getItem('evos.edgeProfile');
    if (!edgeProfileJson) {
      return null;
    }

    const profile = JSON.parse(edgeProfileJson);
    return profile;
  } catch (error) {
    // If parsing fails, return null
    console.error('Failed to parse edge profile from localStorage:', error);
    return null;
  }
}

/**
 * Build trader context from loaded profiles
 * 
 * Combines strategy profile and edge profile to create context for AI prompts.
 * Calculates edge readiness based on edge profile data.
 * 
 * @returns Object with strategySummary and edgeReadiness
 */
export function buildTraderContext(): {
  strategySummary: string;
  edgeReadiness: number;
} {
  // Load both profiles
  const strategyProfile = loadStrategyProfile();
  const edgeProfile = loadEdgeProfile();

  // Get strategy summary
  const strategySummary = strategyProfile?.summaryText || 'No strategy configured yet';

  // Calculate edge readiness
  let edgeReadiness = 0;

  if (edgeProfile) {
    // If backtesting completed: +40%
    if (edgeProfile.hasBacktested === true) {
      edgeReadiness += 40;
    }

    // If winRate AND profitFactor both exist: +35%
    const hasWinRate = edgeProfile.winRate !== undefined && edgeProfile.winRate !== null;
    const hasProfitFactor = edgeProfile.profitFactor !== undefined && edgeProfile.profitFactor !== null;
    if (hasWinRate && hasProfitFactor) {
      edgeReadiness += 35;
    }

    // Clamp max at 75%
    edgeReadiness = Math.min(edgeReadiness, 75);
  }

  return {
    strategySummary,
    edgeReadiness,
  };
}
