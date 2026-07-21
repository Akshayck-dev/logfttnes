import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Flame,
  Award,
  Droplets,
  Dumbbell,
  Target,
  CheckCircle2,
  Lock
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid
} from 'recharts';
import { GlassCard } from '../../components/common/GlassCard';
import { useFitnessStore } from '../../stores/useFitnessStore';
import { useUserStore } from '../../stores/useUserStore';
import { calculateBmi, getBmiCategory } from '../../lib/utils';

const mockWeightTrendData = [
  { date: 'Jul 01', weight: 78.5, target: 72.0 },
  { date: 'Jul 05', weight: 78.0, target: 72.0 },
  { date: 'Jul 09', weight: 77.5, target: 72.0 },
  { date: 'Jul 13', weight: 77.1, target: 72.0 },
  { date: 'Jul 17', weight: 76.8, target: 72.0 },
  { date: 'Jul 21', weight: 76.4, target: 72.0 }
];

const mockCalorieData = [
  { day: 'Mon', calories: 2150, protein: 155 },
  { day: 'Tue', calories: 2300, protein: 168 },
  { day: 'Wed', calories: 2100, protein: 145 },
  { day: 'Thu', calories: 2450, protein: 172 },
  { day: 'Fri', calories: 2200, protein: 160 },
  { day: 'Sat', calories: 2350, protein: 165 },
  { day: 'Sun', calories: 2100, protein: 158 }
];

export const ProgressScreen: React.FC = () => {
  const profile = useUserStore((state) => state.profile);
  const { streak, badges, getLatestWeight } = useFitnessStore();

  const [timeframe, setTimeframe] = useState<'week' | 'month'>('month');

  const currentWeight = getLatestWeight();
  const bmi = calculateBmi(currentWeight, profile.heightCm);
  const bmiCategory = getBmiCategory(bmi);

  return (
    <div className="space-y-6 pb-28 px-4 pt-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Progress & Analytics</h1>
          <p className="text-xs text-zinc-400">Track weight trend, macros & streak badges</p>
        </div>
        <div className="flex items-center gap-1.5 glass-card p-1 rounded-2xl border border-white/10">
          <button
            onClick={() => setTimeframe('week')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              timeframe === 'week' ? 'gradient-purple text-white shadow-md' : 'text-zinc-400'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setTimeframe('month')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              timeframe === 'month' ? 'gradient-purple text-white shadow-md' : 'text-zinc-400'
            }`}
          >
            Month
          </button>
        </div>
      </div>

      {/* BMI & Goal Summary Banner */}
      <GlassCard className="p-5 flex items-center justify-between border-purple-500/30 bg-gradient-to-r from-purple-950/30 to-black">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-300">
            Body Mass Index (BMI)
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-white">{bmi}</span>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${bmiCategory.color}`}
            >
              {bmiCategory.label}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Height: {profile.heightCm} cm • Goal Weight: {profile.targetWeightKg} kg
          </p>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-zinc-400 font-bold uppercase block">Weight Loss</span>
          <span className="text-xl font-black text-emerald-400">
            -{(78.5 - currentWeight).toFixed(1)} kg
          </span>
        </div>
      </GlassCard>

      {/* Weight Trend Chart */}
      <GlassCard className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-400" /> Weight Progress Trend
          </h3>
          <span className="text-xs font-bold text-zinc-400">Current: {currentWeight} kg</span>
        </div>

        <div className="h-56 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockWeightTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#A855F7" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#A855F7" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" stroke="#71717A" fontSize={10} tickLine={false} />
              <YAxis domain={['dataMin - 1', 'dataMax + 1']} stroke="#71717A" fontSize={10} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(18, 18, 24, 0.95)',
                  borderColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '16px',
                  color: '#fff',
                  fontSize: '12px'
                }}
              />
              <Area type="monotone" dataKey="weight" stroke="#A855F7" strokeWidth={3} fillOpacity={1} fill="url(#weightGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Calorie & Protein Weekly Bar Chart */}
      <GlassCard className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" /> Calorie & Protein Consistency
          </h3>
          <span className="text-xs font-bold text-orange-400">Target: {profile.targetCalories} kcal</span>
        </div>

        <div className="h-48 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockCalorieData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" stroke="#71717A" fontSize={10} tickLine={false} />
              <YAxis stroke="#71717A" fontSize={10} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(18, 18, 24, 0.95)',
                  borderColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '16px',
                  color: '#fff',
                  fontSize: '12px'
                }}
              />
              <Bar dataKey="calories" fill="#FF5E36" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Achievements & Streaks Showcase */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
          <Award className="w-4 h-4 text-amber-400" /> Achievements & Badges
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {badges.map((badge) => (
            <GlassCard
              key={badge.id}
              className={`p-4 flex items-center gap-3 border ${
                badge.unlocked
                  ? 'border-amber-500/30 bg-amber-500/5'
                  : 'border-white/5 opacity-60'
              }`}
            >
              <div
                className={`p-3 rounded-2xl text-white shadow-md ${
                  badge.unlocked ? 'gradient-flame' : 'bg-zinc-800 text-zinc-500'
                }`}
              >
                {badge.unlocked ? <Award className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">{badge.title}</h4>
                <p className="text-[10px] text-zinc-400 line-clamp-2 mt-0.5">
                  {badge.description}
                </p>
                {badge.unlockedAt && (
                  <span className="text-[9px] text-amber-400 font-bold block mt-1">
                    Unlocked {badge.unlockedAt}
                  </span>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
};
