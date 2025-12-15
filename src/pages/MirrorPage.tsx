import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PsychMirror } from '../components/psychmirror/PsychMirror';
import { MentorSelectionModal } from '../components/psychmirror/MentorSelectionModal';
import { getMentorStyle, type AIMentorStyle } from '../lib/api';
import { useUserStore } from '../store/useUserStore';

export const MirrorPage = () => {
  const { user } = useUserStore();
  const [showMentorModal, setShowMentorModal] = useState(false);
  const [hasCheckedMentor, setHasCheckedMentor] = useState(false);

  // Check if user needs to select a mentor (first time viewing mirror after onboarding)
  useEffect(() => {
    const checkMentorSelection = async () => {
      // Only check if user is logged in and has completed onboarding
      if (!user?.onboardingComplete || hasCheckedMentor) return;

      // Check if user already has a mentor style
      const existingStyle = await getMentorStyle();
      
      if (!existingStyle) {
        // First time - show the modal
        setShowMentorModal(true);
      }
      
      setHasCheckedMentor(true);
    };

    checkMentorSelection();
  }, [user?.onboardingComplete, hasCheckedMentor]);

  const handleMentorSelect = (style: AIMentorStyle) => {
    console.log('✅ Mentor style selected:', style);
    setShowMentorModal(false);
  };

  // Manual trigger for testing/changing mentor
  const handleChangeMentor = () => {
    setShowMentorModal(true);
  };

  console.log('📄 MirrorPage rendering');

  return (
    <>
      {/* Header and tracking reminder removed for full-screen mirror experience */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full h-full overflow-hidden"
      >
        <PsychMirror onChangeMentor={handleChangeMentor} />
      </motion.div>

      {/* Mentor Selection Modal - shown first time after onboarding */}
      <MentorSelectionModal
        isOpen={showMentorModal}
        onClose={() => setShowMentorModal(false)}
        onSelect={handleMentorSelect}
      />
    </>
  );
};
