"use client";

import { useState, useEffect } from "react";
import { X as XMarkIcon } from "lucide-react";
import { PhotoCapture, LinkContext } from "@/components/photos/PhotoCapture";
import { PhotoThumbnail } from "@/components/photos/PhotoThumbnail";
import { usePhotoUpload } from "@/components/photos/hooks/usePhotoUpload";
import { photoRepository } from "@/lib/repositories/photoRepository";
import { PhotoAttachment } from "@/lib/types/photo";

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
  const [photos, setPhotos] = useState<PhotoAttachment[]>([]);
  const { uploadPhoto, isUploading } = usePhotoUpload();

  // Load photos when dailyEntryId changes
  useEffect(() => {
    if (dailyEntryId) {
      loadPhotos();
    } else {
      setPhotos([]);
    }
  }, [dailyEntryId]);

  const loadPhotos = async () => {
    if (!dailyEntryId) return;
    try {
      const linkedPhotos = await photoRepository.getByDailyEntry(userId, dailyEntryId);
      setPhotos(linkedPhotos);
      if (onPhotosChange) {
        onPhotosChange(linkedPhotos.length);
      }
    } catch (error) {
      console.error("Failed to load photos:", error);
    }
  };

  const handlePhotoCapture = async (file: File, preview: string) => {
    try {
      const savedPhoto = await uploadPhoto(file, {
        userId,
        dailyEntryId, // Auto-link to this entry
      });
      if (savedPhoto) {
        await loadPhotos(); // Refresh photo list
        setShowCapture(false);
      }
    } finally {
      URL.revokeObjectURL(preview);
    }
  };

  const handleRemovePhoto = async (photoId: string) => {
    if (!dailyEntryId) return;
    
    if (confirm("Unlink photo from this entry? Photo will remain in your gallery.")) {
      try {
        await photoRepository.unlinkFromEntry(photoId, dailyEntryId);
        await loadPhotos(); // Refresh list
      } catch (error) {
        console.error("Failed to unlink photo:", error);
        alert("Failed to remove photo. Please try again.");
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          Photos {dailyEntryId && photos.length > 0 && `(${photos.length})`}
        </h3>
        <button
          onClick={() => setShowCapture(true)}
          disabled={!dailyEntryId || isUploading}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
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
          {isUploading ? "Uploading..." : "Add Photo"}
        </button>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <p className="mb-4 text-sm text-muted-foreground">
          Document symptoms visually. All photos are encrypted and stored privately on your device.
        </p>

        {dailyEntryId ? (
          photos.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {photos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <PhotoThumbnail photo={photo} showEntryLink={false} />
                  <button
                    onClick={() => handleRemovePhoto(photo.id)}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                    title="Remove photo from this entry"
                    aria-label="Remove photo"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No photos yet. Click "Add Photo" to capture or upload.
            </p>
          )
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

      {showCapture && dailyEntryId && (
        <PhotoCapture
          onPhotoCapture={handlePhotoCapture}
          onCancel={() => setShowCapture(false)}
          maxFiles={10}
          linkContext={{ dailyEntryId }}
        />
      )}
    </div>
  );
}
