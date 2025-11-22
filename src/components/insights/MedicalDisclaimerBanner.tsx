/**
 * MedicalDisclaimerBanner Component for Insights (Story 6.4 - Task 9)
 *
 * Prominent medical disclaimer banner for insights page.
 * Displays warning about correlation vs. causation with dismissible functionality.
 * Persists dismissal in localStorage for 30 days.
 *
 * AC6.4.8: Add medical disclaimer banner
 */

'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

const DISCLAIMER_KEY = 'insights-disclaimer-dismissed';
const DISMISS_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

/**
 * MedicalDisclaimerBanner Component
 *
 * Features:
 * - Amber/yellow background for visibility
 * - AlertTriangle icon
 * - Dismissible with X button
 * - localStorage persistence (30 days)
 * - ARIA role="alert" for accessibility
 *
 * @returns Rendered disclaimer banner or null if dismissed
 */
export function MedicalDisclaimerBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Check localStorage on mount (client-side only)
  useEffect(() => {
    setIsClient(true);

    // Check if disclaimer was dismissed within last 30 days
    const dismissedTimestamp = localStorage.getItem(DISCLAIMER_KEY);

    if (dismissedTimestamp) {
      const dismissedAt = parseInt(dismissedTimestamp, 10);
      const now = Date.now();
      const timeSinceDismissed = now - dismissedAt;

      // If dismissed within last 30 days, hide banner
      if (timeSinceDismissed < DISMISS_DURATION_MS) {
        setIsVisible(false);
        return;
      }
    }

    // Show banner if not dismissed or dismissal expired
    setIsVisible(true);
  }, []);

  /**
   * Handle dismiss button click
   * Saves timestamp to localStorage and hides banner
   */
  const handleDismiss = () => {
    const now = Date.now();
    localStorage.setItem(DISCLAIMER_KEY, now.toString());
    setIsVisible(false);
  };

  // Don't render on server (avoid hydration mismatch)
  if (!isClient) {
    return null;
  }

  // Don't render if dismissed
  if (!isVisible) {
    return null;
  }

  return (
    <div
      className="bg-yellow-500/10 dark:bg-yellow-500/20 border-l-4 border-yellow-500/50 p-4 rounded mb-6"
      role="alert"
      aria-live="polite"
      aria-label="Medical disclaimer"
    >
      <div className="flex items-start gap-3">
        {/* Warning icon */}
        <AlertTriangle className="w-5 h-5 text-yellow-700 dark:text-yellow-400 flex-shrink-0 mt-0.5" />

        {/* Disclaimer content */}
        <div className="flex-1">
          <p className="text-sm text-yellow-800 dark:text-yellow-300 font-medium">
            Insights show correlations, not causation. Discuss findings with your healthcare
            provider.
          </p>
        </div>

        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          className="text-yellow-700 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 rounded p-1"
          aria-label="Dismiss medical disclaimer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
