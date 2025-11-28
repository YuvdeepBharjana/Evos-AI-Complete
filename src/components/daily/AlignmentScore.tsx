import { motion } from 'framer-motion';
import { Target, TrendingUp, TrendingDown } from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';

export const AlignmentScore = () => {
  const { user } = useUserStore();
  
  const score = user?.alignmentScore || 75;
  const previousScore = 75; // Would come from history
  const change = score - previousScore;
  
  const getScoreColor = () => {
    if (score >= 80) return 'from-green-500 to-emerald-500';
    if (score >= 60) return 'from-blue-500 to-cyan-500';
    if (score >= 40) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-rose-500';
  };
  
  const getScoreLabel = () => {
    if (score >= 80) return 'Highly Aligned';
    if (score >= 60) return 'On Track';
    if (score >= 40) return 'Drifting';
    return 'Misaligned';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getScoreColor()} flex items-center justify-center`}>
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white">Identity Alignment</h3>
            <p className="text-xs text-gray-400">{getScoreLabel()}</p>
          </div>
        </div>
        
        {change !== 0 && (
          <div className={`flex items-center gap-1 text-sm ${change > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {change > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {change > 0 ? '+' : ''}{change}%
          </div>
        )}
      </div>
      
      {/* Circular progress indicator */}
      <div className="relative w-32 h-32 mx-auto mb-4">
        <svg className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="64"
            cy="64"
            r="56"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-gray-800"
          />
          {/* Progress circle */}
          <motion.circle
            cx="64"
            cy="64"
            r="56"
            stroke="url(#gradient)"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            initial={{ strokeDasharray: '0 352' }}
            animate={{ strokeDasharray: `${(score / 100) * 352} 352` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-3xl font-bold text-white"
          >
            {score}%
          </motion.span>
          <span className="text-xs text-gray-500">aligned</span>
        </div>
      </div>
      
      {/* Description */}
      <p className="text-center text-sm text-gray-400">
        {score >= 70 
          ? "Your actions are matching your identity goals. Keep it up!"
          : "There's a gap between who you want to be and your recent actions."}
      </p>
    </motion.div>
  );
};

