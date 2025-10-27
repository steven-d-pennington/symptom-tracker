/**
 * Per-Region Flare History Page (Story 3.1 - Task 9)
 *
 * Placeholder page for per-region flare history detail view.
 * Full implementation will be done in Story 3.2.
 *
 * AC3.1.5: Navigation to per-region flare history
 * Route: /flares/analytics/regions/[regionId]
 */

'use client';

import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getBodyRegionById } from '@/lib/data/bodyRegions';

/**
 * Per-Region Flare History Page (Placeholder for Story 3.2)
 * AC3.1.5: Navigation prepared, placeholder page acceptable for Story 3.1
 */
export default function RegionHistoryPage() {
  const router = useRouter();
  const params = useParams();
  const regionId = params.regionId as string;

  // Look up region name from bodyRegions data
  const region = getBodyRegionById(regionId);
  const regionName = region?.name || regionId;

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {/* Back button */}
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Analytics</span>
      </button>

      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Per-Region Flare History - {regionName}
        </h1>
        <p className="text-gray-600">
          Detailed flare history for this specific body region
        </p>
      </div>

      {/* Placeholder content (Story 3.1 - AC3.1.5) */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold text-blue-900 mb-3">
            Coming in Story 3.2: Detailed Flare History
          </h2>
          <p className="text-blue-700 mb-4">
            This page will display comprehensive flare history for {regionName}, including:
          </p>
          <ul className="text-left text-blue-800 space-y-2 mb-6">
            <li>• Chronological timeline of all flares in this region</li>
            <li>• Severity trends over time</li>
            <li>• Duration statistics and patterns</li>
            <li>• Intervention effectiveness for this region</li>
            <li>• Detailed event history for each flare</li>
          </ul>
          <p className="text-sm text-blue-600">
            Navigation is functional, full implementation pending Story 3.2.
          </p>
        </div>
      </div>

      {/* Breadcrumb for reference */}
      <div className="mt-8 text-sm text-gray-500">
        <nav aria-label="Breadcrumb">
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
    </div>
  );
}
