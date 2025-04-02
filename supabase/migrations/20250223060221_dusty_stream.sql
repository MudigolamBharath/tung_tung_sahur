/*
  # Update Profile Schema for File Storage

  1. Changes
    - Remove `avatar_url` column
    - Add `avatar_path` column to store the file path in storage bucket
    
  2. Storage
    - Create storage bucket for profile pictures
    
  3. Security
    - Update RLS policies for storage access
*/

-- Create storage bucket for profile pictures
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile_pictures', 'profile_pictures', true);

-- Create storage policy for authenticated users
CREATE POLICY "Users can upload their own profile picture"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'profile_pictures' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own profile picture"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'profile_pictures' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Profile pictures are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile_pictures');

-- Update profiles table
ALTER TABLE profiles
DROP COLUMN IF EXISTS avatar_url,
ADD COLUMN IF NOT EXISTS avatar_path text;