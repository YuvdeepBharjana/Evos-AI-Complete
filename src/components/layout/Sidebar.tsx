import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MessageSquare, User, LogOut, Menu, X, AlertCircle, Plus, Dna, CheckCircle2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { AddNodeModal } from '../psychmirror/AddNodeModal';
import { MentorSelectionModal } from '../psychmirror/MentorSelectionModal';
import type { IdentityNode } from '../../types';
import type { AIMentorStyle } from '../../lib/api';

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMentorModal, setShowMentorModal] = useState(false);

  // CORE DISCIPLINE NAVIGATION (Primary trader workflow)
  const navItems = [
    { icon: MessageSquare, label: 'Premarket', path: '/premarket', tooltip: 'Premarket calibration chatbot' },
    { icon: CheckCircle2, label: 'Post-Market', path: '/postmarket', tooltip: 'Post-market review' },
    { icon: Calendar, label: 'Calendar', path: '/calendar', tooltip: 'Discipline calendar update' },
    { icon: MessageSquare, label: 'Dashboard', path: '/dashboard', tooltip: 'Analytics and chat' },
  ];

  // LEGACY ROUTES (Hidden from default navigation, but still accessible via direct URL)
  // These are kept for backward compatibility but not shown in sidebar
  // const legacyRoutes = [
  //   { icon: Brain, label: 'Mirror', path: '/mirror', tooltip: 'View your Psychological Mirror' },
  //   { icon: FlaskConical, label: '30-Day', path: '/experiment', tooltip: '30-Day Growth Experiment' }
  // ];

  // Show Mirror actions only on Mirror page (legacy feature)
  const showActions = location.pathname === '/mirror';

  // Legacy: Add node handler (kept for backward compatibility with /mirror route)
  // Note: This functionality is deprecated but kept for legacy Mirror page access
  const handleAddNode = (_node: IdentityNode) => {
    // TODO: Implement node addition if needed for legacy Mirror feature
    console.warn('Add node functionality is deprecated. Mirror feature is legacy.');
    setShowAddModal(false);
  };

  const handleMentorSelect = (style: AIMentorStyle) => {
    console.log('✅ Mentor style selected:', style);
    setShowMentorModal(false);
  };

  const handleLogout = () => {
    signOut();
    navigate('/');
    setShowLogoutConfirm(false);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(true);
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
                title={item.tooltip}
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

        {/* Mirror Actions - Only show on Mirror page */}
        {showActions && (
          <div className="flex flex-col gap-3 pb-4 border-b border-gray-800">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddModal(true)}
              className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-indigo-500/50 transition-all"
              title="Add a new identity node"
            >
              <Plus size={24} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowMentorModal(true)}
              className="p-3 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 text-white hover:shadow-lg hover:shadow-purple-500/50 transition-all"
              title="Change AI Mentor style"
            >
              <Dna size={24} />
            </motion.button>
          </div>
        )}

        {/* User Profile */}
        <div className="mt-auto flex flex-col gap-4">
          <button
            onClick={() => navigate('/profile')}
            className="p-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            title="View your profile and settings"
          >
            <User size={24} />
          </button>
          <button
            onClick={confirmLogout}
            className="p-3 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Sign out of your account"
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

                {/* Mirror Actions - Only show on Mirror page */}
                {showActions && (
                  <>
                    <div className="my-3 border-t border-gray-800" />
                    <button
                      onClick={() => {
                        setShowAddModal(true);
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white hover:opacity-90 transition-opacity"
                    >
                      <Plus size={20} />
                      <span>Add Node</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowMentorModal(true);
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:opacity-90 transition-opacity"
                    >
                      <Dna size={20} />
                      <span>AI Mentor</span>
                    </button>
                  </>
                )}
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
                  onClick={confirmLogout}
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

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]"
              onClick={() => setShowLogoutConfirm(false)}
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-md mx-4"
            >
              <div className="glass rounded-2xl border border-gray-800 p-6 shadow-2xl">
                {/* Icon */}
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-red-400" />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-white text-center mb-2">
                  Sign Out?
                </h3>

                {/* Message */}
                <p className="text-gray-400 text-center mb-6">
                  Are you sure you want to sign out? Your data will be saved and you can log back in anytime.
                </p>

                {/* Actions */}
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowLogoutConfirm(false)}
                    className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleLogout}
                    className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium transition-all shadow-lg shadow-red-500/20"
                  >
                    Sign Out
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mirror Modals - Only active on Mirror page */}
      {showActions && (
        <>
          <AddNodeModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onAdd={handleAddNode}
          />
          <MentorSelectionModal
            isOpen={showMentorModal}
            onClose={() => setShowMentorModal(false)}
            onSelect={handleMentorSelect}
          />
        </>
      )}
    </>
  );
};
