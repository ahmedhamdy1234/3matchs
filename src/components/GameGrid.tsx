import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Square } from './Square';
import { motion, useAnimation } from 'framer-motion';
import { PowerUpType } from './PowerUpButtons'; // Import PowerUpType
import { SoundManager } from '../soundManager'; // Import SoundManager interface
import { Cell } from '../types'; // Import Cell interface

interface GameGridProps {
  width: number;
  height: number;
  colors: string[];
  emojiMap: { [key: string]: string }; // Add emojiMap prop
  onMatch: (matches: number[][]) => void;
  setGameOver: (gameOver: boolean) => void;
  hasPossibleMoves: (grid: Cell[][]) => boolean; // Updated grid type
  findAllMatches: (grid: Cell[][]) => number[][]; // Updated grid type
  setGrid: React.Dispatch<React.SetStateAction<Cell[][] | null>>; // Updated grid type
  activePowerUp: PowerUpType | null; // New prop for active power-up
  usePowerUp: (type: PowerUpType) => void; // New prop to consume power-up
  gridColors: string[]; // New prop for available grid colors
  movesLeft: number; // New prop for moves left
  setMovesLeft: React.Dispatch<React.SetStateAction<number>>; // New prop to update moves left
  onNoPowerUpsAvailable: () => void; // New prop to handle no power-ups available
  setSelectedPowerUpToBuy: (type: PowerUpType | null) => void; // New prop to set selected power-up
  powerUpInventory: { [key in PowerUpType]: number }; // New prop for power-up inventory
  soundManager: SoundManager; // Add soundManager prop
  hintCoordinates: [[number, number], [number, number]] | null; // New prop for hint
  resetIdleTimer: () => void; // New prop to reset idle timer
  initialGrid: Cell[][] | null; // New prop to receive initial grid from App.tsx
  levelHasIce: boolean; // New prop to indicate if the current level has ice
  onPowerUpCellsCleared: (cellsToClear: number[][], type: PowerUpType) => void; // New prop for power-up grid update
}

