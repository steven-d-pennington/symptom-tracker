'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils/cn';
import { bodyMarkerRepository } from '@/lib/repositories/bodyMarkerRepository';
import { BodyMarkerRecord, FlareLifecycleStage } from '@/lib/db/schema';
import { getBodyRegionById } from '@/lib/data/bodyRegions';
import { FlareQuickUpdate } from '@/types/daily-log';
import { LifecycleStageSelector } from '@/components/LifecycleStageSelector';
import { formatLifecycleStage, getLifecycleStageIcon } from '@/lib/utils/lifecycleUtils';

export interface FlareQuickUpdateListProps {
  /** User ID for fetching flares */
  userId: string;
  /** Callback when flare is updated (for adding to dailyLog.flareUpdates) */
  onFlareUpdate?: (update: FlareQuickUpdate) => void;
  /** Optional CSS class name */
  className?: string;
}

/**
 * Inline update form for a single flare.
 */
interface FlareUpdateFormProps {
  flare: BodyMarkerRecord;
  userId: string;
  onSave: (update: FlareQuickUpdate) => Promise<void>;
  onCancel: () => void;
}

function FlareUpdateForm({ flare, userId, onSave, onCancel }: FlareUpdateFormProps) {
  const [severity, setSeverity] = useState(flare.currentSeverity);
  const [trend, setTrend] = useState<'improving' | 'stable' | 'worsening'>('stable');
  const [notes, setNotes] = useState('');
  const [interventions, setInterventions] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showLifecycleDetails, setShowLifecycleDetails] = useState(false);

  // Handle lifecycle stage change (immediate save for quick updates)
  const handleLifecycleStageChange = async (stage: FlareLifecycleStage, notes?: string) => {
    if (isSaving) return;

    try {
      setIsSaving(true);
      await bodyMarkerRepository.updateLifecycleStage(userId, flare.id, stage, notes);
      // Success - stage updated immediately
    } catch (error) {
      console.error('Failed to update lifecycle stage:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update lifecycle stage';
      alert(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Update marker record in database
      await bodyMarkerRepository.updateMarker(userId, flare.id, {
        currentSeverity: severity,
        updatedAt: Date.now(),
      });

      // Add marker event for the update
      await bodyMarkerRepository.addMarkerEvent(userId, flare.id, {
        eventType: trend === 'improving' ? 'trend_change' : 'severity_update',
        timestamp: Date.now(),
        severity,
        trend: trend as 'improving' | 'stable' | 'worsening',
      });

      // Build flare update object for dailyLog.flareUpdates
      const flareUpdate: FlareQuickUpdate = {
        flareId: flare.id,
        severity,
        trend,
        interventions: interventions.trim()
          ? interventions.split(',').map(i => i.trim()).filter(Boolean)
          : undefined,
        notes: notes.trim() || undefined,
      };

      await onSave(flareUpdate);
    } catch (error) {
      console.error('Failed to save flare update:', error);
      alert('Failed to save flare update. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mt-3 p-4 bg-accent/50 rounded-lg border border-border space-y-3">
      {/* Severity Slider */}
      <div className="space-y-2">
        <label
          htmlFor={`severity-${flare.id}`}
          className="text-sm font-medium flex justify-between"
        >
          <span>Severity</span>
          <span className="text-primary font-semibold">{severity}/10</span>
        </label>
        <input
          id={`severity-${flare.id}`}
          type="range"
          min="1"
          max="10"
          value={severity}
          onChange={(e) => setSeverity(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          disabled={isSaving}
        />
      </div>

      {/* Trend Radio Buttons */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Trend</label>
        <div
          role="radiogroup"
          aria-label="Flare trend"
          className="flex gap-2 flex-wrap"
        >
          {(['improving', 'stable', 'worsening'] as const).map((option) => (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={trend === option}
              onClick={() => setTrend(option)}
              disabled={isSaving}
              className={cn(
                "px-3 py-2 rounded-md border text-sm font-medium transition-all",
                trend === option
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background border-border hover:border-primary/50",
                isSaving && "opacity-50 cursor-not-allowed",
                !isSaving && "cursor-pointer"
              )}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Interventions Input */}
      <div className="space-y-2">
        <label
          htmlFor={`interventions-${flare.id}`}
          className="text-sm font-medium"
        >
          Interventions (comma-separated)
        </label>
        <Input
          id={`interventions-${flare.id}`}
          type="text"
          value={interventions}
          onChange={(e) => setInterventions(e.target.value)}
          placeholder="e.g., Ice pack, Rest, Medication"
          disabled={isSaving}
        />
      </div>

      {/* Notes Textarea */}
      <div className="space-y-2">
        <label
          htmlFor={`notes-${flare.id}`}
          className="text-sm font-medium"
        >
          Notes
        </label>
        <textarea
          id={`notes-${flare.id}`}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Additional notes about this flare..."
          maxLength={500}
          rows={3}
          disabled={isSaving}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <p className="text-xs text-muted-foreground text-right">
          {notes.length}/500
        </p>
      </div>

      {/* Lifecycle Stage Selector (for flare-type markers) */}
      {flare.type === 'flare' && flare.currentLifecycleStage && (
        <div className="space-y-2 border-t pt-3">
          <button
            type="button"
            onClick={() => setShowLifecycleDetails(!showLifecycleDetails)}
            className="flex items-center justify-between w-full text-left text-sm font-medium text-foreground hover:text-primary"
            aria-expanded={showLifecycleDetails}
          >
            <span>Lifecycle Stage</span>
            <Badge variant="outline" className="gap-1.5">
              <span>{getLifecycleStageIcon(flare.currentLifecycleStage)}</span>
              <span>{formatLifecycleStage(flare.currentLifecycleStage)}</span>
            </Badge>
          </button>

          {showLifecycleDetails && (
            <div className="mt-2">
              <LifecycleStageSelector
                currentStage={flare.currentLifecycleStage}
                onStageChange={handleLifecycleStageChange}
                showSuggestion={false}
                compact={true}
                disabled={isSaving}
              />
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className={cn(
            "px-4 py-2 rounded-md border border-border text-sm font-medium hover:bg-accent transition-colors",
            isSaving && "opacity-50 cursor-not-allowed"
          )}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className={cn(
            "px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors",
            isSaving && "opacity-50 cursor-not-allowed"
          )}
        >
          {isSaving ? 'Saving...' : 'Save Update'}
        </button>
      </div>
    </div>
  );
}

/**
 * FlareQuickUpdateList component for daily log flare management (Story 6.2).
 * Displays all active flares with quick update functionality.
 *
 * Features:
 * - Lists all active flares (status != 'resolved')
 * - Shows region name, severity, and trend for each flare
 * - Inline quick update form (severity slider, trend radio, notes)
 * - Updates saved to both flare record AND dailyLog.flareUpdates
 * - Link to body map for marking new flares
 * - Empty state when no active flares
 *
 * @see docs/ux-design-specification.md#Daily-Log-UX-Flow
 */
export function FlareQuickUpdateList({
  userId,
  onFlareUpdate,
  className
}: FlareQuickUpdateListProps) {
  const [flares, setFlares] = useState<BodyMarkerRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedFlareId, setExpandedFlareId] = useState<string | null>(null);

  // Load active flares on mount
  useEffect(() => {
    async function loadFlares() {
      setIsLoading(true);
      try {
        const activeFlares = await bodyMarkerRepository.getActiveMarkers(userId, 'flare');
        setFlares(activeFlares);
      } catch (error) {
        console.error('Failed to load active flares:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadFlares();
  }, [userId]);

  const handleQuickUpdate = useCallback((flareId: string) => {
    setExpandedFlareId(expandedFlareId === flareId ? null : flareId);
  }, [expandedFlareId]);

  const handleSave = useCallback(async (update: FlareQuickUpdate) => {
    // Call parent callback to add update to dailyLog.flareUpdates
    onFlareUpdate?.(update);

    // Close the form
    setExpandedFlareId(null);

    // Reload flares to get updated data
    const activeFlares = await bodyMarkerRepository.getActiveMarkers(userId, 'flare');
    setFlares(activeFlares);
  }, [userId, onFlareUpdate]);

  const handleCancel = useCallback(() => {
    setExpandedFlareId(null);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className={cn("space-y-2", className)}>
        <h3 className="text-sm font-medium text-foreground">Active Flares</h3>
        <p className="text-sm text-muted-foreground">Loading flares...</p>
      </div>
    );
  }

  // Empty state
  if (flares.length === 0) {
    return (
      <div className={cn("space-y-3", className)}>
        <h3 className="text-sm font-medium text-foreground">Active Flares</h3>
        <div className="p-4 bg-accent/30 rounded-lg border border-dashed border-border text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            No active flares to update
          </p>
          <Link
            href="/body-map"
            className="inline-block text-sm text-primary hover:underline font-medium"
          >
            + Mark new flare on body map
          </Link>
        </div>
      </div>
    );
  }

  // Render flare list
  return (
    <div className={cn("space-y-3", className)}>
      <h3 className="text-sm font-medium text-foreground">
        Active Flares ({flares.length})
      </h3>

      <div className="space-y-2">
        {flares.map((flare) => {
          const region = getBodyRegionById(flare.bodyRegionId);
          const regionName = region?.name || flare.bodyRegionId;
          const isExpanded = expandedFlareId === flare.id;

          // Determine severity badge color
          const severityVariant: "success" | "warning" | "destructive" =
            flare.currentSeverity <= 3 ? "success" :
            flare.currentSeverity <= 6 ? "warning" :
            "destructive";

          // Note: Trend information would come from marker events
          // For now, we just show the current status
          const statusIcon = flare.status === 'resolved' ? '✓' : '→';
          const statusColor = flare.status === 'resolved' ? 'text-blue-500' : 'text-gray-500';

          return (
            <div
              key={flare.id}
              className="p-3 bg-background rounded-lg border border-border"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1 flex-wrap">
                  <span className="text-sm font-medium">{regionName}</span>
                  <Badge variant={severityVariant}>
                    {flare.currentSeverity}/10
                  </Badge>
                  {flare.type === 'flare' && flare.currentLifecycleStage && (
                    <Badge variant="outline" className="gap-1">
                      <span className="text-xs">{getLifecycleStageIcon(flare.currentLifecycleStage)}</span>
                      <span className="text-xs">{formatLifecycleStage(flare.currentLifecycleStage)}</span>
                    </Badge>
                  )}
                  <span
                    className={cn("text-lg font-bold", statusColor)}
                    aria-label={`Status: ${flare.status}`}
                  >
                    {statusIcon}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleQuickUpdate(flare.id)}
                  className="px-3 py-1 text-sm font-medium text-primary hover:bg-primary/10 rounded-md transition-colors"
                >
                  {isExpanded ? 'Close' : 'Quick Update'}
                </button>
              </div>

              {isExpanded && (
                <FlareUpdateForm
                  flare={flare}
                  userId={userId}
                  onSave={handleSave}
                  onCancel={handleCancel}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Link to body map for new flares */}
      <Link
        href="/body-map"
        className="inline-block text-sm text-primary hover:underline font-medium"
      >
        + Mark new flare on body map
      </Link>
    </div>
  );
}
