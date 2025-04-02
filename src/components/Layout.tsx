import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Dumbbell, 
  Home, 
  Trophy, 
  Users, 
  User,
  LogOut,
  Menu,
  X,
  Utensils,
  LineChart,
  Flame,
  Zap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ExpandableTabs } from './ui/expandable-tabs';
import { motion } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navigationTabs = [
    { title: "Dashboard", icon: Home },
    { title: "Workout", icon: Dumbbell },
    { title: "Workout Tracker", icon: LineChart },
    { type: "separator" as const },
    { title: "Nutrition", icon: Utensils },
    { title: "Streaks", icon: Flame },
    { type: "separator" as const },
    { title: "Challenges", icon: Trophy },
    { title: "Community", icon: Users },
    { title: "Profile", icon: User },
  ];

  const handleTabChange = (index: number | null) => {
    if (index !== null) {
      const tab = navigationTabs[index];
      if (tab && 'title' in tab) {
        navigate(`/${tab.title.toLowerCase().replace(/\s+/g, '-')}`);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-dark-100/95 backdrop-blur-sm shadow-lg' : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Left Section: Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10">
                <motion.div
                  className="absolute inset-0 bg-primary-500 rounded-lg opacity-20 group-hover:opacity-30 transition-opacity"
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-primary-500 transform -rotate-12" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-primary-600">
                  FITTRON
                </span>
                <span className="text-[10px] text-gray-400 tracking-[0.2em] -mt-1">
                  AI FITNESS
                </span>
              </div>
            </Link>

            {/* Center Section: Navigation Tabs */}
            <div className="hidden md:block">
              <ExpandableTabs 
                tabs={navigationTabs}
                onChange={handleTabChange}
                className="border-gray-800/50 hover:border-gray-700/50 transition-colors"
                activeClassName="text-primary-500 bg-primary-500/10"
                hoverClassName="hover:bg-gray-800/30"
              />
            </div>
            
            {/* Right Section: Logout and Mobile Menu */}
            <div className="flex items-center gap-4">
              {/* Desktop Logout */}
              <button 
                onClick={handleLogout}
                className="hidden md:flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation - Right Side Panel */}
        <motion.div
          className={`md:hidden fixed top-0 right-0 h-full w-64 bg-dark-100/95 backdrop-blur-sm transform transition-all duration-300 ease-in-out z-50 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
          initial={{ x: '100%' }}
          animate={{ x: isMenuOpen ? 0 : '100%' }}
          transition={{ type: 'tween', duration: 0.3 }}
        >
          <div className="flex flex-col h-full">
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <span className="font-semibold text-white">Menu</span>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Mobile Navigation Links */}
            <div className="flex-1 py-4 space-y-1 overflow-y-auto">
              <MobileNavLink to="/dashboard" icon={<Home />} text="Dashboard" onClick={() => setIsMenuOpen(false)} />
              <MobileNavLink to="/workout" icon={<Dumbbell />} text="Workout" onClick={() => setIsMenuOpen(false)} />
              <MobileNavLink to="/workout-tracker" icon={<LineChart />} text="Workout Tracker" onClick={() => setIsMenuOpen(false)} />
              <MobileNavLink to="/nutrition" icon={<Utensils />} text="Nutrition" onClick={() => setIsMenuOpen(false)} />
              <MobileNavLink to="/streaks" icon={<Flame />} text="Streaks" onClick={() => setIsMenuOpen(false)} />
              <MobileNavLink to="/challenges" icon={<Trophy />} text="Challenges" onClick={() => setIsMenuOpen(false)} />
              <MobileNavLink to="/community" icon={<Users />} text="Community" onClick={() => setIsMenuOpen(false)} />
              <MobileNavLink to="/profile" icon={<User />} text="Profile" onClick={() => setIsMenuOpen(false)} />
            </div>

            {/* Mobile Logout */}
            <button 
              onClick={() => {
                handleLogout();
                setIsMenuOpen(false);
              }}
              className="p-4 flex items-center gap-2 text-gray-400 hover:text-white transition-colors border-t border-gray-800"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </motion.div>

        {/* Overlay for mobile menu */}
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm md:hidden z-40"
            onClick={() => setIsMenuOpen(false)}
          />
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1 container mx-auto pt-20 p-8">
        {children}
      </main>
    </div>
  );
};

interface MobileNavLinkProps {
  to: string;
  icon: React.ReactNode;
  text: string;
  onClick?: () => void;
}

const MobileNavLink: React.FC<MobileNavLinkProps> = ({ to, icon, text, onClick }) => {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors"
      onClick={onClick}
    >
      <span className="w-5 h-5">{icon}</span>
      <span>{text}</span>
    </Link>
  );
};

export default Layout;