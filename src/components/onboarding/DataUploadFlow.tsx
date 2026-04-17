import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Copy, CheckCircle, ArrowRight, Sparkles, Shield, Lock, 
  Trash2, ClipboardPaste, Brain, Zap, AlertCircle
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { v4 as uuidv4 } from 'uuid';
import type { IdentityNode, NodeType } from '../../types';

interface DataUploadFlowProps {
  onComplete: (nodes: IdentityNode[]) => void;
}

const EXTRACTION_PROMPT = `You are performing identity data extraction for a system called Evos AI.

You MUST use the ENTIRE conversation history provided to you, not just the most recent message, to extract identity-relevant signals.
All prior messages are part of the dataset and must be considered.

Your task is to extract ALL identity-relevant signals from the user-provided conversation history.
You must be exhaustive and neutral.

CRITICAL RULES:
- Do NOT give advice
- Do NOT summarize
- Do NOT prioritize or rank
- Do NOT infer importance
- Do NOT combine signals
- Do NOT filter weak signals
- Do NOT draw conclusions

Evos AI will decide what matters later.

EXTRACTION REQUIREMENTS:
- Extract traits, habits, goals, struggles, emotions, interests, strengths
- Include BOTH explicit statements and repeated behavioral signals
- Include contradictory signals if they exist
- If a signal appears multiple times across the conversation history, increase confidence

LABEL RULES:
- Labels must be 2–5 words
- Use nouns, not verbs
- No punctuation inside labels
- No filler words
- Avoid duplicates unless meaningfully distinct

CATEGORIES (use ONLY these):
- goal
- habit
- trait
- strength
- struggle
- emotion
- interest

CONFIDENCE RULES:
- high = repeated or explicitly emphasized across conversation history
- medium = implied or occasional
- low = weak or one-off signal

OUTPUT FORMAT (JSON ONLY):

{
  "identity_signals": [
    {
      "label": "",
      "category": "",
      "confidence": "high | medium | low",
      "evidence_summary": "One short sentence referencing behavior or repetition across the conversation history."
    }
  ]
}

Do not explain your reasoning.
Do not add extra fields.
Do not return empty arrays.
Do not format as markdown.

TEXT TO ANALYZE:
[PASTE CONTENT HERE]`;

