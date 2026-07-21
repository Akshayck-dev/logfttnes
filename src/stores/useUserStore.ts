import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile } from '../types';

interface UserState {
  profile: UserProfile;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  theme: 'dark' | 'light';
  updateProfile: (updates: Partial<UserProfile>) => void;
  setAuthenticated: (val: boolean) => void;
  setOnboarded: (val: boolean) => void;
  setTheme: (theme: 'dark' | 'light') => void;
}

const initialProfile: UserProfile = {
  id: 'user-default-1',
  email: 'alex.fitness@apple.com',
  fullName: 'Alex Vance',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  age: 26,
  gender: 'male',
  heightCm: 180,
  currentWeightKg: 76.4,
  targetWeightKg: 72.0,
  activityLevel: 'moderate',
  fitnessGoal: 'lose_weight',
  targetCalories: 2250,
  targetProteinG: 165,
  targetCarbsG: 220,
  targetFatG: 65,
  targetWaterMl: 3000,
  targetSleepHrs: 8.0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      profile: initialProfile,
      isAuthenticated: true,
      isOnboarded: true,
      theme: 'dark',
      updateProfile: (updates) =>
        set((state) => ({
          profile: { ...state.profile, ...updates, updatedAt: new Date().toISOString() }
        })),
      setAuthenticated: (val) => set({ isAuthenticated: val }),
      setOnboarded: (val) => set({ isOnboarded: val }),
      setTheme: (theme) => set({ theme })
    }),
    {
      name: 'fitlog-user-storage'
    }
  )
);
