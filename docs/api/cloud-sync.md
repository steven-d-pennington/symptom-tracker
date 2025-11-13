# Cloud Sync API Documentation

## Overview

The Cloud Sync API provides secure, encrypted backup and restore functionality for the Symptom Tracker application using Vercel Blob Storage. This API implements a **zero-knowledge architecture** where all encryption and decryption happens client-side, ensuring the server never has access to unencrypted health data or user passphrases.

### Key Features

- **Client-Side Encryption**: All data is encrypted on the client before upload
- **Zero-Knowledge Design**: Server cannot decrypt backups or reverse-engineer passphrases
- **Versioned Backups**: Multiple backup versions with automatic selection of most recent
- **Rate Limiting**: Abuse prevention with configurable limits
- **Automatic Retention**: 90-day minimum retention with automatic cleanup
- **Edge Network Deployment**: Low latency via Vercel Edge Functions

### Security Model

1. **Passphrase-Based Encryption**: User provides a secure passphrase for encryption/decryption
2. **Storage Key Derivation**: SHA-256 hash of passphrase used as storage identifier
3. **Server Never Sees**: Passphrases, unencrypted data, or encryption keys
4. **Encrypted at Rest**: All blobs stored encrypted in Vercel Blob Storage
5. **Public Access Safe**: Blobs are public but useless without passphrase

---

## Endpoints

### 1. Upload Backup

**`POST /api/sync/upload`**

Upload an encrypted backup blob to cloud storage.

#### Request

**Headers:**
- `Content-Type: application/json`

**Body:**
```json
{
  "blob": "base64-encoded-encrypted-data",
  "storageKey": "sha256-hash-of-passphrase-64-hex-chars",
  "metadata": {
    "timestamp": 1699564800000,
    "originalSize": 1048576
  }
}
```

**Field Descriptions:**
- `blob` (string, required): Base64-encoded encrypted blob data
- `storageKey` (string, required): SHA-256 hash of user's passphrase (64 hex characters)
- `metadata.timestamp` (number, required): Upload timestamp in milliseconds
- `metadata.originalSize` (number, required): Original unencrypted data size in bytes

#### Response

**Success (200 OK):**
```json
{
  "success": true,
  "uploadedAt": "2025-11-12T10:30:00.000Z",
  "blobSize": 1048576,
  "storageKeyHash": "a1b2c3d4",
  "versionId": "a1b2c3d4...e5f6-1699564800000.blob"
}
```

**Field Descriptions:**
- `uploadedAt` (string): ISO 8601 timestamp of upload
- `blobSize` (number): Size of encrypted blob in bytes
- `storageKeyHash` (string): First 8 characters of storage key (for verification)
- `versionId` (string): Unique blob identifier for this backup version

**Error Responses:**

| Status | Code | Description |
|--------|------|-------------|
| 400 | `INVALID_REQUEST` | Missing required fields or invalid format |
| 413 | `PAYLOAD_TOO_LARGE` | Blob exceeds 1GB size limit |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many uploads (max 10/hour per storage key) |
| 503 | `STORAGE_NOT_CONFIGURED` | Blob Storage credentials not configured |
| 503 | `UPLOAD_FAILED` | Blob Storage service unavailable |

**Rate Limit Headers (429 Response):**
- `Retry-After`: Seconds until rate limit resets
- `X-RateLimit-Limit`: Maximum requests per time window (10)
- `X-RateLimit-Remaining`: Requests remaining (0)
- `X-RateLimit-Reset`: Unix timestamp when limit resets

#### Example Request

```bash
curl -X POST https://your-app.vercel.app/api/sync/upload \
  -H "Content-Type: application/json" \
  -d '{
    "blob": "U2FsdGVkX1+...[base64 encrypted data]...",
    "storageKey": "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
    "metadata": {
      "timestamp": 1699564800000,
      "originalSize": 1048576
    }
  }'
```

---

### 2. Download Backup

**`GET /api/sync/download`**

Download the most recent encrypted backup blob from cloud storage.

#### Request

**Query Parameters:**
- `storageKey` (string, required): SHA-256 hash of user's passphrase (64 hex characters)

#### Response

**Success (200 OK):**

Binary stream with encrypted blob data.

**Headers:**
- `Content-Type: application/octet-stream`
- `Content-Length: {blob-size-in-bytes}`
- `Last-Modified: {upload-timestamp-UTC}`

**Error Responses:**

