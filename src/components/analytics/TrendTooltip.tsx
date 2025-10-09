'use client';

import { HelpCircle } from 'lucide-react';

interface TrendTooltipProps {
  term: string;
  explanation: string;
}

export const TrendTooltip = ({ term, explanation }: TrendTooltipProps) => {
  return (
    <span className="inline-flex items-center ml-2">
      <span className="sr-only">What does {term} mean?</span>
      <HelpCircle size={16} className="text-muted-foreground" />
      <span className="tooltip-content hidden bg-background border p-2 rounded-md shadow-lg">
        <strong>{term}</strong>: {explanation}
      </span>
    </span>
  );
};
