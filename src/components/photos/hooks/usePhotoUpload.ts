import { useState, useCallback } from "react";
import { PhotoEncryption } from "@/lib/utils/photoEncryption";
import { photoRepository } from "@/lib/repositories/photoRepository";
import { PhotoAttachment } from "@/lib/types/photo";

interface PhotoUploadOptions {
  userId: string;
  dailyEntryId?: string;
  symptomId?: string;
  bodyRegionId?: string;
  tags?: string[];
  notes?: string;
}

export function usePhotoUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  const uploadPhoto = useCallback(
    async (
      file: File,
      options: PhotoUploadOptions
    ): Promise<PhotoAttachment | null> => {
      try {
        setIsUploading(true);
        setProgress(0);
        setError(null);

        // Step 1: Validate file (10%)
        const validation = PhotoEncryption.validatePhoto(file);
        if (!validation.valid) {
          throw new Error(validation.error);
        }
        setProgress(10);

        // Step 2: Compress photo (30%)
        const compressed = await PhotoEncryption.compressPhoto(file);
        setProgress(30);

        // Step 3: Generate thumbnail (50%)
        const thumbnail = await PhotoEncryption.generateThumbnail(compressed);
        setProgress(50);

        // Step 4: Generate encryption key (60%)
        const encryptionKey = await PhotoEncryption.generateKey();
        setProgress(60);

        // Step 5: Encrypt photo (75%)
        const { data: encryptedData, iv: encryptionIV } =
          await PhotoEncryption.encryptPhoto(compressed, encryptionKey);
        setProgress(75);

        // Step 6: Encrypt thumbnail (85%)
        const { data: encryptedThumbnail } = await PhotoEncryption.encryptPhoto(
          thumbnail,
          encryptionKey
        );
        setProgress(85);

        // Step 7: Get image dimensions
        const dimensions = await getImageDimensions(compressed);
        setProgress(90);

        // Step 8: Save to database (100%)
        const photo = await photoRepository.create({
          userId: options.userId,
          dailyEntryId: options.dailyEntryId,
          symptomId: options.symptomId,
          bodyRegionId: options.bodyRegionId,
          fileName: `photo-${Date.now()}.jpg`,
          originalFileName: file.name,
          mimeType: file.type,
          sizeBytes: compressed.size,
          width: dimensions.width,
          height: dimensions.height,
          encryptedData,
          thumbnailData: encryptedThumbnail,
          encryptionIV,
          capturedAt: new Date(),
          tags: options.tags || [],
          notes: options.notes,
        });

        setProgress(100);
        return photo;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Upload failed");
        setError(error);
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    []
  );

  const uploadMultiple = useCallback(
    async (
      files: File[],
      options: PhotoUploadOptions
    ): Promise<PhotoAttachment[]> => {
      const results: PhotoAttachment[] = [];

      for (const file of files) {
        const result = await uploadPhoto(file, options);
        if (result) {
          results.push(result);
        }
      }

      return results;
    },
    [uploadPhoto]
  );

  return {
    uploadPhoto,
    uploadMultiple,
    isUploading,
    progress,
    error,
  };
}

/**
 * Get image dimensions from blob
 */
function getImageDimensions(blob: Blob): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => {
      reject(new Error("Failed to load image"));
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(blob);
  });
}
