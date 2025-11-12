# Story 7.1: Cloud Sync Infrastructure Setup

Status: ready-for-dev

## Story

As a developer implementing cloud sync,
I want Vercel Blob Storage configured with edge functions for upload/download,
so that we have secure cloud storage infrastructure ready for encrypted backups.

## Acceptance Criteria

1. **AC7.1.1 — Vercel Blob Storage project setup:** Initialize Vercel Blob Storage in the symptom-tracker Vercel project with appropriate storage limits configured for health data backups. Configure retention policy for encrypted backup blobs (minimum 90-day retention, automatic cleanup of older backups). Set storage quota limits (initial: 1GB per user backup, monitor and adjust based on actual usage). Add Vercel Blob Storage SDK to project dependencies (`@vercel/blob` npm package). Configure environment variables for Blob Storage credentials in Vercel project settings (BLOB_READ_WRITE_TOKEN). Test Blob Storage connection and permissions from development environment. [Source: docs/epics.md#Story-7.1, AC #1]

2. **AC7.1.2 — Create `/api/sync/upload` edge function:** Implement Vercel edge function at `/api/sync/upload` that accepts encrypted blob uploads from client. Function accepts POST request with: encrypted blob data (binary), storage key (SHA-256 hash of passphrase), metadata (timestamp, original size). Generate unique blob identifier combining storage key + timestamp for versioning (allows multiple backups per user). Store encrypted blob in Vercel Blob Storage using `put()` API with storage key as filename. Return response metadata: upload timestamp (ISO 8601), blob size in bytes, storage key hash (for client verification), blob version ID. Implement proper HTTP status codes: 200 (success), 413 (payload too large), 503 (storage unavailable). Edge function runs on Vercel Edge Network for low latency. [Source: docs/epics.md#Story-7.1, AC #2]

3. **AC7.1.3 — Create `/api/sync/download` edge function:** Implement Vercel edge function at `/api/sync/download` that retrieves encrypted blobs for restore. Function accepts GET request with query parameter: storage key (SHA-256 hash of passphrase). Retrieve encrypted blob from Vercel Blob Storage using `get()` API with storage key. If multiple versions exist (timestamped backups), return most recent backup by default. Return encrypted blob data (binary stream) with headers: Content-Type: application/octet-stream, Content-Length (blob size), Last-Modified (upload timestamp). Implement proper HTTP status codes: 200 (success), 404 (blob not found), 503 (storage unavailable). Edge function streams blob efficiently without loading entire file into memory. [Source: docs/epics.md#Story-7.1, AC #3]

4. **AC7.1.4 — Error handling for edge functions:** Implement comprehensive error handling in both upload and download edge functions. Handle upload errors: blob not found (404 - "No backup found for this passphrase"), storage quota exceeded (413 - "Storage limit exceeded, contact support"), invalid request format (400 - "Invalid request body or parameters"), network failures (503 - "Service temporarily unavailable"). Handle download errors: blob not found (404 - "No backup found for this passphrase"), corrupted blob data (500 - "Backup data corrupted, try different backup version"), network failures (503 - "Service temporarily unavailable"). Return structured JSON error responses: `{ error: string, code: string, message: string, timestamp: ISO8601 }`. Log all errors to Vercel logs for debugging (timestamp, operation, storage key hash - never log passphrase, success/failure, error details). [Source: docs/epics.md#Story-7.1, AC #4]

5. **AC7.1.5 — Rate limiting for abuse prevention:** Implement rate limiting on edge functions to prevent abuse and ensure fair usage. Upload rate limits: max 10 uploads per hour per passphrase hash (storage key), 429 status code if exceeded with Retry-After header. Download rate limits: max 5 downloads per minute per passphrase hash, 429 status code if exceeded with Retry-After header. Use Vercel Edge Config or upstash/ratelimit for distributed rate limiting across edge nodes. Track rate limits by storage key hash (not IP address - users may sync from different networks). Store rate limit state in ephemeral edge storage (Redis/KV) with automatic expiration. Return clear rate limit headers: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset. [Source: docs/epics.md#Story-7.1, AC #5]

6. **AC7.1.6 — Operation logging for debugging:** Implement comprehensive logging for all cloud sync operations without exposing sensitive data. Log upload operations: timestamp (ISO 8601), operation type ("upload"), storage key hash (first 8 chars only - never full key), blob size in bytes, success/failure status, error code if failure, duration (ms), edge region. Log download operations: timestamp, operation type ("download"), storage key hash (first 8 chars), blob size, success/failure, error code if failure, duration (ms), edge region. Use Vercel's built-in logging (console.log/error writes to Vercel logs). Never log: user passphrases, full storage keys, unencrypted data content, personal identifiable information. Structured log format (JSON) for easy parsing and monitoring. Logs accessible via Vercel dashboard and CLI for debugging production issues. [Source: docs/epics.md#Story-7.1, AC #6]

7. **AC7.1.7 — Blob retention policy and storage limits:** Configure appropriate retention policy and storage limits for health data backups. Retention policy: minimum 90-day retention for encrypted backups, automatic cleanup of backups older than 90 days (configurable), keep most recent backup per user regardless of age (prevent accidental data loss). Storage limits per user: initial limit 1GB (sufficient for ~1-2 years of symptom data), monitor actual usage and adjust limits based on real-world data, warn users approaching limit (via UI in Story 7.4). Total project storage quota: monitor and scale as user base grows, set alerts at 80% capacity threshold. Implement storage cleanup cron job (Vercel Cron): runs daily at 2 AM UTC, identifies and deletes backups older than retention period, logs cleanup operations. [Source: docs/epics.md#Story-7.1, AC #7]

8. **AC7.1.8 — Test edge functions with mock data:** Create comprehensive test suite for edge functions using mock encrypted data payloads. Upload function tests: successful upload with valid blob, upload with oversized blob (>1GB), upload with invalid storage key format, upload exceeding rate limit, upload during storage outage (503 error). Download function tests: successful download with existing blob, download with non-existent storage key (404), download with corrupted blob data, download exceeding rate limit, download during storage outage. Integration tests: complete upload → download cycle with mock encrypted JSON, verify blob integrity (uploaded bytes = downloaded bytes), test multiple backup versions (timestamps), test blob retrieval with partial storage key match. Mock data includes: realistic encrypted blob sizes (1KB-10MB), valid storage key hashes (SHA-256 format), various timestamp formats. [Source: docs/epics.md#Story-7.1, AC #8]

9. **AC7.1.9 — API endpoint documentation:** Create comprehensive API documentation for cloud sync endpoints in `docs/api/cloud-sync.md`. Documentation includes: endpoint overview (purpose, authentication model, security considerations), API specifications (HTTP method, URL, headers, request body, response format, status codes), usage examples with curl commands, error response catalog with resolution steps, rate limiting policies, storage limits and retention policy, security notes (client-side encryption, zero-knowledge architecture, passphrase security). Include request/response examples: upload example (POST /api/sync/upload with encrypted blob), download example (GET /api/sync/download?storageKey=...), error examples (404, 413, 429, 503). Document storage key derivation (SHA-256 hash of passphrase - explain for future developers). Markdown format with code examples and tables for easy reference. [Source: docs/epics.md#Story-7.1, AC #9]

10. **AC7.1.10 — Environment variables configured:** Configure all required environment variables for Vercel Blob Storage in Vercel project settings. Required variables: BLOB_READ_WRITE_TOKEN (Vercel Blob Storage access token with read/write permissions), BLOB_STORE_NAME (Vercel Blob store identifier - e.g., "symptom-tracker-backups"), RATE_LIMIT_REDIS_URL (optional - for distributed rate limiting, if using upstash). Configure variables in Vercel dashboard for: Production environment (main branch deploys), Preview environments (PR deploys - use separate test Blob store), Development environment (local development - use separate test Blob store). Document environment variable setup in `docs/api/cloud-sync.md` Setup section. Test environment variable access from edge functions: verify BLOB_READ_WRITE_TOKEN is accessible, verify connection to Blob Storage succeeds, log warning if required variables missing. [Source: docs/epics.md#Story-7.1, AC #10]

## Tasks / Subtasks

- [ ] Task 1: Initialize Vercel Blob Storage in project (AC: #7.1.1)
  - [ ] 1.1: Install @vercel/blob npm package (`npm install @vercel/blob`)
  - [ ] 1.2: Create Vercel Blob Store in Vercel dashboard (name: "symptom-tracker-backups")
  - [ ] 1.3: Generate Blob Storage access token (read/write permissions)
  - [ ] 1.4: Configure storage quota (1GB per user backup)
  - [ ] 1.5: Configure retention policy (90-day minimum, keep most recent)
  - [ ] 1.6: Add BLOB_READ_WRITE_TOKEN to Vercel environment variables
  - [ ] 1.7: Test Blob Storage connection from development environment
  - [ ] 1.8: Verify permissions (read, write, delete operations)

- [ ] Task 2: Create /api/sync/upload edge function (AC: #7.1.2)
  - [ ] 2.1: Create directory structure: `/api/sync/upload/route.ts`
  - [ ] 2.2: Import Vercel Blob SDK (`import { put } from '@vercel/blob'`)
  - [ ] 2.3: Define request handler: `export async function POST(request: Request)`
  - [ ] 2.4: Parse request body: extract encrypted blob data, storage key, metadata
  - [ ] 2.5: Validate request: check blob size (<1GB), validate storage key format (SHA-256)
  - [ ] 2.6: Generate blob identifier: `${storageKey}-${timestamp}.blob`
  - [ ] 2.7: Upload blob to Vercel Blob Storage using `put()` API
  - [ ] 2.8: Handle upload errors (413, 503) and return appropriate status codes
  - [ ] 2.9: Return success response with metadata (upload timestamp, blob size, storage key hash)
  - [ ] 2.10: Add console logging (timestamp, operation, storage key hash, success/failure)

- [ ] Task 3: Create /api/sync/download edge function (AC: #7.1.3)
  - [ ] 3.1: Create directory structure: `/api/sync/download/route.ts`
  - [ ] 3.2: Import Vercel Blob SDK (`import { get, list } from '@vercel/blob'`)
  - [ ] 3.3: Define request handler: `export async function GET(request: Request)`
  - [ ] 3.4: Parse query parameter: extract storage key from URL
  - [ ] 3.5: List blobs matching storage key pattern (handle multiple versions)
  - [ ] 3.6: Select most recent backup if multiple versions exist (sort by timestamp)
  - [ ] 3.7: Retrieve blob using `get()` API
  - [ ] 3.8: Stream blob data in response (avoid loading full blob into memory)
  - [ ] 3.9: Set response headers: Content-Type, Content-Length, Last-Modified
  - [ ] 3.10: Handle download errors (404, 503) and return appropriate status codes
  - [ ] 3.11: Add console logging (timestamp, operation, storage key hash, success/failure)

- [ ] Task 4: Implement error handling for edge functions (AC: #7.1.4)
  - [ ] 4.1: Define error response schema: `{ error: string, code: string, message: string, timestamp: string }`
  - [ ] 4.2: Create error handler utility function for consistent error formatting
  - [ ] 4.3: Implement upload error handling: blob not found (404), quota exceeded (413), invalid format (400), network failures (503)
  - [ ] 4.4: Implement download error handling: blob not found (404), corrupted data (500), network failures (503)
  - [ ] 4.5: Add structured error logging (timestamp, operation, storage key hash, error details)
  - [ ] 4.6: Never log sensitive data (passphrases, full storage keys, unencrypted content)
  - [ ] 4.7: Test error handling with mock failures (network timeouts, storage unavailable)

- [ ] Task 5: Implement rate limiting (AC: #7.1.5)
  - [ ] 5.1: Decide on rate limiting approach (Vercel Edge Config vs upstash/ratelimit)
  - [ ] 5.2: Install rate limiting library if needed (`npm install @upstash/ratelimit`)
  - [ ] 5.3: Initialize rate limiter with Redis/KV connection
  - [ ] 5.4: Implement upload rate limit: max 10 uploads per hour per storage key
  - [ ] 5.5: Implement download rate limit: max 5 downloads per minute per storage key
  - [ ] 5.6: Return 429 status code when rate limit exceeded
  - [ ] 5.7: Add rate limit headers: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset
  - [ ] 5.8: Add Retry-After header for 429 responses
  - [ ] 5.9: Test rate limiting with multiple rapid requests

- [ ] Task 6: Implement operation logging (AC: #7.1.6)
  - [ ] 6.1: Define structured log format (JSON with timestamp, operation, storageKeyHash, etc.)
  - [ ] 6.2: Create logging utility function for consistent log formatting
  - [ ] 6.3: Add upload operation logging (timestamp, operation type, blob size, success/failure, duration)
  - [ ] 6.4: Add download operation logging (timestamp, operation type, blob size, success/failure, duration)
  - [ ] 6.5: Truncate storage key hash to first 8 chars for logging (never log full key)
  - [ ] 6.6: Never log passphrases, unencrypted data, or PII
  - [ ] 6.7: Test logging output in Vercel dashboard and CLI
  - [ ] 6.8: Verify logs are structured and parseable (JSON format)

- [ ] Task 7: Configure blob retention policy and storage limits (AC: #7.1.7)
  - [ ] 7.1: Set retention policy in Vercel Blob Storage: 90-day minimum
  - [ ] 7.2: Configure automatic cleanup of old backups (>90 days)
  - [ ] 7.3: Ensure most recent backup per user is never deleted (safety mechanism)
  - [ ] 7.4: Set per-user storage limit: 1GB (adjust based on actual usage)
  - [ ] 7.5: Set project-wide storage quota with 80% capacity alerts
  - [ ] 7.6: Create Vercel Cron job for daily cleanup (runs at 2 AM UTC)
  - [ ] 7.7: Implement cleanup logic: identify old blobs, delete safely, log operations
  - [ ] 7.8: Test cleanup job with mock old backups

- [ ] Task 8: Create test suite for edge functions (AC: #7.1.8)
  - [ ] 8.1: Create test directory: `/api/sync/__tests__/`
  - [ ] 8.2: Create mock encrypted blob data (1KB, 10MB, >1GB for quota tests)
  - [ ] 8.3: Create mock storage key hashes (valid SHA-256 format)
  - [ ] 8.4: Test upload function: successful upload, oversized blob, invalid key, rate limit, storage outage
  - [ ] 8.5: Test download function: successful download, non-existent key (404), corrupted data, rate limit, storage outage
  - [ ] 8.6: Integration test: complete upload → download cycle, verify blob integrity
  - [ ] 8.7: Test multiple backup versions (timestamp-based retrieval)
  - [ ] 8.8: Run tests in CI/CD pipeline (Vercel build process)

- [ ] Task 9: Write API documentation (AC: #7.1.9)
  - [ ] 9.1: Create documentation file: `docs/api/cloud-sync.md`
  - [ ] 9.2: Write overview section: purpose, authentication model, security considerations
  - [ ] 9.3: Document /api/sync/upload endpoint: method, URL, headers, request body, response format, status codes
  - [ ] 9.4: Document /api/sync/download endpoint: method, URL, query params, response format, status codes
  - [ ] 9.5: Add usage examples with curl commands for upload and download
  - [ ] 9.6: Create error response catalog with resolution steps
  - [ ] 9.7: Document rate limiting policies (10 uploads/hour, 5 downloads/min)
  - [ ] 9.8: Document storage limits and retention policy (90 days, 1GB per user)
  - [ ] 9.9: Add security notes: client-side encryption, zero-knowledge architecture, passphrase security
  - [ ] 9.10: Add request/response examples (upload, download, errors)

- [ ] Task 10: Configure environment variables (AC: #7.1.10)
  - [ ] 10.1: Add BLOB_READ_WRITE_TOKEN to Vercel environment variables (Production)
  - [ ] 10.2: Add BLOB_STORE_NAME to Vercel environment variables (Production)
  - [ ] 10.3: Add RATE_LIMIT_REDIS_URL if using upstash (Production)
  - [ ] 10.4: Configure same variables for Preview environment (use test Blob store)
  - [ ] 10.5: Configure same variables for Development environment (use test Blob store)
  - [ ] 10.6: Create separate test Blob stores for Preview/Development (avoid polluting production)
  - [ ] 10.7: Document environment variable setup in docs/api/cloud-sync.md
  - [ ] 10.8: Test environment variable access from edge functions
  - [ ] 10.9: Verify connection to Blob Storage succeeds with configured token
  - [ ] 10.10: Add logging for missing environment variables (warn if not configured)

## Dev Notes

### Technical Architecture

This story establishes the foundational cloud infrastructure for Epic 7's manual backup/restore system. The architecture uses Vercel Blob Storage as the cloud backend, Vercel Edge Functions for upload/download API endpoints, and implements security through client-side encryption and zero-knowledge design.

**Key Architecture Points:**
- **Vercel Blob Storage:** Managed object storage for encrypted backup blobs, automatic geo-distribution via Vercel Edge Network
- **Edge Functions:** Serverless API endpoints running on Vercel Edge Network for low latency globally
- **Zero-Knowledge Architecture:** Server never sees unencrypted data, all encryption/decryption happens client-side
- **Storage Key Design:** SHA-256 hash of user passphrase serves as blob identifier, prevents server from reverse-engineering passphrase
- **Versioning Strategy:** Blob filenames include timestamp (storageKey-timestamp.blob) to support multiple backups per user
- **Rate Limiting:** Distributed rate limiting via edge storage (Redis/KV) prevents abuse without blocking legitimate usage

### Storage Key Design

The storage key is critical to the zero-knowledge architecture:

```typescript
// Client-side (Story 7.2)
const passphrase = "user's secure passphrase";
const storageKey = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(passphrase));
const storageKeyHex = Array.from(new Uint8Array(storageKey))
  .map(b => b.toString(16).padStart(2, '0'))
  .join('');

// Edge function receives storage key (hash), never receives passphrase
// Server cannot reverse-engineer passphrase from SHA-256 hash
```

**Versioning with Timestamps:**
```typescript
// Blob identifier: storageKey + timestamp for multiple backups
const blobId = `${storageKeyHex}-${Date.now()}.blob`;

// Retrieval: list blobs matching pattern, select most recent
const blobs = await list({ prefix: storageKeyHex });
const mostRecent = blobs.blobs.sort((a, b) => b.uploadedAt - a.uploadedAt)[0];
```

### Edge Function Implementation Pattern

**Upload Function Structure:**
```typescript
// /api/sync/upload/route.ts
import { put } from '@vercel/blob';
import { Ratelimit } from '@upstash/ratelimit';

export async function POST(request: Request) {
  try {
    // 1. Parse request
    const { blob, storageKey, metadata } = await request.json();

    // 2. Validate inputs
    if (!blob || !storageKey) {
      return Response.json(
        { error: 'INVALID_REQUEST', message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 3. Check rate limit
    const ratelimit = new Ratelimit({ /* config */ });
    const { success } = await ratelimit.limit(storageKey);
    if (!success) {
      return Response.json(
        { error: 'RATE_LIMIT_EXCEEDED', message: 'Too many uploads' },
        { status: 429, headers: { 'Retry-After': '3600' } }
      );
    }

    // 4. Check blob size
    const blobSize = Buffer.from(blob, 'base64').length;
    if (blobSize > 1024 * 1024 * 1024) { // 1GB
      return Response.json(
        { error: 'PAYLOAD_TOO_LARGE', message: 'Backup exceeds 1GB limit' },
        { status: 413 }
      );
    }

    // 5. Upload to Blob Storage
    const blobId = `${storageKey}-${Date.now()}.blob`;
    const { url, downloadUrl } = await put(blobId, blob, {
      access: 'public', // Encrypted, so public access is safe
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    // 6. Log operation
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      operation: 'upload',
      storageKeyHash: storageKey.substring(0, 8),
      blobSize,
      success: true,
      duration: Date.now() - startTime,
    }));

    // 7. Return success response
    return Response.json({
      success: true,
      uploadedAt: new Date().toISOString(),
      blobSize,
      storageKeyHash: storageKey.substring(0, 8),
    });

  } catch (error) {
    // 8. Error handling
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      operation: 'upload',
      error: error.message,
      success: false,
    }));

    return Response.json(
      { error: 'UPLOAD_FAILED', message: 'Failed to upload backup' },
      { status: 503 }
    );
  }
}
```

**Download Function Structure:**
```typescript
// /api/sync/download/route.ts
import { get, list } from '@vercel/blob';

export async function GET(request: Request) {
  try {
    // 1. Parse query parameter
    const { searchParams } = new URL(request.url);
    const storageKey = searchParams.get('storageKey');

    if (!storageKey) {
      return Response.json(
        { error: 'INVALID_REQUEST', message: 'Missing storageKey parameter' },
        { status: 400 }
      );
    }

    // 2. Check rate limit (download)
    const ratelimit = new Ratelimit({ /* config */ });
    const { success } = await ratelimit.limit(storageKey);
    if (!success) {
      return Response.json(
        { error: 'RATE_LIMIT_EXCEEDED', message: 'Too many downloads' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }

    // 3. Find most recent backup
    const blobs = await list({ prefix: storageKey, token: process.env.BLOB_READ_WRITE_TOKEN });
    if (blobs.blobs.length === 0) {
      return Response.json(
        { error: 'NOT_FOUND', message: 'No backup found for this passphrase' },
        { status: 404 }
      );
    }

    const mostRecent = blobs.blobs.sort((a, b) =>
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    )[0];

    // 4. Retrieve blob
    const blob = await get(mostRecent.url, { token: process.env.BLOB_READ_WRITE_TOKEN });

    // 5. Log operation
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      operation: 'download',
      storageKeyHash: storageKey.substring(0, 8),
      blobSize: blob.size,
      success: true,
      duration: Date.now() - startTime,
    }));

    // 6. Stream blob data
    return new Response(blob.stream(), {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Length': blob.size.toString(),
        'Last-Modified': new Date(mostRecent.uploadedAt).toUTCString(),
      },
    });

  } catch (error) {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      operation: 'download',
      error: error.message,
      success: false,
    }));

    return Response.json(
      { error: 'DOWNLOAD_FAILED', message: 'Failed to retrieve backup' },
      { status: 503 }
    );
  }
}
```

### Rate Limiting Strategy

**Upload Rate Limit:** 10 uploads per hour per storage key
- Prevents abuse (mass uploads draining storage)
- Allows legitimate users to sync multiple times per day
- Hour-based window permits recovery from failed uploads

**Download Rate Limit:** 5 downloads per minute per storage key
- Prevents rapid-fire download attacks
- Allows users to retry failed downloads
- Minute-based window for quick recovery

**Implementation with Upstash:**
```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

// Upload rate limiter (10/hour)
const uploadRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 h'),
  analytics: true,
});

// Download rate limiter (5/minute)
const downloadRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 m'),
  analytics: true,
});

// Usage in edge function
const { success, limit, remaining, reset } = await uploadRatelimit.limit(storageKey);
```

### Retention Policy & Cleanup

**Retention Policy:**
- Minimum 90-day retention for all backups
- Most recent backup per user NEVER deleted (safety mechanism)
- Automatic cleanup via daily cron job

**Cleanup Implementation:**
```typescript
// /api/cron/cleanup-old-backups/route.ts
import { list, del } from '@vercel/blob';

export async function GET() {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 90); // 90 days ago

  const allBlobs = await list({ token: process.env.BLOB_READ_WRITE_TOKEN });

  // Group blobs by storage key
  const blobsByStorageKey = new Map();
  for (const blob of allBlobs.blobs) {
    const storageKey = blob.pathname.split('-')[0];
    if (!blobsByStorageKey.has(storageKey)) {
      blobsByStorageKey.set(storageKey, []);
    }
    blobsByStorageKey.get(storageKey).push(blob);
  }

  // For each storage key, keep most recent, delete old backups
  let deletedCount = 0;
  for (const [storageKey, blobs] of blobsByStorageKey) {
    // Sort by upload date (newest first)
    blobs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

    // Keep most recent (index 0)
    const mostRecent = blobs[0];

    // Delete old backups (>90 days AND not most recent)
    for (let i = 1; i < blobs.length; i++) {
      const blob = blobs[i];
      if (new Date(blob.uploadedAt) < cutoffDate) {
        await del(blob.url, { token: process.env.BLOB_READ_WRITE_TOKEN });
        deletedCount++;
        console.log(`Deleted old backup: ${blob.pathname}`);
      }
    }
  }

  return Response.json({ deletedCount, timestamp: new Date().toISOString() });
}
```

### Security Considerations

**Zero-Knowledge Architecture:**
- Server never sees unencrypted data (all encryption client-side)
- Server never sees user passphrases (only SHA-256 hashes)
- Server cannot decrypt backups (no decryption keys on server)
- Blob Storage contains only encrypted blobs (useless without passphrase)

**Logging Security:**
- Never log passphrases (client never sends them to server)
- Truncate storage key hashes to first 8 chars (prevent full key leakage)
- Never log unencrypted data content
- Never log personal identifiable information (PII)
- Structured JSON logs prevent injection attacks

**Rate Limiting Security:**
- Prevents brute-force attacks on storage keys
- Prevents DoS attacks (mass uploads/downloads)
- Per-storage-key limits (attacker cannot block all users)
- Reasonable limits allow legitimate usage patterns

### Testing Strategy

**Unit Tests:**
- Test edge function request parsing and validation
- Test error handling for various failure modes
- Test rate limiting logic with mock rate limiter
- Test storage key hash truncation for logging

**Integration Tests:**
- Complete upload → download cycle with mock encrypted blob
- Verify blob integrity (uploaded bytes === downloaded bytes)
- Test multiple backup versions (timestamp-based retrieval)
- Test rate limit enforcement with rapid requests
- Test blob cleanup with mock old backups

**Manual Testing:**
- Upload real encrypted blob from client (Story 7.2)
- Download blob and verify decryption works
- Test rate limiting by rapid uploads/downloads
- Verify Vercel logs show proper operation logging
- Test environment variable configuration in Vercel dashboard

**Edge Cases:**
- Upload blob exactly 1GB (at quota limit)
- Upload blob slightly over 1GB (should reject with 413)
- Download non-existent storage key (should return 404)
- Download with multiple backup versions (should return most recent)
- Rate limit exactly at threshold (should allow)
- Rate limit one over threshold (should return 429)

### Environment Variable Configuration

**Required Variables:**
```
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxx
BLOB_STORE_NAME=symptom-tracker-backups
RATE_LIMIT_REDIS_URL=redis://default:xxxxx@us1-xxxxx.upstash.io:6379
```

**Environment-Specific Configuration:**
- **Production:** Use production Blob store (symptom-tracker-backups)
- **Preview:** Use preview Blob store (symptom-tracker-backups-preview)
- **Development:** Use development Blob store (symptom-tracker-backups-dev)

**Setup in Vercel Dashboard:**
1. Navigate to Vercel project settings → Environment Variables
2. Add BLOB_READ_WRITE_TOKEN (from Vercel Blob Storage dashboard)
3. Add BLOB_STORE_NAME (production: symptom-tracker-backups)
4. Add RATE_LIMIT_REDIS_URL (from Upstash dashboard)
5. Set environment scope (Production, Preview, Development)
6. Save and redeploy

### Project Structure Notes

**Files to Create:**
```
api/
  ├── sync/
  │   ├── upload/
  │   │   └── route.ts (NEW - Upload edge function)
  │   └── download/
  │       └── route.ts (NEW - Download edge function)
  ├── cron/
  │   └── cleanup-old-backups/
  │       └── route.ts (NEW - Daily cleanup cron job)
  └── sync/
      └── __tests__/
          ├── upload.test.ts (NEW - Upload function tests)
          └── download.test.ts (NEW - Download function tests)

docs/
  └── api/
      └── cloud-sync.md (NEW - API documentation)
```

**Dependencies to Add:**
- `@vercel/blob` - Vercel Blob Storage SDK
- `@upstash/ratelimit` - Distributed rate limiting
- `@upstash/redis` - Redis client for rate limiting state

### References

- [Source: docs/epics.md#Story-7.1] - Story acceptance criteria and Epic 7 overview
- [Vercel Blob Storage Documentation](https://vercel.com/docs/storage/vercel-blob) - Vercel Blob API reference
- [Vercel Edge Functions Documentation](https://vercel.com/docs/functions/edge-functions) - Edge function runtime and APIs
- [Upstash Rate Limiting](https://upstash.com/docs/redis/sdks/ratelimit-ts/overview) - Distributed rate limiting library
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) - Client-side crypto for Story 7.2
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs) - Scheduled task configuration

## Dev Agent Record

### Context Reference

- docs/stories/7-1-cloud-sync-infrastructure-setup.context.xml

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

## Change Log

**Date: 2025-11-12 (Story Creation)**
- Created Story 7.1 - Cloud Sync Infrastructure Setup
- Defined 10 acceptance criteria for Vercel Blob Storage and edge functions
- Created 10 tasks with detailed subtasks (80+ total subtasks)
- Documented edge function implementation patterns, security considerations, and testing strategy
- Included storage key design, rate limiting strategy, and retention policy
- Added comprehensive Dev Notes with code examples and architecture diagrams
- Story ready for context generation and development
- Status: drafted, ready for story-ready workflow

---
