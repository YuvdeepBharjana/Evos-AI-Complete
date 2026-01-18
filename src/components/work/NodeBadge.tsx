import { Target, Zap, Trophy, Heart, AlertCircle, Sparkles } from 'lucide-react';
import type { NodeType } from '../../types';

interface NodeBadgeProps {
  nodeName: string;
  nodeType: NodeType;
  strength: number;
}

const TYPE_CONFIG: Record<NodeType, { icon: any; color: string; gradient: string }> = {
  goal: { 
    icon: Target, 
    color: '#3b82f6', 
    gradient: 'from-blue-500 to-cyan-500' 
  },
  habit: { 
    icon: Zap, 
    color: '#10b981', 
    gradient: 'from-green-500 to-emerald-500' 
  },
  trait: { 
    icon: Trophy, 
    color: '#a855f7', 
    gradient: 'from-purple-500 to-violet-500' 
  },
  emotion: { 
    icon: Heart, 
    color: '#f59e0b', 
    gradient: 'from-orange-500 to-amber-500' 
  },
  struggle: { 
    icon: AlertCircle, 
    color: '#ef4444', 
    gradient: 'from-red-500 to-rose-500' 
  },
  interest: { 
    icon: Sparkles, 
    color: '#06b6d4', 
    gradient: 'from-cyan-500 to-teal-500' 
  },
};

export const NodeBadge = ({ nodeName, nodeType, strength }: NodeBadgeProps) => {
  const config = TYPE_CONFIG[nodeType] || TYPE_CONFIG.trait;
  const Icon = config.icon;

  return (
    <div 
      className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl border"
      style={{
        background: `linear-gradient(135deg, ${config.color}15 0%, ${config.color}05 100%)`,
        borderColor: `${config.color}30`,
      }}
    >
      <div 
        className="w-10 h-10 rounded-lg flex items-center justify-center"
        style={{ background: `${config.color}20` }}
      >
        <Icon size={20} style={{ color: config.color }} />
      </div>
      <div className="flex flex-col">
        <span className="text-white font-semibold text-sm leading-tight">{nodeName}</span>
        <div className="flex items-center gap-2 mt-0.5">
          <span 
            className="text-xs font-medium px-1.5 py-0.5 rounded capitalize"
            style={{ background: `${config.color}25`, color: config.color }}
          >
            {nodeType}
          </span>
          <span className="text-xs text-gray-500">{strength}%</span>
        </div>
      </div>
    </div>
  );
};
