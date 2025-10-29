/**
 * MedicationEmptyState Component (Story 3.5.1 - Task 5)
 *
 * Empty state component displayed when user has no custom medications.
 * Shows guidance to add custom medications in Settings.
 *
 * AC3.5.1.5: Empty state components with contextual guidance
 */

'use client';

import Link from 'next/link';
import { Pill } from 'lucide-react';

/**
 * MedicationEmptyState component for displaying message when no custom medications exist.
 * Note: Defaults are still available for logging even when custom list is empty.
 *
 * @returns Rendered empty state message with link to Settings
 */
export function MedicationEmptyState() {
  return (
    // AC3.5.1.5: bg-gray-50, rounded-lg, p-6, text-center, border-2 border-dashed
    <section className="bg-gray-50 rounded-lg p-6 text-center border-2 border-dashed border-gray-300">
      {/* AC3.5.1.5: Include icon from lucide-react */}
      <div className="flex justify-center mb-4">
        <Pill className="w-12 h-12 text-gray-400" />
      </div>

      {/* AC3.5.1.5: Heading */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No custom medications yet
      </h3>

      {/* AC3.5.1.5: Description with guidance */}
      <p className="text-gray-600 mb-4">
        You're using default treatments. Add your own in Settings to personalize tracking.
      </p>

      {/* AC3.5.1.5: Link to Settings > Manage Data page */}
      <Link
        href="/settings/manage-data"
        className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
      >
        Go to Settings → Manage Data
      </Link>
    </section>
  );
}
