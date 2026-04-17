/**
 * Discipline Calendar Page
 * 
 * A read-only "truth mirror" showing discipline outcomes for each day.
 * 
 * IMPORTANT:
 * - This is READ-ONLY. No editing, no status changes, no mutations.
 * - Data comes from TradingDay store history (immutable closed days)
 * - Colors reflect actual discipline outcomes, not aspirations
 * - If a day is missing, it means no data was recorded (honesty enforced)
 */

import { useState, useMemo } from 'react';
import { useTradingDayStore } from '../store/useTradingDayStore';
import type { TradingDay } from '../types/tradingDay';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toLocalDateKey } from '../lib/dateKey';

export function DisciplineCalendarPage() {
  // ============================================
  // STATE FROM TRADING DAY STORE (READ-ONLY)
  // ============================================
  
  const { history, currentDay, currentStreak, longestStreak, disciplineRate30 } = useTradingDayStore();

  // ============================================
  // LOCAL UI STATE
  // ============================================
  
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<TradingDay | null>(null);

  // ============================================
  // CALENDAR LOGIC
  // ============================================
  
  /**
   * Get all days in the selected month with proper alignment
   * Returns an array of calendar cells including empty cells for alignment
   * Calendar starts on Monday (trader calendar)
   */
  const calendarDays = useMemo(() => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    
    // JavaScript day index (0 = Sunday, 6 = Saturday)
    const jsDay = new Date(year, month, 1).getDay();
    
    // Convert to Monday-based index (0 = Monday, 6 = Sunday)
    const mondayIndex = (jsDay + 6) % 7;
    
    // Total days in the month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Create array of calendar cells
    const days: (Date | null)[] = [];
    
    // Add empty cells for days before the month starts (Monday-based alignment)
    for (let i = 0; i < mondayIndex; i++) {
      days.push(null);
    }
    
    // Add actual days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  }, [selectedMonth]);

  /**
   * Map TradingDay history to dates for quick lookup
   * Key format: YYYY-MM-DD
   */
  const tradingDayMap = useMemo(() => {
    const map = new Map<string, TradingDay>();
    
    // Add closed days from history
    history.forEach(day => {
      map.set(day.date, day);
    });
    
    // Add current day if it exists (include even if not closed for today highlighting)
    if (currentDay) {
      map.set(currentDay.date, currentDay);
    }
    
    return map;
  }, [history, currentDay]);

  /**
   * Check if a date is today
   */
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  /**
   * Get TradingDay for a given date
   */
  const getTradingDayForDate = (date: Date): TradingDay | undefined => {
    const dateString = toLocalDateKey(date);
    return tradingDayMap.get(dateString);
  };

  // ============================================
  // MONTH NAVIGATION
  // ============================================
  
  const goToPreviousMonth = () => {
    setSelectedMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setSelectedMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToCurrentMonth = () => {
    setSelectedMonth(new Date());
  };

  // ============================================
  // DAY CLICK HANDLER
  // ============================================
  
  const handleDayClick = (date: Date) => {
    const tradingDay = getTradingDayForDate(date);
    if (tradingDay) {
      setSelectedDay(tradingDay);
    }
  };

  // ============================================
  // FORMAT HELPERS
  // ============================================
  
  const monthYearLabel = selectedMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const isCurrentMonth = 
    selectedMonth.getMonth() === new Date().getMonth() &&
    selectedMonth.getFullYear() === new Date().getFullYear();

  // ============================================
  // RENDER
  // ============================================
  
  return (
    <div className="min-h-screen bg-[#030014] text-white py-8 px-4">
      <div className="max-w-5xl mx-auto">
        
        {/* ========== HEADER ========== */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Discipline Calendar</h1>
          <p className="text-gray-400">Your truth mirror. Every day, every decision.</p>
        </div>

        {/* ========== STREAK METRICS ========== */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-cyan-400 mb-1">
              {currentStreak()}
            </div>
            <div className="text-sm text-gray-400">
              Current Discipline Streak
            </div>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-1">
              {longestStreak()}
            </div>
            <div className="text-sm text-gray-400">
              Best Streak
            </div>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">
              {disciplineRate30()}%
            </div>
            <div className="text-sm text-gray-400">
              30-Day Discipline Rate
            </div>
          </div>
        </div>

        {/* ========== MONTH NAVIGATION ========== */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-semibold">{monthYearLabel}</h2>
            {!isCurrentMonth && (
              <button
                onClick={goToCurrentMonth}
                className="text-sm px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                Today
              </button>
            )}
          </div>

          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* ========== CALENDAR GRID ========== */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-xl">
          
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-400 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((date, index) => {
              if (!date) {
                // Empty cell for alignment
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const tradingDay = getTradingDayForDate(date);
              const isTodayDate = isToday(date);
              const status = tradingDay?.finalStatus;

              return (
                <CalendarDayCell
                  key={date.toISOString()}
                  date={date}
                  tradingDay={tradingDay}
                  isToday={isTodayDate}
                  onClick={() => handleDayClick(date)}
                />
              );
            })}
          </div>
        </div>

        {/* ========== LEGEND ========== */}
        <div className="mt-6 flex items-center justify-center gap-6 text-sm flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500/30 border border-green-400/50" />
            <span className="text-gray-400">Green Day (Disciplined)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500/30 border border-red-400/50" />
            <span className="text-gray-400">Red Day (Broke Rules)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-500/30 border border-gray-400/50" />
            <span className="text-gray-400">Neutral (Logged, No Trades)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-transparent border border-white/5" />
            <span className="text-gray-400">Empty (No Record)</span>
          </div>
        </div>
      </div>

      {/* ========== DAY DETAIL MODAL ========== */}
      <AnimatePresence>
        {selectedDay && (
          <DayDetailModal
            tradingDay={selectedDay}
            onClose={() => setSelectedDay(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// CALENDAR DAY CELL COMPONENT
// ============================================

interface CalendarDayCellProps {
  date: Date;
  tradingDay?: TradingDay;
  isToday: boolean;
  onClick: () => void;
}

function CalendarDayCell({ date, tradingDay, isToday, onClick }: CalendarDayCellProps) {
  const dayNumber = date.getDate();
  const status = tradingDay?.finalStatus;
  const hasData = !!tradingDay;

  // Determine background color based on status
  const getBgColor = () => {
    // Missing day: no TradingDay data → empty/dim, not clickable
    if (!hasData) return 'bg-transparent border-white/5';
    
    // Neutral day: TradingDay exists with finalStatus === 'neutral' → gray, clickable
    switch (status) {
      case 'green':
        return 'bg-green-500/20 border-green-400/40';
      case 'red':
        return 'bg-red-500/20 border-red-400/40';
      case 'neutral':
        return 'bg-gray-500/20 border-gray-400/40';
      default:
        return 'bg-transparent border-white/10';
    }
  };

  const bgColor = getBgColor();

  return (
    <button
      onClick={hasData ? onClick : undefined}
      disabled={!hasData}
      className={`
        aspect-square rounded-lg border transition-all
        ${bgColor}
        ${hasData ? 'hover:scale-105 cursor-pointer' : 'cursor-default'}
        ${isToday ? 'ring-2 ring-white/30' : ''}
        relative
      `}
    >
      {/* Day Number */}
      <div className={`
        text-lg font-medium
        ${hasData ? 'text-white' : 'text-gray-700'}
        ${isToday ? 'font-bold' : ''}
      `}>
        {dayNumber}
      </div>

      {/* Status Indicator Dot (if has data) */}
      {hasData && status && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2">
          <div 
            className={`w-1.5 h-1.5 rounded-full ${
              status === 'green' ? 'bg-green-400' :
              status === 'red' ? 'bg-red-400' :
              'bg-gray-400'
            }`}
          />
        </div>
      )}
    </button>
  );
}

// ============================================
// DAY DETAIL MODAL COMPONENT
// ============================================

interface DayDetailModalProps {
  tradingDay: TradingDay;
  onClose: () => void;
}

function DayDetailModal({ tradingDay, onClose }: DayDetailModalProps) {
  const formattedDate = new Date(tradingDay.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const statusColor = 
    tradingDay.finalStatus === 'green' ? 'text-green-400' :
    tradingDay.finalStatus === 'red' ? 'text-red-400' :
    'text-gray-400';

  const statusLabel =
    tradingDay.finalStatus === 'green' ? '🟩 Green Day' :
    tradingDay.finalStatus === 'red' ? '🟥 Red Day' :
    '⚪ Neutral Day';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[#0a0320] border border-white/10 rounded-2xl p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ===== HEADER ===== */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-sm text-gray-400 mb-1">{formattedDate}</p>
            <h3 className={`text-2xl font-bold ${statusColor}`}>
              {statusLabel}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ===== DISCIPLINE BREAKDOWN ===== */}
        <div className="space-y-4">
          <div className="text-xs uppercase tracking-wider text-gray-500 mb-3">
            Discipline Checklist
          </div>

          {/* Pre-Market */}
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <span className="text-sm">Pre-Market Analysis</span>
            <span className={`text-sm font-medium ${
              tradingDay.preMarketCompleted ? 'text-green-400' : 'text-red-400'
            }`}>
              {tradingDay.preMarketCompleted ? '✓ Completed' : '✗ Not Completed'}
            </span>
          </div>

          {/* Post-Market */}
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <span className="text-sm">Post-Market Review</span>
            <span className={`text-sm font-medium ${
              tradingDay.postMarketCompleted ? 'text-green-400' : 'text-red-400'
            }`}>
              {tradingDay.postMarketCompleted ? '✓ Completed' : '✗ Not Completed'}
            </span>
          </div>

          {/* Rules Followed */}
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <span className="text-sm">Rules Followed</span>
            <span className={`text-sm font-medium ${
              tradingDay.rulesFollowed === true ? 'text-green-400' :
              tradingDay.rulesFollowed === false ? 'text-red-400' :
              'text-gray-400'
            }`}>
              {tradingDay.rulesFollowed === true && '✓ Yes'}
              {tradingDay.rulesFollowed === false && '✗ No'}
              {tradingDay.rulesFollowed === null && '⚪ No Trades'}
            </span>
          </div>
        </div>

        {/* ===== CONTEXT TAGS (if present) ===== */}
        {tradingDay.contextTags && tradingDay.contextTags.length > 0 && (
          <div className="mt-6">
            <div className="text-xs uppercase tracking-wider text-gray-500 mb-2">
              Context
            </div>
            <div className="flex flex-wrap gap-2">
              {tradingDay.contextTags.map(tag => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs bg-white/10 rounded text-gray-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ===== IMMUTABLE NOTICE ===== */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <p className="text-xs text-gray-500 text-center italic">
            This record is permanent and cannot be changed.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
