import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Utensils,
  Dumbbell,
  Scale,
  Droplets,
  TrendingUp,
  Moon,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { GlassCard } from '../../components/common/GlassCard';
import { HeroCard } from '../../components/common/HeroCard';
import { StatCard } from '../../components/common/StatCard';
import { BottomSheet } from '../../components/common/BottomSheet';
import { useFitnessStore } from '../../stores/useFitnessStore';
import { useUserStore } from '../../stores/useUserStore';
import { useNavigate } from 'react-router-dom';

interface HomeScreenProps {
  onOpenAiLog: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onOpenAiLog }) => {
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
    addWeight,
    meals,
    workouts
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

  // Dynamic Greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

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
    <div className="space-y-6 pb-28 px-4 pt-2">
      {/* Hero Card Container */}
      <HeroCard
        greeting={greeting}
        userName={profile.fullName || 'Alex Vance'}
        currentWeight={latestWeight}
        weightChange="-0.4 kg"
        todayCals={todayCals}
        targetCals={profile.targetCalories}
        todayP={todayP}
        targetP={profile.targetProteinG}
        todayC={todayC}
        targetC={profile.targetCarbsG}
        todayF={todayF}
        targetF={profile.targetFatG}
        onOpenAiLog={onOpenAiLog}
      />

      {/* AI Smart Insight Recommendation Card */}
      <GlassCard className="p-5 border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-black flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-purple-600/20 border border-purple-500/30 text-purple-300">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-white">AI Coach Recommendation</h4>
            <p className="text-xs text-zinc-300 mt-0.5">
              "Great job logging {todayP}g protein today! Hydrate with +500ml water before leg day."
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Quick Action Grid */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
          Quick Log Actions
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
              <span className="text-xs font-bold text-white block">Log Meal</span>
              <span className="text-[10px] text-zinc-400">Food & macros</span>
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
              <span className="text-[10px] text-zinc-400">Sets & reps</span>
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

      {/* Grid KPI Metrics */}
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

      {/* Today's Timeline Preview Widget */}
      <GlassCard
        interactive
        onClick={() => navigate('/journal')}
        className="p-5 space-y-3 border-white/10 hover:border-purple-500/30"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-purple-400" /> Today's Unified Timeline
          </h3>
          <span className="text-xs font-bold text-purple-400 flex items-center gap-1">
            View All <ChevronRight className="w-4 h-4" />
          </span>
        </div>

        <div className="space-y-2">
          {meals.slice(0, 2).map((m) => (
            <div key={m.id} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-white/5 border border-white/5">
              <span className="font-bold text-white">
                {m.mealType === 'breakfast' ? '🥚' : '🍗'} {m.title}
              </span>
              <span className="font-mono text-zinc-400">{m.totalCalories} kcal</span>
            </div>
          ))}
        </div>
      </GlassCard>

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
