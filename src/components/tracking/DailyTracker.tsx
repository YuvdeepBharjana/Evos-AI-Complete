import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flame, Dumbbell, Briefcase, Moon, 
  Heart, ChevronDown, ChevronUp, Check, AlertCircle,
  TrendingUp, Zap, Settings, X, Target, Plus, Trash2,
  ToggleLeft, ToggleRight
} from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';
import type { DailyMetric, MetricType } from '../../types';

// Icon mapping
const ICON_MAP: Record<string, React.ReactNode> = {
  'Flame': <Flame className="w-5 h-5" />,
  'Dumbbell': <Dumbbell className="w-5 h-5" />,
  'Briefcase': <Briefcase className="w-5 h-5" />,
  'Moon': <Moon className="w-5 h-5" />,
  'Heart': <Heart className="w-5 h-5" />,
  'Target': <Target className="w-5 h-5" />,
  'Zap': <Zap className="w-5 h-5" />,
  'TrendingUp': <TrendingUp className="w-5 h-5" />,
};

const getIcon = (iconName?: string) => ICON_MAP[iconName || 'Target'] || <Target className="w-5 h-5" />;

const getDateString = (date: Date): string => date.toISOString().split('T')[0];

// Tracker Input Component
interface TrackerInputProps {
  metric: DailyMetric;
  value: number | undefined;
  onChange: (value: number) => void;
}