export const GameGrid: React.FC<GameGridProps> = ({
  width,
  height,
  colors,
  emojiMap,
  onMatch,
  setGameOver,
  hasPossibleMoves,
  findAllMatches,
  setGrid,
  activePowerUp,
  usePowerUp,
  gridColors,
  movesLeft,
  setMovesLeft,
  onNoPowerUpsAvailable,
  setSelectedPowerUpToBuy,
  powerUpInventory,
  soundManager,
  hintCoordinates, // Destructure hintCoordinates
  resetIdleTimer, // Destructure resetIdleTimer
  initialGrid, // Destructure initialGrid
  levelHasIce, // Destructure levelHasIce
  onPowerUpCellsCleared, // Destructure new prop
}) => {
  const [internalGrid, setInternalGrid] = useState<Cell[][]>([]); // Updated grid type
  const [selectedSquare, setSelectedSquare] = useState<[number, number] | null>(null);
  const squareControls = useAnimation();
  const isMounted = useRef(false);

  // New state to trigger match animations
  const [animationTrigger, setAnimationTrigger] = useState(0);
  // New state to trigger power-up animations
  const [powerUpAnimationTrigger, setPowerUpAnimationTrigger] = useState<{ type: PowerUpType, row: number, col: number } | null>(null);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (initialGrid) {
      setInternalGrid(initialGrid);
    } else {
      const newGrid = createGrid(width, height, colors, levelHasIce);
      setInternalGrid(newGrid);
      setGrid(newGrid); // Update parent's grid state
    }
  }, [width, height, colors, setGrid, initialGrid, levelHasIce]);

  // Effect to detect matches and trigger animation
  useEffect(() => {
    if (!isMounted.current) {
      return;
    }

    if (internalGrid && internalGrid.length > 0) {
      const matches = findAllMatches(internalGrid);
      if (matches.length > 0) {
        onMatch(matches);
        setAnimationTrigger(prev => prev + 1); // Increment to trigger animation useEffect
      } else {
        if (!hasPossibleMoves(internalGrid) && movesLeft > 0) {
          setGameOver(true);
        }
      }
    }
  }, [internalGrid, onMatch, hasPossibleMoves, setGameOver, findAllMatches, movesLeft]);

  // Effect to handle match animations (visual only, grid update handled by App.tsx)
  useEffect(() => {
    if (animationTrigger > 0 && isMounted.current && internalGrid && internalGrid.length > 0) {
      const matches = findAllMatches(internalGrid); // Re-find matches for the current grid state
      if (matches.length > 0) {
        const animateMatches = async () => {
          await squareControls.start({
            opacity: 0,
            scale: 0,
            transition: { duration: 0.5, ease: "easeInOut" },
          });

          // Grid update (gravity and refill) is now handled by App.tsx after onMatch
          // We only need to reset the animation state here
          squareControls.start({
            opacity: 1,
            scale: 1,
            transition: { duration: 0.5, ease: "easeInOut" },
          });
        };
        animateMatches();
      }
    }
  }, [animationTrigger, isMounted, internalGrid, squareControls, findAllMatches]);


  const createGrid = (width: number, height: number, colors: string[], levelHasIce: boolean): Cell[][] => {
    const newGrid: Cell[][] = [];
    for (let i = 0; i < height; i++) {
      newGrid[i] = [];
      for (let j = 0; j < width; j++) {
        let color = colors[Math.floor(Math.random() * colors.length)];
        while (isInitialMatch(newGrid, i, j, color)) {
          color = colors[Math.floor(Math.random() * colors.length)];
        }
        // Randomly assign ice for ice levels, or based on a pattern
        const hasIce = levelHasIce && Math.random() < 0.5; // 50% chance for ice
        newGrid[i][j] = { color, hasIce };
      }
    }
    return newGrid;
  };

  const isInitialMatch = (grid: Cell[][], row: number, col: number, color: string): boolean => {
    let count = 1;
    if (col > 1 && grid[row][col - 1]?.color === color && grid[row][col - 2]?.color === color) {
      return true;
    }
    if (row > 1 && grid[row - 1][col]?.color === color && grid[row - 2][col]?.color === color) {
      return true;
    }
    return false;
  };

  const handleClick = (row: number, col: number) => {
    resetIdleTimer(); // Reset timer on any click
    if (activePowerUp) {
      handlePowerUpUse(row, col, activePowerUp);
      return;
    }

    if (selectedSquare) {
      const [selRow, selCol] = selectedSquare;
      if (isAdjacent(row, col, selRow, selCol)) {
        swapSquares(selRow, selCol, row, col);
        setSelectedSquare(null);
      } else {
        setSelectedSquare([row, col]);
      }
    } else {
      setSelectedSquare([row, col]);
    }
  };

  const isAdjacent = (row1: number, col1: number, row2: number, col2: number): boolean => {
    const rowDiff = Math.abs(row1 - row2);
    const colDiff = Math.abs(col1 - col2);
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
  };

  const swapSquares = (row1: number, col1: number, row2: number, col2: number) => {
    resetIdleTimer(); // Reset timer on swap
    const newGrid = internalGrid.map(row => row.map(cell => ({ ...cell }))); // Deep copy cells
    const temp = newGrid[row1][col1];
    newGrid[row1][col1] = newGrid[row2][col2];
    newGrid[row2][col2] = temp;
    setInternalGrid(newGrid);
    setGrid(newGrid); // Update parent's grid state
    soundManager.playMove(); // Play move sound

    const matches = findAllMatches(newGrid);
    if (matches.length > 0) {
      onMatch(matches); // App.tsx will handle gravity/refill
      setAnimationTrigger(prev => prev + 1); // Trigger match animation
      setMovesLeft(prev => prev - 1); // Decrement moves only on successful match
    } else {
      setTimeout(() => {
        const originalGrid = internalGrid.map(row => row.map(cell => ({ ...cell }))); // Deep copy cells
        setInternalGrid(originalGrid);
        setGrid(originalGrid); // Update parent's grid state
      }, 500);
    }
  };

  const handlePowerUpUse = (row: number, col: number, type: PowerUpType) => {
    resetIdleTimer(); // Reset timer on power-up use
    if (powerUpInventory[type] <= 0) {
      setSelectedPowerUpToBuy(type);
      onNoPowerUpsAvailable();
      return;
    }

    if (type === PowerUpType.ColorSwap) {
      let newGrid = internalGrid.map(r => r.map(cell => ({ ...cell }))); // Deep copy cells
      const currentColor = newGrid[row][col].color;
      if (!currentColor) return; // Cannot swap an empty tile
        
      let newColor = currentColor;
      while (newColor === currentColor) {
        newColor = gridColors[Math.floor(Math.random() * gridColors.length)];
      }
      newGrid[row][col].color = newColor; // Only change color
      setInternalGrid(newGrid);
      setGrid(newGrid);
      usePowerUp(type); // Consume power-up
      
      // Check for new matches after color swap
      const matchesAfterSwap = findAllMatches(newGrid);
      if (matchesAfterSwap.length > 0) {
        onMatch(matchesAfterSwap);
        setAnimationTrigger(prev => prev + 1); // Trigger general match animation
      } else {
        // If no matches, just re-render with new color (no animation needed for this specific case)
        squareControls.start({ opacity: 1, scale: 1, transition: { duration: 0.3 } });
      }
      return; // Exit early for ColorSwap as it doesn't use applyGravityAndRefill directly for initial effect
    }

    // For Hammer and Bomb, set powerUpAnimationTrigger
    setPowerUpAnimationTrigger({ type, row, col });
  };

  // Effect to handle power-up animations (visual only, grid update handled by App.tsx)
  useEffect(() => {
    if (powerUpAnimationTrigger && isMounted.current && internalGrid && internalGrid.length > 0) {
      const { type, row, col } = powerUpAnimationTrigger;
      const animatePowerUp = async () => {
        let cellsToAffect: number[][] = [];

        switch (type) {
          case PowerUpType.Hammer:
            cellsToAffect.push([row, col]);
            break;
          case PowerUpType.Bomb:
            for (let i = Math.max(0, row - 1); i <= Math.min(height - 1, row + 1); i++) {
              for (let j = Math.max(0, col - 1); j <= Math.min(width - 1, col + 1); j++) {
                cellsToAffect.push([i, j]);
              }
            }
            break;
        }

        if (cellsToAffect.length > 0) {
          await squareControls.start({
            opacity: 0,
            scale: 0,
            transition: { duration: 0.3, ease: "easeInOut" },
          });

          // Delegate grid update to App.tsx
          onPowerUpCellsCleared(cellsToAffect, type);

          squareControls.start({
            opacity: 1,
            scale: 1,
            transition: { duration: 0.3, ease: "easeInOut" },
          });
        }
        setPowerUpAnimationTrigger(null); // Reset trigger
      };
      animatePowerUp();
    }
  }, [powerUpAnimationTrigger, isMounted, internalGrid, squareControls, onPowerUpCellsCleared, height, width]);


  const gridVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.05,
        duration: 0.5,
      },
    },
  };

  const squareVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
      },
    },
    matched: {
      opacity: 0,
      scale: 0,
      transition: {
        duration: 0.5,
      },
    },
    swapped: {
      scale: 1.1,
      transition: {
        duration: 0.3,
        yoyo: 2,
      },
    },
  };

  return (
    <motion.div
      className="grid gap-1"
      style={{ gridTemplateColumns: `repeat(${width}, 50px)` }}
      variants={gridVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.5 }}
    >
      {internalGrid.map((row, rowIndex) => (
        row.map((cell, colIndex) => {
          const isHinted = hintCoordinates &&
                           ((hintCoordinates[0][0] === rowIndex && hintCoordinates[0][1] === colIndex) ||
                            (hintCoordinates[1][0] === rowIndex && hintCoordinates[1][1] === colIndex));
          return (
            <Square
              key={`${rowIndex}-${colIndex}`}
              color={cell.color} // Pass cell color
              hasIce={cell.hasIce} // Pass hasIce prop
              onClick={() => handleClick(rowIndex, colIndex)}
              isSelected={selectedSquare && selectedSquare[0] === rowIndex && selectedSquare[1] === colIndex}
              variants={squareVariants}
              animate={squareControls}
              emojiMap={emojiMap} // Pass emoji map to Square
              isPowerUpActive={!!activePowerUp} // Indicate if a power-up is active
              isHinted={isHinted} // Pass isHinted prop
            />
          );
        })
      ))}
    </motion.div>
  );
};
