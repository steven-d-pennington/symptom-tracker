'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils/cn';

/** Mood scale values (1=Bad to 5=Great) */
type MoodValue = 1 | 2 | 3 | 4 | 5;

export interface EmoticonMoodSelectorProps {
  /** Currently selected mood value */
  value?: MoodValue;
  /** Callback when mood is selected */
  onChange: (mood: MoodValue) => void;
  /** Disable selection */
  disabled?: boolean;
  /** Optional CSS class name */
  className?: string;
}

/**
 * Mood option configuration with emoji and label.
 */
interface MoodOption {
  value: MoodValue;
  emoji: string;
  label: string;
  color: string; // Tailwind color class
}

/**
 * Mood options configuration array.
 * Follows AC6.2.3 specification: 😢 (1-Bad), 😟 (2-Poor), 😐 (3-Okay), 🙂 (4-Good), 😊 (5-Great)
 */
const MOOD_OPTIONS: MoodOption[] = [
  {
    value: 1,
    emoji: '😢',
    label: 'Bad',
    color: 'text-red-500'
  },
  {
    value: 2,
    emoji: '😟',
    label: 'Poor',
    color: 'text-orange-500'
  },
  {
    value: 3,
    emoji: '😐',
    label: 'Okay',
    color: 'text-yellow-500'
  },
  {
    value: 4,
    emoji: '🙂',
    label: 'Good',
    color: 'text-green-500'
  },
  {
    value: 5,
    emoji: '😊',
    label: 'Great',
    color: 'text-blue-500'
  },
];

/**
 * EmoticonMoodSelector component for daily log mood tracking (Story 6.2).
 * Displays 5 mood options with emojis for easy visual selection.
 *
 * Features:
 * - Emoji-based mood selection (1=Bad to 5=Great)
 * - Full keyboard navigation (Arrow keys, Enter/Space)
 * - ARIA accessibility attributes
 * - Visual highlight for selected mood
 * - Mobile-optimized 44x44px touch targets
 *
 * @see docs/ux-design-specification.md#Daily-Log-UX-Flow
 */
export function EmoticonMoodSelector({
  value,
  onChange,
  disabled = false,
  className
}: EmoticonMoodSelectorProps) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [announcement, setAnnouncement] = useState('');
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Update focused index when value changes
  useEffect(() => {
    if (value !== undefined) {
      const index = MOOD_OPTIONS.findIndex(option => option.value === value);
      if (index !== -1) {
        setFocusedIndex(index);
      }
    }
  }, [value]);

  const handleMoodClick = useCallback((mood: MoodValue) => {
    if (!disabled) {
      onChange(mood);
      const option = MOOD_OPTIONS.find(o => o.value === mood);
      if (option) {
        setAnnouncement(`Mood selected: ${option.label}`);
      }
    }
  }, [disabled, onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        {
          const nextIndex = (focusedIndex + 1) % MOOD_OPTIONS.length;
          setFocusedIndex(nextIndex);
          buttonRefs.current[nextIndex]?.focus();
        }
        break;

      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        {
          const prevIndex = (focusedIndex - 1 + MOOD_OPTIONS.length) % MOOD_OPTIONS.length;
          setFocusedIndex(prevIndex);
          buttonRefs.current[prevIndex]?.focus();
        }
        break;

      case 'Enter':
      case ' ':
        e.preventDefault();
        {
          // Find which button is currently focused
          const focusedButton = buttonRefs.current.find(btn => btn === document.activeElement);
          const buttonIndex = buttonRefs.current.indexOf(focusedButton || null);
          const moodValue = buttonIndex >= 0
            ? MOOD_OPTIONS[buttonIndex].value
            : MOOD_OPTIONS[focusedIndex].value;
          handleMoodClick(moodValue);
        }
        break;
    }
  }, [disabled, focusedIndex, handleMoodClick]);

  return (
    <div
      role="radiogroup"
      aria-label="How was your mood today?"
      aria-required="true"
      className={cn("flex gap-2 flex-wrap", className)}
      onKeyDown={handleKeyDown}
    >
      {MOOD_OPTIONS.map((option, index) => {
        const isSelected = value === option.value;

        return (
          <button
            key={option.value}
            ref={el => { buttonRefs.current[index] = el; }}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={`${option.label} mood`}
            onClick={() => handleMoodClick(option.value)}
            onFocus={() => setFocusedIndex(index)}
            disabled={disabled}
            tabIndex={index === focusedIndex ? 0 : -1}
            className={cn(
              // Base styles - 44x44px minimum touch target
              "min-h-[44px] min-w-[44px] px-4 py-2 rounded-lg border-2 transition-all",
              "flex flex-col items-center justify-center gap-1",

              // Selected state
              isSelected && "ring-2 ring-primary bg-primary/10 border-primary",
              !isSelected && "border-border hover:border-primary/50",

              // Disabled state
              disabled && "opacity-50 cursor-not-allowed",
              !disabled && "cursor-pointer",

              // Hover and focus states
              !disabled && "hover:bg-accent hover:scale-105",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",

              // Dark mode support
              "dark:border-gray-700 dark:hover:border-gray-600"
            )}
          >
            {/* Emoji */}
            <span className="text-3xl" aria-hidden="true">
              {option.emoji}
            </span>

            {/* Label */}
            <span className={cn(
              "text-xs font-medium whitespace-nowrap",
              option.color
            )}>
              {option.label}
            </span>
          </button>
        );
      })}

      {/* ARIA live region for screen reader announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>
    </div>
  );
}
