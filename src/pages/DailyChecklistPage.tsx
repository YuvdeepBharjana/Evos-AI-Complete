/**
 * Daily Checklist Page
 * 
 * The core discipline interface for traders.
 * Three actions. Three outcomes. Green, Red, or Neutral.
 * 
 * This page uses the TradingDay store as the single source of truth.
 */

import { useEffect, useState } from 'react';
import { useTradingDayStore } from '../store/useTradingDayStore';
import { CheckCircle2, Circle, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function DailyChecklistPage() {
  // ============================================
  // STATE FROM TRADING DAY STORE
  // ============================================
  
  const {
    currentDay,
    initializeToday,
    completePreMarket,
    completePostMarket,
    setRulesFollowed,
    closeDay,
    computeFinalStatus,
  } = useTradingDayStore();

  // ============================================
  // LOCAL UI STATE
  // ============================================
  
  // Controls the "Did you follow rules?" modal
  const [showRulesPrompt, setShowRulesPrompt] = useState(false);

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
   * Sets rules followed, then closes the day
   * 
   * @param value - true (followed), false (broke), null (no trades)
   */
  const handleRulesDecision = (value: boolean | null) => {
    setRulesFollowed(value);
    closeDay();
    setShowRulesPrompt(false);
  };

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
            isDisabled={!currentDay.preMarketCompleted || isClosed}
            isLocked={isClosed}
            disabledReason={
              !currentDay.preMarketCompleted && !isClosed
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
            isDisabled={!currentDay.postMarketCompleted || isClosed}
            isLocked={isClosed}
            disabledReason={
              !currentDay.postMarketCompleted && !isClosed
                ? 'Complete Post-Market first'
                : undefined
            }
            onAction={handleOpenCloseDay}
            actionLabel="Close Day & Lock Discipline Result"
          />
        </div>

        {/* ========== RULES PROMPT MODAL ========== */}
        <AnimatePresence>
          {showRulesPrompt && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowRulesPrompt(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[#0a0320] border border-white/10 rounded-2xl p-8 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-2xl font-bold mb-4 text-center">
                  Did you follow your trading rules today?
                </h3>
                <p className="text-gray-400 text-sm text-center mb-8">
                  Your answer determines today's discipline result.
                </p>

                <div className="space-y-3">
                  {/* YES - Followed Rules */}
                  <button
                    onClick={() => handleRulesDecision(true)}
                    className="w-full py-4 px-6 bg-green-500/10 border border-green-400/30 rounded-xl text-green-400 font-medium hover:bg-green-500/20 transition-colors"
                  >
                    ✓ Yes, I followed all my rules
                  </button>

                  {/* NO - Broke Rules */}
                  <button
                    onClick={() => handleRulesDecision(false)}
                    className="w-full py-4 px-6 bg-red-500/10 border border-red-400/30 rounded-xl text-red-400 font-medium hover:bg-red-500/20 transition-colors"
                  >
                    ✗ No, I broke at least one rule
                  </button>

                  {/* NEUTRAL - No Trades */}
                  <button
                    onClick={() => handleRulesDecision(null)}
                    className="w-full py-4 px-6 bg-gray-500/10 border border-gray-400/30 rounded-xl text-gray-400 font-medium hover:bg-gray-500/20 transition-colors"
                  >
                    ⚪ I did not trade today
                  </button>
                </div>

                <button
                  onClick={() => setShowRulesPrompt(false)}
                  className="mt-6 w-full py-2 text-sm text-gray-500 hover:text-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ============================================
// CHECKLIST ITEM COMPONENT
// ============================================

interface ChecklistItemProps {
  title: string;
  description: string;
  isCompleted: boolean;
  isDisabled: boolean;
  isLocked: boolean;
  disabledReason?: string;
  onAction: () => void;
  actionLabel: string;
}

function ChecklistItem({
  title,
  description,
  isCompleted,
  isDisabled,
  isLocked,
  disabledReason,
  onAction,
  actionLabel,
}: ChecklistItemProps) {
  return (
    <div
      className={`
        p-6 rounded-xl border backdrop-blur-xl transition-all
        ${isCompleted 
          ? 'bg-green-500/5 border-green-400/30' 
          : 'bg-white/5 border-white/10'
        }
        ${isLocked ? 'opacity-60' : ''}
      `}
    >
      <div className="flex items-start gap-4">
        {/* ===== CHECKBOX ICON ===== */}
        <div className="flex-shrink-0 mt-1">
          {isLocked ? (
            <Lock className="w-6 h-6 text-gray-500" />
          ) : isCompleted ? (
            <CheckCircle2 className="w-6 h-6 text-green-400" />
          ) : (
            <Circle className="w-6 h-6 text-gray-500" />
          )}
        </div>

        {/* ===== CONTENT ===== */}
        <div className="flex-1">
          <h3 className={`text-lg font-semibold mb-1 ${isCompleted ? 'text-green-400' : 'text-white'}`}>
            {title}
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            {description}
          </p>

          {/* ===== ACTION BUTTON ===== */}
          {!isCompleted && !isLocked && (
            <button
              onClick={onAction}
              disabled={isDisabled}
              className={`
                px-4 py-2 rounded-lg font-medium text-sm transition-all
                ${isDisabled
                  ? 'bg-gray-700/30 text-gray-500 cursor-not-allowed'
                  : 'bg-green-500/20 text-green-400 border border-green-400/30 hover:bg-green-500/30'
                }
              `}
            >
              {actionLabel}
            </button>
          )}

          {/* ===== COMPLETED MESSAGE ===== */}
          {isCompleted && !isLocked && (
            <div className="text-sm text-green-400 font-medium">
              ✓ Completed
            </div>
          )}

          {/* ===== LOCKED MESSAGE ===== */}
          {isLocked && (
            <div className="text-sm text-gray-500 font-medium">
              🔒 Day closed
            </div>
          )}

          {/* ===== DISABLED REASON ===== */}
          {isDisabled && !isCompleted && !isLocked && disabledReason && (
            <p className="text-xs text-gray-500 mt-2 italic">
              {disabledReason}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
