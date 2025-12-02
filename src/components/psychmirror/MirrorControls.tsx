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
      {/* Compact Filter Controls */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="bg-black/40 backdrop-blur-sm rounded-lg px-3 py-2 flex gap-2"
      >
        <div className="flex items-center gap-2 text-gray-400 text-xs">
          <Filter size={14} />
        </div>
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => onFilterChange(filter.value)}
            className={`px-2 py-1 rounded text-xs font-medium transition-all ${
              selectedFilter === filter.value
                ? 'bg-purple-500 text-white'
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
            onClick={onAddNode}
            className="bg-black/40 backdrop-blur-sm rounded-lg p-2 hover:bg-white/10 transition-colors"
            title="Add Node"
          >
            <Plus size={16} className="text-purple-300" />
          </motion.button>
        )}

        {/* Compact Zoom Controls */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-black/40 backdrop-blur-sm rounded-lg p-2 flex gap-1"
        >
          <button
            onClick={onZoomIn}
            className="p-1.5 hover:bg-white/10 rounded transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </button>
          <button
            onClick={onZoomOut}
            className="p-1.5 hover:bg-white/10 rounded transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={16} />
          </button>
          <button
            onClick={onFitView}
            className="p-1.5 hover:bg-white/10 rounded transition-colors"
            title="Fit View"
          >
            <Maximize2 size={16} />
          </button>
        </motion.div>
      </div>
    </div>
  );
};
