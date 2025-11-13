/**
 * Cloud Sync Service - Client-side encryption and cloud backup/restore
 *
 * This service implements zero-knowledge encryption for cloud backups:
 * - All encryption happens client-side using Web Crypto API
 * - Server never sees unencrypted data or passphrases
 * - PBKDF2 key derivation with 100,000 iterations (OWASP recommended)
 * - AES-256-GCM authenticated encryption
 *
 * Security Architecture:
 * - Passphrase → PBKDF2 → Encryption Key (AES-256-GCM)
 * - Passphrase → SHA-256 → Storage Key (blob identifier)
 * - Random salt per backup (prevents rainbow table attacks)
 * - Authentication tag validates data integrity
 */

/**
 * Progress update callback for backup/restore operations
 */
export interface ProgressUpdate {
  stage: "export" | "encrypt" | "upload" | "download" | "decrypt" | "restore";
  percent: number;
  message: string;
}

/**
 * Callback function type for progress updates
 */
export type ProgressCallback = (progress: ProgressUpdate) => void;

/**
 * Metadata returned from successful upload
 */
export interface UploadMetadata {
  uploadedAt: string; // ISO 8601 timestamp
  blobSize: number; // Size in bytes
  storageKeyHash: string; // First 8 chars of storage key (for logging)
}

/**
 * Sync metadata stored locally in IndexedDB
 */
export interface SyncMetadata {
  id: "primary"; // Single-row table
  lastSyncTimestamp: number; // Date.now() of last attempt
  lastSyncSuccess: boolean; // true = success, false = failure
  blobSizeBytes: number; // Size of last successful backup
  storageKeyHash: string; // First 8 chars of storage key (for display)
  errorMessage?: string; // User-friendly error if lastSyncSuccess = false
}

/**
 * Passphrase validation result
 */
export interface PassphraseValidation {
  valid: boolean;
  error?: string;
}

/**
 * Derive encryption key from passphrase using PBKDF2
 *
 * Uses industry-standard key derivation with:
 * - PBKDF2 algorithm (Password-Based Key Derivation Function 2)
 * - 100,000 iterations (OWASP recommendation, protects against brute-force)
 * - SHA-256 hash function
 * - Random 16-byte salt (must be unique per backup)
 * - 256-bit key output (for AES-256-GCM encryption)
 *
 * Security rationale:
 * - High iteration count slows down brute-force attacks
 * - Random salt prevents rainbow table attacks
 * - Salt must be stored with ciphertext for later decryption
 *
 * @param passphrase User's passphrase (minimum 12 characters recommended)
 * @param salt Random 16-byte salt (generated per backup using crypto.getRandomValues)
 * @returns CryptoKey suitable for AES-GCM encryption/decryption
 * @throws Error if passphrase is empty or Web Crypto API unavailable
 *
 * @example
 * ```typescript
 * const salt = crypto.getRandomValues(new Uint8Array(16));
 * const key = await deriveEncryptionKey("my-secure-passphrase", salt);
 * // Use key with crypto.subtle.encrypt() for AES-GCM
 * ```
 */
export async function deriveEncryptionKey(
  passphrase: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  if (!passphrase || passphrase.length === 0) {
    throw new Error("Passphrase cannot be empty");
  }

  if (!crypto?.subtle) {
    throw new Error("Web Crypto API not available");
  }

  // Convert passphrase string to raw key material
  const encoder = new TextEncoder();
  const passphraseKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(passphrase),
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"]
  );

  // Derive AES-256-GCM key using PBKDF2
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations: 100000, // OWASP recommended minimum
      hash: "SHA-256",
    },
    passphraseKey,
    { name: "AES-GCM", length: 256 }, // 256-bit key for AES-256-GCM
    false, // Key not extractable (security best practice)
    ["encrypt", "decrypt"] // Key usages
  );
}

/**
 * Derive storage key from passphrase using SHA-256
 *
 * Creates a deterministic blob identifier from the passphrase:
 * - SHA-256 hash produces 256-bit (32-byte) output
 * - Converted to 64-character hexadecimal string
 * - Same passphrase always produces same storage key (enables cross-device retrieval)
 * - Different passphrases produce different storage keys (collision-resistant)
 *
 * Security rationale:
 * - One-way hash (server cannot reverse-engineer passphrase)
 * - Deterministic (same passphrase = same storage key across devices)
 * - Collision-resistant (different passphrases produce different keys)
 * - Storage key is not secret (used as blob filename prefix)
 *
 * Usage:
 * - Storage key serves as blob identifier in Vercel Blob Storage
 * - Format: `{storageKeyHex}-{timestamp}.blob` for versioning
 * - First 8 characters logged for debugging (safe without exposing full key)
 *
 * @param passphrase User's passphrase
 * @returns 64-character hexadecimal string (SHA-256 hash)
 * @throws Error if passphrase is empty or Web Crypto API unavailable
 *
 * @example
 * ```typescript
 * const storageKey = await deriveStorageKey("my-secure-passphrase");
 * // Result: "a1b2c3d4..." (64 hex characters)
 * // Use as blob identifier: `${storageKey}-${Date.now()}.blob`
 * ```
 */
