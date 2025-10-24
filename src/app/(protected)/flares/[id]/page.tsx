'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useFlare } from '@/lib/hooks/useFlare';
import { FlareUpdateModal } from '@/components/flares/FlareUpdateModal';

export default function FlareDetailPage() {
  const params = useParams();
  const flareId = params.id as string;
  const userId = 'user-123'; // TODO: Get from auth context

  const { data: flare, isLoading, error, refetch } = useFlare(flareId, userId);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const handleUpdate = () => {
    // Refetch flare data to update the UI after modal changes
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

      {/* Update Status Button */}
      <button
        onClick={() => setIsUpdateModalOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Update Status
      </button>

      {/* Update Modal */}
      <FlareUpdateModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        flare={flare}
        userId={userId}
        onUpdate={handleUpdate}
      />
    </div>
  );
}