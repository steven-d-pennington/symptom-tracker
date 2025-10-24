'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useFlare } from '@/lib/hooks/useFlare';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { FlareUpdateModal } from '@/components/flares/FlareUpdateModal';
import { InterventionLogModal } from '@/components/flares/InterventionLogModal';
import { InterventionHistory } from '@/components/flares/InterventionHistory';

export default function FlareDetailPage() {
  const params = useParams();
  const flareId = params.id as string;
  const { userId } = useCurrentUser();

  const { data: flare, isLoading, error, refetch } = useFlare(flareId, userId);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isInterventionModalOpen, setIsInterventionModalOpen] = useState(false);
  const [interventionKey, setInterventionKey] = useState(0);

  const handleUpdate = () => {
    // Refetch flare data to update the UI after modal changes
    refetch();
  };

  const handleInterventionLogged = () => {
    // Refresh intervention history by incrementing key
    setInterventionKey((prev) => prev + 1);
    refetch();
  };

  if (isLoading) {
    return <div>Loading flare details...</div>;
  }

  if (error || !flare) {
    return <div>Error loading flare. Please try again.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Flare Details</h1>

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
        {/* More flare details... */}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setIsUpdateModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          aria-label="Update flare status"
        >
          Update Status
        </button>
        <button
          onClick={() => setIsInterventionModalOpen(true)}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          aria-label="Log intervention"
        >
          Log Intervention
        </button>
      </div>

      {/* Intervention History Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Treatment Interventions</h2>
        <InterventionHistory key={interventionKey} flareId={flareId} userId={userId} />
      </div>

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
    </div>
  );
}
