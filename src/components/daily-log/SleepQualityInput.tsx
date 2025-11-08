'use client';

import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils/cn';

/** Sleep quality rating (1-5 stars) */
type SleepQualityValue = 1 | 2 | 3 | 4 | 5;

export interface SleepQualityInputProps {
  /** Sleep hours value (0-24, supports 0.5 increments) */
  hours: number;
  /** Sleep quality rating (1-5 stars) */
  quality: SleepQualityValue;
  /** Callback when hours change */
  onHoursChange: (hours: number) => void;
  /** Callback when quality changes */
  onQualityChange: (quality: SleepQualityValue) => void;
  /** Optional default hours for smart defaults */
  defaultHours?: number;
  /** Optional default quality for smart defaults */
  defaultQuality?: SleepQualityValue;
  /** Disable inputs */
  disabled?: boolean;
  /** Optional CSS class name */
  className?: string;
}

/**
 * StarRating component for sleep quality (1-5 stars).
 * Provides clickable star rating interface with keyboard support.
 */
interface StarRatingProps {
  value: SleepQualityValue;
  onChange: (value: SleepQualityValue) => void;
  disabled?: boolean;
}

function StarRating({ value, onChange, disabled = false }: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const stars: SleepQualityValue[] = [1, 2, 3, 4, 5];

  const handleClick = (star: SleepQualityValue) => {
    if (!disabled) {
      onChange(star);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, star: SleepQualityValue) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        onChange(star);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (star > 1) {
          onChange((star - 1) as SleepQualityValue);
        }
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (star < 5) {
          onChange((star + 1) as SleepQualityValue);
        }
        break;
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label="Sleep quality rating (1-5 stars)"
      className="flex gap-1"
    >
      {stars.map((star) => {
        const isFilled = star <= (hoverValue ?? value);

        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={star === value}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
            onClick={() => handleClick(star)}
            onKeyDown={(e) => handleKeyDown(e, star)}
            onMouseEnter={() => setHoverValue(star)}
            onMouseLeave={() => setHoverValue(null)}
            disabled={disabled}
            className={cn(
              "text-2xl transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded",
              disabled && "opacity-50 cursor-not-allowed",
              !disabled && "cursor-pointer hover:scale-110"
            )}
          >
            <span
              className={cn(
                "transition-colors",
                isFilled ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"
              )}
            >
              {isFilled ? "⭐" : "☆"}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * SleepQualityInput component for daily log sleep tracking (Story 6.2).
 * Combines sleep hours input (0-24 with 0.5 step) and quality star rating (1-5).
 *
 * Features:
 * - Sleep hours input with validation (0-24 range)
 * - 0.5 hour increments (e.g., 7.5 hours)
 * - Star rating for quality (1-5 stars, clickable)
 * - Validation error messages
 * - Smart defaults from previous day
 *
 * @see docs/ux-design-specification.md#Daily-Log-UX-Flow
 */
export function SleepQualityInput({
  hours,
  quality,
  onHoursChange,
  onQualityChange,
  defaultHours,
  defaultQuality,
  disabled = false,
  className
}: SleepQualityInputProps) {
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleHoursChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);

    // Validate range
    if (isNaN(value)) {
      setValidationError(null);
      onHoursChange(0);
      return;
    }

    if (value < 0) {
      setValidationError("Sleep hours must be at least 0");
      return;
    }

    if (value > 24) {
      setValidationError("Sleep hours must be at most 24");
      return;
    }

    // Valid value
    setValidationError(null);
    onHoursChange(value);
  }, [onHoursChange]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Sleep Hours Input */}
      <div className="space-y-2">
        <label
          htmlFor="sleep-hours"
          className="text-sm font-medium text-foreground"
        >
          Sleep Hours
          {defaultHours !== undefined && hours === defaultHours && (
            <span className="ml-2 text-xs text-muted-foreground">
              (from yesterday)
            </span>
          )}
        </label>
        <Input
          id="sleep-hours"
          type="number"
          min="0"
          max="24"
          step="0.5"
          value={hours}
          onChange={handleHoursChange}
          disabled={disabled}
          placeholder="Enter sleep hours (e.g., 7.5)"
          aria-label="Sleep hours"
          aria-required="true"
          aria-invalid={!!validationError}
          aria-describedby={validationError ? "hours-error" : undefined}
          className={cn(
            validationError && "border-red-500 focus:ring-red-500"
          )}
        />
        {validationError && (
          <p
            id="hours-error"
            className="text-sm text-red-500"
            role="alert"
          >
            {validationError}
          </p>
        )}
      </div>

      {/* Sleep Quality Star Rating */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Sleep Quality
          {defaultQuality !== undefined && quality === defaultQuality && (
            <span className="ml-2 text-xs text-muted-foreground">
              (from yesterday)
            </span>
          )}
        </label>
        <StarRating
          value={quality}
          onChange={onQualityChange}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
