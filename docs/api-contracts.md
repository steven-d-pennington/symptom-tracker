# API Contracts

**Project**: Pocket Symptom Tracker
**Last Updated**: 2025-11-04
**Architecture**: Next.js App Router API Routes

## Overview

The application uses Next.js 15 App Router API routes for server-side correlation computation. All routes are located in `src/app/api/` and handle food-symptom correlation analysis with caching.

## API Routes

### 1. Correlation Compute API

**Endpoint**: `/api/correlation/compute`

**Purpose**: Computes correlation for food-symptom pairs with intelligent caching

**Methods**:

#### POST - Compute Correlation

Computes or retrieves cached correlation for a specific food-symptom pair.

**Request Body**:
```json
{
  "userId": "string (required)",
  "foodId": "string (required)",
  "symptomId": "string (required)",
  "startMs": "number (optional, default: 30 days ago)",
  "endMs": "number (optional, default: now)"
}
```

**Response** (200 OK):
```json
{
  "correlation": {
    "foodId": "string",
    "symptomId": "string",
    "coefficient": "number",
    "pValue": "number",
    "sampleSize": "number",
    "confidence": "string"
  },
  "fromCache": "boolean",
  "cacheAge": "number (ms)",
  "computedAt": "number (timestamp)"
}
```

**Response** (400 Bad Request):
```json
{
  "error": "Missing required fields: userId, foodId, symptomId"
}
```

**Response** (500 Internal Server Error):
```json
{
  "error": "Failed to compute correlation"
}
```

#### GET - Retrieve Cached Correlation

Retrieves cached correlation (read-only, does not compute).

**Query Parameters**:
- `userId` (required): User identifier
- `foodId` (required): Food identifier
- `symptomId` (required): Symptom identifier

**Response** (200 OK):
```json
{
  "correlation": { },
  "fromCache": true,
  "cacheAge": "number (ms)"
}
```

**Response** (404 Not Found):
```json
{
  "error": "No cached correlation found. Use POST to compute."
}
```

---

### 2. Correlation Cron API

**Endpoint**: `/api/correlation/cron`

**Purpose**: Scheduled correlation recomputation triggered by Vercel Cron

**Methods**:

#### GET/POST - Execute Cron Job

Processes recent food-symptom pairs and cleans up expired cache entries.

**Authentication**:
- Requires `Authorization: Bearer ${CRON_SECRET}` header
- Vercel adds this automatically for scheduled cron jobs

**Configuration**:
- `RECOMPUTE_WINDOW_DAYS`: 30 (only recompute last 30 days)
- `MAX_PAIRS_PER_RUN`: 50 (limit pairs per run to avoid timeouts)

**Response** (200 OK):
```json
{
  "success": true,
  "results": {
    "usersProcessed": "number",
    "pairsComputed": "number",
    "cacheEntriesCreated": "number",
    "expiredEntriesCleaned": "number",
    "errors": ["string"],
    "duration": "number (ms)"
  }
}
```

**Response** (401 Unauthorized):
```json
{
  "error": "Unauthorized"
}
```

**Response** (500 Internal Server Error):
```json
{
  "success": false,
  "error": "string"
}
```

**Processing Logic**:
1. Clean up expired cache entries
2. Get recent food events and symptom instances (last 30 days)
3. Extract unique food IDs and symptom names
4. Generate food-symptom pairs (up to 50 per run)
5. Compute correlations using orchestration service
6. Cache all results

---

### 3. Enhanced Correlation API

**Endpoint**: `/api/correlation/enhanced`

**Purpose**: Computes both individual correlations AND combination effects for synergistic food combinations

**Methods**:

#### POST - Compute Enhanced Correlation

Computes correlations including food combination effects.

**Request Body**:
```json
{
  "userId": "string (required)",
  "symptomId": "string (required)",
  "startMs": "number (optional, default: 30 days ago)",
  "endMs": "number (optional, default: now)",
  "minSampleSize": "number (optional)"
}
```

**Response** (200 OK):
```json
{
  "individualCorrelations": [
    {
      "foodId": "string",
      "correlation": "number",
      "confidence": "string"
    }
  ],
  "combinations": [
    {
      "foodIds": ["string"],
      "correlation": "number",
      "confidence": "string",
      "synergyScore": "number"
    }
  ],
  "computedAt": "number (timestamp)"
}
```

**Response** (400 Bad Request):
```json
{
  "error": "Missing required fields: userId, symptomId"
}
```

**Response** (500 Internal Server Error):
```json
{
  "error": "Failed to compute enhanced correlation"
}
```

#### GET - Retrieve Enhanced Correlation

Retrieves enhanced correlations via query parameters.

**Query Parameters**:
- `userId` (required): User identifier
- `symptomId` (required): Symptom identifier
- `startMs` (optional): Start timestamp in milliseconds
- `endMs` (optional): End timestamp in milliseconds
- `minSampleSize` (optional): Minimum sample size for correlation

**Response**: Same as POST method

---

## Authentication & Security

**Current Implementation**:
- **Cron API**: Bearer token authentication via `CRON_SECRET` environment variable
- **Other APIs**: No authentication (client-side only, local-first architecture)

**Security Considerations**:
- All data operations are client-side using IndexedDB
- API routes only perform computational tasks
- No user authentication required (single-user PWA)
- Cron endpoint protected for production deployments

---

## Error Handling

All endpoints follow consistent error response format:

```json
{
  "error": "Human-readable error message"
}
```

**Standard HTTP Status Codes**:
- `200 OK`: Success
- `400 Bad Request`: Missing or invalid parameters
- `401 Unauthorized`: Authentication failure (cron only)
- `404 Not Found`: Resource not found (cached data)
- `500 Internal Server Error`: Server-side processing error

---

## Dependencies

**Internal Services**:
- `correlationOrchestrationService` - Orchestrates correlation computation
- `correlationCacheService` - Manages correlation caching
- `foodEventRepository` - Food event data access
- `symptomInstanceRepository` - Symptom data access

**External**:
- Vercel Cron (scheduled jobs)
- IndexedDB via Dexie v4 (client-side storage)

---

## Performance Considerations

**Caching Strategy**:
- Cache hit returns results immediately
- Cache miss triggers synchronous computation on first request
- Scheduled cron job pre-computes common correlations
- Expired entries cleaned up automatically

**Rate Limiting**:
- Cron job processes max 50 food-symptom pairs per run
- 30-day rolling window for recent data analysis

**Response Times**:
- Cached results: <50ms
- Synchronous computation: Variable (depends on data volume)
- Cron job: <10s (with 50 pair limit)

---

## Future Enhancements

**Planned Improvements**:
- Webhook-based async computation for large datasets
- Real-time correlation updates via WebSockets
- GraphQL endpoint for flexible querying
- Batch correlation computation API

**Under Consideration**:
- Authentication layer for multi-user support
- API rate limiting for production
- OpenAPI/Swagger documentation generation
