import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CalorieCelebrationProps {
  isVisible: boolean;
  onClose: () => void;
  message: string;
}

const celebrationConfig = {
  popup: {
    displayDuration: 5000,
    position: "center",
    style: {
      backgroundColor: "#4CAF50",
      borderRadius: "10px",
      padding: "20px",
      boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
      maxWidth: "300px"
    }
  },
  confetti: {
    enabled: true,
    duration: 2500,
    pieces: 100,
    colors: ["#FFC107", "#4CAF50", "#2196F3", "#FF5722"]
  },
  sound: {
    enabled: true,
    file: "/celebration.mp3",
    volume: 0.5
  }
};

const congratulatoryMessages = [
  "Congratulations! You've reached your daily calorie goal! 🎉",
  "Goal achieved! Your dedication is paying off! 💪",
  "Amazing work! You've hit your calorie target today! 🏆",
  "Daily goal complete! Keep up the great work! ⭐",
  "You did it! Calorie goal accomplished! 🙌"
];

const ConfettiPiece: React.FC<{ color: string }> = ({ color }) => {
  const size = Math.random() * 10 + 5;
  const positionX = Math.random() * 100;
  const rotation = Math.random() * 360;
  const duration = (Math.random() * 3 + 2);

  return (
    <motion.div
      initial={{ 
        top: -20,
        left: `${positionX}%`,
        rotate: rotation,
        scale: 1
      }}
      animate={{
        top: '100vh',
        rotate: rotation + 360,
        scale: 0
      }}
      transition={{
        duration,
        ease: 'linear'
      }}
      style={{
        position: 'absolute',
        width: size,
        height: size,
        backgroundColor: color,
        borderRadius: '2px'
      }}
    />
  );
};

export const CalorieCelebration: React.FC<CalorieCelebrationProps> = ({
  isVisible,
  onClose,
  message
}) => {
  const [audio] = useState(new Audio(celebrationConfig.sound.file));

  useEffect(() => {
    if (isVisible && celebrationConfig.sound.enabled) {
      audio.volume = celebrationConfig.sound.volume;
      audio.play();
    }

    const timer = setTimeout(() => {
      onClose();
    }, celebrationConfig.popup.displayDuration);

    return () => {
      clearTimeout(timer);
      audio.pause();
      audio.currentTime = 0;
    };
  }, [isVisible, audio, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Confetti Container */}
          {celebrationConfig.confetti.enabled && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 9998
              }}
            >
              {Array.from({ length: celebrationConfig.confetti.pieces }).map((_, i) => (
                <ConfettiPiece
                  key={i}
                  color={celebrationConfig.confetti.colors[i % celebrationConfig.confetti.colors.length]}
                />
              ))}
            </div>
          )}

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            style={{
              position: 'fixed',
              zIndex: 10000,
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              ...celebrationConfig.popup.style,
              backgroundColor: celebrationConfig.popup.style.backgroundColor,
              color: 'white',
              textAlign: 'center'
            }}
          >
            <h3 className="text-xl font-bold mb-4">Goal Achieved!</h3>
            <p className="mb-6">{message}</p>
            <button
              onClick={onClose}
              className="bg-white text-green-500 font-bold py-2 px-4 rounded hover:bg-gray-100 transition-colors"
            >
              Awesome!
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};