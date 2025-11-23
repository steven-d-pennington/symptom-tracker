/**
 * Photo Attachment Generator
 *
 * Attempts to generate placeholder photo blob data for testing.
 * Creates simple colored image blobs to simulate photo attachments.
 */

import { PhotoAttachmentRecord, FlareRecord } from "@/lib/db/schema";
import { generateId } from "@/lib/utils/idGenerator";
import { GenerationContext, GeneratorConfig } from "./base/types";

/**
 * Generate a simple colored blob as placeholder image data
 * Uses canvas to create a 400x400 colored square with text
 */
async function generatePlaceholderImageBlob(
  color: string,
  text: string,
  width: number = 400,
  height: number = 400
): Promise<{ blob: Blob; width: number; height: number }> {
  try {
    // Check if we're in a browser environment with canvas support
    if (typeof window === 'undefined' || !window.document) {
      throw new Error('Canvas not available in this environment');
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    // Fill background
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);

    // Add border
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, width, height);

    // Add text
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, width / 2, height / 2);

    // Add timestamp
    ctx.font = '14px Arial';
    ctx.fillText(new Date().toLocaleDateString(), width / 2, height / 2 + 40);

    // Convert to blob
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob'));
        }
      }, 'image/png');
    });

    return { blob, width, height };
  } catch (error) {
    console.warn('[Photo Generation] Canvas not available, using fallback');
    throw error;
  }
}

/**
 * Generate a thumbnail blob (smaller version)
 */
async function generateThumbnailBlob(
  color: string,
  text: string
): Promise<Blob> {
  const result = await generatePlaceholderImageBlob(color, text, 100, 100);
  return result.blob;
}

/**
 * Generate a simple encryption IV (initialization vector)
 */
function generateEncryptionIV(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Severity-based color selection
 */
function getColorForSeverity(severity: number): string {
  if (severity <= 3) return '#4ade80'; // Green (mild)
  if (severity <= 6) return '#fbbf24'; // Yellow (moderate)
  if (severity <= 8) return '#fb923c'; // Orange (severe)
  return '#ef4444'; // Red (critical)
}

/**
 * Generate photo attachments for flares
 */
export async function generatePhotoAttachmentsForFlares(
  flares: FlareRecord[],
  config: GeneratorConfig,
  context: GenerationContext
): Promise<PhotoAttachmentRecord[]> {
  if (!config.photoAttachments.generate) {
    return [];
  }

  const photos: PhotoAttachmentRecord[] = [];
  const now = new Date();

  console.log('[Photo Generation] Attempting to generate photo attachments...');

  try {
    for (const flare of flares) {
      // Random number of photos per flare
      const numPhotos = Math.floor(
        Math.random() * (config.photoAttachments.photosPerFlare.max - config.photoAttachments.photosPerFlare.min + 1) +
          config.photoAttachments.photosPerFlare.min
      );

      for (let i = 0; i < numPhotos; i++) {
        try {
          // Calculate photo timestamp (spread across flare duration)
          const flareDuration = flare.endDate
            ? flare.endDate - flare.startDate
            : Date.now() - flare.startDate;
          const photoOffset = Math.random() * flareDuration;
          const capturedAt = new Date(flare.startDate + photoOffset);

          // Skip future photos
          if (capturedAt.getTime() > Date.now()) continue;

          // Generate placeholder image
          const color = getColorForSeverity(flare.currentSeverity);
          const text = `Flare Photo ${i + 1}`;
          const { blob, width, height } = await generatePlaceholderImageBlob(color, text);
          const thumbnailBlob = await generateThumbnailBlob(color, `${i + 1}`);

          // Generate encryption data
          const encryptionIV = generateEncryptionIV();
          const thumbnailIV = generateEncryptionIV();

          photos.push({
            id: generateId(),
            userId: context.userId,
            bodyRegionId: flare.bodyRegionId,
            fileName: `flare_${flare.id}_photo_${i + 1}.png`,
            originalFileName: `IMG_${Date.now()}_${i}.png`,
            mimeType: 'image/png',
            sizeBytes: blob.size,
            width,
            height,
            encryptedData: blob,
            thumbnailData: thumbnailBlob,
            encryptionIV,
            thumbnailIV,
            capturedAt,
            tags: JSON.stringify(['flare', 'generated', `severity-${flare.currentSeverity}`]),
            notes: `Generated test photo for flare tracking`,
            metadata: JSON.stringify({
              flareId: flare.id,
              severity: flare.currentSeverity,
              bodyRegion: flare.bodyRegionId,
              generated: true,
            }),
            createdAt: now,
            updatedAt: now,
          });
        } catch (photoError) {
          console.warn(`[Photo Generation] Failed to generate photo ${i + 1} for flare ${flare.id}:`, photoError);
          // Continue with next photo
        }
      }
    }

    console.log(`[Photo Generation] Successfully generated ${photos.length} photo attachments for ${flares.length} flares`);
  } catch (error) {
    console.warn('[Photo Generation] Failed to generate photos:', error);
    console.log('[Photo Generation] Deferring photo generation - manual testing recommended');
    return [];
  }

  return photos;
}

/**
 * Fallback: Generate minimal photo records without blobs
 * (for environments where canvas is not available)
 */
export function generatePhotoAttachmentMetadataOnly(
  flares: FlareRecord[],
  config: GeneratorConfig,
  context: GenerationContext
): PhotoAttachmentRecord[] {
  if (!config.photoAttachments.generate) {
    return [];
  }

  console.log('[Photo Generation] Canvas not available, skipping photo generation');
  console.log('[Photo Generation] Photo attachment features will need manual testing');

  return [];
}

/**
 * Main entry point - attempts canvas generation, falls back to metadata-only
 */
export async function generatePhotoAttachments(
  flares: FlareRecord[],
  config: GeneratorConfig,
  context: GenerationContext
): Promise<PhotoAttachmentRecord[]> {
  try {
    return await generatePhotoAttachmentsForFlares(flares, config, context);
  } catch (error) {
    console.warn('[Photo Generation] Falling back to metadata-only approach');
    return generatePhotoAttachmentMetadataOnly(flares, config, context);
  }
}