| Status | Code | Description |
|--------|------|-------------|
| 400 | `INVALID_REQUEST` | Missing or invalid storageKey parameter |
| 404 | `NOT_FOUND` | No backup found for this passphrase |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many downloads (max 5/minute per storage key) |
| 503 | `STORAGE_NOT_CONFIGURED` | Blob Storage credentials not configured |
| 503 | `DOWNLOAD_FAILED` | Blob Storage service unavailable |

**Rate Limit Headers (429 Response):**
- `Retry-After`: Seconds until rate limit resets
- `X-RateLimit-Limit`: Maximum requests per time window (5)
- `X-RateLimit-Remaining`: Requests remaining (0)
- `X-RateLimit-Reset`: Unix timestamp when limit resets

#### Example Request

```bash
curl -X GET "https://your-app.vercel.app/api/sync/download?storageKey=a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2" \
  --output backup.blob
```

#### Multiple Backup Versions

If multiple backup versions exist for the same storage key (e.g., backups from different dates), the API automatically returns the **most recent backup**. Versions are identified by timestamp in the blob filename (`{storageKey}-{timestamp}.blob`).

---

### 3. Cleanup (Cron Job)

**`GET /api/sync/cleanup`**

Internal cron job endpoint for automatic cleanup of old backups. **Not intended for client use.**

#### Authorization

Requires `Authorization: Bearer {CRON_SECRET}` header (provided by Vercel Cron).

#### Schedule

Runs daily at **2:00 AM UTC** via Vercel Cron.

#### Retention Policy

- **Minimum Retention**: 90 days
- **Safety Mechanism**: Most recent backup per user is **never deleted**, regardless of age
- **Cleanup Rule**: Deletes backups older than 90 days (except most recent)

#### Response

```json
{
  "success": true,
  "deletedCount": 42,
  "preservedCount": 138,
  "totalScanned": 180,
  "duration": 3456,
  "timestamp": "2025-11-12T02:00:00.000Z"
}
```

---

## Error Response Format

All API errors return a structured JSON response:

```json
{
  "error": "ERROR_TYPE",
  "code": "ERROR_CODE",
  "message": "Human-readable error description",
  "timestamp": "2025-11-12T10:30:00.000Z"
}
```

### Common Error Codes

| Code | Description | Resolution |
|------|-------------|------------|
| `INVALID_REQUEST` | Missing or malformed request data | Check request body/parameters |
| `INVALID_STORAGE_KEY` | Storage key is not valid SHA-256 hash | Ensure 64-character hex string |
| `PAYLOAD_TOO_LARGE` | Blob exceeds 1GB limit | Reduce backup size or contact support |
| `RATE_LIMIT_EXCEEDED` | Too many requests | Wait for Retry-After period |
| `NOT_FOUND` | No backup found | Verify passphrase or create new backup |
| `UPLOAD_FAILED` | Storage service error | Retry upload |
| `DOWNLOAD_FAILED` | Storage retrieval error | Retry download |
| `STORAGE_NOT_CONFIGURED` | Server configuration issue | Contact support |

---

## Rate Limiting

**Note:** Rate limiting is **optional** and not required for MVP or limited testing. The API works fine without it. Configure Vercel KV or Upstash Redis only when you need abuse prevention in production.

### Upload Rate Limits

- **Limit**: 10 uploads per hour per storage key (when configured)
- **Window**: Sliding window (1 hour)
- **Scope**: Per storage key (passphrase hash), not per IP
- **Status Code**: 429 with `Retry-After` header
- **Without Rate Limiting**: Unlimited uploads (acceptable for MVP)

### Download Rate Limits

- **Limit**: 5 downloads per minute per storage key (when configured)
- **Window**: Sliding window (1 minute)
- **Scope**: Per storage key (passphrase hash), not per IP
- **Status Code**: 429 with `Retry-After` header
- **Without Rate Limiting**: Unlimited downloads (acceptable for MVP)

### Rate Limit Headers

All API responses include rate limit information:

```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1699568400
```

---

## Storage Limits and Retention

### Per-User Storage Limits

- **Maximum Blob Size**: 1GB per backup
- **Typical Usage**: ~1-2MB for 1-2 years of symptom data
- **Quota Monitoring**: System monitors actual usage and adjusts limits

### Retention Policy

- **Minimum Retention**: 90 days for all backups
- **Most Recent Backup**: Never deleted (safety mechanism)
- **Automatic Cleanup**: Daily at 2 AM UTC via cron job
- **Versioning**: Multiple backups supported, automatic selection of most recent

### Total Project Quota

- **Current Allocation**: Scaled based on user base
- **Monitoring**: Alerts at 80% capacity threshold
- **Growth Plan**: Automatic scaling as needed

