import React, { useState, useEffect, useCallback } from "react";
import { GameGrid } from "./components/GameGrid";
import { ScoreBoard } from "./components/ScoreBoard";
import { RefreshCw, X, Settings, Info, User, Play, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LevelMap } from "./components/LevelMap";
import { LEVEL_DATA, Level } from "./levels";
import { SettingsModal } from "./components/SettingsModal";
import { ProfileModal } from "./components/ProfileModal";
import { PowerUpButtons, PowerUpType } from "./components/PowerUpButtons"; // Import PowerUpType
import { GameOverModal } from "./components/GameOverModal"; // Import GameOverModal

const THEMES = {
  fruits: {
    name: "Fruits",
    colors: ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF"],
    emojis: {
      '#FF0000': '🍎',
      '#00FF00': '🍏',
      '#0000FF': '🍉', // Blueberry
      '#FFFF00': '🍋',
      '#FF00FF': '🍇', // Grape
      '#00FFFF': '🥝', // Kiwi
    },
    background: "bg-gradient-to-br from-green-100 to-yellow-100",
    buttonClass: "bg-gradient-to-br from-green-500 to-yellow-500 hover:from-green-600 hover:to-yellow-600",
    unlockCondition: 0, // Unlocked by default
    price: 0,
  },
  candies: {
    name: "Candies",
    colors: ["#FF69B4", "#FFD700", "#8A2BE2", "#00CED1", "#FF4500", "#ADFF2F"],
    emojis: {
      '#FF69B4': '🍬', // Pink Candy
      '#FFD700': '🍭', // Yellow Lollipop
      '#8A2BE2': '🍫', // Purple Chocolate
      '#00CED1': '🍩', // Cyan Donut
      '#FF4500': '🍪', // Orange Cookie
      '#ADFF2F': '🧁', // Green Cupcake
    },
    background: "bg-gradient-to-br from-pink-200 to-purple-200",
    buttonClass: "bg-gradient-to-br from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600",
    unlockCondition: 2, // Unlocks after 2 levels completed
    price: 1000,
  },
  gems: {
    name: "Gems",
    colors: ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF"],
    emojis: {
      '#FF0000': '♦️', // Red Diamond
      '#00FF00': '❇️', // Green Sparkle
      '#0000FF': '🔷', // Blue Diamond
      '#FFFF00': '🔶', // Orange Diamond
      '#FF00FF': '💜', // Purple Heart
      '#00FFFF': '💠', // Cyan Diamond
    },
    background: "bg-gradient-to-br from-blue-200 to-indigo-200",
    buttonClass: "bg-gradient-to-br from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600",
    unlockCondition: 5, // Unlocks after 5 levels completed
    price: 1000,
  },
  ramadan: {
    name: "Ramadan (Special)",
    colors: ["#FFD700", "#8B4513", "#A9A9A9", "#4682B4", "#F0E68C", "#D2B48C"],
    emojis: {
      '#FFD700': '🌙', // Crescent Moon
      '#8B4513': '🕌', // Mosque
      '#A9A9A9': '✨', // Sparkles
      '#4682B4': '🌟', // Star
      '#F0E68C': ' 🌜', // Dates
      '#D2B48C': ' 📿', // Lantern
    },
    background: "bg-gradient-to-br from-yellow-100 to-orange-200",
    buttonClass: "bg-gradient-to-br from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700",
    unlockCondition: 0, // Special theme, can be unlocked by event or default
    price: 1000,
  },
  eid: {
    name: "Eid (Special)",
    colors: ["#008000", "#FFD700", "#800080", "#FF4500", "#00BFFF", "#FFC0CB"],
    emojis: {
      '#008000': '🐑', // Sheep
      '#FFD700': '🎁', // Gift
      '#800080': '🎉', // Party Popper
      '#FF4500': '🎈', // Balloon
      '#00BFFF': '🎊', // Confetti Ball
      '#FFC0CB': '🕌', // Mosque
    },
    background: "bg-gradient-to-br from-green-100 to-blue-100",
    buttonClass: "bg-gradient-to-br from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600",
    unlockCondition: 0, // Special theme, can be unlocked by event or default
    price: 1000,
  },
  christmas: {
    name: "Christmas (Special)",
    colors: ["#FF0000", "#008000", "#FFFFFF", "#FFD700", "#8B4513", "#A9A9A9"],
    emojis: {
      '#FF0000': '🎅', // Santa
      '#008000': '🎄', // Christmas Tree
      '#FFFFFF': '❄️', // Snowflake
      '#FFD700': '🎁', // Gift
      '#8B4513': '🦌', // Reindeer
      '#A9A9A9': '🔔', // Bell
    },
    background: "bg-gradient-to-br from-red-200 to-green-200",
    buttonClass: "bg-gradient-to-br from-red-600 to-green-600 hover:from-red-700 hover:to-green-700",
    unlockCondition: 0, // Special theme, can be unlocked by event or default
    price: 1000,
  },
};

