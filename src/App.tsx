import React, { useState, useEffect, useCallback, useRef } from "react";
import { GameGrid } from "./components/GameGrid";
import { ScoreBoard } from "./components/ScoreBoard";
import { RefreshCw, X, Settings, Info, User, Play, Trophy, CalendarDays, Gamepad2, Users, Computer } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LevelMap } from "./components/LevelMap";
import { LEVEL_DATA, Level } from "./levels";
import { SettingsModal } from "./components/SettingsModal";
import { ProfileModal } from "./components/ProfileModal";
import { PowerUpButtons, PowerUpType } from "./components/PowerUpButtons";
import { GameOverModal } from "./components/GameOverModal";
import { createSoundManager } from "./soundManager"; // Import sound manager

// 🎨 THEMES
const THEMES = {
  fruits: {
    name: "Fruits",
    colors: ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF"],
    emojis: {
      "#FF0000": "🍎",
      "#00FF00": "🍏",
      "#0000FF": "🍉",
      "#FFFF00": "🍋",
      "#FF00FF": "🍇",
      "#00FFFF": "🥝",
    },
    background: "bg-gradient-to-br from-green-100 to-yellow-100",
    buttonClass:
      "bg-gradient-to-br from-green-500 to-yellow-500 hover:from-green-600 hover:to-yellow-600 rounded-xl",
    unlockCondition: 0,
    price: 0,
  },
  candies: {
    name: "Candies",
    colors: ["#FF69B4", "#FFD700", "#8A2BE2", "#00CED1", "#FF4500", "#ADFF2F"],
    emojis: {
      "#FF69B4": "🍬",
      "#FFD700": "🍭",
      "#8A2BE2": "🍫",
      "#00CED1": "🍩",
      "#FF4500": "🍪",
      "#ADFF2F": "🧁",
    },
    background: "bg-gradient-to-br from-pink-200 to-purple-200",
    buttonClass:
      "bg-gradient-to-br from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-xl",
    unlockCondition: 2,
    price: 1000,
  },
  gems: {
    name: "Gems",
    colors: ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF"],
    emojis: {
      "#FF0000": "♦️",
      "#00FF00": "❇️",
      "#0000FF": "🔷",
      "#FFFF00": "🔶",
      "#FF00FF": "💜",
      "#00FFFF": "💠",
    },
    background: "bg-gradient-to-br from-blue-200 to-indigo-200",
    buttonClass:
      "bg-gradient-to-br from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 rounded-xl",
    unlockCondition: 5,
    price: 1000,
  },
  ramadan: {
    name: "Ramadan (Special)",
    colors: ["#FFD700", "#8B4513", "#A9A9A9", "#4682B4", "#F0E68C", "#D2B48C"],
    emojis: {
      "#FFD700": "🌙",
      "#8B4513": "🕌",
      "#A9A9A9": "✨",
      "#4682B4": "🌟",
      "#F0E68C": "🌜", // ✅ fixed
      "#D2B48C": "📿", // ✅ fixed
    },
    background: "bg-gradient-to-br from-yellow-100 to-orange-200",
    buttonClass:
      "bg-gradient-to-br from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 rounded-xl",
    unlockCondition: 0,
    price: 1000,
  },
  eid: {
    name: "Eid (Special)",
    colors: ["#008000", "#FFD700", "#800080", "#FF4500", "#00BFFF", "#FFC0CB"],
    emojis: {
      "#008000": "🐑",
      "#FFD700": "🎁",
      "#800080": "🎉",
      "#FF4500": "🎈",
      "#00BFFF": "🎊",
      "#FFC0CB": "🕌",
    },
    background: "bg-gradient-to-br from-green-100 to-blue-100",
    buttonClass:
      "bg-gradient-to-br from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 rounded-xl",
    unlockCondition: 0,
    price: 1000,
  },
  christmas: {
    name: "Christmas (Special)",
    colors: ["#FF0000", "#008000", "#FFFFFF", "#FFD700", "#8B4513", "#A9A9A9"],
    emojis: {
      "#FF0000": "🎅",
      "#008000": "🎄",
      "#FFFFFF": "❄️",
      "#FFD700": "🎁",
      "#8B4513": "🦌",
      "#A9A9A9": "🔔",
    },
    background: "bg-gradient-to-br from-red-200 to-green-200",
    buttonClass:
      "bg-gradient-to-br from-red-600 to-green-600 hover:from-red-700 hover:to-green-700 rounded-xl",
    unlockCondition: 0,
    price: 1000,
  },
};

export const PLAYER_AVATARS = ["😀", "😎", "🥳", "🤩", "🤖", "👽"];

