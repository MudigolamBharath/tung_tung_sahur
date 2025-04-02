export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_path: string | null;
  points: number;
  created_at: string;
  updated_at: string;
}

export interface Exercise {
  id: string;
  name: string;
  description: string | null;
  category: string;
  difficulty: string;
  youtube_url: string | null;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Workout {
  id: string;
  user_id: string;
  name: string;
  duration: string | null;
  calories_burned: number | null;
  completed_at: string;
  created_at: string;
  updated_at: string;
}

export interface WorkoutExercise {
  id: string;
  workout_id: string;
  exercise_id: string;
  sets: number;
  reps: number;
  weight: number | null;
  notes: string | null;
  created_at: string;
}

export interface Streak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: string;
  user_id: string;
  title: string;
  description: string;
  achieved_at: string;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at' | 'points'>;
        Update: Partial<Omit<Profile, 'id'>>;
      };
      exercises: {
        Row: Exercise;
        Insert: Omit<Exercise, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Exercise, 'id'>>;
      };
      workouts: {
        Row: Workout;
        Insert: Omit<Workout, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Workout, 'id'>>;
      };
      workout_exercises: {
        Row: WorkoutExercise;
        Insert: Omit<WorkoutExercise, 'id' | 'created_at'>;
        Update: Partial<Omit<WorkoutExercise, 'id'>>;
      };
      streaks: {
        Row: Streak;
        Insert: Omit<Streak, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Streak, 'id'>>;
      };
      achievements: {
        Row: Achievement;
        Insert: Omit<Achievement, 'id' | 'created_at' | 'achieved_at'>;
        Update: Partial<Omit<Achievement, 'id'>>;
      };
    };
  };
}