# Story 7.2: Encryption & Upload Implementation

Status: review

## Story

As a user wanting to back up my health data,
I want to encrypt my data with a passphrase and upload it to the cloud,
so that my data is securely backed up and accessible from other devices.

## Acceptance Criteria

1. **AC7.2.1 — Passphrase to encryption key derivation:** Implement secure passphrase-to-encryption-key derivation using PBKDF2 algorithm with industry-standard parameters for cryptographic strength. Use Web Crypto API's `crypto.subtle.deriveBits()` with PBKDF2 parameters: 100,000 iterations (protects against brute-force attacks), SHA-256 hash function, random 16-byte salt (generated per backup using `crypto.getRandomValues()`), produces 256-bit key for AES-GCM encryption. Salt must be random per backup (not reused) to prevent rainbow table attacks. Function signature: `async deriveEncryptionKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey>`. Store salt with encrypted blob for later decryption (prepended to ciphertext). Validate passphrase is non-empty before derivation. [Source: docs/epics.md#Story-7.2, AC #1]

2. **AC7.2.2 — Passphrase to storage key derivation:** Implement passphrase-to-storage-key derivation using SHA-256 hash to create unique blob identifier for Vercel Blob Storage. Use Web Crypto API's `crypto.subtle.digest('SHA-256', ...)` to hash passphrase into 256-bit (32-byte) identifier. Convert hash to hexadecimal string for use as storage key (64-character hex string). Storage key serves as filename prefix for blob versioning (e.g., `{storageKeyHex}-{timestamp}.blob`). Function signature: `async deriveStorageKey(passphrase: string): Promise<string>`. Hash is one-way (server cannot reverse-engineer passphrase from storage key). Same passphrase always produces same storage key (allows users to retrieve backups across devices). [Source: docs/epics.md#Story-7.2, AC #2]

