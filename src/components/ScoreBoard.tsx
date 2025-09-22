import React from "react";
import { motion } from "framer-motion";

interface ScoreBoardProps {
  score: number;
  currentLevelId: number;
  goalScore: number;
  movesLeft: number;
  combo: number; // New prop for combo
  comboTimer: number; // New prop for combo timer
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  score,
  currentLevelId,
  goalScore,
  movesLeft,
  combo, // Destructure combo
  comboTimer, // Destructure comboTimer
}) => {
  const progress = Math.min(100, (score / goalScore) * 100);

  return (
    <div className="w-full bg-white p-4 rounded-lg shadow-md mb-6 text-gray-800">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-bold">Score: {score}</h2>
        <h3 className="text-xl font-semibold">Moves Left: {movesLeft}</h3>
      </div>
      <div className="flex justify-between items-center mb-4">
        <span className="text-lg">Goal: {goalScore}</span>
        <div className="w-2/3 bg-gray-200 rounded-full h-4">
          <motion.div
            className="bg-green-500 h-4 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          ></motion.div>
        </div>
      </div>
      {combo > 0 && (
        <motion.div
          className="text-center text-3xl font-bold text-yellow-600 mt-2"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
        >
          ⏩ x{combo} ({comboTimer}s)
        </motion.div>
      )}
    </div>
  );
};
