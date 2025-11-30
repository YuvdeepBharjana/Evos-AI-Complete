import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flame, Dumbbell, Briefcase, Moon, 
  Heart, ChevronDown, ChevronUp, Check, AlertCircle,
  TrendingUp, Zap, Settings, X, Target
} from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';
import type { TrackingGoals } from '../../types';

interface TrackerInputProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  onChange: (value: number) => void;
  unit: string;
  placeholder: string;
  color: string;
  logged?: boolean;
  goal?: number;
}

const TrackerInput = ({ icon, label, value, onChange, unit, placeholder, color, logged, goal }: TrackerInputProps) => {
  const numValue = Number(value) || 0;
  const progress = goal && goal > 0 ? Math.min((numValue / goal) * 100, 100) : 0;
  const isGoalMet = goal && numValue >= goal;
  
  return (
    <div className={`p-3 rounded-xl border transition-all ${
      isGoalMet 
        ? 'bg-green-500/20 border-green-500/50' 
        : logged 
        ? `bg-white/5 border-white/20` 
        : 'bg-white/5 border-white/10 hover:border-white/20'
    }`}>
      <div className="flex items-center gap-3">
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}20`, color }}
        >
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-gray-400">{label}</label>
            {goal && (
              <span className="text-[10px] text-gray-500">
                Goal: {goal} {unit}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={value || ''}
              onChange={(e) => onChange(Number(e.target.value))}
              placeholder={placeholder}
              className="w-20 bg-transparent border-none text-white font-bold text-lg focus:outline-none"
            />
            <span className="text-gray-500 text-sm">{unit}</span>
            {isGoalMet && <Check className="w-4 h-4 text-green-400 ml-auto" />}
          </div>
          
          {/* Progress bar towards goal */}
          {goal && goal > 0 && (
            <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full rounded-full"
                style={{ 
                  backgroundColor: isGoalMet ? '#10b981' : color,
                }}
                transition={{ duration: 0.3 }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Goals Setting Modal
const GoalsModal = ({ 
  isOpen, 
  onClose, 
  goals, 
  onSave 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  goals: TrackingGoals;
  onSave: (goals: TrackingGoals) => void;
}) => {
  const [localGoals, setLocalGoals] = useState<TrackingGoals>(goals);
  
  useEffect(() => {
    setLocalGoals(goals);
  }, [goals]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(localGoals);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-md w-full"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Set Your Goals</h3>
              <p className="text-xs text-gray-400">Customize your daily targets</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-400 flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" />
              Daily Calories
            </label>
            <input
              type="number"
              value={localGoals.calories || ''}
              onChange={(e) => setLocalGoals(g => ({ ...g, calories: Number(e.target.value) || undefined }))}
              placeholder="e.g., 2800"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400 flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-green-400" />
              Exercise (minutes)
            </label>
            <input
              type="number"
              value={localGoals.exerciseMinutes || ''}
              onChange={(e) => setLocalGoals(g => ({ ...g, exerciseMinutes: Number(e.target.value) || undefined }))}
              placeholder="e.g., 60"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-400" />
              Deep Work (hours)
            </label>
            <input
              type="number"
              value={localGoals.deepWorkHours || ''}
              onChange={(e) => setLocalGoals(g => ({ ...g, deepWorkHours: Number(e.target.value) || undefined }))}
              placeholder="e.g., 4"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400 flex items-center gap-2">
              <Moon className="w-4 h-4 text-indigo-400" />
              Sleep (hours)
            </label>
            <input
              type="number"
              value={localGoals.sleepHours || ''}
              onChange={(e) => setLocalGoals(g => ({ ...g, sleepHours: Number(e.target.value) || undefined }))}
              placeholder="e.g., 8"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400 flex items-center gap-2">
              <Heart className="w-4 h-4 text-pink-400" />
              Target Mood (1-10)
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={localGoals.mood || ''}
              onChange={(e) => setLocalGoals(g => ({ ...g, mood: Math.min(10, Math.max(1, Number(e.target.value))) || undefined }))}
              placeholder="e.g., 7"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold hover:opacity-90 transition-opacity"
          >
            Save Goals
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export const DailyTracker = () => {
  const { user, updateTrackingData, setTrackingGoals } = useUserStore();
  const [isExpanded, setIsExpanded] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  
  const goals = user?.trackingGoals || {};
  
  // Get today's tracking data from store or initialize empty
  const getTodayTracking = () => {
    if (!user?.trackingData) return null;
    const today = new Date().toDateString();
    return user.trackingData.find(t => new Date(t.date).toDateString() === today);
  };

  const todayData = getTodayTracking();
  
  // Local state initialized from store
  const [tracking, setTracking] = useState({
    calories: todayData?.calories || 0,
    exercise: todayData?.exerciseMinutes || 0,
    workHours: todayData?.deepWorkHours || 0,
    sleepHours: todayData?.sleepHours || 0,
    mood: todayData?.mood || 0
  });

  // Sync local state when store changes
  useEffect(() => {
    const data = getTodayTracking();
    if (data) {
      setTracking({
        calories: data.calories || 0,
        exercise: data.exerciseMinutes || 0,
        workHours: data.deepWorkHours || 0,
        sleepHours: data.sleepHours || 0,
        mood: data.mood || 0
      });
    }
  }, [user?.trackingData]);

  // Calculate goals met
  const goalsMetCount = [
    goals.calories && tracking.calories >= goals.calories,
    goals.exerciseMinutes && tracking.exercise >= goals.exerciseMinutes,
    goals.deepWorkHours && tracking.workHours >= goals.deepWorkHours,
    goals.sleepHours && tracking.sleepHours >= goals.sleepHours,
    goals.mood && tracking.mood >= goals.mood,
  ].filter(Boolean).length;

  const totalGoals = [
    goals.calories,
    goals.exerciseMinutes,
    goals.deepWorkHours,
    goals.sleepHours,
    goals.mood,
  ].filter(Boolean).length;

  const trackedCount = Object.values(tracking).filter(v => v > 0).length;
  const totalCategories = 5;
  const trackingPercentage = Math.round((trackedCount / totalCategories) * 100);

  // Auto-save when values change (debounced effect)
  useEffect(() => {
    const hasData = Object.values(tracking).some(v => v > 0);
    if (hasData) {
      const timer = setTimeout(() => {
        updateTrackingData({
          date: new Date(),
          calories: tracking.calories || undefined,
          exerciseMinutes: tracking.exercise || undefined,
          deepWorkHours: tracking.workHours || undefined,
          sleepHours: tracking.sleepHours || undefined,
          mood: tracking.mood || undefined
        });
      }, 500); // Debounce 500ms
      return () => clearTimeout(timer);
    }
  }, [tracking]);

  const handleSaveTracking = () => {
    updateTrackingData({
      date: new Date(),
      calories: tracking.calories || undefined,
      exerciseMinutes: tracking.exercise || undefined,
      deepWorkHours: tracking.workHours || undefined,
      sleepHours: tracking.sleepHours || undefined,
      mood: tracking.mood || undefined
    });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl overflow-hidden"
      >
        {/* Header with emphasis on tracking importance */}
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
                  {trackingPercentage}% tracked today
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowGoalsModal(true);
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Set Goals"
              >
                <Settings className="w-4 h-4 text-gray-400" />
              </button>
              {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-2 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${trackingPercentage}%` }}
              className="h-full bg-gradient-to-r from-orange-500 to-red-500"
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Why tracking matters callout */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              {/* Set goals prompt if no goals set */}
              {totalGoals === 0 && (
                <div 
                  className="px-4 py-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-b border-white/5 cursor-pointer hover:from-purple-500/20 hover:to-blue-500/20 transition-colors"
                  onClick={() => setShowGoalsModal(true)}
                >
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-purple-400" />
                    <p className="text-sm text-gray-300">
                      <span className="text-purple-400 font-semibold">Set your daily goals</span>
                      {' '}— Track progress towards your targets
                    </p>
                  </div>
                </div>
              )}

              {/* Importance message */}
              <div className="px-4 py-3 bg-gradient-to-r from-orange-500/5 to-red-500/5 border-b border-white/5">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-300">
                      <span className="text-orange-400 font-semibold">The more you track, the smarter I become.</span>
                      {' '}Without data, I cannot measure your growth.
                    </p>
                  </div>
                </div>
              </div>

              {/* Tracking inputs */}
              <div className="p-4 space-y-3">
                <TrackerInput
                  icon={<Flame className="w-5 h-5" />}
                  label="Calories"
                  value={tracking.calories}
                  onChange={(v) => setTracking(t => ({ ...t, calories: v }))}
                  unit="cal"
                  placeholder="2000"
                  color="#f97316"
                  logged={tracking.calories > 0}
                  goal={goals.calories}
                />
                
                <TrackerInput
                  icon={<Dumbbell className="w-5 h-5" />}
                  label="Exercise"
                  value={tracking.exercise}
                  onChange={(v) => setTracking(t => ({ ...t, exercise: v }))}
                  unit="min"
                  placeholder="30"
                  color="#22c55e"
                  logged={tracking.exercise > 0}
                  goal={goals.exerciseMinutes}
                />
                
                <TrackerInput
                  icon={<Briefcase className="w-5 h-5" />}
                  label="Deep Work"
                  value={tracking.workHours}
                  onChange={(v) => setTracking(t => ({ ...t, workHours: v }))}
                  unit="hrs"
                  placeholder="4"
                  color="#3b82f6"
                  logged={tracking.workHours > 0}
                  goal={goals.deepWorkHours}
                />
                
                <TrackerInput
                  icon={<Moon className="w-5 h-5" />}
                  label="Sleep"
                  value={tracking.sleepHours}
                  onChange={(v) => setTracking(t => ({ ...t, sleepHours: v }))}
                  unit="hrs"
                  placeholder="8"
                  color="#6366f1"
                  logged={tracking.sleepHours > 0}
                  goal={goals.sleepHours}
                />
                
                <TrackerInput
                  icon={<Heart className="w-5 h-5" />}
                  label="Mood (1-10)"
                  value={tracking.mood}
                  onChange={(v) => setTracking(t => ({ ...t, mood: Math.min(10, Math.max(1, v)) }))}
                  unit=""
                  placeholder="7"
                  color="#ec4899"
                  logged={tracking.mood > 0}
                  goal={goals.mood}
                />
              </div>

              {/* Save button and streak info */}
              <div className="px-4 pb-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSaveTracking}
                  disabled={trackedCount === 0}
                  className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                    goalsMetCount === totalGoals && totalGoals > 0
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                      : trackedCount > 0
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {goalsMetCount === totalGoals && totalGoals > 0 ? (
                    <>
                      <Check className="w-5 h-5" />
                      All Goals Met! Save Today
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-5 h-5" />
                      Save Progress ({trackedCount}/{totalCategories})
                    </>
                  )}
                </motion.button>
                
                {trackedCount < totalCategories && (
                  <p className="text-center text-xs text-gray-500 mt-2">
                    Track all 5 categories for maximum AI insight
                  </p>
                )}
              </div>

              {/* Success message */}
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
                        ✓ Data logged! Your identity loop is closing.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Goals Modal */}
      <AnimatePresence>
        {showGoalsModal && (
          <GoalsModal
            isOpen={showGoalsModal}
            onClose={() => setShowGoalsModal(false)}
            goals={goals}
            onSave={setTrackingGoals}
          />
        )}
      </AnimatePresence>
    </>
  );
};
