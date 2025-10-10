"use client";

import { useEffect, useState } from "react";
import { PhotoAttachment } from "@/lib/types/photo";
import { PhotoEncryption } from "@/lib/utils/photoEncryption";

interface PhotoThumbnailProps {
  photo: PhotoAttachment;
  onClick?: () => void;
  selected?: boolean;
  className?: string;
}

export function PhotoThumbnail({
  photo,
  onClick,
  selected = false,
  className = "",
}: PhotoThumbnailProps) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;

    async function loadThumbnail() {
      try {
        setIsLoading(true);
        setError(null);

        if (photo.encryptionKey && photo.thumbnailIV) {
          const key = await PhotoEncryption.importKey(photo.encryptionKey);
          const decrypted = await PhotoEncryption.decryptPhoto(
            photo.thumbnailData,
            key,
            photo.thumbnailIV
          );
          objectUrl = URL.createObjectURL(decrypted);
        } else {
          objectUrl = URL.createObjectURL(photo.thumbnailData);
        }
        setThumbnailUrl(objectUrl);
      } catch (err) {
        console.error("Failed to load thumbnail:", err);
        setError("Failed to load image");
      } finally {
        setIsLoading(false);
      }
    }

    loadThumbnail();

    // Cleanup object URL on unmount
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [photo]);

  return (
    <div
      onClick={onClick}
      className={`relative aspect-square overflow-hidden rounded-lg border-2 bg-muted transition-all ${
        selected ? "border-primary ring-2 ring-primary/50" : "border-border"
      } ${onClick ? "cursor-pointer hover:border-primary/50" : ""} ${className}`}
    >
      {isLoading && (
        <div className="flex h-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}

      {error && (
        <div className="flex h-full items-center justify-center p-2 text-center">
          <p className="text-xs text-muted-foreground">{error}</p>
        </div>
      )}

      {thumbnailUrl && !isLoading && (
        <img
          src={thumbnailUrl}
          alt={photo.notes || "Medical photo"}
          className="h-full w-full object-cover"
        />
      )}

      {/* Photo metadata overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
        <p className="text-xs text-white">
          {new Date(photo.capturedAt).toLocaleDateString()}
        </p>
        {photo.tags.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {photo.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="rounded bg-white/20 px-1 py-0.5 text-xs text-white"
              >
                {tag}
              </span>
            ))}
            {photo.tags.length > 2 && (
              <span className="rounded bg-white/20 px-1 py-0.5 text-xs text-white">
                +{photo.tags.length - 2}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Selection indicator */}
      {selected && (
        <div className="absolute right-2 top-2 rounded-full bg-primary p-1">
          <svg
            className="h-4 w-4 text-primary-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
