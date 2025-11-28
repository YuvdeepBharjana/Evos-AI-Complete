import type { IdentityNode, UserProfile } from '../types';

export const generateNodesFromQuestionnaire = (answers: Record<string, string>): IdentityNode[] => {
  const nodes: IdentityNode[] = [];
  let nodeId = 1;

  // Map question IDs to their categories
  // q1 = goals, q2 = habits, q3 = struggles, q4 = values/traits
  // q5 = work style (trait), q6 = mastered skills (trait), q7 = motivation (emotion), q8 = goals

  // Extract goals from q1 and q8
  const goalsText = [answers.q1, answers.q8].filter(Boolean).join(', ');
  if (goalsText) {
    const goals = goalsText.split(',').map(g => g.trim()).filter(Boolean);
    goals.forEach(goal => {
      if (goal.length > 2) {
        nodes.push({
          id: `node-${nodeId++}`,
          label: goal,
          type: 'goal',
          strength: 65,
          status: 'active',
          connections: [],
          lastUpdated: new Date(),
          description: `Working towards: ${goal}`
        });
      }
    });
  }

  // Extract habits from q2
  if (answers.q2) {
    const habits = answers.q2.split(',').map(h => h.trim()).filter(Boolean);
    habits.forEach(habit => {
      if (habit.length > 2) {
        nodes.push({
          id: `node-${nodeId++}`,
          label: habit,
          type: 'habit',
          strength: Math.floor(Math.random() * 40) + 40,
          status: Math.random() > 0.5 ? 'active' : 'developing',
          connections: [],
          lastUpdated: new Date(),
          description: `Daily habit: ${habit}`
        });
      }
    });
  }

  // Extract struggles from q3
  if (answers.q3) {
    const struggles = answers.q3.split(',').map(s => s.trim()).filter(Boolean);
    struggles.forEach(struggle => {
      if (struggle.length > 2) {
        nodes.push({
          id: `node-${nodeId++}`,
          label: struggle,
          type: 'struggle',
          strength: Math.floor(Math.random() * 30) + 20,
          status: 'developing',
          connections: [],
          lastUpdated: new Date(),
          description: `Challenge: ${struggle}`
        });
      }
    });
  }

  // Extract traits from q4 (values), q5 (work style), q6 (mastered skills)
  const traitsText = [answers.q4, answers.q5, answers.q6].filter(Boolean).join(', ');
  if (traitsText) {
    const traits = traitsText.split(',').map(t => t.trim()).filter(Boolean);
    traits.forEach(trait => {
      if (trait.length > 2) {
        nodes.push({
          id: `node-${nodeId++}`,
          label: trait,
          type: 'trait',
          strength: Math.floor(Math.random() * 30) + 60,
          status: 'mastered',
          connections: [],
          lastUpdated: new Date(),
          description: `Core trait: ${trait}`
        });
      }
    });
  }

  // Extract emotions/motivations from q7
  if (answers.q7) {
    const emotions = answers.q7.split(',').map(e => e.trim()).filter(Boolean);
    emotions.forEach(emotion => {
      if (emotion.length > 2) {
        nodes.push({
          id: `node-${nodeId++}`,
          label: emotion,
          type: 'emotion',
          strength: Math.floor(Math.random() * 25) + 50,
          status: 'active',
          connections: [],
          lastUpdated: new Date(),
          description: `Motivation: ${emotion}`
        });
      }
    });
  }

  // Create connections based on relationships
  nodes.forEach((node) => {
    // Connect goals to related habits and traits
    if (node.type === 'goal') {
      const relatedHabits = nodes.filter(n => n.type === 'habit').slice(0, 2);
      node.connections = relatedHabits.map(n => n.id);
    }
    
    // Connect habits to traits
    if (node.type === 'habit') {
      const relatedTraits = nodes.filter(n => n.type === 'trait').slice(0, 1);
      node.connections = relatedTraits.map(n => n.id);
    }

    // Connect struggles to goals (overcoming them)
    if (node.type === 'struggle') {
      const relatedGoals = nodes.filter(n => n.type === 'goal').slice(0, 1);
      node.connections = relatedGoals.map(n => n.id);
    }
  });

  return nodes;
};

export const createDefaultProfile = (name: string): UserProfile => {
  return {
    id: `user-${Date.now()}`,
    name,
    onboardingComplete: false,
    identityNodes: [],
    chatHistory: [],
    createdAt: new Date()
  };
};

export const generateDemoNodes = (): IdentityNode[] => {
  return [
    {
      id: 'node-1',
      label: 'Morning Routine',
      type: 'habit',
      strength: 85,
      status: 'mastered',
      connections: ['node-3', 'node-5'],
      lastUpdated: new Date(),
      description: 'Consistent wake-up at 6 AM with meditation'
    },
    {
      id: 'node-2',
      label: 'Build Startup',
      type: 'goal',
      strength: 70,
      status: 'active',
      connections: ['node-4', 'node-7'],
      lastUpdated: new Date(),
      description: 'Launch MVP in 3 months'
    },
    {
      id: 'node-3',
      label: 'Discipline',
      type: 'trait',
      strength: 90,
      status: 'mastered',
      connections: ['node-2'],
      lastUpdated: new Date(),
      description: 'Core strength in staying focused'
    },
    {
      id: 'node-4',
      label: 'Coding Daily',
      type: 'habit',
      strength: 65,
      status: 'active',
      connections: ['node-3'],
      lastUpdated: new Date(),
      description: 'Working on projects consistently'
    },
    {
      id: 'node-5',
      label: 'Focus',
      type: 'trait',
      strength: 75,
      status: 'active',
      connections: ['node-2', 'node-4'],
      lastUpdated: new Date(),
      description: 'Deep work sessions'
    },
    {
      id: 'node-6',
      label: 'Procrastination',
      type: 'struggle',
      strength: 45,
      status: 'developing',
      connections: ['node-2'],
      lastUpdated: new Date(),
      description: 'Working to overcome delay habits'
    },
    {
      id: 'node-7',
      label: 'Learn AI/ML',
      type: 'goal',
      strength: 55,
      status: 'developing',
      connections: ['node-4'],
      lastUpdated: new Date(),
      description: 'Master machine learning fundamentals'
    },
    {
      id: 'node-8',
      label: 'Growth Mindset',
      type: 'trait',
      strength: 80,
      status: 'mastered',
      connections: ['node-7', 'node-5'],
      lastUpdated: new Date(),
      description: 'Embrace challenges and learning'
    }
  ];
};