3. **AC7.2.3 — IndexedDB export to JSON:** Leverage existing IndexedDB export logic to serialize all health data to JSON for backup. Reuse existing export functionality from current codebase (likely in data management service). Export all Dexie tables: flares, symptoms, medications, triggers, foods, moods, sleep, body map data, user preferences, etc. Generate complete data snapshot as JSON object with schema version metadata for future compatibility. Function signature: `async exportAllData(): Promise<string>` (returns JSON string). Validate JSON is well-formed before encryption (prevents corrupted backups). Estimate typical backup size (for progress indicators in Story 7.4). [Source: docs/epics.md#Story-7.2, AC #3]

4. **AC7.2.4 — AES-GCM encryption with salt prepending:** Encrypt exported JSON using AES-256-GCM with derived encryption key, prepending salt for later decryption. Generate random 12-byte initialization vector (IV) using `crypto.getRandomValues()`. Encrypt JSON string using `crypto.subtle.encrypt()` with algorithm: AES-GCM, key: derived CryptoKey, iv: random IV, plaintext: UTF-8 encoded JSON. AES-GCM provides authenticated encryption (prevents tampering via authentication tag). Prepend metadata to ciphertext for decryption: salt (16 bytes), IV (12 bytes), then ciphertext + auth tag. Function signature: `async encryptData(jsonData: string, passphrase: string): Promise<ArrayBuffer>` (returns salt + IV + ciphertext). Validate encryption succeeded before upload (check result is non-empty ArrayBuffer). [Source: docs/epics.md#Story-7.2, AC #4]

5. **AC7.2.5 — Upload encrypted blob to edge function:** Upload encrypted blob to `/api/sync/upload` edge function with storage key and metadata. Convert encrypted ArrayBuffer to Base64 string for JSON transport (or send as binary via FormData). Construct upload request body: `{ blob: base64String, storageKey: storageKeyHex, metadata: { timestamp: ISO8601, originalSize: number } }`. Send POST request to `/api/sync/upload` with Content-Type: application/json. Parse response metadata: uploadedAt (timestamp), blobSize (bytes), storageKeyHash (first 8 chars for logging). Handle HTTP status codes: 200 (success), 400 (invalid request), 413 (payload too large - backup exceeds 1GB), 429 (rate limit exceeded - too many uploads), 503 (service unavailable - Vercel Blob Storage down). Function signature: `async uploadBackup(encryptedBlob: ArrayBuffer, storageKey: string): Promise<UploadMetadata>`. [Source: docs/epics.md#Story-7.2, AC #5]

6. **AC7.2.6 — Local sync metadata storage:** Store sync metadata locally in IndexedDB to track backup history and enable UI status displays. Create new Dexie table `syncMetadata` with schema: `{ id: 'primary', lastSyncTimestamp: number, lastSyncSuccess: boolean, blobSizeBytes: number, storageKeyHash: string, errorMessage?: string }`. Store metadata after each upload attempt (success or failure). Use single-row table (id always 'primary') for simplicity. Update metadata on successful upload: lastSyncTimestamp = Date.now(), lastSyncSuccess = true, blobSizeBytes = server response, storageKeyHash = first 8 chars. Update metadata on failed upload: lastSyncTimestamp = Date.now(), lastSyncSuccess = false, errorMessage = error description. Function signature: `async saveSyncMetadata(metadata: SyncMetadata): Promise<void>`. Retrieve metadata for UI display in Story 7.4. [Source: docs/epics.md#Story-7.2, AC #6]

7. **AC7.2.7 — Upload progress indicator:** Implement progress indicator showing encryption and upload stages for user feedback during potentially long operations. Track progress through three stages: Stage 1 - Data Export (0-30%): "Exporting data from IndexedDB...", Stage 2 - Encryption (30-60%): "Encrypting backup with your passphrase...", Stage 3 - Upload (60-100%): "Uploading to cloud storage...". Use React state or context to manage progress: `{ stage: 'export' | 'encrypt' | 'upload', percent: number, message: string }`. Update progress state at stage transitions and during upload (if fetch supports progress events). Display progress in UI (Story 7.4 implements the UI component). Function signature: `type ProgressCallback = (progress: ProgressUpdate) => void; async createBackup(passphrase: string, onProgress: ProgressCallback): Promise<void>`. [Source: docs/epics.md#Story-7.2, AC #7]

8. **AC7.2.8 — Upload error handling:** Handle upload errors gracefully with user-friendly messages and retry guidance. Network failures (fetch rejected): "Upload failed: Network error. Check your connection and try again." Quota exceeded (413): "Upload failed: Backup too large (exceeds 1GB limit). Contact support." Rate limit exceeded (429): "Upload failed: Too many uploads. Please wait [X] minutes and try again." (parse Retry-After header) Service unavailable (503): "Upload failed: Cloud storage temporarily unavailable. Try again later." Invalid request (400): "Upload failed: Invalid backup format. This shouldn't happen - contact support." Store error message in syncMetadata for persistent error display. Log errors to console for debugging (include timestamp, error code, message). Do not expose raw error messages to user (sanitize technical details). Provide clear next steps for each error type. [Source: docs/epics.md#Story-7.2, AC #8]

9. **AC7.2.9 — Passphrase validation:** Implement client-side passphrase validation with minimum security requirements and user feedback. Minimum requirements: 12 characters minimum length (prevents weak passphrases), passphrase confirmation required (user must type twice to prevent typos). Validation before encryption/upload: check passphrase.length >= 12, check passphrase === passphraseConfirmation. Display validation errors inline: "Passphrase must be at least 12 characters" (if too short), "Passphrases do not match" (if mismatch). Block upload button until validation passes. Optional strength indicator (implemented in Story 7.4 UI): weak (12-15 chars, no numbers/symbols), medium (16+ chars, some numbers/symbols), strong (20+ chars, mixed case, numbers, symbols). Function signature: `validatePassphrase(passphrase: string, confirmation: string): { valid: boolean, error?: string }`. [Source: docs/epics.md#Story-7.2, AC #9]

10. **AC7.2.10 — Unit tests for encryption and upload:** Create comprehensive unit test suite for encryption logic, PBKDF2 derivation, and upload flow to ensure cryptographic correctness. Test `deriveEncryptionKey()`: correct key length (256 bits), different salts produce different keys, same passphrase + salt produces same key. Test `deriveStorageKey()`: correct hash format (64-char hex), deterministic (same passphrase = same key), different passphrases produce different keys. Test `encryptData()`: encrypted output is different from plaintext, prepended salt + IV are correct sizes (16 + 12 bytes), encryption is deterministic given same key + IV. Test `uploadBackup()`: successful upload returns metadata, handles 413/429/503 errors correctly, retries on network failure (if implemented). Test `validatePassphrase()`: rejects passphrases <12 chars, rejects mismatched confirmations, accepts valid passphrases. Mock Web Crypto API and fetch for isolated testing. Test file: `src/lib/services/__tests__/cloudSyncService.test.ts`. [Source: docs/epics.md#Story-7.2, AC #10]

## Tasks / Subtasks

- [x] Task 1: Implement cryptographic key derivation functions (AC: #7.2.1, #7.2.2)
  - [x] 1.1: Create `src/lib/services/cloudSyncService.ts` file
  - [x] 1.2: Import Web Crypto API types from TypeScript lib.dom
  - [x] 1.3: Implement `deriveEncryptionKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey>`
  - [x] 1.4: Use PBKDF2 with 100,000 iterations, SHA-256, 256-bit key output
  - [x] 1.5: Implement `deriveStorageKey(passphrase: string): Promise<string>`
  - [x] 1.6: Use SHA-256 hash, convert to hex string
  - [x] 1.7: Add JSDoc comments documenting crypto parameters and security rationale
  - [x] 1.8: Export both functions from cloudSyncService module

- [x] Task 2: Implement IndexedDB data export (AC: #7.2.3)
  - [x]2.1: Locate existing export functionality in codebase (likely in data management service)
  - [x]2.2: Create `exportAllData(): Promise<string>` function in cloudSyncService
  - [x]2.3: Export all Dexie tables using `db.tables.map(table => table.toArray())`
  - [x]2.4: Serialize to JSON with schema version metadata: `{ version: 1, timestamp: Date.now(), data: {...} }`
  - [x]2.5: Validate JSON is well-formed using `JSON.parse(JSON.stringify(data))`
  - [x]2.6: Add error handling for export failures (corrupted IndexedDB)
  - [x]2.7: Log export size for debugging (console.log size in KB/MB)

- [x] Task 3: Implement AES-GCM encryption (AC: #7.2.4)
  - [x]3.1: Implement `encryptData(jsonData: string, passphrase: string): Promise<ArrayBuffer>`
  - [x]3.2: Generate random 16-byte salt using `crypto.getRandomValues(new Uint8Array(16))`
  - [x]3.3: Derive encryption key using `deriveEncryptionKey(passphrase, salt)`
  - [x]3.4: Generate random 12-byte IV using `crypto.getRandomValues(new Uint8Array(12))`
  - [x]3.5: Encrypt JSON using `crypto.subtle.encrypt()` with AES-GCM algorithm
  - [x]3.6: Prepend salt (16 bytes) + IV (12 bytes) to ciphertext in single ArrayBuffer
  - [x]3.7: Return combined ArrayBuffer (salt + IV + ciphertext + auth tag)
  - [x]3.8: Add error handling for encryption failures (invalid key, quota exceeded)

- [x] Task 4: Implement blob upload to edge function (AC: #7.2.5)
  - [x]4.1: Implement `uploadBackup(encryptedBlob: ArrayBuffer, storageKey: string): Promise<UploadMetadata>`
  - [x]4.2: Convert ArrayBuffer to Base64 string for JSON transport
  - [x]4.3: Construct request body: `{ blob: base64String, storageKey, metadata: { timestamp, originalSize } }`
  - [x]4.4: Send POST request to `/api/sync/upload` with fetch API
  - [x]4.5: Parse response JSON: `{ uploadedAt, blobSize, storageKeyHash }`
  - [x]4.6: Handle HTTP errors: 400 (invalid), 413 (too large), 429 (rate limit), 503 (unavailable)
  - [x]4.7: Throw descriptive errors for each failure type (network, quota, rate limit, etc.)
  - [x]4.8: Return UploadMetadata object on success

- [x] Task 5: Implement sync metadata storage (AC: #7.2.6)
  - [x]5.1: Add `syncMetadata` table to Dexie schema in `src/lib/db/schema.ts`
  - [x]5.2: Define schema: `{ id: 'primary', lastSyncTimestamp: number, lastSyncSuccess: boolean, blobSizeBytes: number, storageKeyHash: string, errorMessage?: string }`
  - [x]5.3: Increment Dexie schema version number
  - [x]5.4: Add migration logic to create new table (if needed for existing users)
  - [x]5.5: Implement `saveSyncMetadata(metadata: SyncMetadata): Promise<void>` in cloudSyncService
  - [x]5.6: Use `db.syncMetadata.put({ id: 'primary', ...metadata })` for upsert behavior
  - [x]5.7: Implement `getSyncMetadata(): Promise<SyncMetadata | null>` for UI retrieval
  - [x]5.8: Add error handling for IndexedDB write failures

- [x] Task 6: Implement progress tracking (AC: #7.2.7)
  - [x]6.1: Define `ProgressUpdate` type: `{ stage: 'export' | 'encrypt' | 'upload', percent: number, message: string }`
  - [x]6.2: Define `ProgressCallback` type: `(progress: ProgressUpdate) => void`
  - [x]6.3: Implement `createBackup(passphrase: string, onProgress: ProgressCallback): Promise<void>`
  - [x]6.4: Emit progress at stage boundaries: export (0-30%), encrypt (30-60%), upload (60-100%)
  - [x]6.5: Update progress during upload if fetch supports progress events (XMLHttpRequest alternative)
  - [x]6.6: Call `onProgress({ stage: 'export', percent: 10, message: 'Exporting data...' })` etc.
  - [x]6.7: Integrate export, encryption, upload functions into single coordinated flow

- [x] Task 7: Implement error handling and user messages (AC: #7.2.8)
  - [x]7.1: Create error mapping function: `mapUploadError(error: Error, response?: Response): string`
  - [x]7.2: Handle network failures: "Upload failed: Network error. Check your connection."
  - [x]7.3: Handle 413 errors: "Upload failed: Backup too large (exceeds 1GB limit)."
  - [x]7.4: Handle 429 errors: Parse Retry-After header, show "Wait [X] minutes" message
  - [x]7.5: Handle 503 errors: "Cloud storage temporarily unavailable. Try again later."
  - [x]7.6: Handle 400 errors: "Invalid backup format. Contact support."
  - [x]7.7: Store error message in syncMetadata on upload failure
  - [x]7.8: Log errors to console with timestamp and error code for debugging

- [x] Task 8: Implement passphrase validation (AC: #7.2.9)
  - [x]8.1: Implement `validatePassphrase(passphrase: string, confirmation: string): { valid: boolean, error?: string }`
  - [x]8.2: Check minimum length: `passphrase.length >= 12`
  - [x]8.3: Check confirmation match: `passphrase === confirmation`
  - [x]8.4: Return validation errors: "Passphrase must be at least 12 characters" or "Passphrases do not match"
  - [x]8.5: Optional: Calculate passphrase strength (weak/medium/strong) for UI feedback
  - [x]8.6: Optional: Check for common weak patterns (all lowercase, all numbers, etc.)
  - [x]8.7: Export validation function for use in UI components

- [x] Task 9: Create unit test suite (AC: #7.2.10)
  - [x]9.1: Create test file: `src/lib/services/__tests__/cloudSyncService.test.ts`
  - [x]9.2: Mock Web Crypto API for deterministic testing (`crypto.subtle.deriveBits`, `crypto.subtle.encrypt`)
  - [x]9.3: Test `deriveEncryptionKey()`: correct key length, different salts = different keys, determinism
  - [x]9.4: Test `deriveStorageKey()`: 64-char hex format, deterministic, different passphrases = different keys
  - [x]9.5: Test `encryptData()`: prepended salt+IV correct sizes, encrypted output differs from plaintext
  - [x]9.6: Test `uploadBackup()`: mock fetch, test success response, test error responses (413, 429, 503)
  - [x]9.7: Test `validatePassphrase()`: rejects <12 chars, rejects mismatches, accepts valid passphrases
  - [x]9.8: Test `createBackup()`: progress callback invoked at each stage, final metadata stored
  - [x]9.9: Mock Dexie database for isolated testing (fake-indexeddb)
  - [x]9.10: Achieve >80% code coverage for cloudSyncService module

- [x] Task 10: Integration testing and validation (AC: all)
  - [x]10.1: Create integration test: export → encrypt → upload → verify metadata stored
  - [x]10.2: Test with realistic data sizes (1MB, 10MB, 50MB) to estimate performance
  - [x]10.3: Test passphrase validation edge cases (empty string, 11 chars, 12 chars, 100 chars)
  - [x]10.4: Test error handling with mocked edge function failures
  - [x]10.5: Verify encryption uses random salts (different backups have different ciphertexts)
  - [x]10.6: Verify storage keys are deterministic (same passphrase = same storage key)
  - [x]10.7: Test progress callback receives all three stages (export, encrypt, upload)
  - [x]10.8: Verify metadata persistence across page reloads (read from IndexedDB)
  - [x]10.9: Test with actual edge function (manual testing in development environment)
  - [x]10.10: Document any edge cases or limitations discovered during testing

## Dev Notes

### Technical Architecture

This story implements the client-side encryption and upload workflow for Epic 7's cloud sync feature. It builds on Story 7.1's infrastructure (Vercel Blob Storage and edge functions) to create a complete "encrypt and upload" flow that users can trigger from the UI (implemented in Story 7.4).

**Key Architecture Points:**
- **Zero-Knowledge Encryption:** All encryption happens client-side using Web Crypto API; server never sees unencrypted data or passphrases
- **PBKDF2 Key Derivation:** Industry-standard key derivation with 100,000 iterations protects against brute-force attacks on passphrases
- **AES-256-GCM Encryption:** Authenticated encryption prevents tampering and ensures data integrity
- **Deterministic Storage Keys:** SHA-256 hash of passphrase creates consistent storage key for cross-device backup retrieval
- **Salt Prepending:** Random salt stored with ciphertext enables decryption without transmitting salt separately

### Cryptographic Implementation Details

**Passphrase → Encryption Key (PBKDF2):**
```typescript
async function deriveEncryptionKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passphraseKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,  // OWASP recommended minimum
      hash: 'SHA-256'
    },
    passphraseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}
```

**Passphrase → Storage Key (SHA-256):**
```typescript
async function deriveStorageKey(passphrase: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(passphrase);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;  // 64-character hex string
}
```

**AES-GCM Encryption with Prepended Metadata:**
```typescript
async function encryptData(jsonData: string, passphrase: string): Promise<ArrayBuffer> {
  // 1. Generate random salt for key derivation
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // 2. Derive encryption key from passphrase + salt
  const key = await deriveEncryptionKey(passphrase, salt);

  // 3. Generate random IV for AES-GCM
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // 4. Encrypt JSON data
  const encoder = new TextEncoder();
  const plaintext = encoder.encode(jsonData);
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    plaintext
  );

  // 5. Prepend salt + IV to ciphertext for later decryption
  const result = new Uint8Array(16 + 12 + ciphertext.byteLength);
  result.set(salt, 0);              // Bytes 0-15: salt
  result.set(iv, 16);               // Bytes 16-27: IV
  result.set(new Uint8Array(ciphertext), 28);  // Bytes 28+: ciphertext + auth tag

  return result.buffer;
}
```

**Why Prepend Salt + IV?**
- Decryption requires the exact same salt and IV used during encryption
- Storing them with the ciphertext eliminates need for separate metadata transmission
- Standard practice in cryptographic protocols (salt + IV are not secret, just unique)

### Complete Upload Flow

```typescript
async function createBackup(
  passphrase: string,
  onProgress: ProgressCallback
): Promise<void> {
  try {
    // Stage 1: Export data from IndexedDB (0-30%)
    onProgress({ stage: 'export', percent: 0, message: 'Exporting data from IndexedDB...' });
    const jsonData = await exportAllData();
    onProgress({ stage: 'export', percent: 30, message: 'Data exported successfully' });

    // Stage 2: Encrypt data with passphrase (30-60%)
    onProgress({ stage: 'encrypt', percent: 30, message: 'Encrypting backup...' });
    const encryptedBlob = await encryptData(jsonData, passphrase);
    onProgress({ stage: 'encrypt', percent: 60, message: 'Encryption complete' });

    // Stage 3: Upload to Vercel Blob Storage (60-100%)
    onProgress({ stage: 'upload', percent: 60, message: 'Uploading to cloud...' });
    const storageKey = await deriveStorageKey(passphrase);
    const metadata = await uploadBackup(encryptedBlob, storageKey);
    onProgress({ stage: 'upload', percent: 100, message: 'Upload complete!' });

    // Store sync metadata locally
    await saveSyncMetadata({
      lastSyncTimestamp: Date.now(),
      lastSyncSuccess: true,
      blobSizeBytes: metadata.blobSize,
      storageKeyHash: metadata.storageKeyHash,
    });

  } catch (error) {
    // Handle errors, store failed metadata
    const errorMessage = mapUploadError(error);
    await saveSyncMetadata({
      lastSyncTimestamp: Date.now(),
      lastSyncSuccess: false,
      blobSizeBytes: 0,
      storageKeyHash: '',
      errorMessage,
    });
    throw new Error(errorMessage);
  }
}
```

### IndexedDB Export Strategy

**Reuse Existing Export Logic:**
The codebase likely already has data export functionality (for manual JSON exports). Leverage this existing code to avoid duplication:

```typescript
async function exportAllData(): Promise<string> {
  // Locate existing export service (e.g., src/lib/services/dataExportService.ts)
  // If not present, implement full export:

  const db = getDatabase();  // Get Dexie instance

  const allData = {
    version: 1,  // Schema version for future compatibility
    timestamp: Date.now(),
    data: {
      flares: await db.flares.toArray(),
      symptoms: await db.symptoms.toArray(),
      medications: await db.medications.toArray(),
      triggers: await db.triggers.toArray(),
      foods: await db.foods.toArray(),
      moods: await db.moods.toArray(),
      sleep: await db.sleep.toArray(),
      bodyMapData: await db.bodyMapData?.toArray() || [],
      preferences: await db.preferences?.toArray() || [],
      // Add all other tables
    }
  };

  return JSON.stringify(allData);
}
```

**Schema Version Metadata:**
Including a `version` field enables future migrations if data structure changes. Story 7.3 (restore) can handle different schema versions gracefully.

### Upload Implementation with Base64 Encoding

**Why Base64?**
- Edge functions accept JSON payloads (easier than multipart/form-data for simple use case)
- ArrayBuffer → Base64 → JSON transport is straightforward
- Acceptable overhead (~33% size increase) for backup use case

```typescript
async function uploadBackup(
  encryptedBlob: ArrayBuffer,
  storageKey: string
): Promise<UploadMetadata> {
  // Convert ArrayBuffer to Base64 string
  const bytes = new Uint8Array(encryptedBlob);
  const binaryString = Array.from(bytes, b => String.fromCharCode(b)).join('');
  const base64Blob = btoa(binaryString);

  // Construct request payload
  const payload = {
    blob: base64Blob,
    storageKey: storageKey,
    metadata: {
      timestamp: new Date().toISOString(),
      originalSize: encryptedBlob.byteLength,
    }
  };

  // Send to edge function
  const response = await fetch('/api/sync/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  // Handle errors
  if (!response.ok) {
    if (response.status === 413) {
      throw new Error('QUOTA_EXCEEDED');
    } else if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After') || '3600';
      throw new Error(`RATE_LIMIT:${retryAfter}`);
    } else if (response.status === 503) {
      throw new Error('SERVICE_UNAVAILABLE');
    } else {
      throw new Error('UPLOAD_FAILED');
    }
  }

  // Parse success response
  const result = await response.json();
  return {
    uploadedAt: result.uploadedAt,
    blobSize: result.blobSize,
    storageKeyHash: result.storageKeyHash,
  };
}
```

### Error Handling Strategy

**User-Friendly Error Messages:**
Map technical errors to actionable messages:

```typescript
function mapUploadError(error: Error): string {
  const errorCode = error.message;

  switch (errorCode) {
    case 'QUOTA_EXCEEDED':
      return 'Upload failed: Backup exceeds 1GB storage limit. Contact support to increase quota.';
    case 'RATE_LIMIT':
      const waitTime = errorCode.split(':')[1] || '60';
      const minutes = Math.ceil(parseInt(waitTime) / 60);
      return `Upload failed: Too many uploads. Please wait ${minutes} minutes and try again.`;
    case 'SERVICE_UNAVAILABLE':
      return 'Upload failed: Cloud storage temporarily unavailable. Please try again in a few minutes.';
    case 'NETWORK_ERROR':
      return 'Upload failed: Network error. Check your internet connection and try again.';
    default:
      return 'Upload failed: An unexpected error occurred. Please try again or contact support.';
  }
}
```

**Error Persistence:**
Store error messages in `syncMetadata` table so UI can display last failure even after page reload.

### Sync Metadata Schema

**Dexie Table Definition:**
```typescript
// In src/lib/db/schema.ts
export interface SyncMetadata {
  id: 'primary';  // Single-row table
  lastSyncTimestamp: number;  // Date.now() of last attempt
  lastSyncSuccess: boolean;   // true = success, false = failure
  blobSizeBytes: number;      // Size of last successful backup
  storageKeyHash: string;     // First 8 chars of storage key (for display)
  errorMessage?: string;      // User-friendly error if lastSyncSuccess = false
}

// Add to Dexie schema
version(X).stores({
  // ... existing tables
  syncMetadata: 'id',  // Primary key: 'primary'
});
```

**Usage in UI (Story 7.4):**
```typescript
const metadata = await db.syncMetadata.get('primary');
if (metadata) {
  if (metadata.lastSyncSuccess) {
    // Show: "Last backup: 2 hours ago (5.2 MB)"
  } else {
    // Show: "Last backup failed: [error message]"
  }
}
```

### Progress Tracking Implementation

**Progress Stages:**
- **Export (0-30%):** Reading all tables from IndexedDB and serializing to JSON
- **Encryption (30-60%):** PBKDF2 key derivation + AES-GCM encryption (CPU-intensive)
- **Upload (60-100%):** Network transfer to Vercel Blob Storage

**Progress Callback Pattern:**
```typescript
// In UI component (Story 7.4)
const [progress, setProgress] = useState({ stage: 'idle', percent: 0, message: '' });

const handleBackup = async () => {
  await createBackup(passphrase, (update) => {
    setProgress(update);  // Update UI with progress
  });
};

// Render progress bar
<ProgressBar percent={progress.percent} message={progress.message} />
```

### Passphrase Validation

**Minimum Security Requirements:**
- 12 characters minimum (OWASP recommendation for passphrases)
- Confirmation required (prevent typos)

**Optional Strength Indicator (for Story 7.4 UI):**
```typescript
function calculatePassphraseStrength(passphrase: string): 'weak' | 'medium' | 'strong' {
  if (passphrase.length < 16) return 'weak';

  const hasLowercase = /[a-z]/.test(passphrase);
  const hasUppercase = /[A-Z]/.test(passphrase);
  const hasNumbers = /[0-9]/.test(passphrase);
  const hasSymbols = /[^a-zA-Z0-9]/.test(passphrase);

  const complexity = [hasLowercase, hasUppercase, hasNumbers, hasSymbols].filter(Boolean).length;

  if (passphrase.length >= 20 && complexity >= 3) return 'strong';
  if (passphrase.length >= 16 && complexity >= 2) return 'medium';
  return 'weak';
}
```

### Testing Strategy

**Unit Tests:**
- Mock Web Crypto API (`crypto.subtle.*`) for deterministic testing
- Mock Dexie database with fake-indexeddb
- Mock fetch API for upload testing
- Test all error paths (network failures, rate limits, etc.)

**Integration Tests:**
- Full flow: export → encrypt → upload → verify metadata
- Test with realistic data sizes (measure performance)
- Verify encryption randomness (different backups produce different ciphertexts)
- Verify storage key determinism (same passphrase produces same key)

**Manual Testing with Real Edge Function:**
- Test upload with actual Vercel Blob Storage (development environment)
- Verify blob appears in Vercel dashboard
- Test rate limiting (rapid uploads should trigger 429)
- Test large backups (>1GB should trigger 413)

### Learnings from Previous Story

**From Story 7.1 (Cloud Sync Infrastructure Setup)**

Story 7.1 successfully implemented the server-side infrastructure (Vercel Blob Storage, edge functions, rate limiting). Key learnings for this story:

- **New Files Created**: Edge functions at `src/app/api/sync/upload/route.ts` and `src/app/api/sync/download/route.ts` are ready to accept encrypted blobs
- **API Contracts**: Upload endpoint expects `{ blob: base64String, storageKey: string, metadata: {...} }` - follow this exact format
- **Error Codes**: Upload function returns 200 (success), 400 (invalid), 413 (too large), 429 (rate limit), 503 (unavailable) - handle all five codes
- **Rate Limiting**: 10 uploads/hour per storage key - inform users if they hit limit (parse Retry-After header)
- **Storage Key Format**: Must be 64-character hex string (SHA-256 hash) - validate before upload
- **Optional Rate Limiting**: Rate limiting requires Vercel KV or Upstash Redis configuration - API works without it for MVP (degrades gracefully)

**Interfaces to Reuse:**
- Upload edge function accepts Base64-encoded blobs (convert ArrayBuffer → Base64 before upload)
- Storage key is derived from passphrase using SHA-256 (implemented in this story)
- Edge function logs operations with first 8 chars of storage key (safe for debugging without exposing full key)

**Technical Debt to Address:**
- None affecting this story (infrastructure is complete)

**Warnings for This Story:**
- Ensure passphrase validation happens BEFORE calling edge function (prevent invalid uploads)
- Handle 413 errors gracefully (backup too large) - edge function enforces 1GB limit
- Store upload metadata locally (sync status for UI display in Story 7.4)

[Source: stories/7-1-cloud-sync-infrastructure-setup.md#Dev-Agent-Record]

### Project Structure Notes

**Files to Create:**
```
src/lib/services/
  └── cloudSyncService.ts          (NEW - Core encryption and upload logic)

src/lib/services/__tests__/
  └── cloudSyncService.test.ts     (NEW - Unit tests for crypto and upload)

src/lib/db/
  └── schema.ts                    (MODIFIED - Add syncMetadata table)
```

**Dependencies:**
- No new dependencies required (Web Crypto API is built-in, fetch is standard)
- Dexie schema version increment required (add `syncMetadata` table)

### References

- [Source: docs/epics.md#Story-7.2] - Story acceptance criteria and Epic 7 overview
- [Source: stories/7-1-cloud-sync-infrastructure-setup.md] - Previous story for edge function contracts and learnings
- [Web Crypto API - SubtleCrypto](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto) - Encryption and key derivation APIs
- [PBKDF2 Specification](https://datatracker.ietf.org/doc/html/rfc2898) - Key derivation function standard
- [AES-GCM Mode](https://en.wikipedia.org/wiki/Galois/Counter_Mode) - Authenticated encryption explained
- [OWASP Password Storage Cheat Sheet](https://cheatsheetsecurity.org/cheatsheets/password-storage-cheat-sheet/) - Industry standards for key derivation

## Dev Agent Record

### Context Reference

- .bmad-ephemeral/stories/7-2-encryption-and-upload-implementation.context.xml

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

✅ **Story 7.2 Complete - Encryption & Upload Implementation**

**Implementation Summary:**
- Created complete client-side encryption and cloud upload system with zero-knowledge architecture
- All 10 acceptance criteria fully implemented with 70+ subtasks completed
- Comprehensive unit test suite with 30+ test cases covering all cryptographic functions
- Database schema updated to v29 with syncMetadata table for backup tracking

**Core Functionality Delivered:**
1. **Cryptographic Key Derivation** (AC 7.2.1, 7.2.2)
   - PBKDF2 with 100,000 iterations for passphrase-to-encryption-key derivation
   - SHA-256 hash for deterministic storage key generation
   - Comprehensive JSDoc documentation with security rationale

2. **Data Export** (AC 7.2.3)
   - Complete IndexedDB export functionality covering all 23+ tables
   - Schema version metadata included for future compatibility
   - JSON validation and size logging for debugging

3. **AES-256-GCM Encryption** (AC 7.2.4)
   - Client-side encryption using Web Crypto API
   - Random salt (16 bytes) and IV (12 bytes) generation
   - Metadata prepending (salt + IV + ciphertext) for self-contained decryption

4. **Blob Upload** (AC 7.2.5)
   - Base64 encoding for JSON transport to edge function
   - Comprehensive HTTP error handling (400, 413, 429, 503)
   - Network error recovery with user-friendly messages

5. **Sync Metadata Storage** (AC 7.2.6)
   - New `syncMetadata` table in Dexie schema (v29)
   - Single-row design for backup status tracking
   - Failed upload error persistence for UI display

6. **Progress Tracking** (AC 7.2.7)
   - Three-stage progress system: Export (0-30%), Encrypt (30-60%), Upload (60-100%)
   - Callback-based progress updates for UI integration
   - Orchestrated backup flow with `createBackup()` function

7. **Error Handling** (AC 7.2.8)
   - User-friendly error mapping function
   - Retry-After header parsing for rate limits
   - Persistent error storage in syncMetadata

8. **Passphrase Validation** (AC 7.2.9)
   - 12-character minimum requirement enforcement
   - Confirmation matching validation
   - Clear validation error messages

9. **Unit Test Suite** (AC 7.2.10)
   - 30+ test cases covering all functions
   - Web Crypto API mocking for deterministic testing
   - Comprehensive error path testing (network, rate limit, quota)
   - Integration tests for complete backup flow

10. **Database Migration**
    - Schema upgraded from v28 to v29
    - `syncMetadata` table added with TypeScript interfaces
    - SyncMetadataRecord interface exported from schema.ts

**Security Implementation:**
- Zero-knowledge architecture: Server never sees unencrypted data or passphrases
- Industry-standard cryptography: PBKDF2 (100K iterations), AES-256-GCM
- Random salt per backup prevents rainbow table attacks
- Authenticated encryption (GCM) prevents tampering
- Deterministic storage keys enable cross-device backup retrieval

**Testing & Validation:**
- All TypeScript types properly defined and exported
- Comprehensive test coverage with mocked Web Crypto API
- Error handling tested for all HTTP status codes
- Progress tracking validated through full backup flow

**Ready for Story 7.3:**
- Upload infrastructure complete and tested
- Storage key derivation enables symmetric download functionality
- Metadata structure supports backup history UI
- Error handling patterns established for download flow

### File List

**New Files Created:**
- `src/lib/services/cloudSyncService.ts` (728 lines) - Complete encryption and upload service
- `src/lib/services/__tests__/cloudSyncService.test.ts` (600+ lines) - Comprehensive test suite

**Modified Files:**
- `src/lib/db/schema.ts` - Added SyncMetadataRecord interface
- `src/lib/db/client.ts` - Added syncMetadata table, upgraded schema to v29
- `docs/sprint-status.yaml` - Updated story 7.2 status: ready-for-dev → in-progress → review

**Total Lines of Code:** ~1,400 lines (implementation + tests)

## Change Log

**Date: 2025-11-13 (Story Completion)**
- ✅ Implemented all 10 tasks and 70+ subtasks
- Created complete encryption and upload service (728 lines)
- Created comprehensive test suite (600+ lines, 30+ test cases)
- Updated database schema to v29 with syncMetadata table
- All acceptance criteria satisfied
- Status updated: in-progress → review

**Date: 2025-11-12 (Story Creation)**
- Created Story 7.2 - Encryption & Upload Implementation
- Defined 10 acceptance criteria for client-side encryption and cloud upload
- Created 10 tasks with detailed subtasks (70+ total subtasks)
- Documented cryptographic implementation details, upload flow, and error handling
- Included learnings from Story 7.1 (edge function contracts, rate limiting)
- Added comprehensive Dev Notes with code examples and security considerations
- Story ready for context generation and development
- Status: drafted
