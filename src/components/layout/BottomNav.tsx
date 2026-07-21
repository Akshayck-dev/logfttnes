import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, BookOpen, Plus, Activity, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface BottomNavProps {
  onOpenAiLog: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onOpenAiLog }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/journal', label: 'Journal', icon: BookOpen },
    { path: 'ai-trigger', label: 'Quick Log', icon: Plus, isCenterButton: true },
    { path: '/progress', label: 'Progress', icon: Activity },
    { path: '/settings', label: 'Profile', icon: User }
  ];

  return (
    <nav
      style={{ bottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
      className="fixed left-4 right-4 z-40 glass-nav max-w-md mx-auto sm:max-w-lg md:max-w-xl rounded-full border border-white/15 px-3 py-2 shadow-2xl"
    >
      <div className="flex items-center justify-around relative">
        {navItems.map((item) => {
          if (item.isCenterButton) {
            return (
              <motion.button
                key="ai-center-btn"
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                onClick={onOpenAiLog}
                aria-label="Open FitLog AI Quick Log"
                className="relative -top-5 w-14 h-14 rounded-full gradient-purple text-white flex items-center justify-center shadow-2xl border-4 border-black group"
                title="Open FitLog AI Quick Log"
              >
                <Plus className="w-7 h-7 text-white stroke-[2.5] group-hover:rotate-90 transition-transform duration-300" />
              </motion.button>
            );
          }

          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              aria-label={item.label}
              className={({ isActive }) =>
                cn(
                  'relative flex flex-col items-center py-1.5 px-3 rounded-2xl transition-all duration-300',
                  isActive ? 'text-purple-300 font-bold' : 'text-zinc-400 hover:text-zinc-200'
                )
              }
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabPill"
                  className="absolute inset-0 bg-purple-500/15 border border-purple-500/30 rounded-2xl -z-10"
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                />
              )}
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-1 tracking-tight font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
