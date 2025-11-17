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
  // Upload fields (from Story 7.2)
  lastSyncTimestamp: number; // Date.now() of last upload attempt
  lastSyncSuccess: boolean; // true = success, false = failure
  blobSizeBytes: number; // Size of last successful backup
  storageKeyHash: string; // First 8 chars of storage key (for display)
  errorMessage?: string; // User-friendly error if lastSyncSuccess = false
  // Restore fields (NEW for Story 7.3)
  lastRestoreTimestamp?: number; // Date.now() of last restore attempt
  lastRestoreSuccess?: boolean; // true = restore succeeded, false = failed
  restoredBlobSize?: number; // Size of restored backup
  restoredStorageKeyHash?: string; // First 8 chars of storage key
  restoreErrorMessage?: string; // User-friendly error if lastRestoreSuccess = false
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
 * Check if cloud backup exists and compare age with local data
 *
 * Safety check before upload to prevent overwriting newer data:
 * - Fetches cloud backup metadata (timestamp)
 * - Compares with local export timestamp
 * - Returns warning if cloud is newer
 *
 * @param passphrase User's passphrase (to generate storage key)
 * @returns Comparison result with warning if needed
 */
export async function checkCloudBackupAge(passphrase: string): Promise<{
  cloudExists: boolean;
  cloudTimestamp?: number;
  cloudIsNewer?: boolean;
  warningMessage?: string;
}> {
  try {
    // Generate storage key from passphrase
    const storageKey = await deriveStorageKey(passphrase);
    console.log(`[CloudSync] Checking cloud backup age for key: ${storageKey}`);

    // Fetch cloud metadata
    const response = await fetch("/api/sync/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storageKey }),
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.log(`[CloudSync] No existing cloud backup found`);
        return { cloudExists: false };
      }
      throw new Error(`Failed to check cloud backup: ${response.statusText}`);
    }

    // Get blob metadata from headers
    const lastModified = response.headers.get("last-modified");
    if (!lastModified) {
      console.warn(`[CloudSync] Cloud backup exists but no timestamp found`);
      return { cloudExists: true };
    }

    const cloudTimestamp = new Date(lastModified).getTime();
    console.log(`[CloudSync] Cloud backup timestamp: ${new Date(cloudTimestamp).toISOString()}`);

    // Get local export timestamp
    const localDataJson = await exportAllData();
    const localData = JSON.parse(localDataJson);
    const localTimestamp = localData.timestamp;
    console.log(`[CloudSync] Local data timestamp: ${new Date(localTimestamp).toISOString()}`);

    // Compare timestamps
    const cloudIsNewer = cloudTimestamp > localTimestamp;

    if (cloudIsNewer) {
      const hoursDiff = Math.round((cloudTimestamp - localTimestamp) / (1000 * 60 * 60));
      const warningMessage =
        hoursDiff > 24
          ? `Cloud backup is ${Math.round(hoursDiff / 24)} day(s) newer than your local data.`
          : hoursDiff > 1
          ? `Cloud backup is ${hoursDiff} hours newer than your local data.`
          : `Cloud backup is newer than your local data.`;

      console.warn(`[CloudSync] ${warningMessage}`);

      return {
        cloudExists: true,
        cloudTimestamp,
        cloudIsNewer: true,
        warningMessage,
      };
    }

    console.log(`[CloudSync] Local data is newer or same age as cloud backup`);
    return {
      cloudExists: true,
      cloudTimestamp,
      cloudIsNewer: false,
    };
  } catch (error) {
    console.error("[CloudSync] Failed to check cloud backup age:", error);
    // On error, allow upload (fail open)
    return { cloudExists: false };
  }
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

// ============================================================================
// RESTORE FUNCTIONALITY (Story 7.3)
// ============================================================================

/**
 * Backup data structure returned from decryption
 */
export interface BackupData {
  version: number; // Schema version (initially 1)
  timestamp: number; // Backup creation time (Date.now())
  schemaVersion?: number; // Dexie schema version (optional for backwards compatibility)
  data: Record<string, unknown[]>; // Table data (key = table name, value = array of records)
}

/**
 * Metadata extracted from encrypted blob
 */
export interface ExtractedMetadata {
  salt: Uint8Array; // 16 bytes - for PBKDF2 key derivation
  iv: Uint8Array; // 12 bytes - for AES-GCM decryption
  ciphertext: Uint8Array; // Variable length - encrypted data + auth tag
}

/**
 * Validation result for backup data
 */
export interface BackupValidation {
  valid: boolean;
  error?: string;
}

