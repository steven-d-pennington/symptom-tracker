/**
 * Treatment Effectiveness Disclaimer Banner (Story 6.7 - Task 8)
 *
 * Medical disclaimer for treatment effectiveness views.
 * AC 6.7.7: Prominent medical disclaimer with specific text for treatment tracking.
 *
 * Behavior:
 * - Collapsible in TreatmentTracker (with localStorage persistence)
 * - Persistent (always visible) in modals and comparison views
 * - Reappears on page reload (no permanent dismiss option)
 */

'use client';

import { useState, useEffect } from 'react';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';

const DISCLAIMER_COLLAPSED_KEY = 'treatment-disclaimer-collapsed';

export interface DisclaimerBannerProps {
  /**
   * Whether the disclaimer can be collapsed
   * - true: Show collapse/expand controls (for TreatmentTracker)
   * - false: Always expanded, no collapse controls (for modals)
   */
  collapsible?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Treatment Effectiveness Disclaimer Banner
 *
 * Displays medical disclaimer for treatment effectiveness data.
 * Text: "Effectiveness scores show correlations in your data. Many factors affect outcomes.
 * Always consult your healthcare provider before changing treatment plans."
 *
 * @param props - Component props
 * @returns Rendered disclaimer banner
 */
export function DisclaimerBanner({
  collapsible = false,
  className = '',
}: DisclaimerBannerProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Load collapsed state from localStorage on mount (client-side only)
  useEffect(() => {
    setIsClient(true);

    if (collapsible) {
      const collapsed = localStorage.getItem(DISCLAIMER_COLLAPSED_KEY);
      if (collapsed === 'true') {
        setIsCollapsed(true);
      }
    }
  }, [collapsible]);

  /**
   * Toggle collapsed state and persist to localStorage
   */
  const handleToggle = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    localStorage.setItem(DISCLAIMER_COLLAPSED_KEY, newCollapsed.toString());
  };

  // Don't render on server (avoid hydration mismatch)
  if (!isClient) {
    return null;
  }

  return (
    <div
      className={`bg-yellow-50 border-l-4 border-yellow-400 rounded ${className}`}
      role="alert"
      aria-live="polite"
      aria-label="Treatment effectiveness medical disclaimer"
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Warning icon */}
          <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />

          {/* Disclaimer content */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-900 mb-1">
                  Treatment Effectiveness Disclaimer
                </p>
                {!isCollapsed && (
                  <div className="text-sm text-yellow-800 space-y-1">
                    <p>
                      <strong>Effectiveness scores show correlations in your data.</strong>{' '}
                      Many factors affect outcomes, including:
                    </p>
                    <ul className="list-disc list-inside space-y-0.5 ml-2">
                      <li>Natural symptom variation</li>
                      <li>Concurrent treatments</li>
                      <li>Lifestyle changes</li>
                      <li>Condition progression</li>
                    </ul>
                    <p className="mt-2 font-medium">
                      Always consult your healthcare provider before:
                    </p>
                    <ul className="list-disc list-inside space-y-0.5 ml-2">
                      <li>Starting new treatments</li>
                      <li>Stopping existing treatments</li>
                      <li>Changing treatment plans</li>
                      <li>Making medical decisions</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Collapse/expand button (only if collapsible) */}
              {collapsible && (
                <button
                  onClick={handleToggle}
                  className="text-yellow-600 hover:text-yellow-800 focus:outline-none focus:ring-2 focus:ring-yellow-500 rounded p-1 ml-2"
                  aria-label={isCollapsed ? 'Expand disclaimer' : 'Collapse disclaimer'}
                  aria-expanded={!isCollapsed}
                >
                  {isCollapsed ? (
                    <ChevronDown className="w-5 h-5" />
                  ) : (
                    <ChevronUp className="w-5 h-5" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
