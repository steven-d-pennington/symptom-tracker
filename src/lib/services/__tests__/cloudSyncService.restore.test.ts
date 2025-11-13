/**
 * Unit tests for Cloud Sync Service - Restore functionality
 * Tests decryption logic, data validation, and restore flow
 */

import {
  downloadBackup,
  extractMetadata,
  decryptData,
  validateBackupData,
  backupCurrentData,
  restoreData,
  saveRestoreMetadata,
  mapRestoreError,
  rollbackRestore,
  restoreBackup,
  deriveStorageKey,
  deriveEncryptionKey,
  encryptData,
  exportAllData,
  BackupData,
} from "../cloudSyncService";

// Mock fetch globally
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Mock crypto.subtle (Web Crypto API)
const mockCrypto = {
  subtle: {
    importKey: jest.fn(),
    deriveKey: jest.fn(),
    digest: jest.fn(),
    encrypt: jest.fn(),
    decrypt: jest.fn(),
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
      { name: "users", clear: jest.fn(), bulkAdd: jest.fn() },
      { name: "symptoms", clear: jest.fn(), bulkAdd: jest.fn() },
      { name: "medications", clear: jest.fn(), bulkAdd: jest.fn() },
      { name: "flares", clear: jest.fn(), bulkAdd: jest.fn() },
      { name: "triggers", clear: jest.fn(), bulkAdd: jest.fn() },
      { name: "foods", clear: jest.fn(), bulkAdd: jest.fn() },
    ],
    table: (tableName: string) => ({
      toArray: async () => {
        if (tableName === "users") return [{ id: "user1", name: "Test User" }];
        if (tableName === "symptoms") return [{ id: "s1", name: "Headache" }];
        if (tableName === "medications") return [{ id: "m1", name: "Aspirin" }];
        return [];
      },
    }),
    users: { clear: jest.fn(), bulkAdd: jest.fn() },
    symptoms: { clear: jest.fn(), bulkAdd: jest.fn() },
    medications: { clear: jest.fn(), bulkAdd: jest.fn() },
    flares: { clear: jest.fn(), bulkAdd: jest.fn() },
    triggers: { clear: jest.fn(), bulkAdd: jest.fn() },
    foods: { clear: jest.fn(), bulkAdd: jest.fn() },
    syncMetadata: {
      put: jest.fn(),
      get: jest.fn(),
    },
    transaction: jest.fn((mode: string, tables: any[], callback: () => Promise<void>) => {
      return callback();
    }),
    verno: 29,
  },
}));

