/**
 * Correlation Settings Component
 *
 * Allows users to manually trigger correlation recalculation.
 * Shows last calculation time and provides "Recalculate Now" button.
 */

'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import {
  recalculateCorrelations,
  getLastCalculated,
  isCalculating
} from '@/lib/services/correlationCalculationService';
import { formatDistanceToNow } from 'date-fns';

export function CorrelationSettings() {
  const { userId } = useCurrentUser();
  const [lastCalculated, setLastCalculated] = useState<number | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Load initial state
  useEffect(() => {
    if (!userId) return;

    const timestamp = getLastCalculated(userId);
    setLastCalculated(timestamp);
    setCalculating(isCalculating(userId));
  }, [userId]);

  // Handle recalculation
  const handleRecalculate = async () => {
    if (!userId || calculating) return;

    setCalculating(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      await recalculateCorrelations(userId);

      const timestamp = Date.now();
      setLastCalculated(timestamp);
      setStatus('success');

      // Clear success message after 3 seconds
      setTimeout(() => {
        setStatus('idle');
      }, 3000);
    } catch (error) {
      console.error('Correlation recalculation failed:', error);
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to recalculate correlations');
    } finally {
      setCalculating(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Info Section */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
        <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-900 dark:text-blue-100 flex-1">
          <p className="font-medium mb-1">About Correlation Analysis</p>
          <p className="text-blue-700 dark:text-blue-300">
            Correlation analysis uses statistical methods to identify patterns between foods,
            triggers, medications, and your symptoms. This process analyzes your logged data
            to find significant relationships.
          </p>
        </div>
      </div>

      {/* Last Calculated */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">Last Calculated</p>
          <p className="text-sm text-muted-foreground">
            {lastCalculated
              ? formatDistanceToNow(lastCalculated, { addSuffix: true })
              : 'Never'}
          </p>
        </div>
      </div>

      {/* Recalculate Button */}
      <button
        onClick={handleRecalculate}
        disabled={calculating || !userId}
        className={`
          w-full px-4 py-3 rounded-lg font-medium text-sm
          flex items-center justify-center gap-2
          transition-all duration-200
          ${calculating
            ? 'bg-muted text-muted-foreground cursor-not-allowed'
            : 'bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98]'
          }
        `}
      >
        <RefreshCw className={`w-4 h-4 ${calculating ? 'animate-spin' : ''}`} />
        {calculating ? 'Calculating...' : 'Recalculate Now'}
      </button>

      {/* Status Messages */}
      {status === 'success' && (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
          <div className="text-sm text-green-900 dark:text-green-100 flex-1">
            <p className="font-medium">Correlations Updated</p>
            <p className="text-green-700 dark:text-green-300 mt-0.5">
              Your insights have been refreshed with the latest data.
            </p>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          <div className="text-sm text-red-900 dark:text-red-100 flex-1">
            <p className="font-medium">Calculation Failed</p>
            <p className="text-red-700 dark:text-red-300 mt-0.5">
              {errorMessage || 'An unexpected error occurred. Please try again.'}
            </p>
          </div>
        </div>
      )}

      {/* Additional Info */}
      <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t border-border">
        <p>• Calculation analyzes your last 7, 30, and 90 days of data</p>
        <p>• Requires at least 10 logged days for meaningful results</p>
        <p>• Process may take 10-30 seconds depending on data volume</p>
        <p>• All calculations happen locally on your device</p>
      </div>
    </div>
  );
}
