import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flame, Dumbbell, Briefcase, Moon, 
  Heart, ChevronDown, ChevronUp, Check, AlertCircle,
  TrendingUp, Zap
} from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';

interface TrackerInputProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  onChange: (value: number) => void;
  unit: string;
  placeholder: string;
  color: string;
  logged?: boolean;
}

const TrackerInput = ({ icon, label, value, onChange, unit, placeholder, color, logged }: TrackerInputProps) => (
  <div className={`p-3 rounded-xl border transition-all ${
    logged 
      ? `bg-${color}-500/20 border-${color}-500/50` 
      : 'bg-white/5 border-white/10 hover:border-white/20'
  }`}>
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg bg-${color}-500/20 flex items-center justify-center text-${color}-400`}>
        {icon}
      </div>
      <div className="flex-1">
        <label className="text-xs text-gray-400 block mb-1">{label}</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(Number(e.target.value))}
            placeholder={placeholder}
            className="w-20 bg-transparent border-none text-white font-bold text-lg focus:outline-none"
          />
          <span className="text-gray-500 text-sm">{unit}</span>
          {logged && <Check className="w-4 h-4 text-green-400 ml-auto" />}
        </div>
      </div>
    </div>
  </div>
);

export const DailyTracker = () => {
  const { user, updateTrackingData } = useUserStore();
  const [isExpanded, setIsExpanded] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  
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
                {trackedCount < totalCategories && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 animate-pulse">
                    {totalCategories - trackedCount} left
                  </span>
                )}
                {trackedCount === totalCategories && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
                    ✓ Complete
                  </span>
                )}
              </h3>
              <p className="text-xs text-gray-400">
                {trackingPercentage}% tracked today
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-orange-400 font-medium">No tracking = No growth</p>
              <p className="text-[10px] text-gray-500">Feed the loop</p>
            </div>
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
            {/* Importance message */}
            <div className="px-4 py-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-b border-white/5">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-300">
                    <span className="text-purple-400 font-semibold">The more you track, the smarter I become.</span>
                    {' '}Without data, I can't measure your growth or close the loop on your identity evolution.
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
                color="orange"
                logged={tracking.calories > 0}
              />
              
              <TrackerInput
                icon={<Dumbbell className="w-5 h-5" />}
                label="Exercise"
                value={tracking.exercise}
                onChange={(v) => setTracking(t => ({ ...t, exercise: v }))}
                unit="min"
                placeholder="30"
                color="green"
                logged={tracking.exercise > 0}
              />
              
              <TrackerInput
                icon={<Briefcase className="w-5 h-5" />}
                label="Deep Work"
                value={tracking.workHours}
                onChange={(v) => setTracking(t => ({ ...t, workHours: v }))}
                unit="hrs"
                placeholder="4"
                color="blue"
                logged={tracking.workHours > 0}
              />
              
              <TrackerInput
                icon={<Moon className="w-5 h-5" />}
                label="Sleep"
                value={tracking.sleepHours}
                onChange={(v) => setTracking(t => ({ ...t, sleepHours: v }))}
                unit="hrs"
                placeholder="8"
                color="indigo"
                logged={tracking.sleepHours > 0}
              />
              
              <TrackerInput
                icon={<Heart className="w-5 h-5" />}
                label="Mood (1-10)"
                value={tracking.mood}
                onChange={(v) => setTracking(t => ({ ...t, mood: Math.min(10, Math.max(1, v)) }))}
                unit=""
                placeholder="7"
                color="pink"
                logged={tracking.mood > 0}
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
                  trackedCount === totalCategories
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                    : trackedCount > 0
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                {trackedCount === totalCategories ? (
                  <>
                    <Check className="w-5 h-5" />
                    Complete! Save Today's Data
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
  );
};
