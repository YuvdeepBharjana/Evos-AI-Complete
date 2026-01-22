// TRADER-FOCUSED ONBOARDING QUESTIONS (Evos AI for Traders)

export type OnboardingV2Question = {
  id: string;
  question: string;
  category: 'truth_mirror' | 'market_type' | 'session_window' | 'discipline_reframe' | 'strength' | 'identity_traits' | 'commitment';
  options: { label: string; value: string; microlabel?: string }[];
  multiSelect: boolean;
  maxSelections?: number;
  whyItMatters: string;
};

export const onboardingV2Questions: OnboardingV2Question[] = [
  {
    id: 'q1',
    question: 'When you lose discipline, what do you do first — without thinking?',
    category: 'truth_mirror',
    multiSelect: true,
    maxSelections: 2,
    options: [
      { label: 'Clicking just to feel in control', value: 'overtrading_bored', microlabel: 'Stimulation leak' },
      { label: 'Trying to "get it back" after a loss', value: 'revenge_trading', microlabel: 'Recovery impulse' },
      { label: 'Chasing the move you "missed"', value: 'fomo_chasing', microlabel: 'Chase reflex' },
      { label: 'Freezing at the entry, then watching it run', value: 'hesitating_missing', microlabel: 'Fear response' },
      { label: 'Moving the stop because "it\'ll come back"', value: 'moving_stops', microlabel: 'Risk denial' },
      { label: 'Taking trades that were not in the plan', value: 'outside_plan', microlabel: 'Identity drift' },
    ],
    whyItMatters: 'This is your default pressure response. Evos will train a replacement behavior.',
  },
  {
    id: 'q2',
    question: 'What do you trade most?',
    category: 'market_type',
    multiSelect: false,
    options: [
      { label: 'Futures', value: 'futures' },
      { label: 'Options', value: 'options' },
      { label: 'Stocks', value: 'stocks' },
      { label: 'Crypto', value: 'crypto' },
      { label: 'Forex', value: 'forex' },
    ],
    whyItMatters: 'This tunes prompts, session structure, and language to match your market.',
  },
  {
    id: 'q3',
    question: 'When do you trade?',
    category: 'session_window',
    multiSelect: false,
    options: [
      { label: 'Pre-market', value: 'pre_market' },
      { label: 'Market open', value: 'market_open' },
      { label: 'Midday', value: 'midday' },
      { label: 'Power hour / close', value: 'power_hour' },
      { label: 'Swing (end-of-day)', value: 'swing' },
    ],
    whyItMatters: 'Discipline is context-dependent. Evos calibrates to your session window and pressure points.',
  },
  {
    id: 'q4',
    question: 'When you\'re red, what usually happens next?',
    category: 'discipline_reframe',
    multiSelect: false,
    options: [
      { label: 'I size up to make it back', value: 'size_up' },
      { label: 'I take more trades to \'fix\' it', value: 'more_trades' },
      { label: 'I freeze / get scared', value: 'freeze_scared' },
      { label: 'I stick to rules and reduce size', value: 'stick_rules' },
      { label: 'I stop trading', value: 'stop_trading' },
    ],
    whyItMatters: 'This reveals your pressure response. Evos will train you to interrupt reactive patterns before they spiral.',
  },
  {
    id: 'q5',
    question: 'What\'s already working for you?',
    category: 'strength',
    multiSelect: true,
    maxSelections: 2,
    options: [
      { label: 'Pattern recognition', value: 'pattern_recognition' },
      { label: 'Risk control', value: 'risk_control' },
      { label: 'Patience / waiting', value: 'patience_waiting' },
      { label: 'Fast execution', value: 'fast_execution' },
      { label: 'Journaling / reviewing', value: 'journaling_reviewing' },
      { label: 'Staying calm', value: 'staying_calm' },
    ],
    whyItMatters: 'Evos reinforces strengths to build identity stability. Discipline is not just fixing leaks—it\'s anchoring to what works.',
  },
  {
    id: 'q6',
    question: 'Choose your Trader Identity traits.',
    category: 'identity_traits',
    multiSelect: true,
    maxSelections: 3,
    options: [
      { label: 'Rule-first', value: 'rule_first' },
      { label: 'Process-driven', value: 'process_driven' },
      { label: 'Risk-controlled', value: 'risk_controlled' },
      { label: 'Calm under pressure', value: 'calm_under_pressure' },
      { label: 'Patient', value: 'patient' },
      { label: 'Detached from PnL', value: 'detached_from_pnl' },
    ],
    whyItMatters: 'Your identity must be explicit before it can be enforced. These traits become the filter for every decision you make.',
  },
  {
    id: 'q7',
    question: 'How serious are you about fixing this?',
    category: 'commitment',
    multiSelect: false,
    options: [
      { label: 'Curious', value: 'curious' },
      { label: 'Trying to improve', value: 'trying_improve' },
      { label: 'Serious — I\'m tired of repeating this', value: 'serious_tired' },
      { label: 'Non-negotiable — I\'m rebuilding myself', value: 'non_negotiable' },
    ],
    whyItMatters: 'Commitment determines intensity of feedback and guardrails. Evos will calibrate to your level of urgency.',
  },
];



