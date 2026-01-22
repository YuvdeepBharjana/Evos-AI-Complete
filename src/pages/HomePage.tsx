import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Calendar, ArrowRight } from 'lucide-react';
import { useTradingDayStore } from '../store/useTradingDayStore';
import { useEffect } from 'react';

/**
 * Daily Discipline Home
 * Post-onboarding landing screen with three workflow cards
 */
export const HomePage = () => {
  const navigate = useNavigate();
  const { currentDay, initializeToday } = useTradingDayStore();

  useEffect(() => {
    initializeToday();
  }, [initializeToday]);

  const preMarketCompleted = currentDay?.preMarketCompleted ?? false;
  const isClosed = currentDay?.isClosed ?? false;

  return (
    <div className="min-h-screen bg-[#030014] relative">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.03)_1px,transparent_1px)] bg-[size:100px_100px]" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-radial from-green-500/15 via-transparent to-transparent blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Daily Trading Discipline Loop
          </h1>
          <p className="text-xl text-gray-400">
            Three stages. One routine. Build consistency.
          </p>
        </motion.div>

        {/* Three Workflow Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* CARD 1: Premarket Calibration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{
              y: -6,
              scale: 1.01,
              transition: {
                type: "spring",
                stiffness: 200,
                damping: 20
              }
            }}
            className={`relative backdrop-blur-xl bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-2 rounded-2xl min-h-[440px] p-8 shadow-xl flex flex-col ${
              !preMarketCompleted
                ? 'border-green-400/50 shadow-green-500/20'
                : 'border-white/10'
            }`}
            onMouseEnter={(e) => {
              const card = e.currentTarget;
              if (!preMarketCompleted) {
                card.style.borderColor = 'rgba(34, 197, 94, 0.6)';
                card.style.boxShadow = '0 25px 50px -12px rgba(34, 197, 94, 0.3)';
              } else {
                card.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                card.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              const card = e.currentTarget;
              if (!preMarketCompleted) {
                card.style.borderColor = 'rgba(34, 197, 94, 0.5)';
                card.style.boxShadow = '0 20px 25px -5px rgba(34, 197, 94, 0.2)';
              } else {
                card.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                card.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.3)';
              }
            }}
            style={{
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
            }}
          >
            <h2 className="text-2xl font-bold text-white mb-4">
              Premarket Calibration
            </h2>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Lock your trading plan before the market opens. No guessing. No emotional trading.
            </p>

            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-start gap-2 text-gray-300 text-sm">
                <span className="text-green-400 mt-1">•</span>
                <span>AI refines your raw market bias</span>
              </li>
              <li className="flex items-start gap-2 text-gray-300 text-sm">
                <span className="text-green-400 mt-1">•</span>
                <span>Forces clear setup and invalidation</span>
              </li>
              <li className="flex items-start gap-2 text-gray-300 text-sm">
                <span className="text-green-400 mt-1">•</span>
                <span>Locks plan before trading is unlocked</span>
              </li>
              <li className="flex items-start gap-2 text-gray-300 text-sm">
                <span className="text-green-400 mt-1">•</span>
                <span>Creates professional premarket routine</span>
              </li>
            </ul>

            <motion.button
              onClick={() => navigate('/premarket')}
              whileHover={{
                scale: 1.02,
                transition: { duration: 0.15 }
              }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 px-4 bg-gradient-to-r from-green-500 via-emerald-500 to-cyan-500 text-white text-lg font-semibold rounded-xl shadow-lg shadow-green-500/20 relative overflow-hidden group"
            >
              <span className="relative z-10">Start Premarket Calibration</span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 opacity-0 group-hover:opacity-100"
                transition={{ duration: 0.2 }}
              />
            </motion.button>
            {!preMarketCompleted && (
              <p className="text-xs text-green-400 mt-4 text-center">
                ⚡ Complete this first to unlock trading
              </p>
            )}
          </motion.div>

          {/* CARD 2: Post-Trade Review */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{
              y: -6,
              scale: 1.01,
              transition: {
                type: "spring",
                stiffness: 200,
                damping: 20
              }
            }}
            className="relative backdrop-blur-xl bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-2 border-white/10 rounded-2xl min-h-[440px] p-8 shadow-xl flex flex-col"
            onMouseEnter={(e) => {
              const card = e.currentTarget;
              card.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              card.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.5)';
            }}
            onMouseLeave={(e) => {
              const card = e.currentTarget;
              card.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              card.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.3)';
            }}
            style={{
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
            }}
          >
            <h2 className="text-2xl font-bold text-white mb-4">
              Post-Trade Review
            </h2>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Clock out properly. Seal your trading day with discipline.
            </p>

            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-start gap-2 text-gray-300 text-sm">
                <span className="text-cyan-400 mt-1">•</span>
                <span>End your trading session intentionally</span>
              </li>
              <li className="flex items-start gap-2 text-gray-300 text-sm">
                <span className="text-cyan-400 mt-1">•</span>
                <span>Record execution behavior</span>
              </li>
              <li className="flex items-start gap-2 text-gray-300 text-sm">
                <span className="text-cyan-400 mt-1">•</span>
                <span>Receive AI discipline feedback</span>
              </li>
              <li className="flex items-start gap-2 text-gray-300 text-sm">
                <span className="text-cyan-400 mt-1">•</span>
                <span>Prevent revenge trading and overtrading</span>
              </li>
            </ul>

            <motion.button
              onClick={() => navigate('/postmarket')}
              whileHover={{
                scale: 1.02,
                transition: { duration: 0.15 }
              }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 px-4 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 text-white text-lg font-semibold rounded-xl shadow-lg shadow-cyan-500/20 relative overflow-hidden group"
            >
              <span className="relative z-10">Open Post-Trade Review</span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 opacity-0 group-hover:opacity-100"
                transition={{ duration: 0.2 }}
              />
            </motion.button>
            <p className="text-xs text-gray-500 mt-4 text-center">
              Complete after market closes
            </p>
          </motion.div>

          {/* CARD 3: Discipline Calendar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{
              y: -6,
              scale: 1.01,
              transition: {
                type: "spring",
                stiffness: 200,
                damping: 20
              }
            }}
            className={`relative backdrop-blur-xl bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-2 rounded-2xl min-h-[440px] p-8 shadow-xl flex flex-col ${
              isClosed
                ? 'border-blue-400/50 shadow-blue-500/20'
                : 'border-white/10'
            }`}
            onMouseEnter={(e) => {
              const card = e.currentTarget;
              if (isClosed) {
                card.style.borderColor = 'rgba(59, 130, 246, 0.6)';
                card.style.boxShadow = '0 25px 50px -12px rgba(59, 130, 246, 0.3)';
              } else {
                card.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                card.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              const card = e.currentTarget;
              if (isClosed) {
                card.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                card.style.boxShadow = '0 20px 25px -5px rgba(59, 130, 246, 0.2)';
              } else {
                card.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                card.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.3)';
              }
            }}
            style={{
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
            }}
          >
            <h2 className="text-2xl font-bold text-white mb-4">
              Discipline Calendar
            </h2>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Track consistency, not just PnL.
            </p>

            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-start gap-2 text-gray-300 text-sm">
                <span className="text-blue-400 mt-1">•</span>
                <span>See green/red discipline days</span>
              </li>
              <li className="flex items-start gap-2 text-gray-300 text-sm">
                <span className="text-blue-400 mt-1">•</span>
                <span>Track streaks and discipline rate</span>
              </li>
              <li className="flex items-start gap-2 text-gray-300 text-sm">
                <span className="text-blue-400 mt-1">•</span>
                <span>Measure long-term consistency</span>
              </li>
              <li className="flex items-start gap-2 text-gray-300 text-sm">
                <span className="text-blue-400 mt-1">•</span>
                <span>Build professional trading habits</span>
              </li>
            </ul>

            <motion.button
              onClick={() => navigate('/calendar')}
              whileHover={{
                scale: 1.02,
                transition: { duration: 0.15 }
              }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 px-4 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white text-lg font-semibold rounded-xl shadow-lg shadow-blue-500/20 relative overflow-hidden group"
            >
              <span className="relative z-10">View Discipline Calendar</span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 opacity-0 group-hover:opacity-100"
                transition={{ duration: 0.2 }}
              />
            </motion.button>
            {isClosed && (
              <p className="text-xs text-blue-400 mt-4 text-center">
                ✓ Today's result recorded
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};
