import { db } from "../db/client";
import { PhotoAttachmentRecord, PhotoComparisonRecord } from "../db/schema";
import { PhotoAttachment, PhotoComparisonPair, PhotoFilter } from "../types/photo";
import { PhotoAnnotation } from "../types/annotation";
import { PhotoEncryption } from "../utils/photoEncryption";
import { blurRegion } from "../utils/gaussianBlur";
import { percentToPixel } from "../utils/annotationRendering";
import { v4 as uuidv4 } from "uuid";

class PhotoRepository {
  /**
   * Create a new photo attachment
   */
  async create(
    data: Omit<PhotoAttachment, "id" | "createdAt" | "updatedAt">
  ): Promise<PhotoAttachment> {
    const now = new Date();
    const photo: PhotoAttachmentRecord = {
      ...data,
      id: uuidv4(),
      tags: JSON.stringify(data.tags || []),
      metadata: data.metadata ? JSON.stringify(data.metadata) : undefined,
      annotations: data.annotations ? JSON.stringify(data.annotations) : undefined,
      createdAt: now,
      updatedAt: now,
    };

    await db.photoAttachments.add(photo);
    return this.recordToPhoto(photo);
  }

  /**
   * Get photo by ID
   */
  async getById(id: string): Promise<PhotoAttachment | null> {
    const record = await db.photoAttachments.get(id);
    return record ? this.recordToPhoto(record) : null;
  }

  /**
   * Get all photos for a user
   */
  async getAll(userId: string): Promise<PhotoAttachment[]> {
    const records = await db.photoAttachments
      .where("userId")
      .equals(userId)
      .reverse()
      .sortBy("capturedAt");
    return records.map((r) => this.recordToPhoto(r));
  }

  /**
   * Get photos by daily entry
   */
  async getByDailyEntry(
    userId: string,
    dailyEntryId: string
  ): Promise<PhotoAttachment[]> {
    const records = await db.photoAttachments
      .where("dailyEntryId")
      .equals(dailyEntryId)
      .and((photo) => photo.userId === userId)
      .reverse()
      .sortBy("capturedAt");
    return records.map((r) => this.recordToPhoto(r));
  }

  /**
   * Get photos by body region
   */
  async getByBodyRegion(
    userId: string,
    bodyRegionId: string
  ): Promise<PhotoAttachment[]> {
    const records = await db.photoAttachments
      .where("[userId+bodyRegionId]")
      .equals([userId, bodyRegionId])
      .reverse()
      .sortBy("capturedAt");
    return records.map((r) => this.recordToPhoto(r));
  }

  /**
   * Get photos by symptom
   */
  async getBySymptom(
    userId: string,
    symptomId: string
  ): Promise<PhotoAttachment[]> {
    const records = await db.photoAttachments
      .where("symptomId")
      .equals(symptomId)
      .and((photo) => photo.userId === userId)
      .reverse()
      .sortBy("capturedAt");
    return records.map((r) => this.recordToPhoto(r));
  }

  /**
   * Get photos by date range
   */
  async getByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<PhotoAttachment[]> {
    const records = await db.photoAttachments
      .where("[userId+capturedAt]")
      .between([userId, startDate], [userId, endDate], true, true)
      .reverse()
      .sortBy("capturedAt");
    return records.map((r) => this.recordToPhoto(r));
  }

  /**
   * Get photos by tags
   */
  async getByTags(userId: string, tags: string[]): Promise<PhotoAttachment[]> {
    const allPhotos = await this.getAll(userId);
    return allPhotos.filter((photo) =>
      tags.some((tag) => photo.tags.includes(tag))
    );
  }

