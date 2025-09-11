import React from 'react';
import { motion } from 'framer-motion';
import { X, Play, ArrowRight } from 'lucide-react';

interface GameOverModalProps {
  onClose: () => void;
  onExit: () => void;
  onAd: () => void;
  currentLevel: any;
  score: number;
  movesLeft: number;
  isLevelCompleted: boolean;
  addWinCoins: () => void;
}

const ModalVariants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeInOut",
    },
  },
  exit: {
    opacity: 0,
    scale: 0.5,
    transition: {
      duration: 0.2,
      ease: "easeInOut",
    },
  },
};

export const GameOverModal: React.FC<GameOverModalProps> = ({
  onClose,
  onExit,
  onAd,
  currentLevel,
  score,
  movesLeft,
  isLevelCompleted,
  addWinCoins,
}) => {
  const gameOverReason = movesLeft === 0
    ? `You ran out of moves on Level ${currentLevel?.id}.`
    : 'No more possible moves.';

  return (
    <motion.div
      className="fixed top-0 left-0 w-full h-full bg-gray-500 bg-opacity-75 flex items-center justify-center z-50"
      variants={ModalVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.div className="bg-white p-8 rounded-2xl shadow-lg text-center w-full max-w-md">
        <h2 className={`text-4xl font-extrabold text-red-600 mb-4 bg-gradient-to-r from-red-500 to-orange-500 text-transparent bg-clip-text`}>
          {isLevelCompleted ? 'Level Complete!' : 'Game Over!'}
        </h2>
        <p className="text-gray-700 text-lg mb-4">
          {isLevelCompleted
            ? `You scored ${score} points and completed Level ${currentLevel?.id} with ${movesLeft} moves left!`
            : gameOverReason}
          {!isLevelCompleted && <span className="ml-2">💔</span>}
        </p>
        <div className="flex justify-center gap-4 mt-6">
          {!isLevelCompleted && (
            <>
              <button
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full mt-4 shadow-md transition duration-300 flex items-center"
                onClick={onExit}
              >
                <X size={20} className="mr-2" />
                Exit Level (-1 Life)
              </button>
              <button
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full mt-4 shadow-md transition duration-300 flex items-center"
                onClick={onAd}
              >
                <Play size={20} className="mr-2" />
                Watch Ad (+10 Moves)
              </button>
            </>
          )}
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full mt-4 shadow-md transition duration-300 flex items-center"
            onClick={() => {
              if (isLevelCompleted) {
                addWinCoins();
              }
              onClose();
            }}
          >
            <ArrowRight size={20} className="mr-2" />
            Continue {isLevelCompleted && "(+100 Coins)"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
