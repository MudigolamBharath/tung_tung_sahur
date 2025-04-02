import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dumbbell, 
  Bot,
  Users, 
  Trophy,
  ArrowRight,
  Utensils,
  Sparkles,
  LineChart,
  Target,
  Crown
} from 'lucide-react';
import { WorldMap } from '../components/ui/world-map';

const Landing = () => {
  const navigate = useNavigate();
  const [showIntroText, setShowIntroText] = useState(true);
  const [show3DModel, setShow3DModel] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    // Simulate resource loading
    const loadResources = async () => {
      for (let i = 0; i <= 100; i += 20) {
        setLoadingProgress(i);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      setIsLoading(false);
      // Start the intro sequence after loading
      setTimeout(() => {
        setShowIntroText(false);
        setTimeout(() => setShow3DModel(true), 800);
      }, 4000);
    };

    loadResources();
    return () => {};
  }, []);

  const handleGetStarted = () => {
    navigate('/signup');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Dumbbell className="w-16 h-16 text-primary-500 mx-auto" />
          </motion.div>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${loadingProgress}%` }}
            className="w-64 h-1 bg-primary-500 rounded-full mx-auto mb-4"
          />
          <p className="text-gray-400 text-sm">Loading your fitness experience... {loadingProgress}%</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-2 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex-1"></div>
          <div className="space-x-4">
            <Link to="/login" className="btn-outline">
              Login
            </Link>
            <button onClick={handleGetStarted} className="btn-primary">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative h-screen flex items-center justify-center overflow-hidden">
        <AnimatePresence>
          {showIntroText && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center bg-dark z-20"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              transition={{ duration: 0.8 }}
            >
              <motion.p 
                className="text-3xl md:text-5xl text-white font-bold mb-8 max-w-4xl mx-auto text-center px-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Experience the future of fitness with AI-powered workouts and personalized training
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {show3DModel && (
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2 }}
            >
              <spline-viewer
                loading-anim-type="none"
                url="https://prod.spline.design/05EmWh4DT1IVN9RM/scene.splinecode"
                className="w-full h-full"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Features Grid */}
      <section className="py-16 bg-dark-100">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 text-primary-500 mb-4"
            >
              <Bot className="w-5 h-5" />
              <span className="font-medium">Powered by AI</span>
            </motion.div>
            <h2 className="text-4xl font-bold mb-4">Everything You Need</h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Powered by cutting-edge AI technology and a supportive global community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Bot />}
              title="AI-Powered Analysis"
              description="Get real-time feedback on your form and technique with our advanced AI technology."
            />
            <FeatureCard 
              icon={<Utensils />}
              title="Nutrition Tracking"
              description="Track your calories and macros with smart meal planning and recommendations."
            />
            <FeatureCard 
              icon={<Sparkles />}
              title="Smart Corrections"
              description="Receive instant form corrections and personalized tips during workouts."
            />
            <FeatureCard 
              icon={<LineChart />}
              title="Progress Prediction"
              description="AI-driven insights predict your fitness progress and suggest optimal training adjustments."
            />
            <FeatureCard 
              icon={<Target />}
              title="Adaptive Training"
              description="Workouts that automatically adjust to your performance and recovery needs."
            />
            <FeatureCard 
              icon={<Crown />}
              title="Leaderboard & Ranks"
              description="Compete globally, earn ranks, and climb the leaderboard with your fitness achievements."
            />
          </div>
        </div>
      </section>

      {/* Global Connectivity Section */}
      <section className="h-screen bg-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-dark">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
            className="w-full h-full"
          >
            <WorldMap
              className="w-full h-full"
              dots={[
                {
                  start: { lat: 40.7128, lng: -74.0060 }, // New York
                  end: { lat: 51.5074, lng: -0.1278 }, // London
                },
                {
                  start: { lat: 35.6762, lng: 139.6503 }, // Tokyo
                  end: { lat: -33.8688, lng: 151.2093 }, // Sydney
                },
                {
                  start: { lat: 51.5074, lng: -0.1278 }, // London
                  end: { lat: 28.6139, lng: 77.2090 }, // New Delhi
                },
                {
                  start: { lat: 1.3521, lng: 103.8198 }, // Singapore
                  end: { lat: -33.8688, lng: 151.2093 }, // Sydney
                },
                {
                  start: { lat: 40.7128, lng: -74.0060 }, // New York
                  end: { lat: -23.5505, lng: -46.6333 }, // São Paulo
                },
              ]}
            />
          </motion.div>
        </div>
        <div className="relative z-10 container mx-auto px-6 h-screen flex items-center justify-center">
          <div className="text-center max-w-3xl mx-auto">
            <motion.h2 
              className="text-4xl md:text-5xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              Join Our Global Fitness Community
            </motion.h2>
            <motion.p 
              className="text-lg text-gray-400"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Join fitness enthusiasts from around the world. Train together, share achievements,
              and be part of a global community dedicated to health and wellness.
            </motion.p>
          </div>
        </div>
      </section>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <motion.div 
    whileHover={{ scale: 1.05 }}
    className="card"
  >
    <div className="w-12 h-12 bg-primary-500 bg-opacity-20 rounded-lg flex items-center justify-center mb-4">
      {React.cloneElement(icon as React.ReactElement, { className: 'w-6 h-6 text-primary-500' })}
    </div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-gray-400">{description}</p>
  </motion.div>
);

export default Landing;