/**
 * Download encrypted blob from cloud storage via edge function
 *
 * Fetches encrypted backup from `/api/sync/download` edge function:
 * - Derives storage key from passphrase (same as upload)
 * - Sends GET request with storage key query parameter
 * - Handles various HTTP error codes
 * - Parses response headers (Content-Length, Last-Modified)
 * - Returns binary blob as ArrayBuffer
 *
 * Edge function API contract (from Story 7.1):
 * - Endpoint: GET /api/sync/download?storageKey={64-char hex}
 * - Response 200: Binary blob (application/octet-stream) + headers
 * - Response 404: Blob not found (wrong passphrase or no backup)
 * - Response 429: Rate limit exceeded (5 downloads/minute)
 * - Response 503: Service unavailable (Vercel Blob Storage down)
 *
 * HTTP status codes:
 * - 200: Success - blob found and returned
 * - 404: Blob not found (wrong passphrase or no backup exists)
 * - 429: Rate limit exceeded (too many downloads)
 * - 503: Service unavailable (cloud storage temporarily down)
 *
 * @param storageKey Storage key derived from passphrase (64-char hex string)
 * @returns ArrayBuffer containing encrypted blob (salt + IV + ciphertext)
 * @throws Error with code prefix for each failure type (BLOB_NOT_FOUND, RATE_LIMIT, etc.)
 *
 * @example
 * ```typescript
 * const storageKey = await deriveStorageKey("my-passphrase");
 * const encryptedBlob = await downloadBackup(storageKey);
 * console.log(`Downloaded ${encryptedBlob.byteLength} bytes`);
 * ```
 */
