import { motion } from 'framer-motion';
import type { TradingDay } from '../../../types/tradingDay';

interface ActiveTradingPlanPanelProps {
  structuredPlan?: TradingDay['preMarketStructuredPlan'];
  preMarketPlan?: string;
  timestamp?: string;
}

export function ActiveTradingPlanPanel({ 
  structuredPlan, 
  preMarketPlan,
  timestamp 
}: ActiveTradingPlanPanelProps) {
  // Format timestamp
  const formattedTimestamp = timestamp 
    ? new Date(timestamp).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    : null;

  // If structuredPlan exists, use it; otherwise fallback to preMarketPlan text
  if (structuredPlan) {
    const biasColor = 
      structuredPlan.bias === 'bullish' ? 'text-green-400' :
      structuredPlan.bias === 'bearish' ? 'text-red-400' :
      'text-yellow-400';

    const biasBg = 
      structuredPlan.bias === 'bullish' ? 'bg-green-500/10 border-green-400/30' :
      structuredPlan.bias === 'bearish' ? 'bg-red-500/10 border-red-400/30' :
      'bg-yellow-500/10 border-yellow-400/30';

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-xl bg-white/5 border border-white/10"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Active Trading Plan — LOCKED</h3>
          <div className="px-3 py-1 rounded-lg bg-green-500/10 border border-green-400/30">
            <span className="text-xs text-green-400 font-semibold uppercase tracking-wider">Locked</span>
          </div>
        </div>

        <div className="space-y-6">
          {/* Market Bias */}
          <div>
            <label className="text-xs uppercase tracking-wider text-gray-400 mb-2 block">
              Market Bias
            </label>
            <div className={`px-4 py-2 rounded-lg border ${biasBg}`}>
              <span className={`font-bold text-lg capitalize ${biasColor}`}>
                {structuredPlan.bias}
              </span>
            </div>
          </div>

          {/* Primary Setup */}
          <div>
            <label className="text-xs uppercase tracking-wider text-gray-400 mb-2 block">
              Primary Setup
            </label>
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <p className="text-gray-300 leading-relaxed">
                {structuredPlan.setup}
              </p>
            </div>
          </div>

          {/* Key Levels */}
          <div>
            <label className="text-xs uppercase tracking-wider text-gray-400 mb-2 block">
              Key Levels
            </label>
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <ul className="space-y-2">
                {structuredPlan.levels.map((level, index) => (
                  <li key={index} className="text-gray-300 flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span>{level}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Invalidation Rule */}
          <div>
            <label className="text-xs uppercase tracking-wider text-gray-400 mb-2 block">
              Invalidation Rule
            </label>
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-400/30">
              <p className="text-red-300 leading-relaxed font-medium">
                {structuredPlan.invalidation}
              </p>
            </div>
          </div>

          {/* Scenarios (if present) */}
          {structuredPlan.scenarios && structuredPlan.scenarios.length > 0 && (
            <div>
              <label className="text-xs uppercase tracking-wider text-gray-400 mb-2 block">
                If/Then Scenarios
              </label>
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <ul className="space-y-2">
                  {structuredPlan.scenarios.map((scenario, index) => (
                    <li key={index} className="text-gray-300 flex items-start gap-2">
                      <span className="text-cyan-400 mt-1">→</span>
                      <span>{scenario}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Timestamp */}
          {formattedTimestamp && (
            <div className="pt-4 border-t border-white/10">
              <p className="text-xs text-gray-500 text-center">
                Locked at: {formattedTimestamp}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  // Fallback: Show preMarketPlan text if structuredPlan doesn't exist
  if (preMarketPlan) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-xl bg-white/5 border border-white/10"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Active Trading Plan — LOCKED</h3>
          <div className="px-3 py-1 rounded-lg bg-green-500/10 border border-green-400/30">
            <span className="text-xs text-green-400 font-semibold uppercase tracking-wider">Locked</span>
          </div>
        </div>

        {/* Plan Text */}
        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
          <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
            {preMarketPlan}
          </div>
        </div>

        {/* Timestamp */}
        {formattedTimestamp && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-xs text-gray-500 text-center">
              Locked at: {formattedTimestamp}
            </p>
          </div>
        )}
      </motion.div>
    );
  }

  // No plan data available
  return null;
}
