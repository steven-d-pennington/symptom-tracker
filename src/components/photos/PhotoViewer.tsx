"use client";

import { useEffect, useState, useRef } from "react";
import { PhotoAttachment } from "@/lib/types/photo";
import { PhotoEncryption } from "@/lib/utils/photoEncryption";

interface PhotoViewerProps {
  photo: PhotoAttachment;
  photos: PhotoAttachment[];
  onClose: () => void;
  onDelete: (photoId: string) => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

export function PhotoViewer({
  photo,
  photos,
  onClose,
  onDelete,
  onNext,
  onPrevious,
}: PhotoViewerProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const currentIndex = photos.findIndex((p) => p.id === photo.id);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < photos.length - 1;

  useEffect(() => {
    let objectUrl: string | null = null;

    async function loadPhoto() {
      try {
        setIsLoading(true);
        setError(null);
        setScale(1);
        setPosition({ x: 0, y: 0 });

        // TODO: Implement photo decryption once encryption key storage is finalized
        // For now, create object URL directly from encrypted data
        objectUrl = URL.createObjectURL(photo.encryptedData);
        setImageUrl(objectUrl);
      } catch (err) {
        console.error("Failed to load photo:", err);
        setError("Failed to decrypt and load photo");
      } finally {
        setIsLoading(false);
      }
    }

    loadPhoto();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [photo]);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight" && hasNext && onNext) {
        onNext();
      } else if (e.key === "ArrowLeft" && hasPrevious && onPrevious) {
        onPrevious();
      } else if (e.key === "+" || e.key === "=") {
        setScale((s) => Math.min(s + 0.25, 4));
      } else if (e.key === "-" || e.key === "_") {
        setScale((s) => Math.max(s - 0.25, 0.5));
      } else if (e.key === "0") {
        setScale(1);
        setPosition({ x: 0, y: 0 });
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, hasNext, hasPrevious, onNext, onPrevious]);

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.25, 4));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.25, 0.5));
  const handleResetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    onDelete(photo.id);
    setShowDeleteConfirm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
      {/* Header */}
      <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent p-4">
        <div className="text-white">
          <h3 className="text-lg font-semibold">
            {new Date(photo.capturedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </h3>
          {photo.notes && <p className="text-sm text-white/80">{photo.notes}</p>}
        </div>
        <button
          onClick={onClose}
          className="rounded-full p-2 text-white transition-colors hover:bg-white/20"
          aria-label="Close"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Image container */}
      <div
        className="relative flex h-full w-full items-center justify-center overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: scale > 1 ? (isDragging ? "grabbing" : "grab") : "default" }}
      >
        {isLoading && (
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-white border-t-transparent" />
        )}

        {error && (
          <div className="rounded-lg bg-destructive/20 p-8 text-center">
            <p className="text-lg text-destructive">{error}</p>
          </div>
        )}

        {imageUrl && !isLoading && (
          <img
            src={imageUrl}
            alt={photo.notes || "Medical photo"}
            className="max-h-[90vh] max-w-[90vw] select-none object-contain"
            style={{
              transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
              transition: isDragging ? "none" : "transform 0.2s",
            }}
            draggable={false}
          />
        )}

        {/* Navigation arrows */}
        {hasPrevious && onPrevious && (
          <button
            onClick={onPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white transition-colors hover:bg-black/70"
            aria-label="Previous photo"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}

        {hasNext && onNext && (
          <button
            onClick={onNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white transition-colors hover:bg-black/70"
            aria-label="Next photo"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2 rounded-lg bg-black/70 p-2">
        <button
          onClick={handleZoomOut}
          disabled={scale <= 0.5}
          className="rounded p-2 text-white transition-colors hover:bg-white/20 disabled:opacity-50"
          aria-label="Zoom out"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
        <button
          onClick={handleResetZoom}
          className="rounded px-3 py-2 text-sm text-white transition-colors hover:bg-white/20"
        >
          {Math.round(scale * 100)}%
        </button>
        <button
          onClick={handleZoomIn}
          disabled={scale >= 4}
          className="rounded p-2 text-white transition-colors hover:bg-white/20 disabled:opacity-50"
          aria-label="Zoom in"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      </div>

      {/* Action buttons */}
      <div className="absolute bottom-4 right-4 z-10 flex gap-2">
        <button
          onClick={handleDelete}
          className="rounded-lg bg-destructive px-4 py-2 text-destructive-foreground transition-colors hover:bg-destructive/90"
        >
          Delete
        </button>
      </div>

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80">
          <div className="max-w-sm rounded-lg bg-card p-6">
            <h3 className="mb-4 text-lg font-semibold text-foreground">Delete Photo?</h3>
            <p className="mb-6 text-sm text-muted-foreground">
              This action cannot be undone. The photo will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 rounded-lg border border-border px-4 py-2 text-foreground transition-colors hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 rounded-lg bg-destructive px-4 py-2 text-destructive-foreground transition-colors hover:bg-destructive/90"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo counter */}
      <div className="absolute right-4 top-4 z-10 rounded-lg bg-black/70 px-3 py-1 text-sm text-white">
        {currentIndex + 1} / {photos.length}
      </div>
    </div>
  );
}
