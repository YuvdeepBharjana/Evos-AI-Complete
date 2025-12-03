import OpenAI from 'openai';

// Initialize OpenAI client (may be null if no API key)
let openai: OpenAI | null = null;

try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    console.log('✅ OpenAI initialized');
  } else {
    console.log('⚠️  No OPENAI_API_KEY - running in mock mode');
  }
} catch (e) {
  console.log('⚠️  OpenAI initialization failed - running in mock mode');
}

export function isAIAvailable(): boolean {
  return openai !== null;
}

// System prompts for identity engineering
export const SYSTEM_PROMPTS = {
  chat: `You are Evos, the world's first AI identity engineer. You help users understand, visualize, and intentionally evolve their psychological patterns.

CRITICAL: You have access to the user's complete identity profile, including:
- How they onboarded (questionnaire, uploaded data, or manual entry)
- All their identity nodes (goals, habits, traits, emotions, struggles, interests)
- Node descriptions, strengths, and status
- Their identity patterns and insights

Your approach - TAILORED TO THEIR IDENTITY:
- Tone: Adjust based on their profile. More supportive if many struggles, more challenging if many strengths.
- Be direct, warm, and insightful — like a brilliant friend who sees through surface-level talk
- ALWAYS reference their specific identity nodes by name: "This connects to your [exact node name] pattern..."
- Use their onboarding method strategically:
  * If they UPLOADED data: You have deep context. Reference specific patterns, insights, or themes from their imported content. Show you've absorbed their history.
  * If they used QUESTIONNAIRE: Reference their structured answers. Show you understand their self-reported patterns.
  * If they used MANUAL: They carefully selected these nodes. Respect their intentionality.
- Connect what they share to their broader identity map with specific details: "This relates to your [node name] which is at [strength]% strength and [status]..."
- Reference their struggles, goals, and traits by exact name: "I see this connects to your struggle with '[struggle name]'..."
- Build on previous conversations AND their complete identity profile
- Pay attention to their "developing" nodes - these are active growth edges where they're working
- Offer one actionable insight per response that connects to their existing identity map
- Keep responses thoughtful but concise (3-4 paragraphs when needed)

IMPORTANT FORMATTING RULES:
- DO NOT use markdown formatting (no asterisks, no bold, no italic, no code blocks)
- Write in plain text only
- Use simple line breaks for paragraphs
- Never use asterisks, backticks, or hash symbols

You're not a therapist. You're an identity engineer — you help people SEE themselves clearly so they can evolve intentionally.

Key phrases to use:
- "Looking at your identity map, I see [specific node]..."
- "This connects to your [node name] which you've been working on..."
- "Based on your [onboarding method] data, I noticed..."
- "Your [struggle/goal/trait name] pattern shows up here..."
- "What pattern do you notice here?"
- "How does this connect to who you want to become?"

When you see identity nodes in the context, USE THEM. Reference specific nodes by name. Show that you understand their complete identity profile.

NODE CREATION - IMPORTANT:
When you recognize a new identity pattern, habit, goal, struggle, trait, or emotion that should be added to their identity map, include this at the END of your response:

[ADD_NODE:type:label:strength]

Where:
- type = goal, habit, trait, emotion, struggle, or interest
- label = short descriptive label (2-5 words)
- strength = initial strength 1-100 (struggles start lower ~30-40, habits/goals ~50-60, traits ~60-70)

Examples:
- If they mention wanting to wake up early: [ADD_NODE:habit:Wake Up Early:45]
- If they talk about struggling with procrastination: [ADD_NODE:struggle:Procrastination:35]
- If they express a goal to learn something: [ADD_NODE:goal:Learn Guitar:55]
- If they reveal a personality trait: [ADD_NODE:trait:Analytical Thinker:65]

Only add nodes for NEW patterns not already in their identity map. Check their existing nodes before suggesting.
When you add a node, mention it naturally in your response like "I'm adding this to your identity mirror so we can track it."`,

  workSession: `You are Evos, helping a user with a focused identity work session.

Your role:
- Help them make concrete progress on their chosen focus area
- Break down vague goals into specific, measurable micro-actions
- Ask: "What's the smallest step you could take in the next 5 minutes?"
- Celebrate progress: "That's identity in action."
- If stuck, find the resistance: "What's making this hard right now?"

Keep responses focused. Max 2-3 paragraphs. Every response should end with a clear next action.`,

  identityAnalysis: `You are an identity pattern extractor for Evos, the world's first identity engineering platform.

Analyze the provided text and extract identity patterns. Be specific and grounded in evidence from the text.

Respond ONLY in this exact JSON format:
{
  "nodes": [
    {
      "label": "Pattern Name",
      "type": "goal|habit|trait|emotion|struggle|interest",
      "strength": 50,
      "description": "Brief explanation based on evidence from text"
    }
  ],
  "connections": [
    {
      "source": "Node Label 1",
      "target": "Node Label 2",
      "reason": "Why these are connected"
    }
  ],
  "summary": "2-sentence identity summary"
}

Guidelines:
- Extract 8-15 nodes covering all types
- Strength: 30-50 for emerging patterns, 50-70 for clear patterns, 70-90 for dominant patterns
- Connect nodes that influence each other
- Be specific: "Perfectionism in work output" not just "Perfectionism"`,

  dailyActions: `You are generating daily proof-moves for identity engineering.

Each action must be:
1. BINARY - Either done or not done (no partial credit)
2. SPECIFIC - Clear what success looks like
3. TIMED - Completable in 5-20 minutes
4. IDENTITY-LINKED - Directly strengthens or challenges a node

Respond ONLY in this JSON format:
{
  "actions": [
    {
      "nodeId": "node-id-if-provided",
      "nodeName": "Target Node Name",
      "category": "📊 Data|💪 Challenge|🎯 Practice|📝 Reflection",
      "action": "Specific action description",
      "timeEstimate": "X min",
      "whyItMatters": "One sentence on identity impact"
    }
  ]
}

Focus on nodes that are "developing" or "struggling". One action should always be data tracking.`,

  endOfDaySummary: `You are generating an end-of-day identity summary.

Based on the user's tracking data and completed actions, provide:
1. What they proved about their identity today
2. Which nodes were strengthened/weakened
3. One pattern to watch
4. One thing to try tomorrow

Respond in JSON format:
{
  "headline": "One powerful sentence about today",
  "proved": ["What they proved through action"],
  "strengthened": ["Nodes that got stronger"],
  "watchPattern": "Pattern to be aware of",
  "tomorrowFocus": "Specific suggestion for tomorrow",
  "alignmentScore": 75
}

Be honest but encouraging. Focus on what they DID, not what they didn't.`
};

