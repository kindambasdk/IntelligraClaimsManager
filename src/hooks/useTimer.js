// src/hooks/useTimer.js
import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for handling timers with cleanup
 * @param {number} duration - Duration in milliseconds
 * @param {Function} onTimeout - Callback when timer expires
 * @param {boolean} autoStart - Whether to start timer automatically
 * @returns {Object} Timer controls and state
 */
export const useTimer = (duration = 4000, onTimeout = null, autoStart = false) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isComplete, setIsComplete] = useState(false);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const onTimeoutRef = useRef(onTimeout);

  // Update callback ref when it changes
  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  // Start the timer
  const start = useCallback(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setIsRunning(true);
    setIsComplete(false);
    setTimeLeft(duration);
    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, duration - elapsed);
      
      setTimeLeft(remaining);

      if (remaining <= 0) {
        setIsRunning(false);
        setIsComplete(true);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        if (onTimeoutRef.current) {
          onTimeoutRef.current();
        }
      }
    }, 100);
  }, [duration]);

  // Stop the timer
  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRunning(false);
    setTimeLeft(0);
  }, []);

  // Reset the timer
  const reset = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRunning(false);
    setIsComplete(false);
    setTimeLeft(duration);
    startTimeRef.current = null;
  }, [duration]);

  // Restart the timer
  const restart = useCallback(() => {
    reset();
    start();
  }, [reset, start]);

  // Auto-start on mount if specified
  useEffect(() => {
    if (autoStart) {
      start();
    }
    // Cleanup on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [autoStart, start]);

  // Format time left for display
  const formatTimeLeft = useCallback((format = 'seconds') => {
    const seconds = Math.ceil(timeLeft / 1000);
    const milliseconds = timeLeft;
    
    switch (format) {
      case 'seconds':
        return seconds;
      case 'milliseconds':
        return milliseconds;
      case 'full':
        return `${seconds}s`;
      default:
        return seconds;
    }
  }, [timeLeft]);

  // Check if timer is expired
  const isExpired = timeLeft <= 0;

  // Get progress percentage (0-100)
  const getProgress = useCallback(() => {
    if (duration === 0) return 100;
    return Math.max(0, (timeLeft / duration) * 100);
  }, [timeLeft, duration]);

  return {
    // State
    timeLeft,
    isRunning,
    isComplete,
    isExpired,
    
    // Actions
    start,
    stop,
    reset,
    restart,
    
    // Utilities
    formatTimeLeft,
    getProgress,
    
    // Raw timer ref (for advanced use)
    timerRef
  };
};

// Convenience hook for countdown timers with seconds
export const useCountdown = (seconds = 4, onComplete = null) => {
  const { 
    timeLeft, 
    isRunning, 
    isComplete, 
    start, 
    stop, 
    reset, 
    restart,
    formatTimeLeft,
    isExpired
  } = useTimer(seconds * 1000, onComplete);

  return {
    seconds: Math.ceil(timeLeft / 1000),
    isRunning,
    isComplete,
    isExpired,
    start,
    stop,
    reset,
    restart,
    formatTimeLeft: () => formatTimeLeft('full')
  };
};

// Hook for auto-dismissing popups
export const useAutoDismiss = (duration = 4000, onDismiss = null) => {
  const [isVisible, setIsVisible] = useState(false);
  const { start, stop, reset, isComplete, timeLeft } = useTimer(duration, () => {
    setIsVisible(false);
    if (onDismiss) onDismiss();
  });

  const show = useCallback(() => {
    setIsVisible(true);
    reset();
    start();
  }, [reset, start]);

  const dismiss = useCallback(() => {
    setIsVisible(false);
    stop();
    if (onDismiss) onDismiss();
  }, [stop, onDismiss]);

  return {
    isVisible,
    show,
    dismiss,
    timeLeft,
    isComplete,
    progress: duration > 0 ? ((duration - timeLeft) / duration) * 100 : 0
  };
};

// Default export
export default useTimer;