---

## Security Notes

### Zero-Knowledge Architecture

1. **Client-Side Encryption**: All encryption happens in the browser using Web Crypto API
2. **Storage Key Derivation**: `SHA-256(passphrase)` → storage key (server never sees passphrase)
3. **Server Role**: Store and retrieve encrypted blobs only
4. **No Server-Side Decryption**: Server has no decryption keys or ability to decrypt data

### Passphrase Security

- **User Responsibility**: User must remember passphrase (not stored anywhere)
- **Lost Passphrase**: Data is irrecoverable (zero-knowledge tradeoff)
- **Strong Passphrases**: Recommend 12+ characters with mix of types
- **Storage Key**: SHA-256 hash prevents reverse-engineering

### Logging Security

Server logs include:
- ✅ Timestamp, operation type, success/failure
- ✅ Storage key hash (first 8 chars only)
- ✅ Blob size, duration, error codes

Server logs **never** include:
- ❌ User passphrases
- ❌ Full storage keys (only first 8 chars)
- ❌ Unencrypted data content
- ❌ Personal identifiable information (PII)

### Public Blob Access

Blobs are stored with `public` access in Vercel Blob Storage:
- **Safe Because**: All blobs are fully encrypted
- **Advantage**: No authentication needed for downloads (simpler architecture)
- **Security**: Passphrase required for decryption (possession-based security)

---

## Environment Variables Setup

### Required Variables

Configure these variables in your Vercel project settings:

#### Production Environment

```bash
# Vercel Blob Storage credentials (REQUIRED)
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
BLOB_STORE_NAME=symptom-tracker-backups

# Rate limiting (OPTIONAL - recommended for production, not required for MVP)
# Option A: Vercel KV (Recommended - auto-configured when you create KV store)
KV_REST_API_URL=https://xxxxx.kv.vercel-storage.com
KV_REST_API_TOKEN=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Option B: Upstash Redis (Alternative external service)
# UPSTASH_REDIS_REST_URL=https://us1-xxxxx.upstash.io
# UPSTASH_REDIS_REST_TOKEN=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Cron job authorization (REQUIRED)
CRON_SECRET=your-secure-random-secret-here
```

#### Preview Environment (PR deploys)

Use **separate** Blob store and optionally separate KV store for testing:

```bash
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_PREVIEW_TOKEN
BLOB_STORE_NAME=symptom-tracker-backups-preview
KV_REST_API_URL=https://preview-xxxxx.kv.vercel-storage.com  # Optional
KV_REST_API_TOKEN=PREVIEW_TOKEN  # Optional
CRON_SECRET=preview-cron-secret
```

#### Development Environment (local)

Use **separate** Blob store and optionally separate KV store for local development:

```bash
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_DEV_TOKEN
BLOB_STORE_NAME=symptom-tracker-backups-dev
KV_REST_API_URL=https://dev-xxxxx.kv.vercel-storage.com  # Optional
KV_REST_API_TOKEN=DEV_TOKEN  # Optional
CRON_SECRET=dev-cron-secret
```

### Setup Steps

1. **Create Vercel Blob Store** (REQUIRED):
   - Go to Vercel dashboard → Storage → Blob
   - Create new store: `symptom-tracker-backups`
   - Generate read/write token
   - Copy token to `BLOB_READ_WRITE_TOKEN`

