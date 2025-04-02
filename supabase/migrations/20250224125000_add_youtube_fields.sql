-- Add YouTube video and thumbnail URL fields to exercises table
ALTER TABLE public.exercises
ADD COLUMN youtube_url text,
ADD COLUMN thumbnail_url text;

-- Add push-up exercise with YouTube video
INSERT INTO public.exercises (name, description, category, difficulty, youtube_url, thumbnail_url)
VALUES (
  'Push-ups',
  'A compound exercise that primarily targets the chest, shoulders, and triceps.',
  'Bodyweight',
  'Beginner',
  'https://youtu.be/x1k3PHidXBQ?si=MLeLMLwwYxAnsVO6',
  'https://img.youtube.com/vi/x1k3PHidXBQ/maxresdefault.jpg'
);