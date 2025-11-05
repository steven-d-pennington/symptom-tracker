'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useFlare } from '@/lib/hooks/useFlare';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { FlareUpdateModal } from '@/components/flares/FlareUpdateModal';
import { InterventionLogModal } from '@/components/flares/InterventionLogModal';
import { FlareResolveModal } from '@/components/flares/FlareResolveModal';
import { InterventionHistory } from '@/components/flares/InterventionHistory';
import { FlareHistory } from '@/components/flares/FlareHistory';
import { FlareStatus } from '@/types/flare';

type TabType = 'details' | 'history';

export default function FlareDetailPage() {
  const params = useParams();
  const flareId = params.id as string;
  const { userId } = useCurrentUser();
  const router = useRouter();

  const { data: flare, isLoading, error, refetch } = useFlare(flareId, userId);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isInterventionModalOpen, setIsInterventionModalOpen] = useState(false);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [interventionKey, setInterventionKey] = useState(0);
  const [activeTab, setActiveTab] = useState<TabType>('details');

  const handleUpdate = () => {
    // Refetch flare data to update the UI after modal changes
    refetch();
  };

  const handleInterventionLogged = () => {
    // Refresh intervention history by incrementing key
    setInterventionKey((prev) => prev + 1);
    refetch();
  };

  const handleFlareResolved = () => {
    // Navigate to Active Flares list (resolved flare will no longer appear)
    // The useFlares hook will automatically filter out resolved flares when the page loads
    router.push('/flares');
  };

  const handleKeyDown = (e: React.KeyboardEvent, tab: TabType) => {
    if (e.key === 'ArrowRight') {
      setActiveTab(tab === 'details' ? 'history' : 'details');
    } else if (e.key === 'ArrowLeft') {
      setActiveTab(tab === 'details' ? 'history' : 'details');
    }
  };

  if (isLoading) {
    return <div>Loading flare details...</div>;
  }

  if (error || !flare) {
    return <div>Error loading flare. Please try again.</div>;
  }

  const isResolved = flare.status === FlareStatus.Resolved;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Flare Details</h1>

      {/* Resolved Badge */}
      {isResolved && (
        <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg font-semibold">Flare Resolved</span>
            {flare.endDate && (
              <span className="bg-gray-400 text-white text-xs px-2 py-1 rounded">
                {new Date(flare.endDate).toLocaleDateString()}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600">
            This flare has been resolved and cannot be updated. Complete history is available below.
          </p>
        </div>
      )}

      {/* Tab Navigation */}
      <div role="tablist" className="flex gap-2 border-b mb-6">
        <button
          role="tab"
          aria-selected={activeTab === 'details'}
          onClick={() => setActiveTab('details')}
          onKeyDown={(e) => handleKeyDown(e, 'details')}
          className={`px-4 py-2 min-h-[44px] ${activeTab === 'details' ? 'border-b-2 border-blue-600 font-semibold text-blue-600' : 'text-gray-600'}`}
        >
          Details
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'history'}
          onClick={() => setActiveTab('history')}
          onKeyDown={(e) => handleKeyDown(e, 'history')}
          className={`px-4 py-2 min-h-[44px] ${activeTab === 'history' ? 'border-b-2 border-blue-600 font-semibold text-blue-600' : 'text-gray-600'}`}
        >
          History
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'details' && (
        <div role="tabpanel" aria-labelledby="details-tab">
          {/* Flare Summary */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="mb-4">
              <span className="text-gray-600">Severity:</span>
              <span className="ml-2 font-bold">{flare.currentSeverity}/10</span>
            </div>
            <div className="mb-4">
              <span className="text-gray-600">Status:</span>
              <span className="ml-2">{flare.status}</span>
            </div>
            <div className="mb-4">
              <span className="text-gray-600">Started:</span>
              <span className="ml-2">{new Date(flare.startDate).toLocaleDateString()}</span>
            </div>

            {/* Story 3.7.5: Display all marked body locations */}
            {flare.bodyLocations && flare.bodyLocations.length > 0 && (
              <div className="mb-4">
                <span className="text-gray-600 block mb-2">Affected Locations:</span>
                <div className="ml-2 space-y-2">
                  {flare.bodyLocations.map((location, index) => (
                    <div key={location.id} className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
                        {index + 1}
                      </span>
                      <span className="capitalize">
                        {location.bodyRegionId.replace(/-/g, ' ')}
                      </span>
                      {location.coordinates && (
                        <span className="text-xs text-gray-500 font-mono">
                          ({location.coordinates.x.toFixed(2)}, {location.coordinates.y.toFixed(2)})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons (hidden for resolved flares) */}
          {!isResolved && (
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => setIsUpdateModalOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 min-h-[44px]"
                aria-label="Update flare status"
              >
                Update Status
              </button>
              <button
                onClick={() => setIsInterventionModalOpen(true)}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 min-h-[44px]"
                aria-label="Log intervention"
              >
                Log Intervention
              </button>
              <button
                onClick={() => setIsResolveModalOpen(true)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 min-h-[44px]"
                aria-label="Mark flare as resolved"
              >
                Mark Resolved
              </button>
            </div>
          )}

          {/* Intervention History Section */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Treatment Interventions</h2>
            <InterventionHistory key={interventionKey} flareId={flareId} userId={userId} />
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div role="tabpanel" aria-labelledby="history-tab">
          <FlareHistory flareId={flareId} userId={userId} />
        </div>
      )}

      {/* Modals */}
      <FlareUpdateModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        flare={flare}
        userId={userId}
        onUpdate={handleUpdate}
      />
      <InterventionLogModal
        isOpen={isInterventionModalOpen}
        onClose={() => setIsInterventionModalOpen(false)}
        flare={flare}
        userId={userId}
        onLog={handleInterventionLogged}
      />
      <FlareResolveModal
        isOpen={isResolveModalOpen}
        onClose={() => setIsResolveModalOpen(false)}
        flare={flare}
        userId={userId}
        onResolve={handleFlareResolved}
      />
    </div>
  );
}
