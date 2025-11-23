/**
 * API Route: /api/sync/upload
 * - Accepts encrypted blob uploads for cloud backup
 * - Implements rate limiting (10 uploads/hour per storage key)
 * - Returns upload metadata for client verification
 * - Zero-knowledge: server never sees unencrypted data or passphrases
 */

import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Error response interface
interface ErrorResponse {
  error: string;
  code: string;
  message: string;
  timestamp: string;
}

// Upload request interface
interface UploadRequest {
  blob: string; // base64 encoded encrypted blob
  storageKey: string; // SHA-256 hash of passphrase
  metadata: {
    timestamp: number;
    originalSize: number;
  };
}

// Upload response interface
interface UploadResponse {
  success: true;
  uploadedAt: string;
  blobSize: number;
  storageKeyHash: string; // First 8 chars only
  versionId: string;
}

// Initialize rate limiter (10 uploads per hour per storage key)
// Supports both Vercel KV (KV_REST_API_URL) and Upstash Redis (UPSTASH_REDIS_REST_URL)
const redis =
  process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
    ? Redis.fromEnv()
    : null;

const uploadRatelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "1 h"),
      analytics: true,
      prefix: "ratelimit:upload",
    })
  : null;

/**
 * Helper: Create structured error response
 */
function createErrorResponse(
  error: string,
  code: string,
  message: string,
  status: number
): NextResponse<ErrorResponse> {
  const errorResponse: ErrorResponse = {
    error,
    code,
    message,
    timestamp: new Date().toISOString(),
  };

  // Log error (without sensitive data)
  console.error(
    JSON.stringify({
      timestamp: errorResponse.timestamp,
      operation: "upload",
      error: code,
      message,
      status,
    })
  );

  return NextResponse.json(errorResponse, { status });
}

/**
 * Helper: Validate storage key format (SHA-256 hex string)
 */
function isValidStorageKey(key: string): boolean {
  // SHA-256 produces 64 hex characters
  return /^[a-f0-9]{64}$/i.test(key);
}

/**
 * Helper: Structured operation logging
 */
function logOperation(data: {
  operation: string;
  storageKeyHash: string;
  blobSize: number;
  success: boolean;
  duration: number;
  error?: string;
}) {
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      ...data,
    })
  );
}

/**
 * POST /api/sync/upload
 * Upload encrypted blob to Vercel Blob Storage
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Check if Blob Storage is configured
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return createErrorResponse(
        "STORAGE_NOT_CONFIGURED",
        "STORAGE_NOT_CONFIGURED",
        "Cloud storage is not configured. Please contact support.",
        503
      );
    }

    // Parse request body
    let body: UploadRequest;
    try {
      body = await request.json();
    } catch {
      return createErrorResponse(
        "INVALID_REQUEST",
        "INVALID_REQUEST",
        "Invalid JSON in request body",
        400
      );
    }

    const { blob, storageKey, metadata } = body;

    // Validate required fields
    if (!blob || !storageKey || !metadata) {
      return createErrorResponse(
        "MISSING_FIELDS",
        "INVALID_REQUEST",
        "Missing required fields: blob, storageKey, metadata",
        400
      );
    }

    // Validate storage key format
    if (!isValidStorageKey(storageKey)) {
      return createErrorResponse(
        "INVALID_STORAGE_KEY",
        "INVALID_REQUEST",
        "Storage key must be a valid SHA-256 hash (64 hex characters)",
        400
      );
    }

    // Check rate limit (10 uploads per hour per storage key)
    if (uploadRatelimit) {
      const { success, limit, remaining, reset } = await uploadRatelimit.limit(
        storageKey
      );

      if (!success) {
        const retryAfter = Math.ceil((reset - Date.now()) / 1000);
        return NextResponse.json(
          {
            error: "RATE_LIMIT_EXCEEDED",
            code: "RATE_LIMIT_EXCEEDED",
            message: "Too many uploads. Please try again later.",
            timestamp: new Date().toISOString(),
          },
          {
            status: 429,
            headers: {
              "Retry-After": retryAfter.toString(),
              "X-RateLimit-Limit": limit.toString(),
              "X-RateLimit-Remaining": "0",
              "X-RateLimit-Reset": reset.toString(),
            },
          }
        );
      }
    }

    // Decode base64 blob and check size (<1GB)
    let blobBuffer: Buffer;
    try {
      blobBuffer = Buffer.from(blob, "base64");
    } catch {
      return createErrorResponse(
        "INVALID_BLOB",
        "INVALID_REQUEST",
        "Blob data must be valid base64-encoded string",
        400
      );
    }

    const blobSize = blobBuffer.length;
    const MAX_SIZE = 1024 * 1024 * 1024; // 1GB

    if (blobSize > MAX_SIZE) {
      return createErrorResponse(
        "PAYLOAD_TOO_LARGE",
        "PAYLOAD_TOO_LARGE",
        `Backup exceeds 1GB limit. Size: ${(blobSize / 1024 / 1024).toFixed(2)}MB`,
        413
      );
    }

    // Generate unique blob identifier with timestamp for versioning
    const timestamp = Date.now();
    const blobId = `${storageKey}-${timestamp}.blob`;

    // Upload to Vercel Blob Storage
    try {
      const { url, downloadUrl } = await put(blobId, blobBuffer, {
        access: "public", // Encrypted, so public access is safe
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });

      // Log successful operation
      const duration = Date.now() - startTime;
      logOperation({
        operation: "upload",
        storageKeyHash: storageKey.substring(0, 8),
        blobSize,
        success: true,
        duration,
      });

      // Return success response
      const response: UploadResponse = {
        success: true,
        uploadedAt: new Date(timestamp).toISOString(),
        blobSize,
        storageKeyHash: storageKey.substring(0, 8),
        versionId: blobId,
      };

      return NextResponse.json(response, { status: 200 });
    } catch (error) {
      // Blob Storage upload failed
      const duration = Date.now() - startTime;
      logOperation({
        operation: "upload",
        storageKeyHash: storageKey.substring(0, 8),
        blobSize,
        success: false,
        duration,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      return createErrorResponse(
        "UPLOAD_FAILED",
        "UPLOAD_FAILED",
        "Failed to upload backup to cloud storage. Please try again.",
        503
      );
    }
  } catch (error) {
    // Unexpected error
    const duration = Date.now() - startTime;
    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        operation: "upload",
        error: error instanceof Error ? error.message : "Unknown error",
        success: false,
        duration,
      })
    );

    return createErrorResponse(
      "INTERNAL_ERROR",
      "INTERNAL_ERROR",
      "An unexpected error occurred. Please try again.",
      500
    );
  }
}
