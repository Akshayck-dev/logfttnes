-- FitLog AI Database Schema for Supabase
-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  age INTEGER DEFAULT 25,
  gender TEXT DEFAULT 'male',
  height_cm NUMERIC(5,2) DEFAULT 175.0,
  current_weight_kg NUMERIC(5,2) DEFAULT 75.0,
  target_weight_kg NUMERIC(5,2) DEFAULT 70.0,
  activity_level TEXT DEFAULT 'moderate', -- sedentary, light, moderate, active, extra_active
  fitness_goal TEXT DEFAULT 'lose_weight', -- lose_weight, maintain, gain_muscle
  
  -- Daily Target Goals
  target_calories INTEGER DEFAULT 2200,
  target_protein_g INTEGER DEFAULT 160,
  target_carbs_g INTEGER DEFAULT 220,
  target_fat_g INTEGER DEFAULT 70,
  target_water_ml INTEGER DEFAULT 2500,
  target_sleep_hrs NUMERIC(4,2) DEFAULT 8.0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Weight Logs Table
CREATE TABLE IF NOT EXISTS public.weights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  weight_kg NUMERIC(5,2) NOT NULL,
  bmi NUMERIC(4,2),
  notes TEXT,
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Meals Table
CREATE TABLE IF NOT EXISTS public.meals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  meal_type TEXT NOT NULL, -- breakfast, lunch, dinner, snack
  title TEXT NOT NULL,
  total_calories INTEGER DEFAULT 0,
  total_protein_g NUMERIC(6,2) DEFAULT 0,
  total_carbs_g NUMERIC(6,2) DEFAULT 0,
  total_fat_g NUMERIC(6,2) DEFAULT 0,
  total_fiber_g NUMERIC(6,2) DEFAULT 0,
  is_favorite BOOLEAN DEFAULT false,
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Meal Items Table
CREATE TABLE IF NOT EXISTS public.meal_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meal_id UUID NOT NULL REFERENCES public.meals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity NUMERIC(6,2) DEFAULT 1,
  unit TEXT DEFAULT 'serving', -- g, serving, oz, cup, piece
  calories INTEGER DEFAULT 0,
  protein_g NUMERIC(6,2) DEFAULT 0,
  carbs_g NUMERIC(6,2) DEFAULT 0,
  fat_g NUMERIC(6,2) DEFAULT 0,
  fiber_g NUMERIC(6,2) DEFAULT 0
);

-- 5. Workouts Table
CREATE TABLE IF NOT EXISTS public.workouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL, -- e.g., Chest & Triceps Shred, Legs Day
  category TEXT DEFAULT 'strength', -- strength, cardio, hiit, yoga, pilates
  duration_minutes INTEGER DEFAULT 45,
  calories_burned INTEGER DEFAULT 350,
  notes TEXT,
  is_template BOOLEAN DEFAULT false,
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Workout Exercises Table
CREATE TABLE IF NOT EXISTS public.workout_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL,
  sets_count INTEGER DEFAULT 3,
  reps_count INTEGER DEFAULT 10,
  weight_kg NUMERIC(6,2) DEFAULT 0,
  rest_seconds INTEGER DEFAULT 60,
  notes TEXT
);

-- 7. Water Logs Table
CREATE TABLE IF NOT EXISTS public.water_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount_ml INTEGER NOT NULL,
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Sleep Logs Table
CREATE TABLE IF NOT EXISTS public.sleep_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sleep_time TIMESTAMPTZ NOT NULL,
  wake_time TIMESTAMPTZ NOT NULL,
  duration_hours NUMERIC(4,2) NOT NULL,
  quality_score INTEGER DEFAULT 4, -- 1 to 5 scale
  notes TEXT,
  logged_at DATE DEFAULT CURRENT_DATE
);

-- 9. Daily Summaries Table
CREATE TABLE IF NOT EXISTS public.daily_summary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  calories_consumed INTEGER DEFAULT 0,
  protein_g NUMERIC(6,2) DEFAULT 0,
  carbs_g NUMERIC(6,2) DEFAULT 0,
  fat_g NUMERIC(6,2) DEFAULT 0,
  water_ml INTEGER DEFAULT 0,
  workouts_count INTEGER DEFAULT 0,
  sleep_hours NUMERIC(4,2) DEFAULT 0,
  UNIQUE(user_id, date)
);

-- 10. Streaks Table
CREATE TABLE IF NOT EXISTS public.streaks (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 1,
  longest_streak INTEGER DEFAULT 1,
  last_activity_date DATE DEFAULT CURRENT_DATE
);

-- 11. AI Logs Table
CREATE TABLE IF NOT EXISTS public.ai_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  detected_intent TEXT NOT NULL, -- meal, workout, weight, water, sleep
  parsed_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sleep_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own profiles" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can manage own weights" ON public.weights FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own meals" ON public.meals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own meal items" ON public.meal_items FOR ALL USING (
  EXISTS (SELECT 1 FROM public.meals WHERE id = meal_items.meal_id AND user_id = auth.uid())
);
CREATE POLICY "Users can manage own workouts" ON public.workouts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own exercises" ON public.workout_exercises FOR ALL USING (
  EXISTS (SELECT 1 FROM public.workouts WHERE id = workout_exercises.workout_id AND user_id = auth.uid())
);
CREATE POLICY "Users can manage own water logs" ON public.water_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own sleep logs" ON public.sleep_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own daily summary" ON public.daily_summary FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own streaks" ON public.streaks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own ai logs" ON public.ai_logs FOR ALL USING (auth.uid() = user_id);
