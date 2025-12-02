import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flame, Dumbbell, Briefcase, Moon, 
  Heart, ChevronDown, ChevronUp, Check, AlertCircle,
  TrendingUp, Zap, Settings, X, Target, Plus,
  ChevronLeft, ChevronRight, Calendar, Trash2, Link2,
  ToggleLeft, ToggleRight, Edit2, RefreshCw
} from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';
import { useIdentityStore } from '../../store/useIdentityStore';
import type { DailyMetric, MetricType } from '../../types';

// ============================================
// Icon Mapping
// ============================================

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

const getIcon = (iconName?: string) => {
  return ICON_MAP[iconName || 'Target'] || <Target className="w-5 h-5" />;
};

// ============================================
// Date Helpers
// ============================================

const formatDate = (date: Date): string => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });
};

const getDateString = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// ============================================
// Tracker Input Component
// ============================================

interface TrackerInputProps {
  metric: DailyMetric;
  value: number | undefined;
  onChange: (value: number) => void;
  onSettingsClick: () => void;
}

const TrackerInput = ({ metric, value, onChange, onSettingsClick }: TrackerInputProps) => {
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
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
            />
            <span className="w-8 text-center font-bold text-white">{numValue || '-'}</span>
          </div>
        );
      
      default: // 'number'
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
            <label className="text-xs text-gray-400 flex items-center gap-1">
              {metric.label}
              {metric.linkedNodeId && (
                <Link2 className="w-3 h-3 text-purple-400" title="Linked to Psych Mirror" />
              )}
            </label>
            <div className="flex items-center gap-2">
              {metric.target && (
                <span className="text-[10px] text-gray-500">
                  Goal: {metric.target} {metric.unit}
                </span>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); onSettingsClick(); }}
                className="p-1 hover:bg-white/10 rounded transition-colors opacity-50 hover:opacity-100"
              >
                <Settings className="w-3 h-3 text-gray-400" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {renderInput()}
            {isGoalMet && <Check className="w-4 h-4 text-green-400 ml-auto" />}
          </div>
          
          {/* Progress bar towards goal */}
          {metric.target && metric.target > 0 && metric.type !== 'boolean' && (
            <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full rounded-full"
                style={{ 
                  backgroundColor: isGoalMet ? '#10b981' : metric.color || '#6366f1',
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

// ============================================
// Add/Edit Metric Modal
// ============================================

interface MetricModalProps {
  isOpen: boolean;
  onClose: () => void;
  metric?: DailyMetric | null;
  nodes: { id: string; label: string }[];
  onSave: (metric: Omit<DailyMetric, 'id' | 'isDefault' | 'isActive'>) => void;
  onUpdate?: (id: string, updates: Partial<DailyMetric>) => void;
  onDelete?: (id: string) => void;
  onToggleActive?: (id: string) => void;
}

const MetricModal = ({ 
  isOpen, onClose, metric, nodes, onSave, onUpdate, onDelete, onToggleActive 
}: MetricModalProps) => {
  const [label, setLabel] = useState(metric?.label || '');
  const [type, setType] = useState<MetricType>(metric?.type || 'number');
  const [unit, setUnit] = useState(metric?.unit || '');
  const [target, setTarget] = useState<number | undefined>(metric?.target);
  const [linkedNodeId, setLinkedNodeId] = useState<string | undefined>(metric?.linkedNodeId);
  const [color, setColor] = useState(metric?.color || '#6366f1');
  const [icon, setIcon] = useState(metric?.icon || 'Target');
  
  useEffect(() => {
    if (metric) {
      setLabel(metric.label);
      setType(metric.type);
      setUnit(metric.unit || '');
      setTarget(metric.target);
      setLinkedNodeId(metric.linkedNodeId);
      setColor(metric.color || '#6366f1');
      setIcon(metric.icon || 'Target');
    } else {
      setLabel('');
      setType('number');
      setUnit('');
      setTarget(undefined);
      setLinkedNodeId(undefined);
      setColor('#6366f1');
      setIcon('Target');
    }
  }, [metric]);
  
  if (!isOpen) return null;
  
  const handleSave = () => {
    if (!label.trim()) return;
    
    const metricData = {
      label: label.trim(),
      type,
      unit: unit || undefined,
      target: target || undefined,
      linkedNodeId: linkedNodeId || undefined,
      color,
      icon
    };
    
    if (metric && onUpdate) {
      onUpdate(metric.id, metricData);
    } else {
      onSave(metricData);
    }
    onClose();
  };
  
  const handleDelete = () => {
    if (metric && onDelete && !metric.isDefault) {
      onDelete(metric.id);
      onClose();
    }
  };
  
  const handleToggleActive = () => {
    if (metric && onToggleActive) {
      onToggleActive(metric.id);
      onClose();
    }
  };
  
  const COLORS = ['#f97316', '#22c55e', '#3b82f6', '#6366f1', '#ec4899', '#eab308', '#14b8a6', '#f43f5e'];
  const ICONS = ['Flame', 'Dumbbell', 'Briefcase', 'Moon', 'Heart', 'Target', 'Zap', 'TrendingUp'];
  
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
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${color}20`, color }}
            >
              {getIcon(icon)}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {metric ? 'Edit Metric' : 'Add New Metric'}
              </h3>
              <p className="text-xs text-gray-400">
                {metric ? 'Customize this metric' : 'Create a custom tracking metric'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        
        <div className="space-y-4">
          {/* Label */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Label *</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g., Water Intake"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
            />
          </div>
          
          {/* Type */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Type</label>
            <div className="grid grid-cols-3 gap-2">
              {(['number', 'boolean', 'scale_1_10'] as MetricType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`py-2 px-3 rounded-lg text-sm transition-all ${
                    type === t 
                      ? 'bg-purple-500/20 border border-purple-500/50 text-purple-400' 
                      : 'bg-white/5 border border-white/10 text-gray-400 hover:border-white/20'
                  }`}
                >
                  {t === 'number' ? 'Number' : t === 'boolean' ? 'Yes/No' : 'Scale 1-10'}
                </button>
              ))}
            </div>
          </div>
          
          {/* Unit (for number type) */}
          {type === 'number' && (
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Unit (optional)</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g., glasses, steps, pages"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          )}
          
          {/* Target */}
          {type !== 'boolean' && (
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Target Goal (optional)</label>
              <input
                type="number"
                value={target ?? ''}
                onChange={(e) => setTarget(e.target.value ? Number(e.target.value) : undefined)}
                placeholder={type === 'scale_1_10' ? 'e.g., 7' : 'e.g., 8'}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          )}
          
          {/* Link to Psych Mirror Node */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400 flex items-center gap-2">
              <Link2 className="w-4 h-4 text-purple-400" />
              Link to Psych Mirror Node (optional)
            </label>
            <select
              value={linkedNodeId || ''}
              onChange={(e) => setLinkedNodeId(e.target.value || undefined)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
            >
              <option value="">No link</option>
              {nodes.map((node) => (
                <option key={node.id} value={node.id}>{node.label}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500">
              Linking syncs this metric's progress to your identity graph
            </p>
          </div>
          
          {/* Color */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-lg transition-all ${
                    color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          
          {/* Icon */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Icon</label>
            <div className="flex gap-2 flex-wrap">
              {ICONS.map((i) => (
                <button
                  key={i}
                  onClick={() => setIcon(i)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                    icon === i 
                      ? 'bg-white/20 border border-white/30' 
                      : 'bg-white/5 border border-white/10 hover:border-white/20'
                  }`}
                  style={{ color }}
                >
                  {getIcon(i)}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="mt-6 space-y-3">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!label.trim()}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {metric ? 'Save Changes' : 'Add Metric'}
            </button>
          </div>
          
          {/* Toggle active / Delete for existing metrics */}
          {metric && (
            <div className="flex gap-3">
              <button
                onClick={handleToggleActive}
                className="flex-1 py-2 rounded-xl border border-white/10 text-gray-400 hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
              >
                {metric.isActive ? (
                  <>
                    <ToggleRight className="w-4 h-4" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <ToggleLeft className="w-4 h-4" />
                    Activate
                  </>
                )}
              </button>
              {!metric.isDefault && (
                <button
                  onClick={handleDelete}
                  className="flex-1 py-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// ============================================
// Main Daily Tracker Component
// ============================================

export const DailyTracker = () => {
  const { user, updateNodeStrength } = useUserStore();
  const { 
    metrics, 
    entries,
    getActiveMetrics, 
    getValueFor, 
    upsertEntry, 
    getTrackingProgress,
    addMetric,
    updateMetric,
    deleteMetric,
    toggleMetricActive,
    syncMirrorFromMetrics
  } = useIdentityStore();
  
  const [isExpanded, setIsExpanded] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [editingMetric, setEditingMetric] = useState<DailyMetric | null>(null);
  const [showAddMetric, setShowAddMetric] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  
  // Get active metrics
  const activeMetrics = useMemo(() => getActiveMetrics(), [metrics]);
  
  // Get tracking progress for selected date
  const progress = useMemo(
    () => getTrackingProgress(selectedDate), 
    [selectedDate, metrics, entries, getTrackingProgress]
  );
  
  // Get nodes for linking
  const availableNodes = useMemo(() => {
    return user?.identityNodes?.map(n => ({ id: n.id, label: n.label })) || [];
  }, [user?.identityNodes]);
  
  // Count goals met
  const goalsMetCount = useMemo(() => {
    return activeMetrics.filter(m => {
      if (!m.target) return false;
      const value = getValueFor(selectedDate, m.id) ?? 0;
      return value >= m.target;
    }).length;
  }, [activeMetrics, selectedDate, entries, getValueFor]);
  
  const totalGoals = activeMetrics.filter(m => m.target).length;
  
  // Date navigation
  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };
  
  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    // Don't allow future dates
    if (newDate <= new Date()) {
      setSelectedDate(newDate);
    }
  };
  
  const goToToday = () => {
    setSelectedDate(new Date());
  };
  
  const isToday = selectedDate.toDateString() === new Date().toDateString();
  const isFuture = selectedDate > new Date();
  
  // Handle value change
  const handleValueChange = (metricId: string, value: number) => {
    upsertEntry(selectedDate, metricId, value);
  };
  
  // Sync to Psych Mirror
  const handleSyncToMirror = () => {
    if (!user?.identityNodes) return;
    
    syncMirrorFromMetrics(user.identityNodes, updateNodeStrength);
    setSyncMessage('✓ Psych Mirror updated from your tracking data!');
    setTimeout(() => setSyncMessage(null), 3000);
  };
  
  // Check if any metrics are linked
  const hasLinkedMetrics = activeMetrics.some(m => m.linkedNodeId);
  
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
                  {progress.percentage}% tracked {isToday ? 'today' : 'on ' + formatDate(selectedDate)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAddMetric(true);
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Add Metric"
              >
                <Plus className="w-4 h-4 text-gray-400" />
              </button>
              {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-2 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress.percentage}%` }}
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
              {/* Date Selector */}
              <div className="px-4 py-3 bg-white/5 border-b border-white/5">
                <div className="flex items-center justify-between">
                  <button
                    onClick={goToPreviousDay}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-400" />
                  </button>
                  
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="font-semibold text-white">{formatDate(selectedDate)}</span>
                    {!isToday && (
                      <button
                        onClick={goToToday}
                        className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
                      >
                        Today
                      </button>
                    )}
                  </div>
                  
                  <button
                    onClick={goToNextDay}
                    disabled={isToday || isFuture}
                    className={`p-2 rounded-lg transition-colors ${
                      isToday || isFuture 
                        ? 'opacity-30 cursor-not-allowed' 
                        : 'hover:bg-white/10'
                    }`}
                  >
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>
              
              {/* Sync to Mirror Button */}
              {hasLinkedMetrics && (
                <div className="px-4 py-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-b border-white/5">
                  <button
                    onClick={handleSyncToMirror}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span className="text-sm font-semibold">Update Psych Mirror from Tracking</span>
                  </button>
                  {syncMessage && (
                    <p className="text-xs text-green-400 text-center mt-2">{syncMessage}</p>
                  )}
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
                {activeMetrics.map((metric) => (
                  <TrackerInput
                    key={metric.id}
                    metric={metric}
                    value={getValueFor(selectedDate, metric.id)}
                    onChange={(value) => handleValueChange(metric.id, value)}
                    onSettingsClick={() => setEditingMetric(metric)}
                  />
                ))}
                
                {activeMetrics.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No active metrics. Add one to start tracking!</p>
                    <button
                      onClick={() => setShowAddMetric(true)}
                      className="mt-3 px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
                    >
                      <Plus className="w-4 h-4 inline mr-2" />
                      Add Metric
                    </button>
                  </div>
                )}
              </div>

              {/* Summary */}
              {activeMetrics.length > 0 && (
                <div className="px-4 pb-4">
                  <div className={`p-3 rounded-lg ${
                    progress.percentage === 100 
                      ? 'bg-green-500/20 border border-green-500/30' 
                      : 'bg-white/5 border border-white/10'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">
                        {progress.tracked}/{progress.total} metrics tracked
                      </span>
                      {progress.percentage === 100 && (
                        <span className="text-green-400 text-sm flex items-center gap-1">
                          <Check className="w-4 h-4" />
                          Complete!
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {progress.tracked < progress.total && (
                    <p className="text-center text-xs text-gray-500 mt-2">
                      Track all metrics for maximum AI insight
                    </p>
                  )}
                </div>
              )}

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

      {/* Add Metric Modal */}
      <AnimatePresence>
        {showAddMetric && (
          <MetricModal
            isOpen={showAddMetric}
            onClose={() => setShowAddMetric(false)}
            nodes={availableNodes}
            onSave={addMetric}
          />
        )}
      </AnimatePresence>

      {/* Edit Metric Modal */}
      <AnimatePresence>
        {editingMetric && (
          <MetricModal
            isOpen={!!editingMetric}
            onClose={() => setEditingMetric(null)}
            metric={editingMetric}
            nodes={availableNodes}
            onSave={addMetric}
            onUpdate={updateMetric}
            onDelete={deleteMetric}
            onToggleActive={toggleMetricActive}
          />
        )}
      </AnimatePresence>
    </>
  );
};
