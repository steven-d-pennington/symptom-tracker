/**
 * MedicalDisclaimerBanner Component (Story 3.5 - Task 6)
 *
 * Warning banner displaying medical disclaimer for intervention effectiveness analysis.
 * Emphasizes correlation vs. causation and importance of consulting healthcare providers.
 *
 * AC3.5.4: Medical disclaimer and correlation caveat
 */

'use client';

import { AlertTriangle } from 'lucide-react';

/**
 * MedicalDisclaimerBanner component
 * Displays prominent disclaimer about correlation vs. causation.
 *
 * @returns Rendered disclaimer banner
 */
export function MedicalDisclaimerBanner() {
  return (
    // Task 6.2: Banner with bg-yellow-50/amber-50, border-l-4 border-yellow-400, p-4, rounded
    // Task 6.7: Add role="alert" for screen readers to announce important message
    <div
      className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded mb-6"
      role="alert"
    >
      <div className="flex items-start gap-3">
        {/* Task 6.3: Display AlertTriangle icon in yellow/amber color */}
        <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />

        <div>
          {/* Task 6.4: Display heading "Important: Correlation vs. Causation" */}
          {/* Task 6.6: Use clear typography - heading semibold, body regular, adequate line height */}
          <h4 className="text-sm font-semibold text-yellow-800 mb-1">
            Important: Correlation vs. Causation
          </h4>

          {/* Task 6.5: Display disclaimer text */}
          <p className="text-sm text-yellow-700 leading-relaxed">
            This analysis shows correlation, not causation. Multiple factors affect flare
            progression. Always discuss treatment decisions with your healthcare provider.
          </p>
        </div>
      </div>
    </div>
  );
}