  /**
   * Search photos with filters
   */
  async search(userId: string, filter: PhotoFilter): Promise<PhotoAttachment[]> {
    let photos = await this.getAll(userId);

    if (filter.dateRange) {
      photos = photos.filter(
        (p) =>
          p.capturedAt >= filter.dateRange!.start &&
          p.capturedAt <= filter.dateRange!.end
      );
    }

    if (filter.tags && filter.tags.length > 0) {
      photos = photos.filter((p) =>
        filter.tags!.some((tag) => p.tags.includes(tag))
      );
    }

    if (filter.bodyRegions && filter.bodyRegions.length > 0) {
      photos = photos.filter(
        (p) => p.bodyRegionId && filter.bodyRegions!.includes(p.bodyRegionId)
      );
    }

    if (filter.symptoms && filter.symptoms.length > 0) {
      photos = photos.filter(
        (p) => p.symptomId && filter.symptoms!.includes(p.symptomId)
      );
    }

    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      photos = photos.filter(
        (p) =>
          p.originalFileName.toLowerCase().includes(query) ||
          (p.notes && p.notes.toLowerCase().includes(query)) ||
          p.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return photos;
  }

  /**
   * Update photo
   */
  async update(
    id: string,
    updates: Partial<Omit<PhotoAttachment, "id" | "createdAt">>
  ): Promise<void> {
    const updateRecord: Partial<PhotoAttachmentRecord> = {
      ...updates,
      tags: updates.tags ? JSON.stringify(updates.tags) : undefined,
      metadata: updates.metadata ? JSON.stringify(updates.metadata) : undefined,
      annotations: updates.annotations ? JSON.stringify(updates.annotations) : undefined,
      updatedAt: new Date(),
    };

    await db.photoAttachments.update(id, updateRecord);
  }

  /**
   * Update annotations for a photo
   */
  async updateAnnotations(
    id: string,
    annotations: PhotoAnnotation[]
  ): Promise<void> {
    await db.photoAttachments.update(id, {
      annotations: JSON.stringify(annotations),
      updatedAt: new Date(),
    });
  }

  /**
   * Delete photo
   */
  async delete(id: string): Promise<void> {
    await db.photoAttachments.delete(id);
  }

  /**
   * Get total storage used by photos
   */
  async getTotalStorageUsed(userId: string): Promise<number> {
    const photos = await db.photoAttachments
      .where("userId")
      .equals(userId)
      .toArray();
    return photos.reduce((total, photo) => total + photo.sizeBytes, 0);
  }

  /**
   * Get photo count by user
   */
  async getPhotoCount(userId: string): Promise<number> {
    return await db.photoAttachments.where("userId").equals(userId).count();
  }

  /**
   * Get all unique tags for a user
   */
  async getAllTags(userId: string): Promise<string[]> {
    const photos = await this.getAll(userId);
    const tagSet = new Set<string>();
    photos.forEach((photo) => {
      photo.tags.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }

  /**
   * Convert record to PhotoAttachment
   */
  private recordToPhoto(record: PhotoAttachmentRecord): PhotoAttachment {
    return {
      ...record,
      tags: JSON.parse(record.tags || "[]"),
      metadata: record.metadata ? JSON.parse(record.metadata) : undefined,
      annotations: record.annotations ? JSON.parse(record.annotations) : undefined,
      capturedAt: new Date(record.capturedAt),
      createdAt: new Date(record.createdAt),
      updatedAt: new Date(record.updatedAt),
    };
  }

  // ----- Photo Comparisons -----

  /**
   * Create a photo comparison pair
   */
  async createComparison(
    data: Omit<PhotoComparisonPair, "id" | "createdAt">
  ): Promise<PhotoComparisonPair> {
    const comparison: PhotoComparisonRecord = {
      ...data,
      id: uuidv4(),
      createdAt: new Date(),
    };

    await db.photoComparisons.add(comparison);
    return comparison;
  }

  /**
   * Get all comparisons for a user
   */
  async getAllComparisons(userId: string): Promise<PhotoComparisonPair[]> {
    return await db.photoComparisons
      .where("userId")
      .equals(userId)
      .reverse()
      .sortBy("createdAt");
  }

  /**
   * Get comparison by ID
   */
  async getComparisonById(id: string): Promise<PhotoComparisonPair | null> {
    return (await db.photoComparisons.get(id)) || null;
  }

  /**
   * Delete comparison
   */
  async deleteComparison(id: string): Promise<void> {
    await db.photoComparisons.delete(id);
  }

  /**
   * Bulk delete photos
   */
  async bulkDelete(ids: string[]): Promise<void> {
    await db.photoAttachments.bulkDelete(ids);
  }

  /**
   * Apply permanent blur to photo (IRREVERSIBLE)
   * This replaces the original photo data with blurred version
   */
  async applyPermanentBlur(
    photoId: string,
    blurAnnotations: PhotoAnnotation[]
  ): Promise<PhotoAttachment> {
    console.log('[applyPermanentBlur] Starting blur application', {
      photoId,
      blurAnnotationsCount: blurAnnotations.length,
      blurAnnotations: blurAnnotations.map(a => ({
        id: a.id,
        type: a.type,
        coordinates: a.coordinates,
      })),
    });

    const photo = await this.getById(photoId);
    if (!photo) throw new Error('Photo not found');

    console.log('[applyPermanentBlur] Photo loaded', {
      hasEncryptionKey: !!photo.encryptionKey,
      hasEncryptedData: !!photo.encryptedData,
      width: photo.width,
      height: photo.height,
    });

    // 1. Decrypt photo
    let decryptedBlob: Blob;
    if (photo.encryptionKey && photo.encryptedData) {
      console.log('[applyPermanentBlur] Decrypting photo...');
      const key = await PhotoEncryption.importKey(photo.encryptionKey);
      decryptedBlob = await PhotoEncryption.decryptPhoto(
        photo.encryptedData,
        key,
        photo.encryptionIV
      );
      console.log('[applyPermanentBlur] Photo decrypted', {
        blobSize: decryptedBlob.size,
      });
    } else if (photo.encryptedData) {
      decryptedBlob = photo.encryptedData;
      console.log('[applyPermanentBlur] Using unencrypted data');
    } else {
      throw new Error('No photo data available');
    }

    // 2. Load image into canvas
    console.log('[applyPermanentBlur] Loading image into canvas...');
    const imageUrl = URL.createObjectURL(decryptedBlob);
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = imageUrl;
    });

    console.log('[applyPermanentBlur] Image loaded', {
      width: img.width,
      height: img.height,
    });

    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    ctx.drawImage(img, 0, 0);
    URL.revokeObjectURL(imageUrl);

    // 3. Apply blur to each region
    console.log('[applyPermanentBlur] Applying blur to regions...');
    for (const annotation of blurAnnotations) {
      const coords = annotation.coordinates;
      if (coords.x === undefined || coords.y === undefined ||
          coords.width === undefined || coords.height === undefined) {
        console.warn('[applyPermanentBlur] Skipping annotation with missing coordinates', annotation);
        continue;
      }

      // Convert percentage coordinates to pixels
      const x = percentToPixel(coords.x, canvas.width);
      const y = percentToPixel(coords.y, canvas.height);
      const width = percentToPixel(Math.abs(coords.width), canvas.width);
      const height = percentToPixel(Math.abs(coords.height), canvas.height);
      const intensity = coords.intensity || 10;

      console.log('[applyPermanentBlur] Blurring region', {
        percentCoords: { x: coords.x, y: coords.y, width: coords.width, height: coords.height },
        pixelCoords: { x, y, width, height },
        intensity,
      });

      // Apply blur to this region
      blurRegion(canvas, x, y, width, height, intensity);
    }

    console.log('[applyPermanentBlur] Blur applied to all regions');

    // 4. Export canvas to blob
    console.log('[applyPermanentBlur] Exporting canvas to blob...');
    const blurredBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to create blob from canvas'));
      }, photo.mimeType || 'image/jpeg', 0.95);
    });

    console.log('[applyPermanentBlur] Canvas exported', {
      blobSize: blurredBlob.size,
    });

    // 5. Re-encrypt if original was encrypted
    let newEncryptedData: Blob;
    let newEncryptionKey: string | undefined;
    let newEncryptionIV: string | undefined;

    if (photo.encryptionKey) {
      console.log('[applyPermanentBlur] Re-encrypting blurred photo...');
      // Reuse existing encryption key
      const key = await PhotoEncryption.importKey(photo.encryptionKey);
      const { data, iv } = await PhotoEncryption.encryptPhoto(blurredBlob, key);
      newEncryptedData = data;
      newEncryptionKey = photo.encryptionKey; // Keep the same key
      newEncryptionIV = iv;
      console.log('[applyPermanentBlur] Photo re-encrypted');
    } else {
      newEncryptedData = blurredBlob;
      console.log('[applyPermanentBlur] No encryption needed');
    }

    // 6. Update photo record
    console.log('[applyPermanentBlur] Updating photo record...');
    const updatedPhoto: PhotoAttachment = {
      ...photo,
      encryptedData: newEncryptedData,
      encryptionIV: newEncryptionIV ?? photo.encryptionIV,
      hasBlur: true,
      // Remove blur annotations (they're now permanent)
      annotations: photo.annotations?.filter(a => a.type !== 'blur'),
      updatedAt: new Date(),
    };

    await this.update(photoId, updatedPhoto);
    console.log('[applyPermanentBlur] Photo updated successfully', {
      hasBlur: updatedPhoto.hasBlur,
      remainingAnnotations: updatedPhoto.annotations?.length || 0,
    });

    return updatedPhoto;
  }
}

export const photoRepository = new PhotoRepository();
