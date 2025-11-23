import { jest } from "@jest/globals";
import { ImportService } from "../importService";
import { PhotoExportData } from "../exportService";

describe("ImportService - Photo Import", () => {
  let importService: ImportService;
  const mockUserId = "test-user-123";

  beforeEach(() => {
    importService = new ImportService();
  });

  describe("base64ToBlob", () => {
    it("should convert valid base64 to blob", () => {
      // Test with a simple base64 string (1x1 transparent PNG)
      const base64 =
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

      const blob = (importService as any).base64ToBlob(base64, "image/png");

      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe("image/png");
      expect(blob.size).toBeGreaterThan(0);
    });

    it("should throw error for invalid base64", () => {
      expect(() => {
        (importService as any).base64ToBlob("not-valid-base64!", "image/jpeg");
      }).toThrow("Invalid base64 encoding");
    });
  });

  describe("validatePhotoData", () => {
    it("should validate correct photo data", () => {
      const validPhoto: PhotoExportData = {
        photo: {
          id: "photo-1",
          userId: mockUserId,
          fileName: "test.jpg",
          originalFileName: "test.jpg",
          capturedAt: new Date("2025-01-01"),
          encryptionIV: "iv-string",
          sizeBytes: 1024,
          width: 800,
          height: 600,
          mimeType: "image/jpeg",
          tags: [],
        },
        blob: btoa("fake-image-data"),
        isEncrypted: true,
      };

      const result = (importService as any).validatePhotoData(validPhoto);
      expect(result).toBe(true);
    });

    it("should reject photo data without required fields", () => {
      const invalidPhoto = {
        photo: {},
        blob: "some-data",
        isEncrypted: false,
      } as any;

      const result = (importService as any).validatePhotoData(invalidPhoto);
      expect(result).toBe(false);
    });

    it("should reject photo data with invalid base64", () => {
      const invalidPhoto: PhotoExportData = {
        photo: {
          id: "photo-1",
          userId: mockUserId,
          fileName: "test.jpg",
          originalFileName: "test.jpg",
          capturedAt: new Date("2025-01-01"),
          encryptionIV: "iv-string",
          sizeBytes: 1024,
          width: 800,
          height: 600,
          mimeType: "image/jpeg",
          tags: [],
        },
        blob: "invalid!@#$%",
        isEncrypted: true,
      };

      const result = (importService as any).validatePhotoData(invalidPhoto);
      expect(result).toBe(false);
    });

    it("should reject photo data with invalid date", () => {
      const invalidPhoto: PhotoExportData = {
        photo: {
          id: "photo-1",
          userId: mockUserId,
          fileName: "test.jpg",
          originalFileName: "test.jpg",
          capturedAt: "invalid-date" as any,
          encryptionIV: "iv-string",
          sizeBytes: 1024,
          width: 800,
          height: 600,
          mimeType: "image/jpeg",
          tags: [],
        },
        blob: btoa("fake-data"),
        isEncrypted: true,
      };

      const result = (importService as any).validatePhotoData(invalidPhoto);
      expect(result).toBe(false);
    });
  });

});
