/*
  # Fix Authentication and RLS Policies

  1. Changes
    - Drop and recreate profiles table with proper RLS policies
    - Update handle_new_user function with better error handling
    - Add policies for authenticated users
    
  2. Security
    - Enable RLS on profiles table
    - Add policies for profile creation and updates
    - Ensure proper authentication checks
*/

-- Recreate the profiles table with proper structure
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username text UNIQUE,
  full_name text,
  avatar_path text,
  points integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are insertable by auth users" ON public.profiles;

-- Create comprehensive RLS policies
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- Improve the handle_new_user function
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

  RETURN new;
EXCEPTION 
  WHEN unique_violation THEN
    -- Handle case where profile already exists
    RAISE LOG 'Profile already exists for user %', new.id;
    RETURN new;
  WHEN others THEN
    -- Log error details
    RAISE LOG 'Error creating profile for user %: %', new.id, SQLERRM;
    RETURN new;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();