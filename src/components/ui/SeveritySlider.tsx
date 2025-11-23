'use client';

import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils/cn';

interface SeveritySliderProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    className?: string;
    labels?: { [key: number]: string };
}

export function SeveritySlider({
    value,
    onChange,
    min = 1,
    max = 10,
    step = 1,
    className,
    labels
}: SeveritySliderProps) {
    const lastValue = useRef(value);

    // Haptic feedback on value change
    useEffect(() => {
        if (value !== lastValue.current) {
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
                // Stronger vibration for higher severity
                const intensity = Math.max(5, value * 2);
                navigator.vibrate(intensity);
            }
            lastValue.current = value;
        }
    }, [value]);

    // Calculate color based on value (Green -> Yellow -> Red)
    const getTrackColor = () => {
        const percentage = ((value - min) / (max - min)) * 100;
        // HSL transition: Green (120) -> Red (0)
        const hue = 120 - (percentage * 1.2);
        return `hsl(${hue}, 80%, 45%)`;
    };

    return (
        <div className={cn("w-full space-y-4", className)}>
            <div className="relative h-12 flex items-center select-none touch-none">
                {/* Track Background */}
                <div className="absolute w-full h-4 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    {/* Gradient Overlay */}
                    <div
                        className="absolute inset-y-0 left-0 transition-all duration-150 ease-out"
                        style={{
                            width: `${((value - min) / (max - min)) * 100}%`,
                            backgroundColor: getTrackColor()
                        }}
                    />
                </div>

                {/* Native Range Input (Invisible but interactive) */}
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    aria-label="Severity slider"
                />

                {/* Custom Thumb (Visual only) */}
                <div
                    className="absolute h-8 w-8 rounded-full bg-card shadow-lg border-2 border-border flex items-center justify-center pointer-events-none transition-all duration-150 ease-out z-20"
                    style={{
                        left: `calc(${((value - min) / (max - min)) * 100}% - 16px)`
                    }}
                >
                    <span className="text-xs font-bold text-foreground">{value}</span>
                </div>
            </div>

            {/* Labels */}
            <div className="flex justify-between px-1">
                <span className="text-xs font-medium text-muted-foreground">Mild</span>
                {labels && labels[value] && (
                    <span className="text-sm font-semibold text-foreground animate-in fade-in slide-in-from-bottom-1">
                        {labels[value]}
                    </span>
                )}
                <span className="text-xs font-medium text-muted-foreground">Severe</span>
            </div>
        </div>
    );
}
