/**
 * Unit tests for Cloud Sync Service
 * Tests cryptographic functions, data export, upload, and backup orchestration
 */

import {
  deriveEncryptionKey,
  deriveStorageKey,
  exportAllData,
  encryptData,
  uploadBackup,
  validatePassphrase,
  mapUploadError,
  saveSyncMetadata,
  getSyncMetadata,
  createBackup,
} from "../cloudSyncService";

// Mock fetch globally
global.fetch = jest.fn();

// Mock crypto.subtle (Web Crypto API)
const mockCrypto = {
  subtle: {
    importKey: jest.fn(),
    deriveKey: jest.fn(),
    digest: jest.fn(),
    encrypt: jest.fn(),
  },
  getRandomValues: jest.fn((arr: Uint8Array) => {
    // Fill with predictable values for testing
    for (let i = 0; i < arr.length; i++) {
      arr[i] = i % 256;
    }
    return arr;
  }),
};

// @ts-ignore - Replace global crypto for testing
global.crypto = mockCrypto as any;

// Mock db module
jest.mock("../../db/client", () => ({
  db: {
    tables: [
      { name: "users" },
      { name: "symptoms" },
      { name: "medications" },
    ],
    table: (tableName: string) => ({
      toArray: async () => {
        if (tableName === "users") return [{ id: "user1", name: "Test User" }];
        if (tableName === "symptoms") return [{ id: "s1", name: "Headache" }];
        if (tableName === "medications") return [{ id: "m1", name: "Aspirin" }];
        return [];
      },
    }),
    verno: 29,
    syncMetadata: {
      put: jest.fn(),
      get: jest.fn(),
    },
  },
}));

