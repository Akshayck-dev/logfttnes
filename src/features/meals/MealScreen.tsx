import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Utensils,
  Mic,
  MicOff,
  Plus,
  Trash2,
  Sparkles,
  Volume2,
  AlertCircle
} from 'lucide-react';
import { GlassCard } from '../../components/common/GlassCard';
import { BottomSheet } from '../../components/common/BottomSheet';
import { useFitnessStore } from '../../stores/useFitnessStore';
import { useVoiceRecognition } from '../../hooks/useVoiceRecognition';
import { MealCategory } from '../../types';
import { parseNaturalLanguageInput } from '../../lib/aiParser';

const presetDatabase = [
  { name: 'Oatmeal with Almond Milk & Banana', category: 'breakfast', cals: 320, p: 12, c: 54, f: 6, fib: 8 },
  { name: 'Protein Shake (Whey + Peanut Butter)', category: 'snack', cals: 280, p: 32, c: 14, f: 10, fib: 3 },
  { name: 'Salmon Salad with Olive Oil Dressing', category: 'lunch', cals: 540, p: 42, c: 12, f: 36, fib: 5 },
  { name: 'Ribeye Steak & Sweet Potato Mash', category: 'dinner', cals: 720, p: 58, c: 45, f: 32, fib: 6 },
  { name: 'Greek Yogurt with Blueberries & Honey', category: 'snack', cals: 220, p: 18, c: 26, f: 4, fib: 2 }
];

