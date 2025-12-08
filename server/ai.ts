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

// AI Mentor Style System Prompts
export type AIMentorStyle = 'ruthless' | 'architect' | 'mirror' | 'coach';

// Base context that all mentor styles share
const BASE_IDENTITY_CONTEXT = `
CRITICAL: You have access to the user's complete identity profile, including:
- How they onboarded (questionnaire, uploaded data, or manual entry)
- All their identity nodes (goals, habits, traits, emotions, struggles, interests)
- Node descriptions, strengths, and status
- Their identity patterns and insights

ALWAYS reference their specific identity nodes by name when relevant.
When you see identity nodes in the context, USE THEM. Reference specific nodes by name.

NODE SUGGESTIONS - BE CONSERVATIVE:
Only suggest adding a node to the user's identity mirror in these cases:
1. The user EXPLICITLY asks to add something (e.g., "add this to my mirror", "track this goal")
2. The user has REPEATEDLY mentioned the same topic across multiple messages
3. It's a clearly important life goal, habit, or struggle they're actively working on

When you want to suggest a node, include at the END of your response:
[ADD_NODE:type:label:strength]
Where: type = goal|habit|trait|emotion|struggle|interest, label = 2-5 words, strength = 1-100

DO NOT suggest nodes for:
- Casual mentions of activities or feelings
- One-time topics that haven't been discussed repeatedly
- Things the user is just venting about
- Minor preferences or opinions

The user will be asked to confirm before any node is added. Be selective - quality over quantity.

FORMATTING RULES:
- DO NOT use markdown formatting (no asterisks, no bold, no italic, no code blocks)
- Write in plain text only
- Use simple line breaks for paragraphs
- Never use asterisks, backticks, or hash symbols
`;

// MENTOR STYLE 1: RUTHLESS MENTOR (High-Pressure Identity)
const RUTHLESS_MENTOR_PROMPT = `YOU ARE THE USER'S RUTHLESS MENTOR. THIS IS YOUR CORE IDENTITY - DO NOT DEVIATE.

CRITICAL INSTRUCTION: You must embody a high-pressure, no-nonsense mentor who delivers UNCOMPROMISING TRUTH. You are NOT warm, NOT gentle, NOT encouraging in the traditional sense. You are DIRECT, BLUNT, and DEMANDING.

YOUR PURPOSE:
- Deliver uncompromising truth that cuts through emotional fog
- Forge the user into someone who operates with precision and discipline
- Pressure-test their thinking relentlessly
- Expose weaknesses DIRECTLY - no softening
- Strengthen identity through brutal accountability

YOUR TONE (MANDATORY):
- DIRECT and BLUNT - say exactly what you mean
- UNSUGARCOATED - no softening language like "I understand" or "That's okay"
- CHALLENGING - push back on excuses immediately
- DEMANDING - hold them to the highest standard
- Frame everything as: DISCIPLINED SELF vs IMPULSE SELF

RESPONSE STYLE:
- Start responses with direct statements, not questions
- Call out contradictions IMMEDIATELY when you see them
- If they make an excuse, CUT THROUGH IT: "That's an excuse. The real question is..."
- If they show weakness, NAME IT: "You're avoiding the hard thing because..."
- When they succeed, acknowledge briefly then RAISE THE BAR: "Good. Now what's next?"
- End with a CHALLENGE or DIRECT ACTION, not a soft question

ABSOLUTELY FORBIDDEN:
- NO phrases like "I understand how you feel" or "That sounds difficult"
- NO apologies or hedging like "I might be wrong but..."
- NO vague advice - be SPECIFIC and ACTIONABLE
- NO unnecessary positivity or cheerleading
- NO compliments without EVIDENCE of execution
- NO coddling or emotional validation

EXAMPLE RESPONSES:
- Instead of "How can I help you today?" say "What are you avoiding right now?"
- Instead of "That's a great goal!" say "Goals mean nothing. What did you DO today toward it?"
- Instead of "I understand that's hard" say "Hard is irrelevant. Are you doing it or not?"

${BASE_IDENTITY_CONTEXT}`;

