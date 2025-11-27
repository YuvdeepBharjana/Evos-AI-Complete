import type { IdentityNode } from '../types';

interface ChatGPTMessage {
  role: string;
  content: string;
}

interface ChatGPTConversation {
  messages?: ChatGPTMessage[];
  [key: string]: any;
}

export const parseChatGPTExport = (fileContent: string): IdentityNode[] => {
  try {
    const data = JSON.parse(fileContent);
    
    // ChatGPT exports come in different formats, handle both
    let messages: ChatGPTMessage[] = [];
    
    if (Array.isArray(data)) {
      // Array of conversations
      messages = data.flatMap((conv: ChatGPTConversation) => conv.messages || []);
    } else if (data.messages) {
      // Single conversation
      messages = data.messages;
    }

    // Extract all user messages
    const userMessages = messages
      .filter(msg => msg.role === 'user')
      .map(msg => msg.content.toLowerCase());

    const allText = userMessages.join(' ');

    // Analyze patterns
    const nodes: IdentityNode[] = [];
    let nodeId = 1;

    // Extract goals (looking for keywords)
    const goalKeywords = ['want to', 'goal is', 'trying to', 'plan to', 'working on', 'need to'];
    const foundGoals = new Set<string>();
    
    goalKeywords.forEach(keyword => {
      const regex = new RegExp(`${keyword} ([^.!?]+)`, 'gi');
      const matches = allText.matchAll(regex);
      for (const match of matches) {
        const goal = match[1].trim().slice(0, 30);
        if (goal.length > 5) foundGoals.add(goal);
      }
    });

    Array.from(foundGoals).slice(0, 3).forEach(goal => {
      nodes.push({
        id: `node-${nodeId++}`,
        label: goal.charAt(0).toUpperCase() + goal.slice(1),
        type: 'goal',
        strength: 60,
        status: 'active',
        connections: [],
        lastUpdated: new Date(),
        description: `Extracted from chat history`
      });
    });

    // Extract struggles
    const struggleKeywords = ['struggling with', 'hard to', 'difficult', 'problem with', 'can\'t seem to'];
    const foundStruggles = new Set<string>();
    
    struggleKeywords.forEach(keyword => {
      const regex = new RegExp(`${keyword} ([^.!?]+)`, 'gi');
      const matches = allText.matchAll(regex);
      for (const match of matches) {
        const struggle = match[1].trim().slice(0, 30);
        if (struggle.length > 5) foundStruggles.add(struggle);
      }
    });

    Array.from(foundStruggles).slice(0, 2).forEach(struggle => {
      nodes.push({
        id: `node-${nodeId++}`,
        label: struggle.charAt(0).toUpperCase() + struggle.slice(1),
        type: 'struggle',
        strength: 40,
        status: 'developing',
        connections: [],
        lastUpdated: new Date(),
        description: `Challenge identified from conversations`
      });
    });

    // Extract habits (daily, regularly, always, every day)
    const habitPatterns = ['every day', 'daily', 'regularly', 'always', 'routine'];
    const foundHabits = new Set<string>();
    
    habitPatterns.forEach(pattern => {
      const regex = new RegExp(`(\\w+(?:\\s+\\w+){0,3})\\s+${pattern}`, 'gi');
      const matches = allText.matchAll(regex);
      for (const match of matches) {
        const habit = match[1].trim().slice(0, 25);
        if (habit.length > 5) foundHabits.add(habit);
      }
    });

    Array.from(foundHabits).slice(0, 3).forEach(habit => {
      nodes.push({
        id: `node-${nodeId++}`,
        label: habit.charAt(0).toUpperCase() + habit.slice(1),
        type: 'habit',
        strength: Math.floor(Math.random() * 30) + 50,
        status: 'active',
        connections: [],
        lastUpdated: new Date(),
        description: `Regular activity mentioned in chats`
      });
    });

    // Add some traits based on message tone/frequency
    const messageCount = userMessages.length;
    if (messageCount > 50) {
      nodes.push({
        id: `node-${nodeId++}`,
        label: 'Curiosity',
        type: 'trait',
        strength: 85,
        status: 'mastered',
        connections: [],
        lastUpdated: new Date(),
        description: 'Frequent learner, asks many questions'
      });
    }

    // Create logical connections
    nodes.forEach(node => {
      if (node.type === 'goal') {
        const relatedHabits = nodes.filter(n => n.type === 'habit').slice(0, 2);
        node.connections = relatedHabits.map(n => n.id);
      }
      if (node.type === 'struggle') {
        const relatedGoals = nodes.filter(n => n.type === 'goal').slice(0, 1);
        node.connections = relatedGoals.map(n => n.id);
      }
    });

    return nodes.length > 0 ? nodes : generateFallbackNodes();
  } catch (error) {
    console.error('Error parsing ChatGPT data:', error);
    return generateFallbackNodes();
  }
};

const generateFallbackNodes = (): IdentityNode[] => {
  return [
    {
      id: 'node-1',
      label: 'Personal Growth',
      type: 'goal',
      strength: 70,
      status: 'active',
      connections: ['node-2'],
      lastUpdated: new Date(),
      description: 'Continuous self-improvement'
    },
    {
      id: 'node-2',
      label: 'Learning',
      type: 'habit',
      strength: 65,
      status: 'active',
      connections: [],
      lastUpdated: new Date(),
      description: 'Regular knowledge acquisition'
    },
    {
      id: 'node-3',
      label: 'Curiosity',
      type: 'trait',
      strength: 80,
      status: 'mastered',
      connections: ['node-1'],
      lastUpdated: new Date(),
      description: 'Natural desire to learn and explore'
    }
  ];
};

