"use client";

import React from 'react';
import { Apple, AlertCircle, Pill, Activity } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { DetectedPattern } from '@/lib/services/patternDetectionService';

/**
 * PatternBadge Props
 * Story 6.5: Task 5 - Pattern badge/icon system
 */
export interface PatternBadgeProps {
  pattern: DetectedPattern;
  onClick?: () => void;
}

/**
 * PatternBadge Component
 *
 * Displays a badge icon on timeline events that are part of detected patterns.
 * Badge shows pattern type icon with correlation strength indicator.
 * Clickable to open PatternDetailPanel with more information.
 */
function PatternBadge({ pattern, onClick }: PatternBadgeProps) {
  // Determine icon based on pattern type
  const getIcon = () => {
    switch (pattern.type) {
      case 'food-symptom':
      case 'food-flare':
        return Apple;
      case 'trigger-symptom':
      case 'trigger-flare':
        return AlertCircle;
      case 'medication-symptom':
        return Pill;
      default:
        return Activity;
    }
  };

  // Determine color based on pattern type
  const getColor = (): string => {
    switch (pattern.type) {
      case 'food-symptom':
      case 'food-flare':
        return '#f97316'; // Orange
      case 'trigger-symptom':
      case 'trigger-flare':
        return '#ef4444'; // Red
      case 'medication-symptom':
        return '#22c55e'; // Green
      default:
        return '#6b7280'; // Gray
    }
  };

  // Determine if icon should be filled or outlined based on correlation strength
  const isFilled = Math.abs(pattern.coefficient) >= 0.7; // Strong correlation

  const Icon = getIcon();
  const color = getColor();

  // Generate tooltip text
  const getTooltipText = (): string => {
    const itemType = pattern.type.split('-')[0]; // 'food', 'trigger', 'medication'
    const resultType = pattern.type.includes('flare') ? 'flare' : 'symptom';

    return `This ${itemType} preceded ${resultType}s in ${pattern.frequency} instance${pattern.frequency > 1 ? 's' : ''} (ρ = ${pattern.coefficient.toFixed(2)}, ${pattern.confidence} confidence)`;
  };

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className={cn(
        "pattern-badge absolute top-2 right-2 p-1 rounded-full hover:scale-110 transition-transform",
        isFilled
          ? "text-white dark:text-foreground"
          : "bg-background/80 backdrop-blur-sm"
      )}
      style={{
        backgroundColor: isFilled ? color : `${color}33`,
        borderColor: color,
        borderWidth: isFilled ? 0 : 2,
        borderStyle: 'solid'
      }}
      title={getTooltipText()}
      aria-label={`Pattern detected: ${pattern.description}`}
    >
      <Icon
        className="w-4 h-4"
        style={{ color: isFilled ? 'white' : color }}
        fill={isFilled ? 'currentColor' : 'none'}
        strokeWidth={isFilled ? 0 : 2}
      />
    </button>
  );
}

export default PatternBadge;
