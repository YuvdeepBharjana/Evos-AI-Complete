import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Dna, TrendingUp, Shield, Brain, Target, CheckCircle, XCircle, BarChart3, Calendar } from 'lucide-react';

export const VisionPage = () => {
  return (
    <div className="min-h-screen bg-[#030014] text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:100px_100px]" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-radial from-green-500/15 via-transparent to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-radial from-cyan-500/10 via-transparent to-transparent blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#030014]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 flex items-center justify-center">
                <Dna className="w-5 h-5 text-white" />
              </div>
            </div>
            <span className="font-bold text-xl tracking-tight">Evos</span>
          </Link>
          <Link to="/login" className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-cyan-500 rounded-lg blur opacity-50 group-hover:opacity-75 transition-opacity" />
            <div className="relative px-5 py-2.5 bg-gradient-to-r from-green-500 to-cyan-500 rounded-lg font-medium text-sm">
              Start 30-Day Reset
            </div>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative">
        <div className="max-w-5xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-12 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm">Back to Home</span>
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-green-500/30 bg-green-500/10 mb-8">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-green-300">For Traders</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-[1.1]">
              <span className="block text-white mb-2">You Do Not Need</span>
              <span className="block bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Another Strategy.
              </span>
            </h1>
            
            <p className="text-xl text-gray-400 leading-relaxed max-w-3xl mb-8">
              You need a system that makes you follow the one you already have. 
              Evos AI is the discipline operating system that closes the gap between 
              <span className="text-white font-semibold"> knowing what to do</span> and
              <span className="text-white font-semibold"> actually doing it.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 rounded-xl bg-gradient-to-r from-green-500 to-cyan-500 font-semibold text-lg"
                >
                  Start Free Trial
                </motion.button>
              </Link>
              <Link to="/pricing">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 rounded-xl border border-white/20 hover:bg-white/5 font-semibold text-lg transition-all"
                >
                  View Pricing
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* The Problem - Trader Pain Points */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-400" />
              </div>
              <span className="text-sm font-semibold text-red-400 tracking-wider uppercase">The Problem</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              You Are <span className="text-red-400">Not Losing</span> Because of Your Strategy
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {[
                { 
                  title: 'You know your edge works', 
                  desc: 'Your backtest shows it. Your best days prove it. But you cannot execute it consistently.' 
                },
                { 
                  title: 'One bad trade spirals you', 
                  desc: 'A stop loss hit triggers revenge trading. You chase losses trying to "get it back" and make it worse.' 
                },
                { 
                  title: 'One good trade makes you reckless', 
                  desc: 'A winning streak inflates your ego. You size up, ignore risk management, and give it all back.' 
                },
                { 
                  title: 'Your identity is tied to your PnL', 
                  desc: 'Green days make you feel invincible. Red days make you question everything. Your mood swings with your account.' 
                }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 rounded-xl bg-red-500/5 border border-red-500/20"
                >
                  <h4 className="font-semibold text-white mb-2">{item.title}</h4>
                  <p className="text-gray-400 text-sm">{item.desc}</p>
                </motion.div>
              ))}
            </div>

            <p className="text-2xl text-gray-300 text-center max-w-3xl mx-auto">
              The gap between <span className="text-white font-semibold">knowing what to do</span> and <span className="text-white font-semibold">actually doing it</span> is the <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent font-bold">only thing keeping you from profitability.</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* How Evos Solves It */}
      <section className="py-20 px-6 bg-gradient-to-b from-transparent via-green-500/5 to-transparent">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <span className="text-sm font-semibold text-green-400 tracking-wider uppercase">The Solution</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              Evos Makes Discipline <span className="bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">Systematic, Not Emotional</span>
            </h2>

            <div className="space-y-6 mb-12">
              {[
                {
                  icon: Calendar,
                  number: '01',
                  title: 'Pre-Market Identity Calibration',
                  desc: 'Every morning, set your trader identity for the day. Define your rules, your edge, and the trader you commit to being — before the market opens.',
                  benefit: 'Prime your mindset before emotions take over'
                },
                {
                  icon: Shield,
                  number: '02',
                  title: 'In-Session Execution Guardrails',
                  desc: 'Import trades or track live. Evos monitors if you are following your rules in real-time and alerts you when you deviate.',
                  benefit: 'Stop bad trades before they happen'
                },
                {
                  icon: Brain,
                  number: '03',
                  title: 'Post-Market Pattern Extraction',
                  desc: 'AI analyzes what worked, what did not, and why. Learn your emotional triggers, identify patterns, and evolve your execution.',
                  benefit: 'Turn experience into systematic improvement'
                }
              ].map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative rounded-2xl border border-green-500/20 bg-gradient-to-br from-green-500/5 to-cyan-500/5 backdrop-blur-sm p-8 overflow-hidden"
                >
                  <div className="absolute top-4 right-4 text-6xl font-bold text-green-500/10">{step.number}</div>
                  <div className="flex items-start gap-6">
                    <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <step.icon className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                      <p className="text-gray-400 mb-3">{step.desc}</p>
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                        <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                        <span className="text-xs text-green-300 font-medium">{step.benefit}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-cyan-400" />
              </div>
              <span className="text-sm font-semibold text-cyan-400 tracking-wider uppercase">Who This Is For</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-12">
              Evos Is Built For <span className="bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent">Traders Who Know Better</span>
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              {/* For */}
              <div className="p-8 rounded-2xl bg-green-500/5 border border-green-500/20">
                <div className="flex items-center gap-3 mb-6">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <h3 className="text-xl font-bold text-white">This Is For You If:</h3>
                </div>
                <ul className="space-y-4">
                  {[
                    'You have a working strategy but cannot stick to it',
                    'You break your rules when emotions run high',
                    'You overtrade, revenge trade, or chase losses',
                    'Your mood is controlled by your PnL',
                    'You want to separate your identity from outcomes',
                    'You are ready to treat trading like a business'
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Not For */}
              <div className="p-8 rounded-2xl bg-red-500/5 border border-red-500/20">
                <div className="flex items-center gap-3 mb-6">
                  <XCircle className="w-6 h-6 text-red-400" />
                  <h3 className="text-xl font-bold text-white">This Is NOT For You If:</h3>
                </div>
                <ul className="space-y-4">
                  {[
                    'You are looking for trading signals or alerts',
                    'You want a bot to trade for you',
                    'You are searching for a "holy grail" strategy',
                    'You are not willing to track your behavior',
                    'You expect instant results without effort',
                    'You are not serious about fixing your execution'
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Results / Benefits */}
      <section className="py-20 px-6 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-sm font-semibold text-purple-400 tracking-wider uppercase">What You Get</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-12">
              Trade With <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Discipline, Not Hope</span>
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: 'Consistent Execution',
                  desc: 'Follow your rules every single day, regardless of how you feel',
                  metric: '30% avg. improvement in rule adherence'
                },
                {
                  title: 'Emotional Control',
                  desc: 'Stop revenge trading, overtrading, and impulsive decisions',
                  metric: '60% reduction in emotional trades'
                },
                {
                  title: 'Identity Shift',
                  desc: 'Separate who you are from what your P&L shows',
                  metric: 'Sustainable long-term performance'
                }
              ].map((benefit, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 rounded-xl bg-white/[0.02] border border-white/10"
                >
                  <h4 className="font-bold text-white mb-3">{benefit.title}</h4>
                  <p className="text-gray-400 text-sm mb-4">{benefit.desc}</p>
                  <div className="text-xs text-cyan-400 font-medium">{benefit.metric}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-green-500/10 via-transparent to-transparent" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center relative"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to <span className="bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">Fix Your Trading?</span>
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Start free. No credit card required. See results in 30 days.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="group relative px-10 py-5 rounded-xl font-semibold text-lg overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-cyan-500" />
                <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative flex items-center gap-2">
                  Start 30-Day Discipline Reset
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.button>
            </Link>
            <Link to="/pricing">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-10 py-5 rounded-xl border border-white/20 hover:bg-white/5 font-semibold text-lg transition-all"
              >
                View Pricing Plans
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </section>

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
            <Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link>
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
