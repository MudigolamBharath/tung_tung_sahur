/*
  # Fix Profile Policies and Trigger

  1. Changes
    - Add safety checks for existing policies
    - Update trigger function with better defaults
    - Ensure idempotent operations
*/

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username text UNIQUE,
  full_name text,
  avatar_url text,
  points integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Safely create policies
DO $$ 
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
    DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
    
    -- Create new policies
    CREATE POLICY "Profiles are viewable by everyone" 
    ON profiles FOR SELECT 
    USING (true);

    CREATE POLICY "Users can update their own profile" 
    ON profiles FOR UPDATE 
    USING (auth.uid() = id);
END $$;

-- Update function to handle new user profiles with better defaults
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  username_val text;
  full_name_val text;
BEGIN
  -- Safely extract values from metadata, defaulting to NULL if not present
  username_val := COALESCE(
    (new.raw_user_meta_data->>'username'),
    'user_' || substr(new.id::text, 1, 8)
  );
  
  full_name_val := COALESCE(
    (new.raw_user_meta_data->>'full_name'),
    'New User'
  );

  INSERT INTO public.profiles (
    id,
    username,
    full_name,
    points
  ) VALUES (
    new.id,
    username_val,
    full_name_val,
    0
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Safely recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();