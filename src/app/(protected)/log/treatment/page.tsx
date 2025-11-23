"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { TreatmentQuickLogForm } from "@/components/treatment-logging/TreatmentQuickLogForm";

/**
 * Treatment Logging Page
 *
 * Dedicated page for treatment logging.
 * Features:
 * - Full-page layout with natural scrolling
 * - Collapsible categories with smart defaults
 * - Quick log mode for essential fields
 * - Expandable details section for optional fields
 * - Mobile-optimized with proper touch targets
 */
export default function LogTreatmentPage() {
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
                <h1 className="text-xl font-semibold text-foreground">Log Treatment</h1>
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
                    <li className="text-foreground font-medium">Log Treatment</li>
                </ol>
            </nav>

            {/* Content area with natural scrolling */}
            <div className="container mx-auto max-w-2xl px-4 pb-8">
                <TreatmentQuickLogForm userId={userId} />
            </div>
        </main>
    );
}
