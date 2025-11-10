"use client";

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { TimelineEventType } from './TimelineView';
import type { CorrelationConfidence } from '@/types/correlation';

/**
 * TimelineLayerToggle Props
 * Story 6.5: Task 6 - Timeline layer toggle component
 */
export interface TimelineLayerToggleProps {
  visibleEventTypes: Set<TimelineEventType>;
  onToggleEventType: (type: TimelineEventType) => void;
  showPatternHighlights: boolean;
  onTogglePatternHighlights: () => void;
  patternStrengthFilter: 'all' | 'strong' | 'moderate+strong';
  onPatternStrengthFilterChange: (filter: 'all' | 'strong' | 'moderate+strong') => void;
}

/**
 * Timeline Layer Preferences (localStorage)
 */
interface TimelineLayerPreferences {
  visibleEventTypes: TimelineEventType[];
  showPatternHighlights: boolean;
  patternStrengthFilter: 'all' | 'strong' | 'moderate+strong';
}

const STORAGE_KEY = 'timeline-layer-preferences';

/**
 * TimelineLayerToggle Component
 *
 * Allows users to show/hide different event types and pattern highlights.
 * Toggle state persists in localStorage.
 */
function TimelineLayerToggle({
  visibleEventTypes,
  onToggleEventType,
  showPatternHighlights,
  onTogglePatternHighlights,
  patternStrengthFilter,
  onPatternStrengthFilterChange,
}: TimelineLayerToggleProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const preferences: TimelineLayerPreferences = JSON.parse(stored);
        // Apply preferences (parent component should handle this via props)
        // This effect is mainly for initial load
      }
    } catch (error) {
      console.error('Failed to load timeline layer preferences:', error);
    }
  }, []);

  // Save preferences to localStorage when they change
  useEffect(() => {
    try {
      const preferences: TimelineLayerPreferences = {
        visibleEventTypes: Array.from(visibleEventTypes),
        showPatternHighlights,
        patternStrengthFilter,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to save timeline layer preferences:', error);
    }
  }, [visibleEventTypes, showPatternHighlights, patternStrengthFilter]);

  const eventTypeLabels: Record<TimelineEventType, string> = {
    symptom: 'Symptoms',
    food: 'Foods',
    trigger: 'Triggers',
    medication: 'Medications',
    'flare-created': 'Flares',
    'flare-updated': 'Flares',
    'flare-resolved': 'Flares',
  };

  const eventTypes: TimelineEventType[] = ['symptom', 'food', 'trigger', 'medication', 'flare-created'];

  return (
    <div className="border border-border rounded-lg p-4 bg-background">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Timeline Layers</h3>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-sm text-muted-foreground hover:text-foreground"
          aria-expanded={!isCollapsed}
          aria-label={isCollapsed ? 'Expand layer controls' : 'Collapse layer controls'}
        >
          {isCollapsed ? 'Expand' : 'Collapse'}
        </button>
      </div>

      {!isCollapsed && (
        <div className="space-y-4">
          {/* Event Type Toggles */}
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-2">Event Types</h4>
            <div className="space-y-2">
              {eventTypes.map((type) => {
                const isVisible = visibleEventTypes.has(type);
                return (
                  <label
                    key={type}
                    className="flex items-center gap-2 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={isVisible}
                      onChange={() => onToggleEventType(type)}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary"
                      aria-label={`Toggle ${eventTypeLabels[type]} visibility`}
                    />
                    <span className="text-sm text-foreground group-hover:text-primary">
                      {eventTypeLabels[type]}
                    </span>
                    {isVisible ? (
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Pattern Highlights Toggle */}
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-2">Pattern Highlights</h4>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={showPatternHighlights}
                onChange={onTogglePatternHighlights}
                className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary"
                aria-label="Toggle pattern highlights visibility"
              />
              <span className="text-sm text-foreground group-hover:text-primary">
                Show Pattern Highlights
              </span>
              {showPatternHighlights ? (
                <Eye className="w-4 h-4 text-muted-foreground" />
              ) : (
                <EyeOff className="w-4 h-4 text-muted-foreground" />
              )}
            </label>
          </div>

          {/* Pattern Strength Filter */}
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-2">Pattern Strength</h4>
            <div className="space-y-2">
              {(['all', 'strong', 'moderate+strong'] as const).map((filter) => (
                <label
                  key={filter}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <input
                    type="radio"
                    name="pattern-strength-filter"
                    checked={patternStrengthFilter === filter}
                    onChange={() => onPatternStrengthFilterChange(filter)}
                    className="w-4 h-4 border-border text-primary focus:ring-2 focus:ring-primary"
                    aria-label={`Filter patterns by ${filter} strength`}
                  />
                  <span className="text-sm text-foreground group-hover:text-primary capitalize">
                    {filter === 'moderate+strong' ? 'Moderate + Strong' : filter}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TimelineLayerToggle;

