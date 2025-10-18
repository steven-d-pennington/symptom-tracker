"use client";

import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { PhotoAttachment } from '@/lib/types/photo';
import { PhotoEncryption } from '@/lib/utils/photoEncryption';
import {
  PhotoAnnotation as PhotoAnnotationType,
  AnnotationTool,
  ToolConfig,
  ANNOTATION_COLORS,
  LINE_WIDTHS,
  FONT_SIZES,
  BLUR_INTENSITIES,
} from '@/lib/types/annotation';
import { AnnotationCanvas } from './AnnotationCanvas';
import { AnnotationToolbar } from './AnnotationToolbar';
import { AnnotationColorPicker } from './AnnotationColorPicker';
import { LineWidthSelector } from './LineWidthSelector';
import { FontSizeSelector } from './FontSizeSelector';
import { BlurIntensitySelector } from './BlurIntensitySelector';
import { TextInputDialog } from './TextInputDialog';
import { BlurWarningDialog } from './BlurWarningDialog';
import { photoRepository } from '@/lib/repositories/photoRepository';
import { v4 as uuidv4 } from 'uuid';

interface PhotoAnnotationProps {
  photo: PhotoAttachment;
  existingAnnotations?: PhotoAnnotationType[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (annotations: PhotoAnnotationType[]) => Promise<void>;
}

export function PhotoAnnotation({
  photo,
  existingAnnotations = [],
  isOpen,
  onClose,
  onSave,
}: PhotoAnnotationProps) {
  const [annotations, setAnnotations] = useState<PhotoAnnotationType[]>(existingAnnotations);
  const [selectedTool, setSelectedTool] = useState<AnnotationTool>('arrow');
  const [toolConfig, setToolConfig] = useState<ToolConfig>({
    color: ANNOTATION_COLORS.red,
    lineWidth: LINE_WIDTHS.medium,
    fontSize: FONT_SIZES.medium,
    blurIntensity: BLUR_INTENSITIES.medium,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [imageDataUrl, setImageDataUrl] = useState<string>('');
  const [loadError, setLoadError] = useState<string | null>(null);
  
  // Text annotation state
  const [isTextDialogOpen, setIsTextDialogOpen] = useState(false);
  const [textPosition, setTextPosition] = useState<{ x: number; y: number } | null>(null);
  
  // Blur warning state
  const [isBlurWarningOpen, setIsBlurWarningOpen] = useState(false);
  const [isApplyingBlur, setIsApplyingBlur] = useState(false);
  
  // Undo/Redo history state
  const [history, setHistory] = useState<PhotoAnnotationType[][]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Load and decrypt image
  useEffect(() => {
    if (!isOpen) return;

    if (!photo.encryptedData) {
      setLoadError('No image data available');
      return;
    }

    let objectUrl: string | null = null;

    async function loadPhoto() {
      try {
        setLoadError(null);
        setImageLoaded(false);

        // Decrypt if needed (same as PhotoViewer)
        let decryptedBlob: Blob;
        if (photo.encryptionKey) {
          const key = await PhotoEncryption.importKey(photo.encryptionKey);
          decryptedBlob = await PhotoEncryption.decryptPhoto(
            photo.encryptedData,
            key,
            photo.encryptionIV
          );
        } else {
          decryptedBlob = photo.encryptedData;
        }

        // Create object URL
        objectUrl = URL.createObjectURL(decryptedBlob);
        setImageDataUrl(objectUrl);

        // Load image to get dimensions
        const img = new Image();
        img.onload = () => {
          setImageDimensions({ width: img.width, height: img.height });
          setImageLoaded(true);
        };
        img.onerror = (e) => {
          console.error('PhotoAnnotation: Failed to load image', e);
          setLoadError('Failed to decode image');
          setImageLoaded(false);
        };
        img.src = objectUrl;
      } catch (err) {
        console.error('PhotoAnnotation: Error loading photo', err);
        setLoadError('Failed to decrypt and load photo');
        setImageLoaded(false);
      }
    }

    loadPhoto();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [isOpen, photo.encryptedData, photo.encryptionKey, photo.encryptionIV, photo.mimeType]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setAnnotations(existingAnnotations);
      setSelectedTool('arrow');
      setToolConfig({
        color: ANNOTATION_COLORS.red,
        lineWidth: LINE_WIDTHS.medium,
        fontSize: FONT_SIZES.medium,
        blurIntensity: BLUR_INTENSITIES.medium,
      });
    }
  }, [isOpen, existingAnnotations]);

  // History management functions
  const addToHistory = (newAnnotations: PhotoAnnotationType[]) => {
    // Deep copy current state
    const newState = JSON.parse(JSON.stringify(newAnnotations)) as PhotoAnnotationType[];
    
    // Remove future states (if user made changes after undo)
    const trimmedHistory = history.slice(0, historyIndex + 1);
    
    // Add new state
    const newHistory = [...trimmedHistory, newState];
    
    // Enforce 10-item limit (FIFO - remove oldest)
    if (newHistory.length > 10) {
      newHistory.shift();
      setHistory(newHistory);
      // Don't increment index since we removed from beginning
    } else {
      setHistory(newHistory);
      setHistoryIndex(historyIndex + 1);
    }
  };

  const undo = () => {
    if (historyIndex <= 0) return; // Can't undo before start
    
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    setAnnotations(JSON.parse(JSON.stringify(history[newIndex])) as PhotoAnnotationType[]);
  };

  const redo = () => {
    if (historyIndex >= history.length - 1) return; // Can't redo beyond end
    
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    setAnnotations(JSON.parse(JSON.stringify(history[newIndex])) as PhotoAnnotationType[]);
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleAnnotationAdd = (annotation: PhotoAnnotationType) => {
    // Prevent adding more than 50 annotations
    if (annotations.length >= 50) {
      return;
    }
    const newAnnotations = [...annotations, annotation];
    setAnnotations(newAnnotations);
    addToHistory(newAnnotations);
  };

  const handleTextClick = (position: { x: number; y: number }) => {
    setTextPosition(position);
    setIsTextDialogOpen(true);
  };

  const handleTextSave = (text: string) => {
    if (!textPosition) return;

    const textAnnotation: PhotoAnnotationType = {
      id: uuidv4(),
      type: 'text',
      color: toolConfig.color,
      lineWidth: 0, // Not used for text
      coordinates: {
        x: textPosition.x,
        y: textPosition.y,
        text,
        fontSize: toolConfig.fontSize || FONT_SIZES.medium,
      },
      createdAt: new Date(),
      order: annotations.length,
    };

    const newAnnotations = [...annotations, textAnnotation];
    setAnnotations(newAnnotations);
    addToHistory(newAnnotations);
    setTextPosition(null);
  };

  const handleUndo = () => {
    undo();
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all annotations?')) {
      const newAnnotations: PhotoAnnotationType[] = [];
      setAnnotations(newAnnotations);
      addToHistory(newAnnotations);
    }
  };

  const handleSave = async () => {
    // Check if there are any blur annotations
    const blurAnnotations = annotations.filter(a => a.type === 'blur');
    
    if (blurAnnotations.length > 0) {
      // Show warning dialog before applying blur
      setIsBlurWarningOpen(true);
      return;
    }
    
    // No blur annotations, save normally
    setIsSaving(true);
    try {
      await onSave(annotations);
      
      // Clear history after successful save
      setHistory([]);
      setHistoryIndex(-1);
      
      onClose();
    } catch (error) {
      console.error('Failed to save annotations:', error);
      alert('Failed to save annotations. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleBlurConfirm = async () => {
    setIsBlurWarningOpen(false);
    setIsApplyingBlur(true);
    
    try {
      // Get blur annotations
      const blurAnnotations = annotations.filter(a => a.type === 'blur');
      
      console.log('[PhotoAnnotation] Applying permanent blur', {
        blurAnnotationsCount: blurAnnotations.length,
        photoId: photo.id,
      });
      
      // Apply permanent blur to photo (this updates the photo in the database)
      await photoRepository.applyPermanentBlur(photo.id, blurAnnotations);
      
      console.log('[PhotoAnnotation] Blur applied successfully');
      
      // Save remaining non-blur annotations
      // The blur annotations are already removed by applyPermanentBlur
      const nonBlurAnnotations = annotations.filter(a => a.type !== 'blur');
      await onSave(nonBlurAnnotations);
      
      console.log('[PhotoAnnotation] Annotations saved. Photo will be refreshed by parent component.');
      
      // Clear history after successful save
      setHistory([]);
      setHistoryIndex(-1);
      
      onClose();
    } catch (error) {
      console.error('[PhotoAnnotation] Failed to apply blur:', error);
      alert('Failed to apply blur. Please try again.');
    } finally {
      setIsApplyingBlur(false);
    }
  };

  const handleCancel = () => {
    if (annotations.length !== existingAnnotations.length) {
      if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC to close
      if (e.key === 'Escape') {
        handleCancel();
        return;
      }

      // Ctrl/Cmd + S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
        return;
      }

      // Ctrl/Cmd + Shift + Z to redo
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') {
        e.preventDefault();
        redo();
        return;
      }

      // Ctrl/Cmd + Z to undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undo();
        return;
      }

      // Ctrl/Cmd + Y to redo (alternative)
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
        return;
      }

      // Tool shortcuts
      if (e.key === 'a' || e.key === 'A') {
        setSelectedTool('arrow');
      } else if (e.key === 'c' || e.key === 'C') {
        setSelectedTool('circle');
      } else if (e.key === 'r' || e.key === 'R') {
        setSelectedTool('rectangle');
      } else if (e.key === 't' || e.key === 'T') {
        setSelectedTool('text');
      } else if (e.key === 'b' || e.key === 'B') {
        setSelectedTool('blur');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, annotations.length, existingAnnotations.length]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-black/80 px-4 py-3 backdrop-blur-sm">
        <h2 className="text-lg font-semibold text-white">Annotate Photo</h2>
        <button
          onClick={handleCancel}
          className="rounded-full p-2 text-white/80 hover:bg-white/10 hover:text-white"
          aria-label="Close annotation editor"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Main content area */}
      <div className="relative flex flex-1 flex-col overflow-hidden">
        {/* Canvas area */}
        <div className="flex-1 overflow-hidden">
          {loadError ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="text-red-500 text-lg mb-2">⚠️ Error Loading Image</div>
                <div className="text-white/60 text-sm">{loadError}</div>
              </div>
            </div>
          ) : !imageLoaded ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-white/60">Loading image...</div>
            </div>
          ) : (
            <AnnotationCanvas
              imageUrl={imageDataUrl}
              imageWidth={imageDimensions.width}
              imageHeight={imageDimensions.height}
              annotations={annotations}
              selectedTool={selectedTool}
              toolConfig={toolConfig}
              onAnnotationAdd={handleAnnotationAdd}
              onTextClick={handleTextClick}
            />
          )}
        </div>

        {/* Toolbar overlay */}
        <div className="absolute left-4 top-4 flex flex-col gap-4">
          {/* Drawing tools */}
          <div className="rounded-lg bg-black/60 p-2 backdrop-blur-md">
            <AnnotationToolbar
              selectedTool={selectedTool}
              onToolSelect={setSelectedTool}
              disabled={annotations.length >= 50}
            />
          </div>

          {/* Color picker */}
          <div className="rounded-lg bg-black/60 p-2 backdrop-blur-md">
            <AnnotationColorPicker
              selectedColor={toolConfig.color}
              onColorSelect={(color) =>
                setToolConfig((prev) => ({ ...prev, color }))
              }
            />
          </div>

          {/* Line width selector - only for shape tools */}
          {selectedTool !== 'text' && selectedTool !== 'blur' && (
            <div className="rounded-lg bg-black/60 p-2 backdrop-blur-md">
              <LineWidthSelector
                selectedWidth={toolConfig.lineWidth}
                onWidthSelect={(lineWidth) =>
                  setToolConfig((prev) => ({ ...prev, lineWidth }))
                }
              />
            </div>
          )}

          {/* Font size selector - only for text tool */}
          {selectedTool === 'text' && (
            <div className="rounded-lg bg-black/60 p-2 backdrop-blur-md">
              <FontSizeSelector
                selectedSize={
                  (toolConfig.fontSize === FONT_SIZES.small ? 'small' :
                   toolConfig.fontSize === FONT_SIZES.large ? 'large' : 'medium') as 'small' | 'medium' | 'large'
                }
                onSizeSelect={(size) =>
                  setToolConfig((prev) => ({ ...prev, fontSize: FONT_SIZES[size] }))
                }
              />
            </div>
          )}

          {/* Blur intensity selector - only for blur tool */}
          {selectedTool === 'blur' && (
            <div className="rounded-lg bg-black/60 p-2 backdrop-blur-md">
              <BlurIntensitySelector
                selectedIntensity={
                  (toolConfig.blurIntensity === BLUR_INTENSITIES.light ? 'light' :
                   toolConfig.blurIntensity === BLUR_INTENSITIES.heavy ? 'heavy' : 'medium') as 'light' | 'medium' | 'heavy'
                }
                onIntensitySelect={(intensity) =>
                  setToolConfig((prev) => ({ ...prev, blurIntensity: BLUR_INTENSITIES[intensity] }))
                }
              />
            </div>
          )}
        </div>

        {/* Action buttons overlay (bottom right) */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          {/* Undo button */}
          <button
            onClick={handleUndo}
            disabled={!canUndo}
            className="rounded-lg bg-black/60 px-4 py-2 text-sm font-medium text-white backdrop-blur-md hover:bg-black/80 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-black/60"
            aria-label="Undo last action (Ctrl+Z)"
            title={canUndo ? "Undo last action (Ctrl+Z)" : "No actions to undo"}
          >
            Undo
          </button>

          {/* Redo button */}
          <button
            onClick={redo}
            disabled={!canRedo}
            className="rounded-lg bg-black/60 px-4 py-2 text-sm font-medium text-white backdrop-blur-md hover:bg-black/80 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-black/60"
            aria-label="Redo action (Ctrl+Shift+Z)"
            title={canRedo ? "Redo action (Ctrl+Shift+Z)" : "No actions to redo"}
          >
            Redo
          </button>

          {/* Clear button */}
          <button
            onClick={handleClear}
            disabled={annotations.length === 0}
            className="rounded-lg bg-black/60 px-4 py-2 text-sm font-medium text-white backdrop-blur-md hover:bg-black/80 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-black/60"
            aria-label="Clear all annotations"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Footer action bar */}
      <div className="flex items-center justify-between border-t border-white/10 bg-black/80 px-4 py-3 backdrop-blur-sm">
        <div className="text-sm text-white/60">
          {annotations.length} {annotations.length === 1 ? 'annotation' : 'annotations'}
          {annotations.length >= 50 && (
            <span className="ml-3 rounded bg-red-500/90 px-2 py-0.5 text-xs font-semibold text-white">
              Maximum 50 annotations reached
            </span>
          )}
          {annotations.length >= 45 && annotations.length < 50 && (
            <span className="ml-3 rounded bg-yellow-500/90 px-2 py-0.5 text-xs font-semibold text-black">
              Warning: {50 - annotations.length} annotations remaining
            </span>
          )}
          <span className="ml-4 text-white/40">
            Shortcuts: A (Arrow), C (Circle), R (Rectangle), T (Text), B (Blur), Ctrl+Z (Undo), Ctrl+Shift+Z (Redo), Ctrl+S (Save)
          </span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className="rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || isApplyingBlur}
            className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50"
          >
            {isSaving || isApplyingBlur ? (
              <>{isApplyingBlur ? 'Applying Blur...' : 'Saving...'}</>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Annotations
              </>
            )}
          </button>
        </div>
      </div>

      {/* Text input dialog */}
      <TextInputDialog
        open={isTextDialogOpen}
        onOpenChange={setIsTextDialogOpen}
        onSave={handleTextSave}
      />
      
      {/* Blur warning dialog */}
      <BlurWarningDialog
        open={isBlurWarningOpen}
        blurAnnotations={annotations.filter(a => a.type === 'blur')}
        onConfirm={handleBlurConfirm}
        onOpenChange={setIsBlurWarningOpen}
      />
      
      {/* Blur processing indicator */}
      {isApplyingBlur && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 rounded-lg bg-white/10 px-8 py-6 shadow-xl backdrop-blur-md">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-yellow-500/30 border-t-yellow-500"></div>
            <div className="text-lg font-medium text-white">Applying blur to photo...</div>
            <div className="text-sm text-white/60">This may take a moment</div>
          </div>
        </div>
      )}
    </div>
  );
}
