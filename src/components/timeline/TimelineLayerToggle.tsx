"use client";
// Force rebuild

import React, { useState, useEffect } from 'react';
import { Filter, Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { TimelineEventType } from './TimelineView';

export interface TimelineLayerToggleProps {
  visibleEventTypes: Set<TimelineEventType>;
  onToggleEventType: (type: TimelineEventType) => void;
  showPatternHighlights: boolean;
  onTogglePatternHighlights: () => void;
  patternStrengthFilter: 'all' | 'strong' | 'moderate+strong';
  onPatternStrengthFilterChange: (filter: 'all' | 'strong' | 'moderate+strong') => void;
}

const STORAGE_KEY = 'timeline-layer-preferences';

export default function TimelineLayerToggle({
  visibleEventTypes,
  onToggleEventType,
  showPatternHighlights,
  onTogglePatternHighlights,
  patternStrengthFilter,
  onPatternStrengthFilterChange,
}: TimelineLayerToggleProps) {
  const [isMounted, setIsMounted] = useState(false);

  // Load/Save preferences (same logic as before)
  useEffect(() => {
    setIsMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        // Logic handled by parent for initial state, this is just for side effects if needed
      }
    } catch (error) {
      console.error('Failed to load timeline layer preferences:', error);
    }
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    try {
      const preferences = {
        visibleEventTypes: Array.from(visibleEventTypes),
        showPatternHighlights,
        patternStrengthFilter,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to save timeline layer preferences:', error);
    }
  }, [visibleEventTypes, showPatternHighlights, patternStrengthFilter, isMounted]);

  const eventTypes: { type: TimelineEventType; label: string }[] = [
    { type: 'symptom', label: 'Symptoms' },
    { type: 'food', label: 'Food' },
    { type: 'trigger', label: 'Triggers' },
    { type: 'medication', label: 'Meds' },
    { type: 'flare-created', label: 'Flares' },
  ];

  if (!isMounted) {
    return <div className="h-12 mb-6 bg-muted/10 rounded-lg animate-pulse" />;
  }

  return (
    <div className="sticky top-0 z-10 py-2 bg-background/80 backdrop-blur-md border-b border-border/50 mb-6">
      <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        <div className="flex items-center mr-2 text-muted-foreground">
          <Filter className="w-4 h-4 mr-1" />
          <span className="text-xs font-medium uppercase tracking-wider">Filters</span>
        </div>

        {/* Event Type Pills */}
        {eventTypes.map(({ type, label }) => {
          const isVisible = visibleEventTypes.has(type);
          return (
            <button
              key={type}
              onClick={() => onToggleEventType(type)}
              className={cn(
                "flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border",
                isVisible
                  ? "bg-primary/10 border-primary/20 text-primary-dark shadow-sm"
                  : "bg-muted/50 border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {isVisible && <Check className="w-3 h-3 mr-1.5" />}
              {label}
            </button>
          );
        })}

        <div className="w-px h-6 bg-border mx-1" />

        {/* Pattern Toggle */}
        <button
          onClick={onTogglePatternHighlights}
          className={cn(
            "flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border",
            showPatternHighlights
              ? "bg-purple-500/10 border-purple-500/20 text-purple-700 dark:text-purple-300 shadow-sm"
              : "bg-muted/50 border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Sparkles className="w-3 h-3 mr-1.5" />
          Patterns
        </button>
      </div>
    </div>
  );
}
