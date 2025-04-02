/*
  # Create Streak System Tables

  1. New Tables
    - `streaks`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `current_streak` (integer)
      - `longest_streak` (integer)
      - `last_activity_date` (timestamptz)
      - `grace_period_used` (boolean)
      - `revival_tokens` (integer)
      - `revival_used_this_month` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `streak_activities`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `activity_type` (text)
      - `completed_at` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to read/write their own data
*/

-- Create streaks table
CREATE TABLE IF NOT EXISTS streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_activity_date timestamptz,
  grace_period_used boolean DEFAULT false,
  revival_tokens integer DEFAULT 0,
  revival_used_this_month boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create streak_activities table
CREATE TABLE IF NOT EXISTS streak_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type text NOT NULL,
  completed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE streak_activities ENABLE ROW LEVEL SECURITY;

-- Create policies for streaks table
CREATE POLICY "Users can view their own streaks"
  ON streaks
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own streaks"
  ON streaks
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert streaks"
  ON streaks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policies for streak_activities table
CREATE POLICY "Users can view their own activities"
  ON streak_activities
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activities"
  ON streak_activities
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to initialize streak record for new users
CREATE OR REPLACE FUNCTION initialize_user_streak()
RETURNS trigger AS $$
BEGIN
  INSERT INTO streaks (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to initialize streak for new users
CREATE TRIGGER on_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION initialize_user_streak();

-- Function to update streaks based on activity
CREATE OR REPLACE FUNCTION update_streak_on_activity()
RETURNS trigger AS $$
DECLARE
  _streak_record streaks%ROWTYPE;
  _last_midnight timestamptz;
  _now timestamptz;
  _grace_period interval = interval '12 hours';
BEGIN
  -- Get current time and last midnight in user's timezone (assuming UTC for now)
  _now := NEW.completed_at;
  _last_midnight := date_trunc('day', _now);

  -- Get the user's streak record
  SELECT * INTO _streak_record
  FROM streaks
  WHERE user_id = NEW.user_id;

  -- If no streak record exists, create one
  IF NOT FOUND THEN
    INSERT INTO streaks (user_id, current_streak, last_activity_date)
    VALUES (NEW.user_id, 1, _now)
    RETURNING * INTO _streak_record;
    RETURN NEW;
  END IF;

  -- Update the streak based on the time difference
  IF _streak_record.last_activity_date IS NULL THEN
    -- First activity
    UPDATE streaks
    SET current_streak = 1,
        longest_streak = 1,
        last_activity_date = _now,
        updated_at = now()
    WHERE user_id = NEW.user_id;
  ELSE
    -- Calculate days between last activity and now
    DECLARE
      _days_diff integer;
    BEGIN
      _days_diff := (_now::date - _streak_record.last_activity_date::date);

      IF _days_diff = 0 THEN
        -- Same day, no streak update needed
        NULL;
      ELSIF _days_diff = 1 OR 
            (_days_diff = 2 AND _now < _last_midnight + _grace_period) THEN
        -- Next day or within grace period
        UPDATE streaks
        SET current_streak = current_streak + 1,
            longest_streak = GREATEST(longest_streak, current_streak + 1),
            last_activity_date = _now,
            grace_period_used = _days_diff = 2,
            updated_at = now()
        WHERE user_id = NEW.user_id;
      ELSE
        -- Streak broken
        UPDATE streaks
        SET current_streak = 1,
            last_activity_date = _now,
            grace_period_used = false,
            updated_at = now()
        WHERE user_id = NEW.user_id;
      END IF;
    END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update streaks on new activity
CREATE TRIGGER on_activity_created
  AFTER INSERT ON streak_activities
  FOR EACH ROW
  EXECUTE FUNCTION update_streak_on_activity();

-- Function to reset revival_used_this_month flag monthly
CREATE OR REPLACE FUNCTION reset_monthly_revival()
RETURNS void AS $$
BEGIN
  UPDATE streaks
  SET revival_used_this_month = false,
      updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;