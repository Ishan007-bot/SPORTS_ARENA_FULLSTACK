import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import './Timer.css';

interface TimerProps {
  initialTime?: number; // in seconds
  onTimeUpdate?: (time: number) => void;
  onTimeComplete?: () => void;
  onHalfComplete?: () => void;
  className?: string;
  autoStart?: boolean;
  halfDuration?: number; // in seconds
  shouldStop?: boolean; // NEW: stop timer when true
}

const Timer: React.FC<TimerProps> = ({ 
  initialTime = 0, 
  onTimeUpdate, 
  onTimeComplete,
  onHalfComplete,
  className = '',
  autoStart = false,
  halfDuration,
  shouldStop = false
}) => {
  const [time, setTime] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-start effect
  useEffect(() => {
    if (autoStart && !isRunning && !isPaused) {
      start();
    }
  }, [autoStart]);

  // Stop timer when shouldStop becomes true
  useEffect(() => {
    if (shouldStop && isRunning) {
      setIsRunning(false);
      setIsPaused(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [shouldStop, isRunning]);

  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTime(prevTime => {
          const newTime = prevTime + 1;
          onTimeUpdate?.(newTime);
          
          // Check if half is completed
          if (halfDuration && newTime >= halfDuration) {
            onHalfComplete?.();
          }
          
          return newTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused, onTimeUpdate, onHalfComplete, halfDuration]);

  const start = () => {
    setIsRunning(true);
    setIsPaused(false);
  };

  const pause = () => {
    setIsPaused(true);
  };

  const resume = () => {
    setIsPaused(false);
  };

  const reset = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTime(initialTime);
    onTimeUpdate?.(initialTime);
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div 
      className={`timer-container ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="timer-display">
        <span className="timer-time">{formatTime(time)}</span>
        <div className="timer-status">
          {isRunning ? (isPaused ? 'PAUSED' : 'RUNNING') : 'STOPPED'}
        </div>
      </div>
      
      <div className="timer-controls">
        {!isRunning ? (
          <button 
            className="timer-btn timer-btn-start"
            onClick={start}
            title="Start Timer"
          >
            ▶️ Start
          </button>
        ) : isPaused ? (
          <button 
            className="timer-btn timer-btn-resume"
            onClick={resume}
            title="Resume Timer"
          >
            ▶️ Resume
          </button>
        ) : (
          <button 
            className="timer-btn timer-btn-pause"
            onClick={pause}
            title="Pause Timer"
          >
            ⏸️ Pause
          </button>
        )}
        
        <button 
          className="timer-btn timer-btn-reset"
          onClick={reset}
          title="Reset Timer"
        >
          🔄 Reset
        </button>
      </div>
    </motion.div>
  );
};

export default Timer;
