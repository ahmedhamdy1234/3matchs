import React from 'react';

interface ScoreBoardProps {
  score: number;
  currentLevelId: number;
  goalScore: number;
  movesLeft: number; // New prop for moves left
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({ score, currentLevelId, goalScore, movesLeft }) => {
  const progressPercentage = Math.min(100, (score / goalScore) * 100);

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-4">
      <h2 className="text-lg font-semibold text-gray-700">Score: {score}</h2>
      <h2 className="text-lg font-semibold text-gray-700">Level: {currentLevelId}</h2>
      <h2 className="text-lg font-semibold text-gray-700">Moves Left: {movesLeft}</h2> {/* Display moves left */}
      <div className="mt-2">
        <p className="text-sm text-gray-600">Progress to next level: {score}/{goalScore}</p>
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};
