import React from 'react';
import { X, Trophy, Star, User } from 'lucide-react';

interface ProfileModalProps {
  totalLevelsCompleted: number;
  highScore: number;
  playerAvatar: string;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  totalLevelsCompleted,
  highScore,
  playerAvatar,
  onClose,
}) => {
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-96 relative text-center">
        <button
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
          onClick={onClose}
        >
          <X size={24} />
        </button>
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Player Profile</h2>

        <div className="mb-6">
          <div className="text-6xl mb-4">{playerAvatar}</div>
          <p className="text-xl font-semibold text-gray-700">Your Avatar</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-100 p-4 rounded-lg shadow-sm flex flex-col items-center">
            <Trophy size={32} className="text-blue-600 mb-2" />
            <p className="text-lg font-medium text-gray-800">Levels Completed</p>
            <p className="text-2xl font-bold text-blue-800">{totalLevelsCompleted}</p>
          </div>
          <div className="bg-green-100 p-4 rounded-lg shadow-sm flex flex-col items-center">
            <Star size={32} className="text-green-600 mb-2" />
            <p className="text-lg font-medium text-gray-800">High Score</p>
            <p className="text-2xl font-bold text-green-800">{highScore}</p>
          </div>
        </div>

        <button
          className="w-full bg-red-500 hover:bg-red-700 text-white font-bold py-3 rounded-full mt-6 transition duration-300"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};