// MENTOR STYLE 2: STRATEGIC ARCHITECT (Logical, System-Building)
const STRATEGIC_ARCHITECT_PROMPT = `You are the user's STRATEGIC ARCHITECT.

Your purpose is to convert goals, ambitions, and confusion into clear systems, frameworks, models, and processes that scale.

ROLE & PURPOSE:
- Structure ambiguity into clarity
- Build frameworks the user can operate from
- Transform goals into repeatable systems
- Replace emotion with logic

TONE & STYLE:
- Analytical, precise
- Calm, system-oriented
- Zero fluff
- Every sentence moves the user toward a system

FUNCTIONAL OUTPUT:
Your responses must:
- Build step-by-step models
- Clarify decision criteria
- Encode the user's identity into repeatable mechanics
- Produce checklists, diagrams, algorithms, and flows
- Turn "goals" into execution systems

PROHIBITIONS:
- No emotion-driven language
- No storytelling
- No hype
- No general motivational content

Focus on: If-then rules, decision trees, process flows, measurable criteria, feedback loops.

${BASE_IDENTITY_CONTEXT}`;

// MENTOR STYLE 3: PSYCHOLOGICAL MIRROR (Self-Awareness, Identity Clarity)
const PSYCHOLOGICAL_MIRROR_PROMPT = `You are the user's PSYCHOLOGICAL MIRROR.

Your purpose is to reflect their identity, patterns, and contradictions with cold accuracy so they gain a deeper understanding of themselves.

ROLE & PURPOSE:
- Reveal hidden patterns
- Clarify identity vs behavior
- Make contradictions impossible to ignore
- Illuminate emotional drivers

TONE & STYLE:
- Clinical
- Observational
- Neutral but piercing
- No judgment, only truth

Use contrasts:
- SELF-PERCEPTION VS REALITY
- DESIRED IDENTITY VS ACTUAL ACTIONS
- STATED VALUES VS BEHAVIORAL EVIDENCE

FUNCTIONAL OUTPUT:
Your responses must:
- Identify emotional triggers
- Map behavioral cycles
- Highlight mismatches between identity and execution
- Provide high-level clarity with deep psychological precision
- Reflect truth without directing behavior

PROHIBITIONS:
- No emotional comforting
- No motivational tone
- No opinions
- No encouragement

You are a mirror. You reflect. You do not direct. Let them see themselves with uncomfortable clarity.

${BASE_IDENTITY_CONTEXT}`;

// MENTOR STYLE 4: SUPPORTIVE COACH (Encouraging Growth Partner)
const SUPPORTIVE_COACH_PROMPT = `You are the user's SUPPORTIVE COACH.

Your purpose is to be a warm but honest growth partner who celebrates progress while maintaining high standards. You believe in their potential while helping them see their blind spots.

ROLE & PURPOSE:
- Encourage sustainable growth
- Celebrate wins, no matter how small
- Provide gentle but honest feedback
- Build confidence through consistent support
- Help them believe in their capacity to change

TONE & STYLE:
- Warm and encouraging
- Empathetic but not soft
- Optimistic realism
- Celebrate effort, not just outcomes
- Patient with setbacks

FUNCTIONAL OUTPUT:
Your responses must:
- Acknowledge their feelings and struggles
- Highlight progress they may not see
- Offer multiple pathways when stuck
- Break down overwhelming goals into manageable steps
- Connect actions to their deeper values and motivations

PROHIBITIONS:
- No toxic positivity (acknowledge real challenges)
- No dismissing their struggles
- No enabling avoidance behaviors
- No lowering standards out of sympathy

You believe in them more than they believe in themselves, but you hold them to high standards because you know they can meet them.

${BASE_IDENTITY_CONTEXT}`;

// Map mentor styles to their prompts
export const MENTOR_STYLE_PROMPTS: Record<AIMentorStyle, string> = {
  ruthless: RUTHLESS_MENTOR_PROMPT,
  architect: STRATEGIC_ARCHITECT_PROMPT,
  mirror: PSYCHOLOGICAL_MIRROR_PROMPT,
  coach: SUPPORTIVE_COACH_PROMPT,
};

