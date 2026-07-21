import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Utensils, Dumbbell, Activity, Sparkles, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export const BottomNav: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/meals', label: 'Meals', icon: Utensils },
    { path: '/workouts', label: 'Workouts', icon: Dumbbell },
    { path: '/progress', label: 'Progress', icon: Activity },
    { path: '/ai-coach', label: 'AI Coach', icon: Sparkles, highlight: true },
    { path: '/settings', label: 'Settings', icon: Settings }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass-nav px-3 py-2 max-w-md mx-auto sm:max-w-lg md:max-w-2xl rounded-t-3xl sm:rounded-3xl sm:bottom-4 border-t sm:border border-white/10 shadow-2xl">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'relative flex flex-col items-center py-1.5 px-2.5 rounded-2xl transition-all duration-300',
                  isActive
                    ? item.highlight
                      ? 'text-purple-400 font-bold'
                      : 'text-orange-400 font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                )
              }
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className={cn(
                    'absolute inset-0 rounded-2xl -z-10',
                    item.highlight
                      ? 'bg-purple-500/15 border border-purple-500/30'
                      : 'bg-orange-500/15 border border-orange-500/30'
                  )}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                />
              )}
              <div className="relative">
                <Icon className={cn('w-5 h-5', item.highlight && isActive && 'animate-bounce')} />
              </div>
              <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
