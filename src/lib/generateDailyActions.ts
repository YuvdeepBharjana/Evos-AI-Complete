import type { IdentityNode, DailyAction, IdentityGap } from '../types';
import { cleanText } from './cleanText';

/**
 * PROOF-MOVES: Not suggestions. Not ideas. Binary behaviors you either do or don't.
 * Every action must be:
 * - Concrete (specific action, not vague)
 * - Binary (done or not done, nothing in between)
 * - Time-bound (when to do it)
 * - Measurable (clear completion criteria)
 */

// PROOF-MOVE templates - ultra specific, binary outcomes
const PROOF_MOVE_TEMPLATES: Record<string, (node: IdentityNode, allNodes: IdentityNode[]) => string> = {
  habit: (node, allNodes) => {
    const goals = allNodes.filter(n => n.type === 'goal');
    const relatedGoal = goals[0];
    
    const proofMoves = [
      `Do ${node.label} for exactly 25 minutes. Start a timer. When it rings, you're done. No excuses, no extensions. Binary: timer ran or it didn't.`,
      `Complete ${node.label} before 9 AM tomorrow. Set an alarm for 7 AM. Do it first thing. Proof: screenshot your completion time.`,
      `Do ${node.label} at 50% more intensity than yesterday. If you ran 20 min, run 30. If you meditated 10, do 15. Measure the increase.`,
      relatedGoal 
        ? `Use ${node.label} to make progress on "${relatedGoal.label}". Specific: do ${node.label} for 20 min, then spend 10 min applying it to your goal. Two actions, one block.`
        : `Complete 2 full rounds of ${node.label} today. Not 1. Not "some." Exactly 2 complete sessions. Log the times.`,
      `${node.label} streak check: Did you do it yesterday? If yes, do it again today within 1 hour of the same time. If no, do it within 30 minutes of reading this.`
    ];
    return proofMoves[Math.floor(Math.random() * proofMoves.length)];
  },
  
  goal: (node, allNodes) => {
    const habits = allNodes.filter(n => n.type === 'habit' && n.strength >= 60);
    const supportingHabit = habits[0];
    
    const proofMoves = [
      `Ship one deliverable for "${node.label}" by 6 PM today. Not "work on it." Ship something. An email, a draft, a commit, a message. Something leaves your hands.`,
      `Block exactly 45 minutes for "${node.label}" in your calendar right now. No notifications. Phone in another room. At the end, write one sentence about what you accomplished.`,
      `Identify the #1 blocker for "${node.label}" and remove it today. Not "think about it." Take one action that eliminates or reduces the blocker by end of day.`,
      supportingHabit
        ? `Combine "${supportingHabit.label}" with "${node.label}": Do your habit, then immediately spend 15 min on your goal. No break between. Chain them.`
        : `Tell one person about your progress on "${node.label}" today. Text, call, or message. Make it external. Accountability = proof.`,
      `Write down 3 specific next actions for "${node.label}" — not ideas, actions. Then complete action #1 before bed tonight.`
    ];
    return proofMoves[Math.floor(Math.random() * proofMoves.length)];
  },
  
  trait: (node, allNodes) => {
    const struggles = allNodes.filter(n => n.type === 'struggle');
    const relatedStruggle = struggles[0];
    
    const proofMoves = [
      `Use "${node.label}" in one specific conversation today. Identify the conversation in advance. After, write down exactly how you demonstrated the trait.`,
      `Make one decision today that requires "${node.label}" and would be easier without it. Choose the harder path. Document what you chose and why.`,
      relatedStruggle
        ? `When "${relatedStruggle.label}" appears today, respond with "${node.label}" instead of your default. Notice the moment. Choose differently. Write it down.`
        : `Ask someone today: "Did you notice me being [${node.label.toLowerCase()}]?" Get external feedback. Their answer is data.`,
      `Before noon, put yourself in one situation that demands "${node.label}". Volunteer for something, start a conversation, make a request. Create the moment, don't wait for it.`,
      `Rate your "${node.label}" at 9 AM, 1 PM, and 6 PM today (1-10). Write the number down each time. Pattern = insight.`
    ];
    return proofMoves[Math.floor(Math.random() * proofMoves.length)];
  },
  
  emotion: (node, allNodes) => {
    const traits = allNodes.filter(n => n.type === 'trait' && n.strength >= 60);
    const habits = allNodes.filter(n => n.type === 'habit');
    const helpfulTrait = traits[0];
    const calmingHabit = habits.find(h => 
      h.label.toLowerCase().includes('meditation') || 
      h.label.toLowerCase().includes('breath') ||
      h.label.toLowerCase().includes('reflection')
    );
    
    const proofMoves = [
      `When "${node.label}" shows up today, pause for 10 seconds before reacting. Count to 10 out loud or in your head. Then choose your response. Log each time you do this.`,
      `Write exactly 3 sentences about "${node.label}" at the end of today: What triggered it? How intense (1-10)? What did you do? Three sentences, no more, no less.`,
      helpfulTrait
        ? `Use "${helpfulTrait.label}" as your response to "${node.label}" today. When you feel it rise, consciously activate the trait. Binary: you either switched or you didn't.`
        : `Name "${node.label}" out loud when you feel it today. Say "I'm feeling ${node.label.toLowerCase()} right now." Speaking it = acknowledging it = data.`,
      calmingHabit
        ? `If "${node.label}" intensity hits 7+ today, immediately do 5 minutes of "${calmingHabit.label}". This is your circuit breaker. Use it or don't. Binary.`
        : `Track "${node.label}" intensity 3x today: morning, midday, evening. Write the numbers. The pattern tells you something.`,
      `Share with one person today: "I've been feeling ${node.label.toLowerCase()} about X." Be specific about X. Saying it out loud = proof you're aware.`
    ];
    return proofMoves[Math.floor(Math.random() * proofMoves.length)];
  },
  
  struggle: (node, allNodes) => {
    const traits = allNodes.filter(n => n.type === 'trait' && n.strength >= 50);
    const goals = allNodes.filter(n => n.type === 'goal');
    const helpfulTrait = traits[0];
    const affectedGoal = goals[0];
    
    const proofMoves = [
      `"${node.label}" is at ${node.strength}%. Today, do ONE thing it doesn't want you to do. Identify the avoidance. Do the opposite. Document what you did.`,
      `Spend exactly 15 minutes on the hardest part of "${node.label}". Set a timer. When it rings, stop. You're not solving it today — you're proving you can face it.`,
      helpfulTrait
        ? `Attack "${node.label}" using your "${helpfulTrait.label}" (${helpfulTrait.strength}%). Identify one moment today where the struggle appears, and respond with the trait instead. Write down what happened.`
        : `Ask one person for honest feedback on your "${node.label}". Not advice — feedback. Listen without defending. Their words = data.`,
      affectedGoal
        ? `"${node.label}" is blocking "${affectedGoal.label}". Today, remove one obstacle — even a tiny one. Send the email. Make the call. Clear one thing.`
        : `Write down exactly how "${node.label}" cost you something this week. Be specific: time, money, opportunity, relationship. Read it twice.`,
      `Do the thing you've been avoiding because of "${node.label}". You know what it is. Do it today. Small version counts — but do it. Proof: it's done or it's not.`
    ];
    return proofMoves[Math.floor(Math.random() * proofMoves.length)];
  }
};

