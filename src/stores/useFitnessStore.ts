import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  MealLog,
  WorkoutLog,
  WeightLog,
  WaterLog,
  SleepLog,
  UserStreak,
  AchievementBadge,
  AiDetectedEntity
} from '../types';

interface FitnessState {
  meals: MealLog[];
  workouts: WorkoutLog[];
  weights: WeightLog[];
  waterLogs: WaterLog[];
  sleepLogs: SleepLog[];
  streak: UserStreak;
  badges: AchievementBadge[];
  aiHistory: { id: string; prompt: string; entity: AiDetectedEntity; timestamp: string }[];
  
  // Actions
  addMeal: (meal: Omit<MealLog, 'id'>) => void;
  deleteMeal: (id: string) => void;
  
  addWorkout: (workout: Omit<WorkoutLog, 'id'>) => void;
  deleteWorkout: (id: string) => void;
  
  addWeight: (weightKg: number, notes?: string) => void;
  
  addWater: (amountMl: number) => void;
  resetWaterToday: () => void;
  
  addSleep: (sleep: Omit<SleepLog, 'id' | 'userId'>) => void;
  
  addAiLog: (prompt: string, entity: AiDetectedEntity) => void;

  // Computed helper getters for today
  getTodayCalories: () => number;
  getTodayProtein: () => number;
  getTodayCarbs: () => number;
  getTodayFat: () => number;
  getTodayWater: () => number;
  getTodayWorkouts: () => WorkoutLog[];
  getLatestWeight: () => number;
}

const todayStr = new Date().toISOString().split('T')[0];

const initialMeals: MealLog[] = [
  {
    id: 'm-1',
    userId: 'user-default-1',
    mealType: 'breakfast',
    title: 'Avocado Toast & Scrambled Eggs',
    totalCalories: 480,
    totalProteinG: 28,
    totalCarbsG: 42,
    totalFatG: 20,
    totalFiberG: 7,
    isFavorite: true,
    loggedAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    items: [
      { id: 'mi-1', name: 'Whole Grain Bread', quantity: 2, unit: 'slice', calories: 180, proteinG: 8, carbsG: 34, fatG: 2, fiberG: 5 },
      { id: 'mi-2', name: 'Eggs Large', quantity: 2, unit: 'piece', calories: 140, proteinG: 12, carbsG: 1, fatG: 10, fiberG: 0 },
      { id: 'mi-3', name: 'Avocado Fresh', quantity: 0.5, unit: 'piece', calories: 160, proteinG: 2, carbsG: 7, fatG: 14, fiberG: 5 }
    ]
  },
  {
    id: 'm-2',
    userId: 'user-default-1',
    mealType: 'lunch',
    title: 'Grilled Chicken Bowl & Quinoa',
    totalCalories: 620,
    totalProteinG: 52,
    totalCarbsG: 65,
    totalFatG: 16,
    totalFiberG: 9,
    isFavorite: false,
    loggedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    items: [
      { id: 'mi-4', name: 'Chicken Breast', quantity: 200, unit: 'g', calories: 330, proteinG: 44, carbsG: 0, fatG: 7, fiberG: 0 },
      { id: 'mi-5', name: 'Cooked Quinoa', quantity: 150, unit: 'g', calories: 180, proteinG: 6, carbsG: 32, fatG: 3, fiberG: 4 },
      { id: 'mi-6', name: 'Steamed Broccoli & Olive Oil', quantity: 1, unit: 'cup', calories: 110, proteinG: 2, carbsG: 8, fatG: 6, fiberG: 5 }
    ]
  }
];

const initialWorkouts: WorkoutLog[] = [
  {
    id: 'w-1',
    userId: 'user-default-1',
    title: 'Chest & Triceps Hypertrophy',
    category: 'strength',
    durationMinutes: 52,
    caloriesBurned: 410,
    notes: 'Felt strong on incline dumbbell press today.',
    loggedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    exercises: [
      { id: 'ex-1', exerciseName: 'Barbell Bench Press', setsCount: 4, repsCount: 8, weightKg: 85 },
      { id: 'ex-2', exerciseName: 'Incline Dumbbell Press', setsCount: 3, repsCount: 10, weightKg: 30 },
      { id: 'ex-3', exerciseName: 'Tricep Rope Pushdowns', setsCount: 4, repsCount: 12, weightKg: 35 }
    ]
  }
];

const initialWeights: WeightLog[] = [
  { id: 'wt-1', userId: 'user-default-1', weightKg: 78.0, bmi: 24.1, loggedAt: new Date(Date.now() - 14 * 86400 * 1000).toISOString() },
  { id: 'wt-2', userId: 'user-default-1', weightKg: 77.5, bmi: 23.9, loggedAt: new Date(Date.now() - 10 * 86400 * 1000).toISOString() },
  { id: 'wt-3', userId: 'user-default-1', weightKg: 77.1, bmi: 23.8, loggedAt: new Date(Date.now() - 7 * 86400 * 1000).toISOString() },
  { id: 'wt-4', userId: 'user-default-1', weightKg: 76.8, bmi: 23.7, loggedAt: new Date(Date.now() - 3 * 86400 * 1000).toISOString() },
  { id: 'wt-5', userId: 'user-default-1', weightKg: 76.4, bmi: 23.6, loggedAt: new Date().toISOString() }
];

const initialWaterLogs: WaterLog[] = [
  { id: 'wl-1', userId: 'user-default-1', amountMl: 500, loggedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString() },
  { id: 'wl-2', userId: 'user-default-1', amountMl: 750, loggedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString() },
  { id: 'wl-3', userId: 'user-default-1', amountMl: 500, loggedAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString() }
];

