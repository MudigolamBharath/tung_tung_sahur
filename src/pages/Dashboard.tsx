import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Flame, 
  Clock,
  Trophy,
  Crown,
  Medal
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { getProfilePictureUrl } from '../lib/profile';
import type { Profile } from '../types/database';
import { Hero } from '../components/ui/hero';

interface ProfileWithAvatarUrl extends Profile {
  avatarUrl?: string | null;
}

const Dashboard = () => {
  const { user, profile } = useAuth();
  const [leaderboard, setLeaderboard] = useState<ProfileWithAvatarUrl[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchLeaderboard();
    }
  }, [user]);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('points', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Fetch signed URLs for all profile pictures
      const profilesWithAvatars = await Promise.all((data || []).map(async (profile) => {
        let avatarUrl = null;
        if (profile.avatar_path) {
          avatarUrl = await getProfilePictureUrl(profile.avatar_path);
        }
        return { ...profile, avatarUrl };
      }));

      setLeaderboard(profilesWithAvatars);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-700" />;
      default:
        return <Trophy className="w-6 h-6 text-primary-500/50" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Hero */}
      <Hero
        title={`Welcome back, ${profile?.full_name || 'Athlete'}!`}
        subtitle="Your fitness journey continues. Let's achieve your goals together."
        titleClassName="text-4xl md:text-5xl font-bold"
        subtitleClassName="text-lg md:text-xl text-gray-400"
        gradient={true}
        blur={true}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={<Activity />}
          title="Daily Streak"
          value="7 days"
          trend="+2"
        />
        <StatCard
          icon={<Flame />}
          title="Calories Burned"
          value="1,234"
          trend="+350"
        />
        <StatCard
          icon={<Clock />}
          title="Workout Time"
          value="5.2 hrs"
          trend="+1.2"
        />
      </div>

      {/* Leaderboard */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Top Athletes</h2>
          <div className="text-sm text-gray-400">Updated in real-time</div>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary-500"></div>
          </div>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((profile, index) => (
              <motion.div
                key={profile.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                  profile.id === user?.id 
                    ? 'bg-primary-500/10 border border-primary-500/20' 
                    : 'hover:bg-dark-200'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 flex items-center justify-center">
                    {getRankIcon(index + 1)}
                  </div>
                  <div className="flex items-center gap-3">
                    <img
                      src={profile.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`}
                      alt={profile.username || 'User'}
                      className="w-10 h-10 rounded-full object-cover bg-dark-200"
                    />
                    <div>
                      <p className="font-medium">{profile.username || 'Anonymous'}</p>
                      <p className="text-sm text-gray-400">{profile.full_name || 'Fitness Enthusiast'}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-primary-500" />
                  <span className="font-medium">{profile.points.toLocaleString()} pts</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  trend: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, trend }) => (
  <motion.div 
    whileHover={{ scale: 1.02 }}
    className="card"
  >
    <div className="flex items-start justify-between">
      <div>
        <div className="w-10 h-10 bg-primary-500 bg-opacity-20 rounded-lg flex items-center justify-center mb-4">
          {React.cloneElement(icon as React.ReactElement, { className: 'w-5 h-5 text-primary-500' })}
        </div>
        <h3 className="text-lg font-medium text-gray-400">{title}</h3>
        <p className="text-2xl font-bold mt-1">{value}</p>
      </div>
      <span className="text-green-500">{trend}</span>
    </div>
  </motion.div>
);

export default Dashboard;