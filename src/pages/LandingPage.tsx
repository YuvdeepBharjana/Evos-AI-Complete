import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Brain, MessageSquare, ArrowRight, ChevronDown, Zap, Target, Layers, Dna, Menu, X, TrendingUp, BarChart3, Calendar, AlertCircle, Bell, Megaphone, Sparkles, CheckCircle, XCircle, Shield, Activity } from 'lucide-react';

export const LandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#030014] text-white overflow-hidden">
      {/* Animated Background Grid */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:100px_100px]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-radial from-indigo-500/20 via-purple-500/5 to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-gradient-radial from-cyan-500/10 via-transparent to-transparent blur-3xl" />
        <div className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-gradient-radial from-fuchsia-500/10 via-transparent to-transparent blur-3xl" />
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

          {/* Desktop Nav - UPDATED FOR TRADERS */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" onClick={(e) => { e.preventDefault(); scrollToFeatures(); }} className="text-gray-400 hover:text-white transition-colors text-sm font-medium">How It Works</a>
            <Link to="/pricing" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">Pricing</Link>
            <Link to="/login" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">Login</Link>
            <Link
              to="/login"
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-lg blur opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-lg font-medium text-sm">
                Start 30-Day Reset
              </div>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/5 bg-[#030014]/95 backdrop-blur-xl"
            >
              <div className="px-4 py-4 space-y-3">
                <a 
                  href="#features"
                  onClick={(e) => { e.preventDefault(); scrollToFeatures(); setMobileMenuOpen(false); }}
                  className="block px-4 py-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  How It Works
                </a>
                <Link 
                  to="/pricing" 
                  className="block px-4 py-2 rounded-lg hover:bg-white/5 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
                <Link 
                  to="/login" 
                  className="block px-4 py-2 rounded-lg hover:bg-white/5 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/login"
                  className="block px-4 py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-500 text-center font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Start 30-Day Reset
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section - CENTERED */}
      <section className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 pt-20 pb-12 relative">
        <div className="max-w-5xl mx-auto w-full relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center space-y-8"
          >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-500/20 bg-gradient-to-r from-red-500/10 to-orange-500/10 backdrop-blur-sm"
              >
                <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                <span className="text-sm font-semibold text-red-300 tracking-wide">You Know Your Strategy. You Still Lose.</span>
              </motion.div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[0.95] tracking-tight">
                <span className="block text-white mb-4">Stop Breaking Your Rules.</span>
                <span className="block bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  Start Trading Profitably.
                </span>
              </h1>

              {/* Subheadline */}
              <p className="text-base sm:text-lg lg:text-xl text-gray-400 leading-relaxed max-w-3xl mx-auto">
                The gap between knowing your strategy and executing it consistently is costing you money. Evos AI closes that gap by <span className="text-white font-medium">tracking your behavior, enforcing your rules, and rewiring your trading identity</span> — so you finally trade the way you know you should.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col items-center gap-3">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <Link to="/login">
                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="group relative px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500" />
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className="relative flex items-center justify-center gap-2">
                        Fix Your Trading in 30 Days
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </motion.button>
                  </Link>
                  <motion.button
                    onClick={scrollToFeatures}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all"
                  >
                    See How It Works
                  </motion.button>
                </div>
                <p className="text-sm text-gray-500 italic">No signals. No bots. Just the system you have been missing.</p>
              </div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="flex items-center justify-center gap-8 sm:gap-12 pt-6 border-t border-white/5"
              >
                {[
                  { value: 'Consistency', label: 'Not luck' },
                  { value: 'Execution', label: 'Not strategy' },
                  { value: 'Identity', label: 'Not discipline' },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-lg sm:text-xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
                      {stat.value}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
                  </div>
                ))}
              </motion.div>

              {/* Authority Line */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="pt-6 border-t border-white/5"
              >
                <p className="text-base sm:text-lg font-semibold text-white leading-relaxed">
                  Your strategy is not the problem.
                  <br />
                  <span className="bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
                    Your inability to follow it consistently is.
                  </span>
                </p>
              </motion.div>

              {/* Platform Preview Image */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="mt-12 max-w-4xl mx-auto"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-cyan-500/20 rounded-3xl blur-3xl" />
                  <div className="relative rounded-2xl overflow-hidden border border-green-500/20 bg-gradient-to-br from-green-500/5 to-cyan-500/5 backdrop-blur-sm">
                    <img 
                      src="/hero1.png" 
                      alt="Evos AI Platform - Trading discipline system"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-green-900/10 to-cyan-900/10" />
                    
                    {/* Floating badge on image */}
                    <div className="absolute top-4 left-4 px-4 py-2 rounded-xl bg-green-500/20 backdrop-blur-md border border-green-500/30">
                      <p className="text-sm font-semibold text-green-300">Inside Evos AI</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
        </div>
      </section>

      {/* BEFORE/AFTER COMPARISON - Below Hero */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 relative">
        <div className="max-w-7xl mx-auto">
          {/* Section Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Why You Keep <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">Losing</span> vs. How You <span className="bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">Win</span>
            </h2>
            <p className="text-gray-400 text-lg">The difference between losing traders and profitable traders is not strategy — it is execution</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
            {/* LEFT: Emotion-Driven Trading */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-orange-500/5 rounded-2xl blur-xl" />
              <div className="relative rounded-2xl border border-red-500/20 bg-red-500/5 backdrop-blur-sm p-6 sm:p-8 overflow-hidden">
                {/* Section Label */}
                <h3 className="text-lg sm:text-xl font-bold text-red-400 mb-4">Why You Lose Money</h3>
                
                {/* Custom trader image: Overstimulated state */}
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-red-500/20 mb-4">
                  <img 
                    src="/trader-stressed.png" 
                    alt="Stressed trader losing money from emotional decisions"
                    className="w-full h-full object-cover"
                  />
                  {/* Subtle overlay to maintain theme consistency */}
                  <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 to-orange-900/10" />
                </div>
                
                <div className="space-y-2 text-sm text-gray-400">
                  <p className="flex items-center gap-2"><XCircle className="w-4 h-4 text-red-400" /> Breaking your stop loss</p>
                  <p className="flex items-center gap-2"><XCircle className="w-4 h-4 text-red-400" /> Taking revenge trades</p>
                  <p className="flex items-center gap-2"><XCircle className="w-4 h-4 text-red-400" /> Overtrading out of boredom</p>
                  <p className="flex items-center gap-2"><XCircle className="w-4 h-4 text-red-400" /> Ignoring your own rules</p>
                </div>
              </div>
            </motion.div>

            {/* RIGHT: System-Driven Execution */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-indigo-500/5 rounded-2xl blur-xl" />
              <div className="relative rounded-2xl border border-green-500/20 bg-green-500/5 backdrop-blur-sm p-6 sm:p-8 overflow-hidden">
                {/* Section Label */}
                <h3 className="text-lg sm:text-xl font-bold text-green-400 mb-4">How You Become Profitable (With Evos)</h3>
                
                {/* Custom trader image: Calm, disciplined state */}
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-green-500/20 mb-4">
                  <img 
                    src="/trader-unstressed.png" 
                    alt="Profitable trader following their system consistently"
                    className="w-full h-full object-cover"
                  />
                  {/* Subtle overlay to maintain theme consistency */}
                  <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 to-cyan-900/10" />
                </div>
                
                <div className="space-y-2 text-sm text-gray-400">
                  <p className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Following your plan every day</p>
                  <p className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Only taking high-probability setups</p>
                  <p className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Respecting stop losses always</p>
                  <p className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Trading without emotional interference</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* NEW: PAIN RECOGNITION SECTION - Blurred Background with Overlay */}
      {/* Shows trader stress with sharp, punchy pain point copy */}
      <section className="py-16 sm:py-32 px-4 sm:px-6 relative overflow-hidden">
        {/* Blurred background image placeholder */}
        <div className="absolute inset-0 z-0">
          {/* Image placeholder: Stressed trader at screen, head in hands, red charts visible */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-900/30 via-gray-900/50 to-purple-900/30" />
          <div className="absolute inset-0 backdrop-blur-2xl bg-black/60" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8 sm:mb-12">
              You Are Not <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">Losing</span> Because of Your Strategy
            </h2>
            
            {/* Sharp, punchy pain points */}
            <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto mb-12">
              {[
                { text: 'Your strategy works', subtext: 'You just cannot follow it consistently' },
                { text: 'One red day ruins you', subtext: 'Revenge trading to "get it back"' },
                { text: 'One green day makes you reckless', subtext: 'Overconfidence kills your edge' },
                { text: 'Your PnL controls your emotions', subtext: 'Your identity is tied to outcome' },
              ].map((point, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm text-left"
                >
                  <p className="text-white font-semibold mb-1">{point.text}</p>
                  <p className="text-sm text-gray-400">{point.subtext}</p>
                </motion.div>
              ))}
            </div>

            <p className="text-lg sm:text-2xl font-medium text-white">
              The gap between knowing what to do and actually doing it <span className="bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">is the only thing keeping you from profitability.</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Daily Loop Section - UPDATED FOR TRADERS */}
      <section id="features" className="py-16 sm:py-32 px-4 sm:px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/5 to-transparent" />
        <div className="max-w-6xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-20"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">The Daily Loop</h2>
            <p className="text-gray-400 text-base sm:text-lg">Your discipline operating system</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                icon: Calendar,
                title: 'Pre-Market Check-In',
                subtitle: 'Identity Priming',
                description: 'Set your identity goals and review your trading rules before the market opens. Prime your mindset for disciplined execution.',
                gradient: 'from-emerald-500 to-teal-500',
                border: 'border-emerald-500/20',
                glow: 'emerald'
              },
              {
                icon: BarChart3,
                title: 'Trade Import & Tracking',
                subtitle: 'Behavior Analysis',
                description: 'Import trades or CSV data. AI learns your patterns — when you follow rules, when you deviate, and what triggers both.',
                gradient: 'from-indigo-500 to-purple-500',
                border: 'border-indigo-500/20',
                glow: 'indigo'
              },
              {
                icon: TrendingUp,
                title: 'Post-Market Reflection',
                subtitle: 'Process Over PnL',
                description: 'Reconcile rules vs. actions. Focus on execution quality, not outcomes. Build the identity of a disciplined trader.',
                gradient: 'from-cyan-500 to-blue-500',
                border: 'border-cyan-500/20',
                glow: 'cyan'
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                className={`relative group rounded-2xl border ${feature.border} bg-white/[0.02] backdrop-blur-sm p-6 sm:p-8 hover:bg-white/[0.04] transition-all duration-500`}
              >
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                <div className={`w-12 sm:w-14 h-12 sm:h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-6 sm:w-7 h-6 sm:h-7 text-white" />
                </div>
                <div className="text-xs font-semibold text-gray-500 tracking-wider uppercase mb-2">
                  Phase {index + 1}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-1">{feature.title}</h3>
                <p className={`text-sm bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent font-medium mb-3 sm:mb-4`}>
                  {feature.subtitle}
                </p>
                <p className="text-gray-400 leading-relaxed text-sm sm:text-base">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* NEW: PROCESS VISUALIZATION - Repeatable System Flow */}
      {/* 3-step horizontal flow showing the systematic approach */}
      <section className="py-16 sm:py-32 px-4 sm:px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent" />
        <div className="max-w-6xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 mb-4">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs font-semibold text-cyan-400 tracking-wider uppercase">Repeatable System</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
              A Process You Can <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Trust</span>
            </h2>
            <p className="text-gray-400 text-base sm:text-lg">Not motivation. Not willpower. Just structure.</p>
          </motion.div>

          {/* 3-Step Horizontal Flow */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
            {[
              {
                step: '01',
                icon: Calendar,
                title: 'Pre-Market Identity Calibration',
                desc: 'Set your identity statement for the day',
                color: 'emerald',
                gradient: 'from-emerald-500 to-teal-500'
              },
              {
                step: '02',
                icon: Shield,
                title: 'In-Session Execution Guardrails',
                desc: 'Real-time rule adherence tracking',
                color: 'indigo',
                gradient: 'from-indigo-500 to-purple-500'
              },
              {
                step: '03',
                icon: Brain,
                title: 'Post-Market Pattern Extraction',
                desc: 'AI learns what worked, what did not, and why',
                color: 'cyan',
                gradient: 'from-cyan-500 to-blue-500'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                className="w-full"
              >
                {/* Step number */}
                <div className={`text-6xl font-bold bg-gradient-to-br ${item.gradient} bg-clip-text text-transparent text-center mb-4 opacity-50`}>
                  {item.step}
                </div>

                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mx-auto mb-4`}>
                  <item.icon className="w-8 h-8 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-white text-center mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400 text-center mb-4">{item.desc}</p>

                {/* UI Screenshot */}
                <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden aspect-[4/3]">
                  {item.step === '01' ? (
                    <img 
                      src="/premarket-identity-calibration.png" 
                      alt="Pre-Market Identity Calibration interface"
                      className="w-full h-full object-cover"
                    />
                  ) : item.step === '02' ? (
                    <img 
                      src="/insertionexecution.png" 
                      alt="In-Session Execution Guardrails interface"
                      className="w-full h-full object-cover"
                    />
                  ) : item.step === '03' ? (
                    <img 
                      src="/postmarketpatternextraction.png" 
                      alt="Post-Market Pattern Extraction interface"
                      className="w-full h-full object-cover"
                    />
                  ) : null}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Evos Section - UPDATED FOR TRADERS */}
      <section className="py-16 sm:py-32 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 sm:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 mb-4 sm:mb-6">
                <Target className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-xs font-semibold text-purple-400 tracking-wider uppercase">Why Evos</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
                Not a Signal Service.
                <br />
                Not a Trading Bot.
                <br />
                <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">A Discipline OS.</span>
              </h2>
              <p className="text-base sm:text-lg text-gray-400 leading-relaxed mb-6 sm:mb-8">
                Evos AI isn't a motivational coach or a strategy tool. 
                <span className="text-white font-medium"> It's an identity and discipline operating system that guides traders to rebuild consistency from the inside out.</span>
              </p>
              <div className="space-y-3 sm:space-y-4">
                {[
                  'Separate your identity from PnL swings and outcomes',
                  'Build rule-following discipline through daily reinforcement',
                  'Track execution quality, not just profit and loss',
                  'Evolve into the trader you know you can be'
                ].map((point, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-300 text-sm sm:text-base">{point}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 rounded-3xl blur-3xl" />
              <div className="relative rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-6 sm:p-8">
                <div className="text-center mb-6 sm:mb-8">
                  <Layers className="w-10 sm:w-12 h-10 sm:h-12 mx-auto text-indigo-400 mb-3 sm:mb-4" />
                  <h3 className="text-lg sm:text-xl font-bold">What We Track</h3>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  {[
                    { layer: 'Rule Adherence', desc: "Following your plan", color: 'from-emerald-500 to-teal-500' },
                    { layer: 'Emotional Triggers', desc: 'What causes deviation', color: 'from-orange-500 to-red-500' },
                    { layer: 'Execution Quality', desc: 'Process over outcome', color: 'from-blue-500 to-indigo-500' },
                    { layer: 'Identity Beliefs', desc: 'Who you are as a trader', color: 'from-purple-500 to-pink-500' },
                    { layer: 'Daily Consistency', desc: 'Showing up with discipline', color: 'from-cyan-500 to-blue-500' },
                  ].map((item, i) => (
                    <motion.div
                      key={item.layer}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-3 sm:gap-4 p-2.5 sm:p-3 rounded-xl bg-white/5 border border-white/5"
                    >
                      <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${item.color}`} />
                      <div>
                        <div className="font-semibold text-white text-sm sm:text-base">{item.layer}</div>
                        <div className="text-xs sm:text-sm text-gray-500">{item.desc}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* NEW: WHAT EVOS IS NOT - Filter Section */}
      {/* Shows what Evos explicitly is NOT - builds confidence through clarity */}
      <section className="py-16 sm:py-32 px-4 sm:px-6 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              What Evos <span className="line-through text-gray-600">Is Not</span>
            </h2>
            <p className="text-gray-400 text-base sm:text-lg">No shortcuts. No hype. Just discipline.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              {
                icon: TrendingUp,
                title: 'No Signals',
                desc: 'We do not tell you what to trade',
                color: 'red'
              },
              {
                icon: Bell,
                title: 'No Alerts',
                desc: 'We do not spam you with noise',
                color: 'red'
              },
              {
                icon: Megaphone,
                title: 'No Lifestyle Marketing',
                desc: 'No Lambos, no fake wins',
                color: 'red'
              },
              {
                icon: Sparkles,
                title: 'No Hype',
                desc: 'Just structure and discipline',
                color: 'red'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="relative group"
              >
                {/* Crossed out effect */}
                <div className="relative rounded-2xl border border-red-500/20 bg-red-500/5 backdrop-blur-sm p-6 text-center">
                  {/* Diagonal line through card */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-full h-0.5 bg-red-500/50 rotate-12 scale-150" />
                  </div>
                  
                  {/* Muted icon */}
                  <div className="relative z-10 opacity-40">
                    <item.icon className="w-12 h-12 text-red-400 mx-auto mb-3" />
                    <h3 className="font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Confidence statement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="mt-12 text-center"
          >
            <p className="text-lg sm:text-xl text-gray-400">
              Evos is a <span className="text-white font-semibold">discipline and identity OS</span> for traders who are done chasing and ready to build.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Journey Steps - UPDATED FOR TRADERS */}
      <section className="py-16 sm:py-32 px-4 sm:px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent" />
        <div className="max-w-4xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4">The 30-Day Trader Reset</h2>
            <p className="text-gray-400">From reactive to disciplined</p>
          </motion.div>

          <div className="space-y-1">
            {[
              { step: '01', title: 'Define your trader identity', desc: 'Set rules, goals, and the trader you want to become — independent of PnL' },
              { step: '02', title: 'Daily check-ins & reflections', desc: 'Pre-market prep and post-market process reviews. Build the habit of discipline.' },
              { step: '03', title: 'Track execution, not outcomes', desc: 'AI learns when you follow rules and when you do not. Reinforce what works.' },
              { step: '04', title: 'Watch your identity evolve', desc: 'See discipline strengthen over 30 days. Become the trader you committed to be.' }
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-4 sm:gap-8 p-4 sm:p-6 rounded-xl hover:bg-white/[0.02] transition-colors group"
              >
                <div className="text-3xl sm:text-5xl font-bold bg-gradient-to-b from-indigo-400 to-indigo-600/30 bg-clip-text text-transparent">
                  {item.step}
                </div>
                <div className="pt-1 sm:pt-2">
                  <h3 className="text-lg sm:text-xl font-bold mb-1 group-hover:text-indigo-400 transition-colors">{item.title}</h3>
                  <p className="text-gray-500 text-sm sm:text-base">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FOUNDER ORIGIN STORY */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 relative">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 backdrop-blur-sm p-8 sm:p-12"
          >
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold mb-4 text-white">Built by a trader who kept losing to himself</h3>
                <p className="text-gray-400 leading-relaxed mb-4">
                  Evos AI was born from years of personal struggle. I had a winning strategy, a tested edge, and the knowledge to be profitable. But I kept breaking my rules. One bad trade would spiral me. One good trade would make me reckless. My identity was tied to my PnL, and it was destroying my consistency.
                </p>
                <p className="text-gray-400 leading-relaxed">
                  I realized the gap was not strategy — it was <span className="text-white font-semibold">execution and identity</span>. So I built Evos: a system that tracks your behavior, enforces your rules, and separates who you are from what you make. This is the tool I wish I had years ago.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* TESTIMONIALS / SOCIAL PROOF */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Traders Who Fixed Their Execution</h2>
            <p className="text-gray-400">Real results from traders who stopped breaking their rules</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "Before Evos I broke my stop loss almost daily. Now I have not violated a single rule in 3 weeks. My P&L is finally positive.",
                name: "Alex M.",
                role: "Day Trader",
                metric: "21 days rule-adherent"
              },
              {
                quote: "I was overtrading out of boredom and FOMO. Evos made me realize my triggers and now I only take my A+ setups. Fewer trades, better results.",
                name: "Sarah K.",
                role: "Swing Trader",
                metric: "Reduced trades by 60%"
              },
              {
                quote: "My strategy was solid but I could not follow it consistently. Evos tracks everything and holds me accountable. I am finally the trader I know I can be.",
                name: "Mike T.",
                role: "Futures Trader",
                metric: "30-day streak maintained"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative rounded-xl border border-green-500/20 bg-gradient-to-br from-green-500/5 to-cyan-500/5 backdrop-blur-sm p-6"
              >
                <div className="absolute top-4 right-4 text-green-400/20">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <p className="text-gray-300 mb-6 italic leading-relaxed">"{testimonial.quote}"</p>
                <div className="border-t border-white/10 pt-4">
                  <p className="font-semibold text-white">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                  <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    <span className="text-xs text-green-300 font-medium">{testimonial.metric}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING / PLANS - 3-TIER MODEL */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 relative" id="pricing">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Start Free. Upgrade When Ready.</h2>
            <p className="text-gray-400 mb-4">Choose the plan that fits your trading journey</p>
            
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
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            
            {/* TIER 1: STARTER (FREE) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0 }}
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
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
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
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
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

          {/* 30-Day Money-Back Guarantee - Applies to All Paid Tiers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 max-w-2xl mx-auto"
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
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16"
          >
            <h3 className="text-2xl font-bold text-center mb-8">Compare Plans</h3>
            
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-4 px-4 text-gray-400 font-medium">Feature</th>
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
                      <td className="py-4 px-4 text-gray-300">{row.feature}</td>
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
      </section>

      {/* FAQ SECTION */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 relative">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-400">Everything you need to know about Evos AI</p>
          </motion.div>

          <div className="space-y-4">
            {[
              {
                question: "Is this a trading bot or signal service?",
                answer: "No. Evos is a discipline and identity operating system. We do not generate signals, execute trades, or replace your strategy. We help you follow the strategy you already have by tracking your behavior, enforcing your rules, and separating your identity from your P&L."
              },
              {
                question: "Do I need to change my trading strategy?",
                answer: "Not at all. Evos works with whatever strategy you currently use. The problem is not your strategy — it is your ability to follow it consistently. We help you execute what you already know works."
              },
              {
                question: "How much time does this take per day?",
                answer: "5-10 minutes. Pre-market check-in takes 2-3 minutes to set your identity and rules. Post-market reflection takes 3-5 minutes to review execution. The system runs in the background and tracks your behavior throughout the day."
              },
              {
                question: "Can I upgrade or downgrade anytime?",
                answer: "Yes! You can upgrade or downgrade your plan anytime with one click. Changes take effect immediately. If you upgrade mid-month, you will only pay the pro-rated difference. If you downgrade, we will credit your account for the unused portion."
              },
              {
                question: "What if I am already profitable?",
                answer: "Great! Evos helps you maintain and scale your edge. Profitable traders still struggle with consistency, overtrading, and emotional interference. We help you lock in discipline so you can grow your account without blowing up."
              },
              {
                question: "Can I cancel anytime?",
                answer: "Yes. Cancel anytime with one click. No contracts, no hidden fees. And if you are not satisfied within the first 30 days, we will refund you completely — no questions asked."
              },
              {
                question: "Does this work for day traders, swing traders, or both?",
                answer: "Both. Evos works for any trading style — day trading, swing trading, futures, forex, crypto, stocks. The principles of discipline, rule-following, and identity separation apply universally."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 hover:border-cyan-500/30 transition-colors"
              >
                <h3 className="text-lg font-bold text-white mb-3">{faq.question}</h3>
                <p className="text-gray-400 leading-relaxed">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* NEW: FINAL CTA SECTION - Calm, Grounded Close */}
      {/* Visual of trader closing laptop, ending day with identity intact */}
      <section className="py-16 sm:py-32 px-4 sm:px-6 relative overflow-hidden">
        {/* Calm background visual */}
        <div className="absolute inset-0 z-0">
          {/* Image placeholder: Trader closing laptop, calm expression, end of day */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-gray-900/40 to-cyan-900/20" />
          <div className="absolute inset-0 backdrop-blur-3xl bg-black/70" />
          {/* Overlay text indicating image intent */}
          <div className="absolute bottom-4 left-4 text-xs text-gray-600 font-mono opacity-50">
            [Background: Trader closing laptop peacefully, end of day, soft lighting]
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center relative z-10"
        >
          <div className="relative rounded-2xl sm:rounded-3xl border border-cyan-500/20 bg-cyan-500/5 backdrop-blur-sm p-8 sm:p-12 md:p-20 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-radial from-cyan-500/10 via-transparent to-transparent blur-2xl" />
            
            <div className="relative">
              {/* Identity-based outcome statement */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 mb-6"
              >
                <CheckCircle className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-medium text-cyan-300">End every day knowing you followed your rules</span>
              </motion.div>

              <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6">
                Stop tying your identity
                <br />
                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">to your PnL</span>
              </h2>
              
              <p className="text-gray-400 text-base sm:text-lg mb-8 sm:mb-10 max-w-xl mx-auto">
                Your worth as a trader isn't measured in dollars. It's measured in discipline, consistency, and identity alignment.
              </p>
              
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative px-8 sm:px-10 py-4 sm:py-5 rounded-xl font-semibold text-base sm:text-lg overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500" />
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative flex items-center gap-2">
                    Begin Your 30-Day Reset
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </motion.button>
              </Link>

              {/* Calm reassurance */}
              <p className="mt-8 text-sm text-gray-500">
                No credit card required. No hype. Just discipline.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 px-4 sm:px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 flex items-center justify-center">
              <Dna className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold">Evos</span>
            <span className="text-xs text-gray-600 border border-gray-800 rounded px-2 py-0.5 hidden sm:inline">Trader Discipline OS</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-gray-500">
            <Link to="/vision" className="hover:text-white transition-colors">Vision</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          </div>
          <p className="text-xs sm:text-sm text-gray-600">© 2024 Evos AI</p>
        </div>
      </footer>
    </div>
  );
};