const initialSleepLogs: SleepLog[] = [
  { id: 'sl-1', userId: 'user-default-1', sleepTime: '23:15', wakeTime: '07:30', durationHours: 8.25, qualityScore: 5, notes: 'Restful REM sleep cycle', loggedAt: todayStr },
  { id: 'sl-2', userId: 'user-default-1', sleepTime: '23:45', wakeTime: '07:15', durationHours: 7.5, qualityScore: 4, notes: 'Woke up energized', loggedAt: new Date(Date.now() - 86400 * 1000).toISOString().split('T')[0] }
];

const initialBadges: AchievementBadge[] = [
  { id: 'b-1', title: '7-Day Streak', description: 'Consistently logged workouts and meals for 7 straight days', iconName: 'Flame', unlocked: true, unlockedAt: '2026-07-20' },
  { id: 'b-2', title: 'Hydration Hero', description: 'Reached 3,000ml water target 5 days in a row', iconName: 'Droplets', unlocked: true, unlockedAt: '2026-07-19' },
  { id: 'b-3', title: 'Iron Lifter', description: 'Logged 10 strength sessions in FitLog AI', iconName: 'Dumbbell', unlocked: true, unlockedAt: '2026-07-18' },
  { id: 'b-4', title: 'Macro Master', description: 'Hit protein target within 5% error margin', iconName: 'Target', unlocked: false }
];

export const useFitnessStore = create<FitnessState>()(
  persist(
    (set, get) => ({
      meals: initialMeals,
      workouts: initialWorkouts,
      weights: initialWeights,
      waterLogs: initialWaterLogs,
      sleepLogs: initialSleepLogs,
      streak: { currentStreak: 7, longestStreak: 14, lastActivityDate: todayStr },
      badges: initialBadges,
      aiHistory: [],

      addMeal: (mealData) => {
        const newMeal: MealLog = {
          ...mealData,
          id: `m-${Date.now()}`
        };
        set((state) => ({ meals: [newMeal, ...state.meals] }));
      },
      deleteMeal: (id) => {
        set((state) => ({ meals: state.meals.filter((m) => m.id !== id) }));
      },

      addWorkout: (workoutData) => {
        const newWorkout: WorkoutLog = {
          ...workoutData,
          id: `w-${Date.now()}`
        };
        set((state) => ({ workouts: [newWorkout, ...state.workouts] }));
      },
      deleteWorkout: (id) => {
        set((state) => ({ workouts: state.workouts.filter((w) => w.id !== id) }));
      },

      addWeight: (weightKg, notes) => {
        const heightCm = 180; // Default height for BMI
        const heightM = heightCm / 100;
        const bmi = Math.round((weightKg / (heightM * heightM)) * 10) / 10;

        const newWeight: WeightLog = {
          id: `wt-${Date.now()}`,
          userId: 'user-default-1',
          weightKg,
          bmi,
          notes,
          loggedAt: new Date().toISOString()
        };
        set((state) => ({ weights: [newWeight, ...state.weights] }));
      },

      addWater: (amountMl) => {
        const newWater: WaterLog = {
          id: `wl-${Date.now()}`,
          userId: 'user-default-1',
          amountMl,
          loggedAt: new Date().toISOString()
        };
        set((state) => ({ waterLogs: [newWater, ...state.waterLogs] }));
      },
      resetWaterToday: () => {
        set((state) => ({
          waterLogs: state.waterLogs.filter((w) => !w.loggedAt.startsWith(todayStr))
        }));
      },

      addSleep: (sleepData) => {
        const newSleep: SleepLog = {
          ...sleepData,
          id: `sl-${Date.now()}`,
          userId: 'user-default-1'
        };
        set((state) => ({ sleepLogs: [newSleep, ...state.sleepLogs] }));
      },

      addAiLog: (prompt, entity) => {
        const logItem = {
          id: `ai-${Date.now()}`,
          prompt,
          entity,
          timestamp: new Date().toISOString()
        };
        set((state) => ({ aiHistory: [logItem, ...state.aiHistory] }));
      },

      // Getters
      getTodayCalories: () => {
        return get().meals
          .filter((m) => m.loggedAt.startsWith(todayStr))
          .reduce((sum, m) => sum + (m.totalCalories || 0), 0);
      },
      getTodayProtein: () => {
        return get().meals
          .filter((m) => m.loggedAt.startsWith(todayStr))
          .reduce((sum, m) => sum + (m.totalProteinG || 0), 0);
      },
      getTodayCarbs: () => {
        return get().meals
          .filter((m) => m.loggedAt.startsWith(todayStr))
          .reduce((sum, m) => sum + (m.totalCarbsG || 0), 0);
      },
      getTodayFat: () => {
        return get().meals
          .filter((m) => m.loggedAt.startsWith(todayStr))
          .reduce((sum, m) => sum + (m.totalFatG || 0), 0);
      },
      getTodayWater: () => {
        return get().waterLogs
          .filter((w) => w.loggedAt.startsWith(todayStr))
          .reduce((sum, w) => sum + w.amountMl, 0);
      },
      getTodayWorkouts: () => {
        return get().workouts.filter((w) => w.loggedAt.startsWith(todayStr));
      },
      getLatestWeight: () => {
        const sorted = [...get().weights].sort((a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime());
        return sorted[0]?.weightKg || 76.4;
      }
    }),
    {
      name: 'fitlog-fitness-storage'
    }
  )
);
