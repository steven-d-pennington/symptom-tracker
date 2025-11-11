'use client';

import { useState, useEffect } from 'react';
import { BodyMarkerRecord } from '@/lib/db/schema';
import { bodyMarkerRepository } from '@/lib/repositories/bodyMarkerRepository';
import { getBodyRegionById } from '@/lib/data/bodyRegions';

interface FlareResolveModalProps {
  isOpen: boolean;
  onClose: () => void;
  flare: BodyMarkerRecord;
  userId: string;
  onResolve?: () => void;
}

export function FlareResolveModal({ isOpen, onClose, flare, userId, onResolve }: FlareResolveModalProps) {
  const [resolutionDate, setResolutionDate] = useState(Date.now());
  const [notes, setNotes] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setResolutionDate(Date.now());
      setNotes('');
      setShowConfirmation(false);
      setError(null);
    }
  }, [isOpen]);

  const validateDate = (date: number): string | null => {
    if (date < flare.startDate) {
      return 'Resolution date cannot be before flare start date';
    }
    if (date > Date.now()) {
      return 'Resolution date cannot be in the future';
    }
    return null;
  };

  const handleResolveClick = () => {
    const validationError = validateDate(resolutionDate);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setShowConfirmation(true);
  };

  const handleConfirmResolution = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Use unified marker repository's resolveMarker method
      await bodyMarkerRepository.resolveMarker(
        userId,
        flare.id,
        resolutionDate,
        notes.trim() || undefined
      );

      // Success - close modal and trigger callback
      onClose();
      onResolve?.();
    } catch (err) {
      console.error('Failed to resolve flare:', err);
      setError('Failed to mark flare as resolved. Please try again.');
    } finally {
      setIsLoading(false);
      setShowConfirmation(false);
    }
  };

  const handleCancel = () => {
    setShowConfirmation(false);
    onClose();
  };

  if (!isOpen) return null;

  const charCount = notes.length;
  const charLimit = 500;
  const daysActive = Math.floor((Date.now() - flare.startDate) / (1000 * 60 * 60 * 24));

  // Find body region name
  const bodyRegion = getBodyRegionById(flare.bodyRegionId);
  const bodyRegionName = bodyRegion?.name || flare.bodyRegionId;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="resolve-modal-title"
    >
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 id="resolve-modal-title" className="text-xl font-bold mb-4">
          Mark Flare as Resolved
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        {!showConfirmation ? (
          <>
            {/* Flare Summary Context */}
            <div className="bg-gray-50 rounded p-4 mb-4">
              <div className="text-sm text-gray-600 mb-1">
                <strong>Body Region:</strong> {bodyRegionName}
              </div>
              <div className="text-sm text-gray-600 mb-1">
                <strong>Current Severity:</strong> {flare.currentSeverity}/10
              </div>
              <div className="text-sm text-gray-600">
                <strong>Days Active:</strong> {daysActive} {daysActive === 1 ? 'day' : 'days'}
              </div>
            </div>

            {/* Resolution Date */}
            <div className="mb-4">
              <label htmlFor="resolution-date" className="block text-sm font-medium mb-2">
                Resolution Date
              </label>
              <input
                id="resolution-date"
                type="date"
                value={new Date(resolutionDate).toISOString().split('T')[0]}
                onChange={(e) => setResolutionDate(new Date(e.target.value).getTime())}
                className="w-full border rounded px-3 py-2"
                aria-label="Select resolution date"
              />
              <div className="text-xs text-gray-500 mt-1">
                Defaults to today. Edit if marking retroactively.
              </div>
            </div>

            {/* Resolution Notes */}
            <div className="mb-6">
              <label htmlFor="notes" className="block text-sm font-medium mb-2">
                Resolution Notes (optional)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value.slice(0, charLimit))}
                className="w-full border rounded px-3 py-2"
                rows={3}
                placeholder="e.g., Fully healed, no pain remaining"
                aria-label="Resolution notes"
              />
              <div className="text-xs text-gray-500 mt-1">
                {charCount}/{charLimit} characters
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
                aria-label="Cancel resolution"
              >
                Cancel
              </button>
              <button
                onClick={handleResolveClick}
                disabled={isLoading}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                aria-label="Mark flare as resolved"
              >
                Mark Resolved
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Confirmation Dialog */}
            <div className="mb-6">
              <div className="bg-yellow-50 border border-yellow-400 text-yellow-800 px-4 py-3 rounded mb-4">
                <p className="font-semibold mb-2">Are you sure?</p>
                <p className="text-sm">
                  This will mark the flare as resolved and remove it from active tracking.
                  You can still view the complete history, but cannot update this flare further.
                </p>
              </div>
            </div>

            {/* Confirmation Action Buttons */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmation(false)}
                disabled={isLoading}
                className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
                aria-label="Cancel confirmation"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmResolution}
                disabled={isLoading}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                aria-label="Confirm resolution"
              >
                {isLoading ? 'Resolving...' : 'Confirm Resolution'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
