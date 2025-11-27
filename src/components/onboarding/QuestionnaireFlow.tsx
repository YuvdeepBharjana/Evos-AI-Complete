import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft } from 'lucide-react';
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

  const question = onboardingQuestions[currentQuestion];
  const isLastQuestion = currentQuestion === onboardingQuestions.length - 1;

  const handleNext = () => {
    const newAnswers = { ...answers, [question.id]: currentAnswer };
    setAnswers(newAnswers);

    if (isLastQuestion) {
      onComplete(newAnswers);
    } else {
      setCurrentQuestion(currentQuestion + 1);
      setCurrentAnswer(newAnswers[onboardingQuestions[currentQuestion + 1].id] || '');
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setCurrentAnswer(answers[onboardingQuestions[currentQuestion - 1].id] || '');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-950 via-blue-950/20 to-gray-950">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-2xl w-full"
      >
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
              <h2 className="text-3xl font-bold mb-6">{question.question}</h2>
              <textarea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder={question.placeholder}
                className="w-full h-32 bg-gray-900/50 border border-gray-700 rounded-xl p-4 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                autoFocus
              />

              <div className="flex justify-between mt-8">
                <Button
                  onClick={handleBack}
                  variant="ghost"
                  icon={ArrowLeft}
                  disabled={currentQuestion === 0}
                >
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  icon={ArrowRight}
                  disabled={!currentAnswer.trim()}
                >
                  {isLastQuestion ? 'Complete' : 'Next'}
                </Button>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-gray-500 text-sm mt-6"
        >
          Take your time. The more thoughtful your answers, the better your identity profile.
        </motion.p>
      </motion.div>
    </div>
  );
};


