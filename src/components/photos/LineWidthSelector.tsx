"use client";

import { LINE_WIDTHS, LineWidthOption } from '@/lib/types/annotation';

interface LineWidthSelectorProps {
  selectedWidth: number;
  onWidthSelect: (width: number) => void;
}

export function LineWidthSelector({
  selectedWidth,
  onWidthSelect,
}: LineWidthSelectorProps) {
  const widths = Object.entries(LINE_WIDTHS) as [LineWidthOption, number][];

  return (
    <div className="flex gap-2 rounded-lg bg-white/10 p-2 backdrop-blur-sm">
      {widths.map(([name, width]) => {
        const isActive = selectedWidth === width;
        
        return (
          <button
            key={name}
            onClick={() => onWidthSelect(width)}
            className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md p-2 transition-colors ${
              isActive
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
            title={`${name.charAt(0).toUpperCase() + name.slice(1)} line width`}
            aria-label={`Select ${name} line width`}
            aria-pressed={isActive}
          >
            {/* Visual preview of line width */}
            <div
              className="rounded-full bg-white"
              style={{
                width: `${width * 3}px`,
                height: `${width * 3}px`,
              }}
            />
          </button>
        );
      })}
    </div>
  );
}
