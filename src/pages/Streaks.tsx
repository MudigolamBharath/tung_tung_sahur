import React from 'react';
import { motion } from 'framer-motion';
import { 
  Flame,
  Calendar,
  Trophy,
  Target,
  Award,
  TrendingUp
} from 'lucide-react';
import { Hero } from '../components/ui/hero';

const Streaks = () => {
  const currentYear = 2025;
  
  // Generate contribution data for the current year
  const generateYearData = () => {
    const data = [];
    const startDate = new Date(currentYear, 0, 1);
    const endDate = new Date(currentYear + 1, 0, 1);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today's date
    
    // Get login dates from localStorage
    const loginDates = JSON.parse(localStorage.getItem('loginDates') || '[]');
    
    for (let date = new Date(startDate); date < endDate; date.setDate(date.getDate() + 1)) {
      // Check if this date is today
      const isToday = date.getTime() === today.getTime();
      
      // Check if this date is a login date or if it's today (since we're logged in)
      const isLoginDay = isToday || loginDates.some(loginDate => 
        new Date(loginDate).toDateString() === date.toDateString()
      );
    
      // Only generate activity data for dates up to today
      let level = 0;
      if (date <= today) {
        const baseProb = Math.random();
        level = baseProb < 0.2 ? 0 : // 20% chance of no activity
                baseProb < 0.4 ? 1 : // 20% chance of light activity
                baseProb < 0.7 ? 2 : // 30% chance of medium activity
                baseProb < 0.9 ? 3 : // 20% chance of high activity
                4;                    // 10% chance of intense activity
      }
    
      data.push({
        date: new Date(date),
        level,
        activities: getActivitiesForLevel(level),
        isLoginDay
      });
    }
    return data;
  };

  const getActivitiesForLevel = (level: number) => {
    const activities = [];
    if (level >= 1) activities.push('🏋️ Workout');
    if (level >= 2) activities.push('🥗 Nutrition');
    if (level >= 3) activities.push('🏆 Challenge');
    if (level >= 4) activities.push('⭐ Perfect Day');
    return activities;
  };

  const yearData = React.useMemo(generateYearData, []);

  // Group data by months
  const getMonthlyData = () => {
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: new Date(currentYear, i, 1).toLocaleString('default', { month: 'short' }),
      days: []
    }));

    yearData.forEach(day => {
      const month = day.date.getMonth();
      monthlyData[month].days.push(day);
    });

    return monthlyData;
  };

  const monthlyData = React.useMemo(getMonthlyData, [yearData]);

  return (
    <div className="space-y-8">
      <Hero
        title="Activity Streaks"
        subtitle="Track your daily consistency and maintain your fitness journey"
        gradient={true}
        blur={true}
      />

      {/* Current Streaks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StreakCard
          title="Workout Streak"
          current={12}
          best={15}
          icon={<Flame />}
          color="primary"
        />
        <StreakCard
          title="Nutrition Goals"
          current={8}
          best={10}
          icon={<Target />}
          color="emerald"
        />
        <StreakCard
          title="Challenge Streak"
          current={5}
          best={7}
          icon={<Trophy />}
          color="amber"
        />
      </div>

      {/* Activity Calendar */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold">Activity Calendar</h2>
            <div className="bg-dark-200 rounded-lg px-3 py-1">
              <span className="font-medium">{currentYear}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Less</span>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={`w-3 h-3 rounded-sm ${
                    level === 0
                      ? 'bg-dark-200'
                      : `bg-primary-${level * 200 + 300}`
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-400">More</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {monthlyData.map((month, monthIndex) => (
            <div key={monthIndex} className="space-y-2">
              <h3 className="text-sm font-medium text-gray-400">{month.month}</h3>
              <div className="grid grid-cols-7 gap-1">
                {month.days.map((day, dayIndex) => (
                  <motion.div
                    key={dayIndex}
                    whileHover={{ scale: 1.2 }}
                    className={`aspect-square rounded-sm ${
                      day.isLoginDay
                        ? 'bg-primary-500'
                        : day.level === 0
                          ? 'bg-dark-200'
                          : `bg-primary-${day.level * 200 + 300}`
                    } cursor-pointer group relative`}
                  >
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                      <div className="bg-dark-100 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                        {day.date.toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                        {day.activities.length > 0 && (
                          <div className="mt-1">
                            {day.activities.map((activity, i) => (
                              <div key={i}>{activity}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements and Milestones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="card">
          <h2 className="text-xl font-bold mb-6">Recent Achievements</h2>
          <div className="space-y-4">
            <Achievement
              icon={<Flame />}
              title="7-Day Streak"
              description="Completed workouts for 7 consecutive days"
              date="2 days ago"
            />
            <Achievement
              icon={<Target />}
              title="Nutrition Master"
              description="Met nutrition goals for 5 days straight"
              date="Yesterday"
            />
            <Achievement
              icon={<Trophy />}
              title="Challenge Champion"
              description="Completed 3 weekly challenges in a row"
              date="Today"
            />
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-6">Upcoming Milestones</h2>
          <div className="space-y-4">
            <Milestone
              icon={<TrendingUp />}
              title="10-Day Streak"
              progress={8}
              total={10}
            />
            <Milestone
              icon={<Award />}
              title="Perfect Week"
              progress={5}
              total={7}
            />
            <Milestone
              icon={<Calendar />}
              title="Monthly Challenge"
              progress={18}
              total={30}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

interface StreakCardProps {
  title: string;
  current: number;
  best: number;
  icon: React.ReactNode;
  color: string;
}

const StreakCard: React.FC<StreakCardProps> = ({ title, current, best, icon, color }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="card"
  >
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 bg-${color}-500 bg-opacity-20 rounded-lg flex items-center justify-center`}>
        {React.cloneElement(icon as React.ReactElement, { className: `w-6 h-6 text-${color}-500` })}
      </div>
      <div>
        <h3 className="text-lg font-medium">{title}</h3>
        <div className="flex items-baseline gap-2">
          <span className={`text-2xl font-bold text-${color}-500`}>{current} days</span>
          <span className="text-sm text-gray-400">Best: {best}</span>
        </div>
      </div>
    </div>
  </motion.div>
);

interface AchievementProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  date: string;
}

const Achievement: React.FC<AchievementProps> = ({ icon, title, description, date }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="flex items-start gap-4 p-4 rounded-lg hover:bg-dark-200 transition-colors"
  >
    <div className="w-10 h-10 bg-primary-500 bg-opacity-20 rounded-lg flex items-center justify-center flex-shrink-0">
      {React.cloneElement(icon as React.ReactElement, { className: 'w-5 h-5 text-primary-500' })}
    </div>
    <div>
      <div className="flex items-center justify-between">
        <h4 className="font-medium">{title}</h4>
        <span className="text-sm text-gray-400">{date}</span>
      </div>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  </motion.div>
);

interface MilestoneProps {
  icon: React.ReactNode;
  title: string;
  progress: number;
  total: number;
}

const Milestone: React.FC<MilestoneProps> = ({ icon, title, progress, total }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="p-4 rounded-lg hover:bg-dark-200 transition-colors"
  >
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-3">
        {React.cloneElement(icon as React.ReactElement, { className: 'w-5 h-5 text-primary-500' })}
        <h4 className="font-medium">{title}</h4>
      </div>
      <span className="text-sm text-gray-400">{progress}/{total}</span>
    </div>
    <div className="w-full bg-dark-200 rounded-full h-2">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${(progress / total) * 100}%` }}
        className="bg-primary-500 h-2 rounded-full"
        transition={{ duration: 1 }}
      />
    </div>
  </motion.div>
);

export default Streaks;