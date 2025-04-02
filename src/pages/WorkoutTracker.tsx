import React, { useState } from 'react';
import { motion } from 'framer-motion';

const WorkoutTracker: React.FC = () => {
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);

  const exercises = [
    {
      id: 'pushup',
      name: 'Push-Up',
      description: 'A bodyweight exercise that primarily targets the chest, shoulders, and triceps.',
      videoUrl: 'https://youtu.be/x1k3PHidXBQ?si=lfzRnY9cAKmVKIvP',
      thumbnail: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?q=80&w=1000&auto=format&fit=crop',
    },
    {
      id: 'squat',
      name: 'Squats',
      description: 'A fundamental lower body exercise targeting quadriceps, hamstrings, and glutes. Keep chest up and core engaged for proper form.',
      videoUrl: 'https://youtu.be/Ul2idJKmpAc?si=NR-yEcjGyX_OF-Xk',
      thumbnail: 'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?q=80&w=1000&auto=format&fit=crop',
    },
    {
      id: 'plank',
      name: 'Plank',
      description: 'An isometric core exercise that strengthens the abdominals, back, and shoulders.',
      videoUrl: 'https://youtu.be/6VmeHbHGlxY?si=7pxFkxGz76pro1OB',
      thumbnail: 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?q=80&w=1000&auto=format&fit=crop',
    },
    {
      id: 'bicep-curl',
      name: 'Bicep Curl',
      description: 'An isolation exercise that targets and strengthens the biceps muscles.',
      videoUrl: 'https://youtu.be/5V6NULcBRgk?si=iWOPEbXwMYvwcrAM',
      thumbnail: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1000&auto=format&fit=crop',
    },
    {
      id: 'jumping-jacks',
      name: 'Jumping Jacks',
      description: 'A full-body cardio exercise that improves coordination and increases heart rate.',
      videoUrl: 'https://youtu.be/UM9FNF3gUFQ?si=zUZ9tBo5Ty6YJXnh',
      thumbnail: 'https://images.unsplash.com/photo-1517931524326-bdd55a541177?q=80&w=1000&auto=format&fit=crop',
    },
    {
      id: 'lunges',
      name: 'Lunges',
      description: 'A lower body exercise that develops leg strength, balance, and mobility.',
      videoUrl: 'https://youtu.be/RZKXLMxPF_I?si=sqc5Bdbc4k16cJvF',
      thumbnail: 'https://media.istockphoto.com/id/1036780614/photo/lunging-is-good-for-the-legs.webp?s=2048x2048&w=is&k=20&c=r63Xs-fbiQzpU6BKH_iVmYu7dIzFW2RTKf1mO7b9K2w=',
    },
  ];

  const [showLogForm, setShowLogForm] = useState(false);
  const [workoutLog, setWorkoutLog] = useState({
    exercise: '',
    sets: '',
    reps: '',
    notes: ''
  });
  const [workoutLogs, setWorkoutLogs] = useState<Array<{
    exercise: string;
    sets: string;
    reps: string;
    notes: string;
    date: string;
    timestamp: number;
  }>>(() => {
    const savedLogs = localStorage.getItem('workoutLogs');
    if (savedLogs) {
      const parsedLogs = JSON.parse(savedLogs);
      // Filter out logs older than 24 hours
      const currentTime = Date.now();
      const recentLogs = parsedLogs.filter(
        (log: any) => currentTime - log.timestamp < 24 * 60 * 60 * 1000
      );
      return recentLogs;
    }
    return [];
  });

  // Save logs to localStorage whenever they change
  React.useEffect(() => {
    localStorage.setItem('workoutLogs', JSON.stringify(workoutLogs));
  }, [workoutLogs]);

  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add the current workout log to the history with current date and timestamp
    const newLog = {
      ...workoutLog,
      date: new Date().toLocaleDateString(),
      timestamp: Date.now()
    };
    setWorkoutLogs([newLog, ...workoutLogs]);
    console.log('Workout logged:', newLog);
    setShowLogForm(false);
    setWorkoutLog({ exercise: '', sets: '', reps: '', notes: '' });
  };
  const handleDeleteWorkout = (index: number) => {
    if (window.confirm('Are you sure you want to delete this workout log?')) {
      const updatedLogs = [...workoutLogs];
      updatedLogs.splice(index, 1);
      setWorkoutLogs(updatedLogs);
    }
  };

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">Workout Tracker</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {exercises.map((exercise) => (
          <motion.div
            key={exercise.id}
            className="bg-gray-800 rounded-xl p-4 shadow-lg hover:shadow-xl transition duration-300"
            whileHover={{ scale: 1.05 }}
            onClick={() => setSelectedExercise(exercise.id)}
          >
            <a href={exercise.videoUrl} target="_blank" rel="noopener noreferrer">
              <img
                src={exercise.thumbnail}
                alt={exercise.name}
                className="w-full h-40 object-cover rounded-lg cursor-pointer"
              />
            </a>
            <h2 className="text-xl font-semibold mt-4">{exercise.name}</h2>
            {selectedExercise === exercise.id && (
              <motion.p
                className="mt-2 text-gray-300"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {exercise.description}
              </motion.p>
            )}
          </motion.div>
        ))}
      </div>

      <div className="flex justify-center mb-8">
        <button
          onClick={() => setShowLogForm(true)}
          className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300 flex items-center gap-2"
        >
          Log Your Workout
        </button>
      </div>

      {/* Workout History Section */}
      {workoutLogs.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Workout History</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Exercise</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Sets</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Reps</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Notes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {workoutLogs.map((log, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{log.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {exercises.find(e => e.id === log.exercise)?.name || log.exercise}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{log.sets}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{log.reps}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{log.notes}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <button
                        onClick={() => handleDeleteWorkout(index)}
                        className="text-red-500 hover:text-red-400 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showLogForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setShowLogForm(false)}
        >
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Log Your Workout</h2>
            <form onSubmit={handleLogSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Exercise</label>
                <select
                  value={workoutLog.exercise}
                  onChange={(e) => setWorkoutLog({ ...workoutLog, exercise: e.target.value })}
                  className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="">Select an exercise</option>
                  {exercises.map((exercise) => (
                    <option key={exercise.id} value={exercise.id}>
                      {exercise.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Sets</label>
                <input
                  type="number"
                  value={workoutLog.sets}
                  onChange={(e) => setWorkoutLog({ ...workoutLog, sets: e.target.value })}
                  className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Reps</label>
                <input
                  type="number"
                  value={workoutLog.reps}
                  onChange={(e) => setWorkoutLog({ ...workoutLog, reps: e.target.value })}
                  className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
                <textarea
                  value={workoutLog.notes}
                  onChange={(e) => setWorkoutLog({ ...workoutLog, notes: e.target.value })}
                  className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  rows={3}
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowLogForm(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default WorkoutTracker;
