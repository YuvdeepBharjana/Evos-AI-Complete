import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { motion } from 'framer-motion';

interface GrowthCoreNodeProps {
  data: {
    totalNodes: number;
    avgStrength: number;
    masteredCount: number;
    level: number;
  };
  selected?: boolean;
}

export const GrowthCoreNode = memo(({ data, selected }: GrowthCoreNodeProps) => {
  const { totalNodes, avgStrength, masteredCount, level } = data;
  
  const coreSize = 120;

  return (
    <div className="relative" style={{ width: coreSize + 60, height: coreSize + 60 }}>
      {/* Connection handles */}
      <Handle type="source" position={Position.Top} className="opacity-0" />
      <Handle type="source" position={Position.Right} className="opacity-0" />
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
      <Handle type="source" position={Position.Left} className="opacity-0" />
      <Handle type="target" position={Position.Top} id="top" className="opacity-0" />
      <Handle type="target" position={Position.Right} id="right" className="opacity-0" />
      <Handle type="target" position={Position.Bottom} id="bottom" className="opacity-0" />
      <Handle type="target" position={Position.Left} id="left" className="opacity-0" />

      {/* Outer ring */}
      <div
        className="absolute rounded-full"
        style={{
          width: coreSize + 40,
          height: coreSize + 40,
          left: 10,
          top: 10,
          border: '1px solid rgba(139, 92, 246, 0.3)',
        }}
      />

      {/* Main core sphere */}
      <motion.div
        className="absolute cursor-pointer rounded-full overflow-hidden"
        style={{
          width: coreSize,
          height: coreSize,
          left: 30,
          top: 30,
          background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #3b82f6 100%)',
          border: selected ? '2px solid white' : '1px solid rgba(255,255,255,0.3)',
        }}
        whileHover={{ scale: 1.05 }}
      >
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="text-3xl font-black text-white">
            {level}
          </div>
          <div className="text-[10px] font-bold text-white/80 uppercase tracking-wider">
            Growth
          </div>
          <div className="text-[8px] font-semibold text-white/60 uppercase tracking-widest">
            Core
          </div>
        </div>
      </motion.div>

      {/* Stats badges */}
      <div 
        className="absolute px-2 py-1 rounded-full bg-black/70 border border-white/10"
        style={{ top: 0, left: '50%', transform: 'translateX(-50%)' }}
      >
        <span className="text-[10px] font-medium text-white/80">{totalNodes} nodes</span>
      </div>
      
      <div 
        className="absolute px-2 py-1 rounded-full bg-black/70 border border-white/10"
        style={{ bottom: 0, left: '50%', transform: 'translateX(-50%)' }}
      >
        <span className="text-[10px] font-medium text-emerald-400">{avgStrength}% strength</span>
      </div>
      
      <div 
        className="absolute px-2 py-1 rounded-full bg-black/70 border border-white/10"
        style={{ right: -10, top: '50%', transform: 'translateY(-50%)' }}
      >
        <span className="text-[10px] font-medium text-purple-400">{masteredCount} mastered</span>
      </div>
    </div>
  );
});

GrowthCoreNode.displayName = 'GrowthCoreNode';
