"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface GlassActionCardProps {
    title: string;
    icon: LucideIcon;
    colorClass: string; // e.g., "text-blue-500" or "text-primary"
    gradientClass: string; // e.g., "from-blue-500/20 to-blue-500/5"
    onClick: () => void;
    className?: string;
}

export function GlassActionCard({
    title,
    icon: Icon,
    colorClass,
    gradientClass,
    onClick,
    className,
}: GlassActionCardProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "group relative flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-300",
                "glass-panel hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]",
                "bg-gradient-to-br border border-border/50 dark:border-border",
                gradientClass,
                className
            )}
        >
            <div className={cn(
                "mb-3 p-3 rounded-xl bg-white/50 dark:bg-white/10 shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3",
                colorClass
            )}>
                <Icon className="w-6 h-6" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-semibold text-foreground/90 tracking-tight">
                {title}
            </span>
        </button>
    );
}
