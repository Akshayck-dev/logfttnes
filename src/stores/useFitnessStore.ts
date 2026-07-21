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
  clearAllData: () => void;

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

const initialMeals: MealLog[] = [];
const initialWorkouts: WorkoutLog[] = [];
const initialWeights: WeightLog[] = [];
const initialWaterLogs: WaterLog[] = [];
const initialSleepLogs: SleepLog[] = [];

const initialBadges: AchievementBadge[] = [
  { id: 'b-1', title: 'First Log', description: 'Logged your first meal or workout in FitLog AI', iconName: 'Flame', unlocked: false },
  { id: 'b-2', title: 'Hydration Hero', description: 'Reached 3,000ml water target', iconName: 'Droplets', unlocked: false },
  { id: 'b-3', title: 'Iron Lifter', description: 'Logged a strength workout session', iconName: 'Dumbbell', unlocked: false },
  { id: 'b-4', title: 'Macro Master', description: 'Hit daily protein target', iconName: 'Target', unlocked: false }
];

export const useFitnessStore = create<FitnessState>()(
  persist(
    (set, get) => ({
      meals: initialMeals,
      workouts: initialWorkouts,
      weights: initialWeights,
      waterLogs: initialWaterLogs,
      sleepLogs: initialSleepLogs,
      streak: { currentStreak: 0, longestStreak: 0, lastActivityDate: todayStr },
      badges: initialBadges,
      aiHistory: [],

      addMeal: (mealData) => {
        const newMeal: MealLog = {
          ...mealData,
          id: `m-${Date.now()}`
        };
        set((state) => ({
          meals: [newMeal, ...state.meals],
          streak: {
            currentStreak: Math.max(state.streak.currentStreak, 1),
            longestStreak: Math.max(state.streak.longestStreak, 1),
            lastActivityDate: todayStr
          }
        }));
      },
      deleteMeal: (id) => {
        set((state) => ({ meals: state.meals.filter((m) => m.id !== id) }));
      },

      addWorkout: (workoutData) => {
        const newWorkout: WorkoutLog = {
          ...workoutData,
          id: `w-${Date.now()}`
        };
        set((state) => ({
          workouts: [newWorkout, ...state.workouts],
          streak: {
            currentStreak: Math.max(state.streak.currentStreak, 1),
            longestStreak: Math.max(state.streak.longestStreak, 1),
            lastActivityDate: todayStr
          }
        }));
      },
      deleteWorkout: (id) => {
        set((state) => ({ workouts: state.workouts.filter((w) => w.id !== id) }));
      },

      addWeight: (weightKg, notes) => {
        const heightCm = 180;
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

      clearAllData: () => {
        set({
          meals: [],
          workouts: [],
          weights: [],
          waterLogs: [],
          sleepLogs: [],
          aiHistory: [],
          streak: { currentStreak: 0, longestStreak: 0, lastActivityDate: todayStr }
        });
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
        return sorted[0]?.weightKg || 75.0;
      }
    }),
    {
      name: 'fitlog-fitness-storage'
    }
  )
);
