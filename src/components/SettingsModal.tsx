import React from 'react';
import { X } from 'lucide-react';
import { PLAYER_AVATARS } from '../App'; // Import PLAYER_AVATARS

interface SettingsModalProps {
  selectedTheme: string;
  setSelectedTheme: (theme: string) => void;
  playerAvatar: string;
  setPlayerAvatar: (avatar: string) => void;
  onClose: () => void;
  themes: {
    [key: string]: {
      name: string;
      unlockCondition: number;
      background: string;
      buttonClass: string;
      price: number;
    };
  };
  playerAvatars: string[];
  totalLevelsCompleted: number; // New prop for unlock condition
  seasonalBackground: string | null; // New prop for seasonal background
  setSeasonalBackground: (bg: string | null) => void; // New prop to set seasonal background
  coins: number; // New prop for coins
  unlockedThemes: string[]; // New prop for unlocked themes
  onThemePurchase: (themeKey: string) => void; // New prop for theme purchase
  isThemeUnlocked: (themeKey: string) => boolean; // New prop to check if theme is unlocked
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  selectedTheme,
  setSelectedTheme,
  playerAvatar,
  setPlayerAvatar,
  onClose,
  themes,
  playerAvatars,
  totalLevelsCompleted,
  seasonalBackground,
  setSeasonalBackground,
  coins,
  unlockedThemes,
  onThemePurchase,
  isThemeUnlocked,
}) => {
  const handleThemeChange = (themeKey: string) => {
    if (isThemeUnlocked(themeKey)) {
      setSelectedTheme(themeKey);
    }
  };

  const handleSeasonalBackgroundChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setSeasonalBackground(value === "none" ? null : value);
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-xl shadow-lg relative w-96">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-600 hover:text-gray-900">
          <X size={24} />
        </button>
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Settings</h2>

        {/* Theme Selection */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-700 mb-3">Game Theme</h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(themes).map(([key, theme]) => {
              const isUnlocked = isThemeUnlocked(key);
              const canUnlock = coins >= theme.price;
              return (
                <div key={key} className="flex flex-col">
                  <button
                    onClick={() => handleThemeChange(key)}
                    className={`p-3 rounded-lg text-center font-medium transition-all duration-200
                                ${selectedTheme === key
                                  ? 'bg-blue-600 text-white shadow-md'
                                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}
                                ${!isUnlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={!isUnlocked}
                  >
                    {theme.name}
                  </button>
                  {!isUnlocked && (
                    <button
                      onClick={() => onThemePurchase(key)}
                      className={`mt-1 p-2 rounded-md text-sm font-medium transition-all duration-200
                                  ${canUnlock
                                    ? 'bg-green-500 text-white hover:bg-green-600'
                                    : 'bg-red-500 text-white cursor-not-allowed'}`}
                      disabled={!canUnlock}
                    >
                      {canUnlock ? `Buy for ${theme.price} coins` : `Need ${theme.price} coins`}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Player Avatar Selection */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-700 mb-3">Player Avatar</h3>
          <div className="grid grid-cols-6 gap-2">
            {playerAvatars.map((avatar, index) => (
              <button
                key={index}
                onClick={() => setPlayerAvatar(avatar)}
                className={`w-10 h-10 flex items-center justify-center text-2xl rounded-full transition-all duration-200
                            ${playerAvatar === avatar
                              ? 'bg-blue-500 ring-2 ring-blue-700 scale-110'
                              : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                {avatar}
              </button>
            ))}
          </div>
        </div>

        {/* Seasonal Background Selection */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-700 mb-3">Seasonal Background</h3>
          <select
            value={seasonalBackground || "none"}
            onChange={handleSeasonalBackgroundChange}
            className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-800"
          >
            <option value="none">None</option>
            <option value={themes.ramadan.background}>Ramadan</option>
            <option value={themes.eid.background}>Eid</option>
            <option value={themes.christmas.background}>Christmas</option>
          </select>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition duration-300"
        >
          Close
        </button>
      </div>
    </div>
  );
};
