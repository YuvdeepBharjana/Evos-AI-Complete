/**
 * Post-Market Review Page
 * 
 * Simple interface for post-market review using AI prompt builder.
 */

import { useState } from 'react';
import { buildAIPrompt } from '../lib/aiPromptBuilder';
import { buildTraderContext } from '../lib/traderContext';
import { getTodayDateKey } from '../lib/dateKey';

export function PostMarketReviewPage() {
  // ============================================
  // INPUT STATE
  // ============================================
  const [userInput, setUserInput] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [disciplineResult, setDisciplineResult] = useState<{
    status: 'green' | 'red';
    message: string;
  } | null>(null);

  // ============================================
  // HANDLE SUBMIT
  // ============================================
  const handleSubmit = () => {
    // 1) Import and call buildTraderContext()
    const traderContext = buildTraderContext();

    // 2) Import and call buildAIPrompt()
    const promptResult = buildAIPrompt({
      mode: 'postmarket',
      strategySummary: traderContext.strategySummary,
      edgeReadiness: traderContext.edgeReadiness,
      userMessage: userInput,
    });

    // 3) console.log returned prompts
    console.log('=== Post-Market Review Prompt Results ===');
    console.log('System Prompt:', promptResult.systemPrompt);
    console.log('User Prompt:', promptResult.userPrompt);
    console.log('==========================================');

    // 4) Set aiResponse with MOCK placeholder text
    const mockResponse = `Evos Review Placeholder:
Session feedback will appear here once AI analysis is enabled.`;

    setAiResponse(mockResponse);
    setIsSubmitted(true);
  };

  // ============================================
  // HANDLE EDIT REVIEW
  // ============================================
  const handleEditReview = () => {
    setAiResponse(null);
    setIsSubmitted(false);
  };

  // ============================================
  // HANDLE FINALIZE
  // ============================================
  const handleFinalize = () => {
    // 1) Import and call buildTraderContext()
    const traderContext = buildTraderContext();

    // 2) Call buildAIPrompt with discipline_judge mode
    const promptResult = buildAIPrompt({
      mode: 'discipline_judge',
      strategySummary: traderContext.strategySummary,
      edgeReadiness: traderContext.edgeReadiness,
      userMessage: userInput,
    });

    // 3) console.log systemPrompt and userPrompt
    console.log('=== Discipline Judge Prompt Results ===');
    console.log('System Prompt:', promptResult.systemPrompt);
    console.log('User Prompt:', promptResult.userPrompt);
    console.log('==========================================');

    // 4) Set MOCK discipline verdict based on keywords
    const lowerInput = userInput.toLowerCase();
    const violationKeywords = ['broke', 'overtrade', 'revenge', 'ignored', 'late'];
    const hasViolation = violationKeywords.some(keyword => lowerInput.includes(keyword));

    let verdict: { status: 'green' | 'red'; message: string };
    
    if (hasViolation) {
      verdict = {
        status: 'red',
        message: 'FAILED DISCIPLINE ❌ — Rule violations detected.',
      };
    } else {
      verdict = {
        status: 'green',
        message: 'DISCIPLINED DAY ✅ — Rules respected.',
      };
    }

    setDisciplineResult(verdict);

    // Save verdict to localStorage
    const todayDate = getTodayDateKey();
    
    try {
      // Load existing discipline data
      const existingDataJson = localStorage.getItem('evos.dailyDiscipline');
      const existingData = existingDataJson ? JSON.parse(existingDataJson) : {};

      // Merge today's result (do NOT overwrite other days)
      const updatedData = {
        ...existingData,
        [todayDate]: {
          status: verdict.status,
          timestamp: new Date().toISOString(),
        },
      };

      localStorage.setItem('evos.dailyDiscipline', JSON.stringify(updatedData));
    } catch (error) {
      console.error('Failed to save discipline result to localStorage:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#030014] text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* ============================================ */}
        {/* HEADER */}
        {/* ============================================ */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Post-Market Review</h1>
          <p className="text-gray-400 text-lg">
            Review execution, discipline, and mistakes from today.
          </p>
        </div>

        {/* ============================================ */}
        {/* TEXT INPUT UI */}
        {/* ============================================ */}
        {!isSubmitted && (
          <div className="mb-8">
            <label className="block text-sm font-medium mb-2">
              Describe today's trading performance
            </label>
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              rows={12}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-y"
              placeholder="What trades did you take? Did you follow rules? Where did you break discipline?"
            />
          </div>
        )}

        {/* ============================================ */}
        {/* SUBMIT BUTTON */}
        {/* ============================================ */}
        {!isSubmitted && (
          <button
            onClick={handleSubmit}
            className="w-full px-6 py-3 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            Review Session
          </button>
        )}

        {/* ============================================ */}
        {/* OUTPUT UI */}
        {/* ============================================ */}
        {aiResponse && (
          <div className="mt-8 backdrop-blur-xl bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-2 border-white/10 rounded-2xl p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-4">Evos Post-Market Feedback</h2>
            
            <div className="mb-6">
              <p className="text-gray-300 whitespace-pre-wrap">{aiResponse}</p>
            </div>

            {!disciplineResult && (
              <button
                onClick={handleEditReview}
                className="w-full px-6 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors border border-white/10 mb-4"
              >
                Edit Review
              </button>
            )}

            {/* Finalize Button */}
            {!disciplineResult && (
              <button
                onClick={handleFinalize}
                className="w-full px-6 py-3 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                Finalize Trading Day
              </button>
            )}
          </div>
        )}

        {/* ============================================ */}
        {/* VERDICT UI */}
        {/* ============================================ */}
        {disciplineResult && (
          <div className={`mt-8 backdrop-blur-xl border-2 rounded-2xl p-6 shadow-xl ${
            disciplineResult.status === 'green'
              ? 'bg-gradient-to-br from-green-900/80 to-emerald-800/80 border-green-400/30'
              : 'bg-gradient-to-br from-red-900/80 to-rose-800/80 border-red-400/30'
          }`}>
            <h2 className="text-2xl font-bold text-white mb-4">Daily Discipline Verdict</h2>
            
            <div className="mb-6">
              <p className={`text-2xl font-bold text-center ${
                disciplineResult.status === 'green' ? 'text-green-300' : 'text-red-300'
              }`}>
                {disciplineResult.message}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
