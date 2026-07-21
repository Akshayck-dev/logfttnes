import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '../api/supabase';
import { useFitnessStore } from '../stores/useFitnessStore';
import { MealLog, WorkoutLog, WeightLog, WaterLog, SleepLog } from '../types';

export function useMealsQuery() {
  const storeMeals = useFitnessStore((state) => state.meals);

  return useQuery({
    queryKey: ['meals'],
    queryFn: async (): Promise<MealLog[]> => {
      if (!isSupabaseConfigured()) {
        return storeMeals;
      }
      const { data, error } = await supabase
        .from('meals')
        .select('*, items:meal_items(*)')
        .order('logged_at', { ascending: false });

      if (error) throw error;
      return (data as any) || storeMeals;
    },
    initialData: storeMeals,
    staleTime: 1000 * 60 * 5 // 5 mins
  });
}

export function useWorkoutsQuery() {
  const storeWorkouts = useFitnessStore((state) => state.workouts);

  return useQuery({
    queryKey: ['workouts'],
    queryFn: async (): Promise<WorkoutLog[]> => {
      if (!isSupabaseConfigured()) {
        return storeWorkouts;
      }
      const { data, error } = await supabase
        .from('workouts')
        .select('*, exercises:workout_exercises(*)')
        .order('logged_at', { ascending: false });

      if (error) throw error;
      return (data as any) || storeWorkouts;
    },
    initialData: storeWorkouts,
    staleTime: 1000 * 60 * 5
  });
}

export function useWeightsQuery() {
  const storeWeights = useFitnessStore((state) => state.weights);

  return useQuery({
    queryKey: ['weights'],
    queryFn: async (): Promise<WeightLog[]> => {
      if (!isSupabaseConfigured()) {
        return storeWeights;
      }
      const { data, error } = await supabase
        .from('weights')
        .select('*')
        .order('logged_at', { ascending: false });

      if (error) throw error;
      return (data as any) || storeWeights;
    },
    initialData: storeWeights,
    staleTime: 1000 * 60 * 5
  });
}
