"use client";

import { FONT_SIZES, FontSizeOption } from '@/lib/types/annotation';

interface FontSizeSelectorProps {
  selectedSize: FontSizeOption;
  onSizeSelect: (size: FontSizeOption) => void;
}

export function FontSizeSelector({ selectedSize, onSizeSelect }: FontSizeSelectorProps) {
  const sizes: { key: FontSizeOption; label: string; preview: string }[] = [
    { key: 'small', label: 'Small', preview: 'A' },
    { key: 'medium', label: 'Medium', preview: 'A' },
    { key: 'large', label: 'Large', preview: 'A' },
  ];

  return (
    <div className="flex gap-2 rounded-lg bg-white/10 p-2 backdrop-blur-sm">
      {sizes.map((size) => {
        const isActive = selectedSize === size.key;
        const fontSize = FONT_SIZES[size.key];
        
        return (
          <button
            key={size.key}
            onClick={() => onSizeSelect(size.key)}
            className={`flex min-h-[44px] min-w-[44px] flex-col items-center justify-center rounded-md px-3 py-2 transition-colors ${
              isActive
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
            title={`${size.label} (${fontSize}px)`}
            aria-label={`${size.label} font size`}
            aria-pressed={isActive}
          >
            <span style={{ fontSize: `${fontSize}px`, fontWeight: 'bold', lineHeight: 1 }}>
              {size.preview}
            </span>
            <span className="mt-1 text-[10px] opacity-80">{size.label}</span>
          </button>
        );
      })}
    </div>
  );
}