export async function deriveStorageKey(passphrase: string): Promise<string> {
  if (!passphrase || passphrase.length === 0) {
    throw new Error("Passphrase cannot be empty");
  }

  if (!crypto?.subtle) {
    throw new Error("Web Crypto API not available");
  }

  // Hash passphrase using SHA-256
  const encoder = new TextEncoder();
  const data = encoder.encode(passphrase);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);

  // Convert hash to hexadecimal string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return hashHex; // 64-character hex string
}

/**
 * Export all IndexedDB data to JSON for cloud backup
 *
 * Exports complete database snapshot including:
 * - All Dexie tables (users, symptoms, flares, food events, etc.)
 * - Schema version metadata for future compatibility
 * - Timestamp of export operation
 *
 * Backup format:
 * ```json
 * {
 *   "version": 1,
 *   "timestamp": 1699999999999,
 *   "schemaVersion": 28,
 *   "data": {
 *     "users": [...],
 *     "symptoms": [...],
 *     ...
 *   }
 * }
 * ```
 *
 * Security notes:
 * - Exported JSON contains ALL user data (health records, preferences, etc.)
 * - Must be encrypted before upload (see encryptData function)
 * - Photos/attachments exported as is (may contain encrypted data)
 *
 * @returns JSON string containing complete database snapshot
 * @throws Error if database access fails or export encounters errors
 *
 * @example
 * ```typescript
 * const jsonData = await exportAllData();
 * console.log(`Export size: ${jsonData.length} bytes`);
 * // Encrypt before uploading: await encryptData(jsonData, passphrase);
 * ```
 */
