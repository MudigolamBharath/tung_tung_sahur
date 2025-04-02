-- Add push-up exercise with thumbnail
INSERT INTO exercises (id, name, description, category, difficulty, youtube_url, thumbnail_path)
VALUES (
  gen_random_uuid(),
  'Push-ups',
  'A fundamental bodyweight exercise that targets chest, shoulders, and triceps',
  'Upper Body',
  'Beginner',
  'https://www.youtube.com/watch?v=IODxDxX7oi4',
  'pushup-form.png'
) ON CONFLICT (name) DO UPDATE
SET 
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  youtube_url = EXCLUDED.youtube_url,
  thumbnail_path = EXCLUDED.thumbnail_path;
  thumbnail_url = EXCLUDED.thumbnail_url;