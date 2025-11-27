import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const FloatingMirrorButton = () => {
  const navigate = useNavigate();

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => navigate('/mirror')}
      className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 via-blue-500 to-teal-500 shadow-2xl shadow-purple-500/50 flex items-center justify-center z-50 group"
      title="Open Psychological Mirror"
    >
      <motion.div
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
      >
        <Brain size={28} className="text-white" />
      </motion.div>
      
      {/* Pulse effect */}
      <motion.div
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.5, 0, 0.5]
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute inset-0 rounded-full bg-purple-500"
      />

      {/* Tooltip */}
      <div className="absolute bottom-full mb-2 right-0 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        <div className="glass px-3 py-2 rounded-lg text-sm">
          View Your Mirror
        </div>
      </div>
    </motion.button>
  );
};


