import { memo, useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Zap, Trophy, Heart, AlertCircle, Sparkles } from 'lucide-react';
import type { NodeType, NodeStatus } from '../../types';

interface IdentityNodeProps {
  data: {
    label: string;
    type: NodeType;
    strength: number;
    status: NodeStatus;
    description?: string;
    strengthChange?: number;
    hasDailyAction?: boolean;
  };
  selected?: boolean;
}

const NODE_COLORS: Record<string, { primary: string; glow: string; gradient: string }> = {
  habit: { 
    primary: '#10b981', 
    glow: 'rgba(16, 185, 129, 0.6)', 
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
  },
  goal: { 
    primary: '#3b82f6', 
    glow: 'rgba(59, 130, 246, 0.6)', 
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
  },
  trait: { 
    primary: '#a855f7', 
    glow: 'rgba(168, 85, 247, 0.6)', 
    gradient: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)'
  },
  emotion: { 
    primary: '#f59e0b', 
    glow: 'rgba(245, 158, 11, 0.6)', 
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
  },
  struggle: { 
    primary: '#ef4444', 
    glow: 'rgba(239, 68, 68, 0.6)', 
    gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
  },
  interest: { 
    primary: '#06b6d4', 
    glow: 'rgba(6, 182, 212, 0.6)', 
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)'
  },
};

const NODE_ICONS: Record<string, any> = {
  goal: Target,
  habit: Zap,
  trait: Trophy,
  emotion: Heart,
  struggle: AlertCircle,
  interest: Sparkles,
};

const cleanLabel = (label: string): string => {
  return label.replace(/\*\*/g, '').replace(/\*/g, '').replace(/\_\_/g, '').replace(/\_/g, '').trim();
};

// Truncate to max 2-3 words for display
const truncateLabel = (label: string): string => {
  const cleaned = cleanLabel(label);
  const words = cleaned.split(' ').filter(w => w.length > 0);
  if (words.length <= 3) return cleaned;
  return words.slice(0, 2).join(' ');
};

export const IdentityNode = memo(({ data, selected }: IdentityNodeProps) => {
  const fullLabel = cleanLabel(data?.label || 'Unknown');
  const nodeLabel = truncateLabel(data?.label || 'Unknown');
  const nodeType = data?.type || 'trait';
  const nodeStrength = typeof data?.strength === 'number' ? data.strength : 50;
  const nodeStatus = data?.status || 'developing';
  const hasDailyAction = data?.hasDailyAction || false;
  
  const colors = NODE_COLORS[nodeType] || NODE_COLORS.trait;
  const Icon = NODE_ICONS[nodeType] || Trophy;
  const [showChange, setShowChange] = useState(false);
  const [displayedChange, setDisplayedChange] = useState<number | null>(null);
  
  // Consistent node size for all nodes
  const nodeSize = 110;
  
  // Detect strength changes
  useEffect(() => {
    if (data.strengthChange && data.strengthChange !== 0) {
      setDisplayedChange(data.strengthChange);
      setShowChange(true);
      const timer = setTimeout(() => setShowChange(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [data?.strengthChange]);

  return (
    <>
      <Handle 
        type="target" 
        position={Position.Top} 
        className="opacity-0"
        style={{ top: 30, left: '50%' }}
      />
      <Handle 
        type="target" 
        position={Position.Left} 
        className="opacity-0"
        style={{ left: 30, top: '50%' }}
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="opacity-0"
        style={{ bottom: 30, left: '50%' }}
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        className="opacity-0"
        style={{ right: 30, top: '50%' }}
      />
      
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="relative cursor-pointer group flex items-center justify-center"
        style={{ width: nodeSize + 60, height: nodeSize + 60 }}
      >
        {/* Strength change popup - above node */}
        <AnimatePresence>
          {showChange && displayedChange !== null && displayedChange !== 0 && (
            <motion.div
              initial={{ opacity: 0, y: 0, scale: 0.5 }}
              animate={{ opacity: 1, y: -40, scale: 1 }}
              exit={{ opacity: 0, y: -60, scale: 0.5 }}
              className="absolute left-1/2 top-0 -translate-x-1/2 z-50"
            >
              <div className={`px-2 py-1 rounded-full text-xs font-bold shadow-lg ${
                displayedChange > 0 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
              }`}>
                {displayedChange > 0 ? '+' : ''}{displayedChange}%
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Daily Action indicator - "TODAY" badge - outside top right, very close */}
        {hasDailyAction && (
          <motion.div
            className="absolute z-50 pointer-events-none"
            style={{
              right: 5,
              top: 0,
            }}
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div 
              className="px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider"
              style={{
                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                color: '#000',
                boxShadow: '0 4px 12px rgba(251, 191, 36, 0.6)',
              }}
            >
              Today
            </div>
          </motion.div>
        )}



        {/* Main node orb */}
        <motion.div
          className="rounded-full overflow-hidden relative"
          style={{
            width: nodeSize,
            height: nodeSize,
            background: 'rgba(20, 20, 30, 0.8)',
            border: `3px solid ${colors.primary}`,
            boxShadow: hasDailyAction 
              ? `0 0 30px ${colors.glow}, 0 0 60px ${colors.glow}, 0 0 90px ${colors.glow}50`
              : `0 0 20px ${colors.glow}`,
          }}
          animate={hasDailyAction ? {
            boxShadow: [
              `0 0 30px ${colors.glow}, 0 0 60px ${colors.glow}, 0 0 90px ${colors.glow}50`,
              `0 0 40px ${colors.glow}, 0 0 80px ${colors.glow}, 0 0 120px ${colors.glow}70`,
              `0 0 30px ${colors.glow}, 0 0 60px ${colors.glow}, 0 0 90px ${colors.glow}50`,
            ]
          } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {/* Strength fill from bottom - circular progress */}
          <div
            className="absolute bottom-0 left-0 right-0 transition-all duration-300"
            style={{
              height: `${nodeStrength}%`,
              background: colors.gradient,
              borderRadius: nodeStrength >= 95 ? '100%' : '0 0 100% 100%',
            }}
          />
          
          {/* Content inside node */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center z-10">
            {/* Icon at top */}
            <Icon 
              size={nodeSize * 0.22} 
              className="text-white mb-1.5"
              strokeWidth={2.5}
            />
            
            {/* Node label */}
            <div 
              className="font-bold text-white leading-tight mb-1 px-1"
              style={{ 
                fontSize: nodeSize * 0.11,
                maxWidth: '85%',
                wordBreak: 'break-word',
                lineHeight: '1.1',
              }}
            >
              {nodeLabel}
            </div>
            
            {/* Percentage */}
            <div 
              className="font-bold text-white"
              style={{ 
                fontSize: nodeSize * 0.14,
              }}
            >
              {Math.round(nodeStrength)}%
            </div>
          </div>
        </motion.div>

      </motion.div>
    </>
  );
});

IdentityNode.displayName = 'IdentityNode';
