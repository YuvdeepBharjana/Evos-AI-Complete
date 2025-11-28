import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { OnboardingChoice } from '../components/onboarding/OnboardingChoice';
import { QuestionnaireFlow } from '../components/onboarding/QuestionnaireFlow';
import { DataUploadFlow } from '../components/onboarding/DataUploadFlow';
import { useUserStore } from '../store/useUserStore';
import { createDefaultProfile, generateNodesFromQuestionnaire } from '../lib/generateMockProfile';
import type { IdentityNode } from '../types';
import { Dna } from 'lucide-react';

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
                        className="min-h-screen flex items-center justify-center bg-[#030014]"
                    >
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:100px_100px]" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-indigo-500/20 via-transparent to-transparent blur-3xl" />
                        </div>
                        <div className="text-center relative">
                            <motion.div
                                animate={{
                                    rotate: 360,
                                    scale: [1, 1.2, 1]
                                }}
                                transition={{
                                    rotate: { duration: 3, repeat: Infinity, ease: 'linear' },
                                    scale: { duration: 2, repeat: Infinity }
                                }}
                                className="inline-block mb-6"
                            >
                                <Dna size={64} className="text-indigo-400" />
                            </motion.div>
                            <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-4">
                                Your Identity Map is Ready
                            </h2>
                            <p className="text-gray-400 text-lg">
                                Initializing your engineering environment...
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