// Smart history management - keep recent messages, summarize older ones
function manageHistory(
  history: { role: 'user' | 'assistant'; content: string }[],
  maxRecentMessages: number = 10
): { role: 'user' | 'assistant'; content: string }[] {
  if (history.length <= maxRecentMessages) {
    return history;
  }

  // Keep the most recent messages
  const recent = history.slice(-maxRecentMessages);
  
  // Summarize older messages (for now, just keep a summary note)
  // In production, you'd call OpenAI to summarize
  const olderCount = history.length - maxRecentMessages;
  const summary: { role: 'assistant'; content: string } = {
    role: 'assistant',
    content: `[Previous conversation context: ${olderCount} earlier messages about identity patterns, goals, struggles, and growth edges]`
  };

  return [summary, ...recent];
}

// Chat with AI
export async function chat(
  message: string,
  history: { role: 'user' | 'assistant'; content: string }[] = [],
  systemPrompt: string = SYSTEM_PROMPTS.chat,
  identityContext?: string
): Promise<string> {
  if (!openai) {
    return mockChatResponse(message);
  }

  try {
    // Build enhanced system prompt with identity context
    let enhancedPrompt = systemPrompt;
    if (identityContext) {
      enhancedPrompt += `\n\n=== USER'S COMPLETE IDENTITY PROFILE ===\n${identityContext}\n=== END IDENTITY PROFILE ===\n\n`;
      enhancedPrompt += `CRITICAL INSTRUCTIONS FOR USING THIS PROFILE:\n`;
      enhancedPrompt += `1. TONE TAILORING: Adjust your tone based on their identity patterns:\n`;
      enhancedPrompt += `   - If they have many struggles: Be more supportive but still direct. Acknowledge the difficulty.\n`;
      enhancedPrompt += `   - If they have high-strength mastered patterns: You can be more challenging and push them further.\n`;
      enhancedPrompt += `   - If they uploaded data: Reference specific insights from their imported content. Show you've absorbed their history.\n`;
      enhancedPrompt += `   - If they used questionnaire: Reference their structured answers. Show you understand their self-reported patterns.\n`;
      enhancedPrompt += `2. SPECIFICITY: Always reference their actual node names, not generic concepts.\n`;
      enhancedPrompt += `   - Say "your 'Procrastination' struggle" not "your procrastination issue"\n`;
      enhancedPrompt += `   - Say "your 'Morning Routine' goal" not "your morning goals"\n`;
      enhancedPrompt += `3. CONNECTIONS: Draw explicit connections between what they're saying NOW and their existing identity map.\n`;
      enhancedPrompt += `4. PATTERN RECOGNITION: If they mention something that matches an existing node, immediately connect it.\n`;
      enhancedPrompt += `5. GROWTH EDGES: Pay special attention to their "developing" nodes - these are active growth areas.\n`;
      enhancedPrompt += `6. IMPORTED DATA CONTEXT: If their onboarding method was "upload", they shared deep personal data. Reference specific patterns, insights, or themes from that data.\n`;
      enhancedPrompt += `\nYour responses should feel like you've known them through their complete identity profile, not like a generic assistant.`;
    }

    // Manage history to stay within token limits
    const managedHistory = manageHistory(history, 12);

    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: 'system', content: enhancedPrompt },
      ...managedHistory,
      { role: 'user', content: message }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 1000, // Increased from 500 for deeper responses
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || mockChatResponse(message);
  } catch (error) {
    console.error('OpenAI chat error:', error);
    return mockChatResponse(message);
  }
}

