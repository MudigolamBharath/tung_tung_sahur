import React from 'react';
import { motion } from 'framer-motion';
import { 
  User,
  Mail,
  Calendar,
  MapPin,
  Trophy,
  Target,
  Edit,
  Camera
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import FileUpload from '../components/FileUpload';
import { getProfilePictureUrl } from '../lib/profile';
import { supabase } from '../lib/supabase';

const Profile = () => {
  const { user, profile } = useAuth();
  const [profilePicUrl, setProfilePicUrl] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isRemoving, setIsRemoving] = React.useState(false);

  React.useEffect(() => {
    if (profile?.avatar_path) {
      loadProfilePicture();
    }
  }, [profile?.avatar_path]);

  const loadProfilePicture = async () => {
    if (profile?.avatar_path) {
      const url = await getProfilePictureUrl(profile.avatar_path);
      setProfilePicUrl(url);
    }
  };

  const handleUploadComplete = async (path: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_path: path })
        .eq('id', user?.id);

      if (error) throw error;
      
      // Reload profile picture
      await loadProfilePicture();
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile picture');
    }
  };

  const handleUploadError = (error: Error) => {
    setError('Failed to upload profile picture');
    console.error('Upload error:', error);
  };

  const handleRemoveProfilePicture = async () => {
    if (!user || !profile?.avatar_path) return;
    
    try {
      setIsRemoving(true);
      setError(null);

      // Remove from storage
      const { error: storageError } = await supabase.storage
        .from('profile_pictures')
        .remove([profile.avatar_path]);

      if (storageError) throw storageError;

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_path: null })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Clear the profile picture URL
      setProfilePicUrl(null);
    } catch (error) {
      console.error('Error removing profile picture:', error);
      setError('Failed to remove profile picture');
    } finally {
      setIsRemoving(false);
    }
  };

  if (!profile) {
    return <div className="p-8">Loading profile...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="relative">
        <div className="h-48 bg-gradient-to-r from-primary-600 to-primary-400 rounded-xl"></div>
        <div className="absolute -bottom-16 left-8 flex items-end gap-6">
          <div className="relative">
            <img
              src={profilePicUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`}
              alt="Profile"
              className="w-32 h-32 rounded-xl object-cover border-4 border-dark"
            />
            <div className="absolute bottom-2 right-2 flex gap-2">
              {profile.avatar_path && (
                <button
                  onClick={handleRemoveProfilePicture}
                  disabled={isRemoving}
                  className="p-2 bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                  title="Remove profile picture"
                >
                  <User className="w-4 h-4 text-white" />
                </button>
              )}
              <FileUpload
                onUploadComplete={handleUploadComplete}
                onError={handleUploadError}
              />
            </div>
          </div>
          <div className="mb-4">
            <h1 className="text-3xl font-bold">{profile.full_name || 'Update your name'}</h1>
            <p className="text-gray-400">@{profile.username || 'username'}</p>
          </div>
        </div>
        <button className="absolute bottom-4 right-8 btn-primary">
          <Edit className="w-4 h-4 mr-2" />
          Edit Profile
        </button>
      </div>

      {error && (
        <div className="bg-red-500 bg-opacity-10 text-red-500 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Info */}
        <div className="card">
          <h2 className="text-xl font-bold mb-6">Profile Info</h2>
          <div className="space-y-4">
            <InfoItem icon={<Mail />} label="Email" value={user?.email || 'No email'} />
            <InfoItem 
              icon={<Calendar />} 
              label="Joined" 
              value={new Date(profile.created_at).toLocaleDateString('en-US', { 
                month: 'long',
                year: 'numeric'
              })} 
            />
            <InfoItem icon={<MapPin />} label="Location" value="Not set" />
          </div>
        </div>

        {/* Stats */}
        <div className="card">
          <h2 className="text-xl font-bold mb-6">Statistics</h2>
          <div className="space-y-4">
            <StatItem icon={<Trophy />} label="Total Points" value={profile.points.toString()} />
            <StatItem icon={<Target />} label="Goals Completed" value="0" />
            <StatItem icon={<Calendar />} label="Workout Streak" value="0 days" />
          </div>
        </div>

        {/* Achievements */}
        <div className="card">
          <h2 className="text-xl font-bold mb-6">Recent Achievements</h2>
          <div className="space-y-4">
            <Achievement
              icon={<Trophy />}
              title="Getting Started"
              description="Created your FitTron profile"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const InfoItem: React.FC<InfoItemProps> = ({ icon, label, value }) => (
  <div className="flex items-center gap-4">
    <div className="w-10 h-10 bg-dark-200 rounded-lg flex items-center justify-center">
      {React.cloneElement(icon as React.ReactElement, { className: 'w-5 h-5 text-primary-500' })}
    </div>
    <div>
      <p className="text-sm text-gray-400">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  </div>
);

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const StatItem: React.FC<StatItemProps> = ({ icon, label, value }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      {React.cloneElement(icon as React.ReactElement, { className: 'w-5 h-5 text-primary-500' })}
      <span className="text-gray-400">{label}</span>
    </div>
    <span className="font-bold">{value}</span>
  </div>
);

interface AchievementProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const Achievement: React.FC<AchievementProps> = ({ icon, title, description }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="flex items-start gap-4 p-3 rounded-lg hover:bg-dark-200 transition-colors"
  >
    <div className="w-10 h-10 bg-primary-500 bg-opacity-20 rounded-lg flex items-center justify-center flex-shrink-0">
      {React.cloneElement(icon as React.ReactElement, { className: 'w-5 h-5 text-primary-500' })}
    </div>
    <div>
      <h4 className="font-medium">{title}</h4>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  </motion.div>
);

export default Profile;