export const MealScreen: React.FC = () => {
  const { meals, addMeal, deleteMeal } = useFitnessStore();
  const { isListening, transcript, errorMessage, startListening, stopListening, simulateVoiceInput } = useVoiceRecognition();

  const [selectedCategory, setSelectedCategory] = useState<MealCategory | 'all'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [voiceText, setVoiceText] = useState('');

  // Manual Form State
  const [title, setTitle] = useState('');
  const [mealType, setMealType] = useState<MealCategory>('breakfast');
  const [calories, setCalories] = useState('450');
  const [protein, setProtein] = useState('35');
  const [carbs, setCarbs] = useState('40');
  const [fat, setFat] = useState('12');

  const filteredMeals = meals.filter(
    (m) => selectedCategory === 'all' || m.mealType === selectedCategory
  );

  useEffect(() => {
    if (transcript && isListening) {
      setVoiceText(transcript);
    }
  }, [transcript, isListening]);

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening((text) => {
        setVoiceText(text);
      });
    }
  };

  const handleSimulateVoice = () => {
    simulateVoiceInput((simulatedText) => {
      setVoiceText(simulatedText);
    });
  };

  const handleVoiceSubmit = () => {
    if (!voiceText.trim()) return;
    const parsed = parseNaturalLanguageInput(voiceText);
    if (parsed.mealData) {
      addMeal({
        userId: 'user-default-1',
        mealType: parsed.mealData.mealType || 'lunch',
        title: parsed.mealData.title || voiceText,
        totalCalories: parsed.mealData.totalCalories || 450,
        totalProteinG: parsed.mealData.totalProteinG || 30,
        totalCarbsG: parsed.mealData.totalCarbsG || 40,
        totalFatG: parsed.mealData.totalFatG || 12,
        totalFiberG: 5,
        items: parsed.mealData.items || [],
        loggedAt: new Date().toISOString()
      });
      setVoiceText('');
      setIsAddModalOpen(false);
    }
  };

  const handleManualFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addMeal({
      userId: 'user-default-1',
      mealType,
      title,
      totalCalories: parseInt(calories, 10) || 0,
      totalProteinG: parseFloat(protein) || 0,
      totalCarbsG: parseFloat(carbs) || 0,
      totalFatG: parseFloat(fat) || 0,
      totalFiberG: 4,
      items: [
        {
          id: `mi-${Date.now()}`,
          name: title,
          quantity: 1,
          unit: 'serving',
          calories: parseInt(calories, 10) || 0,
          proteinG: parseFloat(protein) || 0,
          carbsG: parseFloat(carbs) || 0,
          fatG: parseFloat(fat) || 0,
          fiberG: 4
        }
      ],
      loggedAt: new Date().toISOString()
    });
    setTitle('');
    setIsAddModalOpen(false);
  };

  const handleAddPreset = (preset: typeof presetDatabase[0]) => {
    addMeal({
      userId: 'user-default-1',
      mealType: preset.category as MealCategory,
      title: preset.name,
      totalCalories: preset.cals,
      totalProteinG: preset.p,
      totalCarbsG: preset.c,
      totalFatG: preset.f,
      totalFiberG: preset.fib,
      items: [
        {
          id: `mi-${Date.now()}`,
          name: preset.name,
          quantity: 1,
          unit: 'serving',
          calories: preset.cals,
          proteinG: preset.p,
          carbsG: preset.c,
          fatG: preset.f,
          fiberG: preset.fib
        }
      ],
      loggedAt: new Date().toISOString()
    });
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-28 px-4 pt-2">
      {/* Top Header Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Meal Logger</h1>
          <p className="text-xs text-zinc-400">Log meals, track macros & analyze nutrition</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-2xl gradient-flame text-white font-bold text-xs shadow-lg active:scale-95 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Log Meal
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {(['all', 'breakfast', 'lunch', 'dinner', 'snack'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold capitalize transition-all border ${
              selectedCategory === cat
                ? 'bg-orange-500/20 text-orange-400 border-orange-500/40 shadow-md'
                : 'glass-card text-zinc-400 border-white/10 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Meal List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredMeals.length === 0 ? (
            <GlassCard className="p-8 text-center">
              <Utensils className="w-10 h-10 mx-auto text-zinc-500 mb-2" />
              <p className="text-sm font-bold text-zinc-300">No meals logged for this category</p>
              <p className="text-xs text-zinc-400 mt-1">
                Tap "+ Log Meal" or use AI voice dictation to add nutrition.
              </p>
            </GlassCard>
          ) : (
            filteredMeals.map((meal) => (
              <motion.div
                key={meal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <GlassCard className="p-5 flex flex-col justify-between space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-400 bg-orange-500/10 px-2.5 py-0.5 rounded-full border border-orange-500/20">
                        {meal.mealType}
                      </span>
                      <h3 className="text-lg font-extrabold text-white mt-1">{meal.title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-black text-white">
                        {meal.totalCalories} <span className="text-xs font-normal text-zinc-400">kcal</span>
                      </span>
                      <button
                        onClick={() => deleteMeal(meal.id)}
                        className="p-1.5 rounded-full hover:bg-rose-500/20 text-zinc-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Macro Badges Grid */}
                  <div className="grid grid-cols-4 gap-2 pt-2 border-t border-white/10">
                    <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-2 text-center">
                      <span className="text-[10px] text-zinc-400 font-bold block">Protein</span>
                      <span className="text-xs font-black text-rose-400">{meal.totalProteinG}g</span>
                    </div>

                    <div className="bg-cyan-400/10 border border-cyan-400/20 rounded-xl p-2 text-center">
                      <span className="text-[10px] text-zinc-400 font-bold block">Carbs</span>
                      <span className="text-xs font-black text-cyan-300">{meal.totalCarbsG}g</span>
                    </div>

                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2 text-center">
                      <span className="text-[10px] text-zinc-400 font-bold block">Fat</span>
                      <span className="text-xs font-black text-emerald-400">{meal.totalFatG}g</span>
                    </div>

                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-2 text-center">
                      <span className="text-[10px] text-zinc-400 font-bold block">Fiber</span>
                      <span className="text-xs font-black text-purple-300">{meal.totalFiberG || 5}g</span>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Add Meal Bottom Sheet */}
      <BottomSheet
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Meal Entry"
        subtitle="Use Voice AI, search presets, or enter manually"
      >
        {/* Voice AI Dictation Box */}
        <div className="glass-card p-4 rounded-2xl border border-purple-500/30 bg-purple-950/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-400" /> Voice AI Dictation
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSimulateVoice}
                className="px-2.5 py-1 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold hover:bg-purple-500/30 flex items-center gap-1"
              >
                <Volume2 className="w-3 h-3" /> Test Voice
              </button>

              <button
                type="button"
                onClick={handleVoiceToggle}
                className={`p-2.5 rounded-full text-white shadow-lg transition-all ${
                  isListening ? 'bg-rose-600 animate-pulse' : 'gradient-purple'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="text-[10px] text-rose-400 font-semibold flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errorMessage}
            </div>
          )}

          <textarea
            rows={2}
            placeholder='Say or type: "I ate 2 boiled eggs, 1 toast and black coffee"'
            value={voiceText}
            onChange={(e) => setVoiceText(e.target.value)}
            className="w-full glass-input rounded-xl p-3 text-xs text-white resize-none"
          />

          {voiceText && (
            <button
              onClick={handleVoiceSubmit}
              className="w-full py-2.5 rounded-xl gradient-purple font-bold text-white text-xs shadow-md active:scale-95 transition-all"
            >
              Parse & Log via AI
            </button>
          )}
        </div>

        {/* Quick Presets Search */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-zinc-300 block">Favorite Food Presets</span>
          <div className="space-y-2 max-h-40 overflow-y-auto no-scrollbar">
            {presetDatabase.map((item, idx) => (
              <div
                key={idx}
                onClick={() => handleAddPreset(item)}
                className="glass-card-interactive p-3 rounded-xl flex items-center justify-between text-xs cursor-pointer hover:border-orange-500/40"
              >
                <div>
                  <span className="font-bold text-white block">{item.name}</span>
                  <span className="text-[10px] text-zinc-400 capitalize">
                    {item.category} • {item.cals} kcal • {item.p}g P
                  </span>
                </div>
                <Plus className="w-4 h-4 text-orange-400" />
              </div>
            ))}
          </div>
        </div>

        {/* Manual Form */}
        <form onSubmit={handleManualFormSubmit} className="space-y-3 pt-3 border-t border-white/10">
          <span className="text-xs font-bold text-zinc-300 block">Manual Entry</span>
          
          <input
            type="text"
            placeholder="Meal Title (e.g. Chicken Caesar Wrap)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full glass-input rounded-xl p-3 text-xs font-bold text-white"
            required
          />

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-zinc-400 block mb-1">Meal Category</label>
              <select
                value={mealType}
                onChange={(e) => setMealType(e.target.value as MealCategory)}
                className="w-full glass-input rounded-xl p-3 text-xs font-bold text-white bg-zinc-900"
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-zinc-400 block mb-1">Calories (kcal)</label>
              <input
                type="number"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="w-full glass-input rounded-xl p-3 text-xs font-bold text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] font-bold text-rose-400 block mb-1">Protein (g)</label>
              <input
                type="number"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                className="w-full glass-input rounded-xl p-2.5 text-xs font-bold text-white"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-cyan-300 block mb-1">Carbs (g)</label>
              <input
                type="number"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                className="w-full glass-input rounded-xl p-2.5 text-xs font-bold text-white"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-emerald-400 block mb-1">Fat (g)</label>
              <input
                type="number"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                className="w-full glass-input rounded-xl p-2.5 text-xs font-bold text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full p-3.5 rounded-2xl gradient-flame font-bold text-white text-xs shadow-lg active:scale-95 transition-all mt-2"
          >
            Save Meal
          </button>
        </form>
      </BottomSheet>
    </div>
  );
};
