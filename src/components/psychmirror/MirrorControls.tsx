import { ZoomIn, ZoomOut, Maximize2, Filter, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import type { NodeType } from '../../types';

interface MirrorControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  selectedFilter: NodeType | 'all';
  onFilterChange: (filter: NodeType | 'all') => void;
  onAddNode?: () => void;
}

export const MirrorControls = ({
  onZoomIn,
  onZoomOut,
  onFitView,
  selectedFilter,
  onFilterChange,
  onAddNode
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
    <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start">
      {/* Filter Controls */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="glass rounded-xl p-2 flex gap-2 flex-wrap max-w-md"
      >
        <div className="flex items-center gap-2 px-2 text-gray-400 text-sm">
          <Filter size={16} />
          <span>Filter:</span>
        </div>
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => onFilterChange(filter.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              selectedFilter === filter.value
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                : 'hover:bg-white/10 text-gray-300'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </motion.div>

      {/* Right Controls */}
      <div className="flex gap-2">
        {/* Add Node Button */}
        {onAddNode && (
          <motion.button
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            onClick={onAddNode}
            className="glass rounded-xl px-4 py-2 flex items-center gap-2 hover:bg-white/10 transition-colors text-sm font-medium"
          >
            <Plus size={18} />
            Add Node
          </motion.button>
        )}

        {/* Zoom Controls */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="glass rounded-xl p-2 flex gap-2"
        >
          <button
            onClick={onZoomIn}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={20} />
          </button>
          <button
            onClick={onZoomOut}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={20} />
          </button>
          <button
            onClick={onFitView}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Fit View"
          >
            <Maximize2 size={20} />
          </button>
        </motion.div>
      </div>
    </div>
  );
};