export const PLAYER_AVATARS = ['😀', '😎', '🥳', '🤩', '🤖', '👽'];

// Main Menu
function MainMenu({ onStart, onSettings, onInfo, onDevInfo, onProfile, lives, timeLeft, playerAvatar, currentTheme, seasonalBackground, coins, onDailyChallenge, onArcadeMode, onMultiplayerMode }: any) {
  const heartEmojis = Array(lives).fill("❤️").join("");

  const livesAnimation = {
    initial: { scale: 1 },
    animate: { scale: 1.2, transition: { duration: 0.5, repeat: Infinity, repeatType: "reverse" } },
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const backgroundClass = seasonalBackground || currentTheme.background || "bg-gradient-to-br from-purple-200 to-blue-100";
  const buttonBaseClass = "text-white font-bold py-2 px-4 rounded-full shadow-sm transition duration-300";

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center ${backgroundClass}`}>
      {/* Title */}
      <div className="text-center">
        <h1 className="text-7xl font-extrabold">
          <span className="bg-gradient-to-r from-pink-500 to-purple-700 bg-clip-text text-transparent drop-shadow-lg">
            MATCH
          </span>
          <span className="text-orange-500 drop-shadow-lg ml-2">3</span>
        </h1>
        <p className="text-3xl font-bold text-cyan-500 tracking-wider mt-2 drop-shadow-md">
          FUN GAMES
        </p>
      </div>

      {/* Play Button */}
      <button
        onClick={onStart}
        className={`mt-10 w-20 h-20 rounded-full flex items-center justify-center 
                   ${currentTheme.buttonClass} 
                   shadow-xl hover:scale-110 transition duration-300`}
      >
        <Play size={40} className="text-white" fill="white" />
      </button>

      {/* Extra Buttons */}
      <div className="flex justify-center mt-6 gap-4">
        <button
          className={`${currentTheme.buttonClass} ${buttonBaseClass}`}
          onClick={onSettings}
        >
          <Settings className="inline-block mr-1" size={18} /> Settings
        </button>
        <button
          className={`${currentTheme.buttonClass} ${buttonBaseClass}`}
          onClick={onInfo}
        >
          <Info className="inline-block mr-1" size={18} /> Info
        </button>
        <button
          className={`${currentTheme.buttonClass} ${buttonBaseClass}`}
          onClick={onDevInfo}
        >
          <User className="inline-block mr-1" size={18} /> Dev
        </button>
        <button
          className={`${currentTheme.buttonClass} ${buttonBaseClass}`}
          onClick={onProfile}
        >
          <Trophy className="inline-block mr-1" size={18} /> Profile
        </button>
      </div>

      {/* New Feature Buttons */}
      <div className="flex justify-center mt-6 gap-4">
        <button
          className={`${currentTheme.buttonClass} ${buttonBaseClass}`}
          onClick={onDailyChallenge}
        >
          Daily Challenge
        </button>
        <button
          className={`${currentTheme.buttonClass} ${buttonBaseClass}`}
          onClick={onArcadeMode}
        >
          Arcade Mode
        </button>
        <button
          className={`${currentTheme.buttonClass} ${buttonBaseClass}`}
          onClick={onMultiplayerMode}
        >
          Multiplayer Mode
        </button>
      </div>

      {/* Lives */}
      <motion.div
        className="mt-4 text-2xl font-semibold text-red-500"
        variants={lives === 5 ? livesAnimation : {}}
        initial="initial"
        animate={lives === 5 ? "animate" : ""}
      >
        Lives: {heartEmojis}
      </motion.div>

      {/* Countdown Timer */}
      {lives < 5 && timeLeft !== null && (
        <div className="mt-2 text-lg text-gray-700">
          Next life in: <span className="font-bold">{formatTime(timeLeft)}</span>
        </div>
      )}

      {/* Player Avatar */}
      <div className="mt-4 text-5xl">
        {playerAvatar}
      </div>

      {/* Display Coins */}
      <div className="mt-4 text-2xl font-semibold text-yellow-500">
        💸: {coins}
      </div>
    </div>
  );
}

function App() {
  const [score, setScore] = useState(0);
  const [matches, setMatches] = useState<number[][]>([]);
  const [gameWidth, setGameWidth] = useState(8);
  const [gameHeight, setGameHeight] = useState(8);
  const [gameOver, setGameOver] = useState(false);
  const [gameMode, setGameMode] = useState<'menu' | 'levelSelect' | 'playing' | 'dailyChallenge' | 'arcadeMode' | 'multiplayerMode'>('menu'); // New state for game flow
  const [showSettings, setShowSettings] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showDeveloperInfo, setShowDeveloperInfo] = useState(false);
  const [showProfile, setShowProfile] = useState(false); // New state for profile modal
  const [lives, setLives] = useState(5);
  const [regenerationTime, setRegenerationTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [grid, setGrid] = useState<string[][] | null>(null);
  const [movesLeft, setMovesLeft] = useState(0); // New state for moves
  const [isGameOver, setIsGameOver] = useState(false); // New state for game over popup
  const [showPurchaseModal, setShowPurchaseModal] = useState(false); // New state for purchase modal
  const [selectedPowerUpToBuy, setSelectedPowerUpToBuy] = useState<PowerUpType | null>(null); // Track which power-up to buy
  const [showAdForLives, setShowAdForLives] = useState(false); // New state for ad for lives modal

  // Customization states
  const [selectedTheme, setSelectedTheme] = useState<keyof typeof THEMES>('fruits');
  const [playerAvatar, setPlayerAvatar] = useState<string>(PLAYER_AVATARS[0]);
  const [totalLevelsCompleted, setTotalLevelsCompleted] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [seasonalBackground, setSeasonalBackground] = useState<string | null>(null); // New state for seasonal background
  const [coins, setCoins] = useState(0); // New state for coins

  // Power-up states
  const [powerUpInventory, setPowerUpInventory] = useState<{ [key in PowerUpType]: number }>({
    Hammer: 3,
    Bomb: 2,
    ColorSwap: 3,
  });
  const [activePowerUp, setActivePowerUp] = useState<PowerUpType | null>(null);

  // Level progression states
  const [currentLevelId, setCurrentLevelId] = useState<number | null>(null);
  const [unlockedLevels, setUnlockedLevels] = useState<number[]>([]);
  const [unlockedThemes, setUnlockedThemes] = useState<string[]>(['fruits']); // Initially unlocked themes

  const currentLevelConfig = currentLevelId ? LEVEL_DATA.find(l => l.id === currentLevelId) : null;
  const currentTheme = THEMES[selectedTheme];

  // Load customization from storage
  useEffect(() => {
    const storedTheme = localStorage.getItem("selectedTheme");
    if (storedTheme && THEMES[storedTheme as keyof typeof THEMES]) {
      setSelectedTheme(storedTheme as keyof typeof THEMES);
    }
    const storedAvatar = localStorage.getItem("playerAvatar");
    if (storedAvatar && PLAYER_AVATARS.includes(storedAvatar)) {
      setPlayerAvatar(storedAvatar);
    }
    const storedTotalLevelsCompleted = localStorage.getItem("totalLevelsCompleted");
    if (storedTotalLevelsCompleted) {
      setTotalLevelsCompleted(parseInt(storedTotalLevelsCompleted, 10));
    }
    const storedHighScore = localStorage.getItem("highScore");
    if (storedHighScore) {
      setHighScore(parseInt(storedHighScore, 10));
    }
    const storedPowerUpInventory = localStorage.getItem("powerUpInventory");
    if (storedPowerUpInventory) {
      setPowerUpInventory(JSON.parse(storedPowerUpInventory));
    }
    const storedSeasonalBackground = localStorage.getItem("seasonalBackground");
    if (storedSeasonalBackground) {
      setSeasonalBackground(storedSeasonalBackground);
    }
    const storedCoins = localStorage.getItem("coins");
    if (storedCoins) {
      setCoins(parseInt(storedCoins, 10));
    }
    const storedUnlockedThemes = localStorage.getItem("unlockedThemes");
    if (storedUnlockedThemes) {
      setUnlockedThemes(JSON.parse(storedUnlockedThemes));
    }
  }, []);

  // Save customization to storage
  useEffect(() => localStorage.setItem("selectedTheme", selectedTheme), [selectedTheme]);
  useEffect(() => localStorage.setItem("playerAvatar", playerAvatar), [playerAvatar]);
  useEffect(() => localStorage.setItem("totalLevelsCompleted", totalLevelsCompleted.toString()), [totalLevelsCompleted]);
  useEffect(() => localStorage.setItem("highScore", highScore.toString()), [highScore]);
  useEffect(() => localStorage.setItem("powerUpInventory", JSON.stringify(powerUpInventory)), [powerUpInventory]);
  useEffect(() => {
    seasonalBackground
      ? localStorage.setItem("seasonalBackground", seasonalBackground)
      : localStorage.removeItem("seasonalBackground");
  }, [seasonalBackground]);
  useEffect(() => localStorage.setItem("coins", coins.toString()), [coins]);
  useEffect(() => localStorage.setItem("unlockedThemes", JSON.stringify(unlockedThemes)), [unlockedThemes]);

  // Load level progression from storage
  useEffect(() => {
    // Always unlock all levels for demonstration/testing purposes
    setUnlockedLevels(LEVEL_DATA.map(level => level.id));
    
    const storedCurrentLevelId = localStorage.getItem("currentLevelId");
    if (storedCurrentLevelId) {
      setCurrentLevelId(parseInt(storedCurrentLevelId, 10));
    }
  }, []);

  // Save level progression
  useEffect(() => {
    localStorage.setItem("unlockedLevels", JSON.stringify(unlockedLevels));
  }, [unlockedLevels]);

  useEffect(() => {
    currentLevelId
      ? localStorage.setItem("currentLevelId", currentLevelId.toString())
      : localStorage.removeItem("currentLevelId");
  }, [currentLevelId]);

  // Update game grid dimensions and moves based on current level config
  useEffect(() => {
    if (currentLevelConfig) {
      setGameWidth(currentLevelConfig.width);
      setGameHeight(currentLevelConfig.height);
      setMovesLeft(currentLevelConfig.maxMoves); // Initialize moves for the level
    }
  }, [currentLevelConfig]);

  // Matches handling
  useEffect(() => {
    if (matches.length > 0) {
      setScore((prev) => {
        const newScore = prev + matches.length * 10;
        // Update high score if current score is higher
        setHighScore((prevHighScore) => Math.max(prevHighScore, newScore));
        return newScore;
      });
      // Award coins for matches
      setCoins((prev) => prev + matches.length * 10);
      setMatches([]);
    }
  }, [matches]);

  // Load from storage
  useEffect(() => {
    const storedLives = localStorage.getItem("lives");
    const storedRegenerationTime = localStorage.getItem("regenerationTime");
    if (storedLives) setLives(parseInt(storedLives, 10));
    if (storedRegenerationTime) setRegenerationTime(parseInt(storedRegenerationTime, 10));
  }, []);

  // Save lives & regen
  useEffect(() => localStorage.setItem("lives", lives.toString()), [lives]);
  useEffect(() => {
    regenerationTime
      ? localStorage.setItem("regenerationTime", regenerationTime.toString())
      : localStorage.removeItem("regenerationTime");
  }, [regenerationTime]);

  // Regenerate lives + countdown
  useEffect(() => {
    if (lives < 5 && regenerationTime === null) {
      setRegenerationTime(Date.now() + 5 * 60 * 1000);
    }

    if (regenerationTime && lives < 5) {
      const timer = setInterval(() => {
        const diff = regenerationTime - Date.now();
        if (diff <= 0) {
          setLives((prev) => Math.min(prev + 1, 5));
          setRegenerationTime(null);
          setTimeLeft(null);
        } else {
          setTimeLeft(diff);
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [lives, regenerationTime]);

  const handleMatch = (newMatches: number[][]) => setMatches(newMatches);
  const handleGameOver = () => {
    setIsGameOver(true);
    setGameOver(true);
  };

  // Helper: generate valid grid
  const generateValidGrid = (width: number, height: number, colors: string[]): string[][] => {
    let newGrid: string[][];
    do {
      newGrid = Array.from({ length: height }, () =>
        Array.from({ length: width }, () => colors[Math.floor(Math.random() * colors.length)])
      );
    } while (!hasPossibleMoves(newGrid)); // keep regenerating until valid
    return newGrid;
  };

  // When starting a level
  const handleStartGame = () => {
    setGameMode('levelSelect'); // Navigate to level select screen
  };

  // Also apply the same logic when restarting after Game Over
  const resetGame = () => {
    setScore(0);
    if (currentLevelConfig) {
      setMovesLeft(currentLevelConfig.maxMoves);
      const newGrid = generateValidGrid(
        currentLevelConfig.width,
        currentLevelConfig.height,
        currentTheme.colors
      );
      setGrid(newGrid);
    }
    setGameOver(false);
    setIsGameOver(false);
    setGameMode("playing");
  };

  const hasPossibleMoves = (grid: string[][]): boolean => {
    if (!grid || grid.length === 0 || grid[0].length === 0) return false;
    const height = grid.length;
    const width = grid[0].length;

    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        // Check horizontal swap
        if (j < width - 1) {
          const tempGrid = grid.map(row => [...row]);
          [tempGrid[i][j], tempGrid[i][j + 1]] = [tempGrid[i][j + 1], tempGrid[i][j]];
          if (findAllMatches(tempGrid).length > 0) return true;
        }
        // Check vertical swap
        if (i < height - 1) {
          const tempGrid = grid.map(row => [...row]);
          [tempGrid[i][j], tempGrid[i + 1][j]] = [tempGrid[i + 1][j], tempGrid[i][j]];
          if (findAllMatches(tempGrid).length > 0) return true;
        }
      }
    }
    return false;
  };

  const findAllMatches = (grid: string[][]): number[][] => {
    if (!grid || grid.length === 0 || grid[0].length === 0) return [];
    const matches: number[][] = [];
    const height = grid.length;
    const width = grid[0].length;

    // Check horizontal
    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width - 2; j++) {
        const color = grid[i][j];
        if (color && grid[i][j + 1] === color && grid[i][j + 2] === color) {
          matches.push([i, j], [i, j + 1], [i, j + 2]);
        }
      }
    }

    // Check vertical
    for (let j = 0; j < width; j++) {
      for (let i = 0; i < height - 2; i++) {
        const color = grid[i][j];
        if (color && grid[i + 1][j] === color && grid[i + 2][j] === color) {
          matches.push([i, j], [i + 1, j], [i + 2, j]);
        }
      }
    }

    // Check 2x2 block
    for (let i = 0; i < height - 1; i++) {
      for (let j = 0; j < width - 1; j++) {
        const color = grid[i][j];
        if (
          color &&
          grid[i][j + 1] === color &&
          grid[i + 1][j] === color &&
          grid[i + 1][j + 1] === color
        ) {
          matches.push([i, j], [i, j + 1], [i + 1, j], [i + 1, j + 1]);
        }
      }
    }

    // Remove duplicates using a Set for robustness
    const seen = new Set<string>();
    const uniqueMatches: number[][] = [];
    for (const match of matches) {
      // Ensure match is a valid array before processing
      if (Array.isArray(match) && match.length >= 2) {
        const key = `${match[0]},${match[1]}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueMatches.push(match);
        }
      }
    }
    return uniqueMatches;
  };

  const handleExitClick = () => {
    setLives((prev) => Math.max(prev - 1, 0));
    setIsGameOver(false);
    setGameOver(false);
    setGameMode('levelSelect');
    setScore(0); // Reset score
    if (currentLevelConfig) {
      setMovesLeft(currentLevelConfig.maxMoves); // Reset moves
    }
    setGrid(null); // Reset grid
  };

  const handleAdClick = () => {
    window.open('https://t.me/AhmedRe3oo0', '_blank');
    setMovesLeft(prev => prev + 10);
    setIsGameOver(false);
    setGameOver(false);
  };

  const isLevelCompleted = currentLevelConfig && score >= currentLevelConfig.goalScore && movesLeft >= 0;

  useEffect(() => {
    if (gameMode === 'playing' && currentLevelConfig) {
      if (score >= currentLevelConfig.goalScore) {
        setIsGameOver(true);
        setGameOver(true); // Level complete condition
      } else if (movesLeft <= 0 || (grid && !hasPossibleMoves(grid))) {
        setIsGameOver(true);
        setGameOver(true); // Game over condition (no moves or no possible moves)
      }
    }
  }, [grid, gameMode, movesLeft, score, currentLevelConfig, hasPossibleMoves]);

  const handleLevelComplete = () => {
    if (currentLevelConfig && score >= currentLevelConfig.goalScore) {
      setTotalLevelsCompleted((prev) => prev + 1); // Increment total levels completed
      setCoins((prev) => prev + 500); // Award coins for completing the level
      const nextLevelId = currentLevelConfig.id + 1;
      if (nextLevelId <= LEVEL_DATA.length && !unlockedLevels.includes(nextLevelId)) {
        setUnlockedLevels((prev) => [...prev, nextLevelId]);
      }
    }
  };

  const usePowerUp = useCallback((type: PowerUpType) => {
    setPowerUpInventory((prev) => ({
      ...prev,
      [type]: Math.max(0, prev[type] - 1),
    }));
    setActivePowerUp(null); // Deactivate after use
  }, []);

  const isThemeUnlocked = (themeKey: string) => unlockedThemes.includes(themeKey);

  const handleThemePurchase = (themeKey: string) => {
    const theme = THEMES[themeKey];
    if (coins >= theme.price && !isThemeUnlocked(themeKey)) {
      setCoins((prev) => prev - theme.price);
      setUnlockedThemes((prev) => [...prev, themeKey]);
    }
  };

  const handlePurchase = (type: PowerUpType, purchaseType: 'coins' | 'ad') => {
    const powerUpCost = 250; // Define the cost of a power-up

    if (purchaseType === 'coins') {
      if (coins >= powerUpCost) {
        setCoins((prev) => prev - powerUpCost);
        setPowerUpInventory((prev) => ({
          ...prev,
          [type]: prev[type] + 1, // Add one to the power-up count
        }));
      } else {
        alert('Not enough coins!');
      }
    } else if (purchaseType === 'ad') {
      window.open('https://t.me/AhmedRe3oo0', '_blank');
      setPowerUpInventory((prev) => ({
        ...prev,
        [type]: prev[type] + 1, // Add one to the power-up count
        }));
      }
      setShowPurchaseModal(false); // Close the purchase modal
    };

    const handleDailyChallenge = () => {
      // Implement daily challenge logic here
      setGameMode('dailyChallenge');
    };

    const handleArcadeMode = () => {
      // Implement arcade mode logic here
      setGameMode('arcadeMode');
    };

    const handleMultiplayerMode = () => {
      // Implement multiplayer mode logic here
      setGameMode('multiplayerMode');
    };

    // Check if lives are zero and show the ad for lives modal
    useEffect(() => {
      if (lives === 0 && gameMode !== 'menu') {
        setShowAdForLives(true);
      } else {
        setShowAdForLives(false);
      }
    }, [lives, gameMode]);

    const handleWatchAdForLives = () => {
      window.open('https://t.me/AhmedRe3oo0', '_blank');
      setLives(5);
      setShowAdForLives(false);
      setRegenerationTime(null);
    };

    // Daily Challenge setup
    const [dailyChallengeGrid, setDailyChallengeGrid] = useState<string[][] | null>(null);
    const [dailyChallengeGoal, setDailyChallengeGoal] = useState(5000); // Example goal
    const [dailyChallengeMoves, setDailyChallengeMoves] = useState(40); // Example moves

    // Generate daily challenge grid
    useEffect(() => {
      if (gameMode === 'dailyChallenge') {
        const newGrid = generateValidGrid(8, 8, currentTheme.colors);
        setDailyChallengeGrid(newGrid);
        setMovesLeft(dailyChallengeMoves); // Set moves for the challenge
        setScore(0); // Reset score
        setIsGameOver(false);
        setGameOver(false);
      }
    }, [gameMode, currentTheme.colors, dailyChallengeMoves]);

    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        {gameMode === 'menu' && (
          <MainMenu
            onStart={() => handleStartGame()}
            onSettings={() => setShowSettings(true)}
            onInfo={() => setShowInfo(true)}
            onDevInfo={() => setShowDeveloperInfo(true)}
            onProfile={() => setShowProfile(true)} // Open profile modal
            lives={lives}
            timeLeft={timeLeft}
            playerAvatar={playerAvatar}
            currentTheme={currentTheme} // Pass current theme to MainMenu
            seasonalBackground={seasonalBackground} // Pass seasonal background
            coins={coins} // Pass coins to MainMenu
            onDailyChallenge={handleDailyChallenge}
            onArcadeMode={handleArcadeMode}
            onMultiplayerMode={handleMultiplayerMode}
          />
        )}

        {gameMode === 'levelSelect' && (
          <LevelMap
            unlockedLevels={unlockedLevels}
            onLevelSelect={(levelId) => {
              setCurrentLevelId(levelId);
              setGameMode('playing');
              setScore(0); // Reset score for new level
              setGameOver(false); // Ensure game is not over
              setIsGameOver(false);
              // MovesLeft will be set by the useEffect when currentLevelConfig updates
            }}
            onBackToMenu={() => setGameMode('menu')}
            currentLevelId={currentLevelId}
          />
        )}

        {gameMode === 'playing' && currentLevelConfig && (
          <div className={`p-8 rounded-xl shadow-lg border-2 border-gray-200 relative ${currentTheme.background}`}>
            <div className="absolute top-4 right-4">
              <button
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full shadow-md transition duration-300"
                onClick={handleExitClick}
              >
                <X size={20} />
                {isGameOver && <span className="ml-2">Game Over</span>}
              </button>
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Level {currentLevelConfig.id}: {currentLevelConfig.name}</h1>
            <ScoreBoard
              score={score}
              currentLevelId={currentLevelConfig.id}
              goalScore={currentLevelConfig.goalScore}
              movesLeft={movesLeft} // Pass movesLeft to ScoreBoard
            />
            <div>💖: {lives}</div>
            <div>💸: {coins}</div> {/* Display coins */}
            <GameGrid
              width={gameWidth}
              height={gameHeight}
              colors={currentTheme.colors} // Use colors from selected theme
              emojiMap={currentTheme.emojis} // Pass emoji map to GameGrid
              onMatch={handleMatch}
              setGameOver={handleGameOver}
              hasPossibleMoves={hasPossibleMoves}
              findAllMatches={findAllMatches}
              setGrid={setGrid}
              activePowerUp={activePowerUp} // Pass active power-up
              usePowerUp={usePowerUp} // Pass use power-up function
              gridColors={currentTheme.colors} // Pass available colors for ColorSwap
              movesLeft={movesLeft} // Pass movesLeft to GameGrid
              setMovesLeft={setMovesLeft} // Pass setMovesLeft to GameGrid
              onNoPowerUpsAvailable={() => setShowPurchaseModal(true)} // Show purchase modal
              setSelectedPowerUpToBuy={setSelectedPowerUpToBuy} // Set selected power-up
              powerUpInventory={powerUpInventory} // Pass powerUpInventory
            />
            <div className="mt-4 flex justify-center">
              <PowerUpButtons
                inventory={powerUpInventory}
                activePowerUp={activePowerUp}
                setActivePowerUp={setActivePowerUp}
                onPurchaseClick={(type: PowerUpType) => {
                  setSelectedPowerUpToBuy(type);
                                  setShowPurchaseModal(true);
                              }}
              />
            </div>
          </div>
        )}

        {/* Daily Challenge Mode */}
        {gameMode === 'dailyChallenge' && dailyChallengeGrid && (
          <div className="p-8 rounded-xl shadow-lg border-2 border-gray-200 relative bg-gradient-to-br from-purple-200 to-blue-100">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Daily Challenge</h1>
            <ScoreBoard
              score={score}
              currentLevelId={0}
              goalScore={dailyChallengeGoal}
              movesLeft={movesLeft} // Pass movesLeft to ScoreBoard
            />
            <p className="text-gray-700 mb-4">Test your skills with a new challenge every day!</p>
            <GameGrid
              width={8}
              height={8}
              colors={currentTheme.colors} // Use colors from selected theme
              emojiMap={currentTheme.emojis} // Pass emoji map to GameGrid
              onMatch={handleMatch}
              setGameOver={handleGameOver}
              hasPossibleMoves={hasPossibleMoves}
              findAllMatches={findAllMatches}
              setGrid={setDailyChallengeGrid}
              activePowerUp={activePowerUp} // Pass active power-up
              usePowerUp={usePowerUp} // Pass use power-up function
              gridColors={currentTheme.colors} // Pass available colors for ColorSwap
              movesLeft={movesLeft} // Pass movesLeft to GameGrid
              setMovesLeft={setMovesLeft} // Pass setMovesLeft to GameGrid
              onNoPowerUpsAvailable={() => setShowPurchaseModal(true)} // Show purchase modal
              setSelectedPowerUpToBuy={setSelectedPowerUpToBuy} // Set selected power-up
              powerUpInventory={powerUpInventory} // Pass powerUpInventory
            />
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full shadow-md transition duration-300 mt-4"
              onClick={() => setGameMode('menu')}
            >
              Back to Menu
            </button>
          </div>
        )}

        {/* Arcade Mode */}
        {gameMode === 'arcadeMode' && (
          <div className="p-8 rounded-xl shadow-lg border-2 border-gray-200 relative bg-gradient-to-br from-purple-200 to-blue-100">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Arcade Mode</h1>
            <p className="text-gray-700 mb-4">Endless gameplay with increasing difficulty!</p>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full shadow-md transition duration-300"
              onClick={() => setGameMode('menu')}
            >
              Back to Menu
            </button>
          </div>
        )}

        {/* Multiplayer Mode */}
        {gameMode === 'multiplayerMode' && (
          <div className="p-8 rounded-xl shadow-lg border-2 border-gray-200 relative bg-gradient-to-br from-purple-200 to-blue-100">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Multiplayer Mode</h1>
            <p className="text-gray-700 mb-4">Challenge your friends in real-time!</p>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full shadow-md transition duration-300"
              onClick={() => setGameMode('menu')}
            >
              Back to Menu
            </button>
          </div>
        )}

        <AnimatePresence>
          {isGameOver && (
            <GameOverModal
              onClose={() => {
                handleLevelComplete(); // Check for level completion and unlock next
                setGameMode('levelSelect'); // Go back to level select after game over
                setGameOver(false);
                setIsGameOver(false);

                if (!isLevelCompleted) { // Only lose a life if the level was not completed
                  setLives((prev) => Math.max(prev - 1, 0));
                }

                if (lives === 0) { // If no lives left after this game over, reset lives and regen timer
                  setLives(5);
                  setRegenerationTime(null);
                } else if (lives > 0 && !isLevelCompleted) { // If lives > 0 and not completed, start regen timer
                  setRegenerationTime(Date.now() + 5 * 60 * 1000);
                }
              }}
              onExit={() => {
                setLives((prev) => Math.max(prev - 1, 0));
                setGameOver(false);
                setIsGameOver(false);
                setGameMode('levelSelect');
                setScore(0); // Reset score
                if (currentLevelConfig) {
                  setMovesLeft(currentLevelConfig.maxMoves); // Reset moves
                }
                setGrid(null); // Reset grid
              }}
              onAd={() => {
                handleAdClick();
              }}
              currentLevel={currentLevelConfig}
              score={score}
              movesLeft={movesLeft}
              isLevelCompleted={isLevelCompleted}
              addWinCoins={() => setCoins(prev => prev + 100)} // Add win coins
            />
          )}
        </AnimatePresence>

        {showSettings && (
          <SettingsModal
            selectedTheme={selectedTheme}
            setSelectedTheme={setSelectedTheme}
            playerAvatar={playerAvatar}
            setPlayerAvatar={setPlayerAvatar}
            onClose={() => setShowSettings(false)}
            themes={THEMES}
            playerAvatars={PLAYER_AVATARS}
            totalLevelsCompleted={totalLevelsCompleted} // Pass totalLevelsCompleted
            seasonalBackground={seasonalBackground} // Pass seasonal background state
            setSeasonalBackground={setSeasonalBackground} // Pass setter for seasonal background
            coins={coins} // Pass coins
            unlockedThemes={unlockedThemes} // Pass unlocked themes
            onThemePurchase={handleThemePurchase} // Pass theme purchase handler
            isThemeUnlocked={isThemeUnlocked} // Pass theme unlocked checker
          />
        )}

        {showProfile && (
          <ProfileModal
            totalLevelsCompleted={totalLevelsCompleted}
            highScore={highScore}
            playerAvatar={playerAvatar}
            onClose={() => setShowProfile(false)}
          />
        )}

        {showInfo && (
          <div className="fixed top-0 left-0 w-full h-full bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded shadow-lg">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Game Information</h2>
              <p>Learn more about the game and how to play.</p>
              <button
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-4"
                onClick={() => setShowInfo(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {showDeveloperInfo &&(
                  <div className="fixed top-0 left-0 w-full h-full bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded shadow-lg">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Developer Information</h2>
              <p>Information about the game developers.</p>
              <button
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-4"
                onClick={() => setShowDeveloperInfo(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Purchase Modal */}
        {showPurchaseModal && selectedPowerUpToBuy && (
          <div className="fixed top-0 left-0 w-full h-full bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-xl shadow-lg text-center">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Buy {selectedPowerUpToBuy}?</h2>
              <p className="text-gray-700 mb-4">
                You can buy a {selectedPowerUpToBuy} for 250 coins or watch an ad to get one.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full shadow-md transition duration-300"
                  onClick={() => handlePurchase(selectedPowerUpToBuy, 'coins')}
                >
                  Buy for 250 Coins
                </button>
                <button
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full shadow-md transition duration-300"
                  onClick={() => handlePurchase(selectedPowerUpToBuy, 'ad')}
                >
                  Watch Ad for 1
                </button>
                <button
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full shadow-md transition duration-300"
                  onClick={() => setShowPurchaseModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Ad For Lives Modal */}
        {showAdForLives && (
          <div className="fixed top-0 left-0 w-full h-full bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-xl shadow-lg text-center">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">No Lives Left!</h2>
              <p className="text-gray-700 mb-4">
                Watch an ad to get 5 lives and continue playing?
              </p>
              <div className="flex justify-center gap-4">
                <button
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full shadow-md transition duration-300"
                  onClick={handleWatchAdForLives}
                >
                  Watch Ad for Lives
                </button>
                <button
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full shadow-md transition duration-300"
                  onClick={() => {
                    setShowAdForLives(false);
                    setGameMode('menu'); // Navigate to main menu
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  export default App;
