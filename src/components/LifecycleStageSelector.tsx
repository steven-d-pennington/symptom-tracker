'use client';

import { useState, useEffect } from 'react';
import { FlareLifecycleStage } from '@/lib/db/schema';
import {
  getNextLifecycleStage,
  isValidStageTransition,
  formatLifecycleStage,
  getLifecycleStageDescription,
  getLifecycleStageIcon,
} from '@/lib/utils/lifecycleUtils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

export interface LifecycleStageSelectorProps {
  /** Current lifecycle stage (optional if no stage set yet) */
  currentStage?: FlareLifecycleStage;
  /** Callback when stage changes */
  onStageChange: (stage: FlareLifecycleStage, notes?: string) => void;
  /** Show "Suggest next" button */
  showSuggestion?: boolean;
  /** Compact mode for quick updates */
  compact?: boolean;
  /** Disable all controls */
  disabled?: boolean;
}

/**
 * Reusable lifecycle stage selector component (Story 8.2).
 * 
 * Features:
 * - Dropdown with all valid lifecycle stages
 * - Auto-suggestion for next logical stage
 * - Stage descriptions with medical context
 * - Validation to prevent invalid transitions
 * - Optional notes input for stage changes
 * - Responsive design with mobile support
 * 
 * @see docs/stories/8-2-lifecycle-stage-ui-components-and-integration.md
 */
export function LifecycleStageSelector({
  currentStage,
  onStageChange,
  showSuggestion = false,
  compact = false,
  disabled = false,
}: LifecycleStageSelectorProps) {
  const [selectedStage, setSelectedStage] = useState<FlareLifecycleStage | undefined>(currentStage);
  const [stageNotes, setStageNotes] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Update selected stage when currentStage prop changes
  useEffect(() => {
    setSelectedStage(currentStage);
  }, [currentStage]);

  // All possible lifecycle stages
  const allStages: FlareLifecycleStage[] = ['onset', 'growth', 'rupture', 'draining', 'healing', 'resolved'];

  // Get next suggested stage
  const nextStage = currentStage ? getNextLifecycleStage(currentStage) : null;
  const canSuggest = showSuggestion && nextStage !== null && currentStage !== 'resolved';

  // Handle stage selection from dropdown
  const handleStageSelect = (newStage: FlareLifecycleStage) => {
    if (disabled) return;

    // Validate transition if current stage exists
    if (currentStage) {
      const isValid = isValidStageTransition(currentStage, newStage);
      if (!isValid) {
        setValidationError(
          `Cannot transition from ${formatLifecycleStage(currentStage)} to ${formatLifecycleStage(newStage)}. Please follow the progression sequence.`
        );
        return;
      }
    }

    setValidationError(null);
    setSelectedStage(newStage);
    // Notify parent of stage change (parent decides when to save)
    onStageChange(newStage, stageNotes.trim() || undefined);
  };

  // Handle suggest next button click
  const handleSuggestNext = () => {
    if (!nextStage || disabled) return;
    setValidationError(null);
    setSelectedStage(nextStage);
    // Notify parent of suggested stage change
    onStageChange(nextStage, stageNotes.trim() || undefined);
  };

  // Handle notes change
  const handleNotesChange = (notes: string) => {
    setStageNotes(notes);
    // If stage is already selected, notify parent with updated notes
    if (selectedStage && selectedStage !== currentStage) {
      onStageChange(selectedStage, notes.trim() || undefined);
    }
  };

  return (
    <div className={cn('space-y-3', compact && 'space-y-2')}>
      {/* Current Stage Badge (if stage exists) */}
      {currentStage && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Current Stage:</span>
          <Badge variant="outline" className="gap-1.5">
            <span>{getLifecycleStageIcon(currentStage)}</span>
            <span>{formatLifecycleStage(currentStage)}</span>
          </Badge>
        </div>
      )}

      {/* Suggest Next Button */}
      {canSuggest && (
        <Button
          type="button"
          variant="outline"
          size={compact ? 'sm' : 'default'}
          onClick={handleSuggestNext}
          disabled={disabled}
          className="w-full sm:w-auto"
          aria-label={`Suggest next stage: ${nextStage ? formatLifecycleStage(nextStage) : ''}`}
        >
          💡 Suggest next: {nextStage ? formatLifecycleStage(nextStage) : ''}
        </Button>
      )}

      {/* Stage Selection Dropdown */}
      <div className="space-y-2">
        <label
          htmlFor="lifecycle-stage-select"
          className="text-sm font-medium"
        >
          Lifecycle Stage
        </label>
        <Select
          value={selectedStage}
          onValueChange={handleStageSelect}
          disabled={disabled}
        >
          <SelectTrigger
            id="lifecycle-stage-select"
            className={cn(
              'w-full',
              compact && 'h-9 text-sm',
              'min-h-[44px]' // Mobile touch target requirement
            )}
            aria-label="Select lifecycle stage"
          >
            <SelectValue placeholder="Select a stage">
              {selectedStage && (
                <div className="flex items-center gap-2">
                  <span>{getLifecycleStageIcon(selectedStage)}</span>
                  <span>{formatLifecycleStage(selectedStage)}</span>
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {allStages.map((stage) => {
              const isDisabled = currentStage
                ? !isValidStageTransition(currentStage, stage)
                : false;
              const isSelected = selectedStage === stage;

              return (
                <SelectItem
                  key={stage}
                  value={stage}
                  disabled={isDisabled}
                  className={cn(
                    'min-h-[44px]', // Mobile touch target
                    isDisabled && 'opacity-50 cursor-not-allowed',
                    isSelected && 'bg-accent'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span>{getLifecycleStageIcon(stage)}</span>
                    <span>{formatLifecycleStage(stage)}</span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Validation Error */}
      {validationError && (
        <div
          className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-2"
          role="alert"
          aria-live="polite"
        >
          {validationError}
        </div>
      )}

      {/* Stage Description */}
      {selectedStage && (
        <div className="text-sm text-muted-foreground bg-accent/50 rounded-md p-2">
          <div className="font-medium mb-1">
            {getLifecycleStageIcon(selectedStage)} {formatLifecycleStage(selectedStage)}
          </div>
          <div>{getLifecycleStageDescription(selectedStage)}</div>
        </div>
      )}

      {/* Optional Notes Input */}
      {!compact && (
        <div className="space-y-2">
          <label
            htmlFor="stage-notes"
            className="text-sm font-medium"
          >
            Notes (optional)
          </label>
          <textarea
            id="stage-notes"
            value={stageNotes}
            onChange={(e) => handleNotesChange(e.target.value)}
            disabled={disabled}
            placeholder="Add notes about this stage change..."
            maxLength={500}
            rows={3}
            className={cn(
              'w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
              'ring-offset-background placeholder:text-muted-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'min-h-[44px]' // Mobile touch target
            )}
            aria-label="Stage change notes"
          />
          <p className="text-xs text-muted-foreground text-right">
            {stageNotes.length}/500
          </p>
        </div>
      )}
    </div>
  );
}

