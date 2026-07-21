import React from 'react';
import { Flame, Sparkles, WifiOff } from 'lucide-react';
import { useUserStore } from '../../stores/useUserStore';
import { useFitnessStore } from '../../stores/useFitnessStore';
import { useNavigate } from 'react-router-dom';

interface AppHeaderProps {
  onOpenAi: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onOpenAi }) => {
  const profile = useUserStore((state) => state.profile);
  const streak = useFitnessStore((state) => state.streak);
  const navigate = useNavigate();
  const isOnline = navigator.onLine;

  return (
    <header
      style={{ paddingTop: 'calc(0.75rem + env(safe-area-inset-top, 0px))' }}
      className="sticky top-0 z-40 w-full glass-nav px-4 pb-3 flex items-center justify-between"
    >
      {/* Profile Info */}
      <div 
        onClick={() => navigate('/settings')}
        role="button"
        tabIndex={0}
        aria-label="Open User Profile Settings"
        className="flex items-center gap-3 cursor-pointer group"
      >
        <div className="relative">
          <img
            src={profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
            alt={profile.fullName}
            className="w-10 h-10 rounded-full object-cover border-2 border-white/20 group-hover:border-orange-500/50 transition-all shadow-md"
          />
          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-black" />
        </div>
        <div>
          <h2 className="text-sm font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors">
            {profile.fullName || 'Alex Vance'}
          </h2>
          <span className="text-[11px] text-zinc-400 font-medium">
            Goal: {profile.targetWeightKg} kg
          </span>
        </div>
      </div>

      {/* Right Controls: Offline indicator, Streak, AI Trigger */}
      <div className="flex items-center gap-2">
        {!isOnline && (
          <div className="flex items-center gap-1 bg-amber-500/20 text-amber-400 px-2 py-1 rounded-full text-xs font-semibold border border-amber-500/30">
            <WifiOff className="w-3 h-3" />
            <span>Offline</span>
          </div>
        )}

        {/* Streak Pill */}
        <div className="flex items-center gap-1.5 bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-400 border border-orange-500/30 px-3 py-1.5 rounded-full text-xs font-bold shadow-inner">
          <Flame className="w-4 h-4 fill-orange-500 text-orange-500 animate-pulse" />
          <span>{streak.currentStreak} Days</span>
        </div>

        {/* AI Assistant Quick Trigger */}
        <button
          onClick={() => navigate('/ai-coach')}
          aria-label="Open FitLog AI Assistant"
          className="p-2 rounded-full gradient-purple text-white shadow-lg hover:opacity-90 active:scale-95 transition-all flex items-center justify-center"
          title="Open FitLog AI Assistant"
        >
          <Sparkles className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
