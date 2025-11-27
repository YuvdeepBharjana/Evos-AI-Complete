import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { motion } from 'framer-motion';
import type { NodeType, NodeStatus } from '../../types';
import { Target, Trophy, Heart, Zap, AlertCircle } from 'lucide-react';

interface IdentityNodeProps {
  data: {
    label: string;
    type: NodeType;
    strength: number;
    status: NodeStatus;
    description?: string;
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

  return (
    <>
      <Handle type="target" position={Position.Top} className="opacity-0" />
      
      <motion.div
        initial={{ scale: 0 }}
        animate={{ 
          scale: 1,
          boxShadow: selected 
            ? `0 0 30px rgba(168, 85, 247, 0.6)`
            : data.status === 'active'
            ? `0 0 20px ${color.from}40`
            : 'none'
        }}
        transition={{ duration: 0.3 }}
        style={{
          width: size,
          height: size,
          opacity: Math.max(opacity, 0.3)
        }}
        className={`rounded-full flex flex-col items-center justify-center cursor-pointer relative
          ${data.status === 'active' ? 'animate-pulse-slow' : ''}
          ${selected ? 'ring-4 ring-purple-500' : ''}
        `}
      >
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
          <span className="text-xs font-semibold text-center px-2 text-white">
            {data.label}
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