// TRACKING PROOF-MOVES - Binary completion
const TRACKING_PROOF_MOVES = [
  "Open the Daily Tracker. Enter all 5 numbers: calories, exercise minutes, work hours, sleep hours, mood (1-10). All 5 or it doesn't count. Takes 2 minutes.",
  "Log your data NOW, not later. Calories eaten so far. Exercise done. Work hours completed. Last night's sleep. Current mood. 5 fields. Go.",
  "Tracking proof: Screenshot your completed Daily Tracker with all 5 categories filled. No screenshot = no proof = no data = no growth.",
  "Before you close this app, fill in: sleep (last night), mood (now), calories (estimate), exercise (minutes), work (hours planned). 5 inputs. 60 seconds. Do it.",
  "Your AI is blind without data. Feed it: calories, exercise, work, sleep, mood. All 5 categories. Right now. This is the foundation of everything else."
];

// Calculate gap between current and desired strength
function calculateGap(node: IdentityNode): number {
  const desired = node.desiredStrength ?? (node.strength < 50 ? 80 : node.strength + 20);
  return Math.max(0, desired - node.strength);
}

// Find nodes with largest identity gaps
export function findTopGaps(nodes: IdentityNode[], count: number = 2): IdentityGap[] {
  const gaps: IdentityGap[] = nodes.map(node => ({
    node,
    gap: calculateGap(node),
    suggestedAction: PROOF_MOVE_TEMPLATES[node.type]?.(node, nodes) || `Work on "${node.label}" for 20 minutes today.`
  }));
  
  // Priority: struggles > developing > highest gap
  return gaps
    .filter(g => g.node.status !== 'mastered' || g.gap > 15)
    .sort((a, b) => {
      if (a.node.type === 'struggle' && b.node.type !== 'struggle') return -1;
      if (b.node.type === 'struggle' && a.node.type !== 'struggle') return 1;
      if (a.node.status === 'developing' && b.node.status !== 'developing') return -1;
      if (b.node.status === 'developing' && a.node.status !== 'developing') return 1;
      return b.gap - a.gap;
    })
    .slice(0, count);
}

