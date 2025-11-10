/**
 * InsightCardSkeleton Component (Story 6.4 - Task 11)
 *
 * Loading skeleton for InsightCard with shimmer animation.
 * Prevents layout shift (CLS) while correlation data loads from IndexedDB.
 *
 * AC6.4.10: Build responsive grid layout with loading skeletons
 */

'use client';

/**
 * InsightCardSkeleton Component
 *
 * Gray placeholder boxes with shimmer animation.
 * Matches InsightCard dimensions to prevent layout shift.
 */
export function InsightCardSkeleton() {
  return (
    <div className="border rounded-lg shadow-sm p-6 animate-pulse">
      {/* Icon and headline placeholder */}
      <div className="flex items-start gap-3 mb-4">
        {/* Icon placeholder */}
        <div className="w-6 h-6 bg-gray-200 rounded" />

        {/* Headline placeholder */}
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </div>

      {/* Strength badge placeholder */}
      <div className="flex items-center gap-2 mb-3">
        <div className="h-6 bg-gray-200 rounded-full w-24" />
      </div>

      {/* Confidence and timeframe placeholders */}
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-200 rounded w-2/3" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-3/5" />
      </div>

      {/* Button placeholder */}
      <div className="h-10 bg-gray-200 rounded w-full" />
    </div>
  );
}

/**
 * Shimmer Animation CSS
 *
 * The `animate-pulse` utility from Tailwind CSS provides a simple pulsing animation.
 * For a more sophisticated shimmer effect, you can add custom CSS:
 *
 * @keyframes shimmer {
 *   0% { background-position: -1000px 0; }
 *   100% { background-position: 1000px 0; }
 * }
 *
 * .shimmer {
 *   animation: shimmer 2s infinite;
 *   background: linear-gradient(to right, #f0f0f0 0%, #e0e0e0 50%, #f0f0f0 100%);
 *   background-size: 2000px 100%;
 * }
 */
