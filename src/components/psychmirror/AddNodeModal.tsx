import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, Repeat, Sparkles, Heart, AlertTriangle, Lightbulb, Plus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import type { IdentityNode, NodeType } from '../../types';

interface AddNodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (node: IdentityNode) => void;
}

const nodeTypeConfig: Record<NodeType, { label: string; icon: React.ElementType; color: string; gradient: string }> = {
  goal: { 
    label: 'Goal', 
    icon: Target, 
    color: 'text-blue-400',
    gradient: 'from-purple-500 to-indigo-500'
  },
  habit: { 
    label: 'Habit', 
    icon: Repeat, 
    color: 'text-green-400',
    gradient: 'from-blue-500 to-cyan-500'
  },
  trait: { 
    label: 'Trait', 
    icon: Sparkles, 
    color: 'text-purple-400',
    gradient: 'from-green-500 to-emerald-500'
  },
  emotion: { 
    label: 'Emotion', 
    icon: Heart, 
    color: 'text-pink-400',
    gradient: 'from-pink-500 to-rose-500'
  },
  struggle: { 
    label: 'Struggle', 
    icon: AlertTriangle, 
    color: 'text-orange-400',
    gradient: 'from-orange-500 to-amber-500'
  },
  interest: { 
    label: 'Interest', 
    icon: Lightbulb, 
    color: 'text-yellow-400',
    gradient: 'from-yellow-500 to-orange-500'
  },
};

const nodeTypes: NodeType[] = ['goal', 'habit', 'trait', 'emotion', 'struggle', 'interest'];

export const AddNodeModal = ({ isOpen, onClose, onAdd }: AddNodeModalProps) => {
  const [selectedType, setSelectedType] = useState<NodeType>('goal');
  const [label, setLabel] = useState('');
  const [strength, setStrength] = useState(50);
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!label.trim()) return;

    const newNode: IdentityNode = {
      id: uuidv4(),
      label: label.trim(),
      type: selectedType,
      strength,
      status: strength >= 80 ? 'mastered' : strength >= 60 ? 'active' : 'developing',
      description: description.trim() || undefined,
      connections: [],
      lastUpdated: new Date(),
      createdAt: new Date(),
    };

    onAdd(newNode);
    
    // Reset form
    setLabel('');
    setStrength(50);
    setDescription('');
    onClose();
  };

  const config = nodeTypeConfig[selectedType];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${config.gradient}`}>
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">Add Identity Node</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Type Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {nodeTypes.map((type) => {
                      const typeConfig = nodeTypeConfig[type];
                      const Icon = typeConfig.icon;
                      const isSelected = type === selectedType;
                      
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setSelectedType(type)}
                          className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
                            isSelected
                              ? `bg-gradient-to-r ${typeConfig.gradient} text-white`
                              : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="text-xs font-medium">{typeConfig.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Label */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                  <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder={`e.g., ${
                      selectedType === 'goal' ? 'Launch my startup' :
                      selectedType === 'habit' ? 'Morning meditation' :
                      selectedType === 'trait' ? 'Resilience' :
                      selectedType === 'emotion' ? 'Determination' :
                      selectedType === 'struggle' ? 'Procrastination' :
                      'AI Technology'
                    }`}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                    autoFocus
                  />
                </div>

                {/* Strength */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-300">Current Strength</label>
                    <span className={`text-sm font-medium ${
                      strength >= 80 ? 'text-green-400' :
                      strength >= 60 ? 'text-blue-400' :
                      strength >= 40 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {strength}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={strength}
                    onChange={(e) => setStrength(parseInt(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Developing</span>
                    <span>Active</span>
                    <span>Mastered</span>
                  </div>
                </div>

                {/* Description (optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description <span className="text-gray-500">(optional)</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add more context about this aspect of your identity..."
                    rows={2}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-3 bg-white/5 text-gray-300 rounded-xl font-medium hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!label.trim()}
                    className={`flex-1 px-4 py-3 bg-gradient-to-r ${config.gradient} text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                  >
                    <Plus className="w-4 h-4" />
                    Add Node
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

