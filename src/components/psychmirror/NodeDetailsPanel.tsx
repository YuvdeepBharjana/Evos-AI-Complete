import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, Calendar, Play, Target, Sliders, AlertTriangle, CheckCircle2, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { IdentityNode } from '../../types';
import { useUserStore } from '../../store/useUserStore';

interface NodeDetailsPanelProps {
  node: IdentityNode | null;
  onClose: () => void;
}

// Strip markdown formatting from text
const cleanText = (text: string): string => {
  return text
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/\_\_/g, '')
    .replace(/\_/g, '')
    .trim();
};

// Get intensity label
function getIntensityLabel(value: number): 'Critical' | 'Developing' | 'Dominant' {
  if (value < 40) return 'Critical';
  if (value < 70) return 'Developing';
  return 'Dominant';
}

// Get impact message
function getImpactMessage(value: number, category: string, status: string): string {
  const intensity = getIntensityLabel(value);
  if (intensity === 'Critical') {
    return '⚠️ Underdeveloped - This trait is mostly dormant. 1 action today will move it.';
  }
  if (intensity === 'Developing') {
    return 'You\'re inconsistent. This is where you leak identity.';
  }
  return 'This is driving your life. Protect it.';
}

// Get concrete actions to move the node
function getConcreteActions(value: number, category: string, label: string): string[] {
  const intensity = getIntensityLabel(value);
  const nextTarget = Math.min(100, value + 1);
  
  if (intensity === 'Critical') {
    return [
      `Do ONE thing today that proves "${label}" matters to you (5 min)`,
      `Set a micro-commitment: repeat this action for 3 days`,
      `Track it: mark it done before you sleep tonight`
    ];
  }
  
  if (intensity === 'Developing') {
    return [
      `Identify what's working: what made this ${value}% instead of 30%?`,
      `Double down: do the working action 2x this week`,
      `Connect it: link this to a related ${category.toLowerCase()} you're strong in`
    ];
  }
  
  return [
    `Protect this: what threatens to drop it below 70%?`,
    `Leverage it: how can this strength lift other areas?`,
    `Maintain it: schedule a weekly check-in to prevent regression`
  ];
}

