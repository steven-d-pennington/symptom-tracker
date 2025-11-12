"use client";

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import type { GenderType, BodyType } from '@/lib/types/body-mapping';
import { getGenderLabel, getBodyTypeLabel, getSVGPathForPreferences } from '@/lib/utils/bodyMapVariants';

interface BodyMapPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  gender: GenderType;
  bodyType: BodyType;
  userId: string;
}

export function BodyMapPreviewModal({
  isOpen,
  onClose,
  onConfirm,
  gender,
  bodyType,
  userId,
}: BodyMapPreviewModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  // Focus trap and escape key handler
  useEffect(() => {
    if (!isOpen) return;

    // Focus the confirm button when modal opens
    confirmButtonRef.current?.focus();

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && e.target === modalRef.current) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);

    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const svgPath = getSVGPathForPreferences(gender, bodyType);
  const genderLabel = getGenderLabel(gender);
  const bodyTypeLabel = getBodyTypeLabel(bodyType);

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-labelledby="preview-modal-title"
      aria-describedby="preview-modal-description"
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-card rounded-lg shadow-xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 id="preview-modal-title" className="text-xl font-bold text-foreground">
              Body Map Preview
            </h2>
            <p id="preview-modal-description" className="text-sm text-muted-foreground mt-1">
              This is how your body map will look when you track symptoms
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close preview modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - SVG Preview */}
        <div className="flex-1 overflow-auto p-6">
          <div className="space-y-4">
            {/* Selection Info */}
            <div className="bg-muted/30 p-4 rounded-lg border border-border">
              <div className="text-sm font-medium text-foreground">
                Selected: <span className="text-primary">{genderLabel} Body Map</span>
                {' • '}
                <span className="text-primary">{bodyTypeLabel} Body Type</span>
              </div>
            </div>

            {/* SVG Preview Container */}
            <div className="relative bg-background rounded-lg border border-border p-6">
              <div className="flex justify-center items-center min-h-[400px]">
                <div className="relative w-full max-w-md">
                  {/* Sample Markers Overlay */}
                  <div className="absolute inset-0 pointer-events-none z-10">
                    {/* Sample marker positions (示例标记) */}
                    <div
                      className="absolute w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-lg"
                      style={{ left: '30%', top: '25%' }}
                      title="Sample marker: Left shoulder"
                    />
                    <div
                      className="absolute w-3 h-3 bg-amber-500 rounded-full border-2 border-white shadow-lg"
                      style={{ left: '50%', top: '40%' }}
                      title="Sample marker: Abdomen"
                    />
                    <div
                      className="absolute w-3 h-3 bg-yellow-500 rounded-full border-2 border-white shadow-lg"
                      style={{ left: '50%', top: '52%' }}
                      title="Sample marker: Groin"
                    />
                    <div
                      className="absolute w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-lg"
                      style={{ left: '40%', top: '70%' }}
                      title="Sample marker: Left knee"
                    />
                  </div>

                  {/* SVG Body Map */}
                  <img
                    src={svgPath}
                    alt={`${genderLabel} body map preview`}
                    className="w-full h-auto"
                    style={{ maxHeight: '500px' }}
                  />
                </div>
              </div>

              {/* Legend */}
              <div className="mt-4 pt-4 border-t border-border">
                <div className="text-xs text-muted-foreground text-center">
                  <strong>Preview includes sample markers</strong> showing different severity levels.
                  <br />
                  Your actual symptom markers will appear when you track them.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer - Action Buttons */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-muted/20">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg font-medium border border-border text-foreground hover:bg-muted/50 transition-colors"
            aria-label="Cancel and close preview"
          >
            Cancel
          </button>
          <button
            ref={confirmButtonRef}
            onClick={onConfirm}
            className="px-6 py-2 rounded-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            aria-label="Confirm and apply body map preferences"
          >
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
}
