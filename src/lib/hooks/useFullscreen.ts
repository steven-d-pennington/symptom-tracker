"use client";

import { useState, useCallback } from "react";

interface FullscreenState {
  isFullscreen: boolean;
}

interface UseFullscreenReturn extends FullscreenState {
  enterFullscreen: () => void;
  exitFullscreen: () => void;
  toggleFullscreen: () => void;
}

/**
 * Custom hook for managing app-level fullscreen mode
 * This hides the app's UI chrome (header, nav, etc) to maximize viewport space
 * Does NOT use browser fullscreen API - stays within browser window
 *
 * @returns {UseFullscreenReturn} Fullscreen state and control functions
 */
export function useFullscreen(): UseFullscreenReturn {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Enter app fullscreen mode (hide UI chrome)
  const enterFullscreen = useCallback(() => {
    setIsFullscreen(true);
  }, []);

  // Exit app fullscreen mode (show UI chrome)
  const exitFullscreen = useCallback(() => {
    setIsFullscreen(false);
  }, []);

  // Toggle app fullscreen mode
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  return {
    isFullscreen,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen,
  };
}
