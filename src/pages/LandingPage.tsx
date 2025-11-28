import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, Brain, MessageSquare, Sparkles, ArrowRight, ChevronDown, Zap, Target, Layers, Dna } from 'lucide-react';

export const LandingPage = () => {
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
          <div className="flex items-center gap-8">
            <Link to="/vision" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">Vision</Link>
            <Link to="/contact" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">Contact</Link>
            <Link
              to="/login"
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-lg blur opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-lg font-medium text-sm">
                Get Started
              </div>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 pt-20 relative">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-5xl relative z-10"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 mb-8"
          >
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-sm font-medium text-indigo-300 tracking-wide uppercase">World's First Identity Engineering Platform</span>
          </motion.div>

          {/* Main Headline */}
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold mb-8 leading-[0.95] tracking-tight">
            <span className="block text-white">Engineer Your</span>
            <span className="block bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Identity.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
            Evos extracts the hidden patterns from your conversations and builds a living neural map of who you are. 
            <span className="text-white font-medium"> See yourself. Transform yourself.</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="group relative px-8 py-4 rounded-xl font-semibold text-lg overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500" />
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative flex items-center gap-2">
                  Start Engineering
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.button>
            </Link>
            <motion.button
              onClick={scrollToFeatures}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 rounded-xl font-semibold text-lg border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all"
            >
              See How It Works
            </motion.button>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="flex items-center justify-center gap-12 mt-20 pt-12 border-t border-white/5"
          >
            {[
              { value: 'First', label: 'Of Its Kind' },
              { value: '∞', label: 'Identity Nodes' },
              { value: 'Real-time', label: 'Evolution' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="w-6 h-6 text-gray-600" />
          </motion.div>
        </motion.div>
      </section>

      {/* What is Identity Engineering */}
      <section className="py-32 px-6 relative">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 mb-6">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs font-semibold text-cyan-400 tracking-wider uppercase">A New Category</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              What is <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Identity Engineering?</span>
            </h2>
            <p className="text-xl text-gray-400 leading-relaxed max-w-3xl mx-auto">
              Identity Engineering is the systematic process of <span className="text-white">understanding, visualizing, and evolving</span> the patterns that make you <em>you</em>. 
              Unlike habit trackers that measure what you do, Evos maps <span className="text-white">who you are</span> — your goals, beliefs, struggles, and growth edges — as an interactive neural network.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/5 to-transparent" />
        <div className="max-w-6xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">The Engineering Process</h2>
            <p className="text-gray-400 text-lg">Three phases to transform self-understanding</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Upload,
                title: 'Extract',
                subtitle: 'Import Your Data',
                description: 'Upload conversations, journals, or AI chat exports. Our engine extracts identity patterns invisible to the naked eye.',
                gradient: 'from-emerald-500 to-teal-500',
                border: 'border-emerald-500/20',
                glow: 'emerald'
              },
              {
                icon: Brain,
                title: 'Map',
                subtitle: 'Visualize Your Identity',
                description: 'Watch as your goals, habits, traits, and struggles crystallize into a living 3D neural network — your psychological fingerprint.',
                gradient: 'from-indigo-500 to-purple-500',
                border: 'border-indigo-500/20',
                glow: 'indigo'
              },
              {
                icon: MessageSquare,
                title: 'Evolve',
                subtitle: 'Grow In Real-Time',
                description: 'Every conversation strengthens nodes, reveals new connections, and tracks your transformation over time.',
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
                className={`relative group rounded-2xl border ${feature.border} bg-white/[0.02] backdrop-blur-sm p-8 hover:bg-white/[0.04] transition-all duration-500`}
              >
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <div className="text-xs font-semibold text-gray-500 tracking-wider uppercase mb-2">
                  Phase {index + 1}
                </div>
                <h3 className="text-2xl font-bold mb-1">{feature.title}</h3>
                <p className={`text-sm bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent font-medium mb-4`}>
                  {feature.subtitle}
                </p>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Different Section */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 mb-6">
                <Target className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-xs font-semibold text-purple-400 tracking-wider uppercase">Why We're Different</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Not Another
                <br />
                <span className="text-gray-500 line-through">Habit Tracker</span>
              </h2>
              <p className="text-lg text-gray-400 leading-relaxed mb-8">
                Habit trackers count checkboxes. Journaling apps store text. 
                <span className="text-white font-medium"> Evos engineers identity.</span>
              </p>
              <div className="space-y-4">
                {[
                  'Dynamic neural visualization of your psychological landscape',
                  'AI-powered pattern extraction from natural conversation',
                  'Real-time identity evolution tracking over time',
                  'Actionable insights tied to who you are, not just what you do'
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
                    <span className="text-gray-300">{point}</span>
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
              <div className="relative rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-8">
                <div className="text-center mb-8">
                  <Layers className="w-12 h-12 mx-auto text-indigo-400 mb-4" />
                  <h3 className="text-xl font-bold">Your Identity Layers</h3>
                </div>
                <div className="space-y-4">
                  {[
                    { layer: 'Goals', desc: "What you're reaching for", color: 'from-emerald-500 to-teal-500' },
                    { layer: 'Habits', desc: 'Patterns that shape your days', color: 'from-blue-500 to-indigo-500' },
                    { layer: 'Traits', desc: 'Core characteristics', color: 'from-purple-500 to-pink-500' },
                    { layer: 'Struggles', desc: 'Growth edges to work through', color: 'from-orange-500 to-red-500' },
                    { layer: 'Interests', desc: 'What lights you up', color: 'from-cyan-500 to-blue-500' },
                  ].map((item, i) => (
                    <motion.div
                      key={item.layer}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5"
                    >
                      <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${item.color}`} />
                      <div>
                        <div className="font-semibold text-white">{item.layer}</div>
                        <div className="text-sm text-gray-500">{item.desc}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Journey Steps */}
      <section className="py-32 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent" />
        <div className="max-w-4xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Your Engineering Journey</h2>
            <p className="text-gray-400">From data to transformation</p>
          </motion.div>

          <div className="space-y-1">
            {[
              { step: '01', title: 'Import your conversations', desc: 'ChatGPT exports, journals, notes — anywhere you express yourself' },
              { step: '02', title: 'AI extracts your patterns', desc: 'Goals, habits, struggles, beliefs, and emotions emerge from your words' },
              { step: '03', title: 'Visualize your neural map', desc: 'See yourself as an interactive identity graph with weighted connections' },
              { step: '04', title: 'Evolve with every session', desc: 'Watch nodes strengthen, new patterns emerge, and your identity transform' }
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-8 p-6 rounded-xl hover:bg-white/[0.02] transition-colors group"
              >
                <div className="text-5xl font-bold bg-gradient-to-b from-indigo-400 to-indigo-600/30 bg-clip-text text-transparent">
                  {item.step}
                </div>
                <div className="pt-2">
                  <h3 className="text-xl font-bold mb-1 group-hover:text-indigo-400 transition-colors">{item.title}</h3>
                  <p className="text-gray-500">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/10 via-transparent to-transparent" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center relative"
        >
          <div className="relative rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-12 md:p-20 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-radial from-indigo-500/20 via-transparent to-transparent blur-2xl" />
            <div className="relative">
              <h2 className="text-4xl md:text-6xl font-bold mb-6">
                Ready to meet
                <br />
                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">yourself?</span>
              </h2>
              <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
                Be among the first to experience identity engineering. 
                Your psychological mirror is waiting.
              </p>
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative px-10 py-5 rounded-xl font-semibold text-lg overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500" />
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative flex items-center gap-2">
                    Begin Engineering Your Identity
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </motion.button>
              </Link>
            </div>
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
            <span className="text-xs text-gray-600 border border-gray-800 rounded px-2 py-0.5">Identity Engineering</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link to="/vision" className="hover:text-white transition-colors">Vision</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          </div>
          <p className="text-sm text-gray-600">© 2024 Evos AI. The world's first identity engineering platform.</p>
        </div>
      </footer>
    </div>
  );
};
