import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, Calendar, Play, Target, Sliders } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { IdentityNode } from '../../types';
import { useUserStore } from '../../store/useUserStore';

interface NodeDetailsPanelProps {
  node: IdentityNode | null;
  onClose: () => void;
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
    startWorkSession(node.id, node.label);
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
          <h2 className="text-2xl font-bold gradient-text">{node.label}</h2>
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
                {node.description}
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

          {/* Work on This Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleWorkOnThis}
            className={`w-full py-4 rounded-xl bg-gradient-to-r ${getTypeColor(node.type)} text-white font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-shadow`}
          >
            <Play size={20} />
            Work on This
          </motion.button>
          <p className="text-xs text-gray-500 text-center -mt-2">
            Start a focused session to strengthen this aspect
          </p>

          {/* Action Suggestions */}
          <div className="glass rounded-xl p-4">
            <h3 className="font-semibold mb-3">💡 Suggestions</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              {node.status === 'neglected' && (
                <li>• Consider revisiting this area - small steps can reignite progress</li>
              )}
              {node.status === 'developing' && (
                <li>• You're making progress! Keep up the momentum</li>
              )}
              {node.status === 'active' && (
                <li>• Strong momentum! Consider what's working and double down</li>
              )}
              {node.status === 'mastered' && (
                <li>• Excellent! This is a core strength. How can you leverage it?</li>
              )}
            </ul>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
