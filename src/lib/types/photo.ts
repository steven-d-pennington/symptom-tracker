/**
 * Photo Documentation Types
 * For secure, encrypted medical photo storage
 */

import { PhotoAnnotation } from './annotation';

export interface PhotoAttachment {
  id: string;
  userId: string;
  dailyEntryId?: string;
  symptomId?: string;
  bodyRegionId?: string;
  fileName: string;
  originalFileName: string;
  mimeType: string;
  sizeBytes: number;
  width: number;
  height: number;
  encryptedData: Blob; // Encrypted photo data
  thumbnailData: Blob; // Encrypted thumbnail (150x150)
  encryptionIV: string; // Initialization vector (base64)
  thumbnailIV?: string; // Thumbnail IV (base64)
  encryptionKey?: string; // Base64-encoded key (encrypted at rest in future)
  capturedAt: Date;
  tags: string[];
  notes?: string;
  metadata?: PhotoMetadata;
  annotations?: PhotoAnnotation[]; // Photo annotations (arrows, circles, etc.)
  hasBlur?: boolean; // Flag indicating permanent blur has been applied
  createdAt: Date;
  updatedAt: Date;
}

export interface PhotoMetadata {
  orientation: number; // EXIF orientation (1-8)
  location?: {
    latitude: number;
    longitude: number;
  };
  deviceInfo?: string;
  cameraSettings?: {
    iso?: number;
    shutterSpeed?: string;
    aperture?: string;
    flash?: boolean;
  };
}

export interface PhotoComparisonPair {
  id: string;
  userId: string;
  beforePhotoId: string;
  afterPhotoId: string;
  title: string;
  notes?: string;
  createdAt: Date;
}

export interface PhotoTag {
  id: string;
  name: string;
  color?: string;
  count: number;
}

export interface PhotoFilter {
  dateRange?: { start: Date; end: Date };
  tags?: string[];
  bodyRegions?: string[];
  symptoms?: string[];
  searchQuery?: string;
}

export interface PhotoGalleryView {
  id: string;
  name: string;
  filter: PhotoFilter;
  sortBy: "date" | "size" | "region" | "severity";
  sortDirection: "asc" | "desc";
}

// Encryption key management (stored in IndexedDB with different access patterns)
export interface PhotoEncryptionKey {
  id: string;
  userId: string;
  keyData: string; // Base64-encoded encrypted key
  createdAt: Date;
  lastUsed: Date;
}
