"use client";

import React, { useRef, useState } from "react";
import { Camera, Upload, X, Link as LinkIcon } from "lucide-react";
import { PhotoEncryption } from "@/lib/utils/photoEncryption";

export interface LinkContext {
  dailyEntryId?: string;
  symptomIds?: string[];
  bodyRegionIds?: string[];
}

interface PhotoCaptureProps {
  onPhotoCapture: (file: File, preview: string) => void;
  onCancel: () => void;
  maxFiles?: number;
  allowCamera?: boolean;
  allowGallery?: boolean;
  linkContext?: LinkContext;
}

export function PhotoCapture({
  onPhotoCapture,
  onCancel,
  maxFiles = 1,
  allowCamera = true,
  allowGallery = true,
  linkContext,
}: PhotoCaptureProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setError(null);

    if (files.length === 0) return;

    for (const file of files.slice(0, maxFiles)) {
      // Validate file
      const validation = PhotoEncryption.validatePhoto(file);
      if (!validation.valid) {
        setError(validation.error || "Invalid file");
        continue;
      }

      // Create preview URL
      const preview = URL.createObjectURL(file);
      onPhotoCapture(file, preview);
    }
  };

  const handleCameraClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute("capture", "environment");
      fileInputRef.current.click();
    }
  };

  const handleGalleryClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute("capture");
      fileInputRef.current.click();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">Add Photo</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Auto-Link Indicator */}
        {linkContext?.dailyEntryId && (
          <div className="mb-4 flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <LinkIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <span className="text-sm text-blue-900">
              Photos will be automatically linked to this daily entry
            </span>
          </div>
        )}

        {/* Capture Options */}
        <div className="space-y-3">
          {allowCamera && (
            <button
              onClick={handleCameraClick}
              className="w-full flex items-center justify-center gap-3 p-4 border-2 border-gray-300 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-colors"
            >
              <Camera className="w-6 h-6 text-blue-600" />
              <div className="text-left">
                <div className="font-semibold text-gray-900">Take Photo</div>
                <div className="text-sm text-gray-600">
                  Use your device camera
                </div>
              </div>
            </button>
          )}

          {allowGallery && (
            <button
              onClick={handleGalleryClick}
              className="w-full flex items-center justify-center gap-3 p-4 border-2 border-gray-300 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-colors"
            >
              <Upload className="w-6 h-6 text-blue-600" />
              <div className="text-left">
                <div className="font-semibold text-gray-900">
                  Choose from Gallery
                </div>
                <div className="text-sm text-gray-600">
                  Select existing photos
                </div>
              </div>
            </button>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/heic"
          multiple={maxFiles > 1}
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Info */}
        <div className="mt-6 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600">
            <strong>Privacy:</strong> Photos are encrypted and stored only on
            your device. They never leave your device without your explicit
            consent.
          </p>
          <p className="text-xs text-gray-600 mt-2">
            <strong>Supported formats:</strong> JPEG, PNG, HEIC (max 10MB)
          </p>
        </div>
      </div>
    </div>
  );
}
