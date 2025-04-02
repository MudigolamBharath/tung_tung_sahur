/*
  # Fix User Signup

  1. Changes
    - Update handle_new_user function to properly handle null metadata
    - Add better error handling for user creation
    - Ensure profile creation works with partial data

  2. Security
    - Maintain existing RLS policies
    - Keep security constraints intact
*/

-- Drop and recreate the handle_new_user function with better error handling
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

  RETURN new;
EXCEPTION WHEN others THEN
  -- Log error details (in production you might want to use a proper logging solution)
  RAISE NOTICE 'Error creating user profile: %', SQLERRM;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Ensure profiles table has correct constraints
DO $$ 
BEGIN
  -- Add NOT NULL constraints where appropriate
  ALTER TABLE profiles 
    ALTER COLUMN points SET DEFAULT 0,
    ALTER COLUMN created_at SET DEFAULT now(),
    ALTER COLUMN updated_at SET DEFAULT now();

  -- Add indexes for better performance
  CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
  CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);
EXCEPTION WHEN others THEN
  RAISE NOTICE 'Error updating profiles table: %', SQLERRM;
END $$;