// Analyze text for identity patterns
export async function analyzeIdentity(text: string): Promise<any> {
  if (!openai) {
    return mockIdentityAnalysis();
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPTS.identityAnalysis },
        { role: 'user', content: `Analyze this text for identity patterns:\n\n${text}` }
      ],
      max_tokens: 1500,
      temperature: 0.3,
    });

    const responseText = completion.choices[0]?.message?.content || '';
    
    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return mockIdentityAnalysis();
  } catch (error) {
    console.error('OpenAI analysis error:', error);
    return mockIdentityAnalysis();
  }
}

// Generate daily actions
export async function generateDailyActions(nodes: any[]): Promise<any> {
  if (!openai) {
    return mockDailyActions(nodes);
  }

  try {
    const nodesContext = nodes.map(n => 
      `- ${n.label} (${n.type}, strength: ${n.strength}%, status: ${n.status})`
    ).join('\n');

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPTS.dailyActions },
        { role: 'user', content: `Generate 3 daily proof-moves for these identity nodes:\n\n${nodesContext}` }
      ],
      max_tokens: 800,
      temperature: 0.7,
    });

    const responseText = completion.choices[0]?.message?.content || '';
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return mockDailyActions(nodes);
  } catch (error) {
    console.error('OpenAI daily actions error:', error);
    return mockDailyActions(nodes);
  }
}

