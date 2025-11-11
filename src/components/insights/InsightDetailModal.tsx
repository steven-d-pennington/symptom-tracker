/**
 * InsightDetailModal Component (Story 6.4 - Task 10)
 *
 * Modal dialog for detailed correlation insight view.
 * Shows full correlation data, scatter plot, and related events timeline.
 * Implements accessibility features: focus trap, Escape key, click outside.
 *
 * AC6.4.9: Create insight detail modal
 * REFACTORED: Now uses shadcn/ui Dialog component
 */

'use client';

import { CorrelationResult } from '@/types/correlation';
import { CorrelationScatterPlot } from './CorrelationScatterPlot';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface InsightDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  correlation: CorrelationResult | null;
}

/**
 * InsightDetailModal Component
 *
 * Features:
 * - Modal overlay with backdrop (via shadcn/ui Dialog)
 * - Correlation headline in header
 * - Full correlation data (coefficient, p-value, sample size, lag, confidence)
 * - Embedded scatter plot visualization
 * - Related events timeline (simplified for now)
 * - Close functionality: Escape key, click outside, X button (built into Dialog)
 * - Focus trap for accessibility (built into Dialog)
 *
 * @param isOpen - Whether modal is open
 * @param onClose - Callback to close modal
 * @param correlation - Correlation result to display
 */
export function InsightDetailModal({ isOpen, onClose, correlation }: InsightDetailModalProps) {
  if (!correlation) {
    return null;
  }

  // Generate headline
  const item1Formatted = correlation.item1.charAt(0).toUpperCase() + correlation.item1.slice(1);
  const item2Formatted = correlation.item2.charAt(0).toUpperCase() + correlation.item2.slice(1);
  const direction = correlation.coefficient > 0 ? 'Increased' : 'Decreased';
  const headline = `High ${item1Formatted} → ${direction} ${item2Formatted}`;

  // Generate sample scatter plot data (placeholder)
  // In production, this would query actual time series data
  const scatterData = Array.from({ length: correlation.sampleSize }, (_, i) => ({
    x: Math.random() * 10,
    y: Math.random() * 10,
    date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString(),
  }));

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{headline}</DialogTitle>
        </DialogHeader>

        {/* Body */}
        <div className="space-y-6">
          {/* Full correlation data */}
          <section aria-labelledby="correlation-data-heading">
            <h3 id="correlation-data-heading" className="text-lg font-semibold mb-3">
              Correlation Statistics
            </h3>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="font-medium text-gray-700">Coefficient (ρ)</dt>
                <dd className="text-gray-900">{correlation.coefficient.toFixed(3)}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-700">Strength</dt>
                <dd className="text-gray-900 capitalize">{correlation.strength}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-700">P-value</dt>
                <dd className="text-gray-900">{correlation.significance.toFixed(4)}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-700">Sample Size</dt>
                <dd className="text-gray-900">{correlation.sampleSize} data points</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-700">Lag Hours</dt>
                <dd className="text-gray-900">{correlation.lagHours} hours</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-700">Confidence</dt>
                <dd className="text-gray-900 capitalize">{correlation.confidence}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-700">Time Range</dt>
                <dd className="text-gray-900">{correlation.timeRange}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-700">Calculated</dt>
                <dd className="text-gray-900">
                  {new Date(correlation.calculatedAt).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </section>

          {/* Scatter plot */}
          <section aria-labelledby="scatter-plot-heading">
            <h3 id="scatter-plot-heading" className="text-lg font-semibold mb-3">
              Correlation Visualization
            </h3>
            <CorrelationScatterPlot
              item1Name={correlation.item1}
              item2Name={correlation.item2}
              dataPoints={scatterData}
              coefficient={correlation.coefficient}
            />
          </section>

          {/* Related events timeline (placeholder) */}
          <section aria-labelledby="timeline-heading">
            <h3 id="timeline-heading" className="text-lg font-semibold mb-3">
              Related Events Timeline
            </h3>
            <p className="text-sm text-muted-foreground">
              Timeline showing {correlation.item1} and {correlation.item2} events will be displayed
              here. This feature can be enhanced in future iterations to show a chronological list
              of relevant events in the time range.
            </p>
          </section>

          {/* Export button (placeholder) */}
          <section>
            <Button disabled variant="secondary">
              Export as PDF (Coming Soon)
            </Button>
          </section>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
