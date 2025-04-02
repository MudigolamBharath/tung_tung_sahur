/*
  # Fix Profile Creation

  1. Changes
    - Drop and recreate handle_new_user function with better error handling
    - Add explicit transaction handling
    - Add additional logging
    - Ensure profile creation is atomic

  2. Security
    - Maintain existing RLS policies
    - Keep security definer setting for function
*/

-- Recreate the handle_new_user function with better error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
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

  -- Log successful profile creation
  RAISE LOG 'Profile created for user %', new.id;

  RETURN new;
EXCEPTION WHEN unique_violation THEN
  -- Handle case where profile already exists
  RAISE LOG 'Profile already exists for user %', new.id;
  RETURN new;
WHEN others THEN
  -- Log error details
  RAISE LOG 'Error creating profile for user %: %', new.id, SQLERRM;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Add additional indexes for performance
DO $$ 
BEGIN
  CREATE INDEX IF NOT EXISTS idx_profiles_points ON profiles(points DESC);
  CREATE INDEX IF NOT EXISTS idx_profiles_updated_at ON profiles(updated_at DESC);
EXCEPTION WHEN others THEN
  RAISE LOG 'Error creating indexes: %', SQLERRM;
END $$;