import React from 'react';
import { motion } from 'framer-motion';
import { 
  Utensils,
  Apple,
  Beef,
  Fish,
  Milk,
  Plus,
  ChevronRight,
  LineChart,
  User,
  Flame
} from 'lucide-react';
import ErrorBoundary from '../components/ErrorBoundary';
import { CalorieCelebration } from '../components/CalorieCelebration';

interface PersonalDetails {
  gender: string;
  height: number;
  currentWeight: number;
  targetWeight: number;
  bodyFatPercentage: number;
  workoutFrequency: number;
}

interface NutritionGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const BODY_FAT_RANGES = [
  {
    range: '5-8%',
    description: 'Competition Ready',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop',
    value: 6.5
  },
  {
    range: '9-12%',
    description: 'Very Lean',
    image: 'https://images.unsplash.com/photo-1577221084712-45b0445d2b00?q=80&w=1000&auto=format&fit=crop',
    value: 10.5
  },
  {
    range: '13-15%',
    description: 'Lean Athletic',
    image: 'https://images.unsplash.com/photo-1534367610401-9f5ed68180aa?q=80&w=1000&auto=format&fit=crop',
    value: 14
  },
  {
    range: '16-18%',
    description: 'Fit',
    image: 'https://images.unsplash.com/photo-1534438097545-a584f2c31b98?q=80&w=1000&auto=format&fit=crop',
    value: 17
  },
  {
    range: '19-23%',
    description: 'Average',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1000&auto=format&fit=crop',
    value: 21
  },
  {
    range: '24-28%',
    description: 'Above Average',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1000&auto=format&fit=crop',
    value: 26
  },
  {
    range: '29-33%',
    description: 'High',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1000&auto=format&fit=crop',
    value: 31
  },
  {
    range: '34-40%',
    description: 'Very High',
    image: 'https://images.unsplash.com/photo-1573879541250-58ae8b322b40?q=80&w=1000&auto=format&fit=crop',
    value: 37
  },
  {
    range: '40+%',
    description: 'Extremely High',
    image: 'https://images.unsplash.com/photo-1559963110-71b394e7494d?q=80&w=1000&auto=format&fit=crop',
    value: 43
  }
];
const handleBodyFatSelection = (value: number) => {
  const form = document.querySelector('input[name="bodyFat"]') as HTMLInputElement;
  if (form) {
    form.value = value.toString();
  }
};
interface Meal {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
}

