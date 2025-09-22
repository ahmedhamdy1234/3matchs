import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

interface SquareProps {
  color: string;
  onClick: () => void;
  isSelected: boolean;
  variants: any;
  emojiMap: { [key: string]: string }; // New prop for dynamic emojis
  isPowerUpActive: boolean; // New prop to indicate if a power-up is active
  isHinted: boolean; // New prop for hint
  hasIce: boolean; // New prop for ice
}

export const Square: React.FC<SquareProps> = ({ color, onClick, isSelected, variants, emojiMap, isPowerUpActive, isHinted, hasIce, animate: parentAnimateControls }) => {
  const hintControls = useAnimation();

  useEffect(() => {
    if (isHinted) {
      hintControls.start({
        scale: [1, 1.2, 1],
        borderColor: ["#FFD700", "#FFA500", "#FFD700"], // Gold to Orange pulse
        transition: {
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut"
        }
      });
    } else {
      hintControls.stop();
      // Reset to default state, ensuring no lingering hint styles
      hintControls.set({ scale: 1, borderColor: 'transparent' });
    }
  }, [isHinted, hintControls]);

  const selectedStyle = isSelected ? 'border-4 border-blue-500' : '';
  const powerUpActiveStyle = isPowerUpActive ? 'cursor-crosshair' : ''; // Change cursor when power-up is active
  const iceStyle = hasIce ? 'relative before:content-[""] before:absolute before:inset-0 before:bg-blue-200 before:bg-opacity-50 before:rounded-md before:border-2 before:border-blue-400' : ''; // Ice overlay

  const emoji = emojiMap[color] || '❓'; // Use the passed emojiMap

  return (
    <motion.button
      className={`w-12 h-12 rounded-md ${selectedStyle} flex items-center justify-center text-2xl ${powerUpActiveStyle} ${iceStyle}`}
      onClick={onClick}
      disabled={!color && !isPowerUpActive} // Allow clicking empty squares if a power-up is active (e.g., bomb)
      variants={variants}
      // Prioritize hint animation if active, otherwise use parent controls
      animate={isHinted ? hintControls : parentAnimateControls}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      style={isHinted ? { borderWidth: '4px', borderStyle: 'solid' } : {}} // Ensure border is visible for hint
    >
      {color ? (
        <span>{emoji}</span>
      ) : null}
    </motion.button>
  );
};
