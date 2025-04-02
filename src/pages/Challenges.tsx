import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Target, Clock, Users, Medal } from 'lucide-react';

const Challenges = () => {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold mb-2">Daily Challenges</h1>
        <p className="text-gray-400">Complete challenges to earn points and climb the leaderboard.</p>
      </header>

      {/* Active Challenges */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                <Trophy className="w-6 h-6 text-primary-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold">30-Day Streak</h3>
                <p className="text-gray-400">Stay consistent for 30 days</p>
              </div>
            </div>
            <span className="text-primary-500">15/30</span>
          </div>
          <div className="w-full bg-dark-200 rounded-full h-2">
            <div className="bg-primary-500 h-2 rounded-full" style={{ width: '50%' }}></div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-primary-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Weight Loss Goal</h3>
                <p className="text-gray-400">Lose 5kg this month</p>
              </div>
            </div>
            <span className="text-primary-500">3.2/5</span>
          </div>
          <div className="w-full bg-dark-200 rounded-full h-2">
            <div className="bg-primary-500 h-2 rounded-full" style={{ width: '64%' }}></div>
          </div>
        </div>
      </section>

      {/* Available Challenges */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Available Challenges</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ChallengeCard
            icon={<Clock />}
            title="Early Bird"
            description="Complete 5 workouts before 8 AM"
            reward="50 points"
          />
          <ChallengeCard
            icon={<Users />}
            title="Social Butterfly"
            description="Join 3 group workouts this week"
            reward="75 points"
          />
          <ChallengeCard
            icon={<Medal />}
            title="Personal Best"
            description="Beat your previous record in any exercise"
            reward="100 points"
          />
        </div>
      </section>
    </div>
  );
};

interface ChallengeCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  reward: string;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ icon, title, description, reward }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="card cursor-pointer"
  >
    <div className="w-12 h-12 bg-primary-500 bg-opacity-20 rounded-lg flex items-center justify-center mb-4">
      {React.cloneElement(icon as React.ReactElement, { className: 'w-6 h-6 text-primary-500' })}
    </div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-gray-400 mb-4">{description}</p>
    <div className="flex items-center gap-2 text-primary-500">
      <Trophy className="w-4 h-4" />
      <span className="font-medium">{reward}</span>
    </div>
  </motion.div>
);

export default Challenges;