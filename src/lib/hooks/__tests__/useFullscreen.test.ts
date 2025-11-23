/**
 * Tests for useFullscreen hook
 * Story 3.7.4 - Full-Screen Mode (App-level fullscreen, not browser fullscreen)
 */

import { renderHook, act } from '@testing-library/react';
import { useFullscreen } from '../useFullscreen';

describe('useFullscreen', () => {
  describe('App-level fullscreen state management', () => {
    it('should initialize with fullscreen off', () => {
      const { result } = renderHook(() => useFullscreen());

      expect(result.current.isFullscreen).toBe(false);
    });

    it('should enter app fullscreen mode', () => {
      const { result } = renderHook(() => useFullscreen());

      act(() => {
        result.current.enterFullscreen();
      });

      expect(result.current.isFullscreen).toBe(true);
    });

    it('should exit app fullscreen mode', () => {
      const { result } = renderHook(() => useFullscreen());

      // First enter fullscreen
      act(() => {
        result.current.enterFullscreen();
      });

      expect(result.current.isFullscreen).toBe(true);

      // Then exit
      act(() => {
        result.current.exitFullscreen();
      });

      expect(result.current.isFullscreen).toBe(false);
    });

    it('should toggle app fullscreen state', () => {
      const { result } = renderHook(() => useFullscreen());

      expect(result.current.isFullscreen).toBe(false);

      // Toggle to enter
      act(() => {
        result.current.toggleFullscreen();
      });

      expect(result.current.isFullscreen).toBe(true);

      // Toggle to exit
      act(() => {
        result.current.toggleFullscreen();
      });

      expect(result.current.isFullscreen).toBe(false);
    });

    it('should maintain state across multiple toggles', () => {
      const { result } = renderHook(() => useFullscreen());

      for (let i = 0; i < 5; i++) {
        act(() => {
          result.current.toggleFullscreen();
        });
        expect(result.current.isFullscreen).toBe(true);

        act(() => {
          result.current.toggleFullscreen();
        });
        expect(result.current.isFullscreen).toBe(false);
      }
    });

    it('should allow manual enter/exit without affecting toggle', () => {
      const { result } = renderHook(() => useFullscreen());

      act(() => {
        result.current.enterFullscreen();
      });
      expect(result.current.isFullscreen).toBe(true);

      act(() => {
        result.current.toggleFullscreen();
      });
      expect(result.current.isFullscreen).toBe(false);

      act(() => {
        result.current.exitFullscreen();
      });
      expect(result.current.isFullscreen).toBe(false);

      act(() => {
        result.current.toggleFullscreen();
      });
      expect(result.current.isFullscreen).toBe(true);
    });
  });
});
