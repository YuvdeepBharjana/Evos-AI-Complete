import { memo, useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { motion, AnimatePresence } from 'framer-motion';
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

const cleanLabel = (label: string): string => {
  return label.replace(/\*\*/g, '').replace(/\*/g, '').replace(/\_\_/g, '').replace(/\_/g, '').trim();
};

export const IdentityNode = memo(({ data, selected }: IdentityNodeProps) => {
  const nodeLabel = cleanLabel(data?.label || 'Unknown');
  const nodeType = data?.type || 'trait';
  const nodeStrength = typeof data?.strength === 'number' ? data.strength : 50;
  const nodeStatus = data?.status || 'developing';
  const hasDailyAction = data?.hasDailyAction || false;
  
  const colors = NODE_COLORS[nodeType] || NODE_COLORS.trait;
  const [showChange, setShowChange] = useState(false);
  const [displayedChange, setDisplayedChange] = useState<number | null>(null);
  
  // Size based on strength (40-70px)
  const nodeSize = 40 + (nodeStrength / 100) * 30;
  
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
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <Handle type="target" position={Position.Left} className="opacity-0" />
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
      <Handle type="source" position={Position.Right} className="opacity-0" />
      
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="relative cursor-pointer group"
        style={{ width: nodeSize + 20, height: nodeSize + 20 }}
      >
        {/* Strength change popup */}
        <AnimatePresence>
          {showChange && displayedChange !== null && displayedChange !== 0 && (
            <motion.div
              initial={{ opacity: 0, y: 0, scale: 0.5 }}
              animate={{ opacity: 1, y: -30, scale: 1 }}
              exit={{ opacity: 0, y: -50 }}
              className="absolute left-1/2 -translate-x-1/2 -top-2 z-50"
            >
              <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                displayedChange > 0 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
              }`}>
                {displayedChange > 0 ? '+' : ''}{displayedChange}%
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Daily Action indicator - "TODAY'S FOCUS" */}
        {hasDailyAction && (
          <>
            {/* Pulsing ring */}
            <motion.div
              className="absolute rounded-full pointer-events-none"
              style={{
                left: '50%',
                top: '50%',
                width: nodeSize + 16,
                height: nodeSize + 16,
                transform: 'translate(-50%, -50%)',
                border: '2px solid #fbbf24',
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.8, 0.3, 0.8],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            
            {/* TODAY badge */}
            <motion.div
              className="absolute z-50 pointer-events-none"
              style={{
                left: '50%',
                top: -8,
                transform: 'translateX(-50%)',
              }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div 
                className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
                style={{
                  background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                  color: '#000',
                  boxShadow: '0 2px 8px rgba(251, 191, 36, 0.4)',
                }}
              >
                Today
              </div>
            </motion.div>
          </>
        )}



        {/* Main node orb */}
        <motion.div
          className="absolute rounded-full overflow-hidden"
          style={{
            left: '50%',
            top: '50%',
            width: nodeSize,
            height: nodeSize,
            transform: 'translate(-50%, -50%)',
            background: 'transparent',
            border: `2px solid ${colors.primary}`,
          }}
          whileHover={{ scale: 1.1 }}
        >
          {/* Inner strength fill */}
          <div
            className="absolute bottom-0 left-0 right-0"
            style={{
              height: `${nodeStrength}%`,
              background: colors.gradient,
              borderRadius: nodeStrength >= 95 ? '100%' : '0 0 100% 100%',
            }}
          />
          
          {/* Center percentage */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span 
              className="font-bold text-white"
              style={{ 
                fontSize: nodeSize * 0.32,
              }}
            >
              {Math.round(nodeStrength)}
            </span>
          </div>
        </motion.div>

        {/* Selected state label card */}
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute left-1/2 -translate-x-1/2 z-50"
            style={{ top: nodeSize + 15 }}
          >
            <div 
              className="px-4 py-3 rounded-xl text-center backdrop-blur-xl min-w-[200px]"
              style={{
                background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(20,20,30,0.9) 100%)',
                border: `1px solid ${colors.primary}50`,
                boxShadow: `0 0 30px ${colors.glow}30, 0 10px 40px rgba(0,0,0,0.5)`,
              }}
            >
              <div className="text-sm font-bold text-white mb-1">{nodeLabel}</div>
              <div className="flex items-center justify-center gap-2 text-xs">
                <span 
                  className="px-2 py-0.5 rounded-full font-semibold"
                  style={{ 
                    background: `${colors.primary}30`,
                    color: colors.primary,
                  }}
                >
                  {nodeType.toUpperCase()}
                </span>
                <span className="text-gray-400">•</span>
                <span 
                  className="px-2 py-0.5 rounded-full font-semibold capitalize"
                  style={{ 
                    background: nodeStatus === 'mastered' ? 'rgba(16,185,129,0.2)' : 
                               nodeStatus === 'active' ? 'rgba(59,130,246,0.2)' : 
                               'rgba(255,255,255,0.1)',
                    color: nodeStatus === 'mastered' ? '#10b981' : 
                           nodeStatus === 'active' ? '#3b82f6' : 
                           '#888',
                  }}
                >
                  {nodeStatus}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Hover tooltip */}
        {!selected && (
          <div 
            className="absolute left-1/2 -translate-x-1/2 z-40 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            style={{ top: nodeSize + 10 }}
          >
            <div 
              className="px-3 py-2 rounded-lg text-center whitespace-nowrap backdrop-blur-md"
              style={{
                background: 'rgba(0,0,0,0.85)',
                border: `1px solid ${colors.primary}40`,
                maxWidth: '180px',
              }}
            >
              <div className="text-xs font-semibold text-white truncate">{nodeLabel}</div>
              <div className="text-[10px] text-gray-400 mt-0.5 flex items-center justify-center gap-1">
                <span style={{ color: colors.primary }}>{Math.round(nodeStrength)}%</span>
                <span>•</span>
                <span className="capitalize">{nodeStatus}</span>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </>
  );
});

IdentityNode.displayName = 'IdentityNode';
