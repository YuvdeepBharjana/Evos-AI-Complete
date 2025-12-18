export type OnboardingV2Question = {
  id: string;
  question: string;
  category: 'goal' | 'struggle' | 'habit' | 'trait' | 'motivation' | 'emotion' | 'commitment';
  options: { label: string; value: string }[];
  multiSelect: boolean;
  maxSelections?: number;
  whyItMatters: string;
};

export const onboardingV2Questions: OnboardingV2Question[] = [
  {
    id: 'q1',
    question: 'What are you primarily trying to improve right now?',
    category: 'goal',
    multiSelect: true,
    maxSelections: 2,
    options: [
      { label: 'Career / Work', value: 'career_work' },
      { label: 'Health / Fitness', value: 'health_fitness' },
      { label: 'Mental discipline', value: 'mental_discipline' },
      { label: 'Relationships', value: 'relationships' },
      { label: 'Financial stability', value: 'financial_stability' },
      { label: 'Self-confidence', value: 'self_confidence' },
      { label: 'Creativity / Purpose', value: 'creativity_purpose' },
    ],
    whyItMatters: 'Evos uses this to prioritize which identity areas your daily actions and long-term growth focus on.',
  },
  {
    id: 'q2',
    question: 'What most often holds you back?',
    category: 'struggle',
    multiSelect: true,
    maxSelections: 2,
    options: [
      { label: 'Procrastination', value: 'procrastination' },
      { label: 'Lack of consistency', value: 'lack_of_consistency' },
      { label: 'Overthinking', value: 'overthinking' },
      { label: 'Low energy', value: 'low_energy' },
      { label: 'Emotional swings', value: 'emotional_swings' },
      { label: 'Burnout', value: 'burnout' },
      { label: 'Fear of failure', value: 'fear_of_failure' },
    ],
    whyItMatters: 'Evos uses this to identify friction points and design interventions that reduce relapse and burnout.',
  },
  {
    id: 'q3',
    question: 'Which best describes your daily habits?',
    category: 'habit',
    multiSelect: false,
    options: [
      { label: 'Very consistent', value: 'very_consistent' },
      { label: 'Somewhat consistent', value: 'somewhat_consistent' },
      { label: 'Inconsistent', value: 'inconsistent' },
      { label: 'Chaotic', value: 'chaotic' },
      { label: 'Just starting', value: 'just_starting' },
    ],
    whyItMatters: 'Evos uses this to calibrate difficulty, pacing, and accountability so growth feels sustainable.',
  },
  {
    id: 'q4',
    question: 'What do people compliment you on?',
    category: 'trait',
    multiSelect: true,
    maxSelections: 3,
    options: [
      { label: 'Discipline', value: 'discipline' },
      { label: 'Intelligence', value: 'intelligence' },
      { label: 'Creativity', value: 'creativity' },
      { label: 'Resilience', value: 'resilience' },
      { label: 'Empathy', value: 'empathy' },
      { label: 'Focus', value: 'focus' },
      { label: 'Leadership', value: 'leadership' },
      { label: 'Adaptability', value: 'adaptability' },
    ],
    whyItMatters: 'Evos uses this to reinforce strengths instead of only fixing weaknesses.',
  },
  {
    id: 'q5',
    question: 'What motivates you more?',
    category: 'motivation',
    multiSelect: true,
    maxSelections: 2,
    options: [
      { label: 'Progress tracking', value: 'progress_tracking' },
      { label: 'External accountability', value: 'external_accountability' },
      { label: 'Competition', value: 'competition' },
      { label: 'Clear structure', value: 'clear_structure' },
      { label: 'Emotional meaning', value: 'emotional_meaning' },
      { label: 'Rewards', value: 'rewards' },
      { label: 'Avoiding failure', value: 'avoiding_failure' },
    ],
    whyItMatters: 'Evos uses this to tailor feedback style, rewards, and pressure levels.',
  },
  {
    id: 'q6',
    question: 'When things go wrong, you usually…',
    category: 'emotion',
    multiSelect: false,
    options: [
      { label: 'Push harder', value: 'push_harder' },
      { label: 'Shut down', value: 'shut_down' },
      { label: 'Overanalyze', value: 'overanalyze' },
      { label: 'Get emotional', value: 'get_emotional' },
      { label: 'Avoid the problem', value: 'avoid_the_problem' },
      { label: 'Reset calmly', value: 'reset_calmly' },
    ],
    whyItMatters: 'Evos uses this to detect stress patterns and guide recovery and emotional regulation.',
  },
  {
    id: 'q7',
    question: 'How serious are you about improving right now?',
    category: 'commitment',
    multiSelect: false,
    options: [
      { label: 'Just exploring', value: 'just_exploring' },
      { label: 'Mildly committed', value: 'mildly_committed' },
      { label: 'Actively trying', value: 'actively_trying' },
      { label: 'Extremely committed', value: 'extremely_committed' },
    ],
    whyItMatters: 'Evos uses this to adjust intensity and expectation levels over time.',
  },
];