// ⚡ findAllMatches
const findAllMatches = (grid: string[][]): number[][] => {
  if (!grid || grid.length === 0 || grid[0].length === 0) return [];
  const matches: number[][] = [];
  const height = grid.length;
  const width = grid[0].length;

  const checkHorizontal = () => {
    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width - 2; ) {
        const color = grid[i][j];
        if (!color) {
          j++;
          continue;
        }
        let matchLength = 1;
        while (j + matchLength < width && grid[i][j + matchLength] === color) {
          matchLength++;
        }
        if (matchLength >= 3) {
          for (let k = 0; k < matchLength; k++) {
            matches.push([i, j + k]);
          }
          j += matchLength;
        } else {
          j++;
        }
      }
    }
  };

  const checkVertical = () => {
    for (let j = 0; j < width; j++) {
      for (let i = 0; i < height - 2; ) {
        const color = grid[i][j];
        if (!color) {
          i++;
          continue;
        }
        let matchLength = 1;
        while (i + matchLength < height && grid[i + matchLength][j] === color) {
          matchLength++;
        }
        if (matchLength >= 3) {
          for (let k = 0; k < matchLength; k++) {
            matches.push([i + k, j]);
          }
          i += matchLength;
        } else {
          i++;
        }
      }
    }
  };

  checkHorizontal();
  checkVertical();

  const seen = new Set<string>();
  return matches.filter((m) => {
    const key = `${m[0]},${m[1]}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

// ⚡ hasPossibleMoves
const hasPossibleMoves = (grid: string[][]): boolean => {
  if (!grid || grid.length === 0 || grid[0].length === 0) return false;
  const height = grid.length;
  const width = grid[0].length;
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      if (j < width - 1) {
        const copy = grid.map((r) => [...r]);
        [copy[i][j], copy[i][j + 1]] = [copy[i][j + 1], copy[i][j]];
        if (findAllMatches(copy).length > 0) return true;
      }
      if (i < height - 1) {
        const copy = grid.map((r) => [...r]);
        [copy[i][j], copy[i + 1][j]] = [copy[i + 1][j], copy[i][j]];
        if (findAllMatches(copy).length > 0) return true;
      }
    }
  }
  return false;
};

// ⚡ generateValidGrid (المعدل)
const generateValidGrid = (
  width: number,
  height: number,
  colors: string[]
): string[][] => {
  let grid: string[][];
  let attempts = 0;
  do {
    grid = Array.from({ length: height }, () =>
      Array.from(
        { length: width },
        () => colors[Math.floor(Math.random() * colors.length)]
      )
    );
    attempts++;
    if (attempts > 200) {
      console.warn("⚠️ Failed to generate valid grid after 200 attempts.");
      break;
    }
  } while (
    (findAllMatches(grid).length > 0 || !hasPossibleMoves(grid)) &&
    attempts <= 200
  );
  return grid;
};

// Main Menu
function MainMenu({
  onStart,
  onSettings,
  onInfo,
  onDevInfo,
  onProfile,
  lives,
  timeLeft,
  playerAvatar,
  currentTheme,
  seasonalBackground,
  coins,
  onDailyChallenge,
  onArcadeMode,
  onMultiplayerMode,
    onPlayerVsComputerMode,
}: any) {
  const heartEmojis = Array(lives).fill("💖").join("");

  const livesAnimation = {
    initial: { scale: 1 },
    animate: {
      scale: 1.2,
      transition: { duration: 0.5, repeat: Infinity, repeatType: "reverse" },
    },
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const backgroundClass =
    seasonalBackground ||
    currentTheme.background ||
    "bg-gradient-to-br from-purple-200 to-blue-100";
  const buttonBaseClass =
    "text-white font-bold py-2 px-4 rounded-xl shadow-sm transition duration-300 flex items-center justify-center gap-2";

    const soundManager = React.useRef(createSoundManager()).current;

    const playMoveSound = () => {
        soundManager.playMove();
    };

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center ${backgroundClass} p-200`}
    >
      {/* Top Bar */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-around items-center bg-white bg-opacity-20 backdrop-blur-sm rounded-b-xl shadow-lg">
        <div className="flex items-center bg-red-500/80 px-4 py-2 rounded-full shadow-md">
          <span className="text-3xl">💖</span>
          <span className="ml-2 text-white text-2xl font-bold">{lives}</span>
        </div>
        <div className="flex items-center bg-blue-500/80 px-4 py-2 rounded-full shadow-md">
          <span className="text-3xl">{playerAvatar}</span>
        </div>
        <div className="flex items-center bg-yellow-500/80 px-4 py-2 rounded-full shadow-md">
          <span className="text-3xl">💸</span>
          <span className="ml-2 text-white text-2xl font-bold">{coins}</span>
        </div>
      </div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center mb-8 mt-16"
      >
        <h1 className="text-7xl md:text-8xl font-extrabold leading-tight">
          <span className="bg-gradient-to-r from-pink-500 to-purple-700 bg-clip-text text-transparent drop-shadow-lg">
            MATCH
          </span>
          <span className="text-orange-500 drop-shadow-lg ml-2">3</span>
        </h1>
        <p className="text-3xl md:text-4xl font-bold text-cyan-500 tracking-wider mt-2 drop-shadow-md">
          FUN GAMES
        </p>
      </motion.div>

      {/* Play Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.5 }}
        onClick={() => {
            playMoveSound();
            onStart();
        }}
        className={`mt-10 w-24 h-24  flex items-center justify-center 
                   ${currentTheme.buttonClass} 
                   shadow-xl hover:scale-110 transition duration-300 transform-gpu`}
      >
        <Play size={50} className="text-white" fill="white" />
      </motion.button>

      {/* Extra Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="flex flex-wrap justify-center mt-6 gap-4 max-w-2xl"
      >
        <button
          className={`${currentTheme.buttonClass} ${buttonBaseClass}`}
            onClick={() => {
                playMoveSound();
                onSettings();
            }}
        >
          <Settings size={18} /> Settings
        </button>
        <button
          className={`${currentTheme.buttonClass} ${buttonBaseClass}`}
            onClick={() => {
                playMoveSound();
                onInfo();
            }}
        >
          <Info size={18} /> Info
        </button>
        <button
          className={`${currentTheme.buttonClass} ${buttonBaseClass}`}
            onClick={() => {
                playMoveSound();
                onDevInfo();
            }}
        >
          <User size={18} /> Dev
        </button>
        <button
          className={`${currentTheme.buttonClass} ${buttonBaseClass}`}
            onClick={() => {
                playMoveSound();
                onProfile();
            }}
        >
          <Trophy size={18} /> Profile
        </button>
        <button
          className={`${currentTheme.buttonClass} ${buttonBaseClass}`}
            onClick={() => {
                playMoveSound();
                onDailyChallenge();
            }}
        >
          <CalendarDays size={18} /> Daily Challenge
        </button>
        <button
          className={`${currentTheme.buttonClass} ${buttonBaseClass}`}
            onClick={() => {
                playMoveSound();
                onArcadeMode();
            }}
        >
          <Gamepad2 size={18} /> Arcade Mode
        </button>
        <button
          className={`${currentTheme.buttonClass} ${buttonBaseClass}`}
            onClick={() => {
                playMoveSound();
                onMultiplayerMode();
            }}
        >
          <Users size={18} /> Multiplayer Mode
        </button>
          <button
              className={`${currentTheme.buttonClass} ${buttonBaseClass}`}
              onClick={() => {
                  playMoveSound();
                  onPlayerVsComputerMode();
              }}
          >
              <Computer size={18} /> Player vs Computer
          </button>
      </motion.div>
    </div>
  );
}

const HINT_DELAY_MS = 10000; // 10 seconds of inactivity to trigger a hint
const COMBO_DURATION_SECONDS = 3; // Duration for the combo timer

function App() {
  const [score, setScore] = useState(0);
  const [matches, setMatches] = useState<number[][]>([]);
  const [gameWidth, setGameWidth] = useState(8);
  const [gameHeight, setGameHeight] = useState(8);
  const [gameOver, setGameOver] = useState(false);
  const [
    gameMode,
    setGameMode,
  ] = useState<
    | "menu"
    | "levelSelect"
    | "playing"
    | "dailyChallenge"
    | "arcadeMode"
    | "multiplayerMode"
    | "playerVsComputer"
  >("menu"); // New state for game flow
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
  const [
    selectedPowerUpToBuy,
    setSelectedPowerUpToBuy,
  ] = useState<PowerUpType | null>(null); // Track which power-up to buy
  const [showAdForLives, setShowAdForLives] = useState(false); // New state for ad for lives modal

  // Customization states
  const [selectedTheme, setSelectedTheme] = useState<keyof typeof THEMES>(
    "fruits"
  );
  const [playerAvatar, setPlayerAvatar] = useState<string>(PLAYER_AVATARS[0]);
  const [totalLevelsCompleted, setTotalLevelsCompleted] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [seasonalBackground, setSeasonalBackground] = useState<string | null>(
    null
  ); // New state for seasonal background
  const [coins, setCoins] = useState(0); // New state for coins

  // Combo score state
  const [combo, setCombo] = useState(0);
  const [showCombo, setShowCombo] = useState(false);
  const [comboTimer, setComboTimer] = useState(0); // New state for combo timer

  // Power-up states
  const [
    powerUpInventory,
    setPowerUpInventory,
  ] = useState<{ [key in PowerUpType]: number }>({
    Hammer: 3,
    Bomb: 2,
    ColorSwap: 3,
  });
  const [activePowerUp, setActivePowerUp] = useState<PowerUpType | null>(null);

  // Level progression states
  const [currentLevelId, setCurrentLevelId] = useState<number | null>(null);
  const [unlockedLevels, setUnlockedLevels] = useState<number[]>([]);
  const [unlockedThemes, setUnlockedThemes] = useState<string[]>(["fruits"]); // Initially unlocked themes

  const currentLevelConfig = currentLevelId
    ? LEVEL_DATA.find((l) => l.id === currentLevelId)
    : null;
  const currentTheme = THEMES[selectedTheme];

  // Sound Manager
  const soundManager = React.useRef(createSoundManager());

  // Background Music
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);

  // Hint System states
  const [hintCoordinates, setHintCoordinates] = useState<[[number, number], [number, number]] | null>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

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
    const storedTotalLevelsCompleted = localStorage.getItem(
      "totalLevelsCompleted"
    );
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
  useEffect(() => localStorage.setItem("selectedTheme", selectedTheme), [
    selectedTheme,
  ]);
  useEffect(() => localStorage.setItem("playerAvatar", playerAvatar), [
    playerAvatar,
  ]);
  useEffect(() =>
    localStorage.setItem("totalLevelsCompleted", totalLevelsCompleted.toString()),
    [totalLevelsCompleted]
  );
  useEffect(() => localStorage.setItem("highScore", highScore.toString()), [
    highScore,
  ]);
  useEffect(() =>
    localStorage.setItem("powerUpInventory", JSON.stringify(powerUpInventory)),
    [powerUpInventory]
  );
  useEffect(() => {
    seasonalBackground
      ? localStorage.setItem("seasonalBackground", seasonalBackground)
      : localStorage.removeItem("seasonalBackground");
  }, [seasonalBackground]);
  useEffect(() => localStorage.setItem("coins", coins.toString()), [coins]);
  useEffect(() =>
    localStorage.setItem("unlockedThemes", JSON.stringify(unlockedThemes)),
    [unlockedThemes]
  );

  // Load level progression from storage
  useEffect(() => {
    // Always unlock all levels for demonstration/testing purposes
    setUnlockedLevels(LEVEL_DATA.map((level) => level.id));

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
      soundManager.current.playMatch(); // Play match sound
      setScore((prev) => {
        const newScore = prev + matches.length * 10 * (combo > 0 ? combo : 1);
        // Update high score if current score is higher
        setHighScore((prevHighScore) => Math.max(prevHighScore, newScore));
        return newScore;
      });
      // Award coins for matches
      setCoins((prev) => prev + matches.length * 10);
      setMatches([]);

      // Combo handling
      setCombo((prev) => prev + 1);
      setComboTimer(COMBO_DURATION_SECONDS); // Reset combo timer on match
      setShowCombo(true);
    } else {
      // Reset combo if no matches (handled by comboTimer useEffect now)
      setShowCombo(false);
    }
  }, [matches, combo]);

  // Combo Timer management
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (comboTimer > 0 && gameMode === "playing") {
      timer = setInterval(() => {
        setComboTimer((prev) => prev - 1);
      }, 1000);
    } else if (comboTimer === 0 && combo > 0) {
      setCombo(0); // Reset combo when timer runs out
      setShowCombo(false);
    }
    return () => clearInterval(timer);
  }, [comboTimer, combo, gameMode]);


  // Load from storage
  useEffect(() => {
    const storedLives = localStorage.getItem("lives");
    const storedRegenerationTime = localStorage.getItem("regenerationTime");
    if (storedLives) setLives(parseInt(storedLives, 10));
    if (storedRegenerationTime)
      setRegenerationTime(parseInt(storedRegenerationTime, 10));
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

  // Function to find a valid hint move
  const findHintMove = useCallback((currentGrid: string[][]): [[number, number], [number, number]] | null => {
    if (!currentGrid || currentGrid.length === 0 || currentGrid[0].length === 0) return null;
    const height = currentGrid.length;
    const width = currentGrid[0].length;

    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        // Try swapping horizontally
        if (j < width - 1) {
          const tempGrid = currentGrid.map(row => [...row]);
          [tempGrid[i][j], tempGrid[i][j + 1]] = [tempGrid[i][j + 1], tempGrid[i][j]];
          if (findAllMatches(tempGrid).length > 0) {
            return [[i, j], [i, j + 1]];
          }
        }
        // Try swapping vertically
        if (i < height - 1) {
          const tempGrid = currentGrid.map(row => [...row]);
          [tempGrid[i][j], tempGrid[i + 1][j]] = [tempGrid[i + 1][j], tempGrid[i][j]];
          if (findAllMatches(tempGrid).length > 0) {
            return [[i, j], [i + 1, j]];
          }
        }
      }
    }
    return null;
  }, [findAllMatches]);

  // Idle timer management
  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    setHintCoordinates(null); // Clear hint when activity occurs
    if (gameMode === "playing") {
      idleTimerRef.current = setTimeout(() => {
        if (grid) { // Only find hint if a grid exists
          const hint = findHintMove(grid);
          if (hint) {
            setHintCoordinates(hint);
          }
        }
      }, HINT_DELAY_MS);
    }
  }, [gameMode, grid, findHintMove]);

  // Start/reset timer when game mode changes to playing or grid updates
  useEffect(() => {
    if (gameMode === "playing") {
      resetIdleTimer();
    } else {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      setHintCoordinates(null);
    }
    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, [gameMode, grid, resetIdleTimer]);

  const handleMatch = (newMatches: number[][]) => {
    resetIdleTimer(); // Reset timer on match
    setMatches(newMatches);
  };
  const handleGameOver = () => {
    soundManager.current.playGameOver(); // Play game over sound
    setIsGameOver(true);
    setGameOver(true);
  };

  // When starting a level
  const handleStartGame = () => {
    soundManager.current.playStart(); // Play start sound
    setGameMode("levelSelect"); // Navigate to level select screen
  };

  // Also apply the same logic when restarting after Game Over
  const resetGame = () => {
    setScore(0);
    setCombo(0); // Reset combo
    setShowCombo(false); // Hide combo display
    setComboTimer(0); // Reset combo timer
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
    resetIdleTimer(); // Reset timer on game reset
  };

  const handleExitClick = () => {
    setLives((prev) => Math.max(prev - 1, 0));
    setIsGameOver(false);
    setGameOver(false);
    setGameMode("levelSelect");
    setScore(0); // Reset score
    setCombo(0); // Reset combo
    setShowCombo(false); // Hide combo display
    setComboTimer(0); // Reset combo timer
    if (currentLevelConfig) {
      setMovesLeft(currentLevelConfig.maxMoves); // Reset moves
    }
    setGrid(null); // Reset grid
    resetIdleTimer(); // Reset timer on exit
  };

  const handleAdClick = () => {
    window.open("https://t.me/AhmedRe3oo0", "_blank");
    setMovesLeft((prev) => prev + 10);
    setIsGameOver(false);
    setGameOver(false);
    resetIdleTimer(); // Reset timer on ad click
  };

  const isLevelCompleted =
    currentLevelConfig && score >= currentLevelConfig.goalScore && movesLeft >= 0;

  useEffect(() => {
    if (gameMode === "playing" && currentLevelConfig) {
      if (score >= currentLevelConfig.goalScore) {
        soundManager.current.playLevelUp(); // Play level up sound
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
    soundManager.current.playSpecial(); // Play special sound
    setPowerUpInventory((prev) => ({
      ...prev,
      [type]: Math.max(0, prev[type] - 1),
    }));
    setActivePowerUp(null); // Deactivate after use
    resetIdleTimer(); // Reset timer on power-up use
  }, [resetIdleTimer]);

  const isThemeUnlocked = (themeKey: string) => unlockedThemes.includes(themeKey);

  const handleThemePurchase = (themeKey: string) => {
    const theme = THEMES[themeKey];
    if (coins >= theme.price && !isThemeUnlocked(themeKey)) {
      setCoins((prev) => prev - theme.price);
      setUnlockedThemes((prev) => [...prev, themeKey]);
    }
  };

  const handlePurchase = (type: PowerUpType, purchaseType: "coins" | "ad") => {
    const powerUpCost = 250; // Define the cost of a power-up

    if (purchaseType === "coins") {
      if (coins >= powerUpCost) {
        setCoins((prev) => prev - powerUpCost);
        setPowerUpInventory((prev) => ({
          ...prev,
          [type]: prev[type] + 1, // Add one to the power-up count
        }));
      } else {
        alert("Not enough coins!");
      }
    } else if (purchaseType === "ad") {
      window.open("https://t.me/AhmedRe3oo0", "_blank");
      setPowerUpInventory((prev) => ({
        ...prev,
        [type]: prev[type] + 1, // Add one to the power-up count
      }));
    }
    setShowPurchaseModal(false); // Close the purchase modal
    resetIdleTimer(); // Reset timer on purchase
  };

  const handleDailyChallenge = () => {
    // Implement daily challenge logic here
    setGameMode("dailyChallenge");
    resetIdleTimer(); // Reset timer on mode change
  };

  const handleArcadeMode = () => {
    // Implement arcade mode logic here
    setGameMode("arcadeMode");
    resetIdleTimer(); // Reset timer on mode change
  };

  const handleMultiplayerMode = () => {
    // Implement multiplayer mode logic here
    setGameMode("multiplayerMode");
    resetIdleTimer(); // Reset timer on mode change
  };

    const handlePlayerVsComputerMode = () => {
        // Implement player vs computer mode logic here
        setGameMode("playerVsComputer");
        resetIdleTimer(); // Reset timer on mode change
    };

  // Check if lives are zero and show the ad for lives modal
  useEffect(() => {
    if (lives === 0 && gameMode !== "menu") {
      setShowAdForLives(true);
    } else {
      setShowAdForLives(false);
    }
  }, [lives, gameMode]);

  const handleWatchAdForLives = () => {
    window.open("https://t.me/AhmedRe3oo0", "_blank");
    setLives(5);
    setShowAdForLives(false);
    setRegenerationTime(null);
    resetIdleTimer(); // Reset timer on watching ad for lives
  };

  // Daily Challenge```typescript

  // Daily Challenge setup
  const [dailyChallengeGrid, setDailyChallengeGrid] = useState<
    string[][] | null
  >(null);
  const [dailyChallengeGoal, setDailyChallengeGoal] = useState(5000); // Example goal
  const [dailyChallengeMoves, setDailyChallengeMoves] = useState(40); // Example moves

  // Generate daily challenge grid
  useEffect(() => {
    if (gameMode === "dailyChallenge") {
      const newGrid = generateValidGrid(8, 8, currentTheme.colors);
      setDailyChallengeGrid(newGrid);
      setMovesLeft(dailyChallengeMoves); // Set moves for the challenge
      setScore(0); // Reset score
      setIsGameOver(false);
      setGameOver(false);
      resetIdleTimer(); // Reset timer on daily challenge start
    }
  }, [gameMode, currentTheme.colors, dailyChallengeMoves, resetIdleTimer]);

  // Arcade Mode setup
  const [arcadeLevel, setArcadeLevel] = useState(1);
  const [arcadeGoal, setArcadeGoal]= useState(2000);
  const [arcadeMoves, setArcadeMoves] = useState(30);
  const [arcadeGrid, setArcadeGrid]= useState<string[][] | null>(null);

  // Generate arcade grid
  useEffect(() => {
    if (gameMode === "arcadeMode") {
      const newGrid = generateValidGrid(8, 8, currentTheme.colors);
      setArcadeGrid(newGrid);
      setMovesLeft(arcadeMoves);
      setScore(0);
      setIsGameOver(false);
      setGameOver(false);
      resetIdleTimer(); // Reset timer on arcade mode start
    }
  }, [gameMode, currentTheme.colors, arcadeMoves, resetIdleTimer]);

  // Multiplayer Mode setup
  const [multiplayerGrid, setMultiplayerGrid] = useState<string[][] | null>(
    null
  );
  const [multiplayerGoal, setMultiplayerGoal] = useState(6000);
  const [multiplayerMoves, setMultiplayerMoves] = useState(50);

  // Generate multiplayer grid
  useEffect(() => {
    if (gameMode === "multiplayerMode") {
      const newGrid = generateValidGrid(8, 8, currentTheme.colors);
      setMultiplayerGrid(newGrid);
      setMovesLeft(multiplayerMoves);
      setScore(0);
      setIsGameOver(false);
      setGameOver(false);
      resetIdleTimer(); // Reset timer on multiplayer mode start
    }
  }, [gameMode, currentTheme.colors, multiplayerMoves, resetIdleTimer]);

    // Player vs Computer Mode setup
    const [playerVsComputerGrid, setPlayerVsComputerGrid] = useState<string[][] | null>(null);
    const [playerVsComputerGoal, setPlayerVsComputerGoal] = useState(4000);
    const [playerVsComputerMoves, setPlayerVsComputerMoves] = useState(40);

    // Generate player vs computer grid
    useEffect(() => {
        if (gameMode === "playerVsComputer") {
            const newGrid = generateValidGrid(8, 8, currentTheme.colors);
            setPlayerVsComputerGrid(newGrid);
            setMovesLeft(playerVsComputerMoves);
            setScore(0);
            setIsGameOver(false);
            setGameOver(false);
            resetIdleTimer(); // Reset timer on player vs computer mode start
        }
    }, [gameMode, currentTheme.colors, playerVsComputerMoves, resetIdleTimer]);

  // Background Music setup
  useEffect(() => {
    backgroundMusicRef.current = new Audio("/music.mp3"); // Replace with your music file
    backgroundMusicRef.current.loop = true;
    backgroundMusicRef.current.volume = 0.5; // Adjust volume as needed

    const playMusic = () => {
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.play().catch(error => {
          console.error("Failed to play background music:", error);
        });
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        playMusic();
      } else {
        if (backgroundMusicRef.current) {
          backgroundMusicRef.current.pause();
        }
      }
    };

    // Play music when the component mounts and when the tab is visible
    playMusic();

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      // Clean up the event listener and pause the music when the component unmounts
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.pause();
      }
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      {gameMode === "menu" && (
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
            onPlayerVsComputerMode={handlePlayerVsComputerMode}
        />
      )}

      {gameMode === "levelSelect" && (
        <LevelMap
          unlockedLevels={unlockedLevels}
          onLevelSelect={(levelId) => {
            setCurrentLevelId(levelId);
            setGameMode("playing");
            setScore(0); // Reset score for newlevel
            setGameOver(false); // Ensuregame is not over
            setIsGameOver(false);
            setGrid(null); // Reset the grid
            setMovesLeft(
              currentLevelConfig ? currentLevelConfig.maxMoves : 0
            ); // Reset moves
            setCombo(0); // Reset combo
            setComboTimer(0); // Reset combo timer
            setShowCombo(false); // Hide combo display
            resetIdleTimer(); // Reset timer on level select
          }}
          onBackToMenu={() => setGameMode("menu")}
          currentLevelId={currentLevelId}
        />
      )}

      {gameMode === "playing" && currentLevelConfig && (
        <div
          className={`p-8 rounded-xl shadow-lg border-2 border-gray-200 relative ${currentTheme.background}`}
        >
          <div className="absolute top-4 right-4">
            <button
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-xl shadow-md transition duration-300"
              onClick={handleExitClick}
            >
              <X size={20} />
              {isGameOver && <span className="ml-2">Game Over</span>}
            </button>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Level {currentLevelConfig.id}: {currentLevelConfig.name}
          </h1>
          <ScoreBoard
            score={score}
            currentLevelId={currentLevelConfig.id}
            goalScore={currentLevelConfig.goalScore}
            movesLeft={movesLeft} // Pass movesLeft to ScoreBoard
            combo={combo} // Pass combo to ScoreBoard
            comboTimer={comboTimer} // Pass comboTimer to ScoreBoard
          />
          <div>💖: {lives}</div>
          <div>💸: {coins}</div>{" "}
          {/* Display coins */}
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
            soundManager={soundManager.current} // Pass soundManager to GameGrid
            hintCoordinates={hintCoordinates} // Pass hint coordinates
            resetIdleTimer={resetIdleTimer} // Pass reset function
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
      {gameMode === "dailyChallenge" && dailyChallengeGrid && (
        <div className="p-8 rounded-xl shadow-lg border-2 border-gray-200 relative bg-gradient-to-br from-purple-200 to-blue-100">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Daily Challenge
          </h1>
          <ScoreBoard
            score={score}
            currentLevelId={0}
            goalScore={dailyChallengeGoal}
            movesLeft={movesLeft} // Pass movesLeft to ScoreBoard
            combo={combo} // Pass combo to ScoreBoard
            comboTimer={comboTimer} // Pass comboTimer to ScoreBoard
          />
          <p className="text-gray-700 mb-4">
            Test your skills with a new challenge every day!
          </p>
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
            soundManager={soundManager.current} // Pass soundManager to GameGrid
            hintCoordinates={hintCoordinates} // Pass hint coordinates
            resetIdleTimer={resetIdleTimer} // Pass reset function
          />
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl shadow-md transition duration-300 mt-4"
            onClick={() => setGameMode("menu")}
          >
            Back to Menu
          </button>
        </div>
      )}

      {/* Arcade Mode */}
      {gameMode === "arcadeMode" && arcadeGrid && (
        <div className="p-8 rounded-xl shadow-lg border-2 border-gray-200 relative bg-gradient-to-br from-purple-200 to-blue-100">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Arcade Mode</h1>
          <ScoreBoard
            score={score}
            currentLevelId={0}
            goalScore={arcadeGoal}
            movesLeft={movesLeft}
            combo={combo} // Pass combo to ScoreBoard
            comboTimer={comboTimer} // Pass comboTimer to ScoreBoard
          />
          <p className="text-gray-700 mb-4">
            Endless gameplay with increasing difficulty!
          </p>
          <GameGrid
            width={8}
            height={8}
            colors={currentTheme.colors}
            emojiMap={currentTheme.emojis}
            onMatch={handleMatch}
            setGameOver={handleGameOver}
            hasPossibleMoves={hasPossibleMoves}
            findAllMatches={findAllMatches}
            setGrid={setArcadeGrid}
            activePowerUp={activePowerUp}
            usePowerUp={usePowerUp}
            gridColors={currentTheme.colors}
            movesLeft={movesLeft}
            setMovesLeft={setMovesLeft}
            onNoPowerUpsAvailable={() => setShowPurchaseModal(true)}
            setSelectedPowerUpToBuy={setSelectedPowerUpToBuy}
            powerUpInventory={powerUpInventory}
            soundManager={soundManager.current} // Pass soundManager to GameGrid
            hintCoordinates={hintCoordinates} // Pass hint coordinates
            resetIdleTimer={resetIdleTimer} // Pass reset function
          />
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl shadow-md transition duration-300 mt-4"
            onClick={() => setGameMode("menu")}
          >
            Back to Menu
          </button>
        </div>
      )}

      {/* Multiplayer Mode */}
      {gameMode === "multiplayerMode" && multiplayerGrid && (
        <div className="p-8 rounded-xl shadow-lg border-2 border-gray-200 relative bg-gradient-to-br from-purple-200 to-blue-100">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Multiplayer Mode
          </h1>
          <ScoreBoard
            score={score}
            currentLevelId={0}
            goalScore={multiplayerGoal}
            movesLeft={movesLeft}
            combo={combo} // Pass combo to ScoreBoard
            comboTimer={comboTimer} // Pass comboTimer to ScoreBoard
          />
          <p className="text-gray-700 mb-4">
            Challenge your friends in real-time!
          </p>
          <GameGrid
            width={8}
            height={8}
            colors={currentTheme.colors}
            emojiMap={currentTheme.emojis}
            onMatch={handleMatch}
            setGameOver={handleGameOver}
            hasPossibleMoves={hasPossibleMoves}
            findAllMatches={findAllMatches}
            setGrid={setMultiplayerGrid}
            activePowerUp={activePowerUp}
            usePowerUp={usePowerUp}
            gridColors={currentTheme.colors}
            movesLeft={movesLeft}
            setMovesLeft={setMovesLeft}
            onNoPowerUpsAvailable={() => setShowPurchaseModal(true)}
            setSelectedPowerUpToBuy={setSelectedPowerUpToBuy}
            powerUpInventory={powerUpInventory}
            soundManager={soundManager.current} // Pass soundManager to GameGrid
            hintCoordinates={hintCoordinates} // Pass hint coordinates
            resetIdleTimer={resetIdleTimer} // Pass reset function
          />
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl shadow-md transition duration-300"
            onClick={() => setGameMode("menu")}
          >
            Back to Menu
          </button>
        </div>
      )}

        {/* Player vs Computer Mode */}
        {gameMode === "playerVsComputer" && playerVsComputerGrid && (
            <div className="p-8 rounded-xl shadow-lg border-2 border-gray-200 relative bg-gradient-to-br from-purple-200 to-blue-100">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">
                    Player vs Computer Mode
                </h1>
                <ScoreBoard
                    score={score}
                    currentLevelId={0}
                    goalScore={playerVsComputerGoal}
                    movesLeft={movesLeft}
                    combo={combo} // Pass combo to ScoreBoard
                    comboTimer={comboTimer} // Pass comboTimer to ScoreBoard
                />
                <p className="text-gray-700 mb-4">
                    Challenge the computer!
                </p>
                <GameGrid
                    width={8}
                    height={8}
                    colors={currentTheme.colors}
                    emojiMap={currentTheme.emojis}
                    onMatch={handleMatch}
                    setGameOver={handleGameOver}
                    hasPossibleMoves={hasPossibleMoves}
                    findAllMatches={findAllMatches}
                    setGrid={setPlayerVsComputerGrid}
                    activePowerUp={activePowerUp}
                    usePowerUp={usePowerUp}
                    gridColors={currentTheme.colors}
                    movesLeft={movesLeft}
                    setMovesLeft={setMovesLeft}
                    onNoPowerUpsAvailable={() => setShowPurchaseModal(true)}
                    setSelectedPowerUpToBuy={setSelectedPowerUpToBuy}
                    powerUpInventory={powerUpInventory}
                    soundManager={soundManager.current} // Pass soundManager to GameGrid
                    hintCoordinates={hintCoordinates} // Pass hint coordinates
                    resetIdleTimer={resetIdleTimer} // Pass reset function
                />
                <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl shadow-md transition duration-300 mt-4"
                    onClick={() => setGameMode("menu")}
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
              setGameMode("levelSelect"); // Go back to level select after game over
              setGameOver(false);
              setIsGameOver(false);
              setGrid(null); // Reset the grid
              if (!isLevelCompleted) {
                // Only lose a life if the level was not completed
                setLives((prev) => Math.max(prev - 1, 0));
              }

              if (lives === 0) {
                // If no lives left after this game over, reset lives and regen timer
                setLives(5);
                setRegenerationTime(null);
              } else if (lives > 0 && !isLevelCompleted) {
                // If lives > 0 and not completed, start regen timer
                setRegenerationTime(Date.now() + 5 * 60 * 1000);
              }
              resetIdleTimer(); // Reset timer on game over modal close
            }}
            onExit={() => {
              setLives((prev) => Math.max(prev - 1, 0));
              setGameOver(false);
              setIsGameOver(false);
              setGameMode("levelSelect");
              setScore(0); // Reset score
              setCombo(0); // Reset combo
              setShowCombo(false); // Hide combo display
              setComboTimer(0); // Reset combo timer
              if (currentLevelConfig) {
                setMovesLeft(currentLevelConfig.maxMoves); // Reset moves
              }
              setGrid(null); // Reset grid
              resetIdleTimer(); // Reset timer on game over modal exit
            }}
            onAd={() => {
              handleAdClick();
            }}
            currentLevel={currentLevelConfig}
            score={score}
            movesLeft={movesLeft}
            isLevelCompleted={isLevelCompleted}
            addWinCoins={() => setCoins((prev) => prev + 100)} // Add win coins
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
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Game Information
            </h2>
            <p>Learn more about the game and how to play.</p>
            <button
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-xl mt-4"
              onClick={() => setShowInfo(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showDeveloperInfo && (
        <div className="fixed top-0 left-0 w-full h-full bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Developer Information
            </h2>
            <p>Information about the game developers.</p>
            <button
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-xl mt-4"
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
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Buy {selectedPowerUpToBuy}?
            </h2>
            <p className="text-gray-700 mb-4">
              You can buy a {selectedPowerUpToBuy} for 250 coins or watch an ad
              to get one.
            </p>
            <div className="flex justify-center gap-4">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl shadow-md transition duration-300"
                onClick={() => handlePurchase(selectedPowerUpToBuy, "coins")}
              >
                Buy for 250 Coins
              </button>
              <button
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-xl shadow-md transition duration-300"
                onClick={() => handlePurchase(selectedPowerUpToBuy, "ad")}
              >
                Watch Ad for 1
              </button>
              <button
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-xl shadow-md transition duration-300"
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
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              No Lives Left!
            </h2>
            <p className="text-gray-700 mb-4">
              Watch an ad to get 5 lives and continue playing?
            </p>
            <div className="flex justify-center gap-4">
              <button
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-xl shadow-md transition duration-300"
                onClick={handleWatchAdForLives}
              >
                Watch Ad for Lives
              </button>
              <button
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-xl shadow-md transition duration-300"
                onClick={() => {
                  setShowAdForLives(false);
                  setGameMode("menu"); // Navigate to main menu
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showCombo && combo > 0 && (
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl font-bold text-yellow-500 z-50"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.3 }}
          >
            Combo x{combo}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
export default App;
