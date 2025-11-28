import { motion } from 'framer-motion';
import { MessageSquare, Brain, User, LogOut, FlaskConical } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUserStore } from '../../store/useUserStore';

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, clearUser } = useUserStore();

  const navItems = [
    { icon: MessageSquare, label: 'Chat', path: '/dashboard' },
    { icon: Brain, label: 'Mirror', path: '/mirror' },
    { icon: FlaskConical, label: '30-Day Experiment', path: '/experiment' }
  ];

  const handleLogout = () => {
    clearUser();
    navigate('/');
  };

  if (!user) return null;

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-20 glass border-r border-gray-800 flex flex-col items-center py-6"
    >
      {/* Logo */}
      <div className="mb-8">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 flex items-center justify-center p-2">
          <img src="/evos-logo.svg" alt="Evos" className="w-full h-full invert" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <motion.button
              key={item.path}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(item.path)}
              className={`relative p-3 rounded-xl transition-colors ${
                isActive
                  ? 'bg-gradient-to-br from-indigo-500 to-cyan-500 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
              title={item.label}
            >
              <Icon size={24} />
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-xl -z-10"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="mt-auto flex flex-col gap-4">
        <button
          onClick={() => navigate('/profile')}
          className="p-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          title="Profile"
        >
          <User size={24} />
        </button>
        <button
          onClick={handleLogout}
          className="p-3 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          title="Logout"
        >
          <LogOut size={24} />
        </button>
      </div>
    </motion.div>
  );
};


