import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { OnboardingChoice } from '../components/onboarding/OnboardingChoice';
import { QuestionnaireFlow } from '../components/onboarding/QuestionnaireFlow';
import { DataUploadFlow } from '../components/onboarding/DataUploadFlow';
import { useUserStore } from '../store/useUserStore';
import { createDefaultProfile, generateNodesFromQuestionnaire } from '../lib/generateMockProfile';
import type { IdentityNode } from '../types';
import { Sparkles } from 'lucide-react';

type OnboardingStep = 'choice' | 'questionnaire' | 'upload' | 'complete';

export const OnboardingPage = () => {
    const [step, setStep] = useState<OnboardingStep>('choice');
    const navigate = useNavigate();
    const { setUser, completeOnboarding } = useUserStore();

    const handleMethodSelect = (method: 'questionnaire' | 'upload') => {
        // Create user profile
        const profile = createDefaultProfile('User');
        setUser(profile);

        setStep(method);
    };

    const handleQuestionnaireComplete = (answers: Record<string, string>) => {
        const nodes = generateNodesFromQuestionnaire(answers);
        completeOnboarding('questionnaire', nodes);
        setStep('complete');

        // Navigate after animation
        setTimeout(() => {
            navigate('/dashboard');
        }, 2000);
    };

    const handleUploadComplete = (nodes: IdentityNode[]) => {
        completeOnboarding('upload', nodes);
        setStep('complete');

        // Navigate after animation
        setTimeout(() => {
            navigate('/dashboard');
        }, 2000);
    };

    return (
        <div className="min-h-screen w-full">
            <AnimatePresence mode="wait">
                {step === 'choice' && (
                    <motion.div
                        key="choice"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <OnboardingChoice onSelectMethod={handleMethodSelect} />
                    </motion.div>
                )}

                {step === 'questionnaire' && (
                    <motion.div
                        key="questionnaire"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <QuestionnaireFlow onComplete={handleQuestionnaireComplete} />
                    </motion.div>
                )}

                {step === 'upload' && (
                    <motion.div
                        key="upload"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <DataUploadFlow onComplete={handleUploadComplete} />
                    </motion.div>
                )}

                {step === 'complete' && (
                    <motion.div
                        key="complete"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-purple-950/30 to-gray-950"
                    >
                        <div className="text-center">
                            <motion.div
                                animate={{
                                    rotate: 360,
                                    scale: [1, 1.2, 1]
                                }}
                                transition={{
                                    rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
                                    scale: { duration: 2, repeat: Infinity }
                                }}
                                className="inline-block mb-6"
                            >
                                <Sparkles size={64} className="text-purple-500" />
                            </motion.div>
                            <h2 className="text-4xl font-bold gradient-text mb-4">
                                Your Identity Mirror is Ready
                            </h2>
                            <p className="text-gray-400 text-lg">
                                Redirecting to your dashboard...
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

