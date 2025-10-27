'use client';

import { FlareEventRecord } from '@/lib/db/schema';
import { FlareEventType, FlareTrend } from '@/types/flare';
import { formatDistanceToNow } from 'date-fns';
import { TrendingUp, Activity, ArrowUpDown, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface FlareHistoryEntryProps {
  event: FlareEventRecord;
  isExpanded: boolean;
  onToggle: () => void;
}

const eventTypeIcons = {
  severity_update: TrendingUp,
  trend_change: ArrowUpDown,
  intervention: Activity,
  resolved: CheckCircle,
  created: Activity,
};

const trendArrows = {
  improving: '↓',
  stable: '→',
  worsening: '↑',
};

export function FlareHistoryEntry({ event, isExpanded, onToggle }: FlareHistoryEntryProps) {
  const Icon = eventTypeIcons[event.eventType as keyof typeof eventTypeIcons] || Activity;
  const relativeTime = formatDistanceToNow(event.timestamp, { addSuffix: true });
  const fullTime = new Date(event.timestamp).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const getSeverityColor = (severity: number) => {
    if (severity >= 9) return 'bg-red-600';
    if (severity >= 7) return 'bg-orange-500';
    if (severity >= 4) return 'bg-yellow-400 text-gray-900';
    return 'bg-green-500';
  };

  return (
    <div
      className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 min-h-[44px]"
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggle();
        }
      }}
      role="button"
      tabIndex={0}
      aria-expanded={isExpanded}
    >
      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 text-gray-600 mt-1 flex-shrink-0" />

        <div className="flex-1 min-w-0">
          {/* Event Type Header */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="font-medium capitalize">
              {event.eventType.replace('_', ' ')}
            </span>
            <span className="text-xs text-gray-500" title={fullTime}>
              {relativeTime}
            </span>
          </div>

          {/* Severity Info (for status_update events) */}
          {event.eventType === FlareEventType.SeverityUpdate && event.severity !== undefined && (
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`px-2 py-1 rounded text-white text-sm ${getSeverityColor(event.severity)}`}
              >
                Severity: {event.severity}/10
              </span>
              {event.trend && (
                <span className="text-sm">
                  {trendArrows[event.trend as FlareTrend]} {event.trend}
                </span>
              )}
            </div>
          )}

          {/* Trend Info (for trend_change events) */}
          {event.eventType === FlareEventType.TrendChange && event.trend && (
            <div className="mb-2">
              <span className="text-sm">
                {trendArrows[event.trend as FlareTrend]} {event.trend}
              </span>
            </div>
          )}

          {/* Intervention Info */}
          {event.eventType === FlareEventType.Intervention && (
            <div className="mb-2">
              <span className="font-medium capitalize">{event.interventionType}</span>
              {event.interventionDetails && (
                <span className="text-sm text-gray-600 ml-2">
                  {isExpanded
                    ? event.interventionDetails
                    : event.interventionDetails.slice(0, 50) + (event.interventionDetails.length > 50 ? '...' : '')
                  }
                </span>
              )}
            </div>
          )}

          {/* Resolution Info */}
          {event.eventType === FlareEventType.Resolved && (
            <div className="mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-green-700">Flare resolved</span>
                {event.resolutionDate && (
                  <span className="text-xs text-gray-600">
                    {new Date(event.resolutionDate).toLocaleDateString()}
                  </span>
                )}
              </div>
              {event.resolutionNotes && (
                <p className="text-sm text-gray-600 mt-1">
                  {isExpanded
                    ? event.resolutionNotes
                    : event.resolutionNotes.slice(0, 50) + (event.resolutionNotes.length > 50 ? '...' : '')
                  }
                </p>
              )}
            </div>
          )}

          {/* Notes (collapsed view) */}
          {!isExpanded && event.notes && (
            <div className="text-sm text-gray-600 truncate">
              {event.notes.slice(0, 100)}{event.notes.length > 100 ? '...' : ''}
            </div>
          )}

          {/* Expanded Details */}
          {isExpanded && (
            <div className="mt-3 pt-3 border-t space-y-2">
              {event.notes && (
                <div>
                  <span className="font-medium text-sm">Notes:</span>
                  <p className="text-sm text-gray-700 mt-1">{event.notes}</p>
                </div>
              )}
              <div className="text-xs text-gray-500">
                Full timestamp: {fullTime}
              </div>
            </div>
          )}
        </div>

        {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
      </div>
    </div>
  );
}
