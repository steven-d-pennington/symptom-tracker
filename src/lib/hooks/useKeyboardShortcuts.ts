'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Check if the active element is a text input where typing is expected
 */
export function isTyping(): boolean {
  const target = document.activeElement as HTMLElement;

  if (!target) {
    return false;
  }

  // Check for standard input/textarea elements
  const tagName = target.tagName;
  if (tagName === 'INPUT' || tagName === 'TEXTAREA') {
    // Allow shortcuts in non-text input types (checkbox, radio, etc.)
    if (tagName === 'INPUT') {
      const inputType = (target as HTMLInputElement).type;
      const textInputTypes = ['text', 'email', 'password', 'search', 'tel', 'url', 'number', 'date', 'datetime-local', 'time', 'month', 'week'];
      return textInputTypes.includes(inputType);
    }
    return true;
  }

  // Check for contenteditable elements
  if (target.isContentEditable) {
    return true;
  }

  return false;
}

interface KeyboardShortcutsOptions {
  /**
   * If true, shortcuts are disabled (e.g., when a modal is open that needs to handle its own shortcuts)
   */
  disabled?: boolean;
}

/**
 * Global keyboard shortcuts hook
 *
 * Handles application-wide keyboard shortcuts while respecting input context.
 * Shortcuts are automatically disabled when user is typing in text fields.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   useKeyboardShortcuts();
 *   return <div>Component with keyboard shortcuts</div>;
 * }
 * ```
 */
export function useKeyboardShortcuts(options: KeyboardShortcutsOptions = {}) {
  const { disabled = false } = options;
  const router = useRouter();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't handle if disabled
    if (disabled) {
      return;
    }

    // Don't handle shortcuts when typing in text fields
    if (isTyping()) {
      return;
    }

    // Don't handle shortcuts when modifier keys are pressed (except Shift for special cases)
    if (e.ctrlKey || e.metaKey || e.altKey) {
      return;
    }

    // Global shortcuts
    switch (e.key.toLowerCase()) {
      case 'f':
        e.preventDefault();
        // Navigate to food logging
        router.push('/log/food');
        break;

      case 'b':
        e.preventDefault();
        // Navigate to body map / active flares
        router.push('/active-flares');
        break;

      case 'l':
        e.preventDefault();
        // Navigate to log page
        router.push('/log');
        break;

      case 's':
        // Only trigger if Shift is pressed (uppercase S), to avoid conflicts
        if (e.shiftKey) {
          e.preventDefault();
          // Navigate to symptom logging
          router.push('/log/symptom');
        }
        break;

      case 'm':
        e.preventDefault();
        // Navigate to medication logging
        router.push('/log/medication');
        break;

      case 't':
        e.preventDefault();
        // Navigate to trigger logging
        router.push('/log/trigger');
        break;

      case 'd':
        e.preventDefault();
        // Navigate to dashboard
        router.push('/dashboard');
        break;

      case 'c':
        e.preventDefault();
        // Navigate to calendar
        router.push('/calendar');
        break;

      case '?':
        e.preventDefault();
        // Open keyboard shortcuts help
        router.push('/help/keyboard-shortcuts');
        break;
    }
  }, [disabled, router]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
