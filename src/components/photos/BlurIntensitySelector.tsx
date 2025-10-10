"use client";

import { BLUR_INTENSITIES, BlurIntensityOption } from '@/lib/types/annotation';

interface BlurIntensitySelectorProps {
  selectedIntensity: BlurIntensityOption;
  onIntensitySelect: (intensity: BlurIntensityOption) => void;
}

export function BlurIntensitySelector({ selectedIntensity, onIntensitySelect }: BlurIntensitySelectorProps) {
  const intensities: { key: BlurIntensityOption; label: string; preview: string }[] = [
    { key: 'light', label: 'Light', preview: '●' },
    { key: 'medium', label: 'Medium', preview: '●' },
    { key: 'heavy', label: 'Heavy', preview: '●' },
  ];

  return (
    <div className="flex gap-2 rounded-lg bg-white/10 p-2 backdrop-blur-sm">
      {intensities.map((intensity) => {
        const isActive = selectedIntensity === intensity.key;
        const blurPx = BLUR_INTENSITIES[intensity.key];
        
        return (
          <button
            key={intensity.key}
            onClick={() => onIntensitySelect(intensity.key)}
            className={`flex min-h-[44px] min-w-[44px] flex-col items-center justify-center rounded-md px-3 py-2 transition-colors ${
              isActive
                ? 'bg-yellow-500 text-white shadow-lg'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
            title={`${intensity.label} blur (${blurPx}px)`}
            aria-label={`${intensity.label} blur intensity`}
            aria-pressed={isActive}
          >
            <span 
              className="text-2xl"
              style={{ 
                filter: `blur(${blurPx / 4}px)`,
                opacity: 0.9
              }}
            >
              {intensity.preview}
            </span>
            <span className="mt-1 text-[10px] opacity-80">{intensity.label}</span>
          </button>
        );
      })}
    </div>
  );
}
