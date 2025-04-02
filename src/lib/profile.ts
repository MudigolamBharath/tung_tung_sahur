import { supabase } from './supabase';
import type { Profile } from '../types/database';

export async function uploadProfilePicture(file: File, userId: string) {
  try {
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/profile.${fileExt}`;

    // Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from('profile_pictures')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    // Update profile with new avatar path
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_path: filePath })
      .eq('id', userId);

    if (updateError) throw updateError;

    return filePath;
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    throw error;
  }
}

export async function getProfilePictureUrl(filePath: string | null) {
  if (!filePath) return null;

  try {
    const { data, error } = await supabase.storage
      .from('profile_pictures')
      .createSignedUrl(filePath, 3600); // URL valid for 1 hour

    if (error) {
      console.error('Error creating signed URL:', error);
      return null;
    }

    if (data?.signedUrl) {
      return data.signedUrl;
    }

    return null;
  } catch (error) {
    console.error('Error getting profile picture URL:', error);
    return null;
  }
}

export async function updateProfile(userId: string, data: Partial<Profile>) {
  try {
    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}