export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'extra_active';
export type FitnessGoal = 'lose_weight' | 'maintain' | 'gain_muscle';
export type MealCategory = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type WorkoutCategory = 'strength' | 'cardio' | 'hiit' | 'yoga' | 'pilates';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  heightCm: number;
  currentWeightKg: number;
  targetWeightKg: number;
  activityLevel: ActivityLevel;
  fitnessGoal: FitnessGoal;
  
  // Targets
  targetCalories: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatG: number;
  targetWaterMl: number;
  targetSleepHrs: number;

  createdAt: string;
  updatedAt: string;
}

export interface WeightLog {
  id: string;
  userId: string;
  weightKg: number;
  bmi: number;
  notes?: string;
  loggedAt: string; // ISO date
}

export interface MealItem {
  id: string;
  mealId?: string;
  name: string;
  quantity: number;
  unit: string; // 'g' | 'serving' | 'oz' | 'piece'
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
}

export interface MealLog {
  id: string;
  userId: string;
  mealType: MealCategory;
  title: string;
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  totalFiberG: number;
  items: MealItem[];
  isFavorite?: boolean;
  loggedAt: string;
}

export interface ExerciseSet {
  id: string;
  exerciseName: string;
  setsCount: number;
  repsCount: number;
  weightKg: number;
  restSeconds?: number;
  notes?: string;
}

export interface WorkoutLog {
  id: string;
  userId: string;
  title: string;
  category: WorkoutCategory;
  durationMinutes: number;
  caloriesBurned: number;
  notes?: string;
  isTemplate?: boolean;
  exercises: ExerciseSet[];
  loggedAt: string;
}

export interface WaterLog {
  id: string;
  userId: string;
  amountMl: number;
  loggedAt: string;
}

export interface SleepLog {
  id: string;
  userId: string;
  sleepTime: string; // ISO or string
  wakeTime: string;
  durationHours: number;
  qualityScore: number; // 1 - 5
  notes?: string;
  loggedAt: string; // YYYY-MM-DD
}

export interface DailySummary {
  date: string; // YYYY-MM-DD
  caloriesConsumed: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  waterMl: number;
  workoutsCount: number;
  sleepHours: number;
}

export interface UserStreak {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
}

export interface AiDetectedEntity {
  intent: 'meal' | 'workout' | 'weight' | 'water' | 'sleep' | 'unknown';
  confidence: number;
  summaryText: string;
  mealData?: Partial<MealLog>;
  workoutData?: Partial<WorkoutLog>;
  weightData?: Partial<WeightLog>;
  waterData?: Partial<WaterLog>;
  sleepData?: Partial<SleepLog>;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  iconName: string;
  unlocked: boolean;
  unlockedAt?: string;
}
