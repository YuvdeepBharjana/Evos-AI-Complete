import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { QuestionnaireFlow } from '../components/onboarding/QuestionnaireFlow';
import { ManualOnboardingFlow } from '../components/onboarding/ManualOnboardingFlow';
import { MentorSelectionModal } from '../components/psychmirror/MentorSelectionModal';
import { useUserStore } from '../store/useUserStore';
import { useAuthStore } from '../store/useAuthStore';
import { createDefaultProfile, generateNodesFromQuestionnaire } from '../lib/generateMockProfile';
import type { IdentityNode } from '../types';
import type { AIMentorStyle } from '../lib/api';
import { Dna, Target, Shield, TrendingUp, ArrowRight } from 'lucide-react';
import { onboardingV2Questions } from '../data/onboardingV2';
import { generateTraderProfile, saveTraderProfile, type TraderProfile } from '../types/trader';

// V2 onboarding: streamlined trader flow with profile summary transition
type OnboardingStep = 'questionnaire' | 'manual' | 'profile-summary' | 'complete' | 'mentor-selection';

export const OnboardingPage = () => {
    console.log('Onboarding V2 loaded:', onboardingV2Questions.length);
    const [step, setStep] = useState<OnboardingStep>('questionnaire'); // Start directly with questionnaire
    const [traderProfile, setTraderProfile] = useState<TraderProfile | null>(null); // TRADER: Store generated profile
    const navigate = useNavigate();
    const { setUser, completeOnboarding } = useUserStore();
    const { user: authUser } = useAuthStore();

    // handleMethodSelect removed - choice step not used in trader onboarding

    const handleManualComplete = async (nodes: IdentityNode[]) => {
        await completeOnboarding('manual', nodes);
        
        // Sync onboarding status to useAuthStore if user exists there
        const authStore = useAuthStore.getState();
        if (authStore.user) {
            useAuthStore.setState({
                user: {
                    ...authStore.user,
                    onboardingComplete: true,
                }
            });
        }
        
        setStep('complete');

        // Show mentor selection after animation
        setTimeout(() => {
            setStep('mentor-selection');
        }, 2000);
    };

    const handleQuestionnaireComplete = async (answers: Record<string, string>) => {
        // TRADER: Generate and save trader profile
        const profile = generateTraderProfile(answers);
        setTraderProfile(profile);
        saveTraderProfile(profile);
        
        const nodes = generateNodesFromQuestionnaire(answers);
        await completeOnboarding('questionnaire', nodes);
        
        // Sync onboarding status to useAuthStore if user exists there
        const authStore = useAuthStore.getState();
        if (authStore.user) {
            useAuthStore.setState({
                user: {
                    ...authStore.user,
                    onboardingComplete: true,
                }
            });
        }
        
        // Go to profile summary transition screen
        setStep('profile-summary');
    };

    // AI Import and Upload handlers removed - steps are unnecessary for trader onboarding

    const handleMentorSelect = (style: AIMentorStyle) => {
        console.log('✅ Mentor style selected during onboarding:', style);
        // Navigate to home (daily discipline loop) after mentor selection
        navigate('/home');
    };

    // Personal context step removed - start directly with questionnaire

    return (
        <div className="min-h-screen w-full">
            <AnimatePresence mode="wait">
                {/* Personal context step removed - start directly with questionnaire */}

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

                {/* AI Import Step removed - unnecessary for trader onboarding */}

                {/* PART 2: Profile Summary Transition Screen */}
                {step === 'profile-summary' && traderProfile && (
                    <motion.div
                        key="profile-summary"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="min-h-screen flex items-center justify-center bg-[#030014] p-4"
                    >
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.03)_1px,transparent_1px)] bg-[size:100px_100px]" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-green-500/20 via-transparent to-transparent blur-3xl" />
                        </div>
                        
                        <div className="max-w-3xl w-full relative">
                            {/* 1️⃣ Completion Badge */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 }}
                                className="flex justify-center mb-6"
                            >
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-400/30 backdrop-blur-md shadow-lg shadow-green-500/10">
                                    <div className="w-2 h-2 rounded-full bg-green-400" />
                                    <span className="text-xs font-bold text-green-300 uppercase tracking-wider">
                                        Profile Built Successfully
                                    </span>
                                </div>
                            </motion.div>

                            {/* Header */}
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-center mb-8"
                            >
                                <h1 className="text-5xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-4">
                                    Your Trader Profile Is Ready
                                </h1>
                                <p className="text-xl text-gray-300 mb-8">
                                    Evos has mapped your discipline patterns.
                                </p>

                                {/* 2️⃣ Operating Identity Lock-In Card */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="max-w-xl mx-auto"
                                >
                                    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6">
                                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                                            Your Operating Identity
                                        </div>
                                        <p className="text-lg text-white font-medium mb-3">
                                            {traderProfile.identityStatement.replace(/_/g, ' ')}
                                        </p>
                                        <p className="text-xs text-gray-500 italic">
                                            Most traders never reach this step. You did.
                                        </p>
                                    </div>
                                </motion.div>
                            </motion.div>

                            {/* 3️⃣ 3 Summary Cards with Action Framing */}
                            <div className="grid md:grid-cols-3 gap-6 mb-16">
                                {/* Card 1: Primary Discipline Leak */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="backdrop-blur-xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-400/30 rounded-2xl p-6 shadow-lg shadow-orange-500/10 flex flex-col"
                                >
                                    <div className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-3">
                                        Primary Discipline Leak
                                    </div>
                                    <div className="space-y-2 mb-4 flex-1">
                                        {traderProfile.primaryFailureModes.slice(0, 2).map((leak) => {
                                            // Format: remove underscores and capitalize first letter of each word
                                            const formatted = leak
                                                .replace(/_/g, ' ')
                                                .split(' ')
                                                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                                .join(' ');
                                            return (
                                                <div key={leak} className="text-white font-medium text-sm">
                                                    • {formatted}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="text-xs text-orange-400/70 italic pt-3 border-t border-orange-400/20">
                                        Evos will build guardrails around this.
                                    </div>
                                </motion.div>

                                {/* Card 2: Pressure Trigger */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="backdrop-blur-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-cyan-400/30 rounded-2xl p-6 shadow-lg shadow-cyan-500/10 flex flex-col"
                                >
                                    <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3">
                                        Pressure Trigger
                                    </div>
                                    <div className="text-white font-medium mb-4 flex-1">
                                        {traderProfile.underPressureResponse
                                            .replace(/_/g, ' ')
                                            .split(' ')
                                            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                            .join(' ')}
                                    </div>
                                    <div className="text-xs text-cyan-400/70 italic pt-3 border-t border-cyan-400/20">
                                        This is where discipline breaks first.
                                    </div>
                                </motion.div>

                                {/* Card 3: Identity Target */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                    className="backdrop-blur-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-400/30 rounded-2xl p-6 shadow-lg shadow-green-500/10 flex flex-col"
                                >
                                    <div className="text-xs font-bold text-green-400 uppercase tracking-wider mb-3">
                                        Identity Target
                                    </div>
                                    <div className="text-white font-medium mb-4 flex-1">
                                        {traderProfile.disciplineArchetype}
                                    </div>
                                    <div className="text-xs text-green-400/70 italic pt-3 border-t border-green-400/20">
                                        This is what you are training into.
                                    </div>
                                </motion.div>
                            </div>

                            {/* 4️⃣ Transition Bridge Copy */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7 }}
                                className="text-center mb-8 max-w-2xl mx-auto"
                            >
                                <p className="text-gray-300 leading-relaxed">
                                    This profile is not information. It is your training baseline.
                                    <br />
                                    Next, Evos will help you lock discipline before every session.
                                </p>
                            </motion.div>

                            {/* 5️⃣ CTA Button - Renamed for Activation Language */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 }}
                                className="text-center"
                            >
                                <button
                                    onClick={async () => {
                                        // Ensure user state is refreshed before navigating
                                        const { getCurrentUser } = await import('../lib/api');
                                        const currentUser = await getCurrentUser();
                                        const token = localStorage.getItem('evos_token');
                                        
                                        if (currentUser && token) {
                                            // Refresh both stores
                                            await setUserFromApi(currentUser, token);
                                            
                                            // Sync to useAuthStore
                                            const authStore = useAuthStore.getState();
                                            if (authStore.user) {
                                                useAuthStore.setState({
                                                    user: {
                                                        ...authStore.user,
                                                        onboardingComplete: true,
                                                    }
                                                });
                                            }
                                        }
                                        
                                        // Navigate to home
                                        navigate('/home');
                                    }}
                                    className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 via-emerald-500 to-cyan-500 text-white text-lg font-bold rounded-xl hover:opacity-90 transition-opacity shadow-xl shadow-green-500/20"
                                >
                                    <span>▶</span>
                                    Activate Trading Command Center
                                </button>
                            </motion.div>
                        </div>
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

                {step === 'manual' && (
                    <motion.div
                        key="manual"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <ManualOnboardingFlow onComplete={handleManualComplete} />
                    </motion.div>
                )}

                {/* TRADER: Updated completion screen with Trader Profile Summary */}
                {step === 'complete' && traderProfile && (
                    <motion.div
                        key="complete"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="min-h-screen flex items-center justify-center bg-[#030014] p-4"
                    >
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.03)_1px,transparent_1px)] bg-[size:100px_100px]" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-green-500/20 via-transparent to-transparent blur-3xl" />
                        </div>
                        <div className="max-w-2xl w-full relative">
                            {/* Header */}
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-center mb-8"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.3, type: 'spring' }}
                                    className="inline-block mb-4"
                                >
                                    <Target size={64} className="text-green-400" />
                                </motion.div>
                                <h2 className="text-4xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-4">
                                    Your Trader Profile is Ready
                                </h2>
                                <p className="text-gray-400 text-lg">
                                    Next: Pre-Market Identity Calibration
                                </p>
                            </motion.div>

                            {/* Trader Profile Summary Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8"
                            >
                                <div className="space-y-6">
                                    {/* Archetype */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Shield className="w-5 h-5 text-green-400" />
                                            <h3 className="text-sm font-semibold text-green-400 uppercase tracking-wider">
                                                Your Archetype
                                            </h3>
                                        </div>
                                        <p className="text-2xl font-bold text-white">
                                            {traderProfile.disciplineArchetype}
                                        </p>
                                    </div>

                                    {/* Primary Leaks */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <TrendingUp className="w-5 h-5 text-orange-400" />
                                            <h3 className="text-sm font-semibold text-orange-400 uppercase tracking-wider">
                                                Primary Discipline Leaks
                                            </h3>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {traderProfile.primaryFailureModes.map((leak) => (
                                                <span
                                                    key={leak}
                                                    className="px-3 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-300 text-sm"
                                                >
                                                    {leak.replace(/_/g, ' ')}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Identity Statement */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Dna className="w-5 h-5 text-cyan-400" />
                                            <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">
                                                Your Identity Statement
                                            </h3>
                                        </div>
                                        <p className="text-lg text-white italic">
                                            "{traderProfile.identityStatement}"
                                        </p>
                                    </div>

                                    {/* Focus Rule */}
                                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Target className="w-5 h-5 text-green-400" />
                                            <h3 className="text-sm font-semibold text-green-400 uppercase tracking-wider">
                                                Your Non-Negotiable Rule
                                            </h3>
                                        </div>
                                        <p className="text-white font-medium">
                                            {traderProfile.focusRule}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* CTAs */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="flex flex-col sm:flex-row gap-4"
                            >
                                <button
                                    onClick={async () => {
                                        // Ensure user state is refreshed before navigating
                                        const { getCurrentUser } = await import('../lib/api');
                                        const currentUser = await getCurrentUser();
                                        const token = localStorage.getItem('evos_token');
                                        
                                        if (currentUser && token) {
                                            // Refresh both stores
                                            await setUserFromApi(currentUser, token);
                                            
                                            // Sync to useAuthStore
                                            const authStore = useAuthStore.getState();
                                            if (authStore.user) {
                                                useAuthStore.setState({
                                                    user: {
                                                        ...authStore.user,
                                                        onboardingComplete: true,
                                                    }
                                                });
                                            }
                                        }
                                        
                                        // Navigate to home (discipline hub) after onboarding
                                        navigate('/home');
                                    }}
                                    className="flex-1 py-4 px-6 bg-gradient-to-r from-green-500 via-emerald-500 to-cyan-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                                >
                                    Activate Trading Command Center
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="sm:w-auto px-6 py-4 bg-white/5 border border-white/10 text-gray-300 font-semibold rounded-xl hover:bg-white/10 transition-colors"
                                >
                                    Go to Dashboard
                                </button>
                            </motion.div>
                        </div>
                    </motion.div>
                )}

                {step === 'mentor-selection' && (
                    <motion.div
                        key="mentor-selection"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="min-h-screen bg-[#030014]"
                    >
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:100px_100px]" />
                        </div>
                        <MentorSelectionModal
                            isOpen={true}
                            onClose={() => navigate('/mirror')}
                            onSelect={handleMentorSelect}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

