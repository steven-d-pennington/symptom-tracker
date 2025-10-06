"use client";

import { useState } from "react";
import { PhotoCapture } from "@/components/photos/PhotoCapture";
import { PhotoGallery } from "@/components/photos/PhotoGallery";

interface PhotoSectionProps {
  userId: string;
  dailyEntryId?: string;
  onPhotosChange?: (photoCount: number) => void;
}

export function PhotoSection({
  userId,
  dailyEntryId,
  onPhotosChange,
}: PhotoSectionProps) {
  const [showCapture, setShowCapture] = useState(false);
  const [photoCount, setPhotoCount] = useState(0);

  const handlePhotoUploaded = () => {
    setShowCapture(false);
    setPhotoCount((prev) => prev + 1);
    if (onPhotosChange) {
      onPhotosChange(photoCount + 1);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Photos</h3>
        <button
          onClick={() => setShowCapture(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          Add Photo
        </button>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <p className="mb-4 text-sm text-muted-foreground">
          Document symptoms visually. All photos are encrypted and stored privately on your device.
        </p>

        {dailyEntryId ? (
          <PhotoGallery
            userId={userId}
            dailyEntryId={dailyEntryId}
            className="mt-4"
          />
        ) : (
          <div className="rounded-lg border-2 border-dashed border-border p-8 text-center">
            <svg
              className="mx-auto mb-4 h-12 w-12 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm text-muted-foreground">
              Save your entry first to add photos
            </p>
          </div>
        )}
      </div>

      {showCapture && (
        <PhotoCapture
          userId={userId}
          dailyEntryId={dailyEntryId}
          onClose={() => setShowCapture(false)}
          onPhotoUploaded={handlePhotoUploaded}
        />
      )}
    </div>
  );
}
