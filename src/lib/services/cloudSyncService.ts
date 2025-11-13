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
 * Download encrypted blob from cloud storage via edge function
 *
 * Retrieves encrypted backup from `/api/sync/download` edge function:
 * - Derives storage key from passphrase (same as upload)
 * - Sends GET request with storage key as query parameter
 * - Handles various HTTP error codes
 * - Returns encrypted blob as ArrayBuffer
 *
 * Edge function API contract (from Story 7.1):
 * - Endpoint: GET /api/sync/download?storageKey={storageKeyHex}
 * - Response: Encrypted blob (ArrayBuffer) with headers: Content-Length, Last-Modified
 * - Rate limit: 5 downloads per minute per storage key
 *
 * HTTP status codes:
 * - 200: Success - backup found and returned
 * - 404: Blob not found (wrong passphrase or no backup exists)
 * - 429: Rate limit exceeded (too many downloads)
 * - 503: Service unavailable (Vercel Blob Storage down)
 *
 * @param storageKey Storage key derived from passphrase (from deriveStorageKey function)
 * @returns Encrypted blob as ArrayBuffer (salt + IV + ciphertext + auth tag)
 * @throws Error with user-friendly message for each failure type
 *
 * @example
 * ```typescript
 * const storageKey = await deriveStorageKey(passphrase);
 * const encryptedBlob = await downloadBackup(storageKey);
 * console.log(`Downloaded ${encryptedBlob.byteLength} bytes`);
 * ```
 */
