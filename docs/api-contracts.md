# API Contracts

## Overview

This document details the API endpoints available in the Symptom Tracker application. The API is built using Next.js App Router Route Handlers.

## Endpoints

### Beta Signup

**POST** `/api/beta-signup`

Accepts beta signup email submissions, sends a welcome email with a verification code, and notifies the admin.

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Successfully signed up for beta access!",
  "verificationCode": "ABC12345"
}
```

**Error Responses:**
- 400 Bad Request: Invalid email or missing fields
- 503 Service Unavailable: Email service not configured or failed

---

### Correlation Analysis

**POST** `/api/correlation/compute`

Computes correlation between a specific food and symptom for a user. Returns cached results if available.

**Request Body:**

```json
{
  "userId": "user-uuid",
  "foodId": "food-uuid",
  "symptomId": "symptom-name",
  "startMs": 1672531200000,
  "endMs": 1675123200000
}
```

**Response (200 OK):**

```json
{
  "score": 0.85,
  "confidence": "high",
  "sampleSize": 12,
  "computedAt": 1675123200000,
  "fromCache": false
}
```

**GET** `/api/correlation/compute`

Retrieves cached correlation results. Read-only.

**Query Parameters:**
- `userId`: User UUID
- `foodId`: Food UUID
- `symptomId`: Symptom Name

**Response (200 OK):** Returns cached correlation object.
**Response (404 Not Found):** If no cache exists.

---

### Correlation Cron Job

**GET/POST** `/api/correlation/cron`

Triggered by Vercel Cron to incrementally recompute correlations for recent data.

**Headers:**
- `Authorization`: `Bearer ${CRON_SECRET}`

**Response (200 OK):**

```json
{
  "success": true,
  "results": {
    "usersProcessed": 10,
    "pairsComputed": 50,
    "cacheEntriesCreated": 50,
    "expiredEntriesCleaned": 5,
    "errors": [],
    "duration": 1234
  }
}
```

---

### Sync & Backup

**POST** `/api/sync/upload`

Uploads an encrypted backup blob to cloud storage.

**Request Body:**

```json
{
  "blob": "base64-encoded-encrypted-data",
  "storageKey": "sha256-hash-of-passphrase",
  "metadata": {
    "timestamp": 1675123200000,
    "originalSize": 1024
  }
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "uploadedAt": "2023-01-31T00:00:00.000Z",
  "blobSize": 1024,
  "storageKeyHash": "first-8-chars",
  "versionId": "blob-id"
}
```

**GET** `/api/sync/download`

Downloads the most recent encrypted backup.

**Query Parameters:**
- `storageKey`: SHA-256 hash of passphrase

**Response (200 OK):** Binary stream of encrypted blob.

**GET** `/api/sync/cleanup`

Cron job to delete backups older than 90 days (preserves most recent).

**Headers:**
- `Authorization`: `Bearer ${CRON_SECRET}`
