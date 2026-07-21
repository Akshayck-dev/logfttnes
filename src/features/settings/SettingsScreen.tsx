import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Target,
  Moon,
  Sun,
  Database,
  Download,
  ShieldCheck,
  LogOut,
  Save,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { GlassCard } from '../../components/common/GlassCard';
import { useUserStore } from '../../stores/useUserStore';
import { isSupabaseConfigured } from '../../api/supabase';

export const SettingsScreen: React.FC = () => {
  const { profile, updateProfile, theme, setTheme, setAuthenticated } = useUserStore();

  const [fullName, setFullName] = useState(profile.fullName);
  const [age, setAge] = useState(profile.age.toString());
  const [heightCm, setHeightCm] = useState(profile.heightCm.toString());
  const [targetWeightKg, setTargetWeightKg] = useState(profile.targetWeightKg.toString());

  // Goals
  const [targetCalories, setTargetCalories] = useState(profile.targetCalories.toString());
  const [targetProteinG, setTargetProteinG] = useState(profile.targetProteinG.toString());
  const [targetCarbsG, setTargetCarbsG] = useState(profile.targetCarbsG.toString());
  const [targetFatG, setTargetFatG] = useState(profile.targetFatG.toString());
  const [targetWaterMl, setTargetWaterMl] = useState(profile.targetWaterMl.toString());

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      fullName,
      age: parseInt(age, 10) || 25,
      heightCm: parseFloat(heightCm) || 175,
      targetWeightKg: parseFloat(targetWeightKg) || 70,
      targetCalories: parseInt(targetCalories, 10) || 2200,
      targetProteinG: parseInt(targetProteinG, 10) || 160,
      targetCarbsG: parseInt(targetCarbsG, 10) || 220,
      targetFatG: parseInt(targetFatG, 10) || 70,
      targetWaterMl: parseInt(targetWaterMl, 10) || 2500
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(localStorage));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `fitlog-ai-backup-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 pb-28 px-4 pt-2">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Settings & Goals</h1>
          <p className="text-xs text-zinc-400">Manage user profile, target macros & data export</p>
        </div>
        {savedSuccess && (
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Saved!
          </span>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Profile Card */}
        <GlassCard className="p-5 space-y-4">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
            <User className="w-4 h-4 text-purple-400" /> Personal Profile
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-zinc-300 block mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full glass-input rounded-xl p-3 text-xs font-bold text-white"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-zinc-300 block mb-1">Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full glass-input rounded-xl p-2.5 text-xs font-bold text-white text-center"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-300 block mb-1">Height (cm)</label>
                <input
                  type="number"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  className="w-full glass-input rounded-xl p-2.5 text-xs font-bold text-white text-center"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-300 block mb-1">Goal Wt (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={targetWeightKg}
                  onChange={(e) => setTargetWeightKg(e.target.value)}
                  className="w-full glass-input rounded-xl p-2.5 text-xs font-bold text-white text-center"
                />
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Targets & Goals Card */}
        <GlassCard className="p-5 space-y-4">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
            <Target className="w-4 h-4 text-orange-400" /> Daily Fitness Targets
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-orange-400 block mb-1">Target Calories (kcal)</label>
              <input
                type="number"
                value={targetCalories}
                onChange={(e) => setTargetCalories(e.target.value)}
                className="w-full glass-input rounded-xl p-3 text-xs font-bold text-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-cyan-300 block mb-1">Target Water (ml)</label>
              <input
                type="number"
                value={targetWaterMl}
                onChange={(e) => setTargetWaterMl(e.target.value)}
                className="w-full glass-input rounded-xl p-3 text-xs font-bold text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold text-rose-400 block mb-1">Protein (g)</label>
              <input
                type="number"
                value={targetProteinG}
                onChange={(e) => setTargetProteinG(e.target.value)}
                className="w-full glass-input rounded-xl p-2.5 text-xs font-bold text-white text-center"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-cyan-300 block mb-1">Carbs (g)</label>
              <input
                type="number"
                value={targetCarbsG}
                onChange={(e) => setTargetCarbsG(e.target.value)}
                className="w-full glass-input rounded-xl p-2.5 text-xs font-bold text-white text-center"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-emerald-400 block mb-1">Fat (g)</label>
              <input
                type="number"
                value={targetFatG}
                onChange={(e) => setTargetFatG(e.target.value)}
                className="w-full glass-input rounded-xl p-2.5 text-xs font-bold text-white text-center"
              />
            </div>
          </div>
        </GlassCard>

        {/* Save Button */}
        <button
          type="submit"
          className="w-full p-4 rounded-2xl gradient-purple text-white font-bold text-sm shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" /> Save Changes
        </button>
      </form>

      {/* Supabase & System Info */}
      <GlassCard className="p-5 space-y-3">
        <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-cyan-400" /> Database & Sync
        </h3>
        <div className="flex items-center justify-between text-xs p-3 bg-white/5 rounded-xl border border-white/5">
          <span>Supabase Connection Status:</span>
          {isSupabaseConfigured() ? (
            <span className="font-bold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Connected
            </span>
          ) : (
            <span className="font-bold text-amber-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Local Offline Mode
            </span>
          )}
        </div>
      </GlassCard>

      {/* Data Export & Account Actions */}
      <div className="space-y-3">
        <button
          onClick={handleExportData}
          className="w-full p-3.5 rounded-2xl glass-card text-white font-bold text-xs hover:bg-white/10 transition-all flex items-center justify-center gap-2 border border-white/10"
        >
          <Download className="w-4 h-4 text-purple-400" /> Export FitLog Backup Data (JSON)
        </button>

        <button
          onClick={() => setAuthenticated(false)}
          className="w-full p-3.5 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold text-xs hover:bg-rose-500/20 transition-all flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </div>
  );
};
