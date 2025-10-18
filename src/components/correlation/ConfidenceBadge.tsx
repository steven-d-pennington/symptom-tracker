import React, { useState } from 'react';

export interface ConfidenceBadgeProps {
  confidence: 'high' | 'medium' | 'low';
  sampleSize?: number;
  consistency?: number; // 0-1 decimal
  pValue?: number;
}

/**
 * ConfidenceBadge Component (Story 2.4)
 * 
 * Displays confidence level for food-symptom correlations with color coding:
 * - High: Green badge (bg-green-100, text-green-800)
 * - Medium: Yellow badge (bg-yellow-100, text-yellow-800)
 * - Low: Orange badge (bg-orange-100, text-orange-800)
 * 
 * Includes tooltip with detailed breakdown when metadata provided.
 * WCAG 2.1 AA compliant: aria-label, keyboard navigation, color + text labels.
 */
export function ConfidenceBadge({ confidence, sampleSize, consistency, pValue }: ConfidenceBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  // Color and text configuration per confidence level
  const config = {
    high: {
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      label: 'High Confidence',
    },
    medium: {
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      label: 'Medium Confidence',
    },
    low: {
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-800',
      label: 'Low Confidence',
    },
  };

  const { bgColor, textColor, label } = config[confidence];

  // Generate aria-label with full explanation
  const getAriaLabel = (): string => {
    if (!sampleSize || consistency === undefined || pValue === undefined) {
      return `${label}`;
    }

    const consistencyPercent = Math.round(consistency * 100);
    return `${label}: ${sampleSize} occurrences, ${consistencyPercent}% consistency, statistically significant`;
  };

  // Generate tooltip content
  const getTooltipContent = (): string | null => {
    if (!sampleSize || consistency === undefined || pValue === undefined) {
      return null;
    }

    const consistencyPercent = Math.round(consistency * 100);
    return `Sample size: ${sampleSize}, Consistency: ${consistencyPercent}%, p-value: ${pValue.toFixed(3)}`;
  };

  const tooltipContent = getTooltipContent();

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${bgColor} ${textColor}`}
      aria-label={getAriaLabel()}
      onMouseEnter={() => tooltipContent && setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onFocus={() => tooltipContent && setShowTooltip(true)}
      onBlur={() => setShowTooltip(false)}
      tabIndex={tooltipContent ? 0 : undefined}
      onKeyDown={(e) => {
        if (tooltipContent && e.key === 'Escape') {
          setShowTooltip(false);
        }
      }}
      style={{ position: 'relative' }}
    >
      {label}
      {tooltipContent && showTooltip && (
        <span
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-xs bg-gray-900 text-white rounded shadow-lg whitespace-nowrap z-10"
          role="tooltip"
        >
          {tooltipContent}
          <span className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></span>
        </span>
      )}
    </span>
  );
}
