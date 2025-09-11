import React from 'react';
import { Hammer, Bomb, Palette } from 'lucide-react';

export enum PowerUpType {
  Hammer = 'Hammer',
  Bomb = 'Bomb',
  ColorSwap = 'ColorSwap',
}

interface PowerUpButtonsProps {
  inventory: { [key in PowerUpType]: number };
  activePowerUp: PowerUpType | null;
  setActivePowerUp: (type: PowerUpType | null) => void;
  onPurchaseClick?: (type: PowerUpType) => void; // Optional purchase click handler
}

export const PowerUpButtons: React.FC<PowerUpButtonsProps> = ({ inventory, activePowerUp, setActivePowerUp, onPurchaseClick }) => {
  const powerUps = [
    { type: PowerUpType.Hammer, icon: <Hammer size={20} />, label: 'Hammer' },
    { type: PowerUpType.Bomb, icon: <Bomb size={20} />, label: 'Bomb' },
    { type: PowerUpType.ColorSwap, icon: <Palette size={20} />, label: 'Color Swap' },
  ];

  const handlePowerUpClick = (type: PowerUpType) => {
    if (inventory[type] > 0) {
      setActivePowerUp(activePowerUp === type ? null : type); // Toggle active power-up
    } else {
      onPurchaseClick && onPurchaseClick(type); // Trigger purchase if available
    }
  };

  return (
    <div className="flex gap-4">
      {powerUps.map((powerUp) => (
        <button
          key={powerUp.type}
          onClick={() => handlePowerUpClick(powerUp.type)}
          className={`flex items-center px-4 py-2 rounded-full shadow-md transition duration-300
            ${inventory[powerUp.type] > 0
              ? (activePowerUp === powerUp.type
                ? 'bg-yellow-400 text-gray-800 border-2 border-yellow-600'
                : 'bg-blue-500 hover:bg-blue-700 text-white')
              : 'bg-gray-400 text-gray-600 cursor-not-allowed'
            }`}
          disabled={inventory[powerUp.type] === 0 && !onPurchaseClick}
        >
          {powerUp.icon}
          <span className="ml-2">{powerUp.label} ({inventory[powerUp.type]})</span>
        </button>
      ))}
    </div>
  );
};
