import { motion } from 'framer-motion';
import { Header } from '../components/layout/Header';
import { PsychMirror } from '../components/psychmirror/PsychMirror';
import { TrackingReminder } from '../components/tracking/TrackingReminder';

export const MirrorPage = () => {
  console.log('📄 MirrorPage rendering');
  
  return (
    <>
      <Header title="Evos AI" />
      <TrackingReminder variant="banner" />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 overflow-hidden"
        style={{ minHeight: '500px' }}
      >
        <PsychMirror />
      </motion.div>
    </>
  );
};
