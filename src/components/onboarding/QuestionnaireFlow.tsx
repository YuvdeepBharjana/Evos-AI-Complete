import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Shield, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ProgressBar } from './ProgressBar';
import { onboardingV2Questions } from '../../data/onboardingV2';

interface QuestionnaireFlowProps {
  onComplete: (answers: Record<string, string>) => void;
}

export const QuestionnaireFlow = ({ onComplete }: QuestionnaireFlowProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentAnswer, setCurrentAnswer] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const prevQuestionIdRef = useRef<string>('');

  const question = onboardingV2Questions[currentQuestion];
  const isLastQuestion = currentQuestion === onboardingV2Questions.length - 1;

  // Load current answer when question changes
  useEffect(() => {
    // Only update if question actually changed
    if (prevQuestionIdRef.current !== question.id) {
      const savedAnswer = answers[question.id];
      const answerArray = savedAnswer ? savedAnswer.split(',').filter(Boolean) : [];
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentAnswer(answerArray);
      setFocusedIndex(null);
      setError(null);
      prevQuestionIdRef.current = question.id;
    }
  }, [currentQuestion, question.id, answers]);

  const validateAnswer = (answer: string[]): string | null => {
    if (answer.length === 0) {
      return 'Please select at least one option to continue';
    }
    
    if (question.maxSelections && answer.length > question.maxSelections) {
      return `Please select no more than ${question.maxSelections} option${question.maxSelections > 1 ? 's' : ''}`;
    }
    
    return null;
  };

  const handleOptionToggle = (optionValue: string) => {
    setError(null);
    
    if (question.multiSelect) {
      // Multi-select: toggle the option
      if (currentAnswer.includes(optionValue)) {
        // Deselect
        setCurrentAnswer(currentAnswer.filter(v => v !== optionValue));
      } else {
        // Check maxSelections limit
        if (question.maxSelections && currentAnswer.length >= question.maxSelections) {
          setError(`You can select up to ${question.maxSelections} option${question.maxSelections > 1 ? 's' : ''}`);
          return;
        }
        // Select
        setCurrentAnswer([...currentAnswer, optionValue]);
      }
    } else {
      // Single-select: replace selection
      setCurrentAnswer([optionValue]);
    }
  };

  const handleNext = async () => {
    setError(null);
    
    const validationError = validateAnswer(currentAnswer);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Convert string[] to comma-separated string for storage
    const answerString = currentAnswer.join(',');
    const newAnswers = { ...answers, [question.id]: answerString };
    setAnswers(newAnswers);

    if (isLastQuestion) {
      setIsSubmitting(true);
      try {
        // Small delay to show processing state
        await new Promise(resolve => setTimeout(resolve, 500));
        onComplete(newAnswers);
      } catch (err) {
        setError('Failed to process your answers. Please try again.');
        setIsSubmitting(false);
      }
    } else {
      setCurrentQuestion(currentQuestion + 1);
      const nextQuestionId = onboardingV2Questions[currentQuestion + 1].id;
      const nextAnswer = newAnswers[nextQuestionId];
      setCurrentAnswer(nextAnswer ? nextAnswer.split(',').filter(Boolean) : []);
    }
  };

  const handleBack = () => {
    setError(null);
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      const prevQuestionId = onboardingV2Questions[currentQuestion - 1].id;
      const prevAnswer = answers[prevQuestionId];
      setCurrentAnswer(prevAnswer ? prevAnswer.split(',').filter(Boolean) : []);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      handleNext();
    } else if (e.key === 'ArrowDown' && focusedIndex !== null && focusedIndex < question.options.length - 1) {
      e.preventDefault();
      setFocusedIndex(focusedIndex + 1);
    } else if (e.key === 'ArrowUp' && focusedIndex !== null && focusedIndex > 0) {
      e.preventDefault();
      setFocusedIndex(focusedIndex - 1);
    } else if (e.key === 'Enter' && focusedIndex !== null) {
      e.preventDefault();
      handleOptionToggle(question.options[focusedIndex].value);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#030014] relative">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:100px_100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-indigo-500/10 via-transparent to-transparent blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-2xl w-full relative"
      >
        {/* Data Safety Notice - TRADER COPY */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-3 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-3"
        >
          <Shield className="w-5 h-5 text-green-400 flex-shrink-0" />
          <p className="text-sm text-green-300">
            Your trading behavior and journal data are encrypted and never shared. You can delete everything anytime.
          </p>
        </motion.div>

        <ProgressBar current={currentQuestion + 1} total={onboardingV2Questions.length} />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* PREMIUM UPGRADE: Stronger backdrop blur, gradient border */}
            <div className="relative rounded-2xl p-8 backdrop-blur-xl bg-gradient-to-br from-gray-900/80 via-gray-900/70 to-gray-800/80 border border-white/10 shadow-2xl">
              {/* Subtle gradient border glow */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-cyan-500/10 blur-xl -z-10" />
              
              {/* PREMIUM: Updated question counter with pulse dot + gradient underline */}
              <div className="mb-6">
                <div className="flex items-center gap-2 text-sm text-green-400 font-medium mb-2">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-2 h-2 rounded-full bg-green-400"
                  />
                  <span>Building Your Trader Profile — Step {currentQuestion + 1} of {onboardingV2Questions.length}</span>
                </div>
                {/* Gradient accent underline */}
                <div className="h-0.5 w-32 bg-gradient-to-r from-green-400 via-emerald-400 to-transparent rounded-full" />
              </div>

              {/* PREMIUM: Founders Note (show only on Q1) - UPDATED COPY */}
              {currentQuestion === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-6 p-5 rounded-xl backdrop-blur-md bg-gradient-to-br from-indigo-500/10 via-cyan-500/10 to-blue-500/10 border border-cyan-400/30 shadow-lg shadow-cyan-500/10"
                >
                  <div className="text-xs font-bold text-cyan-300 uppercase tracking-wider mb-2">
                    Founder Note
                  </div>
                  <p className="text-sm text-white leading-relaxed font-medium">
                    Most traders use AI to get better trades.
                    <br />
                    Evos uses AI to build a better trader — because discipline, not signals, is what actually scales your career.
                  </p>
                </motion.div>
              )}
              
              {/* PREMIUM: Larger question text */}
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white leading-tight">
                {question.question}
              </h2>
              
              {/* PREMIUM: Slightly brighter subtext */}
              <p className="text-sm text-gray-300 mb-8 max-w-2xl leading-relaxed">
                {question.whyItMatters}
              </p>
              
              {/* PREMIUM: Enhanced Multiple Choice Options */}
              <div 
                className="space-y-3"
                onKeyDown={handleKeyDown}
                tabIndex={0}
              >
                {question.options.map((option, index) => {
                  const isSelected = currentAnswer.includes(option.value);
                  const isFocused = focusedIndex === index;
                  const isMaxReached = question.maxSelections 
                    ? currentAnswer.length >= question.maxSelections && !isSelected
                    : false;
                  
                  return (
                    <motion.button
                      key={option.value}
                      type="button"
                      onClick={() => handleOptionToggle(option.value)}
                      disabled={isSubmitting || isMaxReached}
                      onFocus={() => setFocusedIndex(index)}
                      onBlur={() => setFocusedIndex(null)}
                      className={`relative w-full text-left p-5 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-400 text-white shadow-lg shadow-green-500/20'
                          : isFocused
                          ? 'bg-gray-800/60 border-green-400/50 text-gray-100'
                          : isMaxReached
                          ? 'bg-gray-900/30 border-gray-700 text-gray-500 cursor-not-allowed'
                          : 'bg-gray-900/40 border-gray-700 text-gray-300 hover:border-green-500/50 hover:bg-gray-800/60 hover:shadow-md hover:shadow-green-500/10'
                      } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      whileHover={!isSubmitting && !isMaxReached ? { scale: 1.02, y: -2 } : {}}
                      whileTap={!isSubmitting && !isMaxReached ? { scale: 0.98 } : {}}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <span className="font-semibold text-base block mb-1">{option.label}</span>
                          {/* PREMIUM: Render micro-label if exists */}
                          {option.microlabel && (
                            <span className="text-xs text-gray-400 font-medium">
                              {option.microlabel}
                            </span>
                          )}
                        </div>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center flex-shrink-0 shadow-lg"
                          >
                            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </motion.div>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Selection count for multi-select */}
              {question.multiSelect && question.maxSelections && (
                <div className="mt-3 text-sm text-gray-400 text-right">
                  {currentAnswer.length} / {question.maxSelections} selected
                </div>
              )}

              {/* Error Message */}
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-3 flex items-center gap-2 text-red-400 text-sm"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>


              {/* PREMIUM: Better spacing for navigation */}
              <div className="flex justify-between mt-10 pt-6 border-t border-white/10">
                <Button
                  onClick={handleBack}
                  variant="ghost"
                  icon={ArrowLeft}
                  disabled={currentQuestion === 0 || isSubmitting}
                >
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  icon={isSubmitting ? undefined : ArrowRight}
                  disabled={currentAnswer.length === 0 || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : isLastQuestion ? (
                    'Complete'
                  ) : (
                    'Next'
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* TRADER COPY: identity profile → trading profile */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mt-6 space-y-2"
        >
          <p className="text-gray-500 text-sm">
            Take your time. The more honest your answers, the better your trading profile.
          </p>
          <p className="text-gray-600 text-xs">
            Press ⌘+Enter to continue
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};
