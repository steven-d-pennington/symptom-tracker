'use client';

import { ArrowUp, ArrowDown, ArrowRight } from 'lucide-react';

interface TrendInterpretationProps {
  direction: string;
  confidence: string;
}

const getDirectionIcon = (direction: string) => {
  switch (direction) {
    case 'worsening':
      return <ArrowUp className="w-5 h-5" aria-hidden="true" />;
    case 'improving':
      return <ArrowDown className="w-5 h-5" aria-hidden="true" />;
    case 'stable':
      return <ArrowRight className="w-5 h-5" aria-hidden="true" />;
    default:
      return null;
  }
};

const getDirectionColor = (direction: string): string => {
  switch (direction) {
    case 'worsening':
      return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800';
    case 'improving':
      return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800';
    case 'stable':
      return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-950/30 border-gray-200 dark:border-gray-800';
    default:
      return 'text-muted-foreground bg-muted border-border';
  }
};

const getInterpretationText = (direction: string, confidence: string): string => {
  if (direction === 'Insufficient data') {
    return 'Not enough data to determine trend (need at least 14 days)';
  }

  const directionText = direction === 'worsening' ? 'Worsening' : 
                        direction === 'improving' ? 'Improving' : 
                        'Stable';
  
  const confidenceText = confidence === 'very-high' ? 'very high confidence' :
                         confidence === 'high' ? 'high confidence' :
                         confidence === 'moderate' ? 'moderate confidence' :
                         'low confidence';

  return `${directionText} with ${confidenceText}`;
};

const getConfidenceDescription = (confidence: string): string => {
  switch (confidence) {
    case 'very-high':
      return '90%+ confidence - Strong trend pattern detected';
    case 'high':
      return '70-90% confidence - Clear trend pattern';
    case 'moderate':
      return '50-70% confidence - Trend pattern present';
    case 'low':
      return 'Below 50% confidence - Weak or noisy trend';
    default:
      return 'Confidence level not available';
  }
};

export const TrendInterpretation = ({ direction, confidence }: TrendInterpretationProps) => {
  const colorClasses = getDirectionColor(direction);
  const icon = getDirectionIcon(direction);
  const mainText = getInterpretationText(direction, confidence);
  const confidenceDesc = getConfidenceDescription(confidence);

  return (
    <div 
      className={`rounded-lg border p-4 ${colorClasses}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3 mb-2">
        {icon && (
          <div className="flex-shrink-0">
            {icon}
          </div>
        )}
        <div className="flex-1">
          <h3 className="font-semibold text-base">
            Trend Analysis
          </h3>
          <p className="text-sm font-medium mt-1">
            {mainText}
          </p>
        </div>
      </div>
      
      {direction !== 'Insufficient data' && (
        <p className="text-xs mt-2 opacity-80">
          {confidenceDesc}
        </p>
      )}
    </div>
  );
};
