// Trader-specific types for Evos AI trader onboarding

export type TraderProfile = {
  primaryFailureModes: string[];          // from Q1
  marketType: string;                     // from Q2
  sessionWindow: string;                  // from Q3
  underPressureResponse: string;          // from Q4
  strengths: string[];                    // from Q5
  identityTraits: string[];               // from Q6
  commitmentLevel: string;                // from Q7
  identityStatement: string;              // auto-generated sentence
  disciplineArchetype: string;            // derived label
  focusRule: string;                      // one non-negotiable rule
  onboardingCompletedAt: string;          // ISO date
};

/**
 * Generate a TraderProfile from onboarding questionnaire answers
 */
export function generateTraderProfile(answers: Record<string, string>): TraderProfile {
  // Parse answers (stored as comma-separated strings for multi-select)
  const primaryFailureModes = answers.q1?.split(',') || [];
  const marketType = answers.q2 || '';
  const sessionWindow = answers.q3 || '';
  const underPressureResponse = answers.q4 || '';
  const strengths = answers.q5?.split(',') || [];
  const identityTraits = answers.q6?.split(',') || [];
  const commitmentLevel = answers.q7 || '';

  // Generate identity statement (format: remove underscores, lowercase)
  const formatTrait = (trait: string) => trait.replace(/_/g, ' ').toLowerCase();
  const trait1 = identityTraits[0] ? formatTrait(identityTraits[0]) : 'disciplined';
  const trait2 = identityTraits[1] ? formatTrait(identityTraits[1]) : 'process-driven';
  const identityStatement = `I am a ${trait1}, ${trait2} trader who prioritizes process over outcome.`;

  // Identity Target: Always "Emotional Neutrality" (universal trader goal)
  const disciplineArchetype = 'Emotional Neutrality';
  
  const hasRevenge = primaryFailureModes.includes('revenge_trading');
  const hasSizeUp = primaryFailureModes.includes('overtrading_bored');
  const hasFOMO = primaryFailureModes.includes('fomo_chasing');

  // Derive focus rule from primary failure modes
  let focusRule = 'Follow the plan. No exceptions.';
  
  if (hasRevenge) {
    focusRule = 'After a red trade, I take a 5-minute reset before any new entry.';
  } else if (hasSizeUp) {
    focusRule = 'Max 3 trades per session. If I break it, I\'m done for the day.';
  } else if (hasFOMO) {
    focusRule = 'I only enter after confirmation + planned level; no impulse breakouts.';
  } else if (primaryFailureModes.includes('moving_stops')) {
    focusRule = 'Stops are hard. If stop hits, I exit—no exceptions.';
  } else if (primaryFailureModes.includes('outside_plan')) {
    focusRule = 'If it\'s not in the plan, it\'s not a trade.';
  }

  return {
    primaryFailureModes,
    marketType,
    sessionWindow,
    underPressureResponse,
    strengths,
    identityTraits,
    commitmentLevel,
    identityStatement,
    disciplineArchetype,
    focusRule,
    onboardingCompletedAt: new Date().toISOString(),
  };
}

/**
 * Persist trader profile to localStorage
 */
export function saveTraderProfile(profile: TraderProfile): void {
  try {
    localStorage.setItem('evos.traderProfile', JSON.stringify(profile));
    console.log('✅ Trader profile saved:', profile);
  } catch (error) {
    console.error('Failed to save trader profile:', error);
  }
}

/**
 * Load trader profile from localStorage
 */
export function loadTraderProfile(): TraderProfile | null {
  try {
    const stored = localStorage.getItem('evos.traderProfile');
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to load trader profile:', error);
    return null;
  }
}