export async function exportAllData(): Promise<string> {
  try {
    // Dynamically import db to avoid circular dependencies
    const { db } = await import("../db/client");

    // Export all tables
    const allData: Record<string, unknown[]> = {};

    // Get all table names from the database
    const tableNames = db.tables.map((table) => table.name);

    console.log(`[CloudSync] Exporting ${tableNames.length} tables...`);

    // Export each table
    for (const tableName of tableNames) {
      try {
        const table = db.table(tableName);
        const records = await table.toArray();
        allData[tableName] = records;
        console.log(`[CloudSync] Exported ${tableName}: ${records.length} records`);
      } catch (error) {
        console.error(`[CloudSync] Error exporting table ${tableName}:`, error);
        // Continue with other tables even if one fails
        allData[tableName] = [];
      }
    }

    // Create backup payload with metadata
    const backup = {
      version: 1, // Backup format version
      timestamp: Date.now(), // Export timestamp
      schemaVersion: db.verno, // Current Dexie schema version
      data: allData,
    };

    // Serialize to JSON
    const jsonString = JSON.stringify(backup);

    // Validate JSON is well-formed by parsing it back
    try {
      JSON.parse(jsonString);
    } catch (error) {
      throw new Error("Failed to generate valid JSON: " + error);
    }

    // Log export statistics
    const sizeKB = (jsonString.length / 1024).toFixed(2);
    const sizeMB = (jsonString.length / 1024 / 1024).toFixed(2);
    console.log(`[CloudSync] Export complete: ${sizeKB} KB (${sizeMB} MB)`);
    console.log(`[CloudSync] Schema version: ${db.verno}`);

    return jsonString;
  } catch (error) {
    console.error("[CloudSync] Export failed:", error);
    throw new Error(
      `Failed to export IndexedDB data: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Encrypt data using AES-256-GCM with passphrase-derived key
 *
 * Encryption process:
 * 1. Generate random 16-byte salt for PBKDF2
 * 2. Derive AES-256 key from passphrase using PBKDF2 + salt
 * 3. Generate random 12-byte IV for AES-GCM
 * 4. Encrypt plaintext using AES-GCM (provides confidentiality + authenticity)
 * 5. Prepend salt + IV to ciphertext for later decryption
 *
 * Output structure (ArrayBuffer):
 * - Bytes 0-15: Salt (16 bytes) - needed for PBKDF2 key derivation
 * - Bytes 16-27: IV (12 bytes) - needed for AES-GCM decryption
 * - Bytes 28+: Ciphertext + authentication tag (variable length)
 *
 * Security guarantees:
 * - AES-256-GCM provides authenticated encryption (prevents tampering)
 * - Random salt per encryption (prevents rainbow table attacks)
 * - Random IV per encryption (required for AES-GCM security)
 * - Authentication tag validates data integrity (included in ciphertext by GCM)
 *
 * Why prepend salt + IV?
 * - Salt and IV are not secret, just unique
 * - Storing them with ciphertext eliminates need for separate transmission
 * - Standard practice in cryptographic protocols
 *
 * @param jsonData Plaintext JSON string to encrypt
 * @param passphrase User's passphrase (used to derive encryption key)
 * @returns ArrayBuffer containing salt + IV + ciphertext + auth tag
 * @throws Error if encryption fails or Web Crypto API unavailable
 *
 * @example
 * ```typescript
 * const encrypted = await encryptData('{"user": "data"}', "my-passphrase");
 * console.log(`Encrypted size: ${encrypted.byteLength} bytes`);
 * // First 16 bytes are salt, next 12 are IV, rest is ciphertext
 * ```
 */
export async function encryptData(
  jsonData: string,
  passphrase: string
): Promise<ArrayBuffer> {
  if (!jsonData || jsonData.length === 0) {
    throw new Error("Cannot encrypt empty data");
  }

  if (!passphrase || passphrase.length === 0) {
    throw new Error("Passphrase cannot be empty");
  }

  if (!crypto?.subtle) {
    throw new Error("Web Crypto API not available");
  }

  try {
    // 1. Generate random salt for PBKDF2 key derivation
    const salt = crypto.getRandomValues(new Uint8Array(16));

    // 2. Derive encryption key from passphrase + salt
    const key = await deriveEncryptionKey(passphrase, salt);

    // 3. Generate random IV for AES-GCM
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // 4. Encrypt JSON data using AES-GCM
    const encoder = new TextEncoder();
    const plaintext = encoder.encode(jsonData);

    const ciphertext = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      plaintext
    );

    // 5. Prepend salt + IV to ciphertext
    // Final structure: [salt(16) | IV(12) | ciphertext + auth tag]
    const result = new Uint8Array(16 + 12 + ciphertext.byteLength);
    result.set(salt, 0); // Bytes 0-15: salt
    result.set(iv, 16); // Bytes 16-27: IV
    result.set(new Uint8Array(ciphertext), 28); // Bytes 28+: ciphertext + auth tag

    console.log(`[CloudSync] Encrypted ${plaintext.byteLength} bytes → ${result.byteLength} bytes`);

    return result.buffer;
  } catch (error) {
    console.error("[CloudSync] Encryption failed:", error);
    throw new Error(
      `Failed to encrypt data: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Upload encrypted blob to cloud storage via edge function
 *
 * Sends encrypted backup to `/api/sync/upload` edge function:
 * - Converts ArrayBuffer to Base64 for JSON transport
 * - Includes storage key and metadata
 * - Handles various HTTP error codes
 *
 * Edge function API contract (from Story 7.1):
 * - Endpoint: POST /api/sync/upload
 * - Request: { blob: base64String, storageKey: string, metadata: { timestamp, originalSize } }
 * - Response: { uploadedAt: ISO8601, blobSize: number, storageKeyHash: string }
 * - Rate limit: 10 uploads per hour per storage key
 *
 * HTTP status codes:
 * - 200: Success - backup uploaded
 * - 400: Invalid request format
 * - 413: Payload too large (exceeds 1GB limit)
 * - 429: Rate limit exceeded (too many uploads)
 * - 503: Service unavailable (Vercel Blob Storage down)
 *
 * @param encryptedBlob Encrypted data (from encryptData function)
 * @param storageKey Storage key derived from passphrase (from deriveStorageKey function)
 * @returns Upload metadata (timestamp, size, storage key hash)
 * @throws Error with user-friendly message for each failure type
 *
 * @example
 * ```typescript
 * const encrypted = await encryptData(jsonData, passphrase);
 * const storageKey = await deriveStorageKey(passphrase);
 * const metadata = await uploadBackup(encrypted, storageKey);
 * console.log(`Uploaded at: ${metadata.uploadedAt}`);
 * ```
 */
export async function uploadBackup(
  encryptedBlob: ArrayBuffer,
  storageKey: string
): Promise<UploadMetadata> {
  if (!encryptedBlob || encryptedBlob.byteLength === 0) {
    throw new Error("Cannot upload empty blob");
  }

  if (!storageKey || storageKey.length !== 64) {
    throw new Error("Invalid storage key (must be 64-character hex string)");
  }

  try {
    // 1. Convert ArrayBuffer to Base64 string for JSON transport
    const bytes = new Uint8Array(encryptedBlob);
    const binaryString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
    const base64Blob = btoa(binaryString);

    // 2. Construct request payload
    const payload = {
      blob: base64Blob,
      storageKey: storageKey,
      metadata: {
        timestamp: new Date().toISOString(),
        originalSize: encryptedBlob.byteLength,
      },
    };

    console.log(`[CloudSync] Uploading ${encryptedBlob.byteLength} bytes to /api/sync/upload...`);

    // 3. Send POST request to edge function
    const response = await fetch("/api/sync/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    // 4. Handle HTTP errors
    if (!response.ok) {
      // Parse error response if available
      let errorMessage = "Upload failed";
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // Error response not JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }

      // Map HTTP status codes to user-friendly errors
      if (response.status === 413) {
        throw new Error("QUOTA_EXCEEDED"); // Backup exceeds 1GB limit
      } else if (response.status === 429) {
        // Rate limit exceeded - parse Retry-After header
        const retryAfter = response.headers.get("Retry-After") || "3600";
        throw new Error(`RATE_LIMIT:${retryAfter}`); // Too many uploads
      } else if (response.status === 503) {
        throw new Error("SERVICE_UNAVAILABLE"); // Vercel Blob Storage down
      } else if (response.status === 400) {
        throw new Error("INVALID_REQUEST"); // Invalid request format
      } else {
        throw new Error("UPLOAD_FAILED"); // Generic upload failure
      }
    }

    // 5. Parse success response
    const result = await response.json();

    console.log(`[CloudSync] Upload successful: ${result.blobSize} bytes`);
    console.log(`[CloudSync] Storage key hash: ${result.storageKeyHash}`);

    return {
      uploadedAt: result.uploadedAt,
      blobSize: result.blobSize,
      storageKeyHash: result.storageKeyHash,
    };
  } catch (error) {
    // Re-throw structured errors (QUOTA_EXCEEDED, RATE_LIMIT, etc.)
    if (error instanceof Error && error.message.includes(":")) {
      throw error;
    }

    // Wrap network errors
    console.error("[CloudSync] Upload failed:", error);
    throw new Error(
      `NETWORK_ERROR: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Map upload error codes to user-friendly messages
 *
 * Converts technical error codes into actionable messages:
 * - QUOTA_EXCEEDED: Backup too large (>1GB)
 * - RATE_LIMIT: Too many uploads (wait X minutes)
 * - SERVICE_UNAVAILABLE: Cloud storage temporarily down
 * - NETWORK_ERROR: Connection problem
 * - INVALID_REQUEST: Malformed request (shouldn't happen)
 *
 * @param error Error thrown by uploadBackup function
 * @returns User-friendly error message
 */
export function mapUploadError(error: Error): string {
  const errorCode = error.message;

  if (errorCode === "QUOTA_EXCEEDED") {
    return "Upload failed: Backup exceeds 1GB storage limit. Contact support to increase quota.";
  } else if (errorCode.startsWith("RATE_LIMIT:")) {
    const waitTime = errorCode.split(":")[1] || "60";
    const minutes = Math.ceil(parseInt(waitTime) / 60);
    return `Upload failed: Too many uploads. Please wait ${minutes} minutes and try again.`;
  } else if (errorCode === "SERVICE_UNAVAILABLE") {
    return "Upload failed: Cloud storage temporarily unavailable. Please try again in a few minutes.";
  } else if (errorCode.startsWith("NETWORK_ERROR")) {
    return "Upload failed: Network error. Check your internet connection and try again.";
  } else if (errorCode === "INVALID_REQUEST") {
    return "Upload failed: Invalid backup format. This shouldn't happen - contact support.";
  } else {
    return "Upload failed: An unexpected error occurred. Please try again or contact support.";
  }
}

/**
 * Save sync metadata to IndexedDB
 *
 * Stores backup/restore attempt metadata locally:
 * - Last sync timestamp (success or failure)
 * - Success status (true/false)
 * - Blob size (for successful uploads)
 * - Storage key hash (first 8 chars for display)
 * - Error message (for failed attempts)
 *
 * Uses single-row table (id='primary') for simplicity.
 *
 * @param metadata Sync metadata to store
 * @throws Error if IndexedDB write fails
 */
export async function saveSyncMetadata(metadata: SyncMetadata): Promise<void> {
  try {
    const { db } = await import("../db/client");

    // Ensure table exists (will be added in schema migration)
    if (!db.syncMetadata) {
      console.warn("[CloudSync] syncMetadata table not found - skipping metadata save");
      return;
    }

    // Upsert metadata (always use id='primary')
    await db.syncMetadata.put({
      ...metadata,
      id: "primary",
    });

    console.log("[CloudSync] Sync metadata saved");
  } catch (error) {
    console.error("[CloudSync] Failed to save sync metadata:", error);
    throw new Error(
      `Failed to save sync metadata: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Get sync metadata from IndexedDB
 *
 * @returns Sync metadata or null if not found
 */
export async function getSyncMetadata(): Promise<SyncMetadata | null> {
  try {
    const { db } = await import("../db/client");

    if (!db.syncMetadata) {
      return null;
    }

    const metadata = await db.syncMetadata.get("primary");
    return metadata || null;
  } catch (error) {
    console.error("[CloudSync] Failed to get sync metadata:", error);
    return null;
  }
}

/**
 * Validate passphrase meets minimum security requirements
 *
 * Requirements:
 * - Minimum 12 characters (OWASP recommendation for passphrases)
 * - Confirmation must match (prevents typos)
 *
 * @param passphrase User's passphrase
 * @param confirmation Passphrase confirmation (user types twice)
 * @returns Validation result with error message if invalid
 */
export function validatePassphrase(
  passphrase: string,
  confirmation: string
): PassphraseValidation {
  // Check minimum length
  if (!passphrase || passphrase.length < 12) {
    return {
      valid: false,
      error: "Passphrase must be at least 12 characters",
    };
  }

  // Check confirmation matches
  if (passphrase !== confirmation) {
    return {
      valid: false,
      error: "Passphrases do not match",
    };
  }

  return { valid: true };
}

/**
 * Create encrypted backup and upload to cloud storage
 *
 * Orchestrates complete backup flow with progress tracking:
 * 1. Export all IndexedDB data (0-30%)
 * 2. Encrypt with passphrase (30-60%)
 * 3. Upload to cloud storage (60-100%)
 * 4. Save sync metadata locally
 *
 * Progress stages:
 * - export: Reading all tables from IndexedDB
 * - encrypt: PBKDF2 key derivation + AES-GCM encryption
 * - upload: Network transfer to Vercel Blob Storage
 *
 * @param passphrase User's passphrase (min 12 characters)
 * @param onProgress Callback for progress updates (optional)
 * @throws Error if any step fails (export, encrypt, upload)
 *
 * @example
 * ```typescript
 * await createBackup("my-secure-passphrase", (progress) => {
 *   console.log(`${progress.stage}: ${progress.percent}% - ${progress.message}`);
 * });
 * ```
 */
export async function createBackup(
  passphrase: string,
  onProgress?: ProgressCallback
): Promise<void> {
  try {
    // Stage 1: Export data from IndexedDB (0-30%)
    onProgress?.({
      stage: "export",
      percent: 0,
      message: "Exporting data from IndexedDB...",
    });

    const jsonData = await exportAllData();

    onProgress?.({
      stage: "export",
      percent: 30,
      message: "Data exported successfully",
    });

    // Stage 2: Encrypt data with passphrase (30-60%)
    onProgress?.({
      stage: "encrypt",
      percent: 30,
      message: "Encrypting backup with your passphrase...",
    });

    const encryptedBlob = await encryptData(jsonData, passphrase);

    onProgress?.({
      stage: "encrypt",
      percent: 60,
      message: "Encryption complete",
    });

    // Stage 3: Upload to Vercel Blob Storage (60-100%)
    onProgress?.({
      stage: "upload",
      percent: 60,
      message: "Uploading to cloud storage...",
    });

    const storageKey = await deriveStorageKey(passphrase);
    const metadata = await uploadBackup(encryptedBlob, storageKey);

    onProgress?.({
      stage: "upload",
      percent: 100,
      message: "Upload complete!",
    });

    // Store sync metadata locally
    await saveSyncMetadata({
      id: "primary",
      lastSyncTimestamp: Date.now(),
      lastSyncSuccess: true,
      blobSizeBytes: metadata.blobSize,
      storageKeyHash: metadata.storageKeyHash,
    });

    console.log("[CloudSync] Backup completed successfully");
  } catch (error) {
    console.error("[CloudSync] Backup failed:", error);

    // Store failed metadata
    const errorMessage = error instanceof Error ? mapUploadError(error) : "Unknown error";

    await saveSyncMetadata({
      id: "primary",
      lastSyncTimestamp: Date.now(),
      lastSyncSuccess: false,
      blobSizeBytes: 0,
      storageKeyHash: "",
      errorMessage,
    });

    throw new Error(errorMessage);
  }
}
