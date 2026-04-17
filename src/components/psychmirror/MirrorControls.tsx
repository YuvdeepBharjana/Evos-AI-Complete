import { ZoomIn, ZoomOut, Maximize2, Sparkles, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import type { NodeType } from '../../types';

interface MirrorControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  selectedFilter: NodeType | 'all';
  onFilterChange: (filter: NodeType | 'all') => void;
}

const FILTER_COLORS: Record<string, string> = {
  all: '#8b5cf6',
  goal: '#3b82f6',
  habit: '#10b981',
  trait: '#a855f7',
  emotion: '#f59e0b',
  struggle: '#ef4444',
  interest: '#06b6d4',
};

export const MirrorControls = ({
  onZoomIn,
  onZoomOut,
  onFitView,
  selectedFilter,
  onFilterChange
}: MirrorControlsProps) => {
  const filters: Array<{ label: string; value: NodeType | 'all' }> = [
    { label: 'All', value: 'all' },
    { label: 'Goals', value: 'goal' },
    { label: 'Habits', value: 'habit' },
    { label: 'Traits', value: 'trait' },
    { label: 'Emotions', value: 'emotion' },
    { label: 'Struggles', value: 'struggle' }
  ];

  return (
    <div className="absolute top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 z-10 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 pointer-events-none">
      {/* Filter Controls - Scrollable on mobile */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="pointer-events-auto overflow-x-auto scrollbar-hide"
        style={{
          background: 'linear-gradient(135deg, rgba(15,15,25,0.9) 0%, rgba(25,25,40,0.85) 100%)',
          backdropFilter: 'blur(20px)',
          borderRadius: '12px',
          border: '1px solid rgba(139, 92, 246, 0.15)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
          padding: '6px',
        }}
      >
        <div className="flex items-center gap-1 min-w-max">
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 text-gray-400 text-sm">
            <Sparkles size={14} className="text-purple-400" />
            <span className="font-medium text-xs">Filter:</span>
          </div>
          <div className="sm:hidden flex items-center px-2 py-1.5 text-gray-400">
            <Filter size={14} className="text-purple-400" />
          </div>
          {filters.map((filter) => {
            const isActive = selectedFilter === filter.value;
            const color = FILTER_COLORS[filter.value];
            return (
              <motion.button
                key={filter.value}
                onClick={() => onFilterChange(filter.value)}
                className="relative px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap"
                style={{
                  background: isActive 
                    ? `linear-gradient(135deg, ${color}30 0%, ${color}15 100%)`
                    : 'transparent',
                  color: isActive ? 'white' : 'rgba(255,255,255,0.6)',
                  border: isActive ? `1px solid ${color}50` : '1px solid transparent',
                  boxShadow: isActive ? `0 0 20px ${color}20` : 'none',
                }}
                whileHover={{ 
                  background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
                  color: 'white',
                }}
                whileTap={{ scale: 0.95 }}
              >
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-lg sm:rounded-xl"
                    style={{ 
                      background: `linear-gradient(135deg, ${color}15 0%, transparent 100%)`,
                    }}
                    layoutId="activeFilter"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{filter.label}</span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Right Controls */}
      <div className="flex gap-2 pointer-events-auto self-end sm:self-auto">
        {/* Zoom Controls */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex gap-1"
          style={{
            background: 'linear-gradient(135deg, rgba(15,15,25,0.9) 0%, rgba(25,25,40,0.85) 100%)',
            backdropFilter: 'blur(20px)',
            borderRadius: '10px',
            border: '1px solid rgba(139, 92, 246, 0.15)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
            padding: '4px',
          }}
        >
          <motion.button
            onClick={onZoomIn}
            className="p-2 rounded-lg transition-all"
            style={{ color: 'rgba(255,255,255,0.7)' }}
            whileHover={{ 
              background: 'rgba(139, 92, 246, 0.2)',
              color: 'white',
            }}
            whileTap={{ scale: 0.9 }}
            title="Zoom In"
          >
            <ZoomIn size={18} />
          </motion.button>
          <motion.button
            onClick={onZoomOut}
            className="p-2 rounded-lg transition-all"
            style={{ color: 'rgba(255,255,255,0.7)' }}
            whileHover={{ 
              background: 'rgba(139, 92, 246, 0.2)',
              color: 'white',
            }}
            whileTap={{ scale: 0.9 }}
            title="Zoom Out"
          >
            <ZoomOut size={18} />
          </motion.button>
          <motion.button
            onClick={onFitView}
            className="p-2 rounded-lg transition-all"
            style={{ color: 'rgba(255,255,255,0.7)' }}
            whileHover={{ 
              background: 'rgba(139, 92, 246, 0.2)',
              color: 'white',
            }}
            whileTap={{ scale: 0.9 }}
            title="Fit View"
          >
            <Maximize2 size={18} />
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};