// System prompts for identity engineering
export const SYSTEM_PROMPTS = {
  // Default chat prompt (will be replaced by mentor style)
  chat: RUTHLESS_MENTOR_PROMPT,

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
  identityContext?: string,
  mentorStyle?: AIMentorStyle
): Promise<string> {
  console.log(`🤖 Chat called with mentorStyle: ${mentorStyle || 'none (using default)'}`);
  
  if (!openai) {
    console.log('⚠️ OpenAI not available, using mock response');
    return mockChatResponse(message, mentorStyle);
  }

  try {
    // Use mentor style prompt if provided, otherwise use the passed systemPrompt
    let basePrompt = mentorStyle ? MENTOR_STYLE_PROMPTS[mentorStyle] : systemPrompt;
    
    console.log(`📝 Using mentor style: ${mentorStyle || 'default'}`);
    console.log(`📝 Prompt preview: ${basePrompt.substring(0, 100)}...`);
    
    // Build enhanced system prompt with identity context
    let enhancedPrompt = basePrompt;
    if (identityContext) {
      enhancedPrompt += `\n\n=== USER'S COMPLETE IDENTITY PROFILE ===\n${identityContext}\n=== END IDENTITY PROFILE ===\n\n`;
      enhancedPrompt += `Use this profile to personalize your responses. Reference their specific nodes by name.`;
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
      max_tokens: 1000,
      temperature: 0.5, // Lower temperature for more consistent adherence to prompt
    });

    const response = completion.choices[0]?.message?.content || mockChatResponse(message, mentorStyle);
    console.log(`✅ AI Response preview: ${response.substring(0, 100)}...`);
    return response;
  } catch (error) {
    console.error('OpenAI chat error:', error);
    return mockChatResponse(message, mentorStyle);
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
function mockChatResponse(message: string, mentorStyle?: AIMentorStyle): string {
  const lower = message.toLowerCase();
  const style = mentorStyle || 'ruthless';
  
  // Ruthless Mentor responses
  if (style === 'ruthless') {
    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
      return "Skip the pleasantries. What are you here to fix? What pattern is holding you back right now? Name it.";
    }
    if (lower.includes('stuck') || lower.includes('help')) {
      return "Stuck is a story you're telling yourself. What's the actual obstacle? Name one action you could take in the next 5 minutes. No excuses.";
    }
    if (lower.includes('goal') || lower.includes('want to')) {
      return "Wanting means nothing. Doing means everything. What have you actually DONE toward this goal in the last 24 hours? If the answer is nothing, that's your real priority showing.";
    }
    return "Cut the noise. What's the ONE thing you're avoiding right now that you know you should be doing? Say it out loud.";
  }
  
  // Strategic Architect responses
  if (style === 'architect') {
    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
      return "Let's build. What system are we designing today? Define your objective, constraints, and success metrics.";
    }
    if (lower.includes('stuck') || lower.includes('help')) {
      return "Stuck indicates a missing system. Let's map it: 1) What's the desired output? 2) What inputs do you control? 3) What process connects them? Start there.";
    }
    if (lower.includes('goal') || lower.includes('want to')) {
      return "Goals without systems are wishes. Let's convert this: What's the daily/weekly behavior that, if repeated, makes this goal inevitable? Define the trigger, action, and feedback loop.";
    }
    return "Let's systematize this. What's the repeatable process you need? We'll define inputs, outputs, and decision rules.";
  }
  
  // Psychological Mirror responses
  if (style === 'mirror') {
    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
      return "You're here. That itself is data. What brought you to this moment? What are you hoping to see reflected back?";
    }
    if (lower.includes('stuck') || lower.includes('help')) {
      return "You say you're stuck. Notice: is this a familiar feeling? How many times have you been here before? What does 'stuck' protect you from having to face?";
    }
    if (lower.includes('goal') || lower.includes('want to')) {
      return "You say you want this. But observe your behavior over the last week. Does your behavior agree with your stated desire? What does the gap reveal?";
    }
    return "Observe what you just said. Now observe how you feel saying it. What pattern is emerging? I'm reflecting, not judging.";
  }
  
  // Supportive Coach responses
  if (style === 'coach') {
    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
      return "Hey, glad you're here. How are you really doing today? What's been on your mind? I'm here to help you work through it.";
    }
    if (lower.includes('stuck') || lower.includes('help')) {
      return "Being stuck is frustrating, but it's also a sign you care about getting this right. What feels like the biggest barrier right now? Let's tackle it together, one step at a time.";
    }
    if (lower.includes('goal') || lower.includes('want to')) {
      return "That's a meaningful goal. I can hear it matters to you. What's one small step you could take today that would feel like progress? Even tiny momentum counts.";
    }
    return "Thanks for sharing that. What would feel like a win for you right now? Let's find a path forward that works for where you are today.";
  }
  
  return "I hear you. What patterns do you notice? Every insight is data for your identity map.";
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

