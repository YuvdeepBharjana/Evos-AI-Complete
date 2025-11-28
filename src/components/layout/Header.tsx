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
      className="glass border-b border-gray-800 px-8 py-4 flex justify-between items-center"
    >
      <div>
        <h1 className="text-2xl font-bold gradient-text">{title}</h1>
        {user && (
          <p className="text-sm text-gray-400 mt-1">
            Welcome back, {user.name}
          </p>
        )}
      </div>

      {showMirrorButton && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onMirrorClick}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-medium"
        >
          <Brain size={20} />
          View Mirror
        </motion.button>
      )}
    </motion.header>
  );
};


