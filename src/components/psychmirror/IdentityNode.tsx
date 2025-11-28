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
    strengthChange?: number; // +X or -X when strength changes
  };
  selected?: boolean;
}

const getNodeColor = (type: NodeType): { primary: string; glow: string; ring: string } => {
  switch (type) {
    case 'habit':
      return { primary: '#10b981', glow: 'rgba(16, 185, 129, 0.4)', ring: 'rgba(16, 185, 129, 0.6)' };
    case 'goal':
      return { primary: '#3b82f6', glow: 'rgba(59, 130, 246, 0.4)', ring: 'rgba(59, 130, 246, 0.6)' };
    case 'trait':
      return { primary: '#a855f7', glow: 'rgba(168, 85, 247, 0.4)', ring: 'rgba(168, 85, 247, 0.6)' };
    case 'emotion':
      return { primary: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)', ring: 'rgba(245, 158, 11, 0.6)' };
    case 'struggle':
      return { primary: '#ef4444', glow: 'rgba(239, 68, 68, 0.4)', ring: 'rgba(239, 68, 68, 0.6)' };
  }
};

const getStatusIndicator = (status: NodeStatus): { symbol: string; animation: boolean } => {
  switch (status) {
    case 'mastered':
      return { symbol: '●', animation: true };
    case 'active':
      return { symbol: '◉', animation: true };
    case 'developing':
      return { symbol: '○', animation: false };
    case 'neglected':
      return { symbol: '◌', animation: false };
  }
};

