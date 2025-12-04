import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, Play, Target, ChevronDown, ChevronUp } from 'lucide-react';
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

export const NodeDetailsPanel = ({ node, onClose }: NodeDetailsPanelProps) => {
  const navigate = useNavigate();
  const { startWorkSession, setNodeDesiredStrength } = useUserStore();
  const [showMore, setShowMore] = useState(false);
  const [desiredStrength, setDesiredStrength] = useState(node?.desiredStrength || 80);

  if (!node) return null;

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'habit': return { bg: '#10b981', gradient: 'from-green-500 to-emerald-500' };
      case 'goal': return { bg: '#3b82f6', gradient: 'from-blue-500 to-cyan-500' };
      case 'trait': return { bg: '#a855f7', gradient: 'from-purple-500 to-violet-500' };
      case 'emotion': return { bg: '#f59e0b', gradient: 'from-orange-500 to-amber-500' };
      case 'struggle': return { bg: '#ef4444', gradient: 'from-red-500 to-rose-500' };
      case 'interest': return { bg: '#06b6d4', gradient: 'from-cyan-500 to-teal-500' };
      default: return { bg: '#6b7280', gradient: 'from-gray-500 to-slate-500' };
    }
  };

  const handleWorkOnThis = () => {
    startWorkSession(node.id, cleanText(node.label));
    onClose();
    navigate('/work-session');
  };

  const handleSetGoal = () => {
    setNodeDesiredStrength(node.id, desiredStrength);
  };

  const colors = getTypeColor(node.type);
  const gap = (node.desiredStrength || 80) - node.strength;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md"
      >
        <div 
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(20,20,35,0.98) 0%, rgba(15,15,25,0.98) 100%)',
            backdropFilter: 'blur(20px)',
            border: `2px solid ${colors.bg}40`,
            boxShadow: `0 20px 50px rgba(0,0,0,0.5), 0 0 30px ${colors.bg}30`,
          }}
        >
          {/* Compact Header */}
          <div className="p-4 flex items-center gap-3">
            {/* Type indicator */}
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${colors.bg}25`, border: `2px solid ${colors.bg}` }}
            >
              <span className="text-2xl font-bold" style={{ color: colors.bg }}>
                {node.strength}%
              </span>
            </div>
            
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-white text-lg leading-tight truncate">
                {cleanText(node.label)}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span 
                  className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize"
                  style={{ background: `${colors.bg}30`, color: colors.bg }}
                >
                  {node.type}
                </span>
                <span className="text-xs text-gray-400 capitalize">{node.status}</span>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
            >
              <X size={18} className="text-gray-400" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="px-4 pb-3">
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${node.strength}%` }}
                className={`h-full bg-gradient-to-r ${colors.gradient}`}
              />
              {node.desiredStrength && (
                <div 
                  className="absolute top-0 h-full w-0.5 bg-white"
                  style={{ left: `${node.desiredStrength}%` }}
                />
              )}
            </div>
            {gap > 0 && (
              <p className="text-[10px] text-yellow-400 mt-1">Gap to goal: {gap}%</p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="px-4 pb-4 flex gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleWorkOnThis}
              className={`flex-1 py-2.5 rounded-xl bg-gradient-to-r ${colors.gradient} text-white font-semibold text-sm flex items-center justify-center gap-2`}
            >
              <Play size={16} />
              Work on This
            </motion.button>
            
            <button
              onClick={() => setShowMore(!showMore)}
              className="px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              {showMore ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            </button>
          </div>

          {/* Expandable Details */}
          <AnimatePresence>
            {showMore && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-t border-white/10"
              >
                <div className="p-4 space-y-4">
                  {/* Description */}
                  {node.description && (
                    <div>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">About</h3>
                      <p className="text-sm text-gray-300 leading-relaxed">
                        {cleanText(node.description)}
                      </p>
                    </div>
                  )}

                  {/* Target Strength Slider */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                        <Target size={12} />
                        Target Strength
                      </span>
                      <span className="text-sm font-bold" style={{ color: colors.bg }}>{desiredStrength}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={desiredStrength}
                      onChange={(e) => {
                        setDesiredStrength(Number(e.target.value));
                        handleSetGoal();
                      }}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer"
                      style={{ 
                        background: `linear-gradient(to right, ${colors.bg} 0%, ${colors.bg} ${desiredStrength}%, #374151 ${desiredStrength}%, #374151 100%)`,
                        accentColor: colors.bg 
                      }}
                    />
                  </div>

                  {/* Quick tip based on status */}
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-xs text-gray-400">
                      {node.status === 'neglected' && '💡 Small steps can reignite progress'}
                      {node.status === 'developing' && '💡 Keep up the momentum!'}
                      {node.status === 'active' && '💡 Strong momentum - double down on what works'}
                      {node.status === 'mastered' && '💡 Core strength - leverage it in other areas'}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
