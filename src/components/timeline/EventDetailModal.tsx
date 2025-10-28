"use client";

import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Camera, Link as LinkIcon } from 'lucide-react';
import { TimelineEvent } from './TimelineView';
import { medicationEventRepository } from '@/lib/repositories/medicationEventRepository';
import { triggerEventRepository } from '@/lib/repositories/triggerEventRepository';
import { flareRepository } from '@/lib/repositories/flareRepository';
import { foodEventRepository } from '@/lib/repositories/foodEventRepository';
import { photoRepository } from '@/lib/repositories/photoRepository';
import { PhotoCapture } from '@/components/photos/PhotoCapture';
import { PhotoEncryption } from '@/lib/utils/photoEncryption';
import { MarkdownPreview } from '@/components/common/MarkdownPreview';
import { announceToScreenReader, handleModalKeyboard, getSliderAriaAttributes, focusFirstElement } from '@/lib/utils/a11y';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';

interface EventDetailModalProps {
  event: TimelineEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
  onDelete?: () => void;
}

const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  isOpen,
  onClose,
  onSave,
  onDelete
}) => {
  const { userId } = useCurrentUser();

  // Form state
  const [dosageOverride, setDosageOverride] = useState('');
  const [severity, setSeverity] = useState(5);
  const [bodyLocation, setBodyLocation] = useState('');
  const [intensity, setIntensity] = useState<'low' | 'medium' | 'high'>('medium');
  const [suspectedCause, setSuspectedCause] = useState('');
  const [notes, setNotes] = useState('');
  const [linkedEvents, setLinkedEvents] = useState<string[]>([]);
  const [attachedPhotoIds, setAttachedPhotoIds] = useState<string[]>([]);

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPhotoCapture, setShowPhotoCapture] = useState(false);
  const [showEventLinker, setShowEventLinker] = useState(false);

  // Refs for focus management
  const modalRef = React.useRef<HTMLDivElement>(null);
  const firstInputRef = React.useRef<HTMLInputElement>(null);

  // Initialize form with event data
  useEffect(() => {
    if (event && isOpen) {
      initializeForm();
      // Focus management: focus first input when modal opens
      focusFirstElement(modalRef);
      // Announce modal opened
      announceToScreenReader(`Event details modal opened for ${event.summary}`);
    }
  }, [event, isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    handleModalKeyboard(e, onClose, modalRef);
  };

  const initializeForm = () => {
    if (!event) return;

    // Reset form
    setDosageOverride('');
    setSeverity(5);
    setBodyLocation('');
    setIntensity('medium');
    setSuspectedCause('');
    setNotes(event.details || '');
    setLinkedEvents([]);
    setAttachedPhotoIds([]);
    setError(null);

    // Load type-specific data
    switch (event.type) {
      case 'medication':
        if (event.eventRef.dosage) {
          setDosageOverride(event.eventRef.dosage);
        }
        break;
      case 'trigger':
        if (event.eventRef.intensity) {
          setIntensity(event.eventRef.intensity);
        }
        break;
      case 'flare-created':
      case 'flare-updated':
        if (event.eventRef.severity) {
          setSeverity(event.eventRef.severity);
        }
        if (event.eventRef.bodyRegions && event.eventRef.bodyRegions.length > 0) {
          setBodyLocation(event.eventRef.bodyRegions[0]);
        }
        if (event.eventRef.photoIds) {
          setAttachedPhotoIds(event.eventRef.photoIds);
        }
        break;
    }
  };

  // Handle photo capture
  const handlePhotoCapture = async (file: File, preview: string) => {
    try {
      if (!userId) {
        setError('User not found. Please refresh the page.');
        return;
      }

      // Generate encryption key
      const key = await PhotoEncryption.generateKey();
      const keyString = await PhotoEncryption.exportKey(key);

      // Strip EXIF and compress
      const { blob: cleanedBlob } = await PhotoEncryption.stripExifData(file);
      const compressedBlob = await PhotoEncryption.compressPhoto(cleanedBlob);

      // Create thumbnail
      const thumbnailBlob = await PhotoEncryption.generateThumbnail(compressedBlob);

      // Encrypt both
      const encrypted = await PhotoEncryption.encryptPhoto(compressedBlob, key);
      const encryptedThumbnail = await PhotoEncryption.encryptPhoto(thumbnailBlob, key);

      // Get image dimensions (for UI display)
      const img = await createImageBitmap(compressedBlob);

      const photoData = {
        userId,
        fileName: file.name,
        originalFileName: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        width: img.width,
        height: img.height,
        encryptedData: encrypted.data,
        thumbnailData: encryptedThumbnail.data,
        encryptionIV: encrypted.iv,
        thumbnailIV: encryptedThumbnail.iv,
        encryptionKey: keyString,
        capturedAt: new Date(),
        tags: [],
        notes: undefined,
        metadata: undefined,
        eventId: event?.id // Link to this event
      };

      const photo = await photoRepository.create(photoData);
      setAttachedPhotoIds([...attachedPhotoIds, photo.id]);
      setShowPhotoCapture(false);
    } catch (err) {
      console.error('Error capturing photo:', err);
      setError('Failed to attach photo. Please try again.');
    }
  };

  // Handle save
  const handleSave = async () => {
    if (!event) return;

    setIsSaving(true);
    setError(null);

    try {
      switch (event.type) {
        case 'medication':
          await medicationEventRepository.update(event.id, {
            dosage: dosageOverride || undefined,
            notes: notes || undefined
          });
          break;

        case 'trigger':
          await triggerEventRepository.update(event.id, {
            intensity,
            notes: notes || undefined
          });
          break;

        case 'flare-created':
        case 'flare-updated':
        case 'flare-resolved':
          // For flares, update the flare record using new repository API
          const flareId = event.eventRef.id;

          // Detect what changed
          const severityChanged = severity !== event.eventRef.severity;

          // Create FlareEvent record for the status update (append-only pattern)
          if (severityChanged) {
            await flareRepository.addFlareEvent(userId, flareId, {
              eventType: "severity_update",
              timestamp: Date.now(),
              severity: severity,
              notes: notes.trim() || undefined,
            });

            // Update FlareRecord current severity
            await flareRepository.updateFlare(userId, flareId, {
              currentSeverity: severity,
            });
          } else if (notes.trim()) {
            // If only notes changed, create a trend_change event
            await flareRepository.addFlareEvent(userId, flareId, {
              eventType: "trend_change",
              timestamp: Date.now(),
              notes: notes.trim(),
            });
          }

          // Note: photoIds are not part of FlareRecord schema in Epic 2 design
          // Photo linking is handled separately via photoRepository with eventId
          break;

        case 'food':
          await foodEventRepository.update(event.id, {
            notes: notes || undefined,
          } as any);
          break;

        default:
          throw new Error('Unknown event type');
      }

      // Announce success to screen readers
      announceToScreenReader('Event details saved successfully', 'polite');

      if (onSave) {
        onSave();
      }
      onClose();
    } catch (err) {
      console.error('Error saving event details:', err);
      const errorMsg = 'Failed to save event details. Please try again.';
      setError(errorMsg);
      // Announce error to screen readers
      announceToScreenReader(errorMsg, 'assertive');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!event) return;

    setIsSaving(true);
    setError(null);

    try {
      switch (event.type) {
        case 'medication':
          await medicationEventRepository.delete(event.id);
          break;

        case 'trigger':
          await triggerEventRepository.delete(event.id);
          break;

        case 'flare-created':
        case 'flare-updated':
        case 'flare-resolved':
          // Delete the entire flare
          if (!userId) {
            throw new Error('User not found');
          }
          await flareRepository.deleteFlare(userId, event.eventRef.id);
          break;

        case 'food':
          await foodEventRepository.delete(event.id);
          break;

        default:
          throw new Error('Unknown event type');
      }

      if (onDelete) {
        onDelete();
      }
      onClose();
    } catch (err) {
      console.error('Error deleting event:', err);
      setError('Failed to delete event. Please try again.');
    } finally {
      setIsSaving(false);
      setShowDeleteConfirm(false);
    }
  };

  // Format event summary
  const getEventIcon = (): string => {
    if (!event) return '';
    switch (event.type) {
      case 'medication':
        return '💊';
      case 'trigger':
        return '⚠️';
      case 'flare-created':
      case 'flare-updated':
      case 'flare-resolved':
        return '🔥';
      default:
        return '📝';
    }
  };

  const formatTime = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Render type-specific form fields
  const renderFormFields = () => {
    if (!event) return null;

    switch (event.type) {
      case 'medication':
        return (
          <>
            <div>
              <label htmlFor="dosage-override" className="block text-sm font-medium text-foreground mb-1">
                Dosage Override
              </label>
              <input
                ref={firstInputRef}
                id="dosage-override"
                type="text"
                value={dosageOverride}
                onChange={(e) => setDosageOverride(e.target.value)}
                placeholder="e.g., 2 tablets instead of 1"
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground min-h-[44px]"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Optional: Override the standard dosage for this specific occurrence
              </p>
            </div>
          </>
        );

      case 'trigger':
        return (
          <>
            <div>
              <label htmlFor="intensity" className="block text-sm font-medium text-foreground mb-1">
                Intensity
              </label>
              <select
                id="intensity"
                value={intensity}
                onChange={(e) => setIntensity(e.target.value as 'low' | 'medium' | 'high')}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label htmlFor="suspected-cause" className="block text-sm font-medium text-foreground mb-1">
                Suspected Cause
              </label>
              <input
                id="suspected-cause"
                type="text"
                value={suspectedCause}
                onChange={(e) => setSuspectedCause(e.target.value)}
                placeholder="What might have triggered this?"
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
              />
            </div>
          </>
        );

      case 'flare-created':
      case 'flare-updated':
      case 'flare-resolved':
        return (
          <>
            <div>
              <label htmlFor="severity" className="block text-sm font-medium text-foreground mb-1">
                Severity: {severity}/10
              </label>
              <input
                id="severity"
                type="range"
                min="1"
                max="10"
                value={severity}
                onChange={(e) => setSeverity(parseInt(e.target.value))}
                {...getSliderAriaAttributes(severity, 1, 10, 'Flare severity')}
                className="w-full h-8 cursor-pointer"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Mild (1)</span>
                <span>Severe (10)</span>
              </div>
            </div>
            <div>
              <label htmlFor="body-location" className="block text-sm font-medium text-foreground mb-1">
                Body Location
              </label>
              <input
                id="body-location"
                type="text"
                value={bodyLocation}
                onChange={(e) => setBodyLocation(e.target.value)}
                placeholder="e.g., Right armpit, Lower back"
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  if (!isOpen || !event) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-0"
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-detail-title"
        onKeyDown={handleKeyDown}
      >
        <div
          ref={modalRef}
          className="relative w-full h-full md:h-auto md:max-w-2xl md:max-h-[90vh] overflow-y-auto bg-card rounded-none md:rounded-lg shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Sticky Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card p-4">
            <div>
              <h2 id="event-detail-title" className="text-xl font-semibold text-foreground">
                {getEventIcon()} Event Details
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {event.summary} at {formatTime(event.timestamp)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="mx-4 mt-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Form Content */}
          <div className="p-4 space-y-4">
            {/* Type-specific fields */}
            {renderFormFields()}

            {/* Notes field (common to all types) */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-foreground mb-1">
                Notes
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add detailed notes about this event (supports **bold** and - lists)"
                rows={4}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground resize-none"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Markdown supported: **bold**, - bullet points
              </p>
              {/* Markdown Preview */}
              {notes && notes.trim().length > 0 && (
                <div className="mt-2 p-3 bg-muted/30 border border-border rounded-lg">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Preview:</p>
                  <MarkdownPreview text={notes} className="text-sm text-foreground" />
                </div>
              )}
            </div>

            {/* Photo attachment button */}
            <div>
              <button
                onClick={() => setShowPhotoCapture(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary/10 transition-colors min-h-[44px] min-w-[44px]"
                type="button"
                aria-label="Add photo to event"
              >
                <Camera className="h-4 w-4" />
                Add Photo
              </button>
              {attachedPhotoIds.length > 0 && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {attachedPhotoIds.length} photo(s) attached
                </p>
              )}
            </div>

            {/* Event linking button */}
            <div>
              <button
                onClick={() => setShowEventLinker(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary/10 transition-colors min-h-[44px] min-w-[44px]"
                type="button"
                aria-label="Link to related events from same day"
              >
                <LinkIcon className="h-4 w-4" />
                Link to Related Events
              </button>
              {linkedEvents.length > 0 && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {linkedEvents.length} event(s) linked
                </p>
              )}
            </div>
          </div>

          {/* Sticky Footer */}
          <div className="sticky bottom-0 border-t border-border bg-card p-4">
            <div className="flex items-center justify-between">
              {/* Delete button */}
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors flex items-center gap-2 min-h-[44px]"
                disabled={isSaving}
                aria-label="Delete this event"
              >
                <Trash2 className="h-4 w-4" />
                Delete Event
              </button>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-foreground border border-border rounded-lg hover:bg-muted transition-colors min-h-[44px]"
                  disabled={isSaving}
                  aria-label="Cancel and close modal"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 min-h-[44px]"
                  aria-label="Save event details"
                >
                  {isSaving ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <>
          <div
            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="bg-card rounded-lg p-6 max-w-sm w-full shadow-xl">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Delete Event?
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Are you sure you want to delete this event? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-sm font-medium text-foreground border border-border rounded-lg hover:bg-muted transition-colors"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isSaving}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSaving ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Photo Capture Modal */}
      {showPhotoCapture && (
        <PhotoCapture
          onPhotoCapture={handlePhotoCapture}
          onCancel={() => setShowPhotoCapture(false)}
          allowCamera={true}
          allowGallery={true}
        />
      )}

      {/* Event Linker Modal - Placeholder for now */}
      {showEventLinker && (
        <>
          <div
            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
            onClick={() => setShowEventLinker(false)}
          />
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="bg-card rounded-lg p-6 max-w-md w-full shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Link Related Events
                </h3>
                <button
                  onClick={() => setShowEventLinker(false)}
                  className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Search for events from the same day to link them together. This helps identify correlations between triggers, medications, and symptoms.
              </p>
              <div className="space-y-2 mb-4">
                {/* TODO: Implement event suggestions from same day (24h window) */}
                <p className="text-sm text-muted-foreground italic">
                  No recent events found to link.
                </p>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowEventLinker(false)}
                  className="px-4 py-2 text-sm font-medium text-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default EventDetailModal;
