'use client';

import { useState, useEffect } from 'react';
import { BodyMarkerRecord, FlareLifecycleStage } from '@/lib/db/schema';
import { FlareTrend } from '@/types/flare';
import { bodyMarkerRepository } from '@/lib/repositories/bodyMarkerRepository';
import { LifecycleStageSelector } from '@/components/LifecycleStageSelector';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FlareUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  flare: BodyMarkerRecord;
  userId: string;
  onUpdate?: () => void;
}

export function FlareUpdateModal({ isOpen, onClose, flare, userId, onUpdate }: FlareUpdateModalProps) {
  const [severity, setSeverity] = useState(flare.currentSeverity);
  const [trend, setTrend] = useState<FlareTrend>(FlareTrend.Stable);
  const [notes, setNotes] = useState('');
  const [timestamp, setTimestamp] = useState(Date.now());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Lifecycle stage state
  const [showAdditionalDetails, setShowAdditionalDetails] = useState(false);
  const [newLifecycleStage, setNewLifecycleStage] = useState<FlareLifecycleStage | null>(null);
  const [lifecycleStageNotes, setLifecycleStageNotes] = useState<string | undefined>(undefined);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSeverity(flare.currentSeverity);
      setTrend(FlareTrend.Stable);
      setNotes('');
      setTimestamp(Date.now());
      setError(null);
      setShowAdditionalDetails(false);
      setNewLifecycleStage(null);
      setLifecycleStageNotes(undefined);
    }
  }, [isOpen, flare]);

  // Handle lifecycle stage change from selector
  const handleLifecycleStageChange = (stage: FlareLifecycleStage, notes?: string) => {
    setNewLifecycleStage(stage);
    setLifecycleStageNotes(notes);
    setError(null); // Clear any previous errors
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Detect what changed
      const severityChanged = severity !== flare.currentSeverity;
      const lifecycleStageChanged = newLifecycleStage !== null && 
        newLifecycleStage !== flare.currentLifecycleStage;

      // Update lifecycle stage first if changed (this creates the lifecycle_stage_change event)
      if (lifecycleStageChanged && newLifecycleStage) {
        try {
          await bodyMarkerRepository.updateLifecycleStage(
            userId,
            flare.id,
            newLifecycleStage,
            lifecycleStageNotes
          );
        } catch (lifecycleErr) {
          // Handle lifecycle stage validation errors
          const errorMessage = lifecycleErr instanceof Error 
            ? lifecycleErr.message 
            : 'Invalid lifecycle stage transition';
          setError(errorMessage);
          setIsLoading(false);
          return;
        }
      }

      // Determine event type for severity/trend update
      const eventType: "severity_update" | "trend_change" = severityChanged
        ? "severity_update"
        : "trend_change";

      // Create BodyMarkerEvent record (append-only) if severity or trend changed
      if (severityChanged || trend !== FlareTrend.Stable) {
        await bodyMarkerRepository.addMarkerEvent(userId, flare.id, {
          eventType,
          timestamp,
          severity: severityChanged ? severity : undefined,
          trend,
          notes: notes.trim() || undefined,
        });
      }

      // Update BodyMarkerRecord if severity changed
      if (severityChanged) {
        await bodyMarkerRepository.updateMarker(userId, flare.id, {
          currentSeverity: severity,
        });
      }

      // Success - close modal and trigger update callback
      onClose();
      onUpdate?.();
    } catch (err) {
      console.error('Failed to update flare:', err);
      setError('Failed to save update. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) return null;

  const charCount = notes.length;
  const charLimit = 500;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="update-modal-title"
    >
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 id="update-modal-title" className="text-xl font-bold mb-4">
          Update Flare Status
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        {/* Severity Slider */}
        <div className="mb-4">
          <label htmlFor="severity" className="block text-sm font-medium mb-2">
            Severity: {severity}/10
            <span className="text-gray-500 text-xs ml-2">
              (Previous: {flare.currentSeverity})
            </span>
          </label>
          <input
            id="severity"
            type="range"
            min="1"
            max="10"
            value={severity}
            onChange={(e) => setSeverity(parseInt(e.target.value))}
            className="w-full"
            aria-label={`Severity slider, current value ${severity} out of 10`}
          />
        </div>

        {/* Trend Radio Buttons */}
        <div className="mb-4">
          <fieldset>
            <legend className="block text-sm font-medium mb-2">Trend</legend>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="trend"
                  value={FlareTrend.Improving}
                  checked={trend === FlareTrend.Improving}
                  onChange={(e) => setTrend(e.target.value as FlareTrend)}
                  className="mr-2"
                />
                 Improving
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="trend"
                  value={FlareTrend.Stable}
                  checked={trend === FlareTrend.Stable}
                  onChange={(e) => setTrend(e.target.value as FlareTrend)}
                  className="mr-2"
                />
                 Stable
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="trend"
                  value={FlareTrend.Worsening}
                  checked={trend === FlareTrend.Worsening}
                  onChange={(e) => setTrend(e.target.value as FlareTrend)}
                  className="mr-2"
                />
                 Worsening
              </label>
            </div>
          </fieldset>
        </div>

        {/* Notes Textarea */}
        <div className="mb-4">
          <label htmlFor="notes" className="block text-sm font-medium mb-2">
            Notes (optional)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value.slice(0, charLimit))}
            className="w-full border rounded px-3 py-2"
            rows={3}
            placeholder="Any observations or details..."
            aria-label="Status update notes"
          />
          <div className="text-xs text-gray-500 mt-1">
            {charCount}/{charLimit} characters
          </div>
        </div>

        {/* Timestamp */}
        <div className="mb-4">
          <label htmlFor="timestamp" className="block text-sm font-medium mb-2">
            Timestamp
          </label>
          <input
            id="timestamp"
            type="datetime-local"
            value={new Date(timestamp).toISOString().slice(0, 16)}
            onChange={(e) => setTimestamp(new Date(e.target.value).getTime())}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Additional Details Section */}
        <div className="mb-6 border-t pt-4">
          <button
            type="button"
            onClick={() => setShowAdditionalDetails(!showAdditionalDetails)}
            className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-700 hover:text-gray-900 mb-2"
            aria-expanded={showAdditionalDetails}
            aria-controls="additional-details-content"
          >
            <span>Additional Details</span>
            {showAdditionalDetails ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {showAdditionalDetails && (
            <div id="additional-details-content" className="mt-4 space-y-4">
              {/* Lifecycle Stage Selector */}
              {flare.type === 'flare' && (
                <div>
                  <LifecycleStageSelector
                    currentStage={flare.currentLifecycleStage}
                    onStageChange={handleLifecycleStageChange}
                    showSuggestion={true}
                    compact={false}
                    disabled={isLoading}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
