/**
 * Strategy Recognizer Page
 * 
 * Entry point for traders to describe their trading strategy.
 * Collects structured inputs and free-form description, then generates
 * a strategy summary using the AI prompt builder.
 */

import { useState } from 'react';
import { buildAIPrompt } from '../lib/aiPromptBuilder';
import { buildTraderContext } from '../lib/traderContext';

export function StrategyRecognizerPage() {
  // ============================================
  // STRUCTURED INPUT STATE
  // ============================================
  const [market, setMarket] = useState('');
  const [tradeType, setTradeType] = useState('');
  const [biasTimeframe, setBiasTimeframe] = useState('');
  const [structureTimeframe, setStructureTimeframe] = useState('');
  const [entryTimeframe, setEntryTimeframe] = useState('');
  const [maxTradesPerDay, setMaxTradesPerDay] = useState<number | ''>('');
  const [lateWakeNoTrade, setLateWakeNoTrade] = useState(false);

  // ============================================
  // FREE STRATEGY DESCRIPTION STATE
  // ============================================
  const [strategyDescription, setStrategyDescription] = useState('');

  // ============================================
  // EDGE VALIDATION STATE
  // ============================================
  const [hasBacktested, setHasBacktested] = useState<boolean>(false);
  const [winRate, setWinRate] = useState<string>('');
  const [profitFactor, setProfitFactor] = useState<string>('');

  // ============================================
  // GENERATED SUMMARY STATE
  // ============================================
  const [generatedSummary, setGeneratedSummary] = useState<string | null>(null);

  // ============================================
  // HANDLE SUBMIT
  // ============================================
  const handleSubmit = () => {
    // Validate edge validation inputs if provided
    if (winRate || profitFactor) {
      const winRateNum = parseFloat(winRate);
      const profitFactorNum = parseFloat(profitFactor);

      // Validate winRate: must be between 0 and 100
      if (winRate && (isNaN(winRateNum) || winRateNum < 0 || winRateNum > 100)) {
        alert('Win Rate must be a number between 0 and 100');
        return;
      }

      // Validate profitFactor: must be > 0
      if (profitFactor && (isNaN(profitFactorNum) || profitFactorNum <= 0)) {
        alert('Profit Factor must be a number greater than 0');
        return;
      }
    }

    // Save edge validation data to localStorage
    if (hasBacktested || winRate || profitFactor) {
      const edgeProfile = {
        hasBacktested,
        winRate: winRate ? parseFloat(winRate) : undefined,
        profitFactor: profitFactor ? parseFloat(profitFactor) : undefined,
      };

      // Only save if at least one field has a value
      if (edgeProfile.hasBacktested || edgeProfile.winRate !== undefined || edgeProfile.profitFactor !== undefined) {
        localStorage.setItem('evos.edgeProfile', JSON.stringify(edgeProfile));
      }
    }

    // Combine structured answers + free text into ONE formatted string
    const structuredInputs = [
      `Market: ${market || 'Not specified'}`,
      `Trade Type: ${tradeType || 'Not specified'}`,
      `Bias Timeframe: ${biasTimeframe || 'Not specified'}`,
      `Structure Timeframe: ${structureTimeframe || 'Not specified'}`,
      `Entry Timeframe: ${entryTimeframe || 'Not specified'}`,
      `Max Trades Per Day: ${maxTradesPerDay || 'Not specified'}`,
      `Late Wake No Trade: ${lateWakeNoTrade ? 'Yes' : 'No'}`,
    ].join('\n');

    const combinedInput = `${structuredInputs}\n\n--- Strategy Description ---\n${strategyDescription || 'No description provided.'}`;

    // Build trader context from localStorage
    const traderContext = buildTraderContext();

    // Call buildAIPrompt with strategy_recognizer mode
    const promptResult = buildAIPrompt({
      mode: 'strategy_recognizer',
      strategySummary: traderContext.strategySummary,
      edgeReadiness: traderContext.edgeReadiness,
      userMessage: combinedInput,
    });

    // Console.log the returned prompts to verify pipeline wiring
    console.log('=== Strategy Recognizer Prompt Results ===');
    console.log('System Prompt:', promptResult.systemPrompt);
    console.log('User Prompt:', promptResult.userPrompt);
    console.log('==========================================');

    // Create temporary mock AI response using structured inputs
    const mockSummary = `Strategy Type:
${market || 'Not specified'} - ${tradeType || 'Not specified'}

Timeframes:
Bias: ${biasTimeframe || 'Not specified'}
Structure: ${structureTimeframe || 'Not specified'}
Entry: ${entryTimeframe || 'Not specified'}

Rules:
Max trades per day: ${maxTradesPerDay || 'Not specified'}
Late wake = no trade: ${lateWakeNoTrade ? 'Yes' : 'No'}

Risk Profile:
Win Rate: ${winRate || 'Not Provided'}
Profit Factor: ${profitFactor || 'Not Provided'}`;

    // Save formatted string into generatedSummary
    setGeneratedSummary(mockSummary);
  };

  return (
    <div className="min-h-screen bg-[#030014] text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* ============================================ */}
        {/* HEADER */}
        {/* ============================================ */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Strategy Recognizer</h1>
          <p className="text-gray-400 text-lg">
            Teach Evos how you trade so it can enforce your discipline.
          </p>
        </div>

        {/* ============================================ */}
        {/* STRUCTURED INPUTS */}
        {/* ============================================ */}
        <div className="space-y-6 mb-8">
          <div>
            <label className="block text-sm font-medium mb-2">Market</label>
            <input
              type="text"
              value={market}
              onChange={(e) => setMarket(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              placeholder="e.g., ES, NQ, SPY"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Trade Type</label>
            <input
              type="text"
              value={tradeType}
              onChange={(e) => setTradeType(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              placeholder="e.g., Scalping, Swing Trading, Day Trading"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Bias Timeframe</label>
            <input
              type="text"
              value={biasTimeframe}
              onChange={(e) => setBiasTimeframe(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              placeholder="e.g., 15m, 1H, 4H, Daily"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Structure Timeframe</label>
            <input
              type="text"
              value={structureTimeframe}
              onChange={(e) => setStructureTimeframe(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              placeholder="e.g., 5m, 15m, 1H"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Entry Timeframe</label>
            <input
              type="text"
              value={entryTimeframe}
              onChange={(e) => setEntryTimeframe(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              placeholder="e.g., 1m, 5m, 15m"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Max Trades Per Day</label>
            <input
              type="number"
              value={maxTradesPerDay}
              onChange={(e) => {
                const value = e.target.value;
                setMaxTradesPerDay(value === '' ? '' : parseInt(value, 10));
              }}
              min="0"
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              placeholder="e.g., 2, 3, 5"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="lateWakeNoTrade"
              checked={lateWakeNoTrade}
              onChange={(e) => setLateWakeNoTrade(e.target.checked)}
              className="w-5 h-5 rounded bg-white/5 border border-white/10 text-indigo-500 focus:ring-indigo-500 focus:ring-2"
            />
            <label htmlFor="lateWakeNoTrade" className="text-sm font-medium cursor-pointer">
              Late Wake No Trade
            </label>
          </div>
        </div>

        {/* ============================================ */}
        {/* FREE STRATEGY DESCRIPTION */}
        {/* ============================================ */}
        <div className="mb-8">
          <label className="block text-sm font-medium mb-2">
            Describe your trading strategy in your own words
          </label>
          <textarea
            value={strategyDescription}
            onChange={(e) => setStrategyDescription(e.target.value)}
            rows={12}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-y"
            placeholder="Explain how you enter trades, what invalidates setups, and what mistakes you want Evos to prevent."
          />
        </div>

        {/* ============================================ */}
        {/* EDGE VALIDATION SECTION */}
        {/* ============================================ */}
        <div className="mb-8 space-y-4">
          <h3 className="text-lg font-semibold text-white mb-4">Edge Validation</h3>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="hasBacktested"
              checked={hasBacktested}
              onChange={(e) => setHasBacktested(e.target.checked)}
              className="w-5 h-5 rounded bg-white/5 border border-white/10 text-indigo-500 focus:ring-indigo-500 focus:ring-2"
            />
            <label htmlFor="hasBacktested" className="text-sm font-medium cursor-pointer">
              I have backtested this strategy
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Win Rate (%)</label>
            <input
              type="text"
              value={winRate}
              onChange={(e) => setWinRate(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              placeholder="e.g., 55"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Profit Factor</label>
            <input
              type="text"
              value={profitFactor}
              onChange={(e) => setProfitFactor(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              placeholder="e.g., 1.5"
            />
          </div>
        </div>

        {/* ============================================ */}
        {/* SUBMIT BUTTON */}
        {/* ============================================ */}
        {!generatedSummary && (
          <button
            onClick={handleSubmit}
            className="w-full px-6 py-3 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            Generate Strategy Summary
          </button>
        )}

        {/* ============================================ */}
        {/* STRATEGY SUMMARY SECTION */}
        {/* ============================================ */}
        {generatedSummary && (
          <div className="mt-8 backdrop-blur-xl bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-2 border-white/10 rounded-2xl p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-4">Evos Strategy Interpretation</h2>
            
            <div className="mb-6">
              <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono bg-white/5 p-4 rounded-lg border border-white/10">
                {generatedSummary}
              </pre>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  // Create strategyProfile object
                  const strategyProfile = {
                    market,
                    tradeType,
                    biasTf: biasTimeframe,
                    structureTf: structureTimeframe,
                    entryTf: entryTimeframe,
                    maxTrades: maxTradesPerDay,
                    lateWakeNoTrade,
                    winRate: winRate || undefined,
                    profitFactor: profitFactor || undefined,
                    summaryText: generatedSummary,
                    createdAt: new Date().toISOString(),
                  };

                  // Save to localStorage
                  localStorage.setItem('evos.strategyProfile', JSON.stringify(strategyProfile));

                  console.log('Strategy profile saved');
                }}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                Accept Strategy
              </button>
              <button
                onClick={() => {
                  setGeneratedSummary(null);
                }}
                className="flex-1 px-6 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors border border-white/10"
              >
                Edit Inputs
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
