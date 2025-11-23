"use client";

import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { PhotoAnnotation } from '@/lib/types/annotation';

interface BlurWarningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  blurAnnotations: PhotoAnnotation[];
}

export function BlurWarningDialog({
  open,
  onOpenChange,
  onConfirm,
  blurAnnotations,
}: BlurWarningDialogProps) {
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleConfirm = () => {
    if (isConfirmed) {
      onConfirm();
      setIsConfirmed(false);
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    setIsConfirmed(false);
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-yellow-100 p-2">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Blur is Permanent</h3>
          </div>
          <button
            onClick={handleCancel}
            className="rounded-full p-1 hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Warning Content */}
        <div className="mb-6 space-y-4">
          <p className="text-gray-700">
            This action will <strong>permanently blur</strong> the selected areas.
            The original photo <strong>cannot be recovered</strong>.
          </p>

          {/* Blur Regions List */}
          {blurAnnotations.length > 0 && (
            <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3">
              <p className="mb-2 text-sm font-medium text-gray-700">
                Blurred areas ({blurAnnotations.length}):
              </p>
              <ul className="space-y-1 text-sm text-gray-600">
                {blurAnnotations.map((annotation, index) => {
                  const coords = annotation.coordinates;
                  const width = Math.abs(coords.width || 0);
                  const height = Math.abs(coords.height || 0);
                  const intensity = coords.intensity || 10;
                  const intensityLabel = 
                    intensity <= 5 ? 'Light' : 
                    intensity <= 10 ? 'Medium' : 'Heavy';
                  
                  return (
                    <li key={annotation.id} className="flex items-center gap-2">
                      <span className="text-yellow-600">•</span>
                      Blur region {index + 1} ({width.toFixed(0)}% × {height.toFixed(0)}%, {intensityLabel} intensity)
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <p className="text-sm text-gray-600">
            Once applied, the blur cannot be undone. Make sure you've positioned the blur regions correctly before proceeding.
          </p>
        </div>

        {/* Confirmation Checkbox */}
        <div className="mb-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isConfirmed}
              onChange={(e) => setIsConfirmed(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
            />
            <span className="text-sm text-gray-700">
              I understand this action is <strong>irreversible</strong> and the original photo will be permanently modified.
            </span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={handleCancel}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isConfirmed}
            className="rounded-md bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Apply Permanent Blur
          </button>
        </div>
      </div>
    </div>
  );
}
