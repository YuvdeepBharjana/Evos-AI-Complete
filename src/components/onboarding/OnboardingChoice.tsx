import { motion } from 'framer-motion';
import { MessageSquare, Upload } from 'lucide-react';
import { Card } from '../ui/Card';

interface OnboardingChoiceProps {
  onSelectMethod: (method: 'questionnaire' | 'upload') => void;
}

export const OnboardingChoice = ({ onSelectMethod }: OnboardingChoiceProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl w-full"
      >
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-6xl font-bold gradient-text mb-4"
          >
            Welcome to Evos
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-400"
          >
            Most apps give answers — we give identity
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
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center mb-6">
                  <MessageSquare size={32} />
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
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 flex items-center justify-center mb-6">
                  <Upload size={32} />
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


