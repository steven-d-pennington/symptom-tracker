/**
 * Per-Region Flare History Page (Story 3.2 - Task 10)
 *
 * Full implementation of per-region flare history detail view.
 * Displays comprehensive flare data with statistics, timeline, and filtering.
 *
 * AC3.2.1: Region detail page displays all flares for selected region
 * - Page header shows body region name
 * - Back button to analytics page
 * - Breadcrumb navigation
 * - Responsive layout (grid on desktop, stack on mobile)
 *
 * Route: /flares/analytics/regions/[regionId]
 */

'use client';

import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getBodyRegionById } from '@/lib/data/bodyRegions';
import { RegionDetailView } from '@/components/analytics/RegionDetailView';

/**
 * Per-Region Flare History Page
 * AC3.2.1: Complete region detail implementation with back navigation and breadcrumbs
 */
export default function RegionHistoryPage() {
  const router = useRouter();
  const params = useParams();
  const regionId = params.regionId as string;

  // Task 10.4: Extract regionId from route params
  // Look up region name from bodyRegions data
  const region = getBodyRegionById(regionId);
  const regionName = region?.name || regionId;

  // Task 10.7: Add back button handler
  const handleBack = () => {
    router.push('/flares/analytics');
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {/* Task 10.7: Back button */}
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Analytics</span>
      </button>

      {/* Task 10.5: Page header with breadcrumb navigation */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {regionName}
        </h1>
        <nav aria-label="Breadcrumb" className="text-sm text-gray-600">
          <ol className="flex items-center space-x-2">
            <li>Home</li>
            <li>→</li>
            <li>Flares</li>
            <li>→</li>
            <li>Analytics</li>
            <li>→</li>
            <li className="font-medium text-gray-900">{regionName}</li>
          </ol>
        </nav>
      </div>

      {/* Task 10.6: Render RegionDetailView component */}
      <RegionDetailView regionId={regionId} />
    </div>
  );
}
