'use client';

import { useEffect, useState } from 'react';
import { flareRepository } from '@/lib/repositories/flareRepository';
import { FlareEventRecord } from '@/lib/db/schema';
import { InterventionType } from '@/types/flare';
import { formatDistanceToNow } from 'date-fns';
import {
  Snowflake,
  Flame,
  Pill,
  BedDouble,
  Droplet,
  MoreHorizontal,
} from 'lucide-react';

interface InterventionHistoryProps {
  flareId: string;
  userId: string;
}

const interventionIcons = {
  [InterventionType.Ice]: Snowflake,
  [InterventionType.Heat]: Flame,
  [InterventionType.Medication]: Pill,
  [InterventionType.Rest]: BedDouble,
  [InterventionType.Drainage]: Droplet,
  [InterventionType.Other]: MoreHorizontal,
};

export function InterventionHistory({
  flareId,
  userId,
}: InterventionHistoryProps) {
  const [interventions, setInterventions] = useState<FlareEventRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadInterventions = async () => {
      try {
        const history = await flareRepository.getFlareHistory(userId, flareId);
        // Filter for intervention events and sort reverse-chronologically
        const interventionEvents = history
          .filter((e) => e.eventType === 'intervention')
          .sort((a, b) => b.timestamp - a.timestamp);
        setInterventions(interventionEvents);
      } catch (err) {
        console.error('Failed to load interventions:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadInterventions();
  }, [flareId, userId]);

  if (isLoading) {
    return <div className="text-gray-500">Loading interventions...</div>;
  }

  if (interventions.length === 0) {
    return (
      <div className="text-gray-500 text-center py-6">
        <p className="mb-2">No interventions logged yet</p>
        <p className="text-sm">Use &quot;Log Intervention&quot; to record treatments</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {interventions.map((intervention) => {
        const Icon = intervention.interventionType
          ? interventionIcons[intervention.interventionType]
          : MoreHorizontal;
        const relativeTime = formatDistanceToNow(intervention.timestamp, {
          addSuffix: true,
        });
        const summary = intervention.interventionDetails
          ? intervention.interventionDetails.slice(0, 50) +
            (intervention.interventionDetails.length > 50 ? '...' : '')
          : 'No details';

        return (
          <div
            key={intervention.id}
            className="flex items-start gap-3 p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
          >
            <Icon className="w-5 h-5 text-gray-600 mt-1 flex-shrink-0" aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <div className="font-medium capitalize">
                {intervention.interventionType || 'Unknown'}
              </div>
              <div className="text-sm text-gray-600 break-words">{summary}</div>
              <div className="text-xs text-gray-500 mt-1">{relativeTime}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
