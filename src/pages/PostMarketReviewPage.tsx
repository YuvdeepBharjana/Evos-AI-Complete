/**
 * Post-Market Review Page
 * 
 * Review what happened during the trading day and reconcile behavior vs. plan.
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTradingDayStore } from '../store/useTradingDayStore';
import { ChecklistItem } from '../features/premarket/components/ChecklistItem';
import { RulesPromptModal } from '../features/premarket/components/RulesPromptModal';
import { judgeDiscipline, type DisciplineJudgeResponse } from '../lib/api';
import type { TradingDay } from '../types/tradingDay';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export function PostMarketReviewPage() {
  const {
    currentDay,
    history,
    initializeToday,
    completePostMarket,
    setRulesFollowed,
    closeDay,
    isTradingUnlocked,
  } = useTradingDayStore();

  const [showRulesPrompt, setShowRulesPrompt] = useState(false);
  const [judgeLoading, setJudgeLoading] = useState(false);
  const [judgeResult, setJudgeResult] = useState<DisciplineJudgeResponse | null>(null);
  const [judgeError, setJudgeError] = useState<string | null>(null);

  useEffect(() => {
    initializeToday();
  }, [initializeToday]);

  if (!currentDay) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center">
        <div className="text-white text-lg">Initializing today's checklist...</div>
      </div>
    );
  }

  const isClosed = currentDay.isClosed;
  const tradingUnlocked = isTradingUnlocked();
  const todayFormatted = new Date(currentDay.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleCompletePostMarket = () => {
    completePostMarket();
  };

  const handleOpenCloseDay = () => {
    setShowRulesPrompt(true);
  };

  const handleRulesDecision = async (value: boolean | null) => {
    const dayToClose = currentDay;
    
    if (!dayToClose) {
      return;
    }

    setRulesFollowed(value);
    closeDay();
    setShowRulesPrompt(false);

    const closedDay: TradingDay = {
      ...dayToClose,
      rulesFollowed: value,
      finalStatus: null,
      isClosed: true,
      closedAt: new Date().toISOString(),
    };

    setJudgeLoading(true);
    setJudgeError(null);
    setJudgeResult(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      
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

  return (
    <div className="min-h-screen bg-[#030014] text-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2">Post-Market Review</h1>
          <p className="text-gray-400">{todayFormatted}</p>
        </div>

        {/* Trading Locked Banner */}
        {!tradingUnlocked && !isClosed && (
          <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-400/30 text-center">
            <p className="text-red-400 font-semibold">
              🔒 Complete premarket calibration first
            </p>
          </div>
        )}

        {/* Checklist */}
        <div className="space-y-4 mb-8">
          {/* Post-Market Review */}
          <ChecklistItem
            title="Post-Market Review"
            description="Review what happened and reconcile behavior vs. plan"
            isCompleted={currentDay.postMarketCompleted}
            isDisabled={!currentDay.preMarketCompleted || isClosed || !tradingUnlocked}
            isLocked={isClosed}
            disabledReason={
              !tradingUnlocked && !isClosed
                ? 'Complete premarket calibration first'
                : !currentDay.preMarketCompleted && !isClosed
                ? 'Complete Pre-Market first'
                : undefined
            }
            onAction={handleCompletePostMarket}
            actionLabel="Complete Post-Market Review"
          />

          {/* Close Day */}
          <ChecklistItem
            title="Close Trading Day"
            description="Evaluate rule adherence and lock today's result"
            isCompleted={isClosed}
            isDisabled={!currentDay.postMarketCompleted || isClosed || !tradingUnlocked}
            isLocked={isClosed}
            disabledReason={
              !tradingUnlocked && !isClosed
                ? 'Complete premarket calibration first'
                : !currentDay.postMarketCompleted && !isClosed
                ? 'Complete Post-Market first'
                : undefined
            }
            onAction={handleOpenCloseDay}
            actionLabel="Close Day & Lock Discipline Result"
          />
        </div>

        {/* Discipline Judge Feedback */}
        {judgeLoading && (
          <div className="mb-8 p-6 rounded-xl bg-white/5 border border-white/10 text-center">
            <Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin text-cyan-400" />
            <p className="text-gray-400">Evaluating discipline...</p>
          </div>
        )}

        {judgeError && (
          <div className="mb-8 p-6 rounded-xl bg-red-500/10 border border-red-400/30">
            <p className="text-red-400">Could not load discipline feedback</p>
          </div>
        )}

        {judgeResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 rounded-xl bg-white/5 border border-white/10"
          >
            <h3 className={`text-2xl font-bold mb-6 text-center ${
              judgeResult.verdict === 'PASS' ? 'text-green-400' : 'text-red-400'
            }`}>
              Discipline Verdict: {judgeResult.verdict}
            </h3>

            {judgeResult.violations.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm uppercase tracking-wider text-gray-400 mb-3">Violations</h4>
                <ul className="space-y-2">
                  {judgeResult.violations.map((violation, index) => (
                    <li key={index} className="flex items-start gap-2 text-red-300">
                      <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <span>{violation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {judgeResult.strengths.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm uppercase tracking-wider text-gray-400 mb-3">Strengths</h4>
                <ul className="space-y-2">
                  {judgeResult.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2 text-green-300">
                      <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-4 border-t border-white/10">
              <h4 className="text-sm uppercase tracking-wider text-gray-400 mb-3">Tomorrow's Correction</h4>
              <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-400/30">
                <p className="text-cyan-300 font-medium">{judgeResult.correction}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Rules Prompt Modal */}
        <RulesPromptModal
          isOpen={showRulesPrompt}
          onClose={() => setShowRulesPrompt(false)}
          onDecision={handleRulesDecision}
        />
      </div>
    </div>
  );
}
