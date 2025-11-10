"use client";

import React, { useState } from 'react';
import type { CorrelationType } from '@/types/correlation';
import type { TimelineEvent } from './TimelineView';

/**
 * PatternHighlight Props
 * Story 6.5: Task 2 - Pattern highlighting visualization system
 */
export interface PatternHighlightProps {
  event1: TimelineEvent;
  event2: TimelineEvent;
  correlationType: CorrelationType;
  lagHours: number;
  isVisible?: boolean; // Both events must be visible in viewport
}

/**
 * PatternHighlight Component
 *
 * Renders colored bands/connectors between correlated events on timeline.
 * Color coding:
 * - Orange: food-symptom correlations
 * - Red: trigger-symptom correlations
 * - Green: medication-symptom correlations
 * - Blue: food-flare correlations
 * - Purple: trigger-flare correlations
 *
 * Bands are semi-transparent and become more opaque on hover.
 */
function PatternHighlight({
  event1,
  event2,
  correlationType,
  lagHours,
  isVisible = true
}: PatternHighlightProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Don't render if events not visible
  if (!isVisible) {
    return null;
  }

  // Determine color based on correlation type
  const getColor = (): string => {
    switch (correlationType) {
      case 'food-symptom':
        return '#f97316'; // Orange
      case 'trigger-symptom':
        return '#ef4444'; // Red
      case 'medication-symptom':
        return '#22c55e'; // Green
      case 'food-flare':
        return '#3b82f6'; // Blue
      case 'trigger-flare':
        return '#a855f7'; // Purple
      default:
        return '#6b7280'; // Gray fallback
    }
  };

  // Calculate opacity based on hover state
  const opacity = isHovered ? 0.7 : 0.3;

  const color = getColor();

  // Calculate time difference for visual display
  const timeDiff = Math.abs(event2.timestamp - event1.timestamp);
  const hoursDiff = Math.round(timeDiff / (1000 * 60 * 60));

  // For now, we'll render a simple connecting line between events
  // In a future iteration, we could calculate exact pixel positions
  // based on the timeline layout and render SVG paths

  return (
    <div
      className="pattern-highlight relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        borderLeft: `3px solid ${color}`,
        opacity,
        transition: 'opacity 0.2s ease-in-out',
        marginLeft: '1rem',
        paddingLeft: '0.5rem',
        marginTop: '-0.25rem',
        marginBottom: '-0.25rem',
      }}
      title={`Pattern: ${correlationType} (${hoursDiff}h lag)`}
    >
      {/* Visual indicator showing correlation type and lag */}
      {isHovered && (
        <div
          className="absolute left-0 top-0 px-2 py-1 text-xs rounded whitespace-nowrap z-10"
          style={{
            backgroundColor: color,
            color: 'white',
            transform: 'translateX(-100%) translateX(-0.5rem)',
          }}
        >
          {correlationType} ({lagHours}h)
        </div>
      )}
    </div>
  );
}

export default PatternHighlight;
