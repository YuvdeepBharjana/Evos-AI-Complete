/**
 * App Sidebar
 * 
 * Left sidebar navigation for authenticated app pages.
 */

import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Calendar, 
  User, 
  Settings, 
  Menu, 
  X,
  MessageSquare,
  CheckCircle2,
  Lock,
  Sparkles
} from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';

export const AppSidebar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUserStore();

  // Get user tier (default to 'free' if missing)
  const tier = user?.tier || 'free';
  const isPro = tier === 'pro';

  // Define which features require PRO
  const proFeatures = ['/postmarket'];

  const navItems = [
    { icon: Home, label: 'Home', path: '/home', requiresPro: false },
    { icon: MessageSquare, label: 'Premarket', path: '/premarket', requiresPro: false },
    { icon: CheckCircle2, label: 'Post-Market', path: '/postmarket', requiresPro: true },
    { icon: Calendar, label: 'Calendar', path: '/calendar', requiresPro: false },
  ];

  const bottomNavItems = [
    { icon: User, label: 'Profile', path: '/profile', requiresPro: false },
    { icon: Settings, label: 'Settings', path: '/settings', requiresPro: false },
  ];

  const isActive = (path: string) => location.pathname === path;
  const isLocked = (path: string, requiresPro: boolean) => requiresPro && !isPro;

  const handleNavClick = (path: string, requiresPro: boolean) => {
    // If feature is locked, redirect to pricing
    if (isLocked(path, requiresPro)) {
      navigate('/pricing');
      setMobileMenuOpen(false);
      return;
    }
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-60 bg-[#030014] border-r border-white/10 flex-col z-40">
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <Link to="/home" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
            </div>
            <span className="font-bold text-xl tracking-tight text-white">Evos AI</span>
          </Link>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            const locked = isLocked(item.path, item.requiresPro);

            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path, item.requiresPro)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all relative group ${
                  locked
                    ? 'opacity-60 cursor-pointer'
                    : active
                    ? 'bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 border border-indigo-400/30 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                title={locked ? 'Upgrade to unlock' : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium text-sm flex-1 text-left">{item.label}</span>
                {locked && (
                  <Lock className="w-4 h-4 text-gray-500 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Navigation */}
        <div className="px-4 py-4 border-t border-white/10 space-y-2">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            const locked = isLocked(item.path, item.requiresPro);

            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path, item.requiresPro)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  locked
                    ? 'opacity-60 cursor-pointer'
                    : active
                    ? 'bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 border border-indigo-400/30 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                title={locked ? 'Upgrade to unlock' : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium text-sm flex-1 text-left">{item.label}</span>
                {locked && (
                  <Lock className="w-4 h-4 text-gray-500 flex-shrink-0" />
                )}
              </button>
            );
          })}
          
          {/* Tier Badge */}
          <div className="pt-2 mt-2 border-t border-white/5">
            <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold text-center ${
              isPro
                ? 'bg-green-500/20 text-green-400 border border-green-400/30'
                : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
            }`}>
              {isPro ? 'PRO' : 'FREE'}
            </div>
          </div>

          {/* Upgrade CTA (only for free users) */}
          {!isPro && (
            <button
              onClick={() => {
                navigate('/pricing');
                setMobileMenuOpen(false);
              }}
              className="w-full mt-3 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
            >
              <Sparkles className="w-4 h-4" />
              Upgrade to PRO
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-[#030014]/90 backdrop-blur-xl border border-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
            />

            {/* Sidebar */}
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="md:hidden fixed left-0 top-0 bottom-0 w-60 bg-[#030014] border-r border-white/10 flex flex-col z-50"
            >
              {/* Logo */}
              <div className="p-6 border-b border-white/10">
                <Link to="/home" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-xl blur-lg opacity-50" />
                    <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">E</span>
                    </div>
                  </div>
                  <span className="font-bold text-xl tracking-tight text-white">Evos AI</span>
                </Link>
              </div>

              {/* Main Navigation */}
              <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  const locked = isLocked(item.path, item.requiresPro);

                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNavClick(item.path, item.requiresPro)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all relative group ${
                        locked
                          ? 'opacity-60 cursor-pointer'
                          : active
                          ? 'bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 border border-indigo-400/30 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                      title={locked ? 'Upgrade to unlock' : undefined}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="font-medium text-sm flex-1 text-left">{item.label}</span>
                      {locked && (
                        <Lock className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* Bottom Navigation */}
              <div className="px-4 py-4 border-t border-white/10 space-y-2">
                {bottomNavItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  const locked = isLocked(item.path, item.requiresPro);

                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNavClick(item.path, item.requiresPro)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        locked
                          ? 'opacity-60 cursor-pointer'
                          : active
                          ? 'bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 border border-indigo-400/30 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                      title={locked ? 'Upgrade to unlock' : undefined}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="font-medium text-sm flex-1 text-left">{item.label}</span>
                      {locked && (
                        <Lock className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
                
                {/* Tier Badge */}
                <div className="pt-2 mt-2 border-t border-white/5">
                  <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold text-center ${
                    isPro
                      ? 'bg-green-500/20 text-green-400 border border-green-400/30'
                      : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                  }`}>
                    {isPro ? 'PRO' : 'FREE'}
                  </div>
                </div>

                {/* Upgrade CTA (only for free users) */}
                {!isPro && (
                  <button
                    onClick={() => {
                      navigate('/pricing');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full mt-3 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                  >
                    <Sparkles className="w-4 h-4" />
                    Upgrade to PRO
                  </button>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
