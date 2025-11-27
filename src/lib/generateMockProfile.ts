import type { IdentityNode, UserProfile } from '../types';

export const generateNodesFromQuestionnaire = (answers: Record<string, string>): IdentityNode[] => {
  const nodes: IdentityNode[] = [];
  let nodeId = 1;

  // Extract goals
  if (answers.goals) {
    const goals = answers.goals.split(',').map(g => g.trim()).filter(Boolean);
    goals.forEach(goal => {
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
    });
  }

  // Extract habits
  if (answers.habits) {
    const habits = answers.habits.split(',').map(h => h.trim()).filter(Boolean);
    habits.forEach(habit => {
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
    });
  }

  // Extract struggles
  if (answers.struggles) {
    const struggles = answers.struggles.split(',').map(s => s.trim()).filter(Boolean);
    struggles.forEach(struggle => {
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
    });
  }

  // Extract values/traits
  if (answers.values) {
    const values = answers.values.split(',').map(v => v.trim()).filter(Boolean);
    values.forEach(value => {
      nodes.push({
        id: `node-${nodeId++}`,
        label: value,
        type: 'trait',
        strength: Math.floor(Math.random() * 30) + 60,
        status: 'mastered',
        connections: [],
        lastUpdated: new Date(),
        description: `Core value: ${value}`
      });
    });
  }

  // Create connections based on relationships
  nodes.forEach((node, index) => {
    // Connect goals to related habits and traits
    if (node.type === 'goal') {
      const relatedHabits = nodes.filter(n => n.type === 'habit').slice(0, 2);
      node.connections = relatedHabits.map(n => n.id);
    }
    
    // Connect habits to traits
    if (node.type === 'habit' && index < nodes.length - 1) {
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

