import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dumbbell,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Trash2,
  Clock,
  Flame,
  CheckCircle2,
  Bookmark
} from 'lucide-react';
import { GlassCard } from '../../components/common/GlassCard';
import { BottomSheet } from '../../components/common/BottomSheet';
import { useFitnessStore } from '../../stores/useFitnessStore';
import { WorkoutCategory, ExerciseSet } from '../../types';

const defaultTemplates = [
  {
    title: 'Chest & Triceps Shred',
    category: 'strength' as WorkoutCategory,
    duration: 50,
    cals: 420,
    exercises: [
      { id: '1', exerciseName: 'Barbell Bench Press', setsCount: 4, repsCount: 8, weightKg: 80 },
      { id: '2', exerciseName: 'Incline Dumbbell Flyes', setsCount: 3, repsCount: 12, weightKg: 24 },
      { id: '3', exerciseName: 'Triceps Overhead Extension', setsCount: 4, repsCount: 10, weightKg: 28 }
    ]
  },
  {
    title: 'Back & Biceps Thickness',
    category: 'strength' as WorkoutCategory,
    duration: 55,
    cals: 460,
    exercises: [
      { id: '1', exerciseName: 'Barbell Deadlifts', setsCount: 4, repsCount: 6, weightKg: 120 },
      { id: '2', exerciseName: 'Lat Pulldowns', setsCount: 4, repsCount: 10, weightKg: 65 },
      { id: '3', exerciseName: 'EZ Bar Bicep Curls', setsCount: 3, repsCount: 12, weightKg: 30 }
    ]
  },
  {
    title: 'Legs & Core Overload',
    category: 'strength' as WorkoutCategory,
    duration: 60,
    cals: 520,
    exercises: [
      { id: '1', exerciseName: 'Barbell Back Squats', setsCount: 4, repsCount: 8, weightKg: 100 },
      { id: '2', exerciseName: 'Romanian Deadlifts', setsCount: 3, repsCount: 10, weightKg: 85 },
      { id: '3', exerciseName: 'Leg Extensions', setsCount: 4, repsCount: 12, weightKg: 60 }
    ]
  },
  {
    title: 'Cardio HIIT Blast',
    category: 'cardio' as WorkoutCategory,
    duration: 35,
    cals: 380,
    exercises: [
      { id: '1', exerciseName: 'Treadmill Sprints', setsCount: 6, repsCount: 1, weightKg: 0 },
      { id: '2', exerciseName: 'Rowing Machine', setsCount: 4, repsCount: 500, weightKg: 0 }
    ]
  }
];

