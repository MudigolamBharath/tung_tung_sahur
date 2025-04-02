/*
  # Fix Database Schema

  1. Changes
    - Drop all existing objects to ensure clean slate
    - Create storage bucket for profile pictures
    - Create all necessary tables
    - Set up RLS policies
    - Create trigger for new user registration
    - Add default exercises

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for each table
    - Set up secure user profile creation
*/

-- Drop all existing objects to ensure clean slate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.achievements CASCADE;
DROP TABLE IF EXISTS public.streaks CASCADE;
DROP TABLE IF EXISTS public.workout_exercises CASCADE;
DROP TABLE IF EXISTS public.workouts CASCADE;
DROP TABLE IF EXISTS public.exercises CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create storage bucket for profile pictures if it doesn't exist
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('profile_pictures', 'profile_pictures', false)
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Drop existing storage policies if they exist
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can upload their own profile picture" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update their own profile picture" ON storage.objects;
  DROP POLICY IF EXISTS "Profile pictures are viewable by everyone" ON storage.objects;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create storage policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can upload their own profile picture'
  ) THEN
    CREATE POLICY "Users can upload their own profile picture"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'profile_pictures' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can update their own profile picture'
  ) THEN
    CREATE POLICY "Users can update their own profile picture"
    ON storage.objects FOR UPDATE TO authenticated
    USING (bucket_id = 'profile_pictures' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Profile pictures are viewable by everyone'
  ) THEN
    CREATE POLICY "Profile pictures are viewable by everyone"
    ON storage.objects FOR SELECT TO authenticated
    USING (bucket_id = 'profile_pictures');
  END IF;
END $$;

-- Create profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username text UNIQUE,
  full_name text,
  avatar_path text,
  points integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create exercises table
CREATE TABLE public.exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text NOT NULL,
  difficulty text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create workouts table
CREATE TABLE public.workouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  duration interval,
  calories_burned integer,
  completed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create workout_exercises junction table
CREATE TABLE public.workout_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id uuid REFERENCES public.workouts(id) ON DELETE CASCADE,
  exercise_id uuid REFERENCES public.exercises(id) ON DELETE CASCADE,
  sets integer NOT NULL,
  reps integer NOT NULL,
  weight numeric,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create streaks table
CREATE TABLE public.streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_activity_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create achievements table
CREATE TABLE public.achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  achieved_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'Profiles are viewable by everyone'
  ) THEN
    CREATE POLICY "Profiles are viewable by everyone" 
    ON public.profiles FOR SELECT 
    USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'Users can insert their own profile'
  ) THEN
    CREATE POLICY "Users can insert their own profile" 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'Users can update their own profile'
  ) THEN
    CREATE POLICY "Users can update their own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);
  END IF;
END $$;

-- Create policies for exercises
CREATE POLICY "Exercises are viewable by everyone"
ON public.exercises FOR SELECT
USING (true);

-- Create policies for workouts
CREATE POLICY "Users can view their own workouts"
ON public.workouts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workouts"
ON public.workouts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workouts"
ON public.workouts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workouts"
ON public.workouts FOR DELETE
USING (auth.uid() = user_id);

-- Create policies for workout exercises
CREATE POLICY "Users can view their workout exercises"
ON public.workout_exercises FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.workouts
    WHERE id = workout_exercises.workout_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create workout exercises"
ON public.workout_exercises FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.workouts
    WHERE id = workout_exercises.workout_id
    AND user_id = auth.uid()
  )
);

-- Create policies for streaks
CREATE POLICY "Users can view their own streaks"
ON public.streaks FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own streaks"
ON public.streaks FOR UPDATE
USING (auth.uid() = user_id);

-- Create policies for achievements
CREATE POLICY "Users can view their own achievements"
ON public.achievements FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can create achievements"
ON public.achievements FOR INSERT
WITH CHECK (true);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  username_val text;
  full_name_val text;
BEGIN
  -- Extract username from metadata with fallback
  username_val := COALESCE(
    (new.raw_user_meta_data->>'username'),
    'user_' || substr(new.id::text, 1, 8)
  );
  
  -- Extract full name from metadata with fallback
  full_name_val := COALESCE(
    (new.raw_user_meta_data->>'full_name'),
    'New User'
  );

  -- Insert new profile with safe defaults
  INSERT INTO public.profiles (
    id,
    username,
    full_name,
    points,
    created_at,
    updated_at
  ) VALUES (
    new.id,
    username_val,
    full_name_val,
    0,
    now(),
    now()
  );

  -- Initialize streak record
  INSERT INTO public.streaks (
    user_id,
    current_streak,
    longest_streak
  ) VALUES (
    new.id,
    0,
    0
  );

  -- Add first achievement
  INSERT INTO public.achievements (
    user_id,
    title,
    description
  ) VALUES (
    new.id,
    'Welcome to FitTron',
    'Started your fitness journey with FitTron'
  );

  RETURN new;
EXCEPTION 
  WHEN unique_violation THEN
    RAISE LOG 'Profile already exists for user %', new.id;
    RETURN new;
  WHEN others THEN
    RAISE LOG 'Error creating profile for user %: %', new.id, SQLERRM;
    RETURN new;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default exercises
INSERT INTO public.exercises (name, description, category, difficulty) VALUES
('Push-ups', 'Classic bodyweight exercise for chest, shoulders, and triceps', 'Strength', 'Beginner'),
('Squats', 'Fundamental lower body exercise', 'Strength', 'Beginner'),
('Plank', 'Core strengthening isometric exercise', 'Core', 'Beginner'),
('Pull-ups', 'Upper body pulling exercise', 'Strength', 'Intermediate'),
('Deadlifts', 'Compound exercise for full body strength', 'Strength', 'Intermediate'),
('Burpees', 'Full body cardio exercise', 'Cardio', 'Intermediate'),
('Mountain Climbers', 'Dynamic core exercise with cardio benefits', 'Cardio', 'Beginner'),
('Dumbbell Rows', 'Back strengthening exercise', 'Strength', 'Beginner'),
('Lunges', 'Unilateral lower body exercise', 'Strength', 'Beginner'),
('Russian Twists', 'Rotational core exercise', 'Core', 'Beginner');