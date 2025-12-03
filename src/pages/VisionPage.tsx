import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, ArrowLeft, Dna, Zap, Globe, Rocket, Brain, Users, Sparkles } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';

// Typing animation component that triggers on scroll
const TypeWriter = ({ 
  text, 
  className = '', 
  speed = 30,
  delay = 0,
  gradient = false
}: { 
  text: string; 
  className?: string; 
  speed?: number;
  delay?: number;
  gradient?: boolean;
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!isInView) return;
    
    let timeout: NodeJS.Timeout;
    let currentIndex = 0;
    
    const startTyping = () => {
      const typeNextChar = () => {
        if (currentIndex < text.length) {
          setDisplayText(text.slice(0, currentIndex + 1));
          currentIndex++;
          timeout = setTimeout(typeNextChar, speed);
        } else {
          setIsComplete(true);
        }
      };
      typeNextChar();
    };

    timeout = setTimeout(startTyping, delay);

    return () => clearTimeout(timeout);
  }, [isInView, text, speed, delay]);

  const baseClass = gradient 
    ? "bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent"
    : "";

  return (
    <span ref={ref} className={`${className} ${baseClass}`}>
      {displayText}
      {!isComplete && isInView && (
        <span className="inline-block w-[3px] h-[1em] bg-current ml-1 animate-pulse" />
      )}
    </span>
  );
};

// Multi-line typing animation
const TypeWriterBlock = ({ 
  lines, 
  className = '',
  speed = 25,
  lineDelay = 500
}: { 
  lines: Array<{ text: string; className?: string; gradient?: boolean }>;
  className?: string;
  speed?: number;
  lineDelay?: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [completedLines, setCompletedLines] = useState<string[]>([]);
  const [currentText, setCurrentText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    if (!isInView) return;
    
    let timeout: NodeJS.Timeout;
    let charIndex = 0;
    const currentLine = lines[currentLineIndex]?.text || '';

    const typeNextChar = () => {
      if (charIndex < currentLine.length) {
        setCurrentText(currentLine.slice(0, charIndex + 1));
        charIndex++;
        timeout = setTimeout(typeNextChar, speed);
      } else if (currentLineIndex < lines.length - 1) {
        // Line complete, move to next after delay
        setCompletedLines(prev => [...prev, currentLine]);
        setCurrentText('');
        timeout = setTimeout(() => {
          setCurrentLineIndex(prev => prev + 1);
        }, lineDelay);
      } else {
        // All done
        setCompletedLines(prev => [...prev, currentLine]);
        setCurrentText('');
        setShowCursor(false);
      }
    };

    charIndex = 0;
    timeout = setTimeout(typeNextChar, currentLineIndex === 0 ? 200 : 0);

    return () => clearTimeout(timeout);
  }, [isInView, currentLineIndex, lines, speed, lineDelay]);

  return (
    <div ref={ref} className={className}>
      {completedLines.map((line, i) => {
        const lineConfig = lines[i];
        const gradientClass = lineConfig?.gradient 
          ? "bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent"
          : "";
        return (
          <span key={i} className={lineConfig?.className || ''}>
            <span className={gradientClass}>{line}</span>
            {i < completedLines.length - 1 && <br />}
          </span>
        );
      })}
      {currentText && (
        <span className={lines[currentLineIndex]?.className || ''}>
          {completedLines.length > 0 && <br />}
          <span className={lines[currentLineIndex]?.gradient 
            ? "bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent"
            : ""
          }>
            {currentText}
          </span>
        </span>
      )}
      {showCursor && isInView && (
        <span className="inline-block w-[3px] h-[1em] bg-white ml-1 animate-pulse" />
      )}
    </div>
  );
};