describe("Cloud Sync Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("deriveEncryptionKey", () => {
    it("should derive encryption key from passphrase and salt", async () => {
      const mockKey = { type: "secret" } as CryptoKey;

      mockCrypto.subtle.importKey.mockResolvedValue({ type: "raw" } as CryptoKey);
      mockCrypto.subtle.deriveKey.mockResolvedValue(mockKey);

      const salt = new Uint8Array(16);
      const key = await deriveEncryptionKey("test-passphrase-123", salt);

      expect(key).toBe(mockKey);
      expect(mockCrypto.subtle.importKey).toHaveBeenCalledWith(
        "raw",
        expect.any(Uint8Array),
        "PBKDF2",
        false,
        ["deriveBits", "deriveKey"]
      );
      expect(mockCrypto.subtle.deriveKey).toHaveBeenCalledWith(
        {
          name: "PBKDF2",
          salt,
          iterations: 100000, // OWASP recommended
          hash: "SHA-256",
        },
        expect.any(Object),
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"]
      );
    });

    it("should throw error if passphrase is empty", async () => {
      await expect(deriveEncryptionKey("", new Uint8Array(16))).rejects.toThrow(
        "Passphrase cannot be empty"
      );
    });

    it("should produce different keys for different salts", async () => {
      const passphrase = "test-passphrase";
      const salt1 = new Uint8Array(16).fill(1);
      const salt2 = new Uint8Array(16).fill(2);

      mockCrypto.subtle.importKey.mockResolvedValue({ type: "raw" } as CryptoKey);
      mockCrypto.subtle.deriveKey
        .mockResolvedValueOnce({ type: "secret", id: "key1" } as any)
        .mockResolvedValueOnce({ type: "secret", id: "key2" } as any);

      const key1 = await deriveEncryptionKey(passphrase, salt1);
      const key2 = await deriveEncryptionKey(passphrase, salt2);

      expect(key1).not.toBe(key2);
      expect(mockCrypto.subtle.deriveKey).toHaveBeenCalledTimes(2);
    });

    it("should be deterministic (same passphrase + salt = same key)", async () => {
      const passphrase = "test-passphrase";
      const salt = new Uint8Array(16).fill(1);
      const mockKey = { type: "secret", id: "consistent-key" } as any;

      mockCrypto.subtle.importKey.mockResolvedValue({ type: "raw" } as CryptoKey);
      mockCrypto.subtle.deriveKey.mockResolvedValue(mockKey);

      const key1 = await deriveEncryptionKey(passphrase, salt);
      const key2 = await deriveEncryptionKey(passphrase, salt);

      expect(key1).toEqual(key2);
    });
  });

  describe("deriveStorageKey", () => {
    it("should derive storage key from passphrase using SHA-256", async () => {
      // Mock SHA-256 hash output (32 bytes = 64 hex characters)
      const mockHash = new Uint8Array(32).fill(0xab); // All bytes = 0xab
      mockCrypto.subtle.digest.mockResolvedValue(mockHash.buffer);

      const storageKey = await deriveStorageKey("test-passphrase");

      expect(mockCrypto.subtle.digest).toHaveBeenCalledWith(
        "SHA-256",
        expect.any(Uint8Array)
      );
      expect(storageKey).toBe("ab".repeat(32)); // 64 hex characters
      expect(storageKey).toHaveLength(64);
    });

    it("should throw error if passphrase is empty", async () => {
      await expect(deriveStorageKey("")).rejects.toThrow(
        "Passphrase cannot be empty"
      );
    });

    it("should be deterministic (same passphrase = same storage key)", async () => {
      const mockHash = new Uint8Array(32).fill(0xcd);
      mockCrypto.subtle.digest.mockResolvedValue(mockHash.buffer);

      const key1 = await deriveStorageKey("test-passphrase");
      const key2 = await deriveStorageKey("test-passphrase");

      expect(key1).toBe(key2);
      expect(key1).toBe("cd".repeat(32));
    });

    it("should produce different keys for different passphrases", async () => {
      mockCrypto.subtle.digest
        .mockResolvedValueOnce(new Uint8Array(32).fill(0x11).buffer)
        .mockResolvedValueOnce(new Uint8Array(32).fill(0x22).buffer);

      const key1 = await deriveStorageKey("passphrase1");
      const key2 = await deriveStorageKey("passphrase2");

      expect(key1).not.toBe(key2);
      expect(key1).toBe("11".repeat(32));
      expect(key2).toBe("22".repeat(32));
    });
  });

  describe("exportAllData", () => {
    it("should export all IndexedDB tables to JSON", async () => {
      const jsonData = await exportAllData();
      const backup = JSON.parse(jsonData);

      expect(backup.version).toBe(1);
      expect(backup.timestamp).toBeGreaterThan(0);
      expect(backup.schemaVersion).toBe(29);
      expect(backup.data).toHaveProperty("users");
      expect(backup.data).toHaveProperty("symptoms");
      expect(backup.data).toHaveProperty("medications");
      expect(backup.data.users).toHaveLength(1);
      expect(backup.data.symptoms).toHaveLength(1);
    });

    it("should produce valid JSON", async () => {
      const jsonData = await exportAllData();
      expect(() => JSON.parse(jsonData)).not.toThrow();
    });
  });

  describe("encryptData", () => {
    it("should encrypt JSON data with passphrase", async () => {
      const mockCiphertext = new Uint8Array([1, 2, 3, 4, 5]);
      const mockKey = { type: "secret" } as CryptoKey;

      mockCrypto.subtle.importKey.mockResolvedValue({ type: "raw" } as CryptoKey);
      mockCrypto.subtle.deriveKey.mockResolvedValue(mockKey);
      mockCrypto.subtle.encrypt.mockResolvedValue(mockCiphertext.buffer);

      const encrypted = await encryptData('{"test": "data"}', "passphrase");

      // Result should be: salt (16) + IV (12) + ciphertext (5) = 33 bytes
      expect(encrypted.byteLength).toBe(16 + 12 + 5);
      expect(mockCrypto.getRandomValues).toHaveBeenCalledTimes(2); // salt + IV
      expect(mockCrypto.subtle.encrypt).toHaveBeenCalledWith(
        {
          name: "AES-GCM",
          iv: expect.any(Uint8Array),
        },
        mockKey,
        expect.any(Uint8Array)
      );
    });

    it("should throw error if passphrase is empty", async () => {
      await expect(encryptData('{"data": 1}', "")).rejects.toThrow(
        "Passphrase cannot be empty"
      );
    });

    it("should throw error if data is empty", async () => {
      await expect(encryptData("", "passphrase")).rejects.toThrow(
        "Cannot encrypt empty data"
      );
    });

    it("should prepend salt and IV to ciphertext", async () => {
      const mockCiphertext = new Uint8Array([100, 101, 102]);
      const mockKey = { type: "secret" } as CryptoKey;

      mockCrypto.subtle.importKey.mockResolvedValue({ type: "raw" } as CryptoKey);
      mockCrypto.subtle.deriveKey.mockResolvedValue(mockKey);
      mockCrypto.subtle.encrypt.mockResolvedValue(mockCiphertext.buffer);

      const encrypted = await encryptData('{"test": 1}', "pass");
      const bytes = new Uint8Array(encrypted);

      // First 16 bytes should be salt (0, 1, 2, ... 15 from mock)
      expect(bytes.slice(0, 16)).toEqual(new Uint8Array([...Array(16).keys()]));

      // Next 12 bytes should be IV (0, 1, 2, ... 11 from second mock call)
      expect(bytes.slice(16, 28)).toEqual(new Uint8Array([...Array(12).keys()]));

      // Remaining bytes should be ciphertext
      expect(bytes.slice(28)).toEqual(mockCiphertext);
    });
  });

  describe("uploadBackup", () => {
    const mockEncryptedBlob = new Uint8Array([1, 2, 3, 4, 5]).buffer;
    const mockStorageKey = "a".repeat(64); // 64-char hex string

    it("should upload encrypted blob successfully", async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          uploadedAt: "2025-11-13T00:00:00Z",
          blobSize: 5,
          storageKeyHash: "aaaaaaaa",
        }),
      });

      const metadata = await uploadBackup(mockEncryptedBlob, mockStorageKey);

      expect(metadata).toEqual({
        uploadedAt: "2025-11-13T00:00:00Z",
        blobSize: 5,
        storageKeyHash: "aaaaaaaa",
      });
      expect(fetch).toHaveBeenCalledWith(
        "/api/sync/upload",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        })
      );
    });

    it("should handle 413 (payload too large) error", async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 413,
        json: async () => ({ message: "Payload too large" }),
      });

      await expect(uploadBackup(mockEncryptedBlob, mockStorageKey)).rejects.toThrow(
        "QUOTA_EXCEEDED"
      );
    });

    it("should handle 429 (rate limit) error with Retry-After", async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 429,
        headers: {
          get: (header: string) => (header === "Retry-After" ? "1800" : null),
        },
        json: async () => ({ message: "Rate limit exceeded" }),
      });

      await expect(uploadBackup(mockEncryptedBlob, mockStorageKey)).rejects.toThrow(
        "RATE_LIMIT:1800"
      );
    });

    it("should handle 503 (service unavailable) error", async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 503,
        json: async () => ({ message: "Service unavailable" }),
      });

      await expect(uploadBackup(mockEncryptedBlob, mockStorageKey)).rejects.toThrow(
        "SERVICE_UNAVAILABLE"
      );
    });

    it("should handle 400 (invalid request) error", async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ message: "Invalid request" }),
      });

      await expect(uploadBackup(mockEncryptedBlob, mockStorageKey)).rejects.toThrow(
        "INVALID_REQUEST"
      );
    });

    it("should handle network errors", async () => {
      (fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

      await expect(uploadBackup(mockEncryptedBlob, mockStorageKey)).rejects.toThrow(
        "NETWORK_ERROR"
      );
    });

    it("should throw error if blob is empty", async () => {
      const emptyBlob = new ArrayBuffer(0);

      await expect(uploadBackup(emptyBlob, mockStorageKey)).rejects.toThrow(
        "Cannot upload empty blob"
      );
    });

    it("should throw error if storage key is invalid", async () => {
      await expect(uploadBackup(mockEncryptedBlob, "short-key")).rejects.toThrow(
        "Invalid storage key"
      );
    });
  });

  describe("validatePassphrase", () => {
    it("should accept valid passphrase (12+ characters, matching)", () => {
      const result = validatePassphrase("test-passphrase", "test-passphrase");
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should reject passphrase < 12 characters", () => {
      const result = validatePassphrase("short", "short");
      expect(result.valid).toBe(false);
      expect(result.error).toBe("Passphrase must be at least 12 characters");
    });

    it("should reject mismatched passphrases", () => {
      const result = validatePassphrase("test-passphrase", "different-passphrase");
      expect(result.valid).toBe(false);
      expect(result.error).toBe("Passphrases do not match");
    });

    it("should reject empty passphrase", () => {
      const result = validatePassphrase("", "");
      expect(result.valid).toBe(false);
      expect(result.error).toBe("Passphrase must be at least 12 characters");
    });

    it("should accept exactly 12 characters", () => {
      const result = validatePassphrase("123456789012", "123456789012");
      expect(result.valid).toBe(true);
    });
  });

  describe("mapUploadError", () => {
    it("should map QUOTA_EXCEEDED error", () => {
      const message = mapUploadError(new Error("QUOTA_EXCEEDED"));
      expect(message).toContain("exceeds 1GB storage limit");
    });

    it("should map RATE_LIMIT error with wait time", () => {
      const message = mapUploadError(new Error("RATE_LIMIT:3600"));
      expect(message).toContain("60 minutes");
    });

    it("should map SERVICE_UNAVAILABLE error", () => {
      const message = mapUploadError(new Error("SERVICE_UNAVAILABLE"));
      expect(message).toContain("temporarily unavailable");
    });

    it("should map NETWORK_ERROR error", () => {
      const message = mapUploadError(new Error("NETWORK_ERROR: Connection failed"));
      expect(message).toContain("Network error");
    });

    it("should map INVALID_REQUEST error", () => {
      const message = mapUploadError(new Error("INVALID_REQUEST"));
      expect(message).toContain("Invalid backup format");
    });

    it("should provide generic message for unknown errors", () => {
      const message = mapUploadError(new Error("UNKNOWN_ERROR"));
      expect(message).toContain("unexpected error");
    });
  });

  describe("saveSyncMetadata and getSyncMetadata", () => {
    it("should save sync metadata to IndexedDB", async () => {
      const metadata = {
        id: "primary" as const,
        lastSyncTimestamp: 1699999999999,
        lastSyncSuccess: true,
        blobSizeBytes: 1024,
        storageKeyHash: "abcd1234",
      };

      await saveSyncMetadata(metadata);

      const { db } = require("../../db/client");
      expect(db.syncMetadata.put).toHaveBeenCalledWith(metadata);
    });

    it("should get sync metadata from IndexedDB", async () => {
      const mockMetadata = {
        id: "primary" as const,
        lastSyncTimestamp: 1699999999999,
        lastSyncSuccess: true,
        blobSizeBytes: 1024,
        storageKeyHash: "abcd1234",
      };

      const { db } = require("../../db/client");
      db.syncMetadata.get.mockResolvedValue(mockMetadata);

      const result = await getSyncMetadata();

      expect(result).toEqual(mockMetadata);
      expect(db.syncMetadata.get).toHaveBeenCalledWith("primary");
    });

    it("should return null if metadata not found", async () => {
      const { db } = require("../../db/client");
      db.syncMetadata.get.mockResolvedValue(undefined);

      const result = await getSyncMetadata();

      expect(result).toBeNull();
    });
  });

  describe("createBackup (integration)", () => {
    it("should orchestrate full backup flow with progress tracking", async () => {
      const mockKey = { type: "secret" } as CryptoKey;
      const mockCiphertext = new Uint8Array([1, 2, 3]);

      mockCrypto.subtle.importKey.mockResolvedValue({ type: "raw" } as CryptoKey);
      mockCrypto.subtle.deriveKey.mockResolvedValue(mockKey);
      mockCrypto.subtle.encrypt.mockResolvedValue(mockCiphertext.buffer);
      mockCrypto.subtle.digest.mockResolvedValue(new Uint8Array(32).fill(0xaa).buffer);

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          uploadedAt: "2025-11-13T00:00:00Z",
          blobSize: 31, // 16 + 12 + 3
          storageKeyHash: "aaaaaaaa",
        }),
      });

      const progressUpdates: any[] = [];
      const onProgress = (update: any) => progressUpdates.push(update);

      await createBackup("test-passphrase-123", onProgress);

      // Verify progress updates
      expect(progressUpdates).toHaveLength(5);
      expect(progressUpdates[0]).toEqual({
        stage: "export",
        percent: 0,
        message: expect.any(String),
      });
      expect(progressUpdates[1]).toEqual({
        stage: "export",
        percent: 30,
        message: expect.any(String),
      });
      expect(progressUpdates[2]).toEqual({
        stage: "encrypt",
        percent: 30,
        message: expect.any(String),
      });
      expect(progressUpdates[3]).toEqual({
        stage: "encrypt",
        percent: 60,
        message: expect.any(String),
      });
      expect(progressUpdates[4]).toEqual({
        stage: "upload",
        percent: 60,
        message: expect.any(String),
      });

      // Verify sync metadata saved
      const { db } = require("../../db/client");
      expect(db.syncMetadata.put).toHaveBeenCalledWith({
        id: "primary",
        lastSyncTimestamp: expect.any(Number),
        lastSyncSuccess: true,
        blobSizeBytes: 31,
        storageKeyHash: "aaaaaaaa",
      });
    });

    it("should save failed metadata on error", async () => {
      (fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

      const mockKey = { type: "secret" } as CryptoKey;
      const mockCiphertext = new Uint8Array([1, 2, 3]);

      mockCrypto.subtle.importKey.mockResolvedValue({ type: "raw" } as CryptoKey);
      mockCrypto.subtle.deriveKey.mockResolvedValue(mockKey);
      mockCrypto.subtle.encrypt.mockResolvedValue(mockCiphertext.buffer);
      mockCrypto.subtle.digest.mockResolvedValue(new Uint8Array(32).fill(0xaa).buffer);

      await expect(createBackup("test-passphrase-123")).rejects.toThrow();

      const { db } = require("../../db/client");
      expect(db.syncMetadata.put).toHaveBeenCalledWith({
        id: "primary",
        lastSyncTimestamp: expect.any(Number),
        lastSyncSuccess: false,
        blobSizeBytes: 0,
        storageKeyHash: "",
        errorMessage: expect.stringContaining("Network error"),
      });
    });
  });
});
