'use client';

import React, { useState, useEffect } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImmersiveBodyMapWrapperProps {
    children: React.ReactNode;
    className?: string;
}

export function ImmersiveBodyMapWrapper({ children, className }: ImmersiveBodyMapWrapperProps) {
    const [isImmersive, setIsImmersive] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    const toggleImmersive = () => {
        setIsAnimating(true);
        setIsImmersive(!isImmersive);

        // Simple haptic feedback if available
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(10);
        }

        // Reset animation state after transition
        setTimeout(() => setIsAnimating(false), 300);
    };

    // Handle escape key to exit immersive mode
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isImmersive) {
                toggleImmersive();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isImmersive]);

    return (
        <>
            {/* Placeholder to prevent layout shift when fixed */}
            {isImmersive && <div className={cn("w-full h-[600px]", className)} />}

            <div
                className={cn(
                    "transition-all duration-300 ease-in-out bg-white dark:bg-zinc-900",
                    isImmersive
                        ? "fixed inset-0 z-50 flex flex-col p-4 md:p-8"
                        : "relative w-full h-[600px] rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden",
                    className
                )}
            >
                {/* Header / Controls */}
                <div className={cn(
                    "flex justify-between items-center mb-4",
                    isImmersive ? "w-full max-w-4xl mx-auto" : ""
                )}>
                    <h3 className={cn(
                        "font-semibold text-zinc-900 dark:text-zinc-100 transition-all",
                        isImmersive ? "text-xl" : "text-lg"
                    )}>
                        {isImmersive ? 'Body Map Explorer' : 'Body Map'}
                    </h3>

                    <button
                        onClick={toggleImmersive}
                        className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-600 dark:text-zinc-400"
                        aria-label={isImmersive ? "Exit full screen" : "Enter full screen"}
                        title={isImmersive ? "Exit full screen (Esc)" : "Enter full screen"}
                    >
                        {isImmersive ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                    </button>
                </div>

                {/* Content Area */}
                <div className={cn(
                    "flex-1 w-full transition-all",
                    isImmersive ? "max-w-4xl mx-auto" : ""
                )}>
                    {children}
                </div>
            </div>
        </>
    );
}
