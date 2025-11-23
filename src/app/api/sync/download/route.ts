/**
 * API Route: /api/sync/download
 * - Retrieves encrypted blob for restore operations
 * - Implements rate limiting (5 downloads/minute per storage key)
 * - Returns most recent backup if multiple versions exist
 * - Zero-knowledge: server never sees unencrypted data or passphrases
 */

import { NextRequest, NextResponse } from "next/server";
import { list } from "@vercel/blob";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Error response interface
interface ErrorResponse {
  error: string;
  code: string;
  message: string;
  timestamp: string;
}

// Initialize rate limiter (5 downloads per minute per storage key)
// Supports both Vercel KV (KV_REST_API_URL) and Upstash Redis (UPSTASH_REDIS_REST_URL)
const redis =
  process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
    ? Redis.fromEnv()
    : null;

const downloadRatelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 m"),
      analytics: true,
      prefix: "ratelimit:download",
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
      operation: "download",
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
  blobSize?: number;
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
 * GET /api/sync/download?storageKey={sha256-hash}
 * Download encrypted blob from Vercel Blob Storage
 */
export async function GET(request: NextRequest) {
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

    // Parse query parameter
    const { searchParams } = new URL(request.url);
    const storageKey = searchParams.get("storageKey");

    if (!storageKey) {
      return createErrorResponse(
        "MISSING_STORAGE_KEY",
        "INVALID_REQUEST",
        "Missing required query parameter: storageKey",
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

    // Check rate limit (5 downloads per minute per storage key)
    if (downloadRatelimit) {
      const { success, limit, remaining, reset } =
        await downloadRatelimit.limit(storageKey);

      if (!success) {
        const retryAfter = Math.ceil((reset - Date.now()) / 1000);
        return NextResponse.json(
          {
            error: "RATE_LIMIT_EXCEEDED",
            code: "RATE_LIMIT_EXCEEDED",
            message: "Too many downloads. Please try again later.",
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

    // Find most recent backup matching storage key
    try {
      const { blobs } = await list({
        prefix: storageKey,
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });

      if (blobs.length === 0) {
        const duration = Date.now() - startTime;
        logOperation({
          operation: "download",
          storageKeyHash: storageKey.substring(0, 8),
          success: false,
          duration,
          error: "NOT_FOUND",
        });

        return createErrorResponse(
          "NOT_FOUND",
          "NOT_FOUND",
          "No backup found for this passphrase. Please verify your passphrase or create a new backup.",
          404
        );
      }

      // Sort by uploadedAt (most recent first)
      const sortedBlobs = blobs.sort(
        (a, b) =>
          new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      );
      const mostRecent = sortedBlobs[0];

      // Retrieve blob data using fetch
      const response = await fetch(mostRecent.url);
      if (!response.ok) {
        throw new Error(`Failed to fetch blob: ${response.statusText}`);
      }
      const blobData = await response.blob();

      // Log successful operation
      const duration = Date.now() - startTime;
      logOperation({
        operation: "download",
        storageKeyHash: storageKey.substring(0, 8),
        blobSize: mostRecent.size,
        success: true,
        duration,
      });

      // Stream blob data to client
      return new Response(blobData, {
        status: 200,
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Length": mostRecent.size.toString(),
          "Last-Modified": new Date(mostRecent.uploadedAt).toUTCString(),
        },
      });
    } catch (error) {
      // Blob Storage retrieval failed
      const duration = Date.now() - startTime;
      logOperation({
        operation: "download",
        storageKeyHash: storageKey.substring(0, 8),
        success: false,
        duration,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      // Check if it's a 404 or other error
      if (error instanceof Error && error.message.includes("not found")) {
        return createErrorResponse(
          "NOT_FOUND",
          "NOT_FOUND",
          "No backup found for this passphrase.",
          404
        );
      }

      return createErrorResponse(
        "DOWNLOAD_FAILED",
        "DOWNLOAD_FAILED",
        "Failed to retrieve backup from cloud storage. Please try again.",
        503
      );
    }
  } catch (error) {
    // Unexpected error
    const duration = Date.now() - startTime;
    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        operation: "download",
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