// Generate end of day summary
export async function generateSummary(
  trackingData: any,
  completedActions: any[],
  nodes: any[]
): Promise<any> {
  if (!openai) {
    return mockSummary(trackingData, completedActions);
  }

  try {
    const context = `
Tracking Data:
- Calories: ${trackingData.calories || 'not tracked'}
- Exercise: ${trackingData.exercise_mins || 'not tracked'} min
- Deep Work: ${trackingData.deep_work_hrs || 'not tracked'} hrs
- Sleep: ${trackingData.sleep_hrs || 'not tracked'} hrs
- Mood: ${trackingData.mood || 'not tracked'}/10

Completed Actions:
${completedActions.map(a => `- ${a.action_text} (${a.status})`).join('\n') || 'None'}

Identity Nodes:
${nodes.slice(0, 5).map(n => `- ${n.label}: ${n.strength}%`).join('\n')}
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPTS.endOfDaySummary },
        { role: 'user', content: `Generate end-of-day summary:\n${context}` }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const responseText = completion.choices[0]?.message?.content || '';
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return mockSummary(trackingData, completedActions);
  } catch (error) {
    console.error('OpenAI summary error:', error);
    return mockSummary(trackingData, completedActions);
  }
}

// Mock responses for when OpenAI is unavailable
function mockChatResponse(message: string): string {
  const lower = message.toLowerCase();
  
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    return "Welcome to Evos. I'm here to help you understand and engineer your identity. What's on your mind today? What patterns have you been noticing in your life?";
  }
  
  if (lower.includes('goal') || lower.includes('want to')) {
    return "That's a meaningful aspiration. Goals reveal what we value. What would achieving this change about how you see yourself? And what's the smallest step you could take today to move toward it?";
  }
  
  if (lower.includes('stuck') || lower.includes('help')) {
    return "Being stuck often signals a growth edge — a place where your current identity meets the person you're becoming. What's the resistance you're feeling? Sometimes naming it takes away its power.";
  }
  
  if (lower.includes('anxious') || lower.includes('worried') || lower.includes('stress')) {
    return "Anxiety often points to something that deeply matters to us. What's at stake here? And I'm curious — is this a pattern you've noticed before, or does this feel new?";
  }
  
  if (lower.includes('habit') || lower.includes('routine')) {
    return "Habits are identity in action — they're proof of who we're becoming. Which habits feel aligned with your future self, and which ones feel like they belong to an old version of you?";
  }
  
  return "I hear you. Tell me more about this. What patterns do you notice? Every insight is data for your identity map. The more clearly you see yourself, the more intentionally you can evolve.";
}

function mockIdentityAnalysis(): any {
  return {
    nodes: [
      { label: "Personal Growth", type: "goal", strength: 75, description: "Strong drive for self-improvement" },
      { label: "Morning Routine", type: "habit", strength: 60, description: "Developing consistent morning practices" },
      { label: "Analytical Thinking", type: "trait", strength: 80, description: "Tendency to analyze situations deeply" },
      { label: "Determination", type: "emotion", strength: 85, description: "High motivation and drive" },
      { label: "Perfectionism", type: "struggle", strength: 55, description: "Sometimes blocks progress" },
      { label: "Technology", type: "interest", strength: 70, description: "Engaged with tech and innovation" }
    ],
    connections: [
      { source: "Personal Growth", target: "Morning Routine", reason: "Routines support growth goals" },
      { source: "Perfectionism", target: "Personal Growth", reason: "Can both drive and hinder growth" },
      { source: "Determination", target: "Personal Growth", reason: "Fuels pursuit of growth" }
    ],
    summary: "You show a strong drive for personal growth supported by determination and analytical thinking. Managing perfectionism is your key growth edge."
  };
}

function mockDailyActions(nodes: any[]): any {
  const struggles = nodes.filter(n => n.type === 'struggle' || n.strength < 50);
  const developing = nodes.filter(n => n.status === 'developing');
  
  const targetNode = struggles[0] || developing[0] || nodes[0];
  
  return {
    actions: [
      {
        nodeId: null,
        nodeName: "📊 Daily Data",
        category: "📊 Data",
        action: "Open the Daily Tracker. Enter all 5 numbers: calories, exercise minutes, work hours, sleep hours, mood (1-10). All 5 or it doesn't count. Takes 2 minutes.",
        timeEstimate: "2 min",
        whyItMatters: "Data closes the identity loop. No tracking, no growth."
      },
      {
        nodeId: targetNode?.id,
        nodeName: targetNode?.label || "Growth Edge",
        category: "💪 Challenge",
        action: `Identify one moment today where "${targetNode?.label || 'your growth edge'}" shows up. When you notice it, pause and choose a different response than usual. Write down what happened.`,
        timeEstimate: "15 min",
        whyItMatters: "Awareness + action = identity change"
      },
      {
        nodeId: null,
        nodeName: "Evening Reflection",
        category: "📝 Reflection",
        action: "Before bed, write 3 sentences: What did I prove about myself today? What pattern did I notice? What will I do differently tomorrow?",
        timeEstimate: "5 min",
        whyItMatters: "Reflection consolidates identity changes"
      }
    ]
  };
}

function mockSummary(trackingData: any, completedActions: any[]): any {
  const completed = completedActions.filter(a => a.status === 'done').length;
  const total = completedActions.length || 3;
  const alignmentScore = Math.round((completed / total) * 100);
  
  return {
    headline: completed > 0 
      ? `You showed up today. ${completed}/${total} actions completed.`
      : "Rest day. Tomorrow is another chance to prove who you're becoming.",
    proved: completed > 0 
      ? ["You can follow through on commitments", "Your identity goals matter to you"]
      : ["Even tracking this shows self-awareness"],
    strengthened: completed > 0 ? ["Consistency", "Self-discipline"] : ["Self-compassion"],
    watchPattern: "Notice what time of day you're most likely to complete your actions",
    tomorrowFocus: "Start with your hardest action first thing in the morning",
    alignmentScore: Math.max(alignmentScore, 25)
  };
}

