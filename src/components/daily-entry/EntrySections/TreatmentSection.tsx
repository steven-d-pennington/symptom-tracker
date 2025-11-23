"use client";

import { DailyTreatment } from "@/lib/types/daily-entry";
import { TreatmentRecord } from "@/lib/db/schema";
import { Clock, Star } from "lucide-react";

interface TreatmentSectionProps {
    treatments: DailyTreatment[];
    availableTreatments: TreatmentRecord[];
    onToggleTreatment: (treatmentId: string) => void;
    onUpdateTreatment: (
        treatmentId: string,
        changes: Partial<DailyTreatment>,
    ) => void;
}

export const TreatmentSection = ({
    treatments,
    availableTreatments,
    onToggleTreatment,
    onUpdateTreatment,
}: TreatmentSectionProps) => {
    return (
        <section className="space-y-4" aria-label="Treatment tracking">
            <header className="space-y-1">
                <h3 className="text-lg font-semibold text-foreground">Treatments</h3>
                <p className="text-sm text-muted-foreground">
                    Log any physical interventions or therapies you used today.
                </p>
            </header>

            <div className="space-y-4">
                {availableTreatments.map((treatment) => {
                    const entryTreatment = treatments.find(
                        (item) => item.treatmentId === treatment.id,
                    );
                    const isLogged = !!entryTreatment;

                    return (
                        <div
                            key={treatment.id}
                            className={`flex flex-col gap-3 rounded-xl border p-4 shadow-sm transition-all sm:flex-row sm:items-start sm:justify-between ${isLogged
                                    ? "border-primary/50 bg-primary/5"
                                    : "border-border bg-background/60"
                                }`}
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={isLogged}
                                        onChange={() => onToggleTreatment(treatment.id)}
                                        className="h-5 w-5 rounded border-border text-primary focus:ring-primary"
                                    />
                                    <div>
                                        <p className="font-semibold text-foreground">
                                            {treatment.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {treatment.category}
                                            {treatment.duration ? ` · ${treatment.duration} min` : ""}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {isLogged && (
                                <div className="flex flex-1 flex-col gap-3 pl-8 sm:pl-0 sm:flex-row sm:items-center sm:justify-end animate-in fade-in slide-in-from-top-2 duration-200">
                                    {/* Duration Input */}
                                    <label className="flex flex-col gap-1.5 text-sm sm:w-24">
                                        <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                            <Clock className="h-3 w-3" />
                                            Mins
                                        </span>
                                        <input
                                            type="number"
                                            min="0"
                                            value={entryTreatment?.duration ?? treatment.duration ?? ""}
                                            onChange={(e) =>
                                                onUpdateTreatment(treatment.id, {
                                                    duration: parseInt(e.target.value) || 0,
                                                })
                                            }
                                            className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm"
                                            placeholder="20"
                                        />
                                    </label>

                                    {/* Effectiveness Input */}
                                    <label className="flex flex-col gap-1.5 text-sm sm:w-24">
                                        <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                            <Star className="h-3 w-3" />
                                            Effect (1-10)
                                        </span>
                                        <input
                                            type="number"
                                            min="1"
                                            max="10"
                                            value={entryTreatment?.effectiveness ?? ""}
                                            onChange={(e) =>
                                                onUpdateTreatment(treatment.id, {
                                                    effectiveness: parseInt(e.target.value) || undefined,
                                                })
                                            }
                                            className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm"
                                            placeholder="-"
                                        />
                                    </label>

                                    {/* Notes Input */}
                                    <label className="flex flex-[2] flex-col gap-1.5 text-sm">
                                        <span className="text-xs font-medium text-muted-foreground">
                                            Notes
                                        </span>
                                        <input
                                            type="text"
                                            value={entryTreatment?.notes ?? ""}
                                            onChange={(e) =>
                                                onUpdateTreatment(treatment.id, {
                                                    notes: e.target.value,
                                                })
                                            }
                                            placeholder="How did it help?"
                                            className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm"
                                        />
                                    </label>
                                </div>
                            )}
                        </div>
                    );
                })}

                {availableTreatments.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border">
                        <p>No treatments available.</p>
                        <p className="text-sm mt-1">Add treatments in Settings to track them here.</p>
                    </div>
                )}
            </div>
        </section>
    );
};
