import type { IdentityNode } from '../types';
import { cleanText } from './cleanText';

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
          label: cleanText(goal.charAt(0).toUpperCase() + goal.slice(1)),
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

  // Extract habits FIRST (before struggles) to catch "struggling with a habit"
  const habitPatterns = [
    /i ([^.!?,]+) every day/gi,
    /i ([^.!?,]+) daily/gi,
    /my routine is ([^.!?,]+)/gi,
    /i always ([^.!?,]+)/gi,
    /i usually ([^.!?,]+)/gi,
    /i'm trying to ([^.!?,]+) every day/gi,
    /i want to ([^.!?,]+) daily/gi,
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

  // Extract struggles (but check if it's actually a habit they're struggling with)
  const strugglePatterns = [
    /i struggle with ([^.!?,]+)/gi,
    /i'm struggling with ([^.!?,]+)/gi,
    /it's hard to ([^.!?,]+)/gi,
    /i can't ([^.!?,]+)/gi,
    /my problem is ([^.!?,]+)/gi,
    /i have trouble ([^.!?,]+)/gi,
    /i'm having trouble ([^.!?,]+)/gi,
    /i can't seem to ([^.!?,]+)/gi,
    /i struggle to ([^.!?,]+)/gi,
  ];

  strugglePatterns.forEach(pattern => {
    const matches = lowerMessage.matchAll(pattern);
    for (const match of matches) {
      const struggle = match[1].trim().slice(0, 40);
      if (struggle.length > 3 && !existingLabels.has(struggle)) {
        existingLabels.add(struggle);
        
        // Check if it sounds like a habit they're struggling with
        // Look for common habit-related words or patterns
        const habitIndicators = [
          'waking up', 'wake up', 'meditation', 'meditate', 'exercise', 'working out', 
          'reading', 'writing', 'journaling', 'sleeping', 'eating', 'drinking', 
          'studying', 'practicing', 'going to bed', 'getting up', 'morning routine',
          'evening routine', 'workout', 'gym', 'run', 'walk', 'yoga', 'stretch'
        ];
        const struggleLower = struggle.toLowerCase();
        const isHabitStruggle = habitIndicators.some(keyword => struggleLower.includes(keyword)) ||
          // Also check if it's a verb phrase that sounds like a habit
          /^(wake|get|do|go|make|take|have|keep|maintain|build|start|stop|quit)/i.test(struggle);
        
        newNodes.push({
          id: `node-chat-${nodeId++}`,
          label: cleanText(struggle.charAt(0).toUpperCase() + struggle.slice(1)),
          type: isHabitStruggle ? 'habit' : 'struggle',
          strength: isHabitStruggle ? 35 : 40, // Lower strength if it's a habit they're struggling with
          status: 'developing',
          connections: [],
          lastUpdated: new Date(),
          createdAt: new Date(),
          description: isHabitStruggle 
            ? 'Habit they are struggling with, identified from conversation'
            : 'Challenge identified from conversation'
        });
      }
    }
  });

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
          label: cleanText(emotion.charAt(0).toUpperCase() + emotion.slice(1)),
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

