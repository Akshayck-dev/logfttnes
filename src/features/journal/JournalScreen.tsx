import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Sparkles,
  Utensils,
  Dumbbell,
  Scale,
  Droplets,
  Moon,
  Trash2,
  Filter,
  Plus
} from 'lucide-react';
import { GlassCard } from '../../components/common/GlassCard';
import { useFitnessStore } from '../../stores/useFitnessStore';
import { formatTimeAgo } from '../../lib/utils';

interface TimelineEntry {
  id: string;
  type: 'meal' | 'workout' | 'weight' | 'water' | 'sleep';
  title: string;
  subtitle: string;
  timestamp: string;
  icon: string;
  badgeColor: string;
  rawItem: any;
}

interface JournalScreenProps {
  onOpenAiLog: () => void;
}

export const JournalScreen: React.FC<JournalScreenProps> = ({ onOpenAiLog }) => {
  const {
    meals,
    workouts,
    weights,
    waterLogs,
    sleepLogs,
    deleteMeal,
    deleteWorkout
  } = useFitnessStore();

  const [filterType, setFilterType] = useState<string>('all');

  // Build Chronological Timeline Entries
  const timelineEntries: TimelineEntry[] = [
    ...meals.map((m) => ({
      id: m.id,
      type: 'meal' as const,
      title: `${m.mealType.toUpperCase()}: ${m.title}`,
      subtitle: `${m.totalCalories} kcal • ${m.totalProteinG}g Protein • ${m.totalCarbsG}g Carbs • ${m.totalFatG}g Fat`,
      timestamp: m.loggedAt,
      icon: m.mealType === 'breakfast' ? '🥚' : '🍗',
      badgeColor: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
      rawItem: m
    })),
    ...workouts.map((w) => ({
      id: w.id,
      type: 'workout' as const,
      title: `🏋 Workout: ${w.title}`,
      subtitle: `${w.durationMinutes} mins • ${w.caloriesBurned} kcal burned • ${w.exercises.length} exercises`,
      timestamp: w.loggedAt,
      icon: '🏋',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      rawItem: w
    })),
    ...weights.map((wt) => ({
      id: wt.id,
      type: 'weight' as const,
      title: `⚖ Weight Entry: ${wt.weightKg} kg`,
      subtitle: `BMI: ${wt.bmi} • Logged via scale`,
      timestamp: wt.loggedAt,
      icon: '⚖',
      badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      rawItem: wt
    })),
    ...waterLogs.map((wl) => ({
      id: wl.id,
      type: 'water' as const,
      title: `💧 Hydration: +${wl.amountMl} ml`,
      subtitle: 'Water intake logged',
      timestamp: wl.loggedAt,
      icon: '💧',
      badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      rawItem: wl
    })),
    ...sleepLogs.map((sl) => ({
      id: sl.id,
      type: 'sleep' as const,
      title: `🌙 Sleep Session: ${sl.durationHours} hrs`,
      subtitle: `Quality Score: ${sl.qualityScore}/5 • Restful sleep`,
      timestamp: sl.loggedAt,
      icon: '🌙',
      badgeColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      rawItem: sl
    }))
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const filteredTimeline = timelineEntries.filter(
    (item) => filterType === 'all' || item.type === filterType
  );

  const handleDeleteEntry = (entry: TimelineEntry) => {
    if (entry.type === 'meal') deleteMeal(entry.id);
    if (entry.type === 'workout') deleteWorkout(entry.id);
  };

  return (
    <div className="space-y-6 pb-28 px-4 pt-2">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Fitness Journal</h1>
          <p className="text-xs text-zinc-400">Unified chronological timeline of your day</p>
        </div>
        <button
          onClick={onOpenAiLog}
          className="px-4 py-2.5 rounded-2xl gradient-purple text-white font-bold text-xs shadow-lg active:scale-95 transition-all flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-purple-200" /> Log Entry
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {(['all', 'meal', 'workout', 'weight', 'water', 'sleep'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterType(cat)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold capitalize transition-all border ${
              filterType === cat
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-md'
                : 'glass-card text-zinc-400 border-white/10 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Unified Chronological Timeline Feed */}
      <div className="relative space-y-4">
        {/* Timeline Vertical Guide Line */}
        <div className="absolute left-6 top-3 bottom-3 w-0.5 bg-white/10 pointer-events-none" />

        <AnimatePresence>
          {filteredTimeline.length === 0 ? (
            <GlassCard className="p-8 text-center ml-10">
              <Calendar className="w-10 h-10 mx-auto text-zinc-500 mb-2" />
              <p className="text-sm font-bold text-zinc-300">No journal entries found</p>
              <p className="text-xs text-zinc-400 mt-1">
                Tap "+ Log Entry" or dictate via AI Coach to start your timeline.
              </p>
            </GlassCard>
          ) : (
            filteredTimeline.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative pl-12"
              >
                {/* Timeline Icon Node */}
                <div className="absolute left-2.5 top-3.5 w-7 h-7 rounded-full bg-zinc-900 border-2 border-purple-500/40 flex items-center justify-center text-xs shadow-md z-10">
                  {entry.icon}
                </div>

                {/* Timeline Glass Card */}
                <GlassCard className="p-4 flex flex-col justify-between space-y-2 border-white/10 hover:border-purple-500/30">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${entry.badgeColor}`}>
                        {entry.type}
                      </span>
                      <h3 className="text-base font-extrabold text-white mt-1">{entry.title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-zinc-400">
                        {formatTimeAgo(entry.timestamp)}
                      </span>
                      {(entry.type === 'meal' || entry.type === 'workout') && (
                        <button
                          onClick={() => handleDeleteEntry(entry)}
                          className="p-1 rounded-full hover:bg-rose-500/20 text-zinc-500 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-zinc-300 font-medium">{entry.subtitle}</p>
                </GlassCard>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