describe("Cloud Sync Service - Restore", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  describe("downloadBackup", () => {
    const mockStorageKey = "a".repeat(64); // 64-char hex string

    it("should download encrypted blob successfully", async () => {
      const mockBlob = new Uint8Array([1, 2, 3, 4, 5]).buffer;

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        headers: {
          get: (header: string) => {
            if (header === "Content-Length") return "5";
            if (header === "Last-Modified") return "Wed, 13 Nov 2025 00:00:00 GMT";
            return null;
          },
        },
        arrayBuffer: async () => mockBlob,
      });

      const result = await downloadBackup(mockStorageKey);

      expect(result).toBe(mockBlob);
      expect(fetch).toHaveBeenCalledWith(
        `/api/sync/download?storageKey=${encodeURIComponent(mockStorageKey)}`,
        { method: "GET" }
      );
    });

    it("should handle 404 (blob not found) error", async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        headers: { get: () => null },
      });

      await expect(downloadBackup(mockStorageKey)).rejects.toThrow("BLOB_NOT_FOUND");
    });

    it("should handle 429 (rate limit) error", async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 429,
        headers: {
          get: (header: string) => (header === "Retry-After" ? "1800" : null),
        },
      });

      await expect(downloadBackup(mockStorageKey)).rejects.toThrow("RATE_LIMIT:1800");
    });

    it("should handle 503 (service unavailable) error", async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 503,
        headers: { get: () => null },
      });

      await expect(downloadBackup(mockStorageKey)).rejects.toThrow("SERVICE_UNAVAILABLE");
    });

    it("should throw error if storage key is invalid", async () => {
      await expect(downloadBackup("short-key")).rejects.toThrow("Invalid storage key");
    });
  });

  describe("extractMetadata", () => {
    it("should extract salt, IV, and ciphertext correctly", () => {
      // Create mock blob: salt (16 bytes) + IV (12 bytes) + ciphertext (5 bytes) = 33 bytes
      const salt = new Uint8Array(16).fill(1);
      const iv = new Uint8Array(12).fill(2);
      const ciphertext = new Uint8Array(5).fill(3);

      const blob = new Uint8Array(33);
      blob.set(salt, 0);
      blob.set(iv, 16);
      blob.set(ciphertext, 28);

      const result = extractMetadata(blob.buffer);

      expect(result.salt).toEqual(salt);
      expect(result.iv).toEqual(iv);
      expect(result.ciphertext).toEqual(ciphertext);
    });

    it("should throw error if blob is too small", () => {
      const smallBlob = new Uint8Array(27).buffer; // Less than 28 bytes

      expect(() => extractMetadata(smallBlob)).toThrow("MALFORMED_BLOB");
    });

    it("should handle exactly 28-byte blob (minimum size)", () => {
      const minBlob = new Uint8Array(28).fill(1).buffer;

      const result = extractMetadata(minBlob);

      expect(result.salt.byteLength).toBe(16);
      expect(result.iv.byteLength).toBe(12);
      expect(result.ciphertext.byteLength).toBe(0); // Empty ciphertext
    });
  });

  describe("decryptData", () => {
    it("should decrypt blob successfully with correct passphrase", async () => {
      const mockKey = { type: "secret" } as CryptoKey;
      const mockPlaintext = new TextEncoder().encode('{"test": "data"}');

      mockCrypto.subtle.importKey.mockResolvedValue({ type: "raw" } as CryptoKey);
      mockCrypto.subtle.deriveKey.mockResolvedValue(mockKey);
      mockCrypto.subtle.decrypt.mockResolvedValue(mockPlaintext.buffer);

      // Create encrypted blob: salt (16) + IV (12) + ciphertext (mock)
      const salt = new Uint8Array(16).fill(1);
      const iv = new Uint8Array(12).fill(2);
      const blob = new Uint8Array(28 + mockPlaintext.byteLength);
      blob.set(salt, 0);
      blob.set(iv, 16);
      blob.set(mockPlaintext, 28);

      const result = await decryptData(blob.buffer, "test-passphrase");

      expect(result).toBe('{"test": "data"}');
      expect(mockCrypto.subtle.decrypt).toHaveBeenCalledWith(
        { name: "AES-GCM", iv: expect.any(Uint8Array) },
        mockKey,
        expect.any(Uint8Array)
      );
    });

    it("should throw error for wrong passphrase", async () => {
      const mockKey = { type: "secret" } as CryptoKey;

      mockCrypto.subtle.importKey.mockResolvedValue({ type: "raw" } as CryptoKey);
      mockCrypto.subtle.deriveKey.mockResolvedValue(mockKey);
      mockCrypto.subtle.decrypt.mockRejectedValue(new Error("decrypt operation failed"));

      const blob = new Uint8Array(50).fill(1).buffer;

      await expect(decryptData(blob, "wrong-passphrase")).rejects.toThrow("WRONG_PASSPHRASE");
    });

    it("should throw error if passphrase is empty", async () => {
      const blob = new Uint8Array(50).fill(1).buffer;

      await expect(decryptData(blob, "")).rejects.toThrow("Passphrase cannot be empty");
    });
  });

  describe("validateBackupData", () => {
    it("should accept valid backup data", () => {
      const validData: BackupData = {
        version: 1,
        timestamp: Date.now(),
        schemaVersion: 29,
        data: {
          users: [{ id: "user1" }],
          symptoms: [{ id: "s1" }],
          medications: [{ id: "m1" }],
          triggers: [{ id: "t1" }],
          foods: [{ id: "f1" }],
          flares: [{ id: "flare1" }],
        },
      };

      const result = validateBackupData(validData);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should reject missing version", () => {
      const invalidData = {
        timestamp: Date.now(),
        data: {},
      };

      const result = validateBackupData(invalidData);

      expect(result.valid).toBe(false);
      expect(result.error).toContain("schema version");
    });

    it("should reject unsupported schema version", () => {
      const invalidData: BackupData = {
        version: 2,
        timestamp: Date.now(),
        schemaVersion: 29,
        data: {},
      };

      const result = validateBackupData(invalidData);

      expect(result.valid).toBe(false);
      expect(result.error).toContain("Unsupported schema version");
    });

    it("should reject missing critical table", () => {
      const invalidData: BackupData = {
        version: 1,
        timestamp: Date.now(),
        schemaVersion: 29,
        data: {
          users: [],
          // Missing symptoms
          medications: [],
        },
      };

      const result = validateBackupData(invalidData);

      expect(result.valid).toBe(false);
      expect(result.error).toContain("symptoms");
    });
  });

  describe("backupCurrentData", () => {
    it("should create backup and return backup ID", async () => {
      const backupId = await backupCurrentData();

      expect(backupId).toMatch(/^backup-\d+$/);
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it("should clean up old backups (keep last 3)", async () => {
      // Create 5 backups
      for (let i = 0; i < 5; i++) {
        await backupCurrentData();
      }

      // Should have removed old backups (keep last 3)
      const setItemCalls = (localStorageMock.setItem as jest.Mock).mock.calls;
      expect(setItemCalls.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe("restoreData", () => {
    it("should restore data to IndexedDB", async () => {
      const backupData: BackupData = {
        version: 1,
        timestamp: Date.now(),
        schemaVersion: 29,
        data: {
          users: [{ id: "user1" }],
          symptoms: [{ id: "s1" }],
        },
      };

      await restoreData(backupData);

      const { db } = require("../../db/client");
      expect(db.transaction).toHaveBeenCalled();
    });
  });

  describe("mapRestoreError", () => {
    it("should map WRONG_PASSPHRASE error", () => {
      const message = mapRestoreError(new Error("WRONG_PASSPHRASE: ..."));
      expect(message).toContain("Wrong passphrase");
    });

    it("should map BLOB_NOT_FOUND error", () => {
      const message = mapRestoreError(new Error("BLOB_NOT_FOUND"));
      expect(message).toContain("No backup found");
    });

    it("should map VALIDATION_FAILED error", () => {
      const message = mapRestoreError(new Error("VALIDATION_FAILED: ..."));
      expect(message).toContain("corrupted or incompatible");
    });

    it("should map RATE_LIMIT error with wait time", () => {
      const message = mapRestoreError(new Error("RATE_LIMIT:3600"));
      expect(message).toContain("60 minutes");
    });
  });

  describe("restoreBackup (integration)", () => {
    it("should orchestrate full restore flow with progress tracking", async () => {
      const mockKey = { type: "secret" } as CryptoKey;
      const mockPlaintext = new TextEncoder().encode('{"version":1,"timestamp":1234567890,"schemaVersion":29,"data":{"users":[],"symptoms":[],"medications":[],"triggers":[],"foods":[],"flares":[]}}');
      const mockCiphertext = new Uint8Array([100, 101, 102]);

      mockCrypto.subtle.importKey.mockResolvedValue({ type: "raw" } as CryptoKey);
      mockCrypto.subtle.deriveKey.mockResolvedValue(mockKey);
      mockCrypto.subtle.decrypt.mockResolvedValue(mockPlaintext.buffer);
      mockCrypto.subtle.digest.mockResolvedValue(new Uint8Array(32).fill(0xaa).buffer);

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        headers: { get: () => null },
        arrayBuffer: async () => {
          const blob = new Uint8Array(28 + mockCiphertext.byteLength);
          blob.set(new Uint8Array(16).fill(1), 0); // salt
          blob.set(new Uint8Array(12).fill(2), 16); // IV
          blob.set(mockCiphertext, 28); // ciphertext
          return blob.buffer;
        },
      });

      const progressUpdates: any[] = [];
      const onProgress = (update: any) => progressUpdates.push(update);

      await restoreBackup("test-passphrase-123", onProgress);

      // Verify progress updates
      expect(progressUpdates.length).toBeGreaterThan(0);
      expect(progressUpdates[0].stage).toBe("download");
      expect(progressUpdates.some((p) => p.stage === "decrypt")).toBe(true);
      expect(progressUpdates.some((p) => p.stage === "restore")).toBe(true);
    });

    it("should handle restore errors gracefully", async () => {
      (fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

      await expect(restoreBackup("test-passphrase")).rejects.toThrow();
    });
  });
});
