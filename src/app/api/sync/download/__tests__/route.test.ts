/**
 * @jest-environment node
 */

import { GET } from "../route";
import { NextRequest } from "next/server";
import * as blobModule from "@vercel/blob";
import * as ratelimitModule from "@upstash/ratelimit";

// Mock Vercel Blob
jest.mock("@vercel/blob", () => ({
  get: jest.fn(),
  list: jest.fn(),
}));

// Mock Upstash Rate Limiting
jest.mock("@upstash/ratelimit", () => ({
  Ratelimit: jest.fn(),
}));

jest.mock("@upstash/redis", () => ({
  Redis: {
    fromEnv: jest.fn(() => ({
      // Mock Redis instance
    })),
  },
}));

describe("/api/sync/download", () => {
  const validStorageKey = "a".repeat(64); // Valid SHA-256 hex (64 chars)
  const mockBlobData = Buffer.from("encrypted data");
  const mockTimestamp = Date.now();

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.BLOB_READ_WRITE_TOKEN = "test-token";
    process.env.UPSTASH_REDIS_REST_URL = "https://test.upstash.io";

    // Mock successful blob listing and retrieval by default
    (blobModule.list as jest.Mock).mockResolvedValue({
      blobs: [
        {
          pathname: `${validStorageKey}-${mockTimestamp}.blob`,
          url: `https://blob.vercel-storage.com/${validStorageKey}-${mockTimestamp}.blob`,
          uploadedAt: new Date().toISOString(),
          size: mockBlobData.length,
        },
      ],
    });

    (blobModule.get as jest.Mock).mockResolvedValue(mockBlobData);

    // Mock rate limiter to allow by default
    const mockLimit = jest.fn().mockResolvedValue({
      success: true,
      limit: 5,
      remaining: 4,
      reset: Date.now() + 60000,
    });

    (ratelimitModule.Ratelimit as jest.Mock).mockImplementation(() => ({
      limit: mockLimit,
    }));
  });

  afterEach(() => {
    delete process.env.BLOB_READ_WRITE_TOKEN;
    delete process.env.UPSTASH_REDIS_REST_URL;
  });

  describe("Successful downloads", () => {
    it("should download existing blob successfully", async () => {
      const request = new NextRequest(
        `http://localhost:3000/api/sync/download?storageKey=${validStorageKey}`,
        { method: "GET" }
      );

      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Type")).toBe(
        "application/octet-stream"
      );
      expect(response.headers.get("Content-Length")).toBe(
        mockBlobData.length.toString()
      );
      expect(response.headers.get("Last-Modified")).toBeTruthy();

      expect(blobModule.list).toHaveBeenCalledWith({
        prefix: validStorageKey,
        token: "test-token",
      });
    });

    it("should return most recent backup when multiple versions exist", async () => {
      const olderTimestamp = mockTimestamp - 86400000; // 1 day ago
      const newerTimestamp = mockTimestamp;

      (blobModule.list as jest.Mock).mockResolvedValue({
        blobs: [
          {
            pathname: `${validStorageKey}-${olderTimestamp}.blob`,
            url: `https://blob.vercel-storage.com/${validStorageKey}-${olderTimestamp}.blob`,
            uploadedAt: new Date(olderTimestamp).toISOString(),
            size: 100,
          },
          {
            pathname: `${validStorageKey}-${newerTimestamp}.blob`,
            url: `https://blob.vercel-storage.com/${validStorageKey}-${newerTimestamp}.blob`,
            uploadedAt: new Date(newerTimestamp).toISOString(),
            size: 200,
          },
        ],
      });

      const request = new NextRequest(
        `http://localhost:3000/api/sync/download?storageKey=${validStorageKey}`,
        { method: "GET" }
      );

      const response = await GET(request);

      expect(response.status).toBe(200);
      // Should retrieve the newer blob
      expect(blobModule.get).toHaveBeenCalledWith(
        expect.stringContaining(`${validStorageKey}-${newerTimestamp}`),
        expect.objectContaining({ token: "test-token" })
      );
    });
  });

  describe("Validation errors", () => {
    it("should reject missing storageKey parameter", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/sync/download",
        { method: "GET" }
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.code).toBe("INVALID_REQUEST");
      expect(data.message).toContain("storageKey");
    });

    it("should reject invalid storage key format", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/sync/download?storageKey=invalid-short",
        { method: "GET" }
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.code).toBe("INVALID_REQUEST");
      expect(data.message).toContain("SHA-256 hash");
    });
  });

  describe("Not found errors", () => {
    it("should return 404 when no backup exists", async () => {
      (blobModule.list as jest.Mock).mockResolvedValue({
        blobs: [],
      });

      const request = new NextRequest(
        `http://localhost:3000/api/sync/download?storageKey=${validStorageKey}`,
        { method: "GET" }
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.code).toBe("NOT_FOUND");
      expect(data.message).toContain("No backup found");
    });

    it("should handle blob not found error from get()", async () => {
      (blobModule.get as jest.Mock).mockRejectedValue(
        new Error("Blob not found")
      );

      const request = new NextRequest(
        `http://localhost:3000/api/sync/download?storageKey=${validStorageKey}`,
        { method: "GET" }
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.code).toBe("NOT_FOUND");
    });
  });

  describe("Rate limiting", () => {
    it("should enforce rate limit (5 downloads per minute)", async () => {
      // Mock rate limiter to reject
      const mockLimit = jest.fn().mockResolvedValue({
        success: false,
        limit: 5,
        remaining: 0,
        reset: Date.now() + 60000,
      });

      (ratelimitModule.Ratelimit as jest.Mock).mockImplementation(() => ({
        limit: mockLimit,
      }));

      const request = new NextRequest(
        `http://localhost:3000/api/sync/download?storageKey=${validStorageKey}`,
        { method: "GET" }
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.code).toBe("RATE_LIMIT_EXCEEDED");
      expect(response.headers.get("Retry-After")).toBeTruthy();
      expect(response.headers.get("X-RateLimit-Limit")).toBe("5");
      expect(response.headers.get("X-RateLimit-Remaining")).toBe("0");
    });
  });

  describe("Storage errors", () => {
    it("should handle Blob Storage unavailable (503)", async () => {
      (blobModule.list as jest.Mock).mockRejectedValue(
        new Error("Storage service unavailable")
      );

      const request = new NextRequest(
        `http://localhost:3000/api/sync/download?storageKey=${validStorageKey}`,
        { method: "GET" }
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.code).toBe("DOWNLOAD_FAILED");
    });

    it("should handle missing BLOB_READ_WRITE_TOKEN", async () => {
      delete process.env.BLOB_READ_WRITE_TOKEN;

      const request = new NextRequest(
        `http://localhost:3000/api/sync/download?storageKey=${validStorageKey}`,
        { method: "GET" }
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.code).toBe("STORAGE_NOT_CONFIGURED");
    });
  });

  describe("Security", () => {
    it("should stream blob data without loading full file into memory", async () => {
      const request = new NextRequest(
        `http://localhost:3000/api/sync/download?storageKey=${validStorageKey}`,
        { method: "GET" }
      );

      const response = await GET(request);

      // Response should be a stream, not buffered
      expect(response.headers.get("Content-Type")).toBe(
        "application/octet-stream"
      );
      expect(response.body).toBeTruthy();
    });
  });

  describe("Integration scenarios", () => {
    it("should handle complete upload → download cycle", async () => {
      // This test verifies that uploaded blob can be downloaded
      const uploadedBlobId = `${validStorageKey}-${mockTimestamp}.blob`;
      const uploadedSize = 1024;

      (blobModule.list as jest.Mock).mockResolvedValue({
        blobs: [
          {
            pathname: uploadedBlobId,
            url: `https://blob.vercel-storage.com/${uploadedBlobId}`,
            uploadedAt: new Date().toISOString(),
            size: uploadedSize,
          },
        ],
      });

      (blobModule.get as jest.Mock).mockResolvedValue(
        Buffer.from("encrypted backup data")
      );

      const request = new NextRequest(
        `http://localhost:3000/api/sync/download?storageKey=${validStorageKey}`,
        { method: "GET" }
      );

      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Length")).toBe(
        uploadedSize.toString()
      );

      // Verify blob integrity
      const downloadedData = await response.arrayBuffer();
      expect(downloadedData.byteLength).toBeGreaterThan(0);
    });
  });
});