export const IdentityNode = memo(({ data, selected }: IdentityNodeProps) => {
  const color = getNodeColor(data.type);
  const status = getStatusIndicator(data.status);
  const [showChange, setShowChange] = useState(false);
  const [displayedChange, setDisplayedChange] = useState<number | null>(null);
  const [prevStrength, setPrevStrength] = useState(data.strength);
  
  // Detect strength changes and show animation
  useEffect(() => {
    if (data.strength !== prevStrength) {
      const change = data.strength - prevStrength;
      setDisplayedChange(change);
      setShowChange(true);
      setPrevStrength(data.strength);
      
      // Hide the animation after 2.5 seconds
      const timer = setTimeout(() => {
        setShowChange(false);
      }, 2500);
      
      return () => clearTimeout(timer);
    }
  }, [data.strength, prevStrength]);

  // Also show if strengthChange prop is provided
  useEffect(() => {
    if (data.strengthChange && data.strengthChange !== 0) {
      setDisplayedChange(data.strengthChange);
      setShowChange(true);
      
      const timer = setTimeout(() => {
        setShowChange(false);
      }, 2500);
      
      return () => clearTimeout(timer);
    }
  }, [data.strengthChange]);
  
  // Neural soma (cell body) - size based on strength
  const somaSize = 50 + (data.strength / 100) * 30; // 50-80px
  
  // Dendrite count based on strength
  const dendriteCount = Math.floor((data.strength / 100) * 4) + 2; // 2-6 dendrites
  
  return (
    <>
      {/* Invisible handles for connections */}
      <Handle type="target" position={Position.Top} className="opacity-0 !bg-transparent" />
      <Handle type="target" position={Position.Left} className="opacity-0 !bg-transparent" />
      <Handle type="source" position={Position.Bottom} className="opacity-0 !bg-transparent" />
      <Handle type="source" position={Position.Right} className="opacity-0 !bg-transparent" />
      
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: selected ? 1.2 : 1, 
          opacity: 1 
        }}
        transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}
        className={`relative cursor-pointer group ${selected ? 'z-50' : 'z-10'}`}
        style={{ width: somaSize + 40, height: somaSize + 40 }}
      >
        {/* STRENGTH CHANGE ANIMATION */}
        <AnimatePresence>
          {showChange && displayedChange !== null && displayedChange !== 0 && (
            <motion.div
              initial={{ opacity: 0, y: 0, scale: 0.5 }}
              animate={{ opacity: 1, y: -40, scale: 1 }}
              exit={{ opacity: 0, y: -60, scale: 0.8 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="absolute left-1/2 -translate-x-1/2 -top-2 z-[100] pointer-events-none"
            >
              <div 
                className={`px-3 py-1.5 rounded-full font-bold text-sm whitespace-nowrap shadow-lg ${
                  displayedChange > 0 
                    ? 'bg-green-500 text-white' 
                    : 'bg-red-500 text-white'
                }`}
                style={{
                  boxShadow: displayedChange > 0 
                    ? '0 0 20px rgba(34, 197, 94, 0.6), 0 4px 12px rgba(0,0,0,0.3)' 
                    : '0 0 20px rgba(239, 68, 68, 0.6), 0 4px 12px rgba(0,0,0,0.3)'
                }}
              >
                {displayedChange > 0 ? '+' : ''}{displayedChange}%
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sparkle effect on positive change */}
        <AnimatePresence>
          {showChange && displayedChange !== null && displayedChange > 0 && (
            <>
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    opacity: 1, 
                    scale: 0,
                    x: 0,
                    y: 0 
                  }}
                  animate={{ 
                    opacity: 0, 
                    scale: 1,
                    x: Math.cos(i * Math.PI / 3) * 50,
                    y: Math.sin(i * Math.PI / 3) * 50 - 20
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, delay: i * 0.05 }}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                >
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: color.primary }}
                  />
                </motion.div>
              ))}
            </>
          )}
        </AnimatePresence>

        {/* SELECTED STATE - Visible outer glow rings */}
        {selected && (
          <>
            {/* Outer pulse ring */}
            <motion.div
              className="absolute rounded-full pointer-events-none"
              style={{
                left: '50%',
                top: '50%',
                width: somaSize + 50,
                height: somaSize + 50,
                transform: 'translate(-50%, -50%)',
                border: `2px solid ${color.primary}`,
                boxShadow: `0 0 25px ${color.primary}50`,
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.6, 0.2, 0.6],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* Inner glow ring */}
            <motion.div
              className="absolute rounded-full pointer-events-none"
              style={{
                left: '50%',
                top: '50%',
                width: somaSize + 30,
                height: somaSize + 30,
                transform: 'translate(-50%, -50%)',
                border: `3px solid ${color.primary}`,
                boxShadow: `0 0 20px ${color.primary}60, inset 0 0 15px ${color.primary}30`,
              }}
              animate={{
                opacity: [0.8, 1, 0.8],
              }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* Glow background */}
            <motion.div
              className="absolute rounded-full pointer-events-none"
              style={{
                left: '50%',
                top: '50%',
                width: somaSize + 60,
                height: somaSize + 60,
                transform: 'translate(-50%, -50%)',
                background: `radial-gradient(circle, ${color.primary}30, transparent 70%)`,
              }}
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </>
        )}

        {/* Dendrites - neural branches emanating from the soma */}
        {Array.from({ length: dendriteCount }).map((_, i) => {
          const angle = (i / dendriteCount) * Math.PI * 2;
          const length = 15 + (data.strength / 100) * 10;
          
          return (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: '50%',
                top: '50%',
                width: selected ? 2 : 2,
                height: selected ? length * 1.15 : length,
                background: `linear-gradient(to top, ${color.primary}${selected ? 'aa' : ''}, transparent)`,
                transformOrigin: 'bottom center',
                transform: `translateX(-50%) rotate(${angle}rad) translateY(-${somaSize / 2 + 5}px)`,
                opacity: selected ? 0.7 : 0.6,
              }}
              animate={selected || status.animation ? {
                opacity: selected ? [0.5, 0.7, 0.5] : [0.4, 0.8, 0.4],
              } : {}}
              transition={{ duration: selected ? 1.5 : 2, repeat: Infinity, delay: i * 0.1 }}
            >
              {/* Synapse terminal bulb */}
              <motion.div
                className="absolute -top-1 left-1/2 -translate-x-1/2 rounded-full"
                style={{ 
                  backgroundColor: color.primary,
                  width: selected ? 8 : 8,
                  height: selected ? 8 : 8,
                  boxShadow: selected ? `0 0 6px ${color.primary}50` : 'none',
                }}
                animate={selected || status.animation ? {
                  scale: selected ? [1, 1.2, 1] : [0.8, 1.2, 0.8],
                } : {}}
                transition={{ duration: selected ? 1.5 : 2, repeat: Infinity, delay: i * 0.1 }}
              />
            </motion.div>
          );
        })}

        {/* Outer glow ring - signal strength (non-selected) */}
        {!selected && (data.status === 'mastered' || data.status === 'active') && (
          <motion.div
            className="absolute rounded-full"
            style={{
              left: '50%',
              top: '50%',
              width: somaSize + 20,
              height: somaSize + 20,
              transform: 'translate(-50%, -50%)',
              border: `2px solid ${color.ring}`,
              boxShadow: `0 0 20px ${color.glow}, inset 0 0 10px ${color.glow}`,
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.6, 0.9, 0.6],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        )}

        {/* Neural soma (cell body) */}
        <motion.div
          className="absolute rounded-full flex flex-col items-center justify-center overflow-hidden"
          style={{
            left: '50%',
            top: '50%',
            width: somaSize,
            height: somaSize,
            transform: 'translate(-50%, -50%)',
            background: `${color.primary}20`,
            boxShadow: selected 
              ? `0 0 30px ${color.primary}80, 0 0 60px ${color.primary}50, inset 0 0 20px ${color.primary}30`
              : `0 0 15px ${color.glow}`,
            border: selected ? `3px solid white` : `2px solid ${color.primary}60`,
          }}
          animate={selected ? {
            boxShadow: [
              `0 0 30px ${color.primary}80, 0 0 60px ${color.primary}50, inset 0 0 20px ${color.primary}30`,
              `0 0 40px ${color.primary}90, 0 0 80px ${color.primary}60, inset 0 0 25px ${color.primary}40`,
              `0 0 30px ${color.primary}80, 0 0 60px ${color.primary}50, inset 0 0 20px ${color.primary}30`,
            ]
          } : {}}
          transition={selected ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 }}
          whileHover={!selected ? {
            scale: 1.1,
            boxShadow: `0 0 25px ${color.primary}50, 0 0 40px ${color.glow}`,
          } : {}}
        >
          {/* Fill level based on strength percentage */}
          <motion.div 
            className="absolute bottom-0 left-0 right-0"
            style={{
              height: `${data.strength}%`,
              background: selected 
                ? `linear-gradient(to top, ${color.primary}, ${color.primary}ee)`
                : `linear-gradient(to top, ${color.primary}dd, ${color.primary}99)`,
              borderRadius: '0 0 50% 50%',
            }}
            animate={selected ? {
              opacity: [0.9, 1, 0.9],
            } : {
              height: `${data.strength}%`
            }}
            transition={selected ? { duration: 1, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.5 }}
          />
          
          {/* Subtle gradient overlay for depth */}
          <div 
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15), transparent 60%)`,
            }}
          />
          
          {/* Nucleus - strength percentage */}
          <div 
            className="absolute rounded-full flex items-center justify-center font-bold z-10"
            style={{
              backgroundColor: 'rgba(0,0,0,0.6)',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: selected ? 26 : 22,
              height: selected ? 26 : 22,
              fontSize: selected ? 10 : 9,
              color: 'white',
              border: `1px solid rgba(255,255,255,0.2)`,
            }}
          >
            {data.strength}
          </div>
        </motion.div>

        {/* Label card - always visible when selected */}
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="absolute left-1/2 -translate-x-1/2 -bottom-4 translate-y-full z-50 pointer-events-none"
          >
            <div 
              className="px-4 py-2.5 rounded-xl whitespace-nowrap text-center"
              style={{
                backgroundColor: 'rgba(0,0,0,0.95)',
                border: `2px solid ${color.primary}`,
                boxShadow: `0 0 20px ${color.primary}40, 0 8px 24px rgba(0,0,0,0.6)`,
              }}
            >
              <div className="text-sm font-bold text-white">{data.label}</div>
              <div className="text-xs text-gray-300 mt-1 flex items-center justify-center gap-2">
                <span 
                  className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                  style={{ backgroundColor: `${color.primary}30`, color: color.primary }}
                >
                  {data.status.toUpperCase()}
                </span>
                <span className="font-bold" style={{ color: color.primary }}>{data.strength}%</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Hover label (only when not selected) */}
        {!selected && (
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 translate-y-full z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div 
              className="px-3 py-2 rounded-lg whitespace-nowrap text-center"
              style={{
                backgroundColor: 'rgba(0,0,0,0.9)',
                border: `1px solid ${color.primary}50`,
              }}
            >
              <div className="text-xs font-semibold text-white">{data.label}</div>
              <div className="text-[10px] text-gray-400 mt-0.5 flex items-center justify-center gap-1">
                <span style={{ color: color.primary }}>{status.symbol}</span>
                <span className="capitalize">{data.status}</span>
                <span>•</span>
                <span>{data.strength}%</span>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </>
  );
});

IdentityNode.displayName = 'IdentityNode';
