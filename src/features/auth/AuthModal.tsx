import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Mail, Lock, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { useUserStore } from '../../stores/useUserStore';

export const AuthModal: React.FC = () => {
  const { isAuthenticated, setAuthenticated, setOnboarded, updateProfile } = useUserStore();
  const [mode, setMode] = useState<'login' | 'signup' | 'onboarding'>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  // Onboarding fields
  const [goal, setGoal] = useState<'lose_weight' | 'maintain' | 'gain_muscle'>('lose_weight');
  const [currentWeight, setCurrentWeight] = useState('75');
  const [targetWeight, setTargetWeight] = useState('70');

  if (isAuthenticated) return null;

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'signup') {
      setMode('onboarding');
    } else {
      setAuthenticated(true);
    }
  };

  const handleOnboardingFinish = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      fullName: fullName || 'Fitness Athlete',
      fitnessGoal: goal,
      currentWeightKg: parseFloat(currentWeight) || 75,
      targetWeightKg: parseFloat(targetWeight) || 70
    });
    setOnboarded(true);
    setAuthenticated(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md glass-card p-6 rounded-3xl border border-white/20 shadow-2xl space-y-6"
      >
        {/* App Logo */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-3xl gradient-flame flex items-center justify-center text-white shadow-xl">
            <Activity className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">FitLog AI</h2>
          <p className="text-xs text-zinc-400">Next-Gen Apple-Designed Fitness PWA & AI Coach</p>
        </div>

        {mode !== 'onboarding' ? (
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="Alex Vance"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full glass-input rounded-2xl p-3 text-xs font-bold text-white"
                  required
                />
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1">Email Address</label>
              <input
                type="email"
                placeholder="alex@apple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full glass-input rounded-2xl p-3 text-xs font-bold text-white"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full glass-input rounded-2xl p-3 text-xs font-bold text-white"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full p-4 rounded-2xl gradient-flame font-bold text-white text-xs shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {mode === 'login' ? 'Sign In to FitLog AI' : 'Create Account'}
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* OAuth Buttons */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setAuthenticated(true)}
                className="w-full p-3 rounded-2xl bg-white text-black font-bold text-xs hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 shadow-md"
              >
                <span>Continue with Apple</span>
              </button>

              <button
                type="button"
                onClick={() => setAuthenticated(true)}
                className="w-full p-3 rounded-2xl glass-card text-white font-bold text-xs hover:bg-white/10 transition-all flex items-center justify-center gap-2 border border-white/10"
              >
                <span>Continue with Google</span>
              </button>
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className="text-xs font-bold text-orange-400 hover:underline"
              >
                {mode === 'login'
                  ? "Don't have an account? Sign Up"
                  : 'Already have an account? Sign In'}
              </button>
            </div>
          </form>
        ) : (
          /* Onboarding Form */
          <form onSubmit={handleOnboardingFinish} className="space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" /> Set Your Personal Goals
            </h3>

            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1">Fitness Goal</label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value as any)}
                className="w-full glass-input rounded-2xl p-3 text-xs font-bold text-white bg-zinc-900"
              >
                <option value="lose_weight">Fat Loss & Toning</option>
                <option value="maintain">Maintain Fitness & Energy</option>
                <option value="gain_muscle">Muscle Building & Hypertrophy</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">Current Wt (kg)</label>
                <input
                  type="number"
                  value={currentWeight}
                  onChange={(e) => setCurrentWeight(e.target.value)}
                  className="w-full glass-input rounded-2xl p-3 text-xs font-bold text-white text-center"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">Target Wt (kg)</label>
                <input
                  type="number"
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(e.target.value)}
                  className="w-full glass-input rounded-2xl p-3 text-xs font-bold text-white text-center"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full p-4 rounded-2xl gradient-purple font-bold text-white text-xs shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              Complete Setup & Launch
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};
