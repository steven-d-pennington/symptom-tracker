"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import type { TreatmentRecord } from "@/lib/db/schema";
import { cn } from "@/lib/utils/cn";

interface TreatmentCategoryProps {
    name: string;
    treatments: TreatmentRecord[];
    isExpanded: boolean;
    onToggle: (expanded: boolean) => void;
    onSelectTreatment: (treatment: TreatmentRecord) => void;
    selectedTreatmentId?: string;
}

/**
 * Collapsible Treatment Category Component
 *
 * Accordion-style category with expand/collapse functionality.
 */
export function TreatmentCategory({
    name,
    treatments,
    isExpanded,
    onToggle,
    onSelectTreatment,
    selectedTreatmentId,
}: TreatmentCategoryProps) {
    return (
        <div className="border border-border rounded-lg mb-2 overflow-hidden bg-card">
            <button
                onClick={() => onToggle(!isExpanded)}
                className="w-full flex items-center justify-between p-4 min-h-[44px] hover:bg-muted transition-colors"
                aria-expanded={isExpanded}
                aria-controls={`category-${name}`}
            >
                <span className="font-medium text-foreground">
                    {name} ({treatments.length} {treatments.length === 1 ? 'item' : 'items'})
                </span>
                {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground transition-transform" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground transition-transform" />
                )}
            </button>

            <div
                id={`category-${name}`}
                className={cn(
                    "overflow-hidden transition-all duration-300 ease-in-out",
                    isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
                )}
            >
                <div className="p-4 pt-0 space-y-2">
                    {treatments.map((treatment) => (
                        <button
                            key={treatment.id}
                            onClick={() => onSelectTreatment(treatment)}
                            className={cn(
                                "w-full text-left p-3 border rounded-lg min-h-[44px] transition-all",
                                selectedTreatmentId === treatment.id
                                    ? "bg-primary/10 border-primary ring-2 ring-primary"
                                    : "border-border hover:bg-primary/5 hover:border-primary/50"
                            )}
                            aria-pressed={selectedTreatmentId === treatment.id}
                        >
                            <div className="flex items-center justify-between gap-2">
                                <span className="flex-1 font-medium text-foreground">
                                    {treatment.name}
                                </span>
                                {!treatment.isDefault && (
                                    <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded">
                                        Custom
                                    </span>
                                )}
                            </div>
                            {treatment.duration && (
                                <span className="text-xs text-muted-foreground mt-1 block">
                                    {treatment.duration} mins
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
