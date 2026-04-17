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
  
  const coreSize = 140;

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

      {/* Outer glow ring */}
      <motion.div
        className="absolute rounded-full"
        animate={{
          boxShadow: [
            '0 0 30px rgba(139, 92, 246, 0.3), 0 0 60px rgba(99, 102, 241, 0.2)',
            '0 0 40px rgba(139, 92, 246, 0.5), 0 0 80px rgba(99, 102, 241, 0.3)',
            '0 0 30px rgba(139, 92, 246, 0.3), 0 0 60px rgba(99, 102, 241, 0.2)',
          ],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          width: coreSize + 40,
          height: coreSize + 40,
          left: 10,
          top: 10,
          border: '1px solid rgba(139, 92, 246, 0.4)',
        }}
      />

      {/* 3D Spherical Core */}
      <motion.div
        className="absolute cursor-pointer rounded-full overflow-hidden"
        style={{
          width: coreSize,
          height: coreSize,
          left: 30,
          top: 30,
          // 3D sphere effect using multiple gradients
          background: `
            radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0%, transparent 40%),
            radial-gradient(circle at 70% 70%, rgba(0,0,0,0.4) 0%, transparent 40%),
            radial-gradient(circle at 50% 50%, #8b5cf6 0%, #6366f1 40%, #4f46e5 70%, #3730a3 100%)
          `,
          boxShadow: selected 
            ? `
                inset -8px -8px 20px rgba(0,0,0,0.5),
                inset 8px 8px 20px rgba(255,255,255,0.15),
                0 0 40px rgba(139, 92, 246, 0.6),
                0 0 0 3px white
              `
            : `
                inset -8px -8px 20px rgba(0,0,0,0.5),
                inset 8px 8px 20px rgba(255,255,255,0.15),
                0 8px 32px rgba(0,0,0,0.4)
              `,
          border: '1px solid rgba(255,255,255,0.2)',
        }}
        whileHover={{ 
          scale: 1.08,
          boxShadow: `
            inset -8px -8px 20px rgba(0,0,0,0.5),
            inset 8px 8px 20px rgba(255,255,255,0.15),
            0 0 50px rgba(139, 92, 246, 0.7),
            0 12px 40px rgba(0,0,0,0.5)
          `
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {/* Highlight shine effect */}
        <div 
          className="absolute rounded-full"
          style={{
            width: '40%',
            height: '25%',
            top: '12%',
            left: '15%',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.1) 100%)',
            filter: 'blur(4px)',
            borderRadius: '50%',
            transform: 'rotate(-20deg)',
          }}
        />
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <motion.div 
            className="text-4xl font-black text-white drop-shadow-lg"
            animate={{ 
              textShadow: [
                '0 0 10px rgba(255,255,255,0.5)',
                '0 0 20px rgba(255,255,255,0.8)',
                '0 0 10px rgba(255,255,255,0.5)',
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {level}
          </motion.div>
          <div className="text-xs font-bold text-white/90 uppercase tracking-wider drop-shadow">
            Growth
          </div>
          <div className="text-[9px] font-semibold text-white/70 uppercase tracking-widest">
            Core
          </div>
          <div className="mt-1 text-[8px] text-cyan-300/80 font-medium">
            Click for Summary
          </div>
        </div>
      </motion.div>

      {/* Stats badges with better styling */}
      <motion.div 
        className="absolute px-3 py-1.5 rounded-full bg-black/80 border border-purple-500/30 backdrop-blur-sm"
        style={{ top: -5, left: '50%', transform: 'translateX(-50%)' }}
        whileHover={{ scale: 1.05, borderColor: 'rgba(139, 92, 246, 0.6)' }}
      >
        <span className="text-[10px] font-semibold text-white">{totalNodes} nodes</span>
      </motion.div>
      
      <motion.div 
        className="absolute px-3 py-1.5 rounded-full bg-black/80 border border-emerald-500/30 backdrop-blur-sm"
        style={{ bottom: -5, left: '50%', transform: 'translateX(-50%)' }}
        whileHover={{ scale: 1.05, borderColor: 'rgba(16, 185, 129, 0.6)' }}
      >
        <span className="text-[10px] font-semibold text-emerald-400">{avgStrength}% avg</span>
      </motion.div>
      
      <motion.div 
        className="absolute px-3 py-1.5 rounded-full bg-black/80 border border-cyan-500/30 backdrop-blur-sm"
        style={{ right: -15, top: '50%', transform: 'translateY(-50%)' }}
        whileHover={{ scale: 1.05, borderColor: 'rgba(6, 182, 212, 0.6)' }}
      >
        <span className="text-[10px] font-semibold text-cyan-400">{masteredCount} mastered</span>
      </motion.div>
    </div>
  );
});

GrowthCoreNode.displayName = 'GrowthCoreNode';