// Generate daily PROOF-MOVES
export function generateDailyActions(nodes: IdentityNode[]): DailyAction[] {
  const topGaps = findTopGaps(nodes, 2);
  const trackingProof = TRACKING_PROOF_MOVES[Math.floor(Math.random() * TRACKING_PROOF_MOVES.length)];
  
  const identityActions = topGaps.map((gap, index) => ({
    id: `action-${Date.now()}-${index}`,
    nodeId: gap.node.id,
    nodeName: cleanText(gap.node.label),
    action: cleanText(gap.suggestedAction),
    timeEstimate: ['15 min', '20 min', '25 min', '30 min'][Math.floor(Math.random() * 4)],
    completed: undefined,
    createdAt: new Date()
  }));
  
  // Tracking is ALWAYS first
  const trackingAction: DailyAction = {
    id: `action-${Date.now()}-tracking`,
    nodeId: 'tracking',
    nodeName: '📊 Daily Data',
    action: trackingProof,
    timeEstimate: '2 min',
    completed: undefined,
    createdAt: new Date()
  };
  
  return [trackingAction, ...identityActions];
}

// Completion messages - also specific
export function getCompletionMessage(completed: boolean, nodeName: string, strength?: number): string {
  if (completed) {
    return [
      `Proof logged. "${nodeName}" gets stronger. ${strength ? `${Math.min(100, strength + 7)}% now.` : ''} Tomorrow we build on this.`,
      `Done. You showed up. "${nodeName}" is no longer just an idea — it's who you're becoming.`,
      `Executed. The system learned something about you today. "${nodeName}" is more real now.`,
      `Binary: done. "${nodeName}" moved. Tomorrow's task will be harder because you can handle harder.`
    ][Math.floor(Math.random() * 4)];
  } else {
    return [
      `"${nodeName}" didn't happen. No judgment — just data. What got in the way? Be specific.`,
      `Skipped. The gap on "${nodeName}" just got wider. Tomorrow's task will adjust. What would've made today possible?`,
      `Not done. That's information. "${nodeName}" needs a different approach. Chat with me — let's adapt.`,
      `Failed to execute on "${nodeName}". The system is learning. Tell me what blocked you — I'll generate something more realistic.`
    ][Math.floor(Math.random() * 4)];
  }
}

export function calculateWorkSessionStrength(
  duration: number,
  quality: 'low' | 'medium' | 'high' | 'exceptional' | 'none'
): number {
  if (quality === 'none') return 0;
  const baseChange = Math.min(duration / 10, 5);
  const multipliers = { low: 0.5, medium: 1, high: 1.5, exceptional: 2 };
  return Math.round(baseChange * multipliers[quality]);
}
