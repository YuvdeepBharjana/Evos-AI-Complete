import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare, LayoutGrid } from 'lucide-react';
import { ChatInterface } from '../components/chat/ChatInterface';
import { FloatingMirrorButton } from '../components/ui/FloatingMirrorButton';
import { DailyProofCard } from '../components/daily/DailyProofCard';
import { AlignmentScore } from '../components/daily/AlignmentScore';
import { EndOfDaySummary } from '../components/daily/EndOfDaySummary';
import { DailyTracker } from '../components/tracking/DailyTracker';
import { useUserStore } from '../store/useUserStore';

type ViewMode = 'chat' | 'dashboard';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');

  const handleMirrorClick = () => {
    navigate('/mirror');
  };

  return (
    <>
      {/* Dashboard Header with Evos AI Branding */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass border-b border-gray-800 px-4 sm:px-8 py-4 sm:py-5 relative"
      >
        <div className="flex items-center justify-between">
          {/* Spacer for balance */}
          <div className="w-32 sm:w-40"></div>

          {/* Centered Evos AI Title */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold gradient-text whitespace-nowrap">
              Evos AI
            </h1>
          </div>

          {/* Mirror Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleMirrorClick}
            className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-medium text-sm sm:text-base shadow-lg shadow-indigo-500/20"
          >
            <span>View Mirror</span>
          </motion.button>
        </div>

        {/* Welcome message in bottom left corner */}
        {user && (
          <div className="absolute bottom-3 left-4 sm:left-8">
            <span className="text-sm sm:text-base text-gray-400">
              Welcome back, <span className="text-white font-semibold">{user.name}</span>
            </span>
          </div>
        )}
      </motion.header>

      {/* View Toggle */}
      <div className="px-3 sm:px-4 py-2 border-b border-gray-800">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('dashboard')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              viewMode === 'dashboard'
                ? 'bg-purple-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden sm:inline">Daily Actions</span>
            <span className="sm:hidden">Actions</span>
          </button>
          <button
            onClick={() => setViewMode('chat')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              viewMode === 'chat'
                ? 'bg-purple-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Chat
          </button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 overflow-hidden"
      >
        {viewMode === 'chat' ? (
          <ChatInterface />
        ) : (
          <div className="h-full overflow-y-auto p-3 sm:p-4">
            <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
              {/* Tracking reminder banner */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30"
              >
                <p className="text-sm text-center text-orange-200">
                  <span className="font-bold">🔄 Remember:</span> Tracking = Data = Growth. 
                  <span className="text-orange-400"> No tracking, no closed loop.</span>
                </p>
              </motion.div>

              {/* Daily Tracker - PRIORITY */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <DailyTracker />
              </motion.div>

              {/* Top row: Alignment Score */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <AlignmentScore />
              </motion.div>

              {/* Daily Proof Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <DailyProofCard />
              </motion.div>

              {/* End of Day Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <EndOfDaySummary />
              </motion.div>

              {/* The Circuit Explanation */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass rounded-2xl p-6"
              >
                <h3 className="font-bold text-white mb-4">🔄 The Evos Circuit</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { step: '1', label: 'Identity', desc: 'Know who you want to be' },
                    { step: '2', label: 'Action', desc: 'Daily micro-tasks' },
                    { step: '3', label: 'Measure', desc: 'Track completion' },
                    { step: '4', label: 'Reinforce', desc: 'Strengthen or weaken' },
                    { step: '5', label: 'Evolve', desc: 'Watch your mirror change' },
                    { step: '→', label: 'Repeat', desc: 'New identity unlocked' },
                  ].map((item, i) => (
                    <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center mb-2">
                        <span className="text-purple-400 font-bold text-sm">{item.step}</span>
                      </div>
                      <p className="font-medium text-white text-sm">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </motion.div>

      <FloatingMirrorButton />
    </>
  );
};