export const DataUploadFlow = ({ onComplete }: DataUploadFlowProps) => {
  const [step, setStep] = useState<'copy' | 'paste' | 'processing' | 'success' | 'error'>('copy');
  const [copied, setCopied] = useState(false);
  const [pastedContent, setPastedContent] = useState('');
  const [extractedNodes, setExtractedNodes] = useState<IdentityNode[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(EXTRACTION_PROMPT);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback for browsers without clipboard API
      const textarea = document.createElement('textarea');
      textarea.value = EXTRACTION_PROMPT;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  // Strip markdown formatting from labels
  const cleanLabel = (label: string): string => {
    return label
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/__/g, '')
      .replace(/_/g, '')
      .trim();
  };

  // Generate a short, clean title (2-5 words) from a longer description
  const generateShortTitle = (description: string): string => {
    // Clean first
    let cleaned = cleanLabel(description);
    
    // Remove common prefixes
    cleaned = cleaned
      .replace(/^(I want to |I need to |I'm trying to |Working on |Planning to |Build |Create |Develop |Become |Achieve |Improve |Learn |Master |Get |Make |Start |Stop |Maintain |Focus on )/i, '')
      .replace(/^(My goal is to |The goal is to |Goal: |Action: |Trigger: |Fear: |Coping: |Discipline: )/i, '')
      .trim();
    
    // Split into words
    const words = cleaned.split(/\s+/);
    
    // If already short enough (2-5 words), use as is
    if (words.length <= 5) {
      return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    }
    
    // Extract key words - nouns and verbs typically at the start
    // Take first 3-4 meaningful words
    const stopWords = new Set(['a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'that', 'which', 'who', 'whom', 'this', 'these', 'those', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'need', 'more', 'most', 'very', 'just', 'only', 'also', 'even', 'through', 'because', 'so', 'if', 'when', 'where', 'how', 'what', 'why', 'all', 'each', 'every', 'both', 'few', 'some', 'any', 'no', 'not', 'own', 'same', 'than', 'too', 'into', 'over', 'after', 'before', 'between', 'under', 'again', 'then', 'once', 'here', 'there', 'about', 'up', 'out', 'down', 'off', 'such', 'other', 'its', 'my', 'your', 'his', 'her', 'their', 'our']);
    
    const meaningfulWords = words.filter(w => !stopWords.has(w.toLowerCase()) && w.length > 1);
    
    // Take first 3-4 meaningful words
    const titleWords = meaningfulWords.slice(0, 4);
    
    if (titleWords.length === 0) {
      // Fallback: just take first 4 words
      return words.slice(0, 4).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    }
    
    // Capitalize each word
    return titleWords.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  };

  const parseIdentityExtraction = (content: string): IdentityNode[] => {
    const nodes: IdentityNode[] = [];
    
    try {
      // Try to extract JSON from markdown code blocks first
      let jsonString = content;
      
      // Extract JSON from markdown code blocks
      const codeBlockMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      if (codeBlockMatch && codeBlockMatch[1]) {
        jsonString = codeBlockMatch[1];
      } else {
        // Try to find JSON object directly
        const jsonMatch = content.match(/\{[\s\S]*"identity_signals"[\s\S]*\}/);
        if (jsonMatch && jsonMatch[0]) {
          jsonString = jsonMatch[0];
        }
      }

      // Parse JSON
      const data = JSON.parse(jsonString);
      
      if (!data.identity_signals || !Array.isArray(data.identity_signals)) {
        throw new Error('Invalid JSON format: missing identity_signals array');
      }

      // Map category to NodeType (strength category maps to trait)
      const categoryMap: Record<string, NodeType> = {
        'goal': 'goal',
        'habit': 'habit',
        'trait': 'trait',
        'strength': 'trait', // Map strength to trait type
        'struggle': 'struggle',
        'emotion': 'emotion',
        'interest': 'interest',
      };

      // Map confidence to strength value
      const confidenceMap: Record<string, number> = {
        'high': 80,
        'medium': 60,
        'low': 40,
      };

      // Process each signal
      for (const signal of data.identity_signals) {
        if (!signal.label || !signal.category) continue;

        const nodeType = categoryMap[signal.category.toLowerCase()];
        if (!nodeType) {
          console.warn(`Unknown category: ${signal.category}, skipping`);
          continue;
        }

        // Determine strength from confidence
        const confidence = signal.confidence?.toLowerCase() || 'medium';
        const baseStrength = confidenceMap[confidence] || 60;
        
        // Add small variation (±5) to avoid identical strengths
        const strength = Math.max(0, Math.min(100, baseStrength + Math.round(Math.random() * 10 - 5)));

        // Determine status based on strength
        let status: 'mastered' | 'active' | 'developing' | 'neglected' = 'active';
        if (strength >= 80) {
          status = 'mastered';
        } else if (strength >= 60) {
          status = 'active';
        } else if (strength >= 40) {
          status = 'developing';
        } else {
          status = 'neglected';
        }

        nodes.push({
          id: uuidv4(),
          type: nodeType,
          label: cleanLabel(signal.label),
          description: signal.evidence_summary || '',
          strength,
          status,
          connections: [],
          lastUpdated: new Date(),
          createdAt: new Date()
        });
      }
    } catch (error) {
      console.error('Failed to parse JSON extraction:', error);
      // Fallback: try to parse as old format for backward compatibility
      return parseLegacyFormat(content);
    }

    return nodes;
  };

  // Fallback parser for old markdown format (backward compatibility)
  const parseLegacyFormat = (content: string): IdentityNode[] => {
    const nodes: IdentityNode[] = [];
    
    // Map sections to node types (strength is 0-100)
    const sectionMap: Record<string, { type: NodeType; strength: number }> = {
      'CORE IDENTITY TRAITS': { type: 'trait', strength: 80 },
      'STRENGTHS': { type: 'trait', strength: 85 },
      'WEAKNESSES': { type: 'struggle', strength: 45 },
      'GOALS': { type: 'goal', strength: 70 },
      'STRUGGLES': { type: 'struggle', strength: 40 },
      'INTERESTS': { type: 'interest', strength: 75 },
    };

    // Extract content between markers if present
    const startMarker = '---BEGIN IDENTITY PROFILE---';
    const endMarker = '---END IDENTITY PROFILE---';
    let extractContent = content;
    
    if (content.includes(startMarker) && content.includes(endMarker)) {
      const startIdx = content.indexOf(startMarker) + startMarker.length;
      const endIdx = content.indexOf(endMarker);
      extractContent = content.substring(startIdx, endIdx);
    }

    // Also try alternate markers
    const altStartMarker = '---BEGIN IDENTITY EXTRACTION---';
    const altEndMarker = '---END IDENTITY EXTRACTION---';
    if (content.includes(altStartMarker) && content.includes(altEndMarker)) {
      const startIdx = content.indexOf(altStartMarker) + altStartMarker.length;
      const endIdx = content.indexOf(altEndMarker);
      extractContent = content.substring(startIdx, endIdx);
    }

    // Parse list-based sections
    for (const [section, config] of Object.entries(sectionMap)) {
      const sectionRegex = new RegExp(`${section}:?\\s*([\\s\\S]*?)(?=(?:SELF-PERCEPTION|CORE IDENTITY|EMOTIONAL FRAMEWORK|BEHAVIOR PATTERNS|COGNITIVE STYLE|STRENGTHS|WEAKNESSES|GOALS|STRUGGLES|INTERESTS|IDENTITY TRAJECTORY|IF OPTIMIZED|ACTION CODE|---END|$))`, 'i');
      const match = extractContent.match(sectionRegex);
      
      if (match && match[1]) {
        const items = match[1]
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.startsWith('-') || line.startsWith('•') || line.startsWith('*') || /^\d+\./.test(line))
          .map(line => line.replace(/^[-•*]\s*/, '').replace(/^\d+\.\s*/, '').trim())
          .filter(item => item.length > 2 && !item.toLowerCase().includes('none identified') && !item.toLowerCase().includes('n/a'));

        for (const item of items) {
          if (item.length < 3 || item.length > 150) continue;
          
          nodes.push({
            id: uuidv4(),
            type: config.type,
            label: generateShortTitle(item),
            description: cleanLabel(item),
            strength: Math.round(config.strength + (Math.random() * 20 - 10)),
            status: 'active',
            connections: [],
            lastUpdated: new Date(),
            createdAt: new Date()
          });
        }
      }
    }

    // Extract emotional patterns from EMOTIONAL FRAMEWORK
    const emotionalMatch = extractContent.match(/EMOTIONAL FRAMEWORK:?\s*([\s\S]*?)(?=(?:BEHAVIOR PATTERNS|COGNITIVE STYLE|STRENGTHS|---END|$))/i);
    if (emotionalMatch && emotionalMatch[1]) {
      const emotionalContent = emotionalMatch[1];
      
      // Extract triggers
      const triggersMatch = emotionalContent.match(/Triggers?:?\s*([^\n]+)/i);
      if (triggersMatch && triggersMatch[1] && triggersMatch[1].length > 3) {
        const triggerText = triggersMatch[1].trim();
        nodes.push({
          id: uuidv4(),
          type: 'emotion',
          label: generateShortTitle(triggerText),
          description: `Emotional trigger: ${cleanLabel(triggerText)}`,
          strength: 65,
          status: 'active',
          connections: [],
          lastUpdated: new Date(),
          createdAt: new Date()
        });
      }
      
      // Extract fears
      const fearsMatch = emotionalContent.match(/Fear drivers?:?\s*([^\n]+)/i);
      if (fearsMatch && fearsMatch[1] && fearsMatch[1].length > 3) {
        const fearText = fearsMatch[1].trim();
        nodes.push({
          id: uuidv4(),
          type: 'emotion',
          label: generateShortTitle(fearText),
          description: `Fear driver: ${cleanLabel(fearText)}`,
          strength: 55,
          status: 'active',
          connections: [],
          lastUpdated: new Date(),
          createdAt: new Date()
        });
      }
      
      // Extract coping mechanisms
      const copingMatch = emotionalContent.match(/Coping mechanisms?:?\s*([^\n]+)/i);
      if (copingMatch && copingMatch[1] && copingMatch[1].length > 3) {
        const copingText = copingMatch[1].trim();
        nodes.push({
          id: uuidv4(),
          type: 'habit',
          label: generateShortTitle(copingText),
          description: `Coping mechanism: ${cleanLabel(copingText)}`,
          strength: 50,
          status: 'active',
          connections: [],
          lastUpdated: new Date(),
          createdAt: new Date()
        });
      }
    }

    // Extract habits from BEHAVIOR PATTERNS
    const behaviorMatch = extractContent.match(/BEHAVIOR PATTERNS:?\s*([\s\S]*?)(?=(?:COGNITIVE STYLE|STRENGTHS|---END|$))/i);
    if (behaviorMatch && behaviorMatch[1]) {
      const behaviorContent = behaviorMatch[1];
      
      const habitsMatch = behaviorContent.match(/Habits?:?\s*([^\n]+)/i);
      if (habitsMatch && habitsMatch[1] && habitsMatch[1].length > 3) {
        const habits = habitsMatch[1].split(/[,;]/).map(h => h.trim()).filter(h => h.length > 2);
        for (const habit of habits) {
          nodes.push({
            id: uuidv4(),
            type: 'habit',
            label: generateShortTitle(habit),
            description: cleanLabel(habit),
            strength: 60,
            status: 'active',
            connections: [],
            lastUpdated: new Date(),
            createdAt: new Date()
          });
        }
      }
      
      const disciplineMatch = behaviorContent.match(/Discipline:?\s*([^\n]+)/i);
      if (disciplineMatch && disciplineMatch[1] && disciplineMatch[1].length > 3) {
        const disciplineText = disciplineMatch[1].trim();
        nodes.push({
          id: uuidv4(),
          type: 'trait',
          label: 'Self-Discipline',
          description: `Discipline level: ${cleanLabel(disciplineText)}`,
          strength: 70,
          status: 'active',
          connections: [],
          lastUpdated: new Date(),
          createdAt: new Date()
        });
      }
    }

    // Extract ACTION CODE items as goals/habits
    const actionMatch = extractContent.match(/ACTION CODE:?\s*([\s\S]*?)(?=---END|$)/i);
    if (actionMatch && actionMatch[1]) {
      const actions = actionMatch[1]
        .split('\n')
        .map(line => line.trim())
        .filter(line => /^\d+\./.test(line) || line.startsWith('-'))
        .map(line => line.replace(/^\d+\.\s*/, '').replace(/^-\s*/, '').trim())
        .filter(item => item.length > 3);

      for (const action of actions.slice(0, 5)) { // Limit to 5 action items
        nodes.push({
          id: uuidv4(),
          type: 'goal',
          label: generateShortTitle(action),
          description: `Action: ${cleanLabel(action)}`,
          strength: 75,
          status: 'active',
          connections: [],
          lastUpdated: new Date(),
          createdAt: new Date()
        });
      }
    }

    return nodes;
  };

  const handleProcessContent = () => {
    if (!pastedContent.trim()) {
      setErrorMessage('Please paste the AI response first.');
      return;
    }

    setStep('processing');
    setErrorMessage('');

    // Simulate processing for better UX
    setTimeout(() => {
      try {
        const nodes = parseIdentityExtraction(pastedContent);
        
        if (nodes.length === 0) {
          setErrorMessage('Could not extract any identity patterns. Make sure you copied the complete AI response.');
          setStep('error');
          return;
        }

        if (nodes.length < 3) {
          setErrorMessage('Only found a few patterns. Try asking the AI to be more thorough.');
          setStep('error');
          return;
        }

        setExtractedNodes(nodes);
        setStep('success');
      } catch (error) {
        console.error('Parse error:', error);
        setErrorMessage('Failed to parse the response. Please check the format and try again.');
        setStep('error');
      }
    }, 2000);
  };

  const handleComplete = () => {
    onComplete(extractedNodes);
  };

  const handleRetry = () => {
    setStep('paste');
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#030014] relative">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:100px_100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-cyan-500/10 via-transparent to-transparent blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full relative"
      >
        {/* Data Safety Banner - TRADER COPY */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20"
        >
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-green-400 font-medium mb-1">Your trading data stays private</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-gray-400 text-xs">
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Processed locally
                </span>
                <span className="flex items-center gap-1">
                  <Trash2 className="w-3 h-3" /> Delete anytime
                </span>
                <span>Never used for AI training</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Header - TRADER COPY */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-500/20 mb-4">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-gray-300">Deep analysis — 2 minutes</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-4">
            Trading Profile Extraction
          </h1>
          <p className="text-gray-400">
            Let your AI expose your trading patterns — the good, the bad, and the blind spots
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[
            { key: 'copy', label: 'Copy Prompt' },
            { key: 'paste', label: 'Paste Response' },
            { key: 'success', label: 'Done' }
          ].map((s, i) => {
            const isActive = ['copy', 'paste', 'processing', 'error'].includes(step) ? 
              (s.key === 'copy' && step === 'copy') || 
              (s.key === 'paste' && ['paste', 'processing', 'error'].includes(step)) ||
              (s.key === 'success' && step === 'success') : false;
            const isComplete = 
              (s.key === 'copy' && ['paste', 'processing', 'success', 'error'].includes(step)) ||
              (s.key === 'paste' && step === 'success');
            
            return (
              <div key={s.key} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  isComplete ? 'bg-green-500 text-white' :
                  isActive ? 'bg-indigo-500 text-white' :
                  'bg-white/10 text-gray-500'
                }`}>
                  {isComplete ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-sm ${isActive || isComplete ? 'text-white' : 'text-gray-500'}`}>
                  {s.label}
                </span>
                {i < 2 && <div className="w-8 h-px bg-white/10" />}
              </div>
            );
          })}
        </div>

        <Card>
          <AnimatePresence mode="wait">
            {step === 'copy' && (
              <motion.div
                key="copy"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 mb-4">
                    <Copy className="w-8 h-8 text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Step 1: Copy this prompt</h3>
                  <p className="text-gray-400 text-sm">
                    Paste it into ChatGPT, Claude, or any AI you've been using
                  </p>
                </div>

                <div className="relative">
                  <div className="bg-gray-900/50 border border-white/10 rounded-xl p-4 font-mono text-sm text-gray-300 max-h-48 overflow-y-auto">
                    <pre className="whitespace-pre-wrap">{EXTRACTION_PROMPT.slice(0, 300)}...</pre>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-gray-900 to-transparent pointer-events-none rounded-b-xl" />
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={handleCopyPrompt} 
                    className="flex-1"
                    variant={copied ? 'secondary' : 'primary'}
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Prompt
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={() => setStep('paste')} 
                    variant="secondary"
                    className="flex items-center gap-2"
                  >
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>

                {/* TRADER COPY: Pro tip */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-sm text-gray-400">
                    <span className="text-white font-medium">💡 Pro tip:</span> Use the AI you've been most honest with about your trading. 
                    It's seen your wins, losses, excuses, and real patterns. Let it expose you.
                  </p>
                </div>
              </motion.div>
            )}

            {step === 'paste' && (
              <motion.div
                key="paste"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-green-500/20 border border-cyan-500/30 mb-4">
                    <ClipboardPaste className="w-8 h-8 text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Step 2: Paste the AI's response</h3>
                  <p className="text-gray-400 text-sm">
                    Copy the entire response from your AI and paste it below
                  </p>
                </div>

                <div className="relative">
                  <textarea
                    value={pastedContent}
                    onChange={(e) => setPastedContent(e.target.value)}
                    placeholder="Paste the AI's response here...

Example:
---BEGIN IDENTITY EXTRACTION---

GOALS:
- Build a successful startup
- Become financially independent
- ..."
                    className="w-full h-64 bg-gray-900/50 border border-white/10 rounded-xl p-4 text-gray-300 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none font-mono text-sm"
                  />
                  {pastedContent.length > 0 && (
                    <div className="absolute bottom-3 right-3 text-xs text-gray-500">
                      {pastedContent.length} characters
                    </div>
                  )}
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {errorMessage}
                  </div>
                )}

                <div className="flex gap-3">
                  <Button 
                    onClick={() => setStep('copy')} 
                    variant="ghost"
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={handleProcessContent}
                    className="flex-1"
                    disabled={!pastedContent.trim()}
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    Extract Identity
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 'processing' && (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 180, 360]
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="inline-block mb-6"
                >
                  <Brain size={56} className="text-indigo-400" />
                </motion.div>
                <p className="text-xl mb-2 text-white">Building your identity profile...</p>
                <p className="text-gray-500 mb-8">Extracting traits, patterns, and blind spots</p>
                <div className="space-y-3 text-left max-w-md mx-auto">
                  {[
                    'Parsing identity data...',
                    'Mapping strengths & weaknesses...',
                    'Extracting behavioral patterns...',
                    'Building action framework...',
                  ].map((step, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.5 }}
                      className="flex items-center gap-3 text-gray-400"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.5 + 0.3 }}
                      >
                        <CheckCircle size={18} className="text-green-500" />
                      </motion.div>
                      {step}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', bounce: 0.5 }}
                >
                  <CheckCircle size={64} className="mx-auto mb-4 text-green-500" />
                </motion.div>
                {/* TRADER COPY: Success message */}
                <h3 className="text-2xl font-bold mb-2 text-white">Trading Profile Created!</h3>
                <p className="text-gray-400 mb-6">
                  Extracted {extractedNodes.length} behavioral patterns
                </p>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8 max-w-lg mx-auto">
                  {Object.entries(
                    extractedNodes.reduce((acc, node) => {
                      acc[node.type] = (acc[node.type] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([type, count]) => (
                    <motion.div 
                      key={type} 
                      className="bg-white/5 border border-white/10 rounded-xl p-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="text-2xl font-bold text-white">{count}</div>
                      <div className="text-sm text-gray-400 capitalize">{type}s</div>
                    </motion.div>
                  ))}
                </div>

                {/* TRADER COPY: CTA button */}
                <Button onClick={handleComplete} size="lg">
                  <Sparkles className="w-4 h-4 mr-2" />
                  View Your Trading Profile
                </Button>
              </motion.div>
            )}

            {step === 'error' && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <AlertCircle size={64} className="mx-auto mb-4 text-red-500" />
                <h3 className="text-2xl font-bold mb-2 text-white">Extraction Failed</h3>
                <p className="text-gray-400 mb-2">{errorMessage}</p>
                <p className="text-gray-500 text-sm mb-6">
                  Make sure the AI followed the format correctly.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={handleRetry} variant="secondary">
                    Try Again
                  </Button>
                  <Button onClick={() => setStep('copy')} variant="ghost">
                    Get New Prompt
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* Supported AIs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-center"
        >
          <p className="text-xs text-gray-500 mb-3">Works with any AI that has your conversation history</p>
          <div className="flex items-center justify-center gap-6 text-gray-400">
            <span className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              ChatGPT
            </span>
            <span className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              Claude
            </span>
            <span className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Gemini
            </span>
            <span className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              Any AI
            </span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
