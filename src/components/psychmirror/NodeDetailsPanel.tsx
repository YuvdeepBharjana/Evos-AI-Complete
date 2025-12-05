import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Target, ChevronDown, ChevronUp, Trash2, AlertTriangle } from 'lucide-react';
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
  const { setNodeDesiredStrength, addMessage, deleteNode } = useUserStore();
  const [showMore, setShowMore] = useState(false);
  const [desiredStrength, setDesiredStrength] = useState(node?.desiredStrength || 80);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!node) return null;

  const handleDeleteNode = () => {
    deleteNode(node.id);
    setShowDeleteConfirm(false);
    onClose();
  };

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
    // Add a context message to main chat
    const workMessage = {
      id: `msg-work-${Date.now()}`,
      content: `I want to work on "${cleanText(node.label)}" (${node.type}). It's currently at ${node.strength}% strength. Help me make progress on this.`,
      sender: 'user' as const,
      timestamp: new Date(),
      nodeId: node.id,
      nodeName: cleanText(node.label),
      context: 'work-session' as const
    };
    addMessage(workMessage);
    onClose();
    
    // Navigate to dashboard chat
    navigate('/dashboard');
    setTimeout(() => {
      const chatBtn = document.querySelector('[data-tab="chat"]');
      if (chatBtn) (chatBtn as HTMLButtonElement).click();
    }, 100);
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
          <div className="p-3 flex items-center gap-3">
            {/* Type indicator with small percentage */}
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `${colors.bg}20`, border: `1.5px solid ${colors.bg}60` }}
            >
              <span className="text-sm font-semibold" style={{ color: colors.bg }}>
                {node.strength}%
              </span>
            </div>
            
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-white text-base leading-tight truncate">
                {cleanText(node.label)}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span 
                  className="text-[10px] font-medium px-1.5 py-0.5 rounded-full capitalize"
                  style={{ background: `${colors.bg}25`, color: colors.bg }}
                >
                  {node.type}
                </span>
                <span className="text-[10px] text-gray-500 capitalize">{node.status}</span>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
            >
              <X size={16} className="text-gray-500" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="px-3 pb-2">
            <div className="h-1.5 bg-gray-800/60 rounded-full overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${node.strength}%` }}
                className={`h-full bg-gradient-to-r ${colors.gradient}`}
              />
              {node.desiredStrength && (
                <div 
                  className="absolute top-0 h-full w-0.5 bg-white/70"
                  style={{ left: `${node.desiredStrength}%` }}
                />
              )}
            </div>
            {gap > 0 && (
              <p className="text-[9px] text-yellow-400/80 mt-0.5">Goal: +{gap}%</p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="px-3 pb-3 flex gap-2">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleWorkOnThis}
              className={`flex-1 py-2 rounded-lg bg-gradient-to-r ${colors.gradient} text-white font-medium text-sm flex items-center justify-center gap-1.5`}
            >
              <Play size={14} />
              Work on This
            </motion.button>
            
            <button
              onClick={() => setShowMore(!showMore)}
              className="px-2.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              {showMore ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
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

                  {/* Delete Node Button */}
                  <div className="pt-2 border-t border-white/10">
                    {!showDeleteConfirm ? (
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-red-400 hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/40 transition-colors text-sm"
                      >
                        <Trash2 size={14} />
                        Remove Node
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-yellow-400 text-xs">
                          <AlertTriangle size={14} />
                          <span>This will permanently delete this node</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setShowDeleteConfirm(false)}
                            className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-gray-400"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleDeleteNode}
                            className="flex-1 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
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