export const WorkoutScreen: React.FC = () => {
  const { workouts, addWorkout, deleteWorkout } = useFitnessStore();

  const [isLogSheetOpen, setIsLogSheetOpen] = useState(false);
  const [activeTimerOpen, setActiveTimerOpen] = useState(false);

  // Active Timer state
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<WorkoutCategory>('strength');
  const [durationMinutes, setDurationMinutes] = useState('45');
  const [caloriesBurned, setCaloriesBurned] = useState('380');
  const [notes, setNotes] = useState('');

  const [exercisesList, setExercisesList] = useState<ExerciseSet[]>([
    { id: 'ex-1', exerciseName: 'Bench Press', setsCount: 4, repsCount: 8, weightKg: 75 }
  ]);

  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((sec) => sec + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAddExerciseRow = () => {
    setExercisesList([
      ...exercisesList,
      {
        id: `ex-${Date.now()}`,
        exerciseName: 'New Exercise',
        setsCount: 3,
        repsCount: 10,
        weightKg: 20
      }
    ]);
  };

  const handleUpdateExerciseRow = (index: number, field: keyof ExerciseSet, val: any) => {
    const updated = [...exercisesList];
    updated[index] = { ...updated[index], [field]: val };
    setExercisesList(updated);
  };

  const handleRemoveExerciseRow = (index: number) => {
    setExercisesList(exercisesList.filter((_, i) => i !== index));
  };

  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addWorkout({
      userId: 'user-default-1',
      title,
      category,
      durationMinutes: parseInt(durationMinutes, 10) || 45,
      caloriesBurned: parseInt(caloriesBurned, 10) || 350,
      notes,
      exercises: exercisesList,
      loggedAt: new Date().toISOString()
    });

    setTitle('');
    setIsLogSheetOpen(false);
  };

  const handleStartTemplate = (template: typeof defaultTemplates[0]) => {
    setTitle(template.title);
    setCategory(template.category);
    setDurationMinutes(template.duration.toString());
    setCaloriesBurned(template.cals.toString());
    setExercisesList(template.exercises);
    setIsLogSheetOpen(true);
  };

  return (
    <div className="space-y-6 pb-28 px-4 pt-2">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Workout Logger</h1>
          <p className="text-xs text-zinc-400">Log strength training, cardio & exercises</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTimerOpen(true)}
            className="p-2.5 rounded-2xl bg-white/10 text-white hover:bg-white/20 active:scale-95 transition-all flex items-center gap-1.5 text-xs font-bold border border-white/10"
          >
            <Clock className="w-4 h-4 text-emerald-400" />
            Timer
          </button>
          <button
            onClick={() => setIsLogSheetOpen(true)}
            className="px-4 py-2.5 rounded-2xl gradient-emerald text-white font-bold text-xs shadow-lg active:scale-95 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Log Workout
          </button>
        </div>
      </div>

      {/* Templates Slider */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
          <Bookmark className="w-3.5 h-3.5 text-emerald-400" /> Workout Templates
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {defaultTemplates.map((t, idx) => (
            <GlassCard
              key={idx}
              interactive
              onClick={() => handleStartTemplate(t)}
              className="p-4 flex items-center justify-between border-emerald-500/20 hover:border-emerald-500/50"
            >
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  {t.category}
                </span>
                <h4 className="text-sm font-extrabold text-white mt-1">{t.title}</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  {t.duration} mins • ~{t.cals} kcal • {t.exercises.length} exercises
                </p>
              </div>
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
                <Play className="w-4 h-4 fill-emerald-400" />
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* History List */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
          Workout History
        </h3>
        <div className="space-y-3">
          {workouts.length === 0 ? (
            <GlassCard className="p-8 text-center">
              <Dumbbell className="w-10 h-10 mx-auto text-zinc-500 mb-2" />
              <p className="text-sm font-bold text-zinc-300">No workouts recorded yet</p>
              <p className="text-xs text-zinc-400 mt-1">Tap "+ Log Workout" to add your first session</p>
            </GlassCard>
          ) : (
            workouts.map((w) => (
              <GlassCard key={w.id} className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      {w.category}
                    </span>
                    <h3 className="text-lg font-extrabold text-white mt-1">{w.title}</h3>
                    <p className="text-xs text-zinc-400">
                      {w.durationMinutes} mins • {w.caloriesBurned} kcal burned
                    </p>
                  </div>
                  <button
                    onClick={() => deleteWorkout(w.id)}
                    className="p-1.5 rounded-full hover:bg-rose-500/20 text-zinc-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Exercises Table */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                  {w.exercises.map((ex, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-xs bg-white/5 p-2.5 rounded-xl border border-white/5"
                    >
                      <span className="font-bold text-white">{ex.exerciseName}</span>
                      <span className="font-mono text-zinc-300">
                        {ex.setsCount} sets × {ex.repsCount} reps {ex.weightKg > 0 ? `@ ${ex.weightKg}kg` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            ))
          )}
        </div>
      </div>

      {/* Log Workout Bottom Sheet */}
      <BottomSheet
        isOpen={isLogSheetOpen}
        onClose={() => setIsLogSheetOpen(false)}
        title="Log Workout Session"
        subtitle="Fill in workout details and exercises"
      >
        <form onSubmit={handleLogSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Workout Title (e.g. Chest & Triceps Shred)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full glass-input rounded-xl p-3 text-xs font-bold text-white"
            required
          />

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] font-bold text-zinc-400 block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as WorkoutCategory)}
                className="w-full glass-input rounded-xl p-2.5 text-xs font-bold text-white bg-zinc-900"
              >
                <option value="strength">Strength</option>
                <option value="cardio">Cardio</option>
                <option value="hiit">HIIT</option>
                <option value="yoga">Yoga</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-zinc-400 block mb-1">Duration (min)</label>
              <input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                className="w-full glass-input rounded-xl p-2.5 text-xs font-bold text-white"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-zinc-400 block mb-1">Calories Burned</label>
              <input
                type="number"
                value={caloriesBurned}
                onChange={(e) => setCaloriesBurned(e.target.value)}
                className="w-full glass-input rounded-xl p-2.5 text-xs font-bold text-white"
              />
            </div>
          </div>

          {/* Dynamic Exercise Rows */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-300">Exercises Performed</span>
              <button
                type="button"
                onClick={handleAddExerciseRow}
                className="text-xs text-emerald-400 font-bold hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Exercise
              </button>
            </div>

            {exercisesList.map((ex, index) => (
              <div key={ex.id || index} className="p-3 glass-card rounded-xl space-y-2 border border-white/10">
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    placeholder="Exercise Name"
                    value={ex.exerciseName}
                    onChange={(e) => handleUpdateExerciseRow(index, 'exerciseName', e.target.value)}
                    className="flex-1 glass-input rounded-lg p-2 text-xs font-bold text-white"
                  />
                  {exercisesList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveExerciseRow(index)}
                      className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[9px] text-zinc-400 font-bold block">Sets</label>
                    <input
                      type="number"
                      value={ex.setsCount}
                      onChange={(e) => handleUpdateExerciseRow(index, 'setsCount', parseInt(e.target.value, 10))}
                      className="w-full glass-input rounded-lg p-1.5 text-xs font-bold text-center text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-zinc-400 font-bold block">Reps</label>
                    <input
                      type="number"
                      value={ex.repsCount}
                      onChange={(e) => handleUpdateExerciseRow(index, 'repsCount', parseInt(e.target.value, 10))}
                      className="w-full glass-input rounded-lg p-1.5 text-xs font-bold text-center text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-zinc-400 font-bold block">Weight (kg)</label>
                    <input
                      type="number"
                      value={ex.weightKg}
                      onChange={(e) => handleUpdateExerciseRow(index, 'weightKg', parseFloat(e.target.value))}
                      className="w-full glass-input rounded-lg p-1.5 text-xs font-bold text-center text-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="w-full p-3.5 rounded-2xl gradient-emerald font-bold text-white text-xs shadow-lg active:scale-95 transition-all mt-2"
          >
            Save Workout Entry
          </button>
        </form>
      </BottomSheet>

      {/* Active Workout Timer Modal */}
      <BottomSheet
        isOpen={activeTimerOpen}
        onClose={() => setActiveTimerOpen(false)}
        title="Live Rest & Session Timer"
        subtitle="Track live workout duration or rest periods"
      >
        <div className="text-center space-y-6 py-4">
          <div className="text-6xl font-black font-mono tracking-tight text-white drop-shadow-lg">
            {formatTimer(seconds)}
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setIsActive(!isActive)}
              className={`p-4 rounded-2xl font-bold text-white text-sm flex items-center gap-2 shadow-lg transition-all ${
                isActive ? 'bg-rose-500' : 'gradient-emerald'
              }`}
            >
              {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              {isActive ? 'Pause Timer' : 'Start Timer'}
            </button>

            <button
              onClick={() => {
                setIsActive(false);
                setSeconds(0);
              }}
              className="p-4 rounded-2xl bg-white/10 text-zinc-300 hover:text-white font-bold text-sm flex items-center gap-2 border border-white/10"
            >
              <RotateCcw className="w-5 h-5" /> Reset
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
};