export async function downloadBackup(storageKey: string): Promise<ArrayBuffer> {
  if (!storageKey || storageKey.length !== 64) {
    throw new Error("Invalid storage key (must be 64-character hex string)");
  }

  try {
    console.log(`[CloudSync] Downloading backup from /api/sync/download...`);
    console.log(`[CloudSync] Storage key hash: ${storageKey.substring(0, 8)}`);

    // Send GET request to download endpoint
    const response = await fetch(`/api/sync/download?storageKey=${storageKey}`);

    // Handle HTTP errors
    if (!response.ok) {
      // Parse error response if available
      let errorDetails = "";
      try {
        const errorData = await response.json();
        errorDetails = errorData.message || errorData.error || "";
      } catch {
        // Error response not JSON, use status text
        errorDetails = response.statusText || "";
      }

      // Map HTTP status codes to structured errors
      if (response.status === 404) {
        throw new Error("BLOB_NOT_FOUND");
      } else if (response.status === 429) {
        // Rate limit exceeded - parse Retry-After header
        const retryAfter = response.headers.get("Retry-After") || "60";
        throw new Error(`RATE_LIMIT:${retryAfter}`);
      } else if (response.status === 503) {
        throw new Error("SERVICE_UNAVAILABLE");
      } else {
        throw new Error("DOWNLOAD_FAILED");
      }
    }

    // Parse response headers
    const contentLength = response.headers.get("Content-Length");
    const lastModified = response.headers.get("Last-Modified");

    console.log(`[CloudSync] Blob found: ${contentLength} bytes`);
    console.log(`[CloudSync] Last modified: ${lastModified}`);

    // Read blob as ArrayBuffer
    const blob = await response.arrayBuffer();

    console.log(`[CloudSync] Downloaded ${blob.byteLength} bytes successfully`);

    return blob;
  } catch (error) {
    // Re-throw structured errors (BLOB_NOT_FOUND, RATE_LIMIT, etc.)
    if (error instanceof Error && error.message.includes("_")) {
      throw error;
    }

    // Wrap network errors
    console.error("[CloudSync] Download failed:", error);
    throw new Error(
      `NETWORK_ERROR: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Extract salt, IV, and ciphertext from encrypted blob
 *
 * Encrypted blob structure (from Story 7.2):
 * - Bytes 0-15: Salt (16 bytes) - for PBKDF2 key derivation
 * - Bytes 16-27: IV (12 bytes) - for AES-GCM decryption
 * - Bytes 28+: Ciphertext + auth tag (variable length)
 *
 * This structure is created by encryptData() function in Story 7.2.
 * Must extract components to derive key and decrypt data.
 *
 * Validation:
 * - Blob must be at least 28 bytes (salt + IV minimum)
 * - Salt must be 16 bytes (PBKDF2 standard)
 * - IV must be 12 bytes (AES-GCM standard)
 * - Ciphertext can be any length (depends on backup size)
 *
 * @param encryptedBlob Encrypted blob from downloadBackup function
 * @returns Extracted components (salt, IV, ciphertext)
 * @throws Error if blob is too small or malformed
 *
 * @example
 * ```typescript
 * const blob = await downloadBackup(storageKey);
 * const { salt, iv, ciphertext } = extractMetadata(blob);
 * console.log(`Salt: ${salt.length} bytes, IV: ${iv.length} bytes`);
 * ```
 */
export function extractMetadata(encryptedBlob: ArrayBuffer): ExtractedMetadata {
  // Validate minimum size (salt 16 + IV 12 = 28 bytes)
  if (encryptedBlob.byteLength < 28) {
    throw new Error(
      `MALFORMED_BLOB: Blob too small (${encryptedBlob.byteLength} bytes, minimum 28 bytes)`
    );
  }

  // Extract components from blob
  const salt = new Uint8Array(encryptedBlob, 0, 16); // Bytes 0-15: salt
  const iv = new Uint8Array(encryptedBlob, 16, 12); // Bytes 16-27: IV
  const ciphertext = new Uint8Array(encryptedBlob, 28); // Bytes 28+: ciphertext + auth tag

  console.log(`[CloudSync] Extracted metadata:`);
  console.log(`  - Salt: ${salt.length} bytes`);
  console.log(`  - IV: ${iv.length} bytes`);
  console.log(`  - Ciphertext: ${ciphertext.length} bytes`);

  return { salt, iv, ciphertext };
}

/**
 * Decrypt encrypted blob using AES-GCM and passphrase
 *
 * Decryption process (reverses encryption from Story 7.2):
 * 1. Extract salt, IV, ciphertext from blob
 * 2. Derive decryption key from passphrase + salt using PBKDF2
 * 3. Decrypt ciphertext using AES-GCM with derived key + IV
 * 4. AES-GCM automatically validates authentication tag
 * 5. Decode decrypted bytes to UTF-8 JSON string
 *
 * Why decryption can fail:
 * - Wrong passphrase: Derived key doesn't match encryption key → auth tag validation fails
 * - Corrupted blob: Ciphertext modified → auth tag validation fails
 * - Wrong salt/IV: Extracted metadata incorrect → decryption produces garbage
 *
 * AES-GCM authentication:
 * - Authentication tag is included in ciphertext by Web Crypto API
 * - Decryption automatically validates tag (throws if invalid)
 * - Invalid tag indicates wrong passphrase or data tampering
 *
 * CRITICAL: Must use extracted salt from blob (NOT a new random salt).
 * Using wrong salt produces wrong key, which fails authentication.
 *
 * @param encryptedBlob Encrypted blob from downloadBackup function
 * @param passphrase User's passphrase (same as used for encryption)
 * @returns Decrypted JSON string (backup data)
 * @throws Error if decryption fails (wrong passphrase, corrupted blob)
 *
 * @example
 * ```typescript
 * const blob = await downloadBackup(storageKey);
 * const json = await decryptData(blob, "my-passphrase");
 * const backup = JSON.parse(json);
 * ```
 */
export async function decryptData(
  encryptedBlob: ArrayBuffer,
  passphrase: string
): Promise<string> {
  if (!passphrase || passphrase.length === 0) {
    throw new Error("Passphrase cannot be empty");
  }

  if (!crypto?.subtle) {
    throw new Error("Web Crypto API not available");
  }

  try {
    // 1. Extract salt, IV, ciphertext from blob
    const { salt, iv, ciphertext } = extractMetadata(encryptedBlob);

    console.log(`[CloudSync] Deriving decryption key from passphrase...`);

    // 2. Derive decryption key using passphrase + extracted salt
    // CRITICAL: Use extracted salt (NOT a new random salt)
    // Same salt + passphrase = same key as encryption
    const key = await deriveEncryptionKey(passphrase, salt);

    console.log(`[CloudSync] Decrypting ${ciphertext.length} bytes...`);

    // 3. Decrypt ciphertext using AES-GCM
    // AES-GCM validates authentication tag automatically
    // Throws if tag is invalid (wrong passphrase or tampered data)
    const plaintext = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv as BufferSource,
      },
      key,
      ciphertext as BufferSource
    );

    console.log(`[CloudSync] Decryption successful: ${plaintext.byteLength} bytes`);

    // 4. Decode UTF-8 plaintext to JSON string
    const decoder = new TextDecoder();
    const jsonString = decoder.decode(plaintext);

    return jsonString;
  } catch (error) {
    console.error("[CloudSync] Decryption failed:", error);

    // AES-GCM throws if auth tag validation fails
    // Most common cause: wrong passphrase
    if (error instanceof Error && error.message.toLowerCase().includes("decrypt")) {
      throw new Error(
        "WRONG_PASSPHRASE: Authentication failed - wrong passphrase or corrupted backup"
      );
    }

    // Other errors (network, etc.)
    throw new Error(
      `Decryption failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Validate backup data structure before restore
 *
 * Validation checks:
 * - Required top-level fields: version, timestamp, data
 * - Schema version compatibility (initially only version 1 supported)
 * - Table data structure: each table should be an array
 * - Critical tables exist: flares, symptoms, medications, triggers, foods
 *
 * Schema version 1 structure:
 * ```typescript
 * {
 *   version: 1,
 *   timestamp: 1699999999999,
 *   schemaVersion: 28, // Optional Dexie schema version
 *   data: {
 *     flares: [...],
 *     symptoms: [...],
 *     // ... other tables
 *   }
 * }
 * ```
 *
 * Future schema evolution:
 * When schema version 2 is introduced (future stories), validation logic
 * will need migration support to convert v1 → v2 before restore.
 *
 * @param data Parsed JSON object from decrypted backup
 * @returns Validation result with error message if invalid
 *
 * @example
 * ```typescript
 * const json = await decryptData(blob, passphrase);
 * const data = JSON.parse(json);
 * const validation = validateBackupData(data);
 * if (!validation.valid) {
 *   throw new Error(validation.error);
 * }
 * ```
 */
export function validateBackupData(data: unknown): BackupValidation {
  // Check if data is an object
  if (typeof data !== "object" || data === null) {
    return { valid: false, error: "Backup data is not an object" };
  }

  const backup = data as Record<string, unknown>;

  // Check required top-level fields
  if (typeof backup.version !== "number") {
    return { valid: false, error: "Missing or invalid schema version" };
  }

  if (typeof backup.timestamp !== "number") {
    return { valid: false, error: "Missing or invalid timestamp" };
  }

  if (typeof backup.data !== "object" || backup.data === null) {
    return { valid: false, error: "Missing or invalid data object" };
  }

  // Check schema version compatibility
  if (backup.version !== 1) {
    return {
      valid: false,
      error: `Unsupported schema version: ${backup.version} (only version 1 supported)`,
    };
  }

  const tables = backup.data as Record<string, unknown>;

  // Validate that at least some data exists
  const tableCount = Object.keys(tables).length;
  if (tableCount === 0) {
    return {
      valid: false,
      error: "Backup contains no tables",
    };
  }

  // Check for common critical tables (warn if missing, but don't fail)
  const criticalTables = ["flares", "symptoms", "medications", "triggers", "foods"];
  const missingTables: string[] = [];

  for (const tableName of criticalTables) {
    if (!Array.isArray(tables[tableName])) {
      missingTables.push(tableName);
    }
  }

  if (missingTables.length > 0) {
    console.warn(
      `[CloudSync] Warning: Some expected tables are missing or invalid: ${missingTables.join(", ")}`
    );
    console.warn(
      `[CloudSync] These tables will be created as empty. This may be normal for older backups or different schema versions.`
    );
  }

  // Log validation statistics
  console.log(`[CloudSync] Backup validation passed:`);
  console.log(`  - Schema version: ${backup.version}`);
  console.log(`  - Timestamp: ${new Date(backup.timestamp).toISOString()}`);
  console.log(`  - Tables: ${tableCount}`);
  console.log(`  - Available tables: ${Object.keys(tables).join(", ")}`);

  return { valid: true };
}

/**
 * Create backup of current IndexedDB data before restore
 *
 * Safety mechanism to enable rollback if restore fails:
 * - Exports current data using exportAllData()
 * - Saves to temporary IndexedDB database (separate from production)
 * - Keeps last 3 backups (cleanup old backups automatically)
 * - Returns backup ID for later rollback if needed
 *
 * Storage options:
 * - Option 1: Separate IndexedDB database (recommended for any size)
 * - Option 2: localStorage (only for small backups <5MB due to quota limits)
 *
 * This backup is TEMPORARY and only used for emergency rollback.
 * It's NOT the same as cloud backups (which are encrypted and uploaded).
 *
 * Backup ID format: `backup-{timestamp}` (e.g., "backup-1699999999999")
 *
 * @returns Backup ID (timestamp-based identifier)
 * @throws Error if export or storage fails
 *
 * @example
 * ```typescript
 * const backupId = await backupCurrentData();
 * console.log(`Current data backed up: ${backupId}`);
 * // Later, if restore fails: await rollbackRestore(backupId);
 * ```
 */
export async function backupCurrentData(): Promise<string> {
  try {
    console.log(`[CloudSync] Creating temporary backup of current data...`);

    // 1. Export current data
    const jsonData = await exportAllData();

    // 2. Generate backup ID
    const backupId = `backup-${Date.now()}`;

    console.log(`[CloudSync] Backup ID: ${backupId}`);
    console.log(`[CloudSync] Backup size: ${(jsonData.length / 1024).toFixed(2)} KB`);

    // 3. Store backup in separate IndexedDB database
    // Use dynamic import to avoid circular dependencies
    const Dexie = (await import("dexie")).default;

    // Create/open temporary backup database
    const backupDb = new Dexie("symptom-tracker-temp-backups");
    backupDb.version(1).stores({
      backups: "id, timestamp, data",
    });

    // Store backup
    await backupDb.table("backups").put({
      id: backupId,
      timestamp: Date.now(),
      data: jsonData,
    });

    console.log(`[CloudSync] Backup stored in temporary database`);

    // 4. Cleanup old backups (keep last 3)
    const allBackups = await backupDb
      .table("backups")
      .orderBy("timestamp")
      .reverse()
      .toArray();

    if (allBackups.length > 3) {
      const toDelete = allBackups.slice(3); // Keep first 3, delete rest
      const deleteIds = toDelete.map((b: { id: string }) => b.id);
      await backupDb.table("backups").bulkDelete(deleteIds);
      console.log(`[CloudSync] Cleaned up ${deleteIds.length} old backups`);
    }

    return backupId;
  } catch (error) {
    console.error("[CloudSync] Failed to create temporary backup:", error);
    throw new Error(
      `Failed to backup current data: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Restore backup data to IndexedDB using atomic transactions
 *
 * Atomic restore process:
 * 1. Start Dexie transaction (read-write mode for all tables)
 * 2. Clear all existing tables (within transaction)
 * 3. Write backup data to tables using bulkAdd (within transaction)
 * 4. If any operation fails, transaction auto-rolls back (all-or-nothing)
 * 5. Update sync metadata on successful commit
 *
 * Why atomic transactions?
 * - Prevents partial restore if any table write fails
 * - Automatic rollback on error (original data preserved by Dexie)
 * - Ensures data consistency across all tables
 * - No cleanup needed if restore fails (Dexie handles it)
 *
 * Rollback behavior:
 * - If bulkAdd() fails (e.g., duplicate key), transaction throws and rolls back
 * - If any table write fails, entire transaction rolls back
 * - Original data is preserved until transaction commits
 *
 * Schema compatibility:
 * - Skips tables that don't exist in current schema (future compatibility)
 * - Allows restore of old backups to newer schema versions
 * - Future migration logic can be added here if needed
 *
 * @param backupData Validated backup data (from validateBackupData)
 * @throws Error if transaction fails (triggers automatic rollback)
 *
 * @example
 * ```typescript
 * const data = JSON.parse(decryptedJson);
 * await restoreData(data); // Atomic all-or-nothing restore
 * ```
 */
export async function restoreData(backupData: BackupData): Promise<void> {
  try {
    const { db } = await import("../db/client");

    console.log(`[CloudSync] Starting nuclear restore (wipe everything)...`);
    console.log(`[CloudSync] Backup timestamp: ${new Date(backupData.timestamp).toISOString()}`);
    console.log(`[CloudSync] Tables to restore: ${Object.keys(backupData.data).length}`);

    // Log backup user info
    if (Array.isArray(backupData.data.users) && backupData.data.users.length > 0) {
      const backupUser = backupData.data.users[0] as any;
      console.log(`[CloudSync] Restoring user: ${backupUser.id} (${backupUser.name || "Unknown"})`);
    }

    // Use Dexie transaction API for atomic writes
    // All operations succeed or all fail (no partial restore)
    await db.transaction("rw", db.tables, async () => {
      // 1. NUCLEAR OPTION: Clear ALL tables (within transaction)
      console.log(`[CloudSync] Wiping all existing data...`);
      await Promise.all(db.tables.map((table) => table.clear()));

      // 2. Restore ALL tables from backup (within transaction)
      console.log(`[CloudSync] Restoring all tables from backup...`);

      for (const tableName of Object.keys(backupData.data)) {
        const tableData = backupData.data[tableName];

        // Skip if table doesn't exist in current schema (future compatibility)
        const table = (db as any)[tableName];
        if (!table) {
          console.warn(
            `[CloudSync] Table ${tableName} not found in current schema, skipping`
          );
          continue;
        }

        // Write data to table (bulkAdd for performance)
        if (Array.isArray(tableData) && tableData.length > 0) {
          // Convert ISO date strings back to Date objects for Dexie indexes
          const revivedData = tableData.map((record: any) => {
            const revived = { ...record };

            // Common date fields across all tables
            if (revived.createdAt && typeof revived.createdAt === 'string') {
              revived.createdAt = new Date(revived.createdAt);
            }
            if (revived.updatedAt && typeof revived.updatedAt === 'string') {
              revived.updatedAt = new Date(revived.updatedAt);
            }

            // Table-specific date fields
            if (revived.timestamp && typeof revived.timestamp === 'string') {
              revived.timestamp = new Date(revived.timestamp);
            }
            if (revived.completedAt && typeof revived.completedAt === 'string') {
              revived.completedAt = new Date(revived.completedAt);
            }
            if (revived.capturedAt && typeof revived.capturedAt === 'string') {
              revived.capturedAt = new Date(revived.capturedAt);
            }
            if (revived.lastViewedAt && typeof revived.lastViewedAt === 'string') {
              revived.lastViewedAt = new Date(revived.lastViewedAt);
            }

            // CRITICAL FIX: Ensure bodyMapLocations records have layer field set
            // The compound index [userId+layer+createdAt] requires layer to be set
            // Default to 'flares' if missing (backward compatibility)
            if (tableName === 'bodyMapLocations') {
              if (!revived.layer) {
                // Infer layer from markerType if available, otherwise default to 'flares'
                if (revived.markerType === 'pain') {
                  revived.layer = 'pain';
                } else if (revived.markerType === 'inflammation') {
                  revived.layer = 'inflammation';
                } else {
                  // Default to 'flares' for backward compatibility
                  revived.layer = 'flares';
                }
                console.log(`[CloudSync] Set default layer='${revived.layer}' for bodyMapLocation ${revived.id}`);
              }
              // Ensure createdAt is a Date object (required for compound index)
              if (!(revived.createdAt instanceof Date)) {
                revived.createdAt = new Date(revived.createdAt || Date.now());
              }
            }

            return revived;
          });

          // NO userId remapping - restore as-is
          await table.bulkAdd(revivedData);
          console.log(`[CloudSync] Restored ${tableName}: ${revivedData.length} records`);
        } else {
          console.log(`[CloudSync] Skipped ${tableName}: no data`);
        }
      }

      console.log(`[CloudSync] All tables restored successfully`);
    });

    // Transaction committed automatically (no errors thrown)
    console.log(`[CloudSync] Nuclear restore committed`);
  } catch (error) {
    // Transaction automatically rolled back by Dexie
    console.error("[CloudSync] Restore transaction failed (auto-rollback):", error);
    throw new Error(
      `Failed to restore data: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Update sync metadata with restore information
 *
 * Stores restore attempt metadata locally:
 * - Last restore timestamp (Date.now() when restore completed)
 * - Success status (true if restore succeeded, false if failed)
 * - Restored blob size (size of backup)
 * - Storage key hash (first 8 chars for display)
 * - Error message (for failed attempts)
 *
 * Metadata is stored in `syncMetadata` table (same as upload metadata).
 * Keeps separate fields for upload vs restore (allows UI to show both).
 *
 * @param success True if restore succeeded, false if failed
 * @param blobSize Size of restored backup (0 if failed)
 * @param storageKeyHash First 8 chars of storage key (empty if failed)
 * @param errorMessage User-friendly error if restore failed
 */
export async function saveRestoreMetadata(
  success: boolean,
  blobSize: number,
  storageKeyHash: string,
  errorMessage?: string
): Promise<void> {
  try {
    const { db } = await import("../db/client");

    // Get existing metadata (if any)
    const existing = await db.syncMetadata.get("primary");

    // Merge with restore fields (preserve upload fields)
    await db.syncMetadata.put({
      id: "primary",
      // Preserve upload fields (from Story 7.2)
      lastSyncTimestamp: existing?.lastSyncTimestamp || 0,
      lastSyncSuccess: existing?.lastSyncSuccess || false,
      blobSizeBytes: existing?.blobSizeBytes || 0,
      storageKeyHash: existing?.storageKeyHash || "",
      errorMessage: existing?.errorMessage,
      // Update restore fields (NEW for Story 7.3)
      lastRestoreTimestamp: Date.now(),
      lastRestoreSuccess: success,
      restoredBlobSize: blobSize,
      restoredStorageKeyHash: storageKeyHash,
      restoreErrorMessage: errorMessage,
    });

    console.log(`[CloudSync] Restore metadata saved (success: ${success})`);
  } catch (error) {
    console.error("[CloudSync] Failed to save restore metadata:", error);
    // Don't throw - metadata save failure shouldn't block restore
  }
}

/**
 * Rollback restore by restoring data from temporary backup
 *
 * Manual rollback mechanism (used if Dexie auto-rollback fails):
 * 1. Retrieve temporary backup by ID
 * 2. Parse backup JSON
 * 3. Clear all tables and write backup data (atomic transaction)
 * 4. Clean up temporary backup after successful rollback
 *
 * When rollback is needed:
 * - If restore transaction fails (Dexie auto-rollback usually handles this)
 * - If restore partially succeeds but app state is corrupted (rare)
 * - If user requests manual rollback after restore
 *
 * Worst-case scenario:
 * If rollback fails, temporary backup still exists in separate database.
 * User can manually export and restore from temporary backup database.
 *
 * @param backupId Backup ID from backupCurrentData function
 * @throws Error if rollback fails
 *
 * @example
 * ```typescript
 * const backupId = await backupCurrentData();
 * try {
 *   await restoreData(backupData);
 * } catch (error) {
 *   await rollbackRestore(backupId); // Restore original data
 * }
 * ```
 */
export async function rollbackRestore(backupId: string): Promise<void> {
  try {
    console.log(`[CloudSync] Rolling back restore using backup: ${backupId}`);

    // 1. Retrieve temporary backup
    const Dexie = (await import("dexie")).default;
    const backupDb = new Dexie("symptom-tracker-temp-backups");
    backupDb.version(1).stores({
      backups: "id, timestamp, data",
    });

    const backup = await backupDb.table("backups").get(backupId);

    if (!backup) {
      throw new Error(`Backup not found: ${backupId}`);
    }

    console.log(`[CloudSync] Found backup: ${backupId}`);

    // 2. Parse backup JSON
    const backupData = JSON.parse(backup.data);

    // 3. Validate backup structure
    const validation = validateBackupData(backupData);
    if (!validation.valid) {
      throw new Error(`Backup validation failed: ${validation.error}`);
    }

    // 4. Restore data using atomic transaction (same as restoreData)
    await restoreData(backupData);

    // 5. Clean up temporary backup after successful rollback
    await backupDb.table("backups").delete(backupId);

    console.log(`[CloudSync] Rollback successful, original data restored`);
  } catch (error) {
    console.error("[CloudSync] Rollback failed:", error);
    throw new Error(
      `Failed to rollback restore: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Map restore error codes to user-friendly messages
 *
 * Converts technical error codes into actionable messages:
 * - WRONG_PASSPHRASE: Decryption failed (most common)
 * - BLOB_NOT_FOUND: No backup found (wrong passphrase or no backup)
 * - MALFORMED_BLOB: Blob corrupted (size too small)
 * - VALIDATION_FAILED: Backup format incompatible
 * - RATE_LIMIT: Too many downloads (wait X minutes)
 * - SERVICE_UNAVAILABLE: Cloud storage temporarily down
 * - NETWORK_ERROR: Connection problem
 *
 * @param error Error thrown by restore functions
 * @returns User-friendly error message
 */
export function mapRestoreError(error: Error): string {
  const errorMessage = error.message;
  const errorCode = errorMessage.split(":")[0];

  switch (errorCode) {
    case "WRONG_PASSPHRASE":
      return "Restore failed: Wrong passphrase. Please check and try again.";

    case "BLOB_NOT_FOUND":
      return "Restore failed: No backup found. Check your passphrase or create a backup on another device.";

    case "MALFORMED_BLOB":
      return "Restore failed: Backup data is corrupted. Try a different backup or contact support.";

    case "VALIDATION_FAILED":
      return "Restore failed: Backup format is incompatible with this app version.";

    case "RATE_LIMIT":
      const waitTime = errorMessage.split(":")[1] || "60";
      const minutes = Math.ceil(parseInt(waitTime) / 60);
      return `Restore failed: Too many downloads. Please wait ${minutes} minutes and try again.`;

    case "SERVICE_UNAVAILABLE":
      return "Restore failed: Cloud storage temporarily unavailable. Try again in a few minutes.";

    case "NETWORK_ERROR":
      return "Restore failed: Network error. Check your internet connection and try again.";

    default:
      return "Restore failed: An unexpected error occurred. Please try again or contact support.";
  }
}

/**
 * Restore backup from cloud storage
 *
 * Orchestrates complete restore flow with progress tracking:
 * 1. Download encrypted blob from cloud (0-30%)
 * 2. Decrypt with passphrase (30-60%)
 * 3. Validate backup structure (60-70%)
 * 4. Backup current data (70-80%)
 * 5. Restore data to IndexedDB (80-100%)
 * 6. Save restore metadata
 *
 * Progress stages:
 * - download: Fetching encrypted blob from Vercel Blob Storage
 * - decrypt: PBKDF2 key derivation + AES-GCM decryption
 * - restore: Atomic transaction writing to IndexedDB
 *
 * Error handling:
 * - All errors are caught and mapped to user-friendly messages
 * - Failed restore metadata is saved for debugging
 * - Dexie transaction auto-rollback preserves original data
 * - Temporary backup created before restore enables manual rollback
 *
 * @param passphrase User's passphrase (same as used for backup)
 * @param onProgress Callback for progress updates (optional)
 * @throws Error with user-friendly message if any step fails
 *
 * @example
 * ```typescript
 * await restoreBackup("my-secure-passphrase", (progress) => {
 *   console.log(`${progress.stage}: ${progress.percent}% - ${progress.message}`);
 * });
 * ```
 */
export async function restoreBackup(
  passphrase: string,
  onProgress?: ProgressCallback
): Promise<void> {
  let backupId: string | null = null;

  try {
    // Stage 1: Download encrypted blob from cloud (0-30%)
    onProgress?.({
      stage: "download",
      percent: 0,
      message: "Downloading backup from cloud...",
    });

    const storageKey = await deriveStorageKey(passphrase);
    const encryptedBlob = await downloadBackup(storageKey);

    onProgress?.({
      stage: "download",
      percent: 30,
      message: "Download complete",
    });

    // Stage 2: Decrypt blob with passphrase (30-60%)
    onProgress?.({
      stage: "decrypt",
      percent: 30,
      message: "Decrypting backup with your passphrase...",
    });

    const decryptedJson = await decryptData(encryptedBlob, passphrase);
    const backupData = JSON.parse(decryptedJson) as BackupData;

    onProgress?.({
      stage: "decrypt",
      percent: 50,
      message: "Decryption complete",
    });

    // Stage 3: Validate backup structure (50-60%)
    onProgress?.({
      stage: "decrypt",
      percent: 50,
      message: "Validating backup data...",
    });

    const validation = validateBackupData(backupData);
    if (!validation.valid) {
      throw new Error(`VALIDATION_FAILED: ${validation.error}`);
    }

    onProgress?.({
      stage: "decrypt",
      percent: 60,
      message: "Validation complete",
    });

    // Stage 4: Backup current data before restore (60-70%)
    onProgress?.({
      stage: "restore",
      percent: 60,
      message: "Backing up current data...",
    });

    backupId = await backupCurrentData();

    onProgress?.({
      stage: "restore",
      percent: 70,
      message: "Current data backed up",
    });

    // Stage 5: Restore data to IndexedDB (70-100%)
    onProgress?.({
      stage: "restore",
      percent: 70,
      message: "Restoring data to IndexedDB...",
    });

    await restoreData(backupData);

    onProgress?.({
      stage: "restore",
      percent: 100,
      message: "Restore complete!",
    });

    // Stage 6: Save restore metadata
    await saveRestoreMetadata(
      true, // success
      encryptedBlob.byteLength,
      storageKey.substring(0, 8),
      undefined // no error
    );

    // Stage 7: Set currentUserId from restored user
    const { userRepository } = await import("../repositories/userRepository");
    const restoredUser = await userRepository.getCurrentUser();
    if (restoredUser && typeof window !== "undefined") {
      window.localStorage.setItem("pocket:currentUserId", restoredUser.id);
      console.log(`[CloudSync] Set currentUserId to restored user: ${restoredUser.id}`);
    }

    console.log("[CloudSync] Restore completed successfully");
  } catch (error) {
    console.error("[CloudSync] Restore failed:", error);

    // Map error to user-friendly message
    const errorMessage =
      error instanceof Error ? mapRestoreError(error) : "Unknown error";

    // Save failed restore metadata
    await saveRestoreMetadata(
      false, // failed
      0,
      "",
      errorMessage
    );

    // If restore started but failed, rollback may be needed
    // Note: Dexie transaction auto-rollback handles most cases
    // Manual rollback only needed if transaction committed but app state corrupted
    if (backupId) {
      console.warn(
        `[CloudSync] Restore failed, temporary backup available: ${backupId}`
      );
      // Don't auto-rollback here - Dexie transaction handles it
      // Manual rollback can be triggered by UI if needed
    }

    throw new Error(errorMessage);
  }
}
