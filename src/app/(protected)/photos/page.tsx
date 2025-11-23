"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { Camera } from "lucide-react";
import { PhotoGallery } from "@/components/photos/PhotoGallery";
import { PhotoFilters } from "@/components/photos/PhotoFilters";
import { PhotoStorageManager } from "@/components/photos/PhotoStorageManager";
import { PhotoCapture } from "@/components/photos/PhotoCapture";
import { usePhotoUpload } from "@/components/photos/hooks/usePhotoUpload";
import { photoRepository } from "@/lib/repositories/photoRepository";
import { PhotoFilter as PhotoFilterType } from "@/lib/types/photo";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";

export default function PhotosPage() {
  const { userId, isLoading: isUserLoading } = useCurrentUser();
  const { uploadPhoto, isUploading, progress, error } = usePhotoUpload();
  const [isCaptureOpen, setIsCaptureOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [filter, setFilter] = useState<PhotoFilterType>({});
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadTags = async () => {
      try {
        const tags = await photoRepository.getAllTags(userId);
        if (isMounted) {
          setAvailableTags(tags);
        }
      } catch (loadError) {
        console.error("Failed to load photo tags:", loadError);
      }
    };

    if (userId) {
      loadTags();
    } else {
      setAvailableTags([]);
    }

    return () => {
      isMounted = false;
    };
  }, [userId, refreshKey]);

  const handleFilterChange = (nextFilter: PhotoFilterType) => {
    setFilter((prev) => ({
      ...nextFilter,
      searchQuery: prev.searchQuery,
    }));
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchQuery(value);
    setFilter((prev) => ({
      ...prev,
      searchQuery: value.trim().length > 0 ? value : undefined,
    }));
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setFilter((prev) => ({
      ...prev,
      searchQuery: undefined,
    }));
  };

  const handlePhotoDeleted = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handlePhotoCapture = async (file: File, preview: string) => {
    try {
      const savedPhoto = await uploadPhoto(file, { userId });
      if (savedPhoto) {
        setRefreshKey((prev) => prev + 1);
        setIsCaptureOpen(false);
      }
    } finally {
      URL.revokeObjectURL(preview);
    }
  };

  const hasActiveFilters = useMemo(() => {
    return Boolean(
      (filter.tags && filter.tags.length > 0) ||
        filter.dateRange?.start ||
        filter.dateRange?.end ||
        (filter.bodyRegions && filter.bodyRegions.length > 0) ||
        (filter.symptoms && filter.symptoms.length > 0) ||
        (filter.searchQuery && filter.searchQuery.trim().length > 0)
    );
  }, [filter]);

  if (isUserLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">
            Loading your photo workspace...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Photo Gallery</h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Capture, encrypt, and organize medical photos privately on your device. Use tags
            and filters to find the context you need in seconds.
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 md:items-end">
          <button
            type="button"
            onClick={() => setIsCaptureOpen(true)}
            disabled={isUploading}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Camera className="h-4 w-4" />
            {isUploading ? "Uploading photo..." : "Add Photo"}
          </button>
          {isUploading && (
            <span className="text-xs text-muted-foreground">
              Encrypting securely ({Math.round(progress)}%)
            </span>
          )}
          {error && (
            <span className="max-w-sm text-xs text-destructive">{error.message}</span>
          )}
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full max-w-md items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 shadow-sm">
          <svg
            className="h-4 w-4 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35m1.35-3.65a6 6 0 11-12 0 6 6 0 0112 0z"
            />
          </svg>
          <input
            type="search"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search by file name, tag, or notes"
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          {searchQuery.length > 0 && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          )}
        </div>
        {hasActiveFilters && (
          <span className="text-xs text-muted-foreground">
            {filter.searchQuery ? "Search applied." : "Filters applied."} Tap filters below to
            adjust.
          </span>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <PhotoGallery
            userId={userId}
            filter={filter}
            refreshKey={refreshKey}
            onPhotoDeleted={handlePhotoDeleted}
            className="min-h-[320px]"
          />
        </div>
        <div className="space-y-6">
          <PhotoFilters
            onFilterChange={handleFilterChange}
            availableTags={availableTags}
          />
          <PhotoStorageManager userId={userId} refreshKey={refreshKey} />
        </div>
      </div>

      {isCaptureOpen && (
        <PhotoCapture
          onPhotoCapture={handlePhotoCapture}
          onCancel={() => setIsCaptureOpen(false)}
          allowCamera
          allowGallery
        />
      )}
    </div>
  );
}
