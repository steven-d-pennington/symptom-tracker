import React from 'react';

export interface InsufficientDataBadgeProps {
  currentSampleSize: number;
  requiredSampleSize: number;
}

/**
 * InsufficientDataBadge Component (Story 2.4 - AC7)
 * 
 * Displays when sample size is below minimum threshold for confidence calculation.
 * Gray badge with informative tooltip explaining the threshold requirement.
 * WCAG 2.1 AA compliant with aria-label and keyboard navigation.
 */
export function InsufficientDataBadge({ 
  currentSampleSize, 
  requiredSampleSize 
}: InsufficientDataBadgeProps) {
  return (
    <span
      className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 border border-gray-300"
      aria-label={`Insufficient data: ${currentSampleSize} of ${requiredSampleSize} minimum occurrences required for confidence calculation`}
      title={`Need ${requiredSampleSize - currentSampleSize} more occurrence(s) for statistical confidence`}
    >
      Insufficient Data
    </span>
  );
}