export const NodeDetailsPanel = ({ node, onClose }: NodeDetailsPanelProps) => {
  const navigate = useNavigate();
  const { startWorkSession, setNodeDesiredStrength } = useUserStore();
  const [showGoalSetter, setShowGoalSetter] = useState(false);
  const [desiredStrength, setDesiredStrength] = useState(node?.desiredStrength || 80);

  if (!node) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'mastered':
        return 'text-green-400';
      case 'active':
        return 'text-blue-400';
      case 'developing':
        return 'text-yellow-400';
      case 'neglected':
        return 'text-gray-400';
      default:
        return 'text-gray-400';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'habit':
        return 'from-green-500 to-emerald-500';
      case 'goal':
        return 'from-blue-500 to-cyan-500';
      case 'trait':
        return 'from-purple-500 to-violet-500';
      case 'emotion':
        return 'from-orange-500 to-amber-500';
      case 'struggle':
        return 'from-red-500 to-rose-500';
      default:
        return 'from-gray-500 to-slate-500';
    }
  };

  const handleWorkOnThis = () => {
    startWorkSession(node.id, cleanText(node.label));
    onClose();
    navigate('/work-session');
  };

  const handleSetGoal = () => {
    setNodeDesiredStrength(node.id, desiredStrength);
    setShowGoalSetter(false);
  };

  const gap = (node.desiredStrength || 80) - node.strength;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 400 }}
        animate={{ x: 0 }}
        exit={{ x: 400 }}
        transition={{ type: 'spring', damping: 25 }}
        className="fixed right-0 top-0 h-full w-96 glass border-l border-gray-700 p-6 overflow-y-auto z-50"
      >
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold gradient-text">{cleanText(node.label)}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Type Badge */}
          <div>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getTypeColor(node.type)} text-white capitalize`}>
              {node.type}
            </span>
          </div>

          {/* Intensity Label */}
          {(() => {
            const intensity = getIntensityLabel(node.strength);
            const intensityColors = {
              Critical: 'bg-red-900/30 border-red-500/50 text-red-200',
              Developing: 'bg-yellow-900/30 border-yellow-500/50 text-yellow-200',
              Dominant: 'bg-green-900/30 border-green-500/50 text-green-200',
            };
            return (
              <div className={`rounded-lg px-3 py-2 border ${intensityColors[intensity]}`}>
                <div className="flex items-center gap-2">
                  {intensity === 'Critical' && <AlertTriangle size={16} />}
                  {intensity === 'Developing' && <Zap size={16} />}
                  {intensity === 'Dominant' && <CheckCircle2 size={16} />}
                  <span className="font-semibold text-sm">
                    {intensity} ({node.strength}%)
                  </span>
                </div>
                <p className="text-xs mt-1 opacity-90">
                  {getImpactMessage(node.strength, node.type, node.status)}
                </p>
              </div>
            );
          })()}

          {/* Strength with Gap Indicator */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400 flex items-center gap-2">
                <TrendingUp size={16} />
                Strength
              </span>
              <span className="font-bold">{node.strength}%</span>
            </div>
            <div className="h-3 bg-gray-800 rounded-full overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${node.strength}%` }}
                className={`h-full bg-gradient-to-r ${getTypeColor(node.type)}`}
              />
              {/* Desired strength marker */}
              {node.desiredStrength && (
                <div 
                  className="absolute top-0 h-full w-0.5 bg-white"
                  style={{ left: `${node.desiredStrength}%` }}
                />
              )}
            </div>
            {gap > 0 && (
              <p className="text-xs text-yellow-400 mt-1">
                Gap to goal: {gap}%
              </p>
            )}
          </div>

          {/* Status */}
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Status</span>
              <span className={`font-semibold capitalize ${getStatusColor(node.status)}`}>
                {node.status}
              </span>
            </div>
          </div>

          {/* Last Updated */}
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400 flex items-center gap-2">
                <Calendar size={16} />
                Last Updated
              </span>
              <span className="text-sm">
                {new Date(node.lastUpdated).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Description */}
          {node.description && (
            <div>
              <h3 className="text-sm font-semibold mb-2 text-gray-400">Description</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                {cleanText(node.description)}
              </p>
            </div>
          )}

          {/* Connections */}
          {node.connections.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-2 text-gray-400">
                Connected to {node.connections.length} nodes
              </h3>
              <p className="text-xs text-gray-500">
                This aspect is linked to other parts of your identity
              </p>
            </div>
          )}

          {/* Set Goal Button */}
          <button
            onClick={() => setShowGoalSetter(!showGoalSetter)}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          >
            <span className="flex items-center gap-2 text-sm">
              <Target size={16} className="text-purple-400" />
              Set Target Strength
            </span>
            <span className="text-sm text-gray-400">
              {node.desiredStrength || 80}%
            </span>
          </button>

          {/* Goal Setter Slider */}
          <AnimatePresence>
            {showGoalSetter && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Sliders size={16} className="text-purple-400" />
                    <span className="text-sm text-purple-300">Target: {desiredStrength}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={desiredStrength}
                    onChange={(e) => setDesiredStrength(Number(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                  <button
                    onClick={handleSetGoal}
                    className="w-full mt-3 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium transition-colors"
                  >
                    Set Goal
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Feature Lock for Critical Nodes */}
          {node.strength < 40 && (
            <div className="glass rounded-xl p-4 border border-red-500/30 bg-red-900/10">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={16} className="text-red-400" />
                <span className="font-semibold text-red-300 text-sm">Feature Locked</span>
              </div>
              <p className="text-xs text-red-200/80 mb-3">
                You haven't earned this yet. Build these 3 habits first:
              </p>
              <ul className="space-y-1 text-xs text-red-200/70">
                <li>• Complete 3 daily actions for this node</li>
                <li>• Reach 40% strength threshold</li>
                <li>• Maintain consistency for 1 week</li>
              </ul>
            </div>
          )}

          {/* Work on This Button */}
          <motion.button
            whileHover={{ scale: node.strength >= 40 ? 1.02 : 1 }}
            whileTap={{ scale: node.strength >= 40 ? 0.98 : 1 }}
            onClick={handleWorkOnThis}
            disabled={node.strength < 40}
            className={`w-full py-4 rounded-xl bg-gradient-to-r ${getTypeColor(node.type)} text-white font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all ${
              node.strength < 40 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Play size={20} />
            {node.strength < 40 ? 'Unlock at 40%' : 'Work on This'}
          </motion.button>
          <p className="text-xs text-gray-500 text-center -mt-2">
            {node.strength < 40 
              ? 'Complete basic actions first to unlock work sessions'
              : 'Start a focused session to strengthen this aspect'}
          </p>

          {/* Concrete Actions - What do I do today to move from X% → X+1%? */}
          <div className="glass rounded-xl p-4 border border-purple-500/20">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Target size={16} className="text-purple-400" />
              Move from {node.strength}% → {Math.min(100, node.strength + 1)}%
            </h3>
            <ul className="space-y-3 text-sm">
              {getConcreteActions(node.strength, node.type, cleanText(node.label)).map((action, idx) => (
                <li key={idx} className="flex items-start gap-2 text-gray-300">
                  <span className="text-purple-400 mt-0.5">•</span>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Progress Sparkline Placeholder */}
          <div className="glass rounded-xl p-4">
            <h3 className="font-semibold mb-3 text-sm text-gray-400">Last 7 Days</h3>
            <div className="h-16 bg-gray-800/50 rounded flex items-end justify-between gap-1 p-2">
              {Array.from({ length: 7 }).map((_, i) => {
                // Simulated progress data (in real app, fetch from tracking)
                const height = 20 + Math.random() * 60;
                return (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-purple-500 to-purple-300 rounded-t"
                    style={{ height: `${height}%` }}
                  />
                );
              })}
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              {node.strength < 40 
                ? "You're staring at the node instead of moving it."
                : "Track daily to see momentum"}
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
