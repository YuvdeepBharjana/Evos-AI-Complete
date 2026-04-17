import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { IdentityNode } from '../../types';

interface NodeDetailsPanelProps {
  node: IdentityNode | null;
  onClose: () => void;
}

// Strip markdown formatting from text
const cleanText = (text: string): string => {
  return text
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/__/g, '')
    .replace(/_/g, '')
    .trim();
};

export const NodeDetailsPanel = ({ node, onClose }: NodeDetailsPanelProps) => {
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

  const colors = getTypeColor(node.type);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm"
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
          {/* Header */}
          <div className="p-4 flex items-start gap-3">
            {/* Type indicator with percentage */}
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${colors.bg}20`, border: `2px solid ${colors.bg}60` }}
            >
              <span className="text-base font-bold" style={{ color: colors.bg }}>
                {node.strength}%
              </span>
            </div>
            
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-white text-lg leading-tight">
                {cleanText(node.label)}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span 
                  className="text-xs font-medium px-2 py-0.5 rounded-full capitalize"
                  style={{ background: `${colors.bg}25`, color: colors.bg }}
                >
                  {node.type}
                </span>
                <span className="text-xs text-gray-500 capitalize">{node.status}</span>
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
          <div className="px-4 pb-4">
            <div className="h-2 bg-gray-800/60 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${node.strength}%` }}
                className={`h-full bg-gradient-to-r ${colors.gradient}`}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Description */}
          {node.description && (
            <div className="px-4 pb-4">
              <p className="text-sm text-gray-300 leading-relaxed">
                {cleanText(node.description)}
              </p>
            </div>
          )}

          {/* Hint - Click to work */}
          <div className="px-4 pb-4">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <p className="text-xs text-gray-400 text-center">
                💡 Click this node to open the work environment
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
