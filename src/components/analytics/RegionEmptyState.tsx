/**
 * RegionEmptyState Component (Story 3.2 - Task 9)
 *
 * Empty state for region detail page when no flares exist in the selected region.
 * Provides helpful messaging and navigation to body map.
 *
 * AC3.2.7: Empty state for region with no flares
 * - Message: "No flares recorded in this region"
 * - Suggestion: "Flares in {region name} will appear here once logged"
 * - Link to body map to create new flare
 * - Follows empty state patterns from Story 3.1
 */

'use client';

import Link from 'next/link';
import { MapPin } from 'lucide-react';

interface RegionEmptyStateProps {
  /** Body region name for contextual messaging */
  regionName: string;
}

/**
 * RegionEmptyState component - displayed when no flares exist for selected region.
 */
export function RegionEmptyState({ regionName }: RegionEmptyStateProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-8 text-center">
      <div className="max-w-md mx-auto">
        {/* Task 9.7: Add icon */}
        <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />

        {/* Task 9.3: Display heading */}
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No flares recorded in this region
        </h3>

        {/* Task 9.4: Display message with region name */}
        <p className="text-gray-600 mb-6">
          Flares in {regionName} will appear here once logged using the body map.
        </p>

        {/* Task 9.5: Add link to body map page */}
        <Link
          href="/body-map"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <MapPin className="w-4 h-4" />
          Log New Flare →
        </Link>
      </div>
    </div>
  );
}
