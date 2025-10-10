import { db } from "../db/client";
import { PhotoAttachmentRecord, PhotoComparisonRecord } from "../db/schema";
import { PhotoAttachment, PhotoComparisonPair, PhotoFilter } from "../types/photo";
import { PhotoAnnotation } from "../types/annotation";
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
}

export const photoRepository = new PhotoRepository();
