import React, { useState, useEffect, useRef } from 'react';
import { Square } from './Square';
import { motion, useAnimation } from 'framer-motion';
import { PowerUpType } from './PowerUpButtons'; // Import PowerUpType
import { SoundManager } from '../soundManager'; // Import SoundManager interface

interface GameGridProps {
  width: number;
  height: number;
  colors: string[];
  emojiMap: { [key: string]: string }; // Add emojiMap prop
  onMatch: (matches: number[][]) => void;
  setGameOver: (gameOver: boolean) => void;
  hasPossibleMoves: (grid: string[][]) => boolean;
  findAllMatches: (grid: string[][]) => number[][];
  setGrid: React.Dispatch<React.SetStateAction<string[][] | null>>; // Add setGrid prop
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
}) => {
  const [internalGrid, setInternalGrid] = useState<string[][]>([]);
  const [selectedSquare, setSelectedSquare] = useState<[number, number] | null>(null);
  const gridControls = useAnimation();
  const squareControls = useAnimation();
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const initialGrid = createGrid(width, height, colors);
    setInternalGrid(initialGrid);
    setGrid(initialGrid); // Update parent's grid state
  }, [width, height, colors, setGrid]);

  useEffect(() => {
    // Ensure component is mounted before attempting animations or complex logic
    if (!isMounted.current) {
      return;
    }

    // Only proceed if internalGrid is initialized and not empty
    if (internalGrid && internalGrid.length > 0) {
      const matches = findAllMatches(internalGrid);
      if (matches.length > 0) {
        onMatch(matches);
        // triggerMatchEffects will handle the animation and subsequent grid state updates
        triggerMatchEffects(matches);
      } else {
        // If no matches, check for game over condition
        if (!hasPossibleMoves(internalGrid) && movesLeft > 0) { // Only game over if no moves left OR no possible moves
          setGameOver(true);
        }
      }
    }
  }, [internalGrid, onMatch, hasPossibleMoves, setGameOver, findAllMatches, setGrid, movesLeft]);

  const createGrid = (width: number, height: number, colors: string[]): string[][] => {
    const newGrid: string[][] = [];
    for (let i = 0; i < height; i++) {
      newGrid[i] = [];
      for (let j = 0; j < width; j++) {
        let color = colors[Math.floor(Math.random() * colors.length)];
        while (isInitialMatch(newGrid, i, j, color)) {
          color = colors[Math.floor(Math.random() * colors.length)];
        }
        newGrid[i][j] = color;
      }
    }
    return newGrid;
  };

  const isInitialMatch = (grid: string[][], row: number, col: number, color: string): boolean => {
    let count = 1;
    if (col > 1 && grid[row][col - 1] === color && grid[row][col - 2] === color) {
      return true;
    }
    if (row > 1 && grid[row - 1][col] === color && grid[row - 2][col] === color) {
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
    const newGrid = internalGrid.map(row => [...row]);
    const temp = newGrid[row1][col1];
    newGrid[row1][col1] = newGrid[row2][col2];
    newGrid[row2][col2] = temp;
    setInternalGrid(newGrid);
    setGrid(newGrid); // Update parent's grid state
    soundManager.playMove(); // Play move sound

    const matches = findAllMatches(newGrid);
    if (matches.length > 0) {
      onMatch(matches);
      triggerMatchEffects(matches);
      setMovesLeft(prev => prev - 1); // Decrement moves only on successful match
      // The grid update is now handled within triggerMatchEffects
    } else {
      setTimeout(() => {
        const originalGrid = internalGrid.map(row => [...row]);
        setInternalGrid(originalGrid);
        setGrid(originalGrid); // Update parent's grid state
      }, 500);
    }
  };

  const applyGravityAndRefill = (grid: string[][], cellsToClear: number[][]): string[][] => {
    const newGrid = grid.map(row => [...row]);
    cellsToClear.forEach(([row, col]) => {
      if (row >= 0 && row < height && col >= 0 && col < width) {
        newGrid[row][col] = '';
      }
    });

    for (let j = 0; j < width; j++) {
      let emptyRows = 0;
      for (let i = height - 1; i >= 0; i--) {
        if (newGrid[i] && newGrid[i][j] === '') {
          emptyRows++;
        } else if (emptyRows > 0 && newGrid[i]) {
          newGrid[i + emptyRows][j] = newGrid[i][j];
          newGrid[i][j] = '';
        }
      }
      for (let i = 0; i < emptyRows; i++) {
        let color = colors[Math.floor(Math.random() * colors.length)];
        newGrid[i][j] = color;
      }
    }
    return newGrid;
  };

  const triggerMatchEffects = async (matches: number[][]) => {
    if (!isMounted.current) {
      const updatedGrid = applyGravityAndRefill(internalGrid, matches);
      setInternalGrid(updatedGrid);
      setGrid(updatedGrid);
      return;
    }

    await squareControls.start({
      opacity: 0,
      scale: 0,
      transition: { duration: 0.5, ease: "easeInOut" },
    });

    const updatedGrid = applyGravityAndRefill(internalGrid, matches);
    setInternalGrid(updatedGrid);
    setGrid(updatedGrid);

    squareControls.start({
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: "easeInOut" },
    });
  };

  const handlePowerUpUse = async (row: number, col: number, type: PowerUpType) => {
    resetIdleTimer(); // Reset timer on power-up use
    if (powerUpInventory[type] <= 0) {
      setSelectedPowerUpToBuy(type);
      onNoPowerUpsAvailable();
      return;
    }

    let cellsToAffect: number[][] = [];
    let newGrid = internalGrid.map(r => [...r]);

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
      case PowerUpType.ColorSwap:
        const currentColor = newGrid[row][col];
        if (!currentColor) break; // Cannot swap an empty tile
        
        let newColor = currentColor;
        while (newColor === currentColor) {
          newColor = gridColors[Math.floor(Math.random() * gridColors.length)];
        }
        newGrid[row][col] = newColor;
        setInternalGrid(newGrid);
        setGrid(newGrid);
        usePowerUp(type); // Consume power-up
        
        // Check for new matches after color swap
        const matchesAfterSwap = findAllMatches(newGrid);
        if (matchesAfterSwap.length > 0) {
          onMatch(matchesAfterSwap);
          triggerMatchEffects(matchesAfterSwap);
        } else {
          // If no matches, just re-render with new color
          squareControls.start({ opacity: 1, scale: 1, transition: { duration: 0.3 } });
        }
        return; // Exit early for ColorSwap as it doesn't use applyGravityAndRefill directly for initial effect
    }

    // For Hammer and Bomb, clear cells and then apply gravity/refill
    if (cellsToAffect.length > 0) {
      await squareControls.start({
        opacity: 0,
        scale: 0,
        transition: { duration: 0.3, ease: "easeInOut" },
      });

      const updatedGrid = applyGravityAndRefill(internalGrid, cellsToAffect);
      setInternalGrid(updatedGrid);
      setGrid(updatedGrid);
      usePowerUp(type); // Consume power-up

      squareControls.start({
        opacity: 1,
        scale: 1,
        transition: { duration: 0.3, ease: "easeInOut" },
      });

      // After gravity and refill, check for new matches
      const newMatches = findAllMatches(updatedGrid);
      if (newMatches.length > 0) {
        onMatch(newMatches);
        triggerMatchEffects(newMatches);
      }
    }  };

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
        row.map((color, colIndex) => {
          const isHinted = hintCoordinates &&
                           ((hintCoordinates[0][0] === rowIndex && hintCoordinates[0][1] === colIndex) ||
                            (hintCoordinates[1][0] === rowIndex && hintCoordinates[1][1] === colIndex));
          return (
            <Square
              key={`${rowIndex}-${colIndex}`}
              color={color}
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
