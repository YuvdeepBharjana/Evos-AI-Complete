import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';

interface HeaderProps {
  title: string;
  showMirrorButton?: boolean;
  onMirrorClick?: () => void;
}

export const Header = ({ title, showMirrorButton, onMirrorClick }: HeaderProps) => {
  const { user } = useUserStore();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="glass border-b border-gray-800 px-4 sm:px-8 py-6 sm:py-7 relative min-h-[100px] sm:min-h-[110px]"
    >
      <div className="flex items-center justify-between relative">
        {/* Spacer for balance */}
        <div className="w-32 sm:w-40"></div>

        {/* Centered Title */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold gradient-text whitespace-nowrap">
            {title}
          </h1>
        </div>

        {/* Right side button or spacer */}
        {showMirrorButton ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onMirrorClick}
            className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-medium text-sm sm:text-base shadow-lg shadow-indigo-500/20"
          >
            <Brain size={18} className="sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">View Mirror</span>
            <span className="sm:hidden">Mirror</span>
          </motion.button>
        ) : (
          <div className="w-32 sm:w-40"></div>
        )}
      </div>

      {/* Welcome message in bottom left corner */}
      {user && (
        <div className="absolute bottom-3 left-4 sm:left-8">
          <span className="text-sm sm:text-base text-gray-400">
            Welcome back, <span className="text-white font-semibold">{user.name}</span>
          </span>
        </div>
      )}
    </motion.header>
  );
};
