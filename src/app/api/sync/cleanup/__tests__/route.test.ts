/**
 * @jest-environment node
 */

import { GET, POST } from "../route";
import { NextRequest } from "next/server";
import * as blobModule from "@vercel/blob";

// Mock Vercel Blob
jest.mock("@vercel/blob", () => ({
  list: jest.fn(),
  del: jest.fn(),
}));

describe("/api/sync/cleanup", () => {
  const validStorageKey1 = "a".repeat(64);
  const validStorageKey2 = "b".repeat(64);
  const mockCronSecret = "test-cron-secret-123";

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.BLOB_READ_WRITE_TOKEN = "test-token";
    process.env.CRON_SECRET = mockCronSecret;

    // Mock successful deletion by default
    (blobModule.del as jest.Mock).mockResolvedValue(undefined);
  });

  afterEach(() => {
    delete process.env.BLOB_READ_WRITE_TOKEN;
    delete process.env.CRON_SECRET;
  });

  describe("Authorization", () => {
    it("should require valid CRON_SECRET authorization", async () => {
      const request = new NextRequest("http://localhost:3000/api/sync/cleanup", {
        method: "GET",
      });

      const response = await GET(request);
      expect(response.status).toBe(401);
    });

    it("should accept valid Bearer token authorization", async () => {
      (blobModule.list as jest.Mock).mockResolvedValue({ blobs: [] });

      const request = new NextRequest("http://localhost:3000/api/sync/cleanup", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${mockCronSecret}`,
        },
      });

      const response = await GET(request);
      expect(response.status).toBe(200);
    });

    it("should reject invalid Bearer token", async () => {
      const request = new NextRequest("http://localhost:3000/api/sync/cleanup", {
        method: "GET",
        headers: {
          Authorization: "Bearer wrong-secret",
        },
      });

      const response = await GET(request);
      expect(response.status).toBe(401);
    });
  });

  describe("Cleanup logic", () => {
    it("should delete backups older than 90 days", async () => {
      const now = Date.now();
      const oldTimestamp = now - 91 * 24 * 60 * 60 * 1000; // 91 days ago
      const recentTimestamp = now - 30 * 24 * 60 * 60 * 1000; // 30 days ago

      (blobModule.list as jest.Mock).mockResolvedValue({
        blobs: [
          {
            pathname: `${validStorageKey1}-${recentTimestamp}.blob`,
            url: `https://blob.vercel-storage.com/${validStorageKey1}-${recentTimestamp}.blob`,
            uploadedAt: new Date(recentTimestamp).toISOString(),
            size: 1024,
          },
          {
            pathname: `${validStorageKey1}-${oldTimestamp}.blob`,
            url: `https://blob.vercel-storage.com/${validStorageKey1}-${oldTimestamp}.blob`,
            uploadedAt: new Date(oldTimestamp).toISOString(),
            size: 1024,
          },
        ],
      });

      const request = new NextRequest("http://localhost:3000/api/sync/cleanup", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${mockCronSecret}`,
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.deletedCount).toBe(1); // Only old blob deleted
      expect(data.preservedCount).toBe(1); // Recent blob preserved
      expect(blobModule.del).toHaveBeenCalledTimes(1);
    });

    it("should always preserve most recent backup per user", async () => {
      const now = Date.now();
      const veryOldTimestamp = now - 180 * 24 * 60 * 60 * 1000; // 180 days ago

      // User has ONLY one backup, which is older than 90 days
      (blobModule.list as jest.Mock).mockResolvedValue({
        blobs: [
          {
            pathname: `${validStorageKey1}-${veryOldTimestamp}.blob`,
            url: `https://blob.vercel-storage.com/${validStorageKey1}-${veryOldTimestamp}.blob`,
            uploadedAt: new Date(veryOldTimestamp).toISOString(),
            size: 1024,
          },
        ],
      });

      const request = new NextRequest("http://localhost:3000/api/sync/cleanup", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${mockCronSecret}`,
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.deletedCount).toBe(0); // Most recent preserved
      expect(data.preservedCount).toBe(1);
      expect(blobModule.del).not.toHaveBeenCalled();
    });

    it("should handle multiple users with different backup versions", async () => {
      const now = Date.now();
      const oldTimestamp = now - 91 * 24 * 60 * 60 * 1000;
      const recentTimestamp = now - 30 * 24 * 60 * 60 * 1000;

      (blobModule.list as jest.Mock).mockResolvedValue({
        blobs: [
          // User 1 - recent and old backups
          {
            pathname: `${validStorageKey1}-${recentTimestamp}.blob`,
            url: `https://blob.vercel-storage.com/${validStorageKey1}-${recentTimestamp}.blob`,
            uploadedAt: new Date(recentTimestamp).toISOString(),
            size: 1024,
          },
          {
            pathname: `${validStorageKey1}-${oldTimestamp}.blob`,
            url: `https://blob.vercel-storage.com/${validStorageKey1}-${oldTimestamp}.blob`,
            uploadedAt: new Date(oldTimestamp).toISOString(),
            size: 1024,
          },
          // User 2 - only recent backup
          {
            pathname: `${validStorageKey2}-${recentTimestamp}.blob`,
            url: `https://blob.vercel-storage.com/${validStorageKey2}-${recentTimestamp}.blob`,
            uploadedAt: new Date(recentTimestamp).toISOString(),
            size: 2048,
          },
        ],
      });

      const request = new NextRequest("http://localhost:3000/api/sync/cleanup", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${mockCronSecret}`,
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.deletedCount).toBe(1); // User 1's old backup
      expect(data.preservedCount).toBe(2); // User 1 recent + User 2 recent
      expect(data.totalScanned).toBe(3);
    });

    it("should preserve backups newer than 90 days", async () => {
      const now = Date.now();
      const timestamp60Days = now - 60 * 24 * 60 * 60 * 1000;
      const timestamp30Days = now - 30 * 24 * 60 * 60 * 1000;

      (blobModule.list as jest.Mock).mockResolvedValue({
        blobs: [
          {
            pathname: `${validStorageKey1}-${timestamp30Days}.blob`,
            url: `https://blob.vercel-storage.com/${validStorageKey1}-${timestamp30Days}.blob`,
            uploadedAt: new Date(timestamp30Days).toISOString(),
            size: 1024,
          },
          {
            pathname: `${validStorageKey1}-${timestamp60Days}.blob`,
            url: `https://blob.vercel-storage.com/${validStorageKey1}-${timestamp60Days}.blob`,
            uploadedAt: new Date(timestamp60Days).toISOString(),
            size: 1024,
          },
        ],
      });

      const request = new NextRequest("http://localhost:3000/api/sync/cleanup", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${mockCronSecret}`,
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.deletedCount).toBe(0); // Both within 90 days
      expect(data.preservedCount).toBe(2);
      expect(blobModule.del).not.toHaveBeenCalled();
    });
  });

  describe("Error handling", () => {
    it("should handle deletion failures gracefully", async () => {
      const now = Date.now();
      const oldTimestamp = now - 91 * 24 * 60 * 60 * 1000;

      (blobModule.list as jest.Mock).mockResolvedValue({
        blobs: [
          {
            pathname: `${validStorageKey1}-${Date.now()}.blob`,
            url: `https://blob.vercel-storage.com/${validStorageKey1}-${Date.now()}.blob`,
            uploadedAt: new Date().toISOString(),
            size: 1024,
          },
          {
            pathname: `${validStorageKey1}-${oldTimestamp}.blob`,
            url: `https://blob.vercel-storage.com/${validStorageKey1}-${oldTimestamp}.blob`,
            uploadedAt: new Date(oldTimestamp).toISOString(),
            size: 1024,
          },
        ],
      });

      (blobModule.del as jest.Mock).mockRejectedValue(
        new Error("Deletion failed")
      );

      const request = new NextRequest("http://localhost:3000/api/sync/cleanup", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${mockCronSecret}`,
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.deletedCount).toBe(0);
      expect(data.errors).toBeDefined();
      expect(data.errors.length).toBeGreaterThan(0);
    });

    it("should handle missing BLOB_READ_WRITE_TOKEN", async () => {
      delete process.env.BLOB_READ_WRITE_TOKEN;

      const request = new NextRequest("http://localhost:3000/api/sync/cleanup", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${mockCronSecret}`,
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.error).toBe("Storage not configured");
    });

    it("should handle Blob Storage list failures", async () => {
      (blobModule.list as jest.Mock).mockRejectedValue(
        new Error("Storage unavailable")
      );

      const request = new NextRequest("http://localhost:3000/api/sync/cleanup", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${mockCronSecret}`,
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
    });
  });

  describe("Response format", () => {
    it("should return structured cleanup result", async () => {
      (blobModule.list as jest.Mock).mockResolvedValue({ blobs: [] });

      const request = new NextRequest("http://localhost:3000/api/sync/cleanup", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${mockCronSecret}`,
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(data).toHaveProperty("success");
      expect(data).toHaveProperty("deletedCount");
      expect(data).toHaveProperty("preservedCount");
      expect(data).toHaveProperty("totalScanned");
      expect(data).toHaveProperty("duration");
      expect(data).toHaveProperty("timestamp");
    });
  });

  describe("Manual trigger (POST)", () => {
    it("should support manual cleanup via POST", async () => {
      (blobModule.list as jest.Mock).mockResolvedValue({ blobs: [] });

      const request = new NextRequest("http://localhost:3000/api/sync/cleanup", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${mockCronSecret}`,
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });
});
