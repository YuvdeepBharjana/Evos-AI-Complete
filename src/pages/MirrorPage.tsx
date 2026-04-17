import { motion } from 'framer-motion';
import { PsychMirror } from '../components/psychmirror/PsychMirror';

export const MirrorPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full h-full overflow-hidden"
    >
      <PsychMirror />
    </motion.div>
  );
};
