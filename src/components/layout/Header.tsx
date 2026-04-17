import { motion } from 'framer-motion';
import { Brain, MessageSquare } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

interface HeaderProps {
  title: string;
  showMirrorButton?: boolean;
  onMirrorClick?: () => void;
  showDashboardButton?: boolean;
  onDashboardClick?: () => void;
}

export const Header = ({ title, showMirrorButton, onMirrorClick, showDashboardButton, onDashboardClick }: HeaderProps) => {
  const { user } = useAuthStore();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="glass border-b border-gray-800 px-4 sm:px-6 py-3 sm:py-4 relative min-h-[70px] sm:min-h-[80px]"
    >
      <div className="flex items-center justify-between">
        {/* Spacer for balance */}
        <div className="w-24 sm:w-32"></div>

        {/* Centered Title */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <h1 className="text-3xl sm:text-4xl font-bold gradient-text whitespace-nowrap">
            {title}
          </h1>
        </div>

        {/* Right side button or spacer */}
        {showMirrorButton ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onMirrorClick}
            className="flex items-center justify-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-medium text-xs sm:text-sm shadow-lg shadow-indigo-500/20"
          >
            <Brain size={16} className="sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">View Mirror</span>
            <span className="sm:hidden">Mirror</span>
          </motion.button>
        ) : showDashboardButton ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onDashboardClick}
            className="flex items-center justify-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-medium text-xs sm:text-sm shadow-lg shadow-indigo-500/20"
          >
            <MessageSquare size={16} className="sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Dashboard</span>
            <span className="sm:hidden">Chat</span>
          </motion.button>
        ) : (
          <div className="w-24 sm:w-32"></div>
        )}
      </div>

      {/* Welcome message in bottom left corner */}
      {user && (
        <div className="absolute bottom-2 left-4 sm:left-6">
          <span className="text-xs sm:text-sm text-gray-400">
            Welcome back, <span className="text-white font-semibold">{user.name}</span>
          </span>
        </div>
      )}
    </motion.header>
  );
};
