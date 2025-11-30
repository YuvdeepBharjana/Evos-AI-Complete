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
      className="glass border-b border-gray-800 px-4 sm:px-8 py-3 sm:py-4 flex justify-between items-center"
    >
      <div className="min-w-0 flex-1">
        <h1 className="text-lg sm:text-2xl font-bold gradient-text truncate">{title}</h1>
        {user && (
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5 sm:mt-1 truncate">
            Welcome back, {user.name}
          </p>
        )}
      </div>

      {showMirrorButton && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onMirrorClick}
          className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-medium text-sm sm:text-base ml-3 flex-shrink-0"
        >
          <Brain size={18} className="sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">View Mirror</span>
          <span className="sm:hidden">Mirror</span>
        </motion.button>
      )}
    </motion.header>
  );
};
