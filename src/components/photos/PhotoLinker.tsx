"use client";

import { useState, useEffect } from "react";
import { PhotoAttachment } from "@/lib/types/photo";
import { DailyEntry } from "@/lib/types/daily-entry";
import { dailyEntryRepository } from "@/lib/repositories/dailyEntryRepository";
import { X, Calendar, Check } from "lucide-react";

interface PhotoLinkerProps {
  photo: PhotoAttachment;
  onSave: (updatedPhoto: PhotoAttachment) => Promise<void>;
  onCancel: () => void;
}

export function PhotoLinker({ photo, onSave, onCancel }: PhotoLinkerProps) {
  const [recentEntries, setRecentEntries] = useState<DailyEntry[]>([]);
  const [selectedLinks, setSelectedLinks] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadLinkableEntities();
    initializeSelectedLinks();
  }, [photo.userId]);

  const initializeSelectedLinks = () => {
    const selected = new Set<string>();
    
    // Pre-select existing links
    if (photo.dailyEntryId) {
      selected.add(`entry-${photo.dailyEntryId}`);
    }
    if (photo.symptomId) {
      selected.add(`symptom-${photo.symptomId}`);
    }
    if (photo.bodyRegionId) {
      selected.add(`region-${photo.bodyRegionId}`);
    }
    
    setSelectedLinks(selected);
  };

  const toggleLink = (type: string, id: string) => {
    const linkKey = `${type}-${id}`;
    const newSelected = new Set(selectedLinks);
    
    if (newSelected.has(linkKey)) {
      newSelected.delete(linkKey);
    } else {
      newSelected.add(linkKey);
    }
    
    setSelectedLinks(newSelected);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Parse selected links into separate fields
      const entryIds: string[] = [];
      const symptomIds: string[] = [];
      const regionIds: string[] = [];

      selectedLinks.forEach((linkKey) => {
        const [type, id] = linkKey.split("-", 2);
        if (type === "entry") entryIds.push(id);
        if (type === "symptom") symptomIds.push(id);
        if (type === "region") regionIds.push(id);
      });

      // Create updated photo with new links
      const updatedPhoto: PhotoAttachment = {
        ...photo,
        dailyEntryId: entryIds[0] || undefined, // Primary link (first entry selected)
        symptomId: symptomIds[0] || undefined, // Primary symptom link
        bodyRegionId: regionIds[0] || undefined, // Primary region link
        updatedAt: new Date(),
      };

      await onSave(updatedPhoto);
      // Success! Modal will be closed by parent component
    } catch (error) {
      console.error("Failed to save links:", error);
      alert("Failed to save links. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const loadLinkableEntities = async () => {
    setIsLoading(true);
    try {
      // Load recent daily entries (last 30 days)
      const entries = await dailyEntryRepository.getRecent(photo.userId, 30);
      setRecentEntries(entries);
      
      // TODO: Load active symptoms and body regions in next tasks
    } catch (error) {
      console.error("Failed to load linkable entities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <>
      {/* Modal backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal content */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card rounded-lg shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card p-4">
            <h2 className="text-xl font-semibold">Manage Photo Links</h2>
            <button
              onClick={onCancel}
              className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Photo preview */}
          <div className="border-b border-border bg-muted/30 p-6">
            <div className="flex items-start gap-4">
              <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border-2 border-border bg-muted">
                {/* Thumbnail will be rendered here - using placeholder for now */}
                <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                  Photo
                </div>
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">
                  {formatDate(photo.capturedAt)}
                </p>
                {photo.fileName && (
                  <p className="text-xs text-muted-foreground">
                    {photo.fileName}
                  </p>
                )}
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>
                    {photo.width} × {photo.height}
                  </span>
                  <span>{formatFileSize(photo.sizeBytes)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content sections - placeholder for now */}
          <div className="p-6">
            {isLoading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Daily Entries Section */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-foreground">
                    Daily Entries
                  </h3>
                  {recentEntries.length > 0 ? (
                    <div className="max-h-64 space-y-2 overflow-y-auto">
                      {recentEntries.map((entry) => (
                        <LinkableItem
                          key={entry.id}
                          type="entry"
                          id={entry.id}
                          label={formatDate(new Date(entry.date))}
                          description={`Health: ${entry.overallHealth}/10`}
                          isSelected={selectedLinks.has(`entry-${entry.id}`)}
                          onToggle={() => toggleLink("entry", entry.id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No recent entries found
                    </p>
                  )}
                </div>

                {/* Symptoms Section - Placeholder */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-foreground">
                    Symptoms
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    No active symptoms found
                  </p>
                </div>

                {/* Body Regions Section - Placeholder */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-foreground">
                    Body Regions
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    No recent body regions found
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="sticky bottom-0 border-t border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {selectedLinks.size} link(s) selected
              </p>
              <div className="flex gap-3">
                <button
                  onClick={onCancel}
                  className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSaving ? "Saving..." : "Save Links"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// LinkableItem component for rendering selectable items
interface LinkableItemProps {
  type: "entry" | "symptom" | "region";
  id: string;
  label: string;
  description?: string;
  isSelected: boolean;
  onToggle: () => void;
}

function LinkableItem({
  type,
  label,
  description,
  isSelected,
  onToggle,
}: LinkableItemProps) {
  const getIcon = () => {
    switch (type) {
      case "entry":
        return <Calendar className="h-5 w-5 text-muted-foreground" />;
      case "symptom":
        return <Calendar className="h-5 w-5 text-muted-foreground" />; // TODO: Use HeartPulse icon
      case "region":
        return <Calendar className="h-5 w-5 text-muted-foreground" />; // TODO: Use User icon
    }
  };

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border-2 p-3 cursor-pointer transition-all ${
        isSelected
          ? "border-primary bg-blue-50 dark:bg-blue-950/20"
          : "border-border hover:bg-muted"
      }`}
      onClick={onToggle}
    >
      {/* Checkbox */}
      <div
        className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${
          isSelected
            ? "border-primary bg-primary"
            : "border-muted-foreground bg-background"
        }`}
      >
        {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="font-medium text-sm">{label}</div>
        {description && (
          <div className="text-xs text-muted-foreground">{description}</div>
        )}
      </div>

      {/* Icon */}
      <div>{getIcon()}</div>
    </div>
  );
}
