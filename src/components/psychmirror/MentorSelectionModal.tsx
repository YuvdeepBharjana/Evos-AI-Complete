import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Flame, Compass, Eye, Heart, X } from 'lucide-react';
import { MENTOR_STYLES, setMentorStyle, type AIMentorStyle } from '../../lib/api';

interface MentorSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (style: AIMentorStyle) => void;
}

const MENTOR_ICONS = {
  ruthless: Flame,
  architect: Compass,
  mirror: Eye,
  coach: Heart,
};

const MENTOR_COLORS = {
  ruthless: {
    gradient: 'from-red-500 to-orange-500',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    hover: 'hover:border-red-500/60',
    selected: 'border-red-500 bg-red-500/20',
    text: 'text-red-400',
  },
  architect: {
    gradient: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    hover: 'hover:border-blue-500/60',
    selected: 'border-blue-500 bg-blue-500/20',
    text: 'text-blue-400',
  },
  mirror: {
    gradient: 'from-purple-500 to-violet-500',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    hover: 'hover:border-purple-500/60',
    selected: 'border-purple-500 bg-purple-500/20',
    text: 'text-purple-400',
  },
  coach: {
    gradient: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    hover: 'hover:border-emerald-500/60',
    selected: 'border-emerald-500 bg-emerald-500/20',
    text: 'text-emerald-400',
  },
};

export const MentorSelectionModal = ({ isOpen, onClose, onSelect }: MentorSelectionModalProps) => {
  const [selectedStyle, setSelectedStyle] = useState<AIMentorStyle | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!selectedStyle) return;
    
    setIsSubmitting(true);
    const success = await setMentorStyle(selectedStyle);
    
    if (success) {
      onSelect(selectedStyle);
      onClose();
    }
    
    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0, 0, 0, 0.85)' }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(20, 20, 35, 0.98) 0%, rgba(10, 10, 20, 0.98) 100%)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            boxShadow: '0 25px 80px rgba(0, 0, 0, 0.5), 0 0 40px rgba(139, 92, 246, 0.1)',
          }}
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  Choose Your AI Mentor
                </h2>
                <p className="text-gray-400 text-sm">
                  Select the coaching style that will guide your identity evolution
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Mentor Options */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {MENTOR_STYLES.map((mentor) => {
              const Icon = MENTOR_ICONS[mentor.id];
              const colors = MENTOR_COLORS[mentor.id];
              const isSelected = selectedStyle === mentor.id;

              return (
                <motion.button
                  key={mentor.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedStyle(mentor.id)}
                  className={`relative p-5 rounded-xl text-left transition-all border-2 ${
                    isSelected 
                      ? colors.selected 
                      : `${colors.bg} ${colors.border} ${colors.hover}`
                  }`}
                >
                  {/* Selected checkmark */}
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`absolute top-3 right-3 w-6 h-6 rounded-full bg-gradient-to-r ${colors.gradient} flex items-center justify-center`}
                    >
                      <Check className="w-4 h-4 text-white" />
                    </motion.div>
                  )}

                  {/* Icon and Title */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${colors.gradient} flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-bold text-white text-lg">{mentor.name}</h3>
                  </div>

                  {/* Description */}
                  <p className="text-gray-400 text-sm mb-3">
                    {mentor.description}
                  </p>

                  {/* Traits */}
                  <div className="flex flex-wrap gap-2">
                    {mentor.traits.map((trait, i) => (
                      <span
                        key={i}
                        className={`text-xs px-2 py-1 rounded-full ${colors.bg} ${colors.text} border ${colors.border}`}
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              You can change your mentor style later in settings
            </p>
            <motion.button
              whileHover={{ scale: selectedStyle ? 1.02 : 1 }}
              whileTap={{ scale: selectedStyle ? 0.98 : 1 }}
              onClick={handleConfirm}
              disabled={!selectedStyle || isSubmitting}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                selectedStyle
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/25'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? 'Saving...' : 'Confirm Selection'}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

