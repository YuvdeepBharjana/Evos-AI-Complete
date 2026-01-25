/**
 * Premarket Calibration Page
 * 
 * Simple interface for premarket plan calibration using AI.
 */

import { useState } from 'react';
import { coachPremarketAnalysis, type PremarketCoachResponse } from '../lib/api';
import { buildTraderContext } from '../lib/traderContext';
import { useRequireAuth } from '../hooks/useRequireAuth';

export function PremarketCalibrationPage() {
  // ============================================
  // INPUT STATE
  // ============================================
  const [userInput, setUserInput] = useState('');
  const [aiResponse, setAiResponse] = useState<PremarketCoachResponse | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use shared auth guard hook
  const { isAuthed, isVerifying, isBlocked } = useRequireAuth();

  // ============================================
  // HANDLE SUBMIT
  // ============================================
  const handleSubmit = async () => {
    if (!userInput.trim()) {
      setError('Please enter your market plan');
      return;
    }

    // 3-state gate authentication check
    if (isBlocked) {
      setError('Please log in to use premarket calibration. This feature requires authentication.');
      return;
    }

    if (isVerifying) {
      setError('Verifying session… try again in a moment.');
      return;
    }

    // isAuthed → proceed

    setIsLoading(true);
    setError(null);

    try {
      // Build trader context for enhanced analysis
      const traderContext = buildTraderContext();
      
      // Enhance user input with trader context if available
      let enhancedInput = userInput;
      if (traderContext.strategySummary && traderContext.strategySummary !== 'No strategy configured yet') {
        enhancedInput = `${userInput}\n\n--- My Trading Strategy Context ---\n${traderContext.strategySummary}\n\nEdge Readiness: ${traderContext.edgeReadiness}%`;
      }

      // Call the premarket coach API
      const result = await coachPremarketAnalysis({
        userAnalysis: enhancedInput,
        context: {
          session: 'premarket',
          date: new Date().toISOString().split('T')[0],
        },
      });

      setAiResponse(result);
      setIsSubmitted(true);
    } catch (err: any) {
      console.error('Premarket calibration error:', err);
      
      // Provide more specific error messages
      let errorMessage = err.message || 'Failed to calibrate plan. Please try again.';
      
      if (err.message?.includes('404') || err.message?.includes('Not Found')) {
        errorMessage = 'API endpoint not found. Please check if the server is running and the route is configured correctly.';
      } else if (err.message?.includes('401') || err.message?.includes('Unauthorized') || err.message?.includes('token')) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
        errorMessage = 'Cannot connect to server. Please check your connection and ensure the backend is running.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // HANDLE EDIT PLAN
  // ============================================
  const handleEditPlan = () => {
    setAiResponse(null);
    setIsSubmitted(false);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#030014] text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* ============================================ */}
        {/* HEADER */}
        {/* ============================================ */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Pre-Market Calibration</h1>
          <p className="text-gray-400 text-lg">
            Lock your bias, risk plan, and discipline before the session.
          </p>
        </div>

        {/* ============================================ */}
        {/* TEXT INPUT UI */}
        {/* ============================================ */}
        {!isSubmitted && (
          <div className="mb-8">
            <label className="block text-sm font-medium mb-2">
              Describe today's market plan
            </label>
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              rows={12}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-y"
              placeholder="What is your bias, key levels, risk plan, and invalidation today?"
            />
          </div>
        )}

        {/* ============================================ */}
        {/* ERROR MESSAGE */}
        {/* ============================================ */}
        {error && (
          <div className={`mb-4 p-4 rounded-lg ${
            isVerifying
              ? 'bg-blue-500/20 border border-blue-500/50' 
              : 'bg-red-500/20 border border-red-500/50'
          }`}>
            <p className={`text-sm ${
              isVerifying ? 'text-blue-300' : 'text-red-300'
            }`}>{error}</p>
          </div>
        )}

        {/* ============================================ */}
        {/* SUBMIT BUTTON */}
        {/* ============================================ */}
        {!isSubmitted && (
          <button
            onClick={handleSubmit}
            disabled={isLoading || isVerifying || !isAuthed}
            className="w-full px-6 py-3 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isVerifying ? 'Verifying…' : isLoading ? 'Calibrating...' : 'Calibrate'}
          </button>
        )}

        {/* ============================================ */}
        {/* OUTPUT UI */}
        {/* ============================================ */}
        {aiResponse && (
          <div className="mt-8 backdrop-blur-xl bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-2 border-white/10 rounded-2xl p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-4">Evos Calibration Feedback</h2>
            
            {/* Refined Analysis */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-indigo-300 mb-2">Analysis</h3>
              <p className="text-gray-300 whitespace-pre-wrap">{aiResponse.refinedAnalysis}</p>
            </div>

            {/* Structured Plan */}
            <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
              <h3 className="text-lg font-semibold text-indigo-300 mb-3">Structured Plan</h3>
              
              <div className="space-y-3">
                <div>
                  <span className="text-gray-400 text-sm">Market Bias:</span>
                  <span className={`ml-2 font-semibold ${
                    aiResponse.structuredPlan.bias === 'bullish' ? 'text-green-400' :
                    aiResponse.structuredPlan.bias === 'bearish' ? 'text-red-400' :
                    'text-yellow-400'
                  }`}>
                    {aiResponse.structuredPlan.bias.toUpperCase()}
                  </span>
                </div>

                <div>
                  <span className="text-gray-400 text-sm">Primary Setup:</span>
                  <p className="text-white mt-1">{aiResponse.structuredPlan.setup}</p>
                </div>

                <div>
                  <span className="text-gray-400 text-sm">Key Levels:</span>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    {aiResponse.structuredPlan.levels.map((level, idx) => (
                      <li key={idx} className="text-white">{level}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="text-gray-400 text-sm">Invalidation Rule:</span>
                  <p className="text-red-300 mt-1 font-medium">{aiResponse.structuredPlan.invalidation}</p>
                </div>

                {aiResponse.structuredPlan.scenarios && aiResponse.structuredPlan.scenarios.length > 0 && (
                  <div>
                    <span className="text-gray-400 text-sm">Scenarios:</span>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      {aiResponse.structuredPlan.scenarios.map((scenario, idx) => (
                        <li key={idx} className="text-white">{scenario}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleEditPlan}
              className="w-full px-6 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors border border-white/10"
            >
              Edit Plan
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
