import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingDown, Flame, Zap } from 'lucide-react';
import { MacroRing } from './MacroRing';

interface HeroCardProps {
  greeting: string;
  userName: string;
  currentWeight: number;
  weightChange: string;
  todayCals: number;
  targetCals: number;
  todayP: number;
  targetP: number;
  todayC: number;
  targetC: number;
  todayF: number;
  targetF: number;
  onOpenAiLog: () => void;
}

export const HeroCard: React.FC<HeroCardProps> = ({
  greeting,
  userName,
  currentWeight,
  weightChange,
  todayCals,
  targetCals,
  todayP,
  targetP,
  todayC,
  targetC,
  todayF,
  targetF,
  onOpenAiLog
}) => {
  const calsPct = Math.round((todayCals / (targetCals || 1)) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card rounded-[36px] p-6 relative overflow-hidden border border-white/15 bg-gradient-to-br from-zinc-900/90 via-zinc-950/80 to-black shadow-2xl space-y-6"
    >
      {/* Background Liquid Glass Glow */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-gradient-to-br from-orange-500/20 via-purple-500/15 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Header Row */}
      <div className="flex items-start justify-between relative z-10">
        <div>
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block">
            {greeting}
          </span>
          <h2 className="text-2xl font-black tracking-tight text-white mt-0.5">
            {userName}
          </h2>
        </div>

        {/* AI Quick Callout Pill */}
        <button
          onClick={onOpenAiLog}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card-interactive border border-purple-500/30 text-purple-300 text-xs font-bold shadow-lg hover:border-purple-500/60"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
          <span>Quick Log</span>
        </button>
      </div>

      {/* Hero Body: Concentric Rings + Stat Grid */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
        {/* Apple Activity Ring */}
        <div className="relative group cursor-pointer" onClick={onOpenAiLog}>
          <MacroRing
            size={180}
            strokeWidth={13}
            caloriesCurrent={todayCals}
            caloriesTarget={targetCals}
            proteinCurrent={todayP}
            proteinTarget={targetP}
            carbsCurrent={todayC}
            carbsTarget={targetC}
            fatCurrent={todayF}
            fatTarget={targetF}
          />
        </div>

        {/* Hero KPI Summary Stack */}
        <div className="w-full flex-1 space-y-3">
          {/* Energy Score Banner */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl gradient-flame text-white shadow-md">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase block">Daily Score</span>
                <span className="text-sm font-extrabold text-white">92 / 100 Optimal</span>
              </div>
            </div>
            <span className="text-xs font-bold text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-full border border-orange-500/20">
              {calsPct}% Goal
            </span>
          </div>

          {/* Weight Snapshot */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase block">Current Weight</span>
              <span className="text-lg font-black text-white">{currentWeight} kg</span>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>{weightChange}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
