import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Target, Repeat, Sparkles, Heart, AlertTriangle, Lightbulb, Check, ArrowRight } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import type { IdentityNode } from '../../types';

interface ManualOnboardingFlowProps {
  onComplete: (nodes: IdentityNode[]) => void;
}

type NodeType = 'goal' | 'habit' | 'trait' | 'emotion' | 'struggle' | 'interest';

const nodeTypeConfig: Record<NodeType, { label: string; icon: React.ElementType; color: string; placeholder: string }> = {
  goal: { 
    label: 'Goals', 
    icon: Target, 
    color: 'from-purple-500 to-indigo-500',
    placeholder: 'e.g., Launch my startup, Get fit, Learn Spanish...'
  },
  habit: { 
    label: 'Habits', 
    icon: Repeat, 
    color: 'from-blue-500 to-cyan-500',
    placeholder: 'e.g., Morning meditation, Daily exercise, Reading...'
  },
  trait: { 
    label: 'Traits', 
    icon: Sparkles, 
    color: 'from-green-500 to-emerald-500',
    placeholder: 'e.g., Resilience, Creativity, Discipline...'
  },
  emotion: { 
    label: 'Emotions', 
    icon: Heart, 
    color: 'from-pink-500 to-rose-500',
    placeholder: 'e.g., Determination, Anxiety, Excitement...'
  },
  struggle: { 
    label: 'Struggles', 
    icon: AlertTriangle, 
    color: 'from-orange-500 to-amber-500',
    placeholder: 'e.g., Procrastination, Imposter syndrome, Work-life balance...'
  },
  interest: { 
    label: 'Interests', 
    icon: Lightbulb, 
    color: 'from-yellow-500 to-orange-500',
    placeholder: 'e.g., AI Technology, Philosophy, Music...'
  },
};

const nodeTypes: NodeType[] = ['goal', 'habit', 'trait', 'emotion', 'struggle', 'interest'];

export const ManualOnboardingFlow = ({ onComplete }: ManualOnboardingFlowProps) => {
  const [currentType, setCurrentType] = useState<NodeType>('goal');
  const [nodes, setNodes] = useState<Record<NodeType, string[]>>({
    goal: [],
    habit: [],
    trait: [],
    emotion: [],
    struggle: [],
    interest: [],
  });
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentConfig = nodeTypeConfig[currentType];
  const currentTypeIndex = nodeTypes.indexOf(currentType);
  const isLastType = currentTypeIndex === nodeTypes.length - 1;
  const totalNodes = Object.values(nodes).flat().length;

  const handleAddNode = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    
    setNodes(prev => ({
      ...prev,
      [currentType]: [...prev[currentType], trimmed]
    }));
    setInputValue('');
  };

  const handleRemoveNode = (type: NodeType, index: number) => {
    setNodes(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddNode();
    }
  };

  const handleNext = () => {
    if (isLastType) {
      handleComplete();
    } else {
      setCurrentType(nodeTypes[currentTypeIndex + 1]);
      setInputValue('');
    }
  };

  const handleBack = () => {
    if (currentTypeIndex > 0) {
      setCurrentType(nodeTypes[currentTypeIndex - 1]);
      setInputValue('');
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    
    // Convert to IdentityNode format
    const identityNodes: IdentityNode[] = [];
    
    for (const [type, labels] of Object.entries(nodes)) {
      for (const label of labels) {
        identityNodes.push({
          id: uuidv4(),
          label,
          type: type as NodeType,
          strength: 50,
          status: 'developing',
          connections: [],
          lastUpdated: new Date(),
          createdAt: new Date(),
        });
      }
    }
    
    // Small delay for UX
    await new Promise(resolve => setTimeout(resolve, 500));
    onComplete(identityNodes);
  };

  const canProceed = nodes[currentType].length > 0 || currentTypeIndex > 0;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#030014] relative">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:100px_100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-indigo-500/10 via-transparent to-transparent blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-2xl w-full relative"
      >
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Building your identity map</span>
            <span className="text-indigo-400">{totalNodes} nodes added</span>
          </div>
          <div className="flex gap-1">
            {nodeTypes.map((type, i) => (
              <div
                key={type}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  i < currentTypeIndex ? 'bg-green-500' :
                  i === currentTypeIndex ? `bg-gradient-to-r ${nodeTypeConfig[type].color}` :
                  'bg-gray-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Type Selector */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {nodeTypes.map((type) => {
            const config = nodeTypeConfig[type];
            const Icon = config.icon;
            const count = nodes[type].length;
            const isActive = type === currentType;
            
            return (
              <button
                key={type}
                onClick={() => setCurrentType(type)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? `bg-gradient-to-r ${config.color} text-white`
                    : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                {config.label}
                {count > 0 && (
                  <span className={`px-1.5 py-0.5 rounded text-xs ${
                    isActive ? 'bg-white/20' : 'bg-white/10'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Main Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentType}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${currentConfig.color}`}>
                <currentConfig.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Add Your {currentConfig.label}</h2>
                <p className="text-gray-400 text-sm">What {currentConfig.label.toLowerCase()} define who you are?</p>
              </div>
            </div>

            {/* Input */}
            <div className="flex gap-2 mb-6">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={currentConfig.placeholder}
                className="flex-1 px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                autoFocus
              />
              <button
                onClick={handleAddNode}
                disabled={!inputValue.trim()}
                className={`px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                  inputValue.trim()
                    ? `bg-gradient-to-r ${currentConfig.color} text-white hover:opacity-90`
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Plus className="w-5 h-5" />
                Add
              </button>
            </div>

            {/* Added Nodes */}
            <div className="min-h-[120px]">
              {nodes[currentType].length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No {currentConfig.label.toLowerCase()} added yet</p>
                  <p className="text-sm mt-1">Type above and press Enter or click Add</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {nodes[currentType].map((node, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r ${currentConfig.color} text-white`}
                    >
                      <span>{node}</span>
                      <button
                        onClick={() => handleRemoveNode(currentType, index)}
                        className="p-0.5 rounded hover:bg-white/20 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-6 pt-6 border-t border-white/10">
              <button
                onClick={handleBack}
                disabled={currentTypeIndex === 0}
                className="px-4 py-2 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                ← Back
              </button>
              
              <button
                onClick={handleNext}
                disabled={isSubmitting}
                className={`px-6 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
                  isLastType
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:opacity-90'
                    : 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white hover:opacity-90'
                } disabled:opacity-50`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </>
                ) : isLastType ? (
                  <>
                    <Check className="w-4 h-4" />
                    Complete ({totalNodes} nodes)
                  </>
                ) : (
                  <>
                    Next: {nodeTypeConfig[nodeTypes[currentTypeIndex + 1]].label}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Summary of all nodes */}
        {totalNodes > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 p-4 bg-white/5 border border-white/10 rounded-xl"
          >
            <h3 className="text-sm font-medium text-gray-400 mb-3">Your Identity Map Preview</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(nodes).map(([type, labels]) =>
                labels.map((label, i) => (
                  <span
                    key={`${type}-${i}`}
                    className={`px-2 py-1 rounded text-xs bg-gradient-to-r ${nodeTypeConfig[type as NodeType].color} text-white`}
                  >
                    {label}
                  </span>
                ))
              )}
            </div>
          </motion.div>
        )}

        <p className="text-center text-gray-500 text-sm mt-6">
          You can always add or edit nodes later in your Mirror
        </p>
      </motion.div>
    </div>
  );
};

