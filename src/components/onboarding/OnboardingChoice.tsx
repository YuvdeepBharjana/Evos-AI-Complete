import { motion } from 'framer-motion';
import { MessageSquare, Upload, PenTool, Sparkles, Zap, Brain } from 'lucide-react';
import { Card } from '../ui/Card';

interface OnboardingChoiceProps {
  onSelectMethod: (method: 'questionnaire' | 'upload' | 'manual') => void;
}

export const OnboardingChoice = ({ onSelectMethod }: OnboardingChoiceProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#030014] relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:100px_100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-indigo-500/10 via-transparent to-transparent blur-3xl" />
        {/* Extra glow for the hero section */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-radial from-cyan-500/15 via-transparent to-transparent blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl w-full relative"
      >
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 mb-6"
          >
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-sm font-medium text-indigo-300">Identity Engineering Platform</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-4"
          >
            Let's Build Your Identity Map
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-400"
          >
            Choose how you'd like to start engineering your identity
          </motion.p>
        </div>

        {/* HERO: ChatGPT Import - The WOW moment */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
          className="mb-8"
        >
          <div 
            onClick={() => onSelectMethod('upload')}
            className="relative cursor-pointer group"
          >
            {/* Animated border glow */}
            <motion.div 
              className="absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500 opacity-75 blur-sm group-hover:opacity-100 transition-opacity"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear'
              }}
              style={{ backgroundSize: '200% 200%' }}
            />
            
            <div 
              className="relative rounded-2xl p-8 md:p-10"
              style={{
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
              }}
            >
              {/* Recommended badge */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <motion.div 
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider"
                  style={{
                    background: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)',
                    boxShadow: '0 4px 20px rgba(6, 182, 212, 0.4)',
                  }}
                  animate={{ 
                    boxShadow: [
                      '0 4px 20px rgba(6, 182, 212, 0.4)',
                      '0 4px 30px rgba(139, 92, 246, 0.5)',
                      '0 4px 20px rgba(6, 182, 212, 0.4)',
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles size={12} />
                  <span>Recommended</span>
                </motion.div>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
                {/* Icon */}
                <motion.div 
                  className="relative"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-2xl shadow-cyan-500/30">
                    <Upload size={40} className="text-white" />
                  </div>
                  <motion.div 
                    className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Brain size={16} className="text-white" />
                  </motion.div>
                </motion.div>

                {/* Content */}
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                    Import Your ChatGPT History
                  </h2>
                  <p className="text-gray-300 text-lg mb-4 max-w-xl">
                    Upload your ChatGPT exports and watch as we instantly extract your goals, struggles, patterns, and hidden potential from your real conversations.
                  </p>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                    <div className="flex items-center gap-2 text-cyan-400 text-sm font-medium">
                      <Zap size={16} />
                      <span>Instant Analysis</span>
                    </div>
                    <div className="flex items-center gap-2 text-purple-400 text-sm font-medium">
                      <Brain size={16} />
                      <span>AI-Powered Insights</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                      <Sparkles size={16} />
                      <span>The "Holy Shit" Moment</span>
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                <motion.div 
                  className="hidden md:flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold text-xl"
                  whileHover={{ scale: 1.1, x: 5 }}
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
          <span className="text-gray-500 text-sm">or choose another path</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
        </div>

        {/* Secondary options */}
        <div className="grid md:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card hover onClick={() => onSelectMethod('questionnaire')} className="h-full">
              <div className="flex items-center gap-4 p-5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                  <MessageSquare size={22} className="text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold mb-1">Answer Questions</h2>
                  <p className="text-gray-400 text-sm">
                    3-minute questionnaire about your goals and values
                  </p>
                </div>
                <div className="text-xs text-indigo-400 font-medium whitespace-nowrap">
                  ⚡ 3 min
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card hover onClick={() => onSelectMethod('manual')} className="h-full">
              <div className="flex items-center gap-4 p-5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center flex-shrink-0">
                  <PenTool size={22} className="text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold mb-1">Build Manually</h2>
                  <p className="text-gray-400 text-sm">
                    Add your own goals, habits, and traits one by one
                  </p>
                </div>
                <div className="text-xs text-orange-400 font-medium whitespace-nowrap">
                  ✍️ Full Control
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-gray-500 text-sm mt-8"
        >
          Your data is private and secure. We only process what you share.
        </motion.p>
      </motion.div>
    </div>
  );
};


