"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { SymptomQuickLogForm } from "@/components/symptom-logging/SymptomQuickLogForm";

/**
 * Symptom Logging Page (Story 3.5.3)
 *
 * Dedicated page for symptom logging, replacing the previous modal interface.
 * Features:
 * - Full-page layout with natural scrolling
 * - Quick log mode for essential fields
 * - Expandable details section for optional fields
 * - Mobile-optimized with proper touch targets
 *
 * AC3.5.3.1: Dedicated page route at /log/symptom
 * AC3.5.3.4: Natural page scrolling without nested containers
 * AC3.5.3.8: Mobile-responsive design
 */
export default function LogSymptomPage() {
  const router = useRouter();
  const { userId, isLoading } = useCurrentUser();

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!userId) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Please log in to continue</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header with back button */}
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-border px-4 py-3 flex items-center gap-4 shadow-sm">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          aria-label="Go back to previous page"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-xl font-semibold text-foreground">Log Symptom</h1>
      </header>

      {/* Breadcrumb navigation - AC3.5.3.5 */}
      <nav aria-label="Breadcrumb" className="container mx-auto max-w-2xl px-4 py-3">
        <ol className="flex items-center gap-2 text-sm text-muted-foreground">
          <li>
            <button
              onClick={() => router.push("/dashboard")}
              className="hover:text-foreground transition-colors"
            >
              Home
            </button>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-foreground font-medium">Log Symptom</li>
        </ol>
      </nav>

      {/* Content area with natural scrolling - AC3.5.3.4 */}
      <div className="container mx-auto max-w-2xl px-4 pb-8">
        <SymptomQuickLogForm userId={userId} />
      </div>
    </main>
  );
}
