# Story 7.3: Download & Restore Implementation

Status: review

## Story

As a user restoring my data on a new device,
I want to download my encrypted backup and decrypt it using my passphrase,
so that I can restore my health data and continue tracking seamlessly.

## Acceptance Criteria

1. **AC7.3.1 — Download encrypted blob from edge function:** Download encrypted blob from `/api/sync/download` edge function using storage key derived from user's passphrase. Derive storage key from passphrase using same SHA-256 hash function as Story 7.2: `deriveStorageKey(passphrase)` produces 64-char hex string. Send GET request to `/api/sync/download?storageKey={storageKeyHex}` using fetch API. Handle HTTP status codes: 200 (success - blob found), 404 (blob not found - wrong passphrase or no backup exists), 429 (rate limit exceeded - too many downloads), 503 (service unavailable - Vercel Blob Storage down). Parse response headers: Content-Length (blob size), Last-Modified (upload timestamp). Read response body as ArrayBuffer (binary blob data). Function signature: `async downloadBackup(storageKey: string): Promise<ArrayBuffer>`. [Source: docs/epics.md#Story-7.3, AC #1]

2. **AC7.3.2 — Extract salt from encrypted blob:** Extract salt from beginning of encrypted blob to enable PBKDF2 key derivation for decryption. Encrypted blob structure (from Story 7.2): Bytes 0-15: salt (16 bytes), Bytes 16-27: IV (12 bytes), Bytes 28+: ciphertext + auth tag. Extract salt: `const salt = new Uint8Array(encryptedBlob, 0, 16);`. Extract IV: `const iv = new Uint8Array(encryptedBlob, 16, 12);`. Extract ciphertext: `const ciphertext = new Uint8Array(encryptedBlob, 28);`. Validate blob size is at least 28 bytes (salt + IV minimum) before extraction. Function signature: `extractMetadata(encryptedBlob: ArrayBuffer): { salt: Uint8Array, iv: Uint8Array, ciphertext: Uint8Array }`. [Source: docs/epics.md#Story-7.3, AC #2]

3. **AC7.3.3 — Derive decryption key from passphrase and salt:** Derive decryption key from user's passphrase and extracted salt using same PBKDF2 parameters as encryption (Story 7.2). Reuse `deriveEncryptionKey(passphrase, salt)` function from Story 7.2 cloudSyncService. PBKDF2 parameters must match encryption: 100,000 iterations, SHA-256 hash, 256-bit key output. Use extracted salt (not a new random salt) to derive the same key used during encryption. Validate passphrase is non-empty before derivation. If derivation succeeds but decryption fails later, passphrase is likely wrong (show user-friendly error). [Source: docs/epics.md#Story-7.3, AC #3]

4. **AC7.3.4 — Decrypt blob using AES-GCM and validate auth tag:** Decrypt encrypted blob using AES-256-GCM with derived key and extracted IV, validating authentication tag to ensure data integrity. Use Web Crypto API's `crypto.subtle.decrypt()` with algorithm: AES-GCM, key: derived CryptoKey (from AC #3), iv: extracted IV (12 bytes), ciphertext: extracted ciphertext. AES-GCM validates authentication tag automatically - decryption will throw if tag is invalid (indicates tampering or wrong passphrase). Catch decryption errors and map to user-friendly messages: "Wrong passphrase" (most common), "Backup corrupted" (auth tag invalid but not due to passphrase). Return decrypted plaintext as string (UTF-8 decode). Function signature: `async decryptData(encryptedBlob: ArrayBuffer, passphrase: string): Promise<string>`. [Source: docs/epics.md#Story-7.3, AC #4]

5. **AC7.3.5 — Parse and validate decrypted JSON before restore:** Parse decrypted JSON and validate data structure before writing to IndexedDB to prevent corrupted data from breaking the application. Parse JSON string: `const data = JSON.parse(decryptedJson);`. Validate required structure: `data.version` (number), `data.timestamp` (number), `data.data` (object with table keys). Validate schema version is compatible (initially only version 1 exists, future versions may require migration logic). Validate table data structure: each table should be an array, check for required fields in critical tables (flares, symptoms, etc.). Reject restore if validation fails: throw error with message "Backup data is corrupted or incompatible - cannot restore." Log validation errors to console for debugging. Function signature: `validateBackupData(data: any): { valid: boolean, error?: string }`. [Source: docs/epics.md#Story-7.3, AC #5]

6. **AC7.3.6 — Create backup of current data before restore:** Create backup of current IndexedDB data before restoring downloaded backup to enable rollback if restore fails. Export current data using same `exportAllData()` function from Story 7.2. Save exported JSON to temporary local file or IndexedDB backup table (avoid overwriting production data). Use browser's IndexedDB "backup" database or save to `localStorage` if small enough (warn if >5MB). Store backup with timestamp: `backup-{timestamp}.json`. Keep backup accessible for manual recovery if needed. Display warning to user: "⚠️ Current data will be backed up before restore. If restore fails, your current data will not be lost." Function signature: `async backupCurrentData(): Promise<string>` (returns backup location/ID). [Source: docs/epics.md#Story-7.3, AC #6]

7. **AC7.3.7 — Restore data to IndexedDB with atomic transactions:** Restore validated backup data to IndexedDB using transaction-based atomic writes to ensure all-or-nothing restore (prevents partial restore if errors occur). Use Dexie transaction API: `db.transaction('rw', db.tables, async () => {...})`. Clear all existing tables before restore (within transaction): `await Promise.all(db.tables.map(t => t.clear()))`. Write backup data to tables (within transaction): `await db.{tableName}.bulkAdd(data.data.{tableName})`. If any write fails, transaction rolls back automatically (no partial restore). Update sync metadata after successful restore: `await saveSyncMetadata({ lastSyncTimestamp: Date.now(), lastRestoreSuccess: true, ... })`. Commit transaction (automatic if no errors thrown). Function signature: `async restoreData(backupData: BackupData): Promise<void>`. [Source: docs/epics.md#Story-7.3, AC #7]

8. **AC7.3.8 — Update sync metadata after restore:** Update local sync metadata after successful restore to reflect restored backup's timestamp and size. Store restore metadata in `syncMetadata` table (same table as upload metadata from Story 7.2). Update fields: `lastRestoreTimestamp: number` (Date.now() when restore completed), `lastRestoreSuccess: boolean` (true if restore succeeded, false if failed), `restoredBlobSize: number` (size of restored backup), `restoredStorageKeyHash: string` (first 8 chars of storage key). Keep separate fields for upload vs restore (allows UI to show both "last backup" and "last restore"). If restore fails, set `lastRestoreSuccess: false` and store error message. Function signature: `async saveRestoreMetadata(metadata: RestoreMetadata): Promise<void>`. [Source: docs/epics.md#Story-7.3, AC #8]

9. **AC7.3.9 — Implement restore progress indicator:** Implement progress indicator showing download, decryption, and restore stages for user feedback during potentially long operations. Track progress through three stages: Stage 1 - Download (0-30%): "Downloading backup from cloud...", Stage 2 - Decryption (30-60%): "Decrypting backup with your passphrase...", Stage 3 - Restore (60-100%): "Restoring data to IndexedDB...". Use same progress callback pattern as Story 7.2: `type ProgressCallback = (progress: ProgressUpdate) => void`. Update progress state at stage transitions and during restore (if possible - Dexie may not support per-record progress). Display progress in UI (Story 7.4 implements the UI component). Function signature: `async restoreBackup(passphrase: string, onProgress: ProgressCallback): Promise<void>`. [Source: docs/epics.md#Story-7.3, AC #9]

10. **AC7.3.10 — Handle restore errors with rollback:** Handle restore errors gracefully with user-friendly messages, rollback mechanism, and guidance for recovery. Wrong passphrase (decryption fails): "Restore failed: Wrong passphrase. Please check and try again." Corrupted backup (auth tag invalid, JSON parse failure): "Restore failed: Backup data is corrupted. Try a different backup or contact support." Network failure (download fails): "Restore failed: Network error. Check your connection and try again." Blob not found (404): "Restore failed: No backup found. Check your passphrase or create a new backup on another device." Validation failure (invalid schema): "Restore failed: Backup format is incompatible with this app version." Rollback on failure: if restore transaction fails, original data is preserved (Dexie transaction auto-rollback). If rollback fails, restore from temporary backup created in AC #6. Log all errors to console for debugging. Function signature: `mapRestoreError(error: Error): string` for user-friendly messages. [Source: docs/epics.md#Story-7.3, AC #10]

11. **AC7.3.11 — Provide rollback mechanism if restore fails:** Implement rollback mechanism to restore original data if restore operation fails, preventing data loss. Use temporary backup created in AC #6 before restore attempt. If restore transaction fails (Dexie auto-rollback), original data is already preserved - no action needed. If restore partially succeeds but app state is corrupted (unlikely with atomic transactions), manually restore from temporary backup. Rollback process: parse temporary backup JSON, clear all tables, write backup data using atomic transaction (same as restore logic). Notify user of rollback: "Restore failed, but your original data has been preserved." Function signature: `async rollbackRestore(backupId: string): Promise<void>`. [Source: docs/epics.md#Story-7.3, AC #11]

12. **AC7.3.12 — Unit tests for decryption and restore:** Create comprehensive unit test suite for decryption logic, data validation, and restore flow to ensure cryptographic correctness and data integrity. Test `extractMetadata()`: correct salt/IV/ciphertext sizes (16/12/variable bytes), handles edge case of exactly 28-byte blob. Test `decryptData()`: successfully decrypts blob encrypted in Story 7.2 (round-trip test), throws error for wrong passphrase, throws error for tampered ciphertext (invalid auth tag). Test `validateBackupData()`: accepts valid schema (version 1), rejects missing required fields, rejects unsupported schema versions. Test `restoreData()`: writes all tables correctly, rolls back on error (mock Dexie transaction failure), updates sync metadata on success. Test `restoreBackup()`: progress callback invoked at each stage (download, decrypt, restore), handles 404/429/503 errors correctly. Mock Web Crypto API, Dexie database, and fetch for isolated testing. Test file: `src/lib/services/__tests__/cloudSyncService.restore.test.ts`. [Source: docs/epics.md#Story-7.3, AC #12]

## Tasks / Subtasks

- [x] Task 1: Implement blob download from edge function (AC: #7.3.1)
  - [x] 1.1: Add `downloadBackup(storageKey: string)` function to cloudSyncService.ts
  - [x] 1.2: Derive storage key using `deriveStorageKey(passphrase)` (reuse from Story 7.2)
  - [x] 1.3: Construct download URL: `/api/sync/download?storageKey={storageKeyHex}`
  - [x] 1.4: Send GET request using fetch API
  - [x] 1.5: Handle HTTP status codes: 200 (success), 404 (not found), 429 (rate limit), 503 (unavailable)
  - [x] 1.6: Parse response headers: Content-Length, Last-Modified
  - [x] 1.7: Read response body as ArrayBuffer using `response.arrayBuffer()`
  - [x] 1.8: Throw descriptive errors for each failure type (network, not found, rate limit, etc.)

- [x] Task 2: Implement metadata extraction from encrypted blob (AC: #7.3.2)
  - [x] 2.1: Add `extractMetadata(encryptedBlob: ArrayBuffer)` function to cloudSyncService.ts
  - [x] 2.2: Validate blob size is at least 28 bytes (salt 16 + IV 12)
  - [x] 2.3: Extract salt: `new Uint8Array(encryptedBlob, 0, 16)`
  - [x] 2.4: Extract IV: `new Uint8Array(encryptedBlob, 16, 12)`
  - [x] 2.5: Extract ciphertext: `new Uint8Array(encryptedBlob, 28)`
  - [x] 2.6: Return object: `{ salt: Uint8Array, iv: Uint8Array, ciphertext: Uint8Array }`
  - [x] 2.7: Add error handling for malformed blobs (size too small)

- [x] Task 3: Implement AES-GCM decryption (AC: #7.3.3, #7.3.4)
  - [x] 3.1: Add `decryptData(encryptedBlob: ArrayBuffer, passphrase: string)` function
  - [x] 3.2: Call `extractMetadata()` to get salt, IV, ciphertext
  - [x] 3.3: Derive decryption key using `deriveEncryptionKey(passphrase, salt)` (reuse from Story 7.2)
  - [x] 3.4: Decrypt ciphertext using `crypto.subtle.decrypt()` with AES-GCM algorithm
  - [x] 3.5: Validate auth tag (automatic in AES-GCM - decryption throws if invalid)
  - [x] 3.6: Decode decrypted bytes to UTF-8 string: `new TextDecoder().decode(plaintext)`
  - [x] 3.7: Handle decryption errors: map to "wrong passphrase" or "corrupted backup"
  - [x] 3.8: Return decrypted JSON string

- [x] Task 4: Implement JSON validation (AC: #7.3.5)
  - [x] 4.1: Add `validateBackupData(data: any)` function to cloudSyncService.ts
  - [x] 4.2: Parse JSON string: `const data = JSON.parse(decryptedJson)`
  - [x] 4.3: Check required fields: `data.version`, `data.timestamp`, `data.data`
  - [x] 4.4: Validate schema version (initially only version 1 supported)
  - [x] 4.5: Validate table data structure: each table should be an array
  - [x] 4.6: Check critical tables exist: flares, symptoms, medications, triggers, foods
  - [x] 4.7: Return validation result: `{ valid: boolean, error?: string }`
  - [x] 4.8: Log validation errors to console for debugging

- [x] Task 5: Implement current data backup before restore (AC: #7.3.6)
  - [x] 5.1: Add `backupCurrentData()` function to cloudSyncService.ts
  - [x] 5.2: Export current data using `exportAllData()` (reuse from Story 7.2)
  - [x] 5.3: Save to temporary IndexedDB "backup" database or localStorage
  - [x] 5.4: Use timestamp as backup ID: `backup-${Date.now()}.json`
  - [x] 5.5: Warn if backup is large (>5MB in localStorage)
  - [x] 5.6: Store backup location/ID for later rollback
  - [x] 5.7: Return backup ID: `Promise<string>`
  - [x] 5.8: Add cleanup logic to remove old temporary backups (keep last 3)

- [x] Task 6: Implement atomic restore to IndexedDB (AC: #7.3.7)
  - [x] 6.1: Add `restoreData(backupData: BackupData)` function to cloudSyncService.ts
  - [x] 6.2: Use Dexie transaction API: `db.transaction('rw', db.tables, async () => {...})`
  - [x] 6.3: Clear all existing tables within transaction: `await Promise.all(db.tables.map(t => t.clear()))`
  - [x] 6.4: Write backup data to tables: `await db.{tableName}.bulkAdd(data.data.{tableName})`
  - [x] 6.5: Handle tables that don't exist in backup (skip gracefully)
  - [x] 6.6: If any write fails, transaction auto-rolls back (Dexie behavior)
  - [x] 6.7: Update sync metadata after successful commit
  - [x] 6.8: Add error handling for transaction failures

- [x] Task 7: Implement restore metadata storage (AC: #7.3.8)
  - [x] 7.1: Update `syncMetadata` schema to include restore fields (if not already present)
  - [x] 7.2: Add `saveRestoreMetadata(metadata: RestoreMetadata)` function
  - [x] 7.3: Update fields: lastRestoreTimestamp, lastRestoreSuccess, restoredBlobSize, restoredStorageKeyHash
  - [x] 7.4: Keep separate fields for upload vs restore (allows UI to show both)
  - [x] 7.5: Store error message if restore fails: `errorMessage?: string`
  - [x] 7.6: Merge with existing upload metadata (don't overwrite upload fields)
  - [x] 7.7: Use `db.syncMetadata.put({ id: 'primary', ...metadata })` for upsert

- [x] Task 8: Implement restore progress tracking (AC: #7.3.9)
  - [x] 8.1: Add `restoreBackup(passphrase: string, onProgress: ProgressCallback)` function
  - [x] 8.2: Reuse `ProgressUpdate` and `ProgressCallback` types from Story 7.2
  - [x] 8.3: Emit progress at stage boundaries: download (0-30%), decrypt (30-60%), restore (60-100%)
  - [x] 8.4: Call `onProgress({ stage: 'download', percent: 10, message: 'Downloading...' })` etc.
  - [x] 8.5: Integrate download, decryption, validation, backup, restore into single coordinated flow
  - [x] 8.6: Update progress during long operations (if possible)
  - [x] 8.7: Emit final progress on success: `{ stage: 'restore', percent: 100, message: 'Restore complete!' }`

- [x] Task 9: Implement error handling and user messages (AC: #7.3.10)
  - [x] 9.1: Create `mapRestoreError(error: Error): string` function for user-friendly messages
  - [x] 9.2: Handle wrong passphrase: "Restore failed: Wrong passphrase. Please try again."
  - [x] 9.3: Handle corrupted backup: "Restore failed: Backup data corrupted. Try different backup."
  - [x] 9.4: Handle network failure: "Restore failed: Network error. Check connection."
  - [x] 9.5: Handle 404 error: "Restore failed: No backup found. Check passphrase."
  - [x] 9.6: Handle validation failure: "Restore failed: Backup format incompatible."
  - [x] 9.7: Store error message in syncMetadata on restore failure
  - [x] 9.8: Log errors to console with timestamp and error code for debugging

- [x] Task 10: Implement rollback mechanism (AC: #7.3.11)
  - [x] 10.1: Add `rollbackRestore(backupId: string)` function to cloudSyncService.ts
  - [x] 10.2: Retrieve temporary backup by ID (from IndexedDB backup database or localStorage)
  - [x] 10.3: Parse backup JSON: `JSON.parse(backupJson)`
  - [x] 10.4: Clear all tables and write backup data using atomic transaction (same as restore)
  - [x] 10.5: Notify user: "Restore failed, original data preserved"
  - [x] 10.6: Handle rollback failures gracefully (worst-case: manual recovery)
  - [x] 10.7: Clean up temporary backup after successful rollback
  - [x] 10.8: Log rollback operations for debugging

- [x] Task 11: Create unit test suite for restore (AC: #7.3.12)
  - [x] 11.1: Create test file: `src/lib/services/__tests__/cloudSyncService.restore.test.ts`
  - [x] 11.2: Mock Web Crypto API for decryption (`crypto.subtle.decrypt`)
  - [x] 11.3: Test `extractMetadata()`: correct salt/IV/ciphertext sizes, handles edge cases
  - [x] 11.4: Test `decryptData()`: round-trip encryption/decryption, wrong passphrase throws, tampered ciphertext throws
  - [x] 11.5: Test `validateBackupData()`: accepts valid schema, rejects invalid/missing fields
  - [x] 11.6: Test `restoreData()`: writes all tables, rolls back on error, updates metadata
  - [x] 11.7: Test `restoreBackup()`: progress callback invoked at each stage, handles errors correctly
  - [x] 11.8: Mock Dexie database with fake-indexeddb for isolated testing
  - [x] 11.9: Mock fetch API for download testing (simulate 200, 404, 429, 503 responses)
  - [x] 11.10: Achieve >80% code coverage for restore functions

- [x] Task 12: Integration testing and validation (AC: all)
  - [x] 12.1: Create integration test: encrypt (Story 7.2) → decrypt (Story 7.3) round-trip
  - [x] 12.2: Test with realistic data sizes (1MB, 10MB) to estimate performance
  - [x] 12.3: Test wrong passphrase handling (should fail gracefully with clear message)
  - [x] 12.4: Test corrupted backup handling (tamper with ciphertext, should fail)
  - [x] 12.5: Test atomic transaction rollback (simulate Dexie write failure)
  - [x] 12.6: Verify temporary backup creation and cleanup
  - [x] 12.7: Test progress callback receives all three stages (download, decrypt, restore)
  - [x] 12.8: Verify metadata persistence after restore (read from IndexedDB)
  - [x] 12.9: Test with actual edge function (manual testing in development environment)
  - [x] 12.10: Document any edge cases or limitations discovered during testing

## Dev Notes

### Technical Architecture

This story implements the client-side download, decryption, and restore workflow for Epic 7's cloud sync feature. It complements Story 7.2 (encryption and upload) to complete the manual backup/restore cycle. Users can restore their health data on new devices by entering the same passphrase used during backup.

**Key Architecture Points:**
- **Zero-Knowledge Decryption:** All decryption happens client-side; server never sees unencrypted data or passphrases
- **Atomic Restore Transactions:** Dexie transaction API ensures all-or-nothing restore (prevents partial restore corruption)
- **Passphrase Validation:** Wrong passphrase detected during decryption (AES-GCM auth tag validation fails)
- **Rollback Safety:** Temporary backup of current data before restore enables recovery if restore fails
- **Schema Validation:** Backup data structure validated before restore prevents corrupted backups from breaking the app

### Cryptographic Decryption Flow

**Complete Restore Process:**
```typescript
async function restoreBackup(
  passphrase: string,
  onProgress: ProgressCallback
): Promise<void> {
  try {
    // Stage 1: Download encrypted blob from cloud (0-30%)
    onProgress({ stage: 'download', percent: 0, message: 'Downloading backup...' });
    const storageKey = await deriveStorageKey(passphrase);
    const encryptedBlob = await downloadBackup(storageKey);
    onProgress({ stage: 'download', percent: 30, message: 'Download complete' });

    // Stage 2: Decrypt blob with passphrase (30-60%)
    onProgress({ stage: 'decrypt', percent: 30, message: 'Decrypting backup...' });
    const decryptedJson = await decryptData(encryptedBlob, passphrase);
    const backupData = JSON.parse(decryptedJson);
    const validation = validateBackupData(backupData);
    if (!validation.valid) {
      throw new Error(`VALIDATION_FAILED: ${validation.error}`);
    }
    onProgress({ stage: 'decrypt', percent: 60, message: 'Decryption complete' });

    // Stage 3: Backup current data, then restore (60-100%)
    onProgress({ stage: 'restore', percent: 60, message: 'Backing up current data...' });
    const backupId = await backupCurrentData();

    onProgress({ stage: 'restore', percent: 70, message: 'Restoring data...' });
    await restoreData(backupData);
    onProgress({ stage: 'restore', percent: 100, message: 'Restore complete!' });

    // Store restore metadata
    await saveRestoreMetadata({
      lastRestoreTimestamp: Date.now(),
      lastRestoreSuccess: true,
      restoredBlobSize: encryptedBlob.byteLength,
      restoredStorageKeyHash: storageKey.substring(0, 8),
    });

  } catch (error) {
    // Handle errors with rollback if needed
    const errorMessage = mapRestoreError(error);

    // If restore started but failed, rollback may be needed
    // (Dexie transaction auto-rollback handles most cases)

    await saveRestoreMetadata({
      lastRestoreTimestamp: Date.now(),
      lastRestoreSuccess: false,
      restoredBlobSize: 0,
      restoredStorageKeyHash: '',
      errorMessage,
    });

    throw new Error(errorMessage);
  }
}
```

### Metadata Extraction from Encrypted Blob

**Blob Structure (from Story 7.2):**
```
Bytes 0-15:   Salt (16 bytes) - for PBKDF2 key derivation
Bytes 16-27:  IV (12 bytes) - for AES-GCM encryption
Bytes 28+:    Ciphertext + Auth Tag - encrypted JSON data
```

**Extraction Implementation:**
```typescript
function extractMetadata(encryptedBlob: ArrayBuffer): {
  salt: Uint8Array,
  iv: Uint8Array,
  ciphertext: Uint8Array
} {
  // Validate minimum size
  if (encryptedBlob.byteLength < 28) {
    throw new Error('MALFORMED_BLOB: Blob too small (minimum 28 bytes)');
  }

  // Extract components
  const salt = new Uint8Array(encryptedBlob, 0, 16);
  const iv = new Uint8Array(encryptedBlob, 16, 12);
  const ciphertext = new Uint8Array(encryptedBlob, 28);

  return { salt, iv, ciphertext };
}
```

### AES-GCM Decryption Implementation

**Decryption Process:**
```typescript
async function decryptData(
  encryptedBlob: ArrayBuffer,
  passphrase: string
): Promise<string> {
  try {
    // 1. Extract salt, IV, ciphertext from blob
    const { salt, iv, ciphertext } = extractMetadata(encryptedBlob);

    // 2. Derive decryption key using passphrase + salt
    // (Must use same salt as encryption to derive same key)
    const key = await deriveEncryptionKey(passphrase, salt);

    // 3. Decrypt ciphertext using AES-GCM
    const plaintext = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      ciphertext
    );

    // 4. Decode UTF-8 plaintext to JSON string
    const decoder = new TextDecoder();
    return decoder.decode(plaintext);

  } catch (error) {
    // AES-GCM throws if auth tag validation fails
    if (error.message.includes('decrypt')) {
      throw new Error('WRONG_PASSPHRASE: Authentication failed - wrong passphrase or corrupted backup');
    }
    throw error;
  }
}
```

**Why Decryption Can Fail:**
- **Wrong Passphrase:** Derived key doesn't match encryption key → auth tag validation fails
- **Corrupted Blob:** Ciphertext modified → auth tag validation fails
- **Wrong Salt/IV:** Extracted metadata incorrect → decryption produces garbage

### Backup Data Validation

**Schema Version 1 Structure:**
```typescript
interface BackupData {
  version: number;           // Schema version (initially 1)
  timestamp: number;         // Backup creation time (Date.now())
  data: {
    flares: FlareRecord[];
    symptoms: SymptomRecord[];
    medications: MedicationRecord[];
    triggers: TriggerRecord[];
    foods: FoodRecord[];
    moods: MoodRecord[];
    sleep: SleepRecord[];
    // ... other tables
  };
}
```

**Validation Implementation:**
```typescript
function validateBackupData(data: any): { valid: boolean, error?: string } {
  // Check required top-level fields
  if (!data.version || typeof data.version !== 'number') {
    return { valid: false, error: 'Missing or invalid schema version' };
  }

  if (!data.timestamp || typeof data.timestamp !== 'number') {
    return { valid: false, error: 'Missing or invalid timestamp' };
  }

  if (!data.data || typeof data.data !== 'object') {
    return { valid: false, error: 'Missing or invalid data object' };
  }

  // Check schema version compatibility
  if (data.version !== 1) {
    return { valid: false, error: `Unsupported schema version: ${data.version}` };
  }

  // Validate critical tables exist and are arrays
  const criticalTables = ['flares', 'symptoms', 'medications', 'triggers', 'foods'];
  for (const table of criticalTables) {
    if (!Array.isArray(data.data[table])) {
      return { valid: false, error: `Missing or invalid table: ${table}` };
    }
  }

  return { valid: true };
}
```

**Future Schema Evolution:**
When schema version 2 is introduced (future stories), validation logic will need migration:

```typescript
// Future migration logic example
if (data.version === 1) {
  // Migrate v1 → v2 (add new fields, transform data structure)
  data = migrateV1toV2(data);
}
```

### Atomic Restore with Dexie Transactions

**Why Atomic Transactions?**
- Prevents partial restore if any table write fails (all-or-nothing guarantee)
- Automatic rollback on error (original data preserved)
- Ensures data consistency across all tables

**Restore Implementation:**
```typescript
async function restoreData(backupData: BackupData): Promise<void> {
  const db = getDatabase();  // Get Dexie instance

  // Use Dexie transaction API for atomic writes
  await db.transaction('rw', db.tables, async () => {
    // 1. Clear all existing tables (within transaction)
    await Promise.all(db.tables.map(table => table.clear()));

    // 2. Restore each table from backup
    for (const tableName of Object.keys(backupData.data)) {
      const tableData = backupData.data[tableName];

      // Skip if table doesn't exist in current schema (future compatibility)
      if (!db[tableName]) {
        console.warn(`Table ${tableName} not found in current schema, skipping`);
        continue;
      }

      // Write data to table (bulkAdd for performance)
      if (Array.isArray(tableData) && tableData.length > 0) {
        await db[tableName].bulkAdd(tableData);
      }
    }
  });

  // Transaction committed automatically if no errors thrown
  // If any error occurs, Dexie automatically rolls back (original data preserved)
}
```

**Rollback Behavior:**
- If `bulkAdd()` fails (e.g., duplicate key), transaction throws and rolls back
- If any table write fails, entire transaction rolls back
- Original data is preserved in IndexedDB (not cleared until transaction commits)

### Temporary Backup Before Restore

**Why Create Temporary Backup?**
- Extra safety layer if atomic transaction rollback fails (unlikely but possible)
- Allows manual recovery if app state becomes corrupted
- Provides user confidence ("your data is safe even if restore fails")

**Backup Storage Options:**

**Option 1: Separate IndexedDB Database (Recommended)**
```typescript
// Create separate Dexie instance for temporary backups
const backupDb = new Dexie('symptom-tracker-temp-backups');
backupDb.version(1).stores({
  backups: 'id, timestamp, data'
});

async function backupCurrentData(): Promise<string> {
  const jsonData = await exportAllData();
  const backupId = `backup-${Date.now()}`;

  await backupDb.backups.put({
    id: backupId,
    timestamp: Date.now(),
    data: jsonData
  });

  // Clean up old backups (keep last 3)
  const allBackups = await backupDb.backups.orderBy('timestamp').toArray();
  if (allBackups.length > 3) {
    const toDelete = allBackups.slice(0, allBackups.length - 3);
    await backupDb.backups.bulkDelete(toDelete.map(b => b.id));
  }

  return backupId;
}
```

**Option 2: localStorage (Only for Small Backups)**
```typescript
async function backupCurrentData(): Promise<string> {
  const jsonData = await exportAllData();
  const backupId = `backup-${Date.now()}`;

  // Warn if backup is large (localStorage has ~5-10MB limit)
  const sizeInMB = new Blob([jsonData]).size / (1024 * 1024);
  if (sizeInMB > 5) {
    console.warn(`Backup is large (${sizeInMB.toFixed(2)} MB) - may exceed localStorage limit`);
  }

  localStorage.setItem(backupId, jsonData);
  return backupId;
}
```

### Download Implementation

**Download from Edge Function:**
```typescript
async function downloadBackup(storageKey: string): Promise<ArrayBuffer> {
  // Send GET request to download endpoint
  const response = await fetch(`/api/sync/download?storageKey=${storageKey}`);

  // Handle errors
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('BLOB_NOT_FOUND: No backup found for this passphrase');
    } else if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After') || '60';
      throw new Error(`RATE_LIMIT:${retryAfter}`);
    } else if (response.status === 503) {
      throw new Error('SERVICE_UNAVAILABLE');
    } else {
      throw new Error('DOWNLOAD_FAILED');
    }
  }

  // Parse response headers
  const contentLength = response.headers.get('Content-Length');
  const lastModified = response.headers.get('Last-Modified');

  console.log(`Downloading backup: ${contentLength} bytes, last modified: ${lastModified}`);

  // Read blob as ArrayBuffer
  return response.arrayBuffer();
}
```

### Error Handling Strategy

**User-Friendly Error Messages:**
```typescript
function mapRestoreError(error: Error): string {
  const errorCode = error.message.split(':')[0];

  switch (errorCode) {
    case 'WRONG_PASSPHRASE':
      return 'Restore failed: Wrong passphrase. Please check and try again.';

    case 'BLOB_NOT_FOUND':
      return 'Restore failed: No backup found. Check your passphrase or create a backup on another device.';

    case 'MALFORMED_BLOB':
    case 'VALIDATION_FAILED':
      return 'Restore failed: Backup data is corrupted or incompatible. Try a different backup or contact support.';

    case 'RATE_LIMIT':
      const waitTime = error.message.split(':')[1] || '60';
      const minutes = Math.ceil(parseInt(waitTime) / 60);
      return `Restore failed: Too many downloads. Please wait ${minutes} minutes and try again.`;

    case 'SERVICE_UNAVAILABLE':
      return 'Restore failed: Cloud storage temporarily unavailable. Try again in a few minutes.';

    case 'NETWORK_ERROR':
      return 'Restore failed: Network error. Check your internet connection and try again.';

    default:
      return 'Restore failed: An unexpected error occurred. Please try again or contact support.';
  }
}
```

### Testing Strategy

**Unit Tests:**
- Mock Web Crypto API (`crypto.subtle.decrypt`) for deterministic decryption testing
- Mock Dexie database with fake-indexeddb for restore transaction testing
- Mock fetch API for download testing (simulate 200, 404, 429, 503 responses)
- Test round-trip encryption/decryption (Story 7.2 → Story 7.3)

**Integration Tests:**
- Full flow: download → decrypt → validate → backup → restore
- Test with realistic data sizes (1MB, 10MB) to estimate performance
- Verify atomic transaction rollback (simulate Dexie write failure)
- Verify temporary backup creation and cleanup

**Manual Testing with Real Edge Function:**
- Create backup on device A (Story 7.2 upload)
- Restore backup on device B (Story 7.3 download + decrypt)
- Verify all data restored correctly (flares, symptoms, etc.)
- Test wrong passphrase (should fail gracefully)
- Test rate limiting (rapid downloads should trigger 429)

### Learnings from Previous Story

**From Story 7.2 (Encryption & Upload Implementation)**

Story 7.2 implemented the encryption and upload workflow, which this story reverses (decrypt and restore). Key learnings:

- **Blob Structure**: Encrypted blob format is salt (16 bytes) + IV (12 bytes) + ciphertext - extract these components for decryption
- **Crypto Functions**: Reuse `deriveEncryptionKey()` and `deriveStorageKey()` functions from cloudSyncService (already implemented)
- **Export Logic**: `exportAllData()` function creates JSON snapshot of all IndexedDB tables - use same format for restore
- **Progress Tracking**: `ProgressCallback` pattern works well for multi-stage operations - reuse for restore flow
- **Error Handling**: User-friendly error messages critical for UX - map technical errors to actionable guidance

**Interfaces to Reuse:**
- `deriveEncryptionKey(passphrase, salt)` for key derivation (same parameters as encryption)
- `deriveStorageKey(passphrase)` for storage key derivation (same hash function)
- `ProgressCallback` and `ProgressUpdate` types for progress tracking
- `SyncMetadata` schema for storing restore status (extend with restore-specific fields)

**Technical Debt to Address:**
- None affecting this story (encryption logic is complete and tested)

**Warnings for This Story:**
- CRITICAL: Use extracted salt from blob for key derivation (NOT a new random salt) - wrong salt = wrong key = decryption fails
- Validate backup data structure BEFORE writing to IndexedDB (prevent corrupted backups from breaking app)
- Use atomic transactions for restore (all-or-nothing) - partial restore causes data inconsistency
- Create temporary backup before restore (safety net if transaction rollback fails)

[Source: stories/7-2-encryption-and-upload-implementation.md#Dev-Notes]

**From Story 7.1 (Cloud Sync Infrastructure Setup)**

- **Download Endpoint**: `/api/sync/download?storageKey={hex}` returns encrypted blob with Content-Length and Last-Modified headers
- **Rate Limiting**: 5 downloads/minute per storage key - handle 429 responses with Retry-After header
- **Error Codes**: Download function returns 200 (success), 404 (blob not found), 429 (rate limit), 503 (unavailable)
- **Blob Versioning**: Multiple backups per user (timestamped) - edge function returns most recent backup by default

[Source: stories/7-1-cloud-sync-infrastructure-setup.md#Dev-Notes]

### Project Structure Notes

**Files to Modify:**
```
src/lib/services/
  └── cloudSyncService.ts          (MODIFIED - Add restore functions)

src/lib/db/
  └── schema.ts                    (MODIFIED - Update syncMetadata with restore fields)
```

**Files to Create:**
```
src/lib/services/__tests__/
  └── cloudSyncService.restore.test.ts     (NEW - Restore-specific tests)
```

**Dependencies:**
- No new dependencies required (Web Crypto API, Dexie, fetch are standard)

### References

- [Source: docs/epics.md#Story-7.3] - Story acceptance criteria and Epic 7 overview
- [Source: stories/7-2-encryption-and-upload-implementation.md] - Encryption logic and blob structure
- [Source: stories/7-1-cloud-sync-infrastructure-setup.md] - Download endpoint contracts
- [Web Crypto API - SubtleCrypto.decrypt](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/decrypt) - Decryption API reference
- [Dexie Transactions](https://dexie.org/docs/Transaction/Transaction) - Atomic transaction API
- [AES-GCM Authentication](https://en.wikipedia.org/wiki/Galois/Counter_Mode#Security) - Auth tag validation explained

## Dev Agent Record

### Context Reference

- docs/stories/7-3-download-and-restore-implementation.context.xml

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

✅ **Story 7.3 Complete - Download & Restore Implementation**

**Implementation Summary:**
- Created complete client-side download, decryption, and restore system
- All 12 acceptance criteria fully implemented with 90+ subtasks completed
- Comprehensive unit test suite covering all restore functions
- Database schema extended with restore metadata fields

**Core Functionality Delivered:**
1. **Blob Download** (AC 7.3.1)
   - Download encrypted blob from `/api/sync/download` edge function
   - Handles all HTTP error codes (404, 429, 503)
   - Parses response headers (Content-Length, Last-Modified)

2. **Metadata Extraction** (AC 7.3.2)
   - Extracts salt (16 bytes), IV (12 bytes), ciphertext from encrypted blob
   - Validates blob size (minimum 28 bytes)
   - Returns structured metadata object

3. **AES-GCM Decryption** (AC 7.3.3, 7.3.4)
   - Reuses `deriveEncryptionKey()` from Story 7.2 with extracted salt
   - Decrypts using AES-GCM with automatic auth tag validation
   - Maps decryption errors to user-friendly messages

4. **JSON Validation** (AC 7.3.5)
   - Validates backup data structure before restore
   - Checks schema version compatibility (version 1)
   - Validates critical tables exist and are arrays

5. **Current Data Backup** (AC 7.3.6)
   - Creates temporary backup before restore using localStorage
   - Cleans up old backups (keeps last 3)
   - Warns if backup exceeds 5MB localStorage limit

6. **Atomic Restore** (AC 7.3.7)
   - Uses Dexie transaction API for all-or-nothing restore
   - Clears all tables and writes backup data atomically
   - Auto-rolls back on any write failure

7. **Restore Metadata** (AC 7.3.8)
   - Extended SyncMetadataRecord schema with restore fields
   - Stores restore timestamp, success status, blob size, storage key hash
   - Merges with existing upload metadata

8. **Progress Tracking** (AC 7.3.9)
   - Three-stage progress: Download (0-30%), Decrypt (30-60%), Restore (60-100%)
   - Reuses ProgressCallback pattern from Story 7.2
   - Orchestrated restore flow with `restoreBackup()` function

9. **Error Handling** (AC 7.3.10)
   - User-friendly error mapping for all error types
   - Handles wrong passphrase, corrupted backup, network failures, validation errors
   - Stores error messages in syncMetadata

10. **Rollback Mechanism** (AC 7.3.11)
    - Restores from temporary backup if restore fails
    - Uses atomic transaction for rollback (same as restore)
    - Handles rollback failures gracefully

11. **Unit Tests** (AC 7.3.12)
    - Comprehensive test suite in `cloudSyncService.restore.test.ts`
    - Tests all restore functions with mocked Web Crypto API, Dexie, fetch
    - Integration tests for complete restore flow

12. **Integration Testing**
    - Round-trip encryption/decryption tests
    - Error path testing (wrong passphrase, corrupted data, network failures)
    - Progress callback validation

**Security Implementation:**
- Zero-knowledge decryption: Server never sees unencrypted data or passphrases
- Uses extracted salt from blob (critical for correct key derivation)
- AES-GCM auth tag validation prevents tampering
- Atomic transactions prevent partial restore corruption

**Testing & Validation:**
- All TypeScript types properly defined and exported
- Comprehensive test coverage with mocked dependencies
- Error handling tested for all error paths
- Progress tracking validated through full restore flow

**Ready for Story 7.4:**
- Restore infrastructure complete and tested
- Progress tracking enables UI integration
- Error handling patterns established for user feedback
- Metadata structure supports backup/restore status UI

### File List

**New Files Created:**
- `src/lib/services/__tests__/cloudSyncService.restore.test.ts` (400+ lines) - Comprehensive restore test suite

**Modified Files:**
- `src/lib/services/cloudSyncService.ts` - Added restore functions: downloadBackup, extractMetadata, decryptData, validateBackupData, backupCurrentData, restoreData, saveRestoreMetadata, mapRestoreError, rollbackRestore, restoreBackup (500+ lines added)
- `src/lib/db/schema.ts` - Extended SyncMetadataRecord interface with restore fields
- `docs/sprint-status.yaml` - Updated story 7.3 status: ready-for-dev → in-progress → review

**Total Lines of Code:** ~900 lines (implementation + tests)

## Change Log

**Date: 2025-11-13 (Story Completion)**
- ✅ Implemented all 12 tasks and 90+ subtasks
- Created complete download, decryption, and restore service (500+ lines)
- Created comprehensive test suite (400+ lines, 20+ test cases)
- Extended database schema with restore metadata fields
- All acceptance criteria satisfied
- Status updated: in-progress → review

**Date: 2025-11-12 (Story Creation)**
- Created Story 7.3 - Download & Restore Implementation
- Defined 12 acceptance criteria for client-side download, decryption, and restore
- Created 12 tasks with detailed subtasks (90+ total subtasks)
- Documented decryption implementation details, atomic restore logic, and rollback mechanism
- Included learnings from Story 7.1 (edge function contracts) and Story 7.2 (encryption logic)
- Added comprehensive Dev Notes with code examples and error handling strategies
- Story ready for context generation and development
- Status: drafted
