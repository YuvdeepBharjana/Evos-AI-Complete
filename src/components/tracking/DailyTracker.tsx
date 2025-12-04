import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flame, Dumbbell, Briefcase, Moon, 
  Heart, ChevronDown, ChevronUp, Check, AlertCircle,
  TrendingUp, Zap, Edit3, Loader2
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
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="1"
              max="10"
              value={numValue || 5}
              onChange={(e) => onChange(Number(e.target.value))}
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              style={{ accentColor: metric.color || '#ec4899' }}
            />
            <span className="w-8 text-center font-bold text-white">{numValue || '-'}</span>
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
              className="w-20 bg-transparent border-none text-white font-bold text-lg focus:outline-none"
            />
            {metric.unit && <span className="text-gray-500 text-sm">{metric.unit}</span>}
          </div>
        );
    }
  };
  
  return (
    <div className={`p-3 rounded-xl border transition-all ${
      isGoalMet 
        ? 'bg-green-500/20 border-green-500/50' 
        : logged 
        ? 'bg-white/5 border-white/20' 
        : 'bg-white/5 border-white/10 hover:border-white/20'
    }`}>
      <div className="flex items-center gap-3">
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${metric.color || '#6366f1'}20`, color: metric.color || '#6366f1' }}
        >
          {getIcon(metric.icon)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1 gap-2">
            <label className="text-sm text-white font-medium truncate">{metric.label}</label>
            <button 
              onClick={onEdit}
              className="p-1 hover:bg-white/10 rounded opacity-50 hover:opacity-100 transition-opacity"
              title="Edit metric (name, color, icon, unit, target)"
            >
              <Edit3 className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            {renderInput()}
            {isGoalMet && <Check className="w-4 h-4 text-green-400 ml-auto flex-shrink-0" />}
          </div>
          
          {metric.target && metric.target > 0 && metric.type !== 'boolean' && (
            <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full rounded-full"
                style={{ backgroundColor: isGoalMet ? '#10b981' : metric.color || '#6366f1' }}
                transition={{ duration: 0.3 }}
              />
            </div>
          )}
          
          {metric.target && (
            <div className="text-[10px] text-gray-500 mt-1">
              Target: {metric.target} {metric.unit}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const DailyTracker = () => {
  const { 
    customMetrics, 
    getActiveMetrics,
    updateMetric,
    upsertMetricEntry,
    getMetricValue,
    user
  } = useUserStore();
  
  const [isExpanded, setIsExpanded] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedDate] = useState(new Date());
  const [editingMetric, setEditingMetric] = useState<DailyMetric | null>(null);
  
  const dateStr = getDateString(selectedDate);
  const activeMetrics = useMemo(() => getActiveMetrics(), [customMetrics]);
  
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
              <p className="text-xs text-gray-400">{trackingPercentage}% tracked today</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
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
            <div className="px-4 py-3 bg-gradient-to-r from-purple-500/5 to-blue-500/5 border-b border-white/5">
              <div className="flex items-start gap-2">
                <Edit3 className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-300">
                  <span className="text-purple-400 font-semibold">Customize your metrics.</span>
                  {' '}Tap the edit icon to customize name, color, icon, unit, and target for each metric.
                </p>
              </div>
            </div>

            {/* Metrics */}
            <div className="p-4 space-y-3">
              {activeMetrics.map(metric => (
                <TrackerItem
                  key={metric.id}
                  metric={metric}
                  value={getMetricValue(dateStr, metric.id)}
                  onChange={(v) => handleValueChange(metric.id, v)}
                  onEdit={() => handleEditMetric(metric)}
                />
              ))}
            </div>

            {activeMetrics.length > 0 && (
              <div className="px-4 pb-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  disabled={trackedCount === 0 || isSaving}
                  className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                    goalsMetCount === totalGoals && totalGoals > 0
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                      : trackedCount > 0
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
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
                      All Goals Met - Save!
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-5 h-5" />
                      Save Progress ({trackedCount}/{activeMetrics.length})
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
                  <div className="p-3 rounded-lg bg-green-500/20 border border-green-500/30">
                    <p className="text-sm text-green-400 text-center">
                      ✓ Progress saved! Keep building your identity.
                    </p>
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
