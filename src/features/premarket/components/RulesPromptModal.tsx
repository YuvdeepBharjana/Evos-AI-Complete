import { motion, AnimatePresence } from 'framer-motion';

interface RulesPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDecision: (value: boolean | null) => void;
}

export function RulesPromptModal({
  isOpen,
  onClose,
  onDecision,
}: RulesPromptModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-[#0a0320] border border-white/10 rounded-2xl p-8 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold mb-4 text-center">
              Did you follow your trading rules today?
            </h3>
            <p className="text-gray-400 text-sm text-center mb-8">
              Your answer determines today's discipline result.
            </p>

            <div className="space-y-3">
              {/* YES - Followed Rules */}
              <button
                onClick={() => onDecision(true)}
                className="w-full py-4 px-6 bg-green-500/10 border border-green-400/30 rounded-xl text-green-400 font-medium hover:bg-green-500/20 transition-colors"
              >
                ✓ Yes, I followed all my rules
              </button>

              {/* NO - Broke Rules */}
              <button
                onClick={() => onDecision(false)}
                className="w-full py-4 px-6 bg-red-500/10 border border-red-400/30 rounded-xl text-red-400 font-medium hover:bg-red-500/20 transition-colors"
              >
                ✗ No, I broke at least one rule
              </button>

              {/* NEUTRAL - No Trades */}
              <button
                onClick={() => onDecision(null)}
                className="w-full py-4 px-6 bg-gray-500/10 border border-gray-400/30 rounded-xl text-gray-400 font-medium hover:bg-gray-500/20 transition-colors"
              >
                ⚪ I did not trade today
              </button>
            </div>

            <button
              onClick={onClose}
              className="mt-6 w-full py-2 text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              Cancel
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
