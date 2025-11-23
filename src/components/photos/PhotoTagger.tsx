"use client";

import { useState } from "react";
import { PhotoAttachment } from "@/lib/types/photo";
import { photoRepository } from "@/lib/repositories/photoRepository";

interface PhotoTaggerProps {
  photo: PhotoAttachment;
  onUpdate: (photo: PhotoAttachment) => void;
}

export function PhotoTagger({ photo, onUpdate }: PhotoTaggerProps) {
  const [newTag, setNewTag] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const commonTags = [
    "Flare",
    "Healing",
    "Before Treatment",
    "After Treatment",
    "Comparison",
    "Severe",
    "Mild",
    "Improving",
    "Worsening",
  ];

  const handleAddTag = async (tag: string) => {
    if (!tag.trim() || photo.tags.includes(tag.trim())) return;

    try {
      const updatedPhoto = {
        ...photo,
        tags: [...photo.tags, tag.trim()],
        updatedAt: new Date(),
      };

      await photoRepository.update(photo.id, updatedPhoto);
      onUpdate(updatedPhoto);
      setNewTag("");
    } catch (error) {
      console.error("Failed to add tag:", error);
    }
  };

  const handleRemoveTag = async (tag: string) => {
    try {
      const updatedPhoto = {
        ...photo,
        tags: photo.tags.filter((t) => t !== tag),
        updatedAt: new Date(),
      };

      await photoRepository.update(photo.id, updatedPhoto);
      onUpdate(updatedPhoto);
    } catch (error) {
      console.error("Failed to remove tag:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag(newTag);
    }
  };

  const suggestedTags = commonTags.filter((tag) => !photo.tags.includes(tag));

  return (
    <div className="space-y-4">
      {/* Current tags */}
      {photo.tags.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-medium text-foreground">Tags</h4>
          <div className="flex flex-wrap gap-2">
            {photo.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
              >
                {tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 rounded-full hover:bg-primary/20"
                  aria-label={`Remove ${tag} tag`}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Add new tag */}
      {isAdding ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              if (!newTag.trim()) setIsAdding(false);
            }}
            placeholder="Enter tag name..."
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
            autoFocus
          />
          <button
            onClick={() => handleAddTag(newTag)}
            disabled={!newTag.trim()}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            Add
          </button>
          <button
            onClick={() => {
              setIsAdding(false);
              setNewTag("");
            }}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="rounded-lg border border-dashed border-border px-4 py-2 text-sm text-muted-foreground hover:border-primary hover:text-primary"
        >
          + Add Tag
        </button>
      )}

      {/* Suggested tags */}
      {suggestedTags.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-medium text-muted-foreground">Suggested</h4>
          <div className="flex flex-wrap gap-2">
            {suggestedTags.slice(0, 6).map((tag) => (
              <button
                key={tag}
                onClick={() => handleAddTag(tag)}
                className="rounded-full border border-border bg-background px-3 py-1 text-sm text-foreground hover:border-primary hover:bg-primary/5"
              >
                + {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