export const VisionPage = () => {
  return (
    <div className="min-h-screen bg-[#030014] text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:100px_100px]" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-radial from-purple-500/15 via-transparent to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-radial from-indigo-500/10 via-transparent to-transparent blur-3xl" />
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
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-lg blur opacity-50 group-hover:opacity-75 transition-opacity" />
            <div className="relative px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-lg font-medium text-sm">
              Get Started
            </div>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative">
        <div className="max-w-4xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-12 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm">Back to Home</span>
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 mb-8">
              <Globe className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-medium text-indigo-300">Pioneering a New Category</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-[1.1]">
              <TypeWriterBlock 
                lines={[
                  { text: "We're Building the", className: "text-white" },
                  { text: "First Identity Engineering Platform", gradient: true },
                  { text: "on Earth.", className: "text-white" }
                ]}
                speed={35}
                lineDelay={300}
              />
            </h1>
            
            <p className="text-xl text-gray-400 leading-relaxed max-w-2xl">
              There's never been a tool that shows you who you are — not what you do, 
              but the living system of patterns, beliefs, and potential that makes you <em>you</em>.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Manifesto Sections */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto space-y-40">
          
          {/* The Problem */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-red-400" />
              </div>
              <span className="text-sm font-semibold text-red-400 tracking-wider uppercase">The Problem</span>
            </div>
            
            <div className="space-y-8">
              <p className="text-3xl md:text-4xl font-light leading-relaxed text-gray-300">
                <TypeWriter 
                  text="The entire self-improvement industry is obsessed with"
                  speed={20}
                  delay={100}
                />
                <span className="text-white font-medium"> what you DO.</span>
              </p>
              
              <div className="pl-6 border-l-2 border-gray-800 space-y-3">
                <p className="text-xl text-gray-500">Habit trackers count checkboxes.</p>
                <p className="text-xl text-gray-500">Productivity apps measure output.</p>
                <p className="text-xl text-gray-500">Goal setters track completion.</p>
              </div>
              
              <p className="text-2xl text-gray-400">
                But they all miss the deepest question:
              </p>
              
              <p className="text-5xl md:text-6xl font-bold">
                <TypeWriter 
                  text="WHO ARE YOU?"
                  className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent"
                  speed={60}
                  delay={200}
                />
              </p>
              
              <p className="text-xl text-gray-500 max-w-2xl">
                Your identity isn't a to-do list. It's a living neural network of goals, fears, 
                strengths, struggles, and beliefs — all interconnected, all evolving.
              </p>
            </div>
          </motion.div>

          {/* The Insight */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Brain className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-sm font-semibold text-purple-400 tracking-wider uppercase">The Insight</span>
            </div>
            
            <div className="space-y-8">
              <p className="text-3xl md:text-4xl font-light leading-relaxed text-gray-300">
                <TypeWriter 
                  text="Every time you write, chat, or reflect — you're revealing"
                  speed={18}
                  delay={100}
                />
                <span className="text-white font-medium"> patterns invisible to you.</span>
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  'The goals that truly drive you',
                  'The habits shaping your identity',
                  'The struggles you keep circling back to',
                  'The beliefs running in the background',
                  'The emotions coloring your decisions',
                  "The growth edges where you're evolving"
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5"
                  >
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-400 to-cyan-400" />
                    <span className="text-gray-300">{item}</span>
                  </motion.div>
                ))}
              </div>
              
              <p className="text-xl text-gray-400">
                These patterns are <span className="text-white">already there</span>, hidden in plain sight. 
                You just need the right mirror to see them.
              </p>
            </div>
          </motion.div>

          {/* The Solution */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                <Dna className="w-5 h-5 text-indigo-400" />
              </div>
              <span className="text-sm font-semibold text-indigo-400 tracking-wider uppercase">The Solution</span>
            </div>
            
            <div className="space-y-8">
              <p className="text-3xl md:text-4xl font-light leading-relaxed text-gray-300">
                <TypeWriter 
                  text="Evos is the world's first"
                  speed={25}
                  delay={100}
                />
                <TypeWriter 
                  text=" Identity Engineering Platform."
                  gradient={true}
                  className="font-medium"
                  speed={30}
                  delay={800}
                />
              </p>
              
              <div className="relative rounded-2xl border border-white/10 bg-white/[0.02] p-8 overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-radial from-indigo-500/20 via-transparent to-transparent blur-2xl" />
                <div className="relative space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-indigo-400 font-bold">1</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-1">Extract</h4>
                      <p className="text-gray-400">AI analyzes your conversations and writings to surface identity patterns</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-purple-400 font-bold">2</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-1">Visualize</h4>
                      <p className="text-gray-400">Your patterns become a living 3D neural network — your psychological fingerprint</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-cyan-400 font-bold">3</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-1">Engineer</h4>
                      <p className="text-gray-400">Intentionally evolve your identity by strengthening, weakening, or adding nodes</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-xl text-gray-500 italic">
                Not to judge. Not to fix. 
                <br />
                Just to help you <span className="text-white not-italic font-semibold">SEE</span> — 
                so you can evolve on your own terms.
              </p>
            </div>
          </motion.div>

          {/* Why Now */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                <Rocket className="w-5 h-5 text-cyan-400" />
              </div>
              <span className="text-sm font-semibold text-cyan-400 tracking-wider uppercase">Why Now</span>
            </div>
            
            <div className="space-y-8">
              <p className="text-3xl md:text-4xl font-light leading-relaxed text-gray-300">
                <TypeWriter 
                  text="For the first time in history, AI can"
                  speed={20}
                  delay={100}
                />
                <span className="text-white font-medium"> understand human language </span>
                <TypeWriter 
                  text="well enough to extract identity."
                  speed={20}
                  delay={1200}
                />
              </p>
              
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { 
                    title: 'Language Models',
                    desc: 'Can now understand nuance, context, and meaning in human expression'
                  },
                  { 
                    title: 'Pattern Recognition',
                    desc: 'Can identify recurring themes across thousands of data points'
                  },
                  { 
                    title: 'Visualization Tech',
                    desc: 'Can render complex neural networks in real-time 3D'
                  }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="p-6 rounded-xl bg-white/[0.02] border border-white/5"
                  >
                    <h4 className="font-semibold text-white mb-2">{item.title}</h4>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
              
              <p className="text-xl text-gray-400">
                The pieces finally exist. 
                <span className="text-white font-medium"> Evos is assembling them into something that's never existed before.</span>
              </p>
            </div>
          </motion.div>

          {/* The Future */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-sm font-semibold text-emerald-400 tracking-wider uppercase">The Future</span>
            </div>
            
            <div className="space-y-8">
              <p className="text-3xl md:text-4xl font-light leading-relaxed text-gray-300">
                <TypeWriter 
                  text="We're just getting started."
                  speed={40}
                  delay={100}
                />
              </p>
              
              <div className="space-y-4">
                {[
                  { phase: 'Now', title: 'Personal Identity Maps', desc: 'See and understand your psychological landscape' },
                  { phase: 'Next', title: 'Predictive Identity', desc: 'Forecast patterns before they happen based on your trajectory' },
                  { phase: 'Future', title: 'Identity Networks', desc: 'Connect with others on similar journeys, find mentors who\'ve been where you\'re going' },
                  { phase: 'Vision', title: 'Collective Intelligence', desc: 'Aggregate insights across millions of identity maps to unlock new understanding of human potential' }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-6 p-4 rounded-xl hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="text-sm font-mono text-emerald-400/60 w-16 flex-shrink-0 pt-1">{item.phase}</div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">{item.title}</h4>
                      <p className="text-gray-500">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Join Us */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-pink-400" />
              </div>
              <span className="text-sm font-semibold text-pink-400 tracking-wider uppercase">Join Us</span>
            </div>
            
            <div className="space-y-8">
              <p className="text-3xl md:text-4xl font-light leading-relaxed text-gray-300">
                We're building this for 
                <span className="text-white font-medium"> people who want to evolve intentionally.</span>
              </p>
              
              <p className="text-xl text-gray-400">
                If you believe that understanding yourself is the first step to becoming who you want to be — 
                Evos is for you.
              </p>
              
              <p className="text-5xl md:text-6xl font-bold">
                <TypeWriter 
                  text="Engineer your identity."
                  gradient={true}
                  speed={50}
                  delay={300}
                />
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/10 via-transparent to-transparent" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-xl mx-auto text-center relative"
        >
          <Link to="/login">
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="group relative px-10 py-5 rounded-xl font-semibold text-lg overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500" />
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative flex items-center gap-2">
                Begin Your Engineering Journey
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </motion.button>
          </Link>
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
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
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
