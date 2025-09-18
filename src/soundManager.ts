export interface SoundManager {
  playMatch: () => void;
  playMove: () => void;
  playSpecial: () => void;
  playGameOver: () => void;
  playStart: () => void;
  playLevelUp: () => void;
}

export function createSoundManager(): SoundManager {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

  const playTone = (frequency: number, duration: number, type: OscillatorType = 'sine') => {
    try {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = type;
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  };

  const playChord = (frequencies: number[], duration: number) => {
    frequencies.forEach(freq => playTone(freq, duration));
  };

  return {
    playMatch: () => {
      playChord([523.25, 659.25, 783.99], 0.2); // C, E, G
    },
    
    playMove: () => {
      playTone(220, 0.1, 'square');
    },
    
    playSpecial: () => {
      setTimeout(() => playTone(523.25, 0.15), 0);
      setTimeout(() => playTone(659.25, 0.15), 100);
      setTimeout(() => playTone(783.99, 0.15), 200);
      setTimeout(() => playTone(1046.5, 0.3), 300);
    },
    
    playGameOver: () => {
      setTimeout(() => playTone(523.25, 0.3), 0);
      setTimeout(() => playTone(493.88, 0.3), 300);
      setTimeout(() => playTone(440, 0.3), 600);
      setTimeout(() => playTone(392, 0.5), 900);
    },
    
    playStart: () => {
      setTimeout(() => playTone(392, 0.2), 0);
      setTimeout(() => playTone(523.25, 0.2), 200);
      setTimeout(() => playTone(659.25, 0.3), 400);
    },
    
    playLevelUp: () => {
      setTimeout(() => playTone(523.25, 0.2), 0);
      setTimeout(() => playTone(659.25, 0.2), 150);
      setTimeout(() => playTone(783.99, 0.2), 300);
      setTimeout(() => playTone(1046.5, 0.2), 450);
      setTimeout(() => playTone(1318.5, 0.4), 600);
    }
  };
}
