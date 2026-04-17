import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Save, Palette, Target, Type, Hash,
  Flame, Dumbbell, Briefcase, Moon, Heart, Zap, TrendingUp,
  AlertCircle, Sun, Coffee, Book, Music, Camera, Gamepad2
} from 'lucide-react';
import type { DailyMetric } from '../../types';

interface EditMetricModalProps {
  metric: DailyMetric;
  onClose: () => void;
  onSave: (updates: Partial<DailyMetric>) => void;
}

// Available icons - organized by category
const AVAILABLE_ICONS = [
  // Health & Fitness
  { name: 'Flame', component: Flame, label: 'Calories' },
  { name: 'Dumbbell', component: Dumbbell, label: 'Exercise' },
  { name: 'Heart', component: Heart, label: 'Health' },
  { name: 'Moon', component: Moon, label: 'Sleep' },
  { name: 'Sun', component: Sun, label: 'Energy' },
  { name: 'Coffee', component: Coffee, label: 'Caffeine' },
  // Work & Productivity  
  { name: 'Briefcase', component: Briefcase, label: 'Work' },
  { name: 'TrendingUp', component: TrendingUp, label: 'Progress' },
  { name: 'Zap', component: Zap, label: 'Focus' },
  { name: 'Book', component: Book, label: 'Reading' },
  // Lifestyle
  { name: 'Music', component: Music, label: 'Music' },
  { name: 'Camera', component: Camera, label: 'Creative' },
  { name: 'Gamepad2', component: Gamepad2, label: 'Gaming' },
  { name: 'AlertCircle', component: AlertCircle, label: 'Alert' },
];

// Predefined color palette
const COLOR_PALETTE = [
  '#f97316', // Orange
  '#22c55e', // Green
  '#3b82f6', // Blue
  '#6366f1', // Indigo
  '#ec4899', // Pink
  '#ef4444', // Red
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#8b5cf6', // Purple
  '#f59e0b', // Amber
  '#14b8a6', // Teal
  '#a855f7', // Violet
];

export const EditMetricModal = ({ metric, onClose, onSave }: EditMetricModalProps) => {
  const [label, setLabel] = useState(metric.label);
  const [target, setTarget] = useState(metric.target?.toString() || '');
  const [unit, setUnit] = useState(metric.unit || '');
  const [color, setColor] = useState(metric.color || '#6366f1');
  const [icon, setIcon] = useState(metric.icon || 'Zap');
  const [customColor, setCustomColor] = useState('');

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleSave = () => {
    const updates: Partial<DailyMetric> = {
      label: label.trim(),
      unit: unit.trim() || undefined,
      color: customColor || color,
      icon: icon,
    };

    // Only include target if it's a valid number
    if (target.trim()) {
      const targetNum = parseFloat(target);
      if (!isNaN(targetNum) && targetNum > 0) {
        updates.target = targetNum;
      } else {
        updates.target = undefined;
      }
    } else {
      updates.target = undefined;
    }

    onSave(updates);
    onClose();
  };

  const selectedIcon = AVAILABLE_ICONS.find(i => i.name === icon) || AVAILABLE_ICONS[0];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="glass rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          style={{
            background: 'linear-gradient(135deg, rgba(15,15,25,0.95) 0%, rgba(20,20,35,0.95) 100%)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          }}
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Edit Metric</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <p className="text-sm text-gray-400 mt-1">
              Customize your metric to match your growth journey
            </p>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Label */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-white mb-2">
                <Type className="w-4 h-4 text-purple-400" />
                Metric Name
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g., Calories, Exercise, Sleep"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
            </div>

            {/* Icon Selection */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-white mb-3">
                <Zap className="w-4 h-4 text-purple-400" />
                Icon
              </label>
              <div className="grid grid-cols-7 gap-2">
                {AVAILABLE_ICONS.map((iconOption) => {
                  const IconComponent = iconOption.component;
                  const isSelected = icon === iconOption.name;
                  return (
                    <motion.button
                      key={iconOption.name}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIcon(iconOption.name)}
                      className={`p-2.5 rounded-xl transition-all ${
                        isSelected
                          ? 'bg-purple-500/20 ring-2 ring-purple-500 shadow-lg shadow-purple-500/20'
                          : 'bg-white/5 hover:bg-white/10 ring-1 ring-white/10'
                      }`}
                      style={{
                        color: isSelected ? color : '#9ca3af',
                      }}
                      title={iconOption.label}
                    >
                      <IconComponent className="w-5 h-5 mx-auto" />
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-white mb-3">
                <Palette className="w-4 h-4 text-purple-400" />
                Color
              </label>
              <div className="grid grid-cols-6 gap-2 mb-3">
                {COLOR_PALETTE.map((paletteColor) => {
                  const isSelected = color === paletteColor && !customColor;
                  return (
                    <motion.button
                      key={paletteColor}
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setColor(paletteColor);
                        setCustomColor('');
                      }}
                      className={`w-10 h-10 rounded-xl transition-all shadow-lg ${
                        isSelected
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900'
                          : 'ring-1 ring-white/20 hover:ring-white/40'
                      }`}
                      style={{ backgroundColor: paletteColor }}
                      title={paletteColor}
                    />
                  );
                })}
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <input
                  type="color"
                  value={customColor || color}
                  onChange={(e) => {
                    setCustomColor(e.target.value);
                    setColor(e.target.value);
                  }}
                  className="w-10 h-10 rounded-lg border-none cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={customColor || color}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                      setCustomColor(val);
                      setColor(val);
                    } else if (val === '') {
                      setCustomColor('');
                    }
                  }}
                  placeholder="#6366f1"
                  className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm font-mono placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                />
                <span className="text-xs text-gray-500">Custom</span>
              </div>
            </div>

            {/* Two column layout for Unit and Target */}
            <div className="grid grid-cols-2 gap-4">
              {/* Unit */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-white mb-2">
                  <Hash className="w-4 h-4 text-purple-400" />
                  Unit
                </label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="cal, min, hrs..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                />
              </div>

              {/* Target */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-white mb-2">
                  <Target className="w-4 h-4 text-purple-400" />
                  Target
                </label>
                <input
                  type="number"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="e.g., 2000"
                  min="0"
                  step="0.1"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                />
              </div>
            </div>

            {/* Preview */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-white/5 to-white/[0.02] border border-white/10">
              <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider font-semibold">Live Preview</p>
              <div className="flex items-center gap-4 p-3 rounded-xl bg-white/5">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"
                  style={{ 
                    background: `linear-gradient(135deg, ${color}30, ${color}10)`,
                    color: color,
                    border: `1px solid ${color}30`
                  }}
                >
                  {selectedIcon && (() => {
                    const IconComponent = selectedIcon.component;
                    return <IconComponent className="w-6 h-6" />;
                  })()}
                </motion.div>
                <div className="flex-1">
                  <p className="text-base font-semibold text-white">{label || 'Metric Name'}</p>
                  {target && (
                    <p className="text-sm text-gray-400 mt-0.5">
                      Target: <span className="font-medium">{target}</span> {unit}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10 flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl bg-white/5 text-gray-400 hover:bg-white/10 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium hover:from-purple-600 hover:to-indigo-600 transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

