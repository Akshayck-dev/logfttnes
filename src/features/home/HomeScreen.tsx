import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Flame,
  Utensils,
  Dumbbell,
  Scale,
  Droplets,
  Plus,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Moon
} from 'lucide-react';
import { GlassCard } from '../../components/common/GlassCard';
import { MacroRing } from '../../components/common/MacroRing';
import { StatCard } from '../../components/common/StatCard';
import { BottomSheet } from '../../components/common/BottomSheet';
import { useFitnessStore } from '../../stores/useFitnessStore';
import { useUserStore } from '../../stores/useUserStore';
import { useNavigate } from 'react-router-dom';

interface HomeScreenProps {
  onOpenAi: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onOpenAi }) => {
  const navigate = useNavigate();
  const profile = useUserStore((state) => state.profile);
  
  const {
    getTodayCalories,
    getTodayProtein,
    getTodayCarbs,
    getTodayFat,
    getTodayWater,
    getTodayWorkouts,
    getLatestWeight,
    addWater,
    addWeight
  } = useFitnessStore();

  const [activeSheet, setActiveSheet] = useState<'water' | 'weight' | null>(null);
  const [weightInput, setWeightInput] = useState<string>('');
  const [customWaterInput, setCustomWaterInput] = useState<string>('');

  const todayCals = getTodayCalories();
  const todayP = getTodayProtein();
  const todayC = getTodayCarbs();
  const todayF = getTodayFat();
  const todayWater = getTodayWater();
  const todayWorkouts = getTodayWorkouts();
  const latestWeight = getLatestWeight();

  const handleLogWeightSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(weightInput);
    if (!isNaN(val) && val > 30) {
      addWeight(val);
      setWeightInput('');
      setActiveSheet(null);
    }
  };

  const handleCustomWaterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customWaterInput, 10);
    if (!isNaN(val) && val > 0) {
      addWater(val);
      setCustomWaterInput('');
      setActiveSheet(null);
    }
  };

  return (
    <div className="space-y-6 pb-24 px-4 pt-2">
      {/* AI Assistant Quick Callout */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => navigate('/ai-coach')}
        className="glass-card-interactive p-4 rounded-3xl border border-purple-500/30 bg-gradient-to-r from-purple-900/30 via-indigo-900/20 to-black flex items-center justify-between cursor-pointer shadow-lg"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-purple-600/30 border border-purple-500/40 text-purple-300">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              FitLog AI Coach Ready
            </h4>
            <p className="text-xs text-zinc-400">
              Type or speak: <span className="text-purple-300 italic">"Log 3 eggs & oats"</span>
            </p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-purple-400" />
      </motion.div>

      {/* Main Macro Ring & Daily Summary */}
      <GlassCard className="flex flex-col md:flex-row items-center justify-between gap-6 p-6">
        <div className="flex justify-center">
          <MacroRing
            size={190}
            strokeWidth={14}
            caloriesCurrent={todayCals}
            caloriesTarget={profile.targetCalories}
            proteinCurrent={todayP}
            proteinTarget={profile.targetProteinG}
            carbsCurrent={todayC}
            carbsTarget={profile.targetCarbsG}
            fatCurrent={todayF}
            fatTarget={profile.targetFatG}
          />
        </div>

        {/* Macro Stat Breakdown */}
        <div className="w-full flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-white tracking-tight">Today's Macros</h3>
            <span className="text-xs font-semibold text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-full border border-orange-500/20">
              {todayCals} / {profile.targetCalories} kcal
            </span>
          </div>

          {/* Macro Progress Rows */}
          <div className="space-y-2.5">
            {/* Protein */}
            <div>
              <div className="flex justify-between text-xs font-bold text-zinc-300 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Protein
                </span>
                <span>
                  {Math.round(todayP)} / {profile.targetProteinG}g
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((todayP / profile.targetProteinG) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Carbs */}
            <div>
              <div className="flex justify-between text-xs font-bold text-zinc-300 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Carbs
                </span>
                <span>
                  {Math.round(todayC)} / {profile.targetCarbsG}g
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-cyan-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((todayC / profile.targetCarbsG) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Fat */}
            <div>
              <div className="flex justify-between text-xs font-bold text-zinc-300 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Fat
                </span>
                <span>
                  {Math.round(todayF)} / {profile.targetFatG}g
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((todayF / profile.targetFatG) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Quick Action Pills */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => navigate('/meals')}
            className="glass-card-interactive p-3.5 rounded-2xl flex items-center gap-3 text-left border border-white/10 hover:border-orange-500/40"
          >
            <div className="p-2 rounded-xl gradient-flame text-white shadow-md">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Add Meal</span>
              <span className="text-[10px] text-zinc-400">Log food & macros</span>
            </div>
          </button>

          <button
            onClick={() => navigate('/workouts')}
            className="glass-card-interactive p-3.5 rounded-2xl flex items-center gap-3 text-left border border-white/10 hover:border-emerald-500/40"
          >
            <div className="p-2 rounded-xl gradient-emerald text-white shadow-md">
              <Dumbbell className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Log Workout</span>
              <span className="text-[10px] text-zinc-400">Exercises & sets</span>
            </div>
          </button>

          <button
            onClick={() => setActiveSheet('weight')}
            className="glass-card-interactive p-3.5 rounded-2xl flex items-center gap-3 text-left border border-white/10 hover:border-purple-500/40"
          >
            <div className="p-2 rounded-xl gradient-purple text-white shadow-md">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Add Weight</span>
              <span className="text-[10px] text-zinc-400">Track progress</span>
            </div>
          </button>

          <button
            onClick={() => setActiveSheet('water')}
            className="glass-card-interactive p-3.5 rounded-2xl flex items-center gap-3 text-left border border-white/10 hover:border-cyan-500/40"
          >
            <div className="p-2 rounded-xl gradient-cyan text-white shadow-md">
              <Droplets className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Drink Water</span>
              <span className="text-[10px] text-zinc-400">Quick +250ml</span>
            </div>
          </button>
        </div>
      </div>

      {/* Grid KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Workout Status */}
        <StatCard
          title="Today's Workout"
          value={todayWorkouts.length > 0 ? todayWorkouts[0].title : 'Rest / Pending'}
          unit={todayWorkouts.length > 0 ? `${todayWorkouts[0].durationMinutes}m` : ''}
          subtitle={todayWorkouts.length > 0 ? `${todayWorkouts[0].caloriesBurned} kcal burned` : 'Tap to start session'}
          icon={<Dumbbell className="w-5 h-5" />}
          accentGradient="gradient-emerald"
          barColor="bg-emerald-500"
          progressPct={todayWorkouts.length > 0 ? 100 : 0}
          onClick={() => navigate('/workouts')}
        />

        {/* Water Intake */}
        <StatCard
          title="Water Intake"
          value={`${todayWater} ml`}
          unit={`/ ${profile.targetWaterMl} ml`}
          progressPct={Math.round((todayWater / profile.targetWaterMl) * 100)}
          target={profile.targetWaterMl}
          icon={<Droplets className="w-5 h-5" />}
          accentGradient="gradient-cyan"
          barColor="bg-cyan-400"
          onClick={() => setActiveSheet('water')}
        />

        {/* Current Weight */}
        <StatCard
          title="Current Weight"
          value={`${latestWeight} kg`}
          unit={`Goal: ${profile.targetWeightKg} kg`}
          subtitle={`Diff: ${(latestWeight - profile.targetWeightKg).toFixed(1)} kg remaining`}
          icon={<TrendingUp className="w-5 h-5" />}
          accentGradient="gradient-purple"
          barColor="bg-purple-500"
          progressPct={78}
          onClick={() => navigate('/progress')}
        />

        {/* Sleep Tracker Card */}
        <StatCard
          title="Last Sleep"
          value="8.2 hrs"
          unit="Score: 5/5"
          subtitle="Deep REM sleep recorded"
          icon={<Moon className="w-5 h-5" />}
          accentGradient="bg-gradient-to-tr from-indigo-600 to-blue-500"
          barColor="bg-indigo-500"
          progressPct={92}
          onClick={() => navigate('/progress')}
        />
      </div>

      {/* Bottom Sheet Modal: Add Weight */}
      <BottomSheet
        isOpen={activeSheet === 'weight'}
        onClose={() => setActiveSheet(null)}
        title="Log Today's Weight"
        subtitle="Keep your progress graph updated for accurate BMI"
      >
        <form onSubmit={handleLogWeightSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-2">Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              placeholder="e.g. 76.5"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              className="w-full glass-input rounded-2xl p-4 text-2xl font-extrabold tracking-tight text-center"
              required
              autoFocus
            />
          </div>
          <button
            type="submit"
            className="w-full p-4 rounded-2xl gradient-purple font-bold text-white shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            Save Weight Entry
          </button>
        </form>
      </BottomSheet>

      {/* Bottom Sheet Modal: Drink Water */}
      <BottomSheet
        isOpen={activeSheet === 'water'}
        onClose={() => setActiveSheet(null)}
        title="Log Water Intake"
        subtitle="Tap quick buttons or enter custom amount"
      >
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[250, 500, 750, 1000].map((ml) => (
            <button
              key={ml}
              onClick={() => {
                addWater(ml);
                setActiveSheet(null);
              }}
              className="glass-card-interactive p-4 rounded-2xl border border-cyan-500/30 flex flex-col items-center justify-center text-cyan-300 font-extrabold"
            >
              <Droplets className="w-6 h-6 mb-1 text-cyan-400" />
              <span>+{ml} ml</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleCustomWaterSubmit} className="space-y-3">
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Custom ml (e.g. 350)"
              value={customWaterInput}
              onChange={(e) => setCustomWaterInput(e.target.value)}
              className="flex-1 glass-input rounded-2xl p-3 text-sm font-bold text-center"
            />
            <button
              type="submit"
              className="px-5 rounded-2xl gradient-cyan font-bold text-black text-sm active:scale-95 transition-all"
            >
              Log
            </button>
          </div>
        </form>
      </BottomSheet>
    </div>
  );
};
