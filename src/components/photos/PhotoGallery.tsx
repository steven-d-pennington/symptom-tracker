"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { PhotoAttachment, PhotoFilter } from "@/lib/types/photo";
import { PhotoAnnotation } from "@/lib/types/annotation";
import { photoRepository } from "@/lib/repositories/photoRepository";
import { PhotoThumbnail } from "./PhotoThumbnail";
import { PhotoViewer } from "./PhotoViewer";

interface PhotoGalleryProps {
  userId: string;
  dailyEntryId?: string;
  symptomId?: string;
  bodyRegionId?: string;
  onPhotoSelect?: (photo: PhotoAttachment) => void;
  onPhotoDeleted?: (photoId: string) => void;
  selectable?: boolean;
  filter?: PhotoFilter;
  refreshKey?: number;
  className?: string;
}

export function PhotoGallery({
  userId,
  dailyEntryId,
  symptomId,
  bodyRegionId,
  onPhotoSelect,
  onPhotoDeleted,
  selectable = false,
  filter,
  refreshKey = 0,
  className = "",
}: PhotoGalleryProps) {
  const [photos, setPhotos] = useState<PhotoAttachment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoAttachment | null>(null);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [viewerOpen, setViewerOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const PAGE_SIZE = 20;

  const loadPhotos = useCallback(
    async (pageNum: number) => {
      try {
        setIsLoading(true);

        let newPhotos: PhotoAttachment[];

        if (dailyEntryId) {
          const allPhotos = await photoRepository.getAll(userId);
          newPhotos = allPhotos.filter((p) => p.dailyEntryId === dailyEntryId);
        } else if (symptomId) {
          const allPhotos = await photoRepository.getAll(userId);
          newPhotos = allPhotos.filter((p) => p.symptomId === symptomId);
        } else if (bodyRegionId) {
          newPhotos = await photoRepository.getByBodyRegion(userId, bodyRegionId);
        } else {
          newPhotos = await photoRepository.getAll(userId);
        }

        if (filter) {
          const { dateRange, tags, bodyRegions, symptoms, searchQuery } = filter;

          if (dateRange?.start || dateRange?.end) {
            newPhotos = newPhotos.filter((photo) => {
              const capturedAt = photo.capturedAt.getTime();
              if (dateRange.start && capturedAt < dateRange.start.getTime()) {
                return false;
              }
              if (dateRange.end && capturedAt > dateRange.end.getTime()) {
                return false;
              }
              return true;
            });
          }

          if (tags && tags.length > 0) {
            newPhotos = newPhotos.filter((photo) =>
              tags.some((tag) => photo.tags.includes(tag))
            );
          }

          if (bodyRegions && bodyRegions.length > 0) {
            newPhotos = newPhotos.filter(
              (photo) => photo.bodyRegionId && bodyRegions.includes(photo.bodyRegionId)
            );
          }

          if (symptoms && symptoms.length > 0) {
            newPhotos = newPhotos.filter(
              (photo) => photo.symptomId && symptoms.includes(photo.symptomId)
            );
          }

          if (searchQuery && searchQuery.trim().length > 0) {
            const query = searchQuery.trim().toLowerCase();
            newPhotos = newPhotos.filter(
              (photo) =>
                photo.originalFileName.toLowerCase().includes(query) ||
                (photo.notes && photo.notes.toLowerCase().includes(query)) ||
                photo.tags.some((tag) => tag.toLowerCase().includes(query))
            );
          }
        }

        // Sort by capture date (newest first)
        newPhotos.sort(
          (a, b) =>
            new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime()
        );

        // Paginate
        const start = pageNum * PAGE_SIZE;
        const end = start + PAGE_SIZE;
        const paginatedPhotos = newPhotos.slice(start, end);

        if (pageNum === 0) {
          setPhotos(paginatedPhotos);
        } else {
          setPhotos((prev) => [...prev, ...paginatedPhotos]);
        }

        setHasMore(end < newPhotos.length);
      } catch (error) {
        console.error("Failed to load photos:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [userId, dailyEntryId, symptomId, bodyRegionId, filter]
  );

  useEffect(() => {
    loadPhotos(0);
    setPage(0);
  }, [loadPhotos, refreshKey]);

  // Infinite scroll setup
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !isLoading) {
        const nextPage = page + 1;
        setPage(nextPage);
        loadPhotos(nextPage);
      }
    });

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isLoading, page, loadPhotos]);

  const handlePhotoClick = (photo: PhotoAttachment) => {
    if (selectable) {
      toggleSelection(photo.id);
      if (onPhotoSelect) {
        onPhotoSelect(photo);
      }
    } else {
      setSelectedPhoto(photo);
      setViewerOpen(true);
    }
  };

  const toggleSelection = (photoId: string) => {
    setSelectedPhotos((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(photoId)) {
        newSet.delete(photoId);
      } else {
        newSet.add(photoId);
      }
      return newSet;
    });
  };

  const handleDeletePhoto = async (photoId: string) => {
    try {
      await photoRepository.delete(photoId);
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
      setSelectedPhotos((prev) => {
        const next = new Set(prev);
        next.delete(photoId);
        return next;
      });
      setViewerOpen(false);
      if (onPhotoDeleted) {
        onPhotoDeleted(photoId);
      }
    } catch (error) {
      console.error("Failed to delete photo:", error);
    }
  };

  const handleAnnotationsSave = async (photoId: string, annotations: PhotoAnnotation[]) => {
    try {
      await photoRepository.updateAnnotations(photoId, annotations);
      // Update local state
      setPhotos((prev) => 
        prev.map((p) => 
          p.id === photoId ? { ...p, annotations } : p
        )
      );
      // Update selected photo if it's the current one
      if (selectedPhoto?.id === photoId) {
        setSelectedPhoto({ ...selectedPhoto, annotations });
      }
    } catch (error) {
      console.error("Failed to save annotations:", error);
      throw error; // Re-throw to show error in PhotoAnnotation component
    }
  };

  if (isLoading && photos.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-8 text-center">
        <svg
          className="mb-4 h-12 w-12 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <h3 className="mb-2 text-lg font-semibold text-foreground">No photos yet</h3>
        <p className="text-sm text-muted-foreground">
          Photos you capture will appear here
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Photo grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {photos.map((photo) => (
          <PhotoThumbnail
            key={photo.id}
            photo={photo}
            onClick={() => handlePhotoClick(photo)}
            selected={selectedPhotos.has(photo.id)}
          />
        ))}
      </div>

      {/* Load more trigger */}
      {hasMore && (
        <div ref={loadMoreRef} className="mt-4 flex justify-center py-4">
          {isLoading && (
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          )}
        </div>
      )}

      {/* Selection summary */}
      {selectable && selectedPhotos.size > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 rounded-lg bg-primary px-6 py-3 text-primary-foreground shadow-lg">
          {selectedPhotos.size} photo{selectedPhotos.size !== 1 ? "s" : ""} selected
        </div>
      )}

      {/* Photo viewer */}
      {viewerOpen && selectedPhoto && (
        <PhotoViewer
          photo={selectedPhoto}
          photos={photos}
          onClose={() => setViewerOpen(false)}
          onDelete={handleDeletePhoto}
          onAnnotationsSave={handleAnnotationsSave}
          onNext={() => {
            const currentIndex = photos.findIndex((p) => p.id === selectedPhoto.id);
            if (currentIndex < photos.length - 1) {
              setSelectedPhoto(photos[currentIndex + 1]);
            }
          }}
          onPrevious={() => {
            const currentIndex = photos.findIndex((p) => p.id === selectedPhoto.id);
            if (currentIndex > 0) {
              setSelectedPhoto(photos[currentIndex - 1]);
            }
          }}
        />
      )}
    </div>
  );
}
