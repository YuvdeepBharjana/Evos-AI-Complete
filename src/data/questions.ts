import type { OnboardingQuestion } from '../types';

export const onboardingQuestions: OnboardingQuestion[] = [
  {
    id: 'q1',
    question: "What are your main goals right now?",
    placeholder: "e.g., Launch my startup, get fit, learn a new skill...",
    category: 'goal'
  },
  {
    id: 'q2',
    question: "What daily habits are you currently working on?",
    placeholder: "e.g., Morning exercise, meditation, reading...",
    category: 'habit'
  },
  {
    id: 'q3',
    question: "What are your biggest challenges or struggles?",
    placeholder: "e.g., Procrastination, focus, consistency...",
    category: 'struggle'
  },
  {
    id: 'q4',
    question: "What are your core values and what matters most to you?",
    placeholder: "e.g., Growth, family, creativity, impact...",
    category: 'trait'
  },
  {
    id: 'q5',
    question: "How would you describe your work style?",
    placeholder: "e.g., Focused sprints, steady pace, flexible...",
    category: 'trait'
  },
  {
    id: 'q6',
    question: "What skills or habits have you already mastered?",
    placeholder: "e.g., Time management, coding, communication...",
    category: 'trait'
  },
  {
    id: 'q7',
    question: "What typically motivates you to take action?",
    placeholder: "e.g., Deadlines, passion, accountability...",
    category: 'emotion'
  },
  {
    id: 'q8',
    question: "What would success look like for you in 6 months?",
    placeholder: "e.g., Launched product, healthy routine, new job...",
    category: 'goal'
  }
];

