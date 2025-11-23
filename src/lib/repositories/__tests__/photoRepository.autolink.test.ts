/**
 * @jest-environment jsdom
 */

import { PhotoAttachment } from "@/lib/types/photo";

// Mock the database BEFORE any imports that use it
const mockWhere = jest.fn();
const mockToArray = jest.fn();
const mockGet = jest.fn();
const mockUpdate = jest.fn();

jest.mock("@/lib/db/client", () => ({
  db: {
    photoAttachments: {
      where: mockWhere,
      toArray: mockToArray,
      get: mockGet,
      update: mockUpdate,
    },
  },
}));

// Now import after the mock is set up
import { photoRepository } from "../photoRepository";
import { db } from "@/lib/db/client";

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
      const localMockWhere = jest.fn().mockReturnValue({
        and: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue(mockPhotos),
        }),
      });
      mockWhere.mockReturnValue({
        equals: jest.fn().mockReturnValue(localMockWhere()),
      });

      const result = await photoRepository.getByDailyEntry(
        mockUserId,
        mockDailyEntryId
      );

      expect(result).toEqual(mockPhotos);
      expect(mockWhere).toHaveBeenCalledWith("userId");
    });

    it("should return empty array when no photos linked to entry", async () => {
      const localMockWhere = jest.fn().mockReturnValue({
        and: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([]),
        }),
      });
      mockWhere.mockReturnValue({
        equals: jest.fn().mockReturnValue(localMockWhere()),
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
      mockGet.mockResolvedValue(mockPhoto);
      mockUpdate.mockResolvedValue(1);

      await photoRepository.unlinkFromEntry(mockPhotoId, mockDailyEntryId);

      expect(mockGet).toHaveBeenCalledWith(mockPhotoId);
      expect(mockUpdate).toHaveBeenCalledWith(mockPhotoId, {
        dailyEntryId: undefined,
      });
    });

    it("should throw error if photo does not exist", async () => {
      mockGet.mockResolvedValue(undefined);

      await expect(
        photoRepository.unlinkFromEntry(mockPhotoId, mockDailyEntryId)
      ).rejects.toThrow(`Photo not found: ${mockPhotoId}`);

      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it("should not update if photo is linked to a different entry", async () => {
      const photoLinkedToOtherEntry = {
        ...mockPhoto,
        dailyEntryId: "different-entry-id",
      };
      mockGet.mockResolvedValue(photoLinkedToOtherEntry);

      await photoRepository.unlinkFromEntry(mockPhotoId, mockDailyEntryId);

      expect(mockGet).toHaveBeenCalledWith(mockPhotoId);
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it("should not update if photo is not linked to any entry", async () => {
      const unlinkedPhoto = {
        ...mockPhoto,
        dailyEntryId: undefined,
      };
      mockGet.mockResolvedValue(unlinkedPhoto);

      await photoRepository.unlinkFromEntry(mockPhotoId, mockDailyEntryId);

      expect(mockGet).toHaveBeenCalledWith(mockPhotoId);
      expect(mockUpdate).not.toHaveBeenCalled();
    });
  });
});
