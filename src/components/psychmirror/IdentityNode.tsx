import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { motion } from 'framer-motion';
import type { NodeType, NodeStatus } from '../../types';
import { Target, Zap, Trophy, Heart, AlertCircle, Sparkles } from 'lucide-react';

interface IdentityNodeProps {
  data: {
    label: string;
    type: NodeType;
    strength: number;
    status: NodeStatus;
    description?: string;
    hasDailyAction?: boolean;
  };
  selected?: boolean;
}

const getNodeIcon = (type: NodeType) => {
  switch (type) {
    case 'habit':
      return Zap;
    case 'goal':
      return Target;
    case 'trait':
      return Trophy;
    case 'emotion':
      return Heart;
    case 'struggle':
      return AlertCircle;
    case 'interest':
      return Sparkles;
  }
};

const getNodeColor = (type: NodeType) => {
  switch (type) {
    case 'habit':
      return { from: '#10b981', to: '#059669' }; // green
    case 'goal':
      return { from: '#3b82f6', to: '#2563eb' }; // blue
    case 'trait':
      return { from: '#a855f7', to: '#9333ea' }; // purple
    case 'emotion':
      return { from: '#f59e0b', to: '#d97706' }; // orange
    case 'struggle':
      return { from: '#ef4444', to: '#dc2626' }; // red
    case 'interest':
      return { from: '#06b6d4', to: '#0891b2' }; // cyan
  }
};

const getStatusEmoji = (status: NodeStatus) => {
  switch (status) {
    case 'mastered':
      return '💚';
    case 'active':
      return '⚡';
    case 'developing':
      return '🌱';
    case 'neglected':
      return '💤';
  }
};

export const IdentityNode = memo(({ data, selected }: IdentityNodeProps) => {
  const Icon = getNodeIcon(data.type);
  const color = getNodeColor(data.type);
  const opacity = data.strength / 100;

  // Size based on strength
  const size = 80 + (data.strength / 100) * 40; // 80-120px

  // Clean and truncate label to 2-3 words max
  const cleanLabel = data.label.replace(/\*/g, '').replace(/\*\*/g, '').trim();
  const truncatedLabel = cleanLabel.split(' ').slice(0, 3).join(' ');

  return (
    <>
      <Handle type="target" position={Position.Top} className="opacity-0" />

      <motion.div
        initial={{ scale: 0 }}
        animate={{
          scale: selected ? 1.1 : 1,
          boxShadow: selected
            ? `0 0 50px rgba(168, 85, 247, 0.8), 0 0 100px rgba(168, 85, 247, 0.4), inset 0 0 30px rgba(168, 85, 247, 0.2)`
            : data.status === 'active'
            ? `0 0 20px ${color.from}40`
            : 'none'
        }}
        transition={{
          duration: 0.3,
          type: selected ? 'spring' : 'tween',
          stiffness: selected ? 300 : undefined
        }}
        style={{
          width: size,
          height: size,
          opacity: Math.max(opacity, 0.3)
        }}
        className={`rounded-full flex flex-col items-center justify-center cursor-pointer relative
          ${data.status === 'active' ? 'animate-pulse-slow' : ''}
          ${selected ? 'ring-6 ring-purple-400 ring-opacity-70 shadow-2xl animate-pulse' : ''}
        `}
      >
        {/* Selected Node Indicator */}
        {selected && (
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-purple-300 border-opacity-60"
            style={{
              width: size + 16,
              height: size + 16,
              marginLeft: -8,
              marginTop: -8,
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{
              scale: 1.1,
              opacity: 0.8,
              borderColor: ['rgba(196, 181, 253, 0.8)', 'rgba(168, 85, 247, 0.6)', 'rgba(196, 181, 253, 0.8)']
            }}
            transition={{
              duration: 0.5,
              borderColor: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
            }}
          />
        )}

        {/* Daily Action Indicator Ring */}
        {data.hasDailyAction && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-dashed border-blue-400"
            style={{
              width: size + 20,
              height: size + 20,
              marginLeft: -10,
              marginTop: -10,
            }}
            animate={{
              borderColor: ['rgba(59, 130, 246, 0.8)', 'rgba(59, 130, 246, 0.3)', 'rgba(59, 130, 246, 0.8)'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        )}

        {/* Gradient background */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `linear-gradient(135deg, ${color.from}, ${color.to})`,
            opacity: opacity
          }}
        />

        {/* Glow effect for mastered nodes */}
        {data.status === 'mastered' && (
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-full blur-xl"
            style={{
              background: `linear-gradient(135deg, ${color.from}, ${color.to})`
            }}
          />
        )}

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center gap-1">
          <Icon size={size * 0.3} className="text-white" />
          <span className="text-xs font-semibold text-center px-2 text-white leading-tight">
            {truncatedLabel}
          </span>
        </div>

        {/* Status indicator */}
        <div className="absolute -top-1 -right-1 text-lg">
          {getStatusEmoji(data.status)}
        </div>

        {/* Strength indicator */}
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-xs font-bold text-white bg-black/50 px-2 py-0.5 rounded-full">
          {data.strength}%
        </div>
      </motion.div>

      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </>
  );
});

IdentityNode.displayName = 'IdentityNode';
