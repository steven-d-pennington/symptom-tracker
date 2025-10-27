'use client';

import { useState, useEffect } from 'react';
import { FlareRecord } from '@/lib/db/schema';
import { InterventionType } from '@/types/flare';
import { flareRepository } from '@/lib/repositories/flareRepository';

interface InterventionLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  flare: FlareRecord;
  userId: string;
  onLog?: () => void;
}

export function InterventionLogModal({
  isOpen,
  onClose,
  flare,
  userId,
  onLog,
}: InterventionLogModalProps) {
  const [interventionType, setInterventionType] = useState<InterventionType>(
    InterventionType.Ice
  );
  const [details, setDetails] = useState('');
  const [timestamp, setTimestamp] = useState(Date.now());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setInterventionType(InterventionType.Ice);
      setDetails('');
      setTimestamp(Date.now());
      setError(null);
    }
  }, [isOpen]);

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Create intervention FlareEvent record (append-only)
      await flareRepository.addFlareEvent(userId, flare.id, {
        eventType: "intervention",
        timestamp,
        interventionType,
        interventionDetails: details.trim() || undefined,
      });

      // Success - close modal and trigger callback
      onClose();
      onLog?.();
    } catch (err) {
      console.error('Failed to log intervention:', err);
      setError('Failed to save intervention. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) return null;

  const charCount = details.length;
  const charLimit = 500;

  // Convert timestamp to datetime-local format
  const dateTimeValue = new Date(timestamp).toISOString().slice(0, 16);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="intervention-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleCancel();
        }
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          handleCancel();
        }
      }}
    >
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <h2 id="intervention-modal-title" className="text-xl font-bold mb-4">
          Log Intervention
        </h2>

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* Intervention Type Dropdown */}
        <div className="mb-4">
          <label
            htmlFor="intervention-type"
            className="block text-sm font-medium mb-2"
          >
            Intervention Type
          </label>
          <select
            id="intervention-type"
            value={interventionType}
            onChange={(e) =>
              setInterventionType(e.target.value as InterventionType)
            }
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Select intervention type"
            disabled={isLoading}
          >
            <option value={InterventionType.Ice}>Ice</option>
            <option value={InterventionType.Heat}>Heat</option>
            <option value={InterventionType.Medication}>Medication</option>
            <option value={InterventionType.Rest}>Rest</option>
            <option value={InterventionType.Drainage}>Drainage</option>
            <option value={InterventionType.Other}>Other</option>
          </select>
        </div>

        {/* Specific Details Textarea */}
        <div className="mb-4">
          <label htmlFor="details" className="block text-sm font-medium mb-2">
            Specific Details (optional)
          </label>
          <textarea
            id="details"
            value={details}
            onChange={(e) => setDetails(e.target.value.slice(0, charLimit))}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="e.g., Ibuprofen 400mg, Ice pack 15 minutes, etc."
            aria-label="Intervention details"
            disabled={isLoading}
          />
          <div className="text-xs text-gray-500 mt-1">
            {charCount}/{charLimit} characters
          </div>
        </div>

        {/* Timestamp */}
        <div className="mb-6">
          <label
            htmlFor="timestamp"
            className="block text-sm font-medium mb-2"
          >
            Timestamp
          </label>
          <input
            id="timestamp"
            type="datetime-local"
            value={dateTimeValue}
            onChange={(e) => setTimestamp(new Date(e.target.value).getTime())}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
            aria-label="Intervention timestamp"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Cancel logging intervention"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Save intervention"
          >
            {isLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
