/**
 * @jest-environment jsdom
 */

import { photoRepository } from "../photoRepository";
import { PhotoAttachment } from "@/lib/types/photo";

// Mock the database
jest.mock("@/lib/db", () => ({
  db: {
    photoAttachments: {
      where: jest.fn(),
      toArray: jest.fn(),
      get: jest.fn(),
      update: jest.fn(),
    },
  },
}));

// Import db after mocking
import { db } from "@/lib/db";

describe("photoRepository - Auto-Linking Features", () => {
  const mockUserId = "test-user-123";
  const mockDailyEntryId = "entry-456";
  const mockPhotoId = "photo-789";

  const mockPhoto: PhotoAttachment = {
    id: mockPhotoId,
    userId: mockUserId,
    dailyEntryId: mockDailyEntryId,
    encryptedData: new Blob(),
    thumbnailData: new Blob(),
    capturedAt: new Date(),
    fileName: "test.jpg",
    originalFileName: "test.jpg",
    mimeType: "image/jpeg",
    sizeBytes: 1024,
    width: 800,
    height: 600,
    encryptionIV: "test-iv",
    tags: [],
    annotations: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getByDailyEntry", () => {
    it("should retrieve photos linked to a specific daily entry", async () => {
      const mockPhotos = [mockPhoto];
      const mockWhere = jest.fn().mockReturnValue({
        and: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue(mockPhotos),
        }),
      });
      (db.photoAttachments.where as jest.Mock).mockReturnValue({
        equals: jest.fn().mockReturnValue(mockWhere()),
      });

      const result = await photoRepository.getByDailyEntry(
        mockUserId,
        mockDailyEntryId
      );

      expect(result).toEqual(mockPhotos);
      expect(db.photoAttachments.where).toHaveBeenCalledWith("userId");
    });

    it("should return empty array when no photos linked to entry", async () => {
      const mockWhere = jest.fn().mockReturnValue({
        and: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([]),
        }),
      });
      (db.photoAttachments.where as jest.Mock).mockReturnValue({
        equals: jest.fn().mockReturnValue(mockWhere()),
      });

      const result = await photoRepository.getByDailyEntry(
        mockUserId,
        "non-existent-entry"
      );

      expect(result).toEqual([]);
    });
  });

  describe("unlinkFromEntry", () => {
    it("should clear dailyEntryId when photo is linked to the specified entry", async () => {
      (db.photoAttachments.get as jest.Mock).mockResolvedValue(mockPhoto);
      (db.photoAttachments.update as jest.Mock).mockResolvedValue(1);

      await photoRepository.unlinkFromEntry(mockPhotoId, mockDailyEntryId);

      expect(db.photoAttachments.get).toHaveBeenCalledWith(mockPhotoId);
      expect(db.photoAttachments.update).toHaveBeenCalledWith(mockPhotoId, {
        dailyEntryId: undefined,
      });
    });

    it("should throw error if photo does not exist", async () => {
      (db.photoAttachments.get as jest.Mock).mockResolvedValue(undefined);

      await expect(
        photoRepository.unlinkFromEntry(mockPhotoId, mockDailyEntryId)
      ).rejects.toThrow(`Photo not found: ${mockPhotoId}`);

      expect(db.photoAttachments.update).not.toHaveBeenCalled();
    });

    it("should not update if photo is linked to a different entry", async () => {
      const photoLinkedToOtherEntry = {
        ...mockPhoto,
        dailyEntryId: "different-entry-id",
      };
      (db.photoAttachments.get as jest.Mock).mockResolvedValue(
        photoLinkedToOtherEntry
      );

      await photoRepository.unlinkFromEntry(mockPhotoId, mockDailyEntryId);

      expect(db.photoAttachments.get).toHaveBeenCalledWith(mockPhotoId);
      expect(db.photoAttachments.update).not.toHaveBeenCalled();
    });

    it("should not update if photo is not linked to any entry", async () => {
      const unlinkedPhoto = {
        ...mockPhoto,
        dailyEntryId: undefined,
      };
      (db.photoAttachments.get as jest.Mock).mockResolvedValue(unlinkedPhoto);

      await photoRepository.unlinkFromEntry(mockPhotoId, mockDailyEntryId);

      expect(db.photoAttachments.get).toHaveBeenCalledWith(mockPhotoId);
      expect(db.photoAttachments.update).not.toHaveBeenCalled();
    });
  });
});
