import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Shield, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ProgressBar } from './ProgressBar';
import { onboardingQuestions } from '../../data/questions';

interface QuestionnaireFlowProps {
  onComplete: (answers: Record<string, string>) => void;
}

export const QuestionnaireFlow = ({ onComplete }: QuestionnaireFlowProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const question = onboardingQuestions[currentQuestion];
  const isLastQuestion = currentQuestion === onboardingQuestions.length - 1;

  const validateAnswer = (answer: string): string | null => {
    const trimmed = answer.trim();
    
    if (!trimmed) {
      return 'Please provide an answer to continue';
    }
    
    if (trimmed.length < 10) {
      return 'Please provide a more detailed answer (at least 10 characters)';
    }
    
    if (trimmed.length > 2000) {
      return 'Answer is too long (max 2000 characters)';
    }
    
    return null;
  };

  const handleNext = async () => {
    setError(null);
    
    const validationError = validateAnswer(currentAnswer);
    if (validationError) {
      setError(validationError);
      return;
    }

    const newAnswers = { ...answers, [question.id]: currentAnswer.trim() };
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
      setCurrentAnswer(newAnswers[onboardingQuestions[currentQuestion + 1].id] || '');
    }
  };

  const handleBack = () => {
    setError(null);
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setCurrentAnswer(answers[onboardingQuestions[currentQuestion - 1].id] || '');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      handleNext();
    }
  };

  const characterCount = currentAnswer.length;
  const isAnswerTooShort = characterCount > 0 && characterCount < 10;
  const isAnswerTooLong = characterCount > 2000;

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
        {/* Data Safety Notice */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-3 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-3"
        >
          <Shield className="w-5 h-5 text-green-400 flex-shrink-0" />
          <p className="text-sm text-green-300">
            Your answers are encrypted and never shared. You can delete your data anytime.
          </p>
        </motion.div>

        <ProgressBar current={currentQuestion + 1} total={onboardingQuestions.length} />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <div className="mb-2 text-sm text-indigo-400 font-medium">
                Question {currentQuestion + 1} of {onboardingQuestions.length}
              </div>
              
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-white">
                {question.question}
              </h2>
              
              <div className="relative">
                <textarea
                  value={currentAnswer}
                  onChange={(e) => {
                    setCurrentAnswer(e.target.value);
                    setError(null);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder={question.placeholder}
                  className={`w-full h-36 bg-gray-900/50 border rounded-xl p-4 text-gray-100 placeholder-gray-500 focus:outline-none transition-colors resize-none ${
                    error ? 'border-red-500 focus:border-red-500' : 
                    isAnswerTooLong ? 'border-orange-500 focus:border-orange-500' :
                    'border-gray-700 focus:border-indigo-500'
                  }`}
                  autoFocus
                  disabled={isSubmitting}
                />
                
                {/* Character count */}
                <div className={`absolute bottom-3 right-3 text-xs ${
                  isAnswerTooLong ? 'text-red-400' :
                  isAnswerTooShort ? 'text-yellow-400' :
                  characterCount > 0 ? 'text-green-400' :
                  'text-gray-500'
                }`}>
                  {characterCount}/2000
                </div>
              </div>

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

              {/* Helper Text */}
              {isAnswerTooShort && !error && (
                <p className="mt-2 text-sm text-yellow-400">
                  Please write at least 10 characters
                </p>
              )}

              <div className="flex justify-between mt-8">
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
                  disabled={!currentAnswer.trim() || isSubmitting || isAnswerTooLong}
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
            </Card>
          </motion.div>
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mt-6 space-y-2"
        >
          <p className="text-gray-500 text-sm">
            Take your time. The more thoughtful your answers, the better your identity profile.
          </p>
          <p className="text-gray-600 text-xs">
            Press ⌘+Enter to continue
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};
