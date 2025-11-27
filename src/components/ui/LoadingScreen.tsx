import { motion } from 'framer-motion';

export const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-950 via-purple-950/30 to-gray-950 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1]
          }}
          transition={{
            rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
            scale: { duration: 2, repeat: Infinity }
          }}
          className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-500 via-blue-500 to-teal-500"
        />
        <h2 className="text-2xl font-bold gradient-text">Loading Evos AI...</h2>
      </motion.div>
    </div>
  );
};


