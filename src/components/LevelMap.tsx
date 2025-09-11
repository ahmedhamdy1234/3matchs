import React from 'react';
import { Level, LEVEL_DATA } from '../levels';
import { Lock, Play } from 'lucide-react';
import { motion } from 'framer-motion';

interface LevelMapProps {
  unlockedLevels: number[];
  onLevelSelect: (levelId: number) => void;
  onBackToMenu: () => void;
  currentLevelId: number | null;
}

export const LevelMap: React.FC<LevelMapProps> = ({ unlockedLevels, onLevelSelect, onBackToMenu, currentLevelId }) => {
  const isLevelUnlocked = (levelId: number) => unlockedLevels.includes(levelId);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-200 to-teal-100 p-4">
      <h1 className="text-5xl font-extrabold text-gray-800 mb-8 drop-shadow-lg">
        <span className="bg-gradient-to-r from-teal-500 to-green-700 bg-clip-text text-transparent">
          World Map
        </span>
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-4xl w-full">
        {LEVEL_DATA.map((level) => (
          <motion.div
            key={level.id}
            className={`relative p-4 rounded-xl shadow-lg text-center cursor-pointer 
                        ${isLevelUnlocked(level.id) ? 'bg-white hover:shadow-xl transition duration-300' : 'bg-gray-300 opacity-70 cursor-not-allowed'}`}
            whileHover={isLevelUnlocked(level.id) ? { scale: 1.05 } : {}}
            whileTap={isLevelUnlocked(level.id) ? { scale: 0.95 } : {}}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: level.id * 0.1 }}
            onClick={() => isLevelUnlocked(level.id) && onLevelSelect(level.id)}
          >
            {!isLevelUnlocked(level.id) && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-xl">
                <Lock size={48} className="text-white" />
              </div>
            )}
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{level.name}</h2>
            <p className="text-sm text-gray-600 mb-1">Grid: {level.width}x{level.height}</p>
            <p className="text-sm text-gray-600 mb-1">Goal: {level.goalScore} points</p>
            <p className="text-sm text-gray-600 mb-2 capitalize">Difficulty: {level.difficulty}</p>
            {isLevelUnlocked(level.id) && (
              <Play size={24} className="text-green-600 mx-auto mt-2" fill="currentColor" />
            )}
            {currentLevelId === level.id && isLevelUnlocked(level.id) && (
              <span className="absolute top-2 right-2 text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                CURRENT
              </span>
            )}
          </motion.div>
        ))}
      </div>

      <button
        className="mt-10 bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-300 flex items-center"
        onClick={onBackToMenu}
      >
        Back to Main Menu
      </button>
    </div>
  );
};
