/**
 * Premarket Calibration Page
 * 
 * The core discipline interface for traders.
 * Three actions. Three outcomes. Green, Red, or Neutral.
 * 
 * This page uses the TradingDay store as the single source of truth.
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useTradingDayStore } from '../../store/useTradingDayStore';
import { ChecklistItem } from './components/ChecklistItem';
import { RulesPromptModal } from './components/RulesPromptModal';
import { coachPremarketAnalysis, judgeDiscipline, type DisciplineJudgeResponse } from '../../lib/api';
import type { TradingDay } from '../../types/tradingDay';

export function PremarketPage() {
  // ============================================
  // STATE FROM TRADING DAY STORE
  // ============================================
  
  const {
    currentDay,
    history,
    initializeToday,
    completePreMarket,
    setPremarketPlan,
    completePostMarket,
    setRulesFollowed,
    closeDay,
    computeFinalStatus,
    isTradingUnlocked,
  } = useTradingDayStore();

  // ============================================
  // LOCAL UI STATE
  // ============================================
  
  // Controls the "Did you follow rules?" modal
  const [showRulesPrompt, setShowRulesPrompt] = useState(false);

  // Premarket Analysis Coach state
  const [userAnalysis, setUserAnalysis] = useState('');
  const [refinedAnalysis, setRefinedAnalysis] = useState<string | null>(null);
  const [structuredPlan, setStructuredPlan] = useState<TradingDay['preMarketStructuredPlan'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Discipline Judge state
  const [judgeLoading, setJudgeLoading] = useState(false);
  const [judgeResult, setJudgeResult] = useState<DisciplineJudgeResponse | null>(null);
  const [judgeError, setJudgeError] = useState<string | null>(null);

  // ============================================
  // INITIALIZE TODAY ON MOUNT
  // ============================================
  
  useEffect(() => {
    initializeToday();
  }, [initializeToday]);

  // ============================================
  // LOADING STATE
  // ============================================
  
  if (!currentDay) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center">
        <div className="text-white text-lg">Initializing today's checklist...</div>
      </div>
    );
  }

  // ============================================
  // COMPUTED VALUES
  // ============================================
  
  const isClosed = currentDay.isClosed;
  const finalStatus = currentDay.finalStatus;
  const previewStatus = !isClosed ? computeFinalStatus(currentDay) : null;

  // Format today's date
  const todayFormatted = new Date(currentDay.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // ============================================
  // ACTION HANDLERS
  // ============================================
  
  /**
   * Handle Pre-Market completion
   * Calls the TradingDay store action
   */
  const handleCompletePreMarket = () => {
    completePreMarket();
  };

  /**
   * Handle Post-Market completion
   * Calls the TradingDay store action
   * Safety: Only enabled if pre-market is done
   */
  const handleCompletePostMarket = () => {
    completePostMarket();
  };

  /**
   * Handle Close Day button click
   * Opens the rules prompt modal
   * Safety: Only enabled if post-market is done
   */
  const handleOpenCloseDay = () => {
    setShowRulesPrompt(true);
  };

  /**
   * Handle rules adherence selection
   * Sets rules followed, then closes the day, then calls Discipline Judge
   * 
   * @param value - true (followed), false (broke), null (no trades)
   */
  const handleRulesDecision = async (value: boolean | null) => {
    // Store the current day before closing (to get the closed day data)
    const dayToClose = currentDay;
    
    if (!dayToClose) {
      return;
    }

    // Set rules followed and close the day
    setRulesFollowed(value);
    closeDay();
    setShowRulesPrompt(false);

    // Create the closed day object (what it will be after closing)
    const closedDay: TradingDay = {
      ...dayToClose,
      rulesFollowed: value,
      finalStatus: null, // Will be computed by discipline engine
      isClosed: true,
      closedAt: new Date().toISOString(),
    };

    // Immediately call Discipline Judge with the closed day
    setJudgeLoading(true);
    setJudgeError(null);
    setJudgeResult(null);

    try {
      // Get the actual closed day from history (most recent)
      // Wait a moment for store to update
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Get the most recent closed day from history
      const closedDays = history.filter(day => day.isClosed);
      const mostRecentClosedDay = closedDays.length > 0 
        ? closedDays.sort((a, b) => (b.closedAt || '').localeCompare(a.closedAt || ''))[0]
        : closedDay;

      const result = await judgeDiscipline(mostRecentClosedDay);
      setJudgeResult(result);
    } catch (err: any) {
      console.error('Discipline judge error:', err);
      setJudgeError(err.message || 'Could not load discipline feedback');
    } finally {
      setJudgeLoading(false);
    }
  };

  /**
   * Handle Premarket Analysis Coach submission
   */
  const handleRefineAnalysis = async () => {
    if (!userAnalysis.trim()) {
      setError('Please enter your premarket analysis');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const today = new Date().toISOString().split('T')[0];
      const result = await coachPremarketAnalysis({
        userAnalysis: userAnalysis.trim(),
        context: {
          date: today,
          session: 'premarket'
        }
      });

      setRefinedAnalysis(result.refinedAnalysis);
      setStructuredPlan(result.structuredPlan);
    } catch (err: any) {
      console.error('Premarket coach error:', err);
      setError(err.message || 'Premarket analysis failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle committing the premarket plan
   * Locks the plan and marks premarket as completed
   */
  const handleCommitPlan = () => {
    if (!refinedAnalysis) {
      return;
    }

    // Save plan and structuredPlan to TradingDay store
    setPremarketPlan(refinedAnalysis, structuredPlan || undefined);
    
    // Clear error state on successful commit
    setError(null);
  };

  // Check if premarket is already completed
  const isPremarketCommitted = currentDay?.preMarketCompleted && currentDay?.preMarketPlan;
  
  // Check if trading is unlocked (discipline gate)
  const tradingUnlocked = isTradingUnlocked();
  
  // Load existing plan if already committed (on mount or when plan is set)
  useEffect(() => {
    if (isPremarketCommitted && currentDay?.preMarketPlan && !refinedAnalysis) {
      setRefinedAnalysis(currentDay.preMarketPlan);
      if (currentDay.preMarketStructuredPlan) {
        setStructuredPlan(currentDay.preMarketStructuredPlan);
      }
      setUserAnalysis(''); // Clear input since plan is locked
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDay?.preMarketPlan, currentDay?.preMarketStructuredPlan, isPremarketCommitted]);

  // ============================================
  // RENDER
  // ============================================
  
  return (
    <div className="min-h-screen bg-[#030014] text-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        
        {/* ========== HEADER ========== */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2">Daily Discipline Checklist</h1>
          <p className="text-gray-400">{todayFormatted}</p>
        </div>

        {/* ========== CLOSED DAY STATUS (IF CLOSED) ========== */}
        {isClosed && finalStatus && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 p-6 rounded-xl text-center"
            style={{
              backgroundColor: 
                finalStatus === 'green' ? 'rgba(34, 197, 94, 0.1)' :
                finalStatus === 'red' ? 'rgba(239, 68, 68, 0.1)' :
                'rgba(156, 163, 175, 0.1)',
              borderColor:
                finalStatus === 'green' ? 'rgba(34, 197, 94, 0.3)' :
                finalStatus === 'red' ? 'rgba(239, 68, 68, 0.3)' :
                'rgba(156, 163, 175, 0.3)',
              borderWidth: '1px',
            }}
          >
            <div className="flex items-center justify-center gap-3 mb-2">
              <div 
                className="text-4xl"
                style={{
                  color:
                    finalStatus === 'green' ? '#22c55e' :
                    finalStatus === 'red' ? '#ef4444' :
                    '#9ca3af',
                }}
              >
                {finalStatus === 'green' && '🟩'}
                {finalStatus === 'red' && '🟥'}
                {finalStatus === 'neutral' && '⚪'}
              </div>
              <h2 
                className="text-2xl font-bold uppercase tracking-wider"
                style={{
                  color:
                    finalStatus === 'green' ? '#22c55e' :
                    finalStatus === 'red' ? '#ef4444' :
                    '#9ca3af',
                }}
              >
                {finalStatus} Day
              </h2>
            </div>
            <p className="text-sm text-gray-400">
              Day closed and locked. Result is permanent.
            </p>
          </motion.div>
        )}

        {/* ========== TRADING LOCKED BANNER ========== */}
        {!tradingUnlocked && !isClosed && (
          <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-400/30 text-center">
            <p className="text-red-400 font-semibold">
              🔒 Trading Locked — Commit your premarket plan to unlock trading.
            </p>
          </div>
        )}

        {/* ========== LIVE STATUS PREVIEW (IF NOT CLOSED) ========== */}
        {!isClosed && previewStatus && (
          <div className="mb-8 p-4 rounded-lg bg-white/5 border border-white/10 text-center">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
              Current Status Preview
            </p>
            <p 
              className="text-lg font-bold uppercase"
              style={{
                color:
                  previewStatus === 'green' ? '#22c55e' :
                  previewStatus === 'red' ? '#ef4444' :
                  '#9ca3af',
              }}
            >
              {previewStatus}
            </p>
          </div>
        )}

        {/* ========== PREMARKET ANALYSIS COACH ========== */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Premarket Analysis Coach</h2>
          
          {/* Active Trading Plan Panel (when committed) */}
          {isPremarketCommitted && (currentDay.preMarketStructuredPlan || currentDay.preMarketPlan) ? (
            <ActiveTradingPlanPanel 
              structuredPlan={currentDay.preMarketStructuredPlan}
              preMarketPlan={currentDay.preMarketPlan}
              timestamp={currentDay.preMarketTimestamp}
            />
          ) : (
            /* Input/Refine UI (when not committed) */
            <div className="space-y-4">
              {/* Input Section */}
              <div>
                <textarea
                  value={userAnalysis}
                  onChange={(e) => {
                    setUserAnalysis(e.target.value);
                    setError(null);
                  }}
                  placeholder="Write your raw premarket analysis and market bias here..."
                  className="w-full min-h-[120px] p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-green-400/30 focus:ring-1 focus:ring-green-400/20 resize-y disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading || isPremarketCommitted}
                />
              </div>

              {/* Button */}
              <button
                onClick={handleRefineAnalysis}
                disabled={loading || !userAnalysis.trim() || isPremarketCommitted}
                className="w-full py-3 px-6 bg-gradient-to-r from-green-500 via-emerald-500 to-cyan-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  'Refine Analysis'
                )}
              </button>

              {/* Error State */}
              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-400/30 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Output Section */}
              {refinedAnalysis && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 rounded-xl bg-white/5 border border-white/10"
                >
                  <h3 className="text-lg font-semibold mb-3 text-green-400">Refined Analysis</h3>
                  <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {refinedAnalysis}
                  </div>
                  
                  {/* Commit Button */}
                  {!isPremarketCommitted && (
                    <button
                      onClick={handleCommitPlan}
                      className="mt-4 w-full py-3 px-6 bg-gradient-to-r from-green-600 via-emerald-600 to-cyan-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
                    >
                      Commit Premarket Plan
                    </button>
                  )}
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* ========== CHECKLIST ========== */}
        <div className="space-y-4">
          
          {/* ===== ACTION 1: PRE-MARKET ===== */}
          <ChecklistItem
            title="Pre-Market Analysis"
            description="Lock your rules and mindset before trading begins"
            isCompleted={currentDay.preMarketCompleted}
            isDisabled={isClosed}
            isLocked={isClosed}
            onAction={handleCompletePreMarket}
            actionLabel="Complete Pre-Market Analysis"
          />

          {/* ===== ACTION 2: POST-MARKET ===== */}
          <ChecklistItem
            title="Post-Market Review"
            description="Review what happened and reconcile behavior vs. plan"
            isCompleted={currentDay.postMarketCompleted}
            isDisabled={!currentDay.preMarketCompleted || isClosed || !tradingUnlocked}
            isLocked={isClosed}
            disabledReason={
              !tradingUnlocked && !isClosed
                ? 'Premarket plan not locked. Complete premarket calibration to trade.'
                : !currentDay.preMarketCompleted && !isClosed
                ? 'Complete Pre-Market first'
                : undefined
            }
            onAction={handleCompletePostMarket}
            actionLabel="Complete Post-Market Review"
          />

          {/* ===== ACTION 3: CLOSE DAY ===== */}
          <ChecklistItem
            title="Discipline Tracker (Close Day)"
            description="Evaluate rule adherence and lock today's result"
            isCompleted={isClosed}
            isDisabled={!currentDay.postMarketCompleted || isClosed || !tradingUnlocked}
            isLocked={isClosed}
            disabledReason={
              !tradingUnlocked && !isClosed
                ? 'Premarket plan not locked. Complete premarket calibration to trade.'
                : !currentDay.postMarketCompleted && !isClosed
                ? 'Complete Post-Market first'
                : undefined
            }
            onAction={handleOpenCloseDay}
            actionLabel="Close Day & Lock Discipline Result"
          />
        </div>

        {/* ========== RULES PROMPT MODAL ========== */}
        <RulesPromptModal
          isOpen={showRulesPrompt}
          onClose={() => setShowRulesPrompt(false)}
          onDecision={handleRulesDecision}
        />
      </div>
    </div>
  );
}

// ============================================
// ACTIVE TRADING PLAN PANEL COMPONENT
// ============================================

interface ActiveTradingPlanPanelProps {
  structuredPlan?: TradingDay['preMarketStructuredPlan'];
  preMarketPlan?: string;
  timestamp?: string;
}

function ActiveTradingPlanPanel({ 
  structuredPlan, 
  preMarketPlan,
  timestamp 
}: ActiveTradingPlanPanelProps) {
  // Format timestamp
  const formattedTimestamp = timestamp 
    ? new Date(timestamp).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    : null;

  // If structuredPlan exists, use it; otherwise fallback to preMarketPlan text
  if (structuredPlan) {
    const biasColor = 
      structuredPlan.bias === 'bullish' ? 'text-green-400' :
      structuredPlan.bias === 'bearish' ? 'text-red-400' :
      'text-yellow-400';

    const biasBg = 
      structuredPlan.bias === 'bullish' ? 'bg-green-500/10 border-green-400/30' :
      structuredPlan.bias === 'bearish' ? 'bg-red-500/10 border-red-400/30' :
      'bg-yellow-500/10 border-yellow-400/30';

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-xl bg-white/5 border border-white/10"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Active Trading Plan — LOCKED</h3>
          <div className="px-3 py-1 rounded-lg bg-green-500/10 border border-green-400/30">
            <span className="text-xs text-green-400 font-semibold uppercase tracking-wider">Locked</span>
          </div>
        </div>

        <div className="space-y-6">
          {/* Market Bias */}
          <div>
            <label className="text-xs uppercase tracking-wider text-gray-400 mb-2 block">
              Market Bias
            </label>
            <div className={`px-4 py-2 rounded-lg border ${biasBg}`}>
              <span className={`font-bold text-lg capitalize ${biasColor}`}>
                {structuredPlan.bias}
              </span>
            </div>
          </div>

          {/* Primary Setup */}
          <div>
            <label className="text-xs uppercase tracking-wider text-gray-400 mb-2 block">
              Primary Setup
            </label>
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <p className="text-gray-300 leading-relaxed">
                {structuredPlan.setup}
              </p>
            </div>
          </div>

          {/* Key Levels */}
          <div>
            <label className="text-xs uppercase tracking-wider text-gray-400 mb-2 block">
              Key Levels
            </label>
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <ul className="space-y-2">
                {structuredPlan.levels.map((level, index) => (
                  <li key={index} className="text-gray-300 flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span>{level}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Invalidation Rule */}
          <div>
            <label className="text-xs uppercase tracking-wider text-gray-400 mb-2 block">
              Invalidation Rule
            </label>
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-400/30">
              <p className="text-red-300 leading-relaxed font-medium">
                {structuredPlan.invalidation}
              </p>
            </div>
          </div>

          {/* Scenarios (if present) */}
          {structuredPlan.scenarios && structuredPlan.scenarios.length > 0 && (
            <div>
              <label className="text-xs uppercase tracking-wider text-gray-400 mb-2 block">
                If/Then Scenarios
              </label>
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <ul className="space-y-2">
                  {structuredPlan.scenarios.map((scenario, index) => (
                    <li key={index} className="text-gray-300 flex items-start gap-2">
                      <span className="text-cyan-400 mt-1">→</span>
                      <span>{scenario}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Timestamp */}
          {formattedTimestamp && (
            <div className="pt-4 border-t border-white/10">
              <p className="text-xs text-gray-500 text-center">
                Locked at: {formattedTimestamp}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  // Fallback: Show preMarketPlan text if structuredPlan doesn't exist
  if (preMarketPlan) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-xl bg-white/5 border border-white/10"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Active Trading Plan — LOCKED</h3>
          <div className="px-3 py-1 rounded-lg bg-green-500/10 border border-green-400/30">
            <span className="text-xs text-green-400 font-semibold uppercase tracking-wider">Locked</span>
          </div>
        </div>

        {/* Plan Text */}
        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
          <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
            {preMarketPlan}
          </div>
        </div>

        {/* Timestamp */}
        {formattedTimestamp && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-xs text-gray-500 text-center">
              Locked at: {formattedTimestamp}
            </p>
          </div>
        )}
      </motion.div>
    );
  }

  // No plan data available
  return null;
}
