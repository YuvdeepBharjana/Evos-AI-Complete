import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, Calendar } from 'lucide-react';
import type { IdentityNode } from '../../types';

interface NodeDetailsPanelProps {
  node: IdentityNode | null;
  onClose: () => void;
}

export const NodeDetailsPanel = ({ node, onClose }: NodeDetailsPanelProps) => {
  if (!node) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'mastered':
        return 'text-green-400';
      case 'active':
        return 'text-blue-400';
      case 'developing':
        return 'text-yellow-400';
      case 'neglected':
        return 'text-gray-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 400 }}
        animate={{ x: 0 }}
        exit={{ x: 400 }}
        transition={{ type: 'spring', damping: 25 }}
        className="fixed right-0 top-0 h-full w-96 glass border-l border-gray-700 p-6 overflow-y-auto z-50"
      >
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold gradient-text">{node.label}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Type Badge */}
          <div>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 capitalize">
              {node.type}
            </span>
          </div>

          {/* Strength */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400 flex items-center gap-2">
                <TrendingUp size={16} />
                Strength
              </span>
              <span className="font-bold">{node.strength}%</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${node.strength}%` }}
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Status</span>
              <span className={`font-semibold capitalize ${getStatusColor(node.status)}`}>
                {node.status}
              </span>
            </div>
          </div>

          {/* Last Updated */}
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400 flex items-center gap-2">
                <Calendar size={16} />
                Last Updated
              </span>
              <span className="text-sm">
                {new Date(node.lastUpdated).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Description */}
          {node.description && (
            <div>
              <h3 className="text-sm font-semibold mb-2 text-gray-400">Description</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                {node.description}
              </p>
            </div>
          )}

          {/* Connections */}
          {node.connections.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-2 text-gray-400">
                Connected to {node.connections.length} nodes
              </h3>
              <p className="text-xs text-gray-500">
                This aspect is linked to other parts of your identity
              </p>
            </div>
          )}

          {/* Action Suggestions */}
          <div className="glass rounded-xl p-4 mt-6">
            <h3 className="font-semibold mb-3">💡 Suggestions</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              {node.status === 'neglected' && (
                <li>• Consider revisiting this area - small steps can reignite progress</li>
              )}
              {node.status === 'developing' && (
                <li>• You're making progress! Keep up the momentum</li>
              )}
              {node.status === 'active' && (
                <li>• Strong momentum! Consider what's working and double down</li>
              )}
              {node.status === 'mastered' && (
                <li>• Excellent! This is a core strength. How can you leverage it?</li>
              )}
            </ul>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

