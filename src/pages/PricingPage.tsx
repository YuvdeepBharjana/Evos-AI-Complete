import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Shield, Dna, ArrowLeft } from 'lucide-react';

export const PricingPage = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <div className="min-h-screen bg-[#030014] text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:100px_100px]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-radial from-indigo-500/20 via-purple-500/5 to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-gradient-radial from-cyan-500/10 via-transparent to-transparent blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#030014]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 flex items-center justify-center">
                <Dna className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
            </div>
            <span className="font-bold text-lg sm:text-xl tracking-tight">Evos</span>
          </Link>
          <Link to="/login" className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-lg blur opacity-50 group-hover:opacity-75 transition-opacity" />
            <div className="relative px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-lg font-medium text-sm">
              Get Started
            </div>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-32 pb-20 px-4 sm:px-6 relative">
        <div className="max-w-7xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-12 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm">Back to Home</span>
          </Link>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">Start Free. Upgrade When Ready.</h1>
            <p className="text-gray-400 text-lg mb-6">Choose the plan that fits your trading journey</p>
            
            {/* Monthly/Annual Toggle */}
            <div className="flex items-center justify-center gap-4 mb-2">
              <span className={`text-sm font-medium transition-colors ${!isAnnual ? 'text-white' : 'text-gray-500'}`}>
                Monthly
              </span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className="relative w-14 h-7 rounded-full bg-white/10 border border-white/20 transition-colors hover:bg-white/15"
              >
                <motion.div
                  animate={{ x: isAnnual ? 28 : 4 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="absolute top-1 w-5 h-5 rounded-full bg-gradient-to-r from-green-500 to-cyan-500"
                />
              </button>
              <span className={`text-sm font-medium transition-colors ${isAnnual ? 'text-white' : 'text-gray-500'}`}>
                Annual
              </span>
              {isAnnual && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400 font-semibold"
                >
                  Save up to 17%
                </motion.span>
              )}
            </div>
            
            <p className="text-sm text-gray-500">No credit card required to start</p>
          </motion.div>

          {/* 3-Tier Pricing Grid */}
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-16">
            
            {/* TIER 1: STARTER (FREE) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm p-6 sm:p-8"
            >
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-white mb-2">Starter</h3>
                <p className="text-gray-400 text-sm">Test the discipline system</p>
              </div>

              <div className="text-center mb-6">
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl font-bold text-white">$0</span>
                  <span className="text-gray-400">/month</span>
                </div>
                <p className="text-sm text-green-400 mt-2 font-medium">Free forever</p>
              </div>

              <ul className="space-y-3 mb-8">
                {[
                  { text: 'Pre-market check-ins', limit: '3 per week' },
                  { text: 'Post-market reflection', limit: 'Manual only' },
                  { text: 'Daily action tracking', limit: '5 actions max' },
                  { text: 'PsychMirror access', limit: 'View only' },
                  { text: 'Rule tracking', limit: '3 rules max' }
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span className="text-gray-300 text-sm">{feature.text}</span>
                      <span className="text-xs text-gray-500 block">{feature.limit}</span>
                    </div>
                  </li>
                ))}
              </ul>

              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 rounded-xl border border-white/20 hover:bg-white/5 font-semibold transition-all"
                >
                  Get Started Free
                </motion.button>
              </Link>

              <p className="text-xs text-center text-gray-500 mt-4">Join 5,000+ traders</p>
            </motion.div>

            {/* TIER 2: TRADER ($14) - MOST POPULAR */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative rounded-2xl border-2 border-green-500/30 bg-gradient-to-br from-green-500/10 to-cyan-500/10 backdrop-blur-sm p-6 sm:p-8 shadow-2xl shadow-green-500/20"
            >
              {/* Most Popular Badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-green-500 to-cyan-500 text-sm font-semibold">
                  Most Popular
                </div>
              </div>

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Trader</h3>
                <p className="text-gray-400 text-sm">Everything you need to succeed</p>
              </div>

              <div className="text-center mb-6">
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl font-bold text-white">
                    ${isAnnual ? '140' : '14'}
                  </span>
                  <span className="text-gray-400">{isAnnual ? '/year' : '/month'}</span>
                </div>
                {!isAnnual && (
                  <p className="text-sm text-gray-500 mt-2">or $140/year <span className="text-green-400">(save $28)</span></p>
                )}
                {isAnnual && (
                  <p className="text-sm text-green-400 mt-2 font-medium">Save $28 vs monthly</p>
                )}
              </div>

              <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-xs text-green-300 font-medium text-center">Everything in Starter, plus:</p>
              </div>

              <ul className="space-y-3 mb-8">
                {[
                  'Unlimited pre-market check-ins',
                  'AI-powered post-market reflection',
                  'Trade import & CSV analysis',
                  'Full PsychMirror access',
                  'Unlimited daily actions',
                  'Unlimited rules tracking',
                  'Basic AI mentor guidance',
                  'Email reminders',
                  'Weekly execution reports'
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-green-500 to-cyan-500 font-semibold text-lg hover:from-green-600 hover:to-cyan-600 transition-all"
                >
                  Start Free Trial
                </motion.button>
              </Link>

              <p className="text-xs text-center text-gray-500 mt-4">Most popular - 3,200 active traders</p>
            </motion.div>

            {/* TIER 3: PRO ($39) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="relative rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 backdrop-blur-sm p-6 sm:p-8"
            >
              {/* Premium Badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-sm font-semibold">
                  Premium
                </div>
              </div>

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
                <p className="text-gray-400 text-sm">For serious traders</p>
              </div>

              <div className="text-center mb-6">
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl font-bold text-white">
                    ${isAnnual ? '390' : '39'}
                  </span>
                  <span className="text-gray-400">{isAnnual ? '/year' : '/month'}</span>
                </div>
                {!isAnnual && (
                  <p className="text-sm text-gray-500 mt-2">or $390/year <span className="text-purple-400">(save $78)</span></p>
                )}
                {isAnnual && (
                  <p className="text-sm text-purple-400 mt-2 font-medium">Save $78 vs monthly</p>
                )}
              </div>

              <div className="mb-4 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <p className="text-xs text-purple-300 font-medium text-center">Everything in Trader, plus:</p>
              </div>

              <ul className="space-y-3 mb-8">
                {[
                  'Advanced AI mentor analysis',
                  'Custom broker integrations',
                  'Advanced pattern detection',
                  'Custom identity frameworks',
                  'Priority support (24h)',
                  'Accountability partner matching',
                  'Export reports for coaches',
                  'API access'
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 font-semibold text-lg hover:from-purple-600 hover:to-indigo-600 transition-all"
                >
                  Unlock Pro
                </motion.button>
              </Link>

              <p className="text-xs text-center text-gray-500 mt-4">For serious traders - 450+ professionals</p>
            </motion.div>
          </div>

          {/* 30-Day Money-Back Guarantee */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="max-w-2xl mx-auto mb-16"
          >
            <div className="p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <Shield className="w-8 h-8 text-cyan-400 flex-shrink-0" />
                <div>
                  <p className="text-white font-semibold mb-1">30-Day Money-Back Guarantee on All Paid Plans</p>
                  <p className="text-gray-400 text-sm">Not fixing your execution? Get a full refund within 30 days. No questions asked. Pro-rated refunds available anytime after that.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Feature Comparison Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="text-2xl font-bold text-center mb-8">Compare Plans</h3>
            
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto rounded-xl border border-white/10 bg-white/[0.02]">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Feature</th>
                    <th className="text-center py-4 px-4">
                      <div className="text-white font-bold">Starter</div>
                      <div className="text-sm text-gray-400 mt-1">Free</div>
                    </th>
                    <th className="text-center py-4 px-4">
                      <div className="text-white font-bold">Trader</div>
                      <div className="text-sm text-green-400 mt-1">$14/mo</div>
                    </th>
                    <th className="text-center py-4 px-4">
                      <div className="text-white font-bold">Pro</div>
                      <div className="text-sm text-purple-400 mt-1">$39/mo</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: 'Pre-market check-ins', starter: '3/week', trader: 'Unlimited', pro: 'Unlimited' },
                    { feature: 'Post-market AI reflection', starter: 'None', trader: 'Yes', pro: 'Advanced' },
                    { feature: 'Trade import', starter: 'None', trader: 'CSV/Manual', pro: 'Auto + CSV' },
                    { feature: 'PsychMirror', starter: 'View only', trader: 'Full access', pro: 'Custom frameworks' },
                    { feature: 'Daily actions', starter: '5 max', trader: 'Unlimited', pro: 'Unlimited' },
                    { feature: 'Rules tracking', starter: '3 max', trader: 'Unlimited', pro: 'Unlimited' },
                    { feature: 'AI mentor', starter: 'None', trader: 'Basic', pro: 'Advanced' },
                    { feature: 'Pattern detection', starter: 'None', trader: 'Basic', pro: 'Advanced multi-week' },
                    { feature: 'Email reminders', starter: 'No', trader: 'Yes', pro: 'Yes' },
                    { feature: 'Support', starter: 'Community', trader: 'Email', pro: 'Priority 24h' },
                    { feature: 'Broker integrations', starter: 'None', trader: 'None', pro: 'Yes' },
                    { feature: 'API access', starter: 'No', trader: 'No', pro: 'Yes' }
                  ].map((row, index) => (
                    <tr key={index} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-6 text-gray-300">{row.feature}</td>
                      <td className="py-4 px-4 text-center text-gray-400">{row.starter}</td>
                      <td className="py-4 px-4 text-center text-gray-300 font-medium">{row.trader}</td>
                      <td className="py-4 px-4 text-center text-purple-300 font-medium">{row.pro}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Accordion */}
            <div className="md:hidden space-y-3">
              {[
                { feature: 'Pre-market check-ins', starter: '3/week', trader: 'Unlimited', pro: 'Unlimited' },
                { feature: 'Post-market AI reflection', starter: 'None', trader: 'Yes', pro: 'Advanced' },
                { feature: 'Trade import', starter: 'None', trader: 'CSV/Manual', pro: 'Auto + CSV' },
                { feature: 'PsychMirror', starter: 'View only', trader: 'Full access', pro: 'Custom frameworks' },
                { feature: 'Daily actions', starter: '5 max', trader: 'Unlimited', pro: 'Unlimited' },
                { feature: 'Rules tracking', starter: '3 max', trader: 'Unlimited', pro: 'Unlimited' },
                { feature: 'AI mentor', starter: 'None', trader: 'Basic', pro: 'Advanced' },
                { feature: 'Pattern detection', starter: 'None', trader: 'Basic', pro: 'Advanced multi-week' },
                { feature: 'Email reminders', starter: 'No', trader: 'Yes', pro: 'Yes' },
                { feature: 'Support', starter: 'Community', trader: 'Email', pro: 'Priority 24h' },
                { feature: 'Broker integrations', starter: 'None', trader: 'None', pro: 'Yes' },
                { feature: 'API access', starter: 'No', trader: 'No', pro: 'Yes' }
              ].map((row, index) => (
                <div key={index} className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
                  <div className="font-medium text-white mb-3">{row.feature}</div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <div className="text-gray-500 text-xs mb-1">Starter</div>
                      <div className="text-gray-400">{row.starter}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs mb-1">Trader</div>
                      <div className="text-green-300 font-medium">{row.trader}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs mb-1">Pro</div>
                      <div className="text-purple-300 font-medium">{row.pro}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 flex items-center justify-center">
              <Dna className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold">Evos</span>
            <span className="text-xs text-gray-600 border border-gray-800 rounded px-2 py-0.5">Trader Discipline OS</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <Link to="/vision" className="hover:text-white transition-colors">For Traders</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          </div>
          <p className="text-sm text-gray-600">© 2024 Evos AI. Trading discipline system.</p>
        </div>
      </footer>
    </div>
  );
};
