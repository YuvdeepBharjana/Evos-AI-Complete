import { motion } from 'framer-motion';
import { MessageSquare, Upload } from 'lucide-react';
import { Card } from '../ui/Card';

interface OnboardingChoiceProps {
  onSelectMethod: (method: 'questionnaire' | 'upload') => void;
}

export const OnboardingChoice = ({ onSelectMethod }: OnboardingChoiceProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#030014] relative">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:100px_100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-indigo-500/10 via-transparent to-transparent blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl w-full relative"
      >
        <div className="text-center mb-12">
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

        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card hover onClick={() => onSelectMethod('questionnaire')} className="h-full">
              <div className="flex flex-col items-center text-center p-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center mb-6">
                  <MessageSquare size={32} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-4">Answer Questions</h2>
                <p className="text-gray-400 mb-6">
                  Take 3 minutes to answer a few thoughtful questions about your goals, habits, and values.
                </p>
                <div className="text-sm text-gray-500">
                  ⚡ Quick & Personalized
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card hover onClick={() => onSelectMethod('upload')} className="h-full">
              <div className="flex flex-col items-center text-center p-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 flex items-center justify-center mb-6">
                  <Upload size={32} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-4">Import AI History</h2>
                <p className="text-gray-400 mb-6">
                  Upload your ChatGPT conversations or AI chat logs. We'll analyze your patterns instantly.
                </p>
                <div className="text-sm text-gray-500">
                  🚀 Instant Identity Profile
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


