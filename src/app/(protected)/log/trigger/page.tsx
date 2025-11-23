"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { TriggerQuickLogForm } from "@/components/trigger-logging/TriggerQuickLogForm";

/**
 * Trigger Logging Page (Story 3.5.5)
 *
 * Dedicated page for trigger logging, replacing the previous modal interface.
 * Features:
 * - Full-page layout with natural scrolling
 * - Collapsible categories with smart defaults (Common, Environmental, Physical, Emotional, Lifestyle)
 * - Quick log mode for essential fields
 * - Expandable details section for optional fields (notes, intensity)
 * - Mobile-optimized with proper touch targets
 *
 * AC3.5.5.1: Dedicated page route at /log/trigger
 * AC3.5.5.3: Collapsible categories for triggers
 * AC3.5.5.5: Quick log mode with Add Details expansion
 * AC3.5.5.7: Mobile-responsive design
 */
export default function LogTriggerPage() {
  const router = useRouter();
  const { userId, isLoading } = useCurrentUser();

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
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
      <main className="min-h-screen bg-background">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Please log in to continue</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header with back button */}
      <header className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3 flex items-center gap-4 shadow-sm">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-muted rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Go back to previous page"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-xl font-semibold text-foreground">Log Trigger</h1>
      </header>

      {/* Breadcrumb navigation */}
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
          <li className="text-foreground font-medium">Log Trigger</li>
        </ol>
      </nav>

      {/* Content area with natural scrolling - AC3.5.5.1 */}
      <div className="container mx-auto max-w-2xl px-4 pb-8">
        <TriggerQuickLogForm userId={userId} />
      </div>
    </main>
  );
}