2. **Enable Rate Limiting** (OPTIONAL - Recommended for Production):

   **Option A: Vercel KV (Recommended)**
   - Go to Vercel dashboard → Storage → KV → Create Database
   - Link to your project (auto-configures `KV_REST_API_URL` and `KV_REST_API_TOKEN`)
   - No manual configuration needed!

   **Option B: Upstash Redis (Alternative)**
   - Go to [Upstash Console](https://console.upstash.com/)
   - Create new Redis database
   - Copy REST URL and token
   - Add to `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`

   **Option C: Skip Rate Limiting (MVP/Testing)**
   - Don't configure any KV/Redis variables
   - API will work without rate limiting (acceptable for limited user testing)

3. **Generate Cron Secret** (REQUIRED):
   ```bash
   # Generate secure random secret
   openssl rand -base64 32
   ```
   - Add to `CRON_SECRET` environment variable

4. **Configure in Vercel**:
   - Go to Vercel project → Settings → Environment Variables
   - Add each variable with appropriate scope (Production/Preview/Development)
   - Redeploy to apply changes

### Testing Environment Variables

After configuration, test access from edge functions:

```typescript
// Check if variables are accessible
if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error("BLOB_READ_WRITE_TOKEN not configured");
}

// Check if rate limiting is configured (optional)
if (!process.env.KV_REST_API_URL && !process.env.UPSTASH_REDIS_REST_URL) {
  console.warn("Rate limiting not configured - API will work without limits");
}

// Test Blob Storage connection
import { list } from '@vercel/blob';
const { blobs } = await list({ token: process.env.BLOB_READ_WRITE_TOKEN });
console.log(`Connected to Blob Storage: ${blobs.length} blobs found`);
```

---

## Usage Examples

### Complete Backup Flow

```javascript
// Client-side: Encrypt and upload backup

// 1. Get user's passphrase
const passphrase = prompt("Enter secure passphrase for backup:");

// 2. Derive storage key (SHA-256 hash)
const encoder = new TextEncoder();
const passphraseData = encoder.encode(passphrase);
const hashBuffer = await crypto.subtle.digest('SHA-256', passphraseData);
const storageKey = Array.from(new Uint8Array(hashBuffer))
  .map(b => b.toString(16).padStart(2, '0'))
  .join('');

// 3. Encrypt data (using Web Crypto API - see Story 7.2 for details)
const encryptedData = await encryptData(backupData, passphrase);

// 4. Upload to cloud
const response = await fetch('/api/sync/upload', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    blob: btoa(encryptedData), // Convert to base64
    storageKey: storageKey,
    metadata: {
      timestamp: Date.now(),
      originalSize: backupData.length
    }
  })
});

const result = await response.json();
console.log('Backup uploaded:', result.uploadedAt);
```

### Complete Restore Flow

```javascript
// Client-side: Download and decrypt backup

// 1. Get user's passphrase
const passphrase = prompt("Enter passphrase to restore backup:");

// 2. Derive storage key
const storageKey = await deriveStorageKey(passphrase); // Same as backup

// 3. Download encrypted blob
const response = await fetch(
  `/api/sync/download?storageKey=${storageKey}`
);

if (response.status === 404) {
  alert('No backup found for this passphrase. Please verify your passphrase.');
  return;
}

const encryptedBlob = await response.blob();

// 4. Decrypt data
const decryptedData = await decryptData(encryptedBlob, passphrase);

// 5. Restore to IndexedDB
await restoreDatabase(decryptedData);
console.log('Backup restored successfully!');
```

---

## Monitoring and Debugging

### Vercel Logs

All API operations are logged to Vercel logs in structured JSON format:

```json
{
  "timestamp": "2025-11-12T10:30:00.000Z",
  "operation": "upload",
  "storageKeyHash": "a1b2c3d4",
  "blobSize": 1048576,
  "success": true,
  "duration": 234
}
```

### Accessing Logs

**Via Vercel Dashboard:**
1. Go to your project → Logs
2. Filter by `/api/sync/upload` or `/api/sync/download`
3. Look for structured JSON log entries

**Via Vercel CLI:**
```bash
vercel logs --follow
```

### Common Issues

| Issue | Symptoms | Solution |
|-------|----------|----------|
| Missing env variables | 503 STORAGE_NOT_CONFIGURED | Configure BLOB_READ_WRITE_TOKEN |
| Rate limiting not working | No 429 errors even with many requests | Rate limiting is optional - configure KV_REST_API_URL or UPSTASH_REDIS_REST_URL if needed |
| Rate limit hit | 429 responses | Wait for Retry-After period (or disable rate limiting for testing) |
| Invalid passphrase | 404 NOT_FOUND | Verify passphrase is correct |
| Large backups | 413 PAYLOAD_TOO_LARGE | Reduce backup size (<1GB) |
| Storage outage | 503 UPLOAD/DOWNLOAD_FAILED | Retry after delay |

---

## Future Enhancements

Potential improvements for future iterations:

1. **Backup History UI**: View and manage multiple backup versions
2. **Automatic Backups**: Schedule periodic automatic backups
3. **Backup Verification**: Integrity checks before restore
4. **Cross-Device Sync**: Real-time sync (future Epic 8)
5. **Compression**: Reduce backup sizes with compression
6. **Partial Restore**: Restore specific data ranges
7. **Backup Sharing**: Securely share backups with healthcare providers

---

## API Changelog

### Version 1.0 (Epic 7.1 - November 2025)

- Initial release
- Upload and download endpoints
- Rate limiting (10 uploads/hour, 5 downloads/minute)
- Automatic retention (90 days)
- Zero-knowledge encryption
- Vercel Edge Functions deployment

---

*For technical questions or support, refer to the main project documentation or contact the development team.*
