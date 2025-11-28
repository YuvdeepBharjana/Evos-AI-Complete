import type { IdentityNode } from '../types';

/**
 * Extracts identity nodes from chat messages
 * This analyzes user messages to find goals, habits, struggles, traits, and emotions
 */
export const extractIdentityFromChat = (
  message: string,
  existingNodes: IdentityNode[]
): IdentityNode[] => {
  const lowerMessage = message.toLowerCase();
  const newNodes: IdentityNode[] = [];
  let nodeId = existingNodes.length + 1;

  // Check for existing node labels to avoid duplicates
  const existingLabels = new Set(existingNodes.map(n => n.label.toLowerCase()));

  // Extract goals
  const goalPatterns = [
    /i want to ([^.!?,]+)/gi,
    /my goal is to ([^.!?,]+)/gi,
    /i'm trying to ([^.!?,]+)/gi,
    /i need to ([^.!?,]+)/gi,
    /working on ([^.!?,]+)/gi,
    /planning to ([^.!?,]+)/gi,
  ];

  goalPatterns.forEach(pattern => {
    const matches = lowerMessage.matchAll(pattern);
    for (const match of matches) {
      const goal = match[1].trim().slice(0, 40);
      if (goal.length > 3 && !existingLabels.has(goal)) {
        existingLabels.add(goal);
        newNodes.push({
          id: `node-chat-${nodeId++}`,
          label: goal.charAt(0).toUpperCase() + goal.slice(1),
          type: 'goal',
          strength: 60,
          status: 'active',
          connections: [],
          lastUpdated: new Date(),
          description: 'Extracted from conversation'
        });
      }
    }
  });

  // Extract struggles
  const strugglePatterns = [
    /i struggle with ([^.!?,]+)/gi,
    /i'm struggling with ([^.!?,]+)/gi,
    /it's hard to ([^.!?,]+)/gi,
    /i can't ([^.!?,]+)/gi,
    /my problem is ([^.!?,]+)/gi,
    /i have trouble ([^.!?,]+)/gi,
  ];

  strugglePatterns.forEach(pattern => {
    const matches = lowerMessage.matchAll(pattern);
    for (const match of matches) {
      const struggle = match[1].trim().slice(0, 40);
      if (struggle.length > 3 && !existingLabels.has(struggle)) {
        existingLabels.add(struggle);
        newNodes.push({
          id: `node-chat-${nodeId++}`,
          label: struggle.charAt(0).toUpperCase() + struggle.slice(1),
          type: 'struggle',
          strength: 40,
          status: 'developing',
          connections: [],
          lastUpdated: new Date(),
          description: 'Challenge identified from conversation'
        });
      }
    }
  });

  // Extract habits
  const habitPatterns = [
    /i ([^.!?,]+) every day/gi,
    /i ([^.!?,]+) daily/gi,
    /my routine is ([^.!?,]+)/gi,
    /i always ([^.!?,]+)/gi,
    /i usually ([^.!?,]+)/gi,
  ];

  habitPatterns.forEach(pattern => {
    const matches = lowerMessage.matchAll(pattern);
    for (const match of matches) {
      const habit = match[1].trim().slice(0, 40);
      if (habit.length > 3 && !existingLabels.has(habit)) {
        existingLabels.add(habit);
        newNodes.push({
          id: `node-chat-${nodeId++}`,
          label: habit.charAt(0).toUpperCase() + habit.slice(1),
          type: 'habit',
          strength: 55,
          status: 'active',
          connections: [],
          lastUpdated: new Date(),
          description: 'Habit mentioned in conversation'
        });
      }
    }
  });

  // Extract emotions
  const emotionPatterns = [
    /i feel ([^.!?,]+)/gi,
    /i'm feeling ([^.!?,]+)/gi,
    /i am ([^.!?,]+)/gi,
  ];

  const emotionKeywords = ['happy', 'sad', 'anxious', 'excited', 'stressed', 'motivated', 'tired', 'hopeful', 'frustrated', 'confident', 'overwhelmed', 'grateful'];

  emotionPatterns.forEach(pattern => {
    const matches = lowerMessage.matchAll(pattern);
    for (const match of matches) {
      const emotion = match[1].trim().split(' ')[0].slice(0, 20);
      if (emotionKeywords.some(e => emotion.includes(e)) && !existingLabels.has(emotion)) {
        existingLabels.add(emotion);
        newNodes.push({
          id: `node-chat-${nodeId++}`,
          label: emotion.charAt(0).toUpperCase() + emotion.slice(1),
          type: 'emotion',
          strength: 50,
          status: 'active',
          connections: [],
          lastUpdated: new Date(),
          description: 'Emotional state from conversation'
        });
      }
    }
  });

  // Connect new nodes to existing ones where relevant
  if (newNodes.length > 0 && existingNodes.length > 0) {
    newNodes.forEach(newNode => {
      if (newNode.type === 'goal') {
        const relatedHabits = existingNodes.filter(n => n.type === 'habit').slice(0, 2);
        newNode.connections = relatedHabits.map(n => n.id);
      }
      if (newNode.type === 'struggle') {
        const relatedGoals = existingNodes.filter(n => n.type === 'goal').slice(0, 1);
        newNode.connections = relatedGoals.map(n => n.id);
      }
    });
  }

  return newNodes;
};

