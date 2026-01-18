import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flame, Dumbbell, Briefcase, Moon, 
  Heart, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Check,
  TrendingUp, Zap, Edit3, Loader2, Calendar
} from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';
import { saveTracking, checkIn } from '../../lib/api';
import { EditMetricModal } from './EditMetricModal';
import type { DailyMetric } from '../../types';

// Icon mapping
const ICON_MAP: Record<string, React.ReactNode> = {
  'Flame': <Flame className="w-5 h-5" />,
  'Dumbbell': <Dumbbell className="w-5 h-5" />,
  'Briefcase': <Briefcase className="w-5 h-5" />,
  'Moon': <Moon className="w-5 h-5" />,
  'Heart': <Heart className="w-5 h-5" />,
  'Zap': <Zap className="w-5 h-5" />,
  'TrendingUp': <TrendingUp className="w-5 h-5" />,
};

const getIcon = (iconName?: string) => ICON_MAP[iconName || 'Zap'] || <Zap className="w-5 h-5" />;

const getDateString = (date: Date): string => date.toISOString().split('T')[0];

// Editable Tracker Item
interface TrackerItemProps {
  metric: DailyMetric;
  value: number | undefined;
  onChange: (value: number) => void;
  onEdit: () => void;
}

const TrackerItem = ({ metric, value, onChange, onEdit }: TrackerItemProps) => {
  const numValue = value ?? 0;
  const progress = metric.target && metric.target > 0 
    ? Math.min((numValue / metric.target) * 100, 100) 
    : 0;
  const isGoalMet = metric.target && numValue >= metric.target;
  const logged = numValue > 0;

  const renderInput = () => {
    switch (metric.type) {
      case 'boolean':
        return (
          <button
            onClick={() => onChange(numValue === 1 ? 0 : 1)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              numValue === 1 
                ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
                : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20'
            }`}
          >
            {numValue === 1 ? '✓ Done' : 'Mark Done'}
          </button>
        );
      
      case 'scale_1_10':
  return (
          <div className="flex items-center gap-3 flex-1">
            <input
              type="range"
              min="1"
              max="10"
              value={numValue || 5}
              onChange={(e) => onChange(Number(e.target.value))}
              className="flex-1 h-2 bg-gray-700/50 rounded-lg appearance-none cursor-pointer accent-current"
              style={{ accentColor: metric.color || '#ec4899' }}
            />
            <span 
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
              style={{ backgroundColor: `${metric.color || '#ec4899'}20`, color: metric.color || '#ec4899' }}
            >
              {numValue || '-'}
              </span>
          </div>
        );
      
      default:
        return (
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={value ?? ''}
              onChange={(e) => onChange(Number(e.target.value))}
              placeholder="0"
              className="w-16 px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-white font-bold text-lg focus:outline-none focus:border-purple-500/50 transition-colors text-center"
            />
            {metric.unit && <span className="text-gray-400 text-sm font-medium">{metric.unit}</span>}
    </div>
  );
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className={`p-4 rounded-xl border transition-all relative overflow-hidden ${
        isGoalMet 
          ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30' 
          : logged 
          ? 'bg-white/5 border-white/20' 
          : 'bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/5'
      }`}
    >
      {/* Subtle gradient overlay when goal is met */}
      {isGoalMet && (
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent pointer-events-none" />
      )}
      
      <div className="flex items-start gap-4 relative">
      <motion.div
          whileHover={{ rotate: 5, scale: 1.1 }}
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"
          style={{ 
            background: `linear-gradient(135deg, ${metric.color || '#6366f1'}30, ${metric.color || '#6366f1'}10)`,
            color: metric.color || '#6366f1',
            border: `1px solid ${metric.color || '#6366f1'}30`
          }}
        >
          {getIcon(metric.icon)}
        </motion.div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2 gap-2">
            <label className="text-sm text-white font-semibold">{metric.label}</label>
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onEdit}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-all group"
              title="Edit metric"
            >
              <Edit3 className="w-4 h-4 text-gray-500 group-hover:text-purple-400 transition-colors" />
            </motion.button>
          </div>

          <div className="flex items-center gap-3">
            {renderInput()}
            {isGoalMet && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0"
              >
                <Check className="w-3.5 h-3.5 text-white" />
              </motion.div>
            )}
          </div>

          {metric.target && metric.target > 0 && metric.type !== 'boolean' && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">Progress</span>
                <span className="text-[10px] font-medium" style={{ color: isGoalMet ? '#10b981' : metric.color || '#6366f1' }}>
                  {Math.round(progress)}%
                </span>
          </div>
              <div className="h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full rounded-full"
                  style={{ 
                    background: isGoalMet 
                      ? 'linear-gradient(90deg, #10b981, #059669)' 
                      : `linear-gradient(90deg, ${metric.color || '#6366f1'}, ${metric.color || '#6366f1'}aa)`
                  }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
          )}
          
          {metric.target && (
            <div className="text-[11px] text-gray-500 mt-2 flex items-center gap-1">
              <span className="opacity-75">Target:</span>
              <span className="font-medium text-gray-400">{metric.target} {metric.unit}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export const DailyTracker = () => {
  const { user } = useUserStore();
  
  // Local state for metrics (stored in localStorage for now)
  const [customMetrics, setCustomMetrics] = useState<DailyMetric[]>(() => {
    const stored = localStorage.getItem('evos_custom_metrics');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    // Default metrics
    return [
      { id: 'calories', label: 'Calories', unit: 'cal', type: 'number', target: 2000, isDefault: true, isActive: true, icon: 'Flame' },
      { id: 'exercise', label: 'Exercise', unit: 'min', type: 'number', target: 30, isDefault: true, isActive: true, icon: 'Dumbbell' },
      { id: 'deep_work', label: 'Deep Work', unit: 'hrs', type: 'number', target: 4, isDefault: true, isActive: true, icon: 'Briefcase' },
      { id: 'sleep', label: 'Sleep', unit: 'hrs', type: 'number', target: 8, isDefault: true, isActive: true, icon: 'Moon' },
      { id: 'mood', label: 'Mood', type: 'scale_1_10', target: 7, isDefault: true, isActive: true, icon: 'Heart' },
    ];
  });

  // Local state for metric entries (stored in localStorage)
  const [metricEntries, setMetricEntries] = useState<DailyMetricEntry[]>(() => {
    const stored = localStorage.getItem('evos_metric_entries');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    return [];
  });

  // Helper functions
  const getActiveMetrics = (): DailyMetric[] => {
    return customMetrics.filter(m => m.isActive);
  };

  const updateMetric = (metricId: string, updates: Partial<DailyMetric>) => {
    setCustomMetrics(prev => {
      const updated = prev.map(m => m.id === metricId ? { ...m, ...updates } : m);
      localStorage.setItem('evos_custom_metrics', JSON.stringify(updated));
      return updated;
    });
  };

  const upsertMetricEntry = (date: string, metricId: string, value: number) => {
    setMetricEntries(prev => {
      const filtered = prev.filter(e => !(e.date === date && e.metricId === metricId));
      const updated = [...filtered, { id: `${date}-${metricId}`, date, metricId, value }];
      localStorage.setItem('evos_metric_entries', JSON.stringify(updated));
      return updated;
    });
  };

  const getMetricValue = (date: string, metricId: string): number | undefined => {
    const entry = metricEntries.find(e => e.date === date && e.metricId === metricId);
    return entry?.value;
  };
  
  const [isExpanded, setIsExpanded] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [editingMetric, setEditingMetric] = useState<DailyMetric | null>(null);
  
  const dateStr = getDateString(selectedDate);
  const today = new Date();
  const todayStr = getDateString(today);
  const isToday = dateStr === todayStr;
  const activeMetrics = useMemo(() => getActiveMetrics(), [customMetrics]);
  
  // Navigate to previous day
  const goToPreviousDay = () => {
    const prevDate = new Date(selectedDate);
    prevDate.setDate(prevDate.getDate() - 1);
    setSelectedDate(prevDate);
  };
  
  // Navigate to next day (but not future)
  const goToNextDay = () => {
    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() + 1);
    const nextDateStr = getDateString(nextDate);
    if (nextDateStr <= todayStr) {
      setSelectedDate(nextDate);
    }
  };
  
  // Jump to today
  const goToToday = () => {
    setSelectedDate(new Date());
  };
  
  // Format date for display
  const formatDateDisplay = (date: Date): string => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const dateStr = getDateString(date);
    const todayStr = getDateString(today);
    const yesterdayStr = getDateString(yesterday);
    
    if (dateStr === todayStr) return 'Today';
    if (dateStr === yesterdayStr) return 'Yesterday';
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
  };
  
  // Calculate progress
  const trackedCount = activeMetrics.filter(m => {
    const val = getMetricValue(dateStr, m.id);
    return val !== undefined && val > 0;
  }).length;
  
  const goalsMetCount = activeMetrics.filter(m => {
    if (!m.target) return false;
    const val = getMetricValue(dateStr, m.id) ?? 0;
    return val >= m.target;
  }).length;
  
  const totalGoals = activeMetrics.filter(m => m.target).length;
  const trackingPercentage = activeMetrics.length > 0 
    ? Math.round((trackedCount / activeMetrics.length) * 100) 
    : 0;
  
  const allTrackingComplete = trackedCount === activeMetrics.length && activeMetrics.length > 0;

  const handleValueChange = (metricId: string, value: number) => {
    upsertMetricEntry(dateStr, metricId, value);
  };

  const handleEditMetric = (metric: DailyMetric) => {
    setEditingMetric(metric);
  };

  const handleSaveMetric = (updates: Partial<DailyMetric>) => {
    if (editingMetric) {
      updateMetric(editingMetric.id, updates);
      setEditingMetric(null);
    }
  };

  // Save tracking data to backend
  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Build tracking data from custom metrics
      const trackingData: Record<string, number | undefined> = {};
      activeMetrics.forEach(m => {
        const val = getMetricValue(dateStr, m.id);
        // Map metric IDs to backend fields
        if (m.id === 'calories') trackingData.calories = val;
        else if (m.id === 'exercise') trackingData.exercise_mins = val;
        else if (m.id === 'deep-work') trackingData.deep_work_hrs = val;
        else if (m.id === 'sleep') trackingData.sleep_hrs = val;
        else if (m.id === 'mood') trackingData.mood = val;
      });
      
      // Save to backend
      await saveTracking({
        date: dateStr,
        ...trackingData
      });
      
      // Check if all daily actions are also complete
      const dailyActions = user?.dailyActions || [];
      const allActionsComplete = dailyActions.length > 0 && 
        dailyActions.every(a => a.completed === true);
      
      // If tracking is complete, dispatch event and potentially check-in
      if (allTrackingComplete) {
        window.dispatchEvent(new CustomEvent('tracking-complete'));
        
        // If all actions are also complete, do check-in
        if (allActionsComplete) {
          const today = new Date().toDateString();
          const lastCheckIn = localStorage.getItem('lastFullCheckInDate');
          
          if (lastCheckIn !== today) {
            await checkIn();
            localStorage.setItem('lastFullCheckInDate', today);
            
            // Dispatch event to refresh experiment page
            window.dispatchEvent(new CustomEvent('experiment-checkin'));
          }
        }
      }
      
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save tracking:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl overflow-hidden"
      >
      {/* Header */}
        <div 
          className="p-4 cursor-pointer bg-gradient-to-r from-orange-500/20 to-red-500/20 border-b border-white/10"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white flex items-center gap-2">
                  Daily Tracker
                  {totalGoals > 0 && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      goalsMetCount === totalGoals 
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-purple-500/20 text-purple-400'
                    }`}>
                      {goalsMetCount}/{totalGoals} goals
                    </span>
                  )}
                </h3>
                <p className="text-xs text-gray-400">
                {trackingPercentage}% tracked {isToday ? 'today' : 'on ' + formatDateDisplay(selectedDate).toLowerCase()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
            {/* Date Navigation */}
            <div 
              className="flex items-center gap-1 bg-white/5 rounded-lg p-1 border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={goToPreviousDay}
                className="p-1.5 hover:bg-white/10 rounded transition-colors"
                title="Previous day"
              >
                <ChevronLeft className="w-4 h-4 text-gray-400" />
              </button>
              
              <button
                onClick={goToToday}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  isToday
                    ? 'bg-purple-500/20 text-purple-300'
                    : 'text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
                title="Go to today"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{formatDateDisplay(selectedDate)}</span>
                <span className="sm:hidden">{isToday ? 'Today' : selectedDate.getDate()}</span>
              </button>
              
              <button
                onClick={goToNextDay}
                disabled={isToday}
                className={`p-1.5 rounded transition-colors ${
                  isToday
                    ? 'opacity-30 cursor-not-allowed'
                    : 'hover:bg-white/10'
                }`}
                title="Next day"
              >
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            
              {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </div>
          </div>

          <div className="mt-3 h-2 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${trackingPercentage}%` }}
              className="h-full bg-gradient-to-r from-orange-500 to-red-500"
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
            {/* Tip */}
            <div className="mx-4 mt-4 mb-2 p-3 rounded-xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10 border border-purple-500/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <Edit3 className="w-4 h-4 text-purple-400" />
                </div>
                    <p className="text-xs text-gray-300">
                  <span className="text-purple-400 font-semibold">Tip:</span>
                  {' '}Tap the <Edit3 className="w-3 h-3 inline text-purple-400" /> icon on any metric to customize it.
                    </p>
                </div>
              </div>

            {/* Metrics */}
              <div className="p-4 space-y-3">
              {activeMetrics.map((metric, index) => (
                <motion.div
                  key={metric.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <TrackerItem
                    metric={metric}
                    value={getMetricValue(dateStr, metric.id)}
                    onChange={(v) => handleValueChange(metric.id, v)}
                    onEdit={() => handleEditMetric(metric)}
                  />
                </motion.div>
              ))}
              </div>

            {activeMetrics.length > 0 && (
              <div className="px-4 pb-4">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  disabled={trackedCount === 0 || isSaving}
                  className={`w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg ${
                    goalsMetCount === totalGoals && totalGoals > 0
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-green-500/25'
                      : trackedCount > 0
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-purple-500/25'
                      : 'bg-gray-700/50 text-gray-500 cursor-not-allowed shadow-none'
                  }`}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : goalsMetCount === totalGoals && totalGoals > 0 ? (
                    <>
                      <Check className="w-5 h-5" />
                      All Goals Met — Save!
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-5 h-5" />
                      {isToday ? 'Save Progress' : 'Update'} ({trackedCount}/{activeMetrics.length})
                    </>
                  )}
                </motion.button>
              </div>
            )}

              <AnimatePresence>
                {showSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="px-4 pb-4"
                  >
                  <div className="p-4 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 shadow-lg shadow-green-500/10">
                    <div className="flex items-center justify-center gap-3">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, delay: 0.1 }}
                        className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center"
                      >
                        <Check className="w-5 h-5 text-white" />
                      </motion.div>
                      <div>
                        <p className="text-sm font-semibold text-green-400">Progress saved!</p>
                        <p className="text-xs text-green-400/70">Keep building your identity.</p>
                      </div>
                    </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

      {/* Edit Metric Modal */}
      {editingMetric && (
        <EditMetricModal
          metric={editingMetric}
          onClose={() => setEditingMetric(null)}
          onSave={handleSaveMetric}
        />
      )}
    </motion.div>
  );
};
