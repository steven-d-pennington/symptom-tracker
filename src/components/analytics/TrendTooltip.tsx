'use client';

import * as Tooltip from '@radix-ui/react-tooltip';
import { HelpCircle } from 'lucide-react';

interface TrendTooltipProps {
  term: string;
  explanation: string;
}

export const TrendTooltip = ({ term, explanation }: TrendTooltipProps) => {
  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button
            type="button"
            className="inline-flex items-center ml-2 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full transition-colors"
            aria-label={`What does ${term} mean?`}
          >
            <HelpCircle size={16} aria-hidden="true" />
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="bg-popover border border-border text-popover-foreground p-3 rounded-md shadow-lg max-w-xs z-50 animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
            sideOffset={5}
            role="tooltip"
          >
            <div className="text-sm">
              <strong className="font-semibold block mb-1">{term}</strong>
              <p className="text-muted-foreground">{explanation}</p>
            </div>
            <Tooltip.Arrow className="fill-border" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
};
