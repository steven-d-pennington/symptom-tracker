/**
 * InterventionDetailModal Component (Story 3.5 - Task 5)
 *
 * Modal displaying detailed intervention instances with before/after severity chart.
 * Shows list of intervention instances, timestamps, flare links, and outcomes.
 * Includes Chart.js bar chart for severity visualization.
 *
 * AC3.5.7: Drill-down to intervention instances
 */

'use client';

import { useEffect, useRef } from 'react';
import { InterventionEffectiveness } from '@/types/analytics';
import { X } from 'lucide-react';
import Link from 'next/link';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

/**
 * Props for InterventionDetailModal component (Task 5.2)
 */
export interface InterventionDetailModalProps {
  /** Whether modal is open */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Intervention effectiveness data to display */
  intervention: InterventionEffectiveness | null;
}

/**
 * Format timestamp to readable date and time
 */
function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * InterventionDetailModal component
 * Displays intervention instances with before/after chart and flare links.
 *
 * @param props - InterventionDetailModal properties
 * @returns Rendered intervention detail modal
 */
export function InterventionDetailModal({
  isOpen,
  onClose,
  intervention
}: InterventionDetailModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Task 5.10: Handle keyboard - Escape key closes modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Task 5.12: Prevent body scroll when modal open
      document.body.style.overflow = 'hidden';

      // Focus trap - focus first focusable element
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements?.[0] as HTMLElement;
      firstElement?.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !intervention) return null;

  // Task 5.6: Sort instances by timestamp descending (most recent first)
  const sortedInstances = [...intervention.instances].sort(
    (a, b) => b.timestamp - a.timestamp
  );

  // Task 5.7: Prepare Chart.js data for before/after severity chart
  const chartData = {
    labels: sortedInstances.map((_, index) => `#${index + 1}`),
    datasets: [
      {
        label: 'Before',
        data: sortedInstances.map(i => i.severityAtIntervention),
        backgroundColor: 'rgba(239, 68, 68, 0.7)', // red-500
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1
      },
      {
        label: '48h After',
        data: sortedInstances.map(i => i.severityAfter48h ?? 0),
        backgroundColor: 'rgba(34, 197, 94, 0.7)', // green-500
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const
      },
      title: {
        display: true,
        text: 'Severity Before vs. 48h After Intervention'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
        ticks: {
          stepSize: 1
        },
        title: {
          display: true,
          text: 'Severity (1-10)'
        }
      }
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Task 5.11: Modal with role="dialog", aria-labelledby, aria-describedby */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="intervention-detail-title"
        aria-describedby="intervention-detail-description"
      >
        <div
          ref={modalRef}
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Task 5.4: Modal header with intervention type name and close button */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white p-4">
            <div>
              <h2 id="intervention-detail-title" className="text-xl font-semibold text-gray-900">
                {intervention.interventionType} - Detailed Analysis
              </h2>
              <p id="intervention-detail-description" className="text-sm text-gray-600 mt-1">
                {intervention.usageCount} instance{intervention.usageCount !== 1 ? 's' : ''} recorded
              </p>
            </div>
            {/* Task 5.9: Close button */}
            <button
              onClick={onClose}
              className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Modal content */}
          <div className="p-6 space-y-6">
            {/* Task 5.7: Chart showing severity before/after intervention */}
            <div className="h-64">
              <Bar data={chartData} options={chartOptions} />
            </div>

            {/* Task 5.5: List of intervention instances */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Intervention Instances
              </h3>
              <div className="space-y-3">
                {sortedInstances.map((instance, index) => (
                  <div
                    key={instance.id}
                    className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            #{index + 1}
                          </span>
                          <span className="text-sm text-gray-600">
                            {formatTimestamp(instance.timestamp)}
                          </span>
                        </div>

                        {/* Task 5.5: Flare link to navigate to flare detail view */}
                        <Link
                          href={`/flares/${instance.flareId}`}
                          className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          View Flare Details →
                        </Link>
                      </div>

                      {/* Task 5.5: Outcome (severity change) */}
                      <div className="text-right">
                        {/* Task 5.8: Handle missing 48h data */}
                        {instance.severityChange !== null ? (
                          <>
                            <div className="text-xs text-gray-600 mb-1">Outcome</div>
                            <div
                              className={`text-lg font-bold ${
                                instance.severityChange > 0
                                  ? 'text-green-600'
                                  : instance.severityChange < 0
                                  ? 'text-red-600'
                                  : 'text-gray-600'
                              }`}
                            >
                              {instance.severityChange > 0 ? '+' : ''}
                              {instance.severityChange.toFixed(1)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {instance.severityAtIntervention} → {instance.severityAfter48h}
                            </div>
                          </>
                        ) : (
                          <div className="text-sm text-gray-400 italic">
                            No follow-up data
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Task 5.9: Modal footer with close button */}
          <div className="sticky bottom-0 border-t border-gray-200 bg-white p-4">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
