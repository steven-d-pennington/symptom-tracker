/**
 * Photo Encryption Utilities
 * AES-256-GCM encryption for medical photos
 */

export class PhotoEncryption {
  private static ALGORITHM = "AES-GCM";
  private static KEY_LENGTH = 256;
  private static IV_LENGTH = 12; // 96 bits recommended for GCM

  /**
   * Generate a new encryption key for photos
   */
  static async generateKey(): Promise<CryptoKey> {
    return await window.crypto.subtle.generateKey(
      {
        name: this.ALGORITHM,
        length: this.KEY_LENGTH,
      },
      true, // extractable
      ["encrypt", "decrypt"]
    );
  }

  /**
   * Export key to base64 string for storage
   */
  static async exportKey(key: CryptoKey): Promise<string> {
    const exported = await window.crypto.subtle.exportKey("raw", key);
    return this.arrayBufferToBase64(exported);
  }

  /**
   * Import key from base64 string
   */
  static async importKey(keyData: string): Promise<CryptoKey> {
    const buffer = this.base64ToArrayBuffer(keyData);
    return await window.crypto.subtle.importKey(
      "raw",
      buffer,
      {
        name: this.ALGORITHM,
        length: this.KEY_LENGTH,
      },
      true,
      ["encrypt", "decrypt"]
    );
  }

  /**
   * Encrypt a photo blob
   */
  static async encryptPhoto(
    photoBlob: Blob,
    key: CryptoKey
  ): Promise<{ data: Blob; iv: string }> {
    // Generate random IV
    const iv = window.crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));

    // Convert blob to ArrayBuffer
    const arrayBuffer = await photoBlob.arrayBuffer();

    // Encrypt
    const encrypted = await window.crypto.subtle.encrypt(
      {
        name: this.ALGORITHM,
        iv: iv,
      },
      key,
      arrayBuffer
    );

    return {
      data: new Blob([encrypted], { type: "application/octet-stream" }),
      iv: this.arrayBufferToBase64(iv.buffer),
    };
  }

  /**
   * Decrypt a photo blob
   */
  static async decryptPhoto(
    encryptedBlob: Blob,
    key: CryptoKey,
    ivBase64: string
  ): Promise<Blob> {
    const iv = this.base64ToArrayBuffer(ivBase64);
    const arrayBuffer = await encryptedBlob.arrayBuffer();

    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: this.ALGORITHM,
        iv: new Uint8Array(iv),
      },
      key,
      arrayBuffer
    );

    return new Blob([decrypted], { type: "image/jpeg" });
  }

  /**
   * Generate a thumbnail from photo blob
   */
  static async generateThumbnail(
    photoBlob: Blob,
    maxSize: number = 150
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      img.onload = () => {
        // Calculate thumbnail dimensions
        let width = img.width;
        let height = img.height;
        const aspectRatio = width / height;

        if (width > height) {
          width = maxSize;
          height = maxSize / aspectRatio;
        } else {
          height = maxSize;
          width = maxSize * aspectRatio;
        }

        // Set canvas size
        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Could not create thumbnail"));
            }
          },
          "image/jpeg",
          0.7 // Quality
        );
      };

      img.onerror = () => reject(new Error("Could not load image"));
      img.src = URL.createObjectURL(photoBlob);
    });
  }

  /**
   * Compress photo to reduce file size
   */
  static async compressPhoto(
    photoBlob: Blob,
    maxWidth: number = 1920,
    quality: number = 0.8
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Scale down if needed
        if (width > maxWidth) {
          const aspectRatio = width / height;
          width = maxWidth;
          height = maxWidth / aspectRatio;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Could not compress photo"));
            }
          },
          "image/jpeg",
          quality
        );
      };

      img.onerror = () => reject(new Error("Could not load image"));
      img.src = URL.createObjectURL(photoBlob);
    });
  }

  /**
   * Strip EXIF data for privacy (keeps orientation)
   */
  static async stripExifData(
    photoBlob: Blob,
    _keepOrientation: boolean = true
  ): Promise<{ blob: Blob; orientation: number }> {
    // For now, we'll use canvas to strip EXIF
    // In production, consider using exif-js or piexifjs library
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;

        // Apply orientation if needed
        // Note: This is simplified - full EXIF handling would require a library
        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({
                blob,
                orientation: 1, // Default orientation
              });
            } else {
              reject(new Error("Could not strip EXIF data"));
            }
          },
          "image/jpeg",
          0.95
        );
      };

      img.onerror = () => reject(new Error("Could not load image"));
      img.src = URL.createObjectURL(photoBlob);
    });
  }

  /**
   * Utility: ArrayBuffer to Base64
   */
  private static arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Utility: Base64 to ArrayBuffer
   */
  private static base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Get estimated file size after encryption
   */
  static getEncryptedSize(originalSize: number): number {
    // GCM adds 16 bytes for auth tag
    return originalSize + 16;
  }

  /**
   * Validate photo file
   */
  static validatePhoto(file: File): {
    valid: boolean;
    error?: string;
  } {
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/heic"];

    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: "Invalid file type. Only JPEG, PNG, and HEIC images are allowed.",
      };
    }

    if (file.size > MAX_SIZE) {
      return {
        valid: false,
        error: "File is too large. Maximum size is 10MB.",
      };
    }

    return { valid: true };
  }
}