const Nutrition = () => {
  const [showDetailsForm, setShowDetailsForm] = React.useState(true);
  const [personalDetails, setPersonalDetails] = React.useState<PersonalDetails | null>(null);
  const [nutritionGoals, setNutritionGoals] = React.useState<NutritionGoals | null>(null);
  const [calorieGoal, setCalorieGoal] = React.useState(2200);
  const [isEditingGoal, setIsEditingGoal] = React.useState(false);
  const [totalCalories, setTotalCalories] = React.useState(0);
  const [meals, setMeals] = React.useState<Array<Meal>>(() => {
    const savedMeals = localStorage.getItem('dailyMeals');
    if (savedMeals) {
      const { meals, date } = JSON.parse(savedMeals);
      const savedDate = new Date(date).toDateString();
      const today = new Date().toDateString();
      
      // Only return saved meals if they're from today
      if (savedDate === today) {
        let totalCals = 0;
        meals.forEach((meal: Meal) => {
          totalCals += meal.calories;
        });
        setTotalCalories(totalCals);
        return meals;
      }
    }
    return [];
  });
  const [showMealForm, setShowMealForm] = React.useState(false);
  const [selectedBodyFat, setSelectedBodyFat] = React.useState<number | null>(null);
  const [showCelebration, setShowCelebration] = React.useState(false);
  const [celebrationMessage, setCelebrationMessage] = React.useState('');
  const [lastCelebrationDate, setLastCelebrationDate] = React.useState<string | null>(null);

  const [newMeal, setNewMeal] = React.useState<Meal>({
    name: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    time: new Date().toLocaleTimeString()
  });

  // Save meals whenever they change
  React.useEffect(() => {
    const dailyMeals = {
      meals,
      date: new Date().toISOString()
    };
    localStorage.setItem('dailyMeals', JSON.stringify(dailyMeals));
  }, [meals]);

  const checkAndTriggerCelebration = (totalCals: number) => {
    const today = new Date().toDateString();
    if (nutritionGoals && totalCals >= nutritionGoals.calories && lastCelebrationDate !== today) {
      const messages = [
        "Congratulations! You've reached your daily calorie goal! 🎉",
        "Goal achieved! Your dedication is paying off! 💪",
        "Amazing work! You've hit your calorie target today! 🏆",
        "Daily goal complete! Keep up the great work! ⭐",
        "You did it! Calorie goal accomplished! 🙌"
      ];
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      setCelebrationMessage(randomMessage);
      setShowCelebration(true);
      setLastCelebrationDate(today);
    }
  };

  const handleDeleteMeal = (index: number) => {
    if (window.confirm('Are you sure you want to delete this meal?')) {
      const updatedMeals = [...meals];
      const deletedMeal = updatedMeals[index];
      const newTotalCalories = totalCalories - deletedMeal.calories;
      updatedMeals.splice(index, 1);
      setMeals(updatedMeals);
      setTotalCalories(newTotalCalories);
    }
  };

  const handleAddMeal = (e: React.FormEvent) => {
    e.preventDefault();
    const newTotalCalories = totalCalories + newMeal.calories;
    setMeals([...meals, newMeal]);
    setTotalCalories(newTotalCalories);
    setShowMealForm(false);
    checkAndTriggerCelebration(newTotalCalories);
    setNewMeal({
      name: '',
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      time: new Date().toLocaleTimeString()
    });
  };

  // Load saved data when component mounts
  React.useEffect(() => {
    const savedData = localStorage.getItem('nutritionData');
    if (savedData) {
      const { details, goals, lastUpdated } = JSON.parse(savedData);
      const lastUpdateDate = new Date(lastUpdated).toDateString();
      const today = new Date().toDateString();

      // Only load saved data if it's from the same day
      if (lastUpdateDate === today) {
        setPersonalDetails(details);
        setNutritionGoals(goals);
        setCalorieGoal(goals.calories);
        setShowDetailsForm(false);
        if (details.bodyFatPercentage) {
          setSelectedBodyFat(details.bodyFatPercentage);
        }
      }
    }
  }, []);

  // Save data whenever it changes
  React.useEffect(() => {
    if (personalDetails && nutritionGoals) {
      const dataToSave = {
        details: personalDetails,
        goals: nutritionGoals,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem('nutritionData', JSON.stringify(dataToSave));
    }
  }, [personalDetails, nutritionGoals]);

  // Clear saved data on logout (you'll need to call this when user logs out)
  const clearSavedData = () => {
    localStorage.removeItem('nutritionData');
  };
  const handleBodyFatSelection = (value: number) => {
    setSelectedBodyFat(value);
    const form = document.querySelector('input[name="bodyFat"]') as HTMLInputElement;
    if (form) {
      form.value = value.toString();
    }
  };
  const calculateNutritionGoals = (details: PersonalDetails): NutritionGoals => {
    // Calculate BMR using Mifflin-St Jeor Equation
    const bmr = details.gender === 'male'
      ? (10 * details.currentWeight) + (6.25 * details.height) - (5 * 25) + 5 // Assuming age 25 for now
      : (10 * details.currentWeight) + (6.25 * details.height) - (5 * 25) - 161;

    // Activity multiplier based on workout frequency
    let activityMultiplier = 1.2; // Sedentary
    if (details.workoutFrequency >= 1 && details.workoutFrequency <= 3) {
      activityMultiplier = 1.375; // Lightly active
    } else if (details.workoutFrequency >= 4 && details.workoutFrequency <= 5) {
      activityMultiplier = 1.55; // Moderately active
    } else if (details.workoutFrequency >= 6) {
      activityMultiplier = 1.725; // Very active
    }

    // Calculate TDEE (Total Daily Energy Expenditure)
    const tdee = bmr * activityMultiplier;

    // Determine weight goal and adjust calories accordingly
    const weightDiff = details.targetWeight - details.currentWeight;
    let dailyCalories = tdee;

    if (weightDiff < 0) {
      // Weight loss goal: create a 20% caloric deficit
      dailyCalories = tdee * 0.8;
    } else if (weightDiff > 0) {
      // Weight gain goal: create a 10% caloric surplus
      dailyCalories = tdee * 1.1;
    }

    // Round the final calorie value
    dailyCalories = Math.round(dailyCalories);

    // Macronutrient calculations
    const protein = Math.round(details.currentWeight * 2); // 2g per kg of body weight
    const fat = Math.round((dailyCalories * 0.25) / 9); // 25% of calories from fat
    const carbs = Math.round((dailyCalories - (protein * 4) - (fat * 9)) / 4); // Remaining calories from carbs

    return {
      calories: dailyCalories,
      protein,
      carbs,
      fat
    };
  };
  const handleDetailsSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const details: PersonalDetails = {
      gender: (form.querySelector('[name="gender"]') as HTMLSelectElement).value,
      height: Number((form.querySelector('[name="height"]') as HTMLInputElement).value),
      currentWeight: Number((form.querySelector('[name="currentWeight"]') as HTMLInputElement).value),
      targetWeight: Number((form.querySelector('[name="targetWeight"]') as HTMLInputElement).value),
      bodyFatPercentage: Number((form.querySelector('[name="bodyFat"]') as HTMLInputElement).value),
      workoutFrequency: Number((form.querySelector('[name="workoutFrequency"]') as HTMLInputElement).value),
    };
    setPersonalDetails(details);
    const goals = calculateNutritionGoals(details);
    setNutritionGoals(goals);
    setCalorieGoal(goals.calories);
    setShowDetailsForm(false);
  };

  if (showDetailsForm) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-dark-card rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <h2 className="text-2xl font-bold mb-6">Personal Details</h2>
          <form onSubmit={handleDetailsSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Gender</label>
                <select
                  name="gender"
                  required
                  className="w-full bg-dark-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Height (cm)</label>
                <input
                  type="number"
                  name="height"
                  required
                  min="100"
                  max="250"
                  className="w-full bg-dark-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Current Weight (kg)</label>
                <input
                  type="number"
                  name="currentWeight"
                  required
                  min="30"
                  max="300"
                  className="w-full bg-dark-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Target Weight (kg)</label>
                <input
                  type="number"
                  name="targetWeight"
                  required
                  min="30"
                  max="300"
                  className="w-full bg-dark-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Body Fat Percentage</label>
              <input
                type="hidden"
                name="bodyFat"
                required
              />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {BODY_FAT_RANGES.map((range) => (
                  <div 
                    key={range.range} 
                    className={`relative group cursor-pointer transform transition-all duration-200 ${selectedBodyFat === range.value ? 'ring-2 ring-primary-500 scale-105' : ''}`}
                    onClick={() => handleBodyFatSelection(range.value)}
                  >
                    <img
                      src={range.image}
                      alt={range.description}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <div className={`absolute inset-0 bg-black rounded-lg transition-opacity ${selectedBodyFat === range.value ? 'bg-opacity-70' : 'bg-opacity-50 opacity-0 group-hover:opacity-100'}`}>
                      <div className="absolute inset-0 flex items-center justify-center text-center">
                        <div>
                          <div className="font-bold text-white">{range.range}</div>
                          <div className="text-sm text-gray-200">{range.description}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">How many times do you workout per week?</label>
              <input
                type="number"
                name="workoutFrequency"
                required
                min="0"
                max="7"
                className="w-full bg-dark-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
            >
              Calculate My Nutrition Goals
            </button>
          </form>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-8">
      <CalorieCelebration
        isVisible={showCelebration}
        onClose={() => setShowCelebration(false)}
        message={celebrationMessage}
      />
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Nutrition Tracker</h1>
          <p className="text-gray-400">Track your daily nutrition and maintain a balanced diet.</p>
        </div>
        <button
          onClick={() => setShowDetailsForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <User className="w-5 h-5" />
          Update Details
        </button>
      </header>

      {/* Nutrition Goals */}
      {nutritionGoals && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-dark-card rounded-lg p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-2">
              <Flame className="w-5 h-5 text-primary-500" />
              <h3 className="font-bold">Calories</h3>
            </div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-bold text-primary-500">
                {totalCalories.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">
                / {nutritionGoals.calories.toLocaleString()}
              </div>
            </div>
            <div className="w-full bg-dark-200 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((totalCalories / nutritionGoals.calories) * 100, 100)}%` }}
                className={`h-2 rounded-full transition-colors ${totalCalories > nutritionGoals.calories ? 'bg-red-500' : 'bg-primary-500'}`}
              />
            </div>
            {totalCalories > nutritionGoals.calories && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-sm text-red-500">
                ⚠️ You've exceeded your daily calorie limit
              </motion.div>
            )}
          </div>

          <div className="bg-dark-card rounded-lg p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-2">
              <Beef className="w-5 h-5 text-red-500" />
              <h3 className="font-bold">Protein</h3>
            </div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-bold text-red-500">
                {(totalCalories * 0.3 / 4).toFixed(1)}
              </div>
              <div className="text-sm text-gray-400">
                / {nutritionGoals.protein.toLocaleString()}g
              </div>
            </div>
            <div className="w-full bg-dark-200 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(((totalCalories * 0.3 / 4) / nutritionGoals.protein) * 100, 100)}%` }}
                className="h-2 rounded-full bg-red-500"
              />
            </div>
          </div>

          <div className="bg-dark-card rounded-lg p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-2">
              <Apple className="w-5 h-5 text-yellow-500" />
              <h3 className="font-bold">Carbs</h3>
            </div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-bold text-yellow-500">
                {(totalCalories * 0.5 / 4).toFixed(1)}
              </div>
              <div className="text-sm text-gray-400">
                / {nutritionGoals.carbs.toLocaleString()}g
              </div>
            </div>
            <div className="w-full bg-dark-200 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(((totalCalories * 0.5 / 4) / nutritionGoals.carbs) * 100, 100)}%` }}
                className="h-2 rounded-full bg-yellow-500"
              />
            </div>
          </div>

          <div className="bg-dark-card rounded-lg p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-2">
              <Fish className="w-5 h-5 text-blue-500" />
              <h3 className="font-bold">Fat</h3>
            </div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-bold text-blue-500">
                {(totalCalories * 0.2 / 9).toFixed(1)}
              </div>
              <div className="text-sm text-gray-400">
                / {nutritionGoals.fat.toLocaleString()}g
              </div>
            </div>
            <div className="w-full bg-dark-200 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(((totalCalories * 0.2 / 9) / nutritionGoals.fat) * 100, 100)}%` }}
                className="h-2 rounded-full bg-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Add Meal Form */}
      <div className="bg-dark-card rounded-lg p-6 border border-gray-800">
        <h2 className="text-xl font-bold mb-4">Today's Meals</h2>
        <div className="flex items-center justify-between mb-6">
          <div className="text-gray-400">
            <span className="text-2xl font-bold text-primary-500">{totalCalories}</span>
            <span className="ml-2">/ {calorieGoal} kcal</span>
          </div>
          <button 
            onClick={() => setShowMealForm(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Meal
          </button>
        </div>

        {/* Meals List */}
        <div className="space-y-4">
          {meals.map((meal, index) => (
            <div key={index} className="bg-dark-lighter p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-white">{meal.name}</h3>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-400">{meal.time}</span>
                  <button
                    onClick={() => handleDeleteMeal(index)}
                    className="text-red-500 hover:text-red-400 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Calories</span>
                  <p className="font-medium text-primary-500">{meal.calories}</p>
                </div>
                <div>
                  <span className="text-gray-400">Protein</span>
                  <p className="font-medium text-red-500">{meal.protein}g</p>
                </div>
                <div>
                  <span className="text-gray-400">Carbs</span>
                  <p className="font-medium text-yellow-500">{meal.carbs}g</p>
                </div>
                <div>
                  <span className="text-gray-400">Fat</span>
                  <p className="font-medium text-blue-500">{meal.fat}g</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Meal Modal */}
      {showMealForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-dark-card rounded-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">Add Meal</h2>
            <form onSubmit={handleAddMeal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={newMeal.name}
                  onChange={(e) => setNewMeal({ ...newMeal, name: e.target.value })}
                  placeholder="Enter meal name"
                  className="w-full bg-dark-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Calories</label>
                <input
                  type="number"
                  value={newMeal.calories || ''}
                  onChange={(e) => setNewMeal({ ...newMeal, calories: Number(e.target.value) })}
                  placeholder="Enter calories"
                  className="w-full bg-dark-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  required
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Protein (g)</label>
                <input
                  type="number"
                  value={newMeal.protein || ''}
                  onChange={(e) => setNewMeal({ ...newMeal, protein: Number(e.target.value) })}
                  placeholder="Enter protein in grams"
                  className="w-full bg-dark-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  required
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Carbs (g)</label>
                <input
                  type="number"
                  value={newMeal.carbs || ''}
                  onChange={(e) => setNewMeal({ ...newMeal, carbs: Number(e.target.value) })}
                  placeholder="Enter carbs in grams"
                  className="w-full bg-dark-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  required
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fat (g)</label>
                <input
                  type="number"
                  value={newMeal.fat || ''}
                  onChange={(e) => setNewMeal({ ...newMeal, fat: Number(e.target.value) })}
                  placeholder="Enter fat in grams"
                  className="w-full bg-dark-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  required
                  min="0"
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                >
                  Add Meal
                </button>
                <button
                  type="button"
                  onClick={() => setShowMealForm(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Nutrition;