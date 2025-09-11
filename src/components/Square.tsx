import React from 'react';
import { motion } from 'framer-motion';

interface SquareProps {
  color: string;
  onClick: () => void;
  isSelected: boolean;
  variants: any;
  emojiMap: { [key: string]: string }; // New prop for dynamic emojis
  isPowerUpActive: boolean; // New prop to indicate if a power-up is active
}

export const Square: React.FC<SquareProps> = ({ color, onClick, isSelected, variants, emojiMap, isPowerUpActive }) => {
  const selectedStyle = isSelected ? 'border-4 border-blue-500' : '';
  const powerUpActiveStyle = isPowerUpActive ? 'cursor-crosshair' : ''; // Change cursor when power-up is active

  const emoji = emojiMap[color] || '❓'; // Use the passed emojiMap

  return (
    <motion.button
      className={`w-12 h-12 rounded-md ${selectedStyle} flex items-center justify-center text-2xl ${powerUpActiveStyle}`}
      onClick={onClick}
      disabled={!color && !isPowerUpActive} // Allow clicking empty squares if a power-up is active (e.g., bomb)
      variants={variants}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      {color ? (
        <span>{emoji}</span>
      ) : null}
    </motion.button>
  );
};
