/**
 * API Route: /api/sync/cleanup (Cron Job)
 * - Runs daily at 2 AM UTC via Vercel Cron
 * - Deletes backups older than 90 days
 * - Always preserves most recent backup per user (safety mechanism)
 * - Logs all cleanup operations
 */

import { NextRequest, NextResponse } from "next/server";
import { list, del } from "@vercel/blob";

interface CleanupResult {
  success: boolean;
  deletedCount: number;
  preservedCount: number;
  totalScanned: number;
  duration: number;
  timestamp: string;
  errors?: string[];
}

/**
 * GET /api/sync/cleanup
 * Cleanup old backups (triggered by Vercel Cron)
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Verify cron authorization
    const authHeader = request.headers.get("authorization");
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

    if (!process.env.CRON_SECRET || authHeader !== expectedAuth) {
      console.error(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          operation: "cleanup",
          error: "UNAUTHORIZED",
          message: "Invalid or missing cron authorization",
        })
      );

      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if Blob Storage is configured
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          operation: "cleanup",
          error: "STORAGE_NOT_CONFIGURED",
          message: "Blob Storage token not configured",
        })
      );

      return NextResponse.json(
        { error: "Storage not configured" },
        { status: 503 }
      );
    }

    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        operation: "cleanup",
        status: "started",
      })
    );

    // Get all blobs
    const { blobs } = await list({
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    const totalScanned = blobs.length;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90); // 90 days ago

    // Group blobs by storage key (first 64 chars before timestamp)
    const blobsByStorageKey = new Map<string, typeof blobs>();

    for (const blob of blobs) {
      // Extract storage key from pathname (format: {storageKey}-{timestamp}.blob)
      const storageKey = blob.pathname.split("-")[0];
      if (!blobsByStorageKey.has(storageKey)) {
        blobsByStorageKey.set(storageKey, []);
      }
      blobsByStorageKey.get(storageKey)!.push(blob);
    }

    let deletedCount = 0;
    let preservedCount = 0;
    const errors: string[] = [];

    // For each storage key, delete old backups but preserve most recent
    for (const [storageKey, userBlobs] of blobsByStorageKey) {
      // Sort by upload date (newest first)
      const sortedBlobs = userBlobs.sort(
        (a, b) =>
          new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      );

      // Always preserve most recent backup (index 0)
      const mostRecent = sortedBlobs[0];
      preservedCount++;

      // Check remaining backups for deletion
      for (let i = 1; i < sortedBlobs.length; i++) {
        const blob = sortedBlobs[i];
        const uploadDate = new Date(blob.uploadedAt);

        if (uploadDate < cutoffDate) {
          // Blob is older than 90 days - delete it
          try {
            await del(blob.url, {
              token: process.env.BLOB_READ_WRITE_TOKEN,
            });
            deletedCount++;

            console.log(
              JSON.stringify({
                timestamp: new Date().toISOString(),
                operation: "cleanup",
                action: "deleted",
                pathname: blob.pathname,
                storageKeyHash: storageKey.substring(0, 8),
                uploadedAt: blob.uploadedAt,
                size: blob.size,
              })
            );
          } catch (error) {
            const errorMsg = `Failed to delete ${blob.pathname}: ${
              error instanceof Error ? error.message : "Unknown error"
            }`;
            errors.push(errorMsg);
            console.error(
              JSON.stringify({
                timestamp: new Date().toISOString(),
                operation: "cleanup",
                action: "delete_failed",
                pathname: blob.pathname,
                error: errorMsg,
              })
            );
          }
        } else {
          // Blob is newer than 90 days - preserve it
          preservedCount++;
        }
      }
    }

    const duration = Date.now() - startTime;
    const result: CleanupResult = {
      success: true,
      deletedCount,
      preservedCount,
      totalScanned,
      duration,
      timestamp: new Date().toISOString(),
      ...(errors.length > 0 && { errors }),
    };

    console.log(
      JSON.stringify({
        operation: "cleanup",
        status: "completed",
        ...result,
      })
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMsg =
      error instanceof Error ? error.message : "Unknown error";

    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        operation: "cleanup",
        status: "failed",
        error: errorMsg,
        duration,
      })
    );

    return NextResponse.json(
      {
        success: false,
        error: "Cleanup failed",
        message: errorMsg,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/sync/cleanup
 * Manual cleanup trigger (for testing/admin)
 */
export async function POST(request: NextRequest) {
  // Reuse GET handler logic
  return GET(request);
}