const TrackerInput = ({ metric, value, onChange }: TrackerInputProps) => {
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
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${metric.color || '#6366f1'}20`, color: metric.color || '#6366f1' }}
        >
          {getIcon(metric.icon)}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-gray-400">{metric.label}</label>
            {metric.target && (
              <span className="text-[10px] text-gray-500">
                Goal: {metric.target} {metric.unit}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {renderInput()}
            {isGoalMet && <Check className="w-4 h-4 text-green-400 ml-auto" />}
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
        </div>
      </div>
    </div>
  );
};

// Add Metric Modal
const AddMetricModal = ({ 
  isOpen, 
  onClose, 
  onSave 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSave: (metric: Omit<DailyMetric, 'id' | 'isDefault' | 'isActive'>) => void;
}) => {
  const [label, setLabel] = useState('');
  const [unit, setUnit] = useState('');
  const [type, setType] = useState<MetricType>('number');
  const [target, setTarget] = useState<number | undefined>();
  const [icon, setIcon] = useState('Target');
  const [color, setColor] = useState('#8b5cf6');

  const icons = ['Flame', 'Dumbbell', 'Briefcase', 'Moon', 'Heart', 'Target', 'Zap', 'TrendingUp'];
  const colors = ['#f97316', '#22c55e', '#3b82f6', '#6366f1', '#ec4899', '#8b5cf6', '#06b6d4', '#f59e0b'];

  if (!isOpen) return null;

  const handleSave = () => {
    if (!label.trim()) return;
    onSave({ label, unit, type, target, icon, color });
    setLabel('');
    setUnit('');
    setType('number');
    setTarget(undefined);
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
        className="bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white">Add Custom Metric</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 block mb-2">Name</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g., Water Intake"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 block mb-2">Unit</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g., glasses"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-2">Target</label>
              <input
                type="number"
                value={target ?? ''}
                onChange={(e) => setTarget(Number(e.target.value) || undefined)}
                placeholder="e.g., 8"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 block mb-2">Type</label>
            <div className="flex gap-2">
              {(['number', 'boolean', 'scale_1_10'] as MetricType[]).map(t => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    type === t 
                      ? 'bg-purple-500/20 border border-purple-500 text-purple-400' 
                      : 'bg-white/5 border border-white/10 text-gray-400 hover:border-white/20'
                  }`}
                >
                  {t === 'number' ? 'Number' : t === 'boolean' ? 'Yes/No' : 'Scale 1-10'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 block mb-2">Icon</label>
            <div className="flex gap-2 flex-wrap">
              {icons.map(i => (
                <button
                  key={i}
                  onClick={() => setIcon(i)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                    icon === i 
                      ? 'bg-purple-500/20 border-2 border-purple-500' 
                      : 'bg-white/5 border border-white/10 hover:border-white/20'
                  }`}
                  style={{ color }}
                >
                  {getIcon(i)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 block mb-2">Color</label>
            <div className="flex gap-2 flex-wrap">
              {colors.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-all ${
                    color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
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
            disabled={!label.trim()}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            Add Metric
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Manage Metrics Modal
const ManageMetricsModal = ({ 
  isOpen, 
  onClose,
  metrics,
  onToggle,
  onDelete,
  onUpdate
}: { 
  isOpen: boolean; 
  onClose: () => void;
  metrics: DailyMetric[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<DailyMetric>) => void;
}) => {
  if (!isOpen) return null;

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
        className="bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white">Manage Metrics</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="space-y-3">
          {metrics.map(metric => (
            <div 
              key={metric.id}
              className={`p-3 rounded-xl border transition-all ${
                metric.isActive 
                  ? 'bg-white/5 border-white/20' 
                  : 'bg-white/[0.02] border-white/5 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${metric.color || '#6366f1'}20`, color: metric.color || '#6366f1' }}
                >
                  {getIcon(metric.icon)}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-white">{metric.label}</div>
                  <div className="text-xs text-gray-500">
                    {metric.target ? `Target: ${metric.target} ${metric.unit || ''}` : 'No target set'}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggle(metric.id)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title={metric.isActive ? 'Disable' : 'Enable'}
                  >
                    {metric.isActive 
                      ? <ToggleRight className="w-5 h-5 text-green-400" />
                      : <ToggleLeft className="w-5 h-5 text-gray-500" />
                    }
                  </button>
                  {!metric.isDefault && (
                    <button
                      onClick={() => onDelete(metric.id)}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold"
        >
          Done
        </button>
      </motion.div>
    </motion.div>
  );
};

export const DailyTracker = () => {
  const { 
    customMetrics, 
    getActiveMetrics,
    addMetric,
    updateMetric,
    deleteMetric,
    toggleMetricActive,
    upsertMetricEntry,
    getMetricValue
  } = useUserStore();
  
  const [isExpanded, setIsExpanded] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [selectedDate] = useState(new Date());
  
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

  const handleValueChange = (metricId: string, value: number) => {
    upsertMetricEntry(dateStr, metricId, value);
  };

  const handleSave = () => {
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
              <button
                onClick={(e) => { e.stopPropagation(); setShowManageModal(true); }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Manage Metrics"
              >
                <Settings className="w-4 h-4 text-gray-400" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setShowAddModal(true); }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Add Metric"
              >
                <Plus className="w-4 h-4 text-gray-400" />
              </button>
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
              {/* Importance message */}
              <div className="px-4 py-3 bg-gradient-to-r from-orange-500/5 to-red-500/5 border-b border-white/5">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-gray-300">
                    <span className="text-orange-400 font-semibold">The more you track, the smarter I become.</span>
                    {' '}Without data, I cannot measure your growth.
                  </p>
                </div>
              </div>

              {/* Metrics */}
              <div className="p-4 space-y-3">
                {activeMetrics.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No active metrics. Add one to start tracking!</p>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="mt-4 px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
                    >
                      <Plus className="w-4 h-4 inline mr-2" />
                      Add Your First Metric
                    </button>
                  </div>
                ) : (
                  activeMetrics.map(metric => (
                    <TrackerInput
                      key={metric.id}
                      metric={metric}
                      value={getMetricValue(dateStr, metric.id)}
                      onChange={(v) => handleValueChange(metric.id, v)}
                    />
                  ))
                )}
              </div>

              {activeMetrics.length > 0 && (
                <div className="px-4 pb-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
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
                        All Goals Met!
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
                        ✓ Data saved! Your identity loop is closing.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {showAddModal && (
          <AddMetricModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onSave={addMetric}
          />
        )}
        {showManageModal && (
          <ManageMetricsModal
            isOpen={showManageModal}
            onClose={() => setShowManageModal(false)}
            metrics={customMetrics}
            onToggle={toggleMetricActive}
            onDelete={deleteMetric}
            onUpdate={updateMetric}
          />
        )}
      </AnimatePresence>
    </>
  );
};
