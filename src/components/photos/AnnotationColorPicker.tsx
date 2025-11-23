"use client";

import { ANNOTATION_COLORS, ColorOption } from '@/lib/types/annotation';
import { Check } from 'lucide-react';

interface AnnotationColorPickerProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
}

export function AnnotationColorPicker({
  selectedColor,
  onColorSelect,
}: AnnotationColorPickerProps) {
  const colors = Object.entries(ANNOTATION_COLORS) as [ColorOption, string][];

  return (
    <div className="flex gap-2 rounded-lg bg-white/10 p-2 backdrop-blur-sm">
      {colors.map(([name, color]) => {
        const isActive = selectedColor === color;
        const isWhite = color === '#FFFFFF';
        const isBlack = color === '#000000';
        
        return (
          <button
            key={name}
            onClick={() => onColorSelect(color)}
            className={`relative flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md transition-transform hover:scale-110 ${
              isWhite ? 'border-2 border-gray-400' : isBlack ? 'border-2 border-gray-600' : ''
            }`}
            style={{ backgroundColor: color }}
            title={`${name.charAt(0).toUpperCase() + name.slice(1)} color`}
            aria-label={`Select ${name} color`}
            aria-pressed={isActive}
          >
            {isActive && (
              <Check 
                className={`h-6 w-6 drop-shadow-lg ${isWhite ? 'text-gray-800' : 'text-white'}`} 
                strokeWidth={3} 
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
