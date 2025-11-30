import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Brain, User, LogOut, FlaskConical, Menu, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUserStore } from '../../store/useUserStore';

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, clearUser } = useUserStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { icon: MessageSquare, label: 'Chat', path: '/dashboard' },
    { icon: Brain, label: 'Mirror', path: '/mirror' },
    { icon: FlaskConical, label: '30-Day', path: '/experiment' }
  ];

  const handleLogout = () => {
    clearUser();
    navigate('/');
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  if (!user) return null;

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="hidden md:flex w-20 glass border-r border-gray-800 flex-col items-center py-6"
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

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 glass border-b border-gray-800">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 flex items-center justify-center p-1.5">
              <img src="/evos-logo.svg" alt="Evos" className="w-full h-full invert" />
            </div>
            <span className="font-bold text-white">Evos</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black/60 z-40"
              onClick={() => setMobileMenuOpen(false)}
            />
            
            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="md:hidden fixed right-0 top-0 bottom-0 w-72 glass border-l border-gray-800 z-50 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-800">
                <span className="font-bold text-white">Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;

                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNavigate(item.path)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                        isActive
                          ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* User Actions */}
              <div className="p-4 border-t border-gray-800 space-y-2">
                <button
                  onClick={() => handleNavigate('/profile')}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <User size={20} />
                  <span>Profile</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass border-t border-gray-800 safe-area-bottom">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors min-w-[64px] ${
                  isActive
                    ? 'text-cyan-400'
                    : 'text-gray-500'
                }`}
              >
                <Icon size={20} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
          <button
            onClick={() => navigate('/profile')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors min-w-[64px] ${
              location.pathname === '/profile'
                ? 'text-cyan-400'
                : 'text-gray-500'
            }`}
          >
            <User size={20} />
            <span className="text-[10px] font-medium">Profile</span>
          </button>
        </div>
      </div>
    </>
  );
};