export async function downloadBackup(storageKey: string): Promise<ArrayBuffer> {
  if (!storageKey || storageKey.length !== 64) {
    throw new Error("Invalid storage key (must be 64-character hex string)");
  }

  try {
    // Construct download URL with storage key as query parameter
    const url = `/api/sync/download?storageKey=${encodeURIComponent(storageKey)}`;

    console.log(`[CloudSync] Downloading backup from ${url}...`);

    // Send GET request to edge function
    const response = await fetch(url, {
      method: "GET",
    });

    // Parse response headers
    const contentLength = response.headers.get("Content-Length");
    const lastModified = response.headers.get("Last-Modified");

    if (contentLength) {
      console.log(`[CloudSync] Backup size: ${contentLength} bytes`);
    }
    if (lastModified) {
      console.log(`[CloudSync] Last modified: ${lastModified}`);
    }

    // Handle HTTP errors
    if (!response.ok) {
      // Map HTTP status codes to user-friendly errors
      if (response.status === 404) {
        throw new Error("BLOB_NOT_FOUND"); // No backup found for this passphrase
      } else if (response.status === 429) {
        // Rate limit exceeded - parse Retry-After header
        const retryAfter = response.headers.get("Retry-After") || "60";
        throw new Error(`RATE_LIMIT:${retryAfter}`); // Too many downloads
      } else if (response.status === 503) {
        throw new Error("SERVICE_UNAVAILABLE"); // Vercel Blob Storage down
      } else {
        throw new Error("DOWNLOAD_FAILED"); // Generic download failure
      }
    }

    // Read response body as ArrayBuffer
    const encryptedBlob = await response.arrayBuffer();

    console.log(`[CloudSync] Download successful: ${encryptedBlob.byteLength} bytes`);

    return encryptedBlob;
  } catch (error) {
    // Re-throw structured errors (BLOB_NOT_FOUND, RATE_LIMIT, etc.)
    if (error instanceof Error && error.message.includes(":")) {
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
 * Extract metadata (salt, IV, ciphertext) from encrypted blob
 *
 * Encrypted blob structure (from Story 7.2):
 * - Bytes 0-15: Salt (16 bytes) - for PBKDF2 key derivation
 * - Bytes 16-27: IV (12 bytes) - for AES-GCM decryption
 * - Bytes 28+: Ciphertext + Auth Tag - encrypted JSON data
 *
 * This function extracts these components for decryption.
 *
 * @param encryptedBlob Encrypted blob from downloadBackup (ArrayBuffer)
 * @returns Object containing salt, IV, and ciphertext as Uint8Array
 * @throws Error if blob is too small (less than 28 bytes)
 *
 * @example
 * ```typescript
 * const { salt, iv, ciphertext } = extractMetadata(encryptedBlob);
 * // Use salt for key derivation, IV and ciphertext for decryption
 * ```
 */
export function extractMetadata(
  encryptedBlob: ArrayBuffer
): { salt: Uint8Array; iv: Uint8Array; ciphertext: Uint8Array } {
  // Validate minimum size (salt 16 + IV 12 = 28 bytes minimum)
  if (encryptedBlob.byteLength < 28) {
    throw new Error("MALFORMED_BLOB: Blob too small (minimum 28 bytes)");
  }

  // Extract salt (bytes 0-15)
  const salt = new Uint8Array(encryptedBlob, 0, 16);

  // Extract IV (bytes 16-27)
  const iv = new Uint8Array(encryptedBlob, 16, 12);

  // Extract ciphertext (bytes 28+)
  const ciphertext = new Uint8Array(encryptedBlob, 28);

  return { salt, iv, ciphertext };
}

/**
 * Decrypt encrypted blob using AES-256-GCM with passphrase-derived key
 *
 * Decryption process:
 * 1. Extract salt, IV, ciphertext from encrypted blob
 * 2. Derive decryption key from passphrase using PBKDF2 + extracted salt
 * 3. Decrypt ciphertext using AES-GCM (validates auth tag automatically)
 * 4. Decode UTF-8 plaintext to JSON string
 *
 * Security guarantees:
 * - AES-GCM validates authentication tag automatically (prevents tampering)
 * - Wrong passphrase → wrong key → auth tag validation fails → throws error
 * - Corrupted blob → auth tag validation fails → throws error
 *
 * @param encryptedBlob Encrypted blob from downloadBackup (ArrayBuffer)
 * @param passphrase User's passphrase (must match passphrase used during encryption)
 * @returns Decrypted JSON string
 * @throws Error if decryption fails (wrong passphrase, corrupted blob, etc.)
 *
 * @example
 * ```typescript
 * const encryptedBlob = await downloadBackup(storageKey);
 * const decryptedJson = await decryptData(encryptedBlob, passphrase);
 * const backupData = JSON.parse(decryptedJson);
 * ```
 */
export async function decryptData(
  encryptedBlob: ArrayBuffer,
  passphrase: string
): Promise<string> {
  if (!encryptedBlob || encryptedBlob.byteLength === 0) {
    throw new Error("Cannot decrypt empty blob");
  }

  if (!passphrase || passphrase.length === 0) {
    throw new Error("Passphrase cannot be empty");
  }

  if (!crypto?.subtle) {
    throw new Error("Web Crypto API not available");
  }

  try {
    // 1. Extract salt, IV, ciphertext from blob
    const { salt, iv, ciphertext } = extractMetadata(encryptedBlob);

    // 2. Derive decryption key using passphrase + extracted salt
    // CRITICAL: Must use extracted salt (not a new random salt) to derive same key as encryption
    const key = await deriveEncryptionKey(passphrase, salt);

    // 3. Decrypt ciphertext using AES-GCM
    // AES-GCM validates auth tag automatically - throws if invalid
    const plaintext = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      ciphertext
    );

    // 4. Decode UTF-8 plaintext to JSON string
    const decoder = new TextDecoder();
    const decryptedJson = decoder.decode(plaintext);

    console.log(
      `[CloudSync] Decrypted ${encryptedBlob.byteLength} bytes → ${decryptedJson.length} chars`
    );

    return decryptedJson;
  } catch (error) {
    // AES-GCM throws if auth tag validation fails (wrong passphrase or tampering)
    console.error("[CloudSync] Decryption failed:", error);

    // Check if error is due to wrong passphrase (most common case)
    if (
      error instanceof Error &&
      (error.message.includes("decrypt") ||
        error.message.includes("operation") ||
        error.message.includes("authentication"))
    ) {
      throw new Error(
        "WRONG_PASSPHRASE: Authentication failed - wrong passphrase or corrupted backup"
      );
    }

    throw new Error(
      `DECRYPTION_FAILED: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Backup data structure interface
 */
export interface BackupData {
  version: number;
  timestamp: number;
  schemaVersion: number;
  data: Record<string, unknown[]>;
}

/**
 * Restore metadata interface
 */
export interface RestoreMetadata {
  lastRestoreTimestamp: number;
  lastRestoreSuccess: boolean;
  restoredBlobSize: number;
  restoredStorageKeyHash: string;
  errorMessage?: string;
}

/**
 * Validate backup data structure before restore
 *
 * Ensures backup data is well-formed and compatible before writing to IndexedDB:
 * - Validates required top-level fields (version, timestamp, data)
 * - Checks schema version compatibility (currently only version 1)
 * - Validates table data structure (each table should be an array)
 * - Checks critical tables exist (flares, symptoms, medications, triggers, foods)
 *
 * @param data Parsed JSON backup data
 * @returns Validation result with error message if invalid
 *
 * @example
 * ```typescript
 * const validation = validateBackupData(backupData);
 * if (!validation.valid) {
 *   throw new Error(`VALIDATION_FAILED: ${validation.error}`);
 * }
 * ```
 */
export function validateBackupData(data: any): { valid: boolean; error?: string } {
  // Check required top-level fields
  if (!data.version || typeof data.version !== "number") {
    return { valid: false, error: "Missing or invalid schema version" };
  }

  if (!data.timestamp || typeof data.timestamp !== "number") {
    return { valid: false, error: "Missing or invalid timestamp" };
  }

  if (!data.data || typeof data.data !== "object") {
    return { valid: false, error: "Missing or invalid data object" };
  }

  // Check schema version compatibility (initially only version 1 exists)
  if (data.version !== 1) {
    return {
      valid: false,
      error: `Unsupported schema version: ${data.version}. Only version 1 is supported.`,
    };
  }

  // Validate critical tables exist and are arrays
  const criticalTables = [
    "flares",
    "symptoms",
    "medications",
    "triggers",
    "foods",
    "users",
  ];

  for (const tableName of criticalTables) {
    if (!Array.isArray(data.data[tableName])) {
      return {
        valid: false,
        error: `Missing or invalid table: ${tableName} (must be an array)`,
      };
    }
  }

  // Validate all tables are arrays (non-critical tables)
  for (const [tableName, tableData] of Object.entries(data.data)) {
    if (!Array.isArray(tableData)) {
      console.warn(
        `[CloudSync] Table ${tableName} is not an array, skipping validation`
      );
    }
  }

  return { valid: true };
}

/**
 * Create backup of current IndexedDB data before restore
 *
 * Exports current data to temporary storage to enable rollback if restore fails.
 * Uses separate IndexedDB database for temporary backups to avoid overwriting production data.
 *
 * @returns Backup ID (timestamp-based identifier)
 * @throws Error if backup creation fails
 *
 * @example
 * ```typescript
 * const backupId = await backupCurrentData();
 * console.log(`Current data backed up: ${backupId}`);
 * ```
 */
export async function backupCurrentData(): Promise<string> {
  try {
    // Export current data using existing export function
    const jsonData = await exportAllData();

    // Create backup ID with timestamp
    const backupId = `backup-${Date.now()}`;

    // Use localStorage for temporary backup (simpler than separate IndexedDB)
    // Warn if backup is large (>5MB localStorage limit)
    const sizeInMB = new Blob([jsonData]).size / (1024 * 1024);
    if (sizeInMB > 5) {
      console.warn(
        `[CloudSync] Backup is large (${sizeInMB.toFixed(2)} MB) - may exceed localStorage limit`
      );
    }

    // Store backup in localStorage with timestamp prefix
    localStorage.setItem(`cloudSync_backup_${backupId}`, jsonData);

    // Clean up old backups (keep last 3)
    const backupKeys = Object.keys(localStorage)
      .filter((key) => key.startsWith("cloudSync_backup_backup-"))
      .sort()
      .reverse(); // Most recent first

    if (backupKeys.length > 3) {
      const toDelete = backupKeys.slice(3); // Keep first 3, delete rest
      for (const key of toDelete) {
        localStorage.removeItem(key);
        console.log(`[CloudSync] Cleaned up old backup: ${key}`);
      }
    }

    console.log(`[CloudSync] Current data backed up: ${backupId} (${sizeInMB.toFixed(2)} MB)`);

    return backupId;
  } catch (error) {
    console.error("[CloudSync] Failed to backup current data:", error);
    throw new Error(
      `Failed to backup current data: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Restore backup data to IndexedDB using atomic transactions
 *
 * Restores validated backup data with all-or-nothing guarantee:
 * - Clears all existing tables (within transaction)
 * - Writes backup data to tables (within transaction)
 * - Auto-rolls back if any write fails (Dexie transaction behavior)
 * - Updates sync metadata after successful restore
 *
 * @param backupData Validated backup data (from validateBackupData)
 * @throws Error if restore fails (transaction auto-rolls back)
 *
 * @example
 * ```typescript
 * const validation = validateBackupData(backupData);
 * if (validation.valid) {
 *   await restoreData(backupData);
 * }
 * ```
 */
export async function restoreData(backupData: BackupData): Promise<void> {
  try {
    const { db } = await import("../db/client");

    // Use Dexie transaction API for atomic writes (all-or-nothing)
    await db.transaction("rw", db.tables, async () => {
      // 1. Clear all existing tables (within transaction)
      console.log("[CloudSync] Clearing existing tables...");
      await Promise.all(db.tables.map((table) => table.clear()));

      // 2. Restore each table from backup (within transaction)
      console.log("[CloudSync] Restoring tables from backup...");
      for (const [tableName, tableData] of Object.entries(backupData.data)) {
        // Skip if table doesn't exist in current schema (future compatibility)
        if (!db[tableName as keyof typeof db]) {
          console.warn(
            `[CloudSync] Table ${tableName} not found in current schema, skipping`
          );
          continue;
        }

        const table = db[tableName as keyof typeof db] as any;

        // Write data to table (bulkAdd for performance)
        if (Array.isArray(tableData) && tableData.length > 0) {
          await table.bulkAdd(tableData);
          console.log(`[CloudSync] Restored ${tableName}: ${tableData.length} records`);
        }
      }
    });

    // Transaction committed automatically if no errors thrown
    // If any error occurs, Dexie automatically rolls back (original data preserved)
    console.log("[CloudSync] Restore completed successfully");
  } catch (error) {
    console.error("[CloudSync] Restore failed:", error);
    // Transaction auto-rolls back on error
    throw new Error(
      `Failed to restore data: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Save restore metadata to IndexedDB
 *
 * Stores restore attempt metadata in syncMetadata table:
 * - Last restore timestamp (success or failure)
 * - Restore success status
 * - Restored blob size
 * - Storage key hash (first 8 chars for display)
 * - Error message (for failed attempts)
 *
 * Merges with existing upload metadata (keeps separate fields for upload vs restore).
 *
 * @param metadata Restore metadata to store
 * @throws Error if IndexedDB write fails
 */
export async function saveRestoreMetadata(
  metadata: RestoreMetadata
): Promise<void> {
  try {
    const { db } = await import("../db/client");

    if (!db.syncMetadata) {
      console.warn(
        "[CloudSync] syncMetadata table not found - skipping metadata save"
      );
      return;
    }

    // Get existing metadata (if any) to merge upload fields
    const existing = await db.syncMetadata.get("primary");

    // Upsert metadata (merge with existing upload metadata)
    await db.syncMetadata.put({
      id: "primary",
      // Preserve upload fields if they exist
      lastSyncTimestamp: existing?.lastSyncTimestamp || metadata.lastRestoreTimestamp,
      lastSyncSuccess: existing?.lastSyncSuccess || false,
      blobSizeBytes: existing?.blobSizeBytes || 0,
      storageKeyHash: existing?.storageKeyHash || "",
      errorMessage: existing?.errorMessage,
      // Add restore-specific fields
      lastRestoreTimestamp: metadata.lastRestoreTimestamp,
      lastRestoreSuccess: metadata.lastRestoreSuccess,
      restoredBlobSize: metadata.restoredBlobSize,
      restoredStorageKeyHash: metadata.restoredStorageKeyHash,
      // Override error message if restore failed
      ...(metadata.errorMessage && { errorMessage: metadata.errorMessage }),
    } as any);

    console.log("[CloudSync] Restore metadata saved");
  } catch (error) {
    console.error("[CloudSync] Failed to save restore metadata:", error);
    throw new Error(
      `Failed to save restore metadata: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Map restore error codes to user-friendly messages
 *
 * Converts technical error codes into actionable messages:
 * - WRONG_PASSPHRASE: Wrong passphrase entered
 * - BLOB_NOT_FOUND: No backup found for this passphrase
 * - MALFORMED_BLOB: Blob structure invalid
 * - VALIDATION_FAILED: Backup data structure invalid
 * - RATE_LIMIT: Too many downloads (wait X minutes)
 * - SERVICE_UNAVAILABLE: Cloud storage temporarily down
 * - NETWORK_ERROR: Connection problem
 *
 * @param error Error thrown by restore functions
 * @returns User-friendly error message
 */
export function mapRestoreError(error: Error): string {
  const errorCode = error.message.split(":")[0];

  if (errorCode === "WRONG_PASSPHRASE") {
    return "Restore failed: Wrong passphrase. Please check and try again.";
  } else if (errorCode === "BLOB_NOT_FOUND") {
    return "Restore failed: No backup found. Check your passphrase or create a new backup on another device.";
  } else if (errorCode === "MALFORMED_BLOB" || errorCode === "VALIDATION_FAILED") {
    return "Restore failed: Backup data is corrupted or incompatible. Try a different backup or contact support.";
  } else if (errorCode.startsWith("RATE_LIMIT")) {
    const waitTime = error.message.split(":")[1] || "60";
    const minutes = Math.ceil(parseInt(waitTime) / 60);
    return `Restore failed: Too many downloads. Please wait ${minutes} minutes and try again.`;
  } else if (errorCode === "SERVICE_UNAVAILABLE") {
    return "Restore failed: Cloud storage temporarily unavailable. Try again in a few minutes.";
  } else if (errorCode.startsWith("NETWORK_ERROR")) {
    return "Restore failed: Network error. Check your internet connection and try again.";
  } else {
    return "Restore failed: An unexpected error occurred. Please try again or contact support.";
  }
}

/**
 * Rollback restore by restoring from temporary backup
 *
 * Restores original data from temporary backup created before restore attempt.
 * Uses same atomic transaction logic as restoreData to ensure all-or-nothing rollback.
 *
 * @param backupId Backup ID returned from backupCurrentData
 * @throws Error if rollback fails
 */
export async function rollbackRestore(backupId: string): Promise<void> {
  try {
    // Retrieve temporary backup from localStorage
    const backupKey = `cloudSync_backup_${backupId}`;
    const backupJson = localStorage.getItem(backupKey);

    if (!backupJson) {
      throw new Error(`Backup not found: ${backupId}`);
    }

    // Parse backup JSON
    const backupData = JSON.parse(backupJson);

    // Validate backup data
    const validation = validateBackupData(backupData);
    if (!validation.valid) {
      throw new Error(`Backup validation failed: ${validation.error}`);
    }

    // Restore from backup using atomic transaction (same logic as restoreData)
    await restoreData(backupData);

    console.log(`[CloudSync] Rollback completed: ${backupId}`);
  } catch (error) {
    console.error("[CloudSync] Rollback failed:", error);
    throw new Error(
      `Failed to rollback restore: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Restore backup from cloud storage
 *
 * Orchestrates complete restore flow with progress tracking:
 * 1. Download encrypted blob from cloud (0-30%)
 * 2. Decrypt with passphrase (30-60%)
 * 3. Validate backup data structure
 * 4. Backup current data
 * 5. Restore to IndexedDB (60-100%)
 * 6. Save restore metadata
 *
 * Progress stages:
 * - download: Fetching encrypted blob from cloud
 * - decrypt: PBKDF2 key derivation + AES-GCM decryption
 * - restore: Writing data to IndexedDB
 *
 * @param passphrase User's passphrase (must match passphrase used during backup)
 * @param onProgress Callback for progress updates (optional)
 * @throws Error if any step fails (with user-friendly message)
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
    const backupData = JSON.parse(decryptedJson);

    // Validate backup data structure
    const validation = validateBackupData(backupData);
    if (!validation.valid) {
      throw new Error(`VALIDATION_FAILED: ${validation.error}`);
    }

    onProgress?.({
      stage: "decrypt",
      percent: 60,
      message: "Decryption complete",
    });

    // Stage 3: Backup current data, then restore (60-100%)
    onProgress?.({
      stage: "restore",
      percent: 60,
      message: "Backing up current data...",
    });

    backupId = await backupCurrentData();

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

    // Store restore metadata
    await saveRestoreMetadata({
      lastRestoreTimestamp: Date.now(),
      lastRestoreSuccess: true,
      restoredBlobSize: encryptedBlob.byteLength,
      restoredStorageKeyHash: storageKey.substring(0, 8),
    });

    console.log("[CloudSync] Restore completed successfully");
  } catch (error) {
    console.error("[CloudSync] Restore failed:", error);

    // Store failed metadata
    const errorMessage =
      error instanceof Error ? mapRestoreError(error) : "Unknown error";

    await saveRestoreMetadata({
      lastRestoreTimestamp: Date.now(),
      lastRestoreSuccess: false,
      restoredBlobSize: 0,
      restoredStorageKeyHash: "",
      errorMessage,
    });

    // If restore transaction failed, Dexie auto-rolls back (original data preserved)
    // If rollback is needed, attempt to restore from temporary backup
    if (backupId) {
      try {
        await rollbackRestore(backupId);
        console.log("[CloudSync] Rollback successful - original data preserved");
      } catch (rollbackError) {
        console.error("[CloudSync] Rollback failed:", rollbackError);
        // Worst case: user can manually restore from localStorage backup
      }
    }

    throw new Error(errorMessage);
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
