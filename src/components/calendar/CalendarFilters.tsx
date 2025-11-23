"use client";

import { FormEvent, useState, useRef, useEffect } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    CalendarFilterOptions,
    CalendarFilters as CalendarFiltersType,
    DisplayOptions,
    FilterPreset,
} from "@/lib/types/calendar";

interface CalendarFiltersProps {
    filters: CalendarFiltersType;
    searchTerm: string;
    filterOptions: CalendarFilterOptions;
    displayOptions: DisplayOptions;
    presets: FilterPreset[];
    activePresetId: string | null;
    onFiltersChange: (update: Partial<CalendarFiltersType>) => void;
    onDisplayOptionsChange: (options: Partial<DisplayOptions>) => void;
    onSeverityChange: (range: [number, number]) => void;
    onClearFilters: () => void;
    onSearchTermChange: (term: string) => void;
    onSavePreset: (name: string) => void;
    onApplyPreset: (id: string) => void;
    onDeletePreset: (id: string) => void;
}

const toggleValue = (list: string[] = [], value: string) =>
    list.includes(value) ? list.filter((item) => item !== value) : [...list, value];

export const CalendarFilters = ({
    filters,
    searchTerm,
    filterOptions,
    displayOptions,
    presets,
    activePresetId,
    onFiltersChange,
    onDisplayOptionsChange,
    onSeverityChange,
    onClearFilters,
    onSearchTermChange,
    onSavePreset,
    onApplyPreset,
    onDeletePreset,
}: CalendarFiltersProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
    const [presetName, setPresetName] = useState("");
    const panelRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Debounced search
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (localSearchTerm !== searchTerm) {
                onSearchTermChange(localSearchTerm);
            }
        }, 300);
        return () => clearTimeout(timeout);
    }, [localSearchTerm, searchTerm, onSearchTermChange]);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                isOpen &&
                panelRef.current &&
                !panelRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const handlePresetSave = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!presetName.trim()) return;
        onSavePreset(presetName);
        setPresetName("");
    };

    const activeFilterCount = [
        filters.categories?.length ?? 0,
        filters.symptoms?.length ?? 0,
        filters.medications?.length ?? 0,
        filters.triggers?.length ?? 0,
        searchTerm ? 1 : 0,
        (filters.severityRange?.[0] ?? 0) > 0 || (filters.severityRange?.[1] ?? 10) < 10 ? 1 : 0
    ].reduce((a, b) => a + b, 0);

    return (
        <div className="relative">
            <Button
                ref={buttonRef}
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setIsOpen(!isOpen)}
            >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 min-w-[1.25rem] px-1">
                        {activeFilterCount}
                    </Badge>
                )}
            </Button>

            {isOpen && (
                <div
                    ref={panelRef}
                    className="absolute right-0 top-12 z-50 w-96 max-h-[80vh] overflow-y-auto bg-background border rounded-lg shadow-lg p-6"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-semibold">Timeline Filters</h3>
                            <p className="text-sm text-muted-foreground">
                                Customize your view
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsOpen(false)}
                            className="h-8 w-8 p-0"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="space-y-6">
                        {/* Search */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Search entries</label>
                            <Input
                                type="search"
                                value={localSearchTerm}
                                onChange={(e) => setLocalSearchTerm(e.target.value)}
                                placeholder="Search by mood, note, or keyword"
                            />
                        </div>

                        {/* Presets */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium">Saved Presets</label>
                            <div className="flex flex-wrap gap-2">
                                {presets.length === 0 ? (
                                    <span className="text-xs text-muted-foreground">No presets saved yet</span>
                                ) : (
                                    presets.map((preset) => (
                                        <Badge
                                            key={preset.id}
                                            variant={activePresetId === preset.id ? "default" : "outline"}
                                            className="gap-1 pr-1"
                                        >
                                            <button
                                                type="button"
                                                onClick={() => onApplyPreset(preset.id)}
                                                className="hover:underline"
                                            >
                                                {preset.name}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDeletePreset(preset.id);
                                                }}
                                                className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                                            >
                                                <X className="h-3 w-3" />
                                                <span className="sr-only">Delete {preset.name}</span>
                                            </button>
                                        </Badge>
                                    ))
                                )}
                            </div>
                            <form onSubmit={handlePresetSave} className="flex gap-2">
                                <Input
                                    value={presetName}
                                    onChange={(e) => setPresetName(e.target.value)}
                                    placeholder="Save current filters as..."
                                    className="h-8 text-xs"
                                />
                                <Button type="submit" size="sm" variant="secondary" disabled={!presetName.trim()}>
                                    Save
                                </Button>
                            </form>
                        </div>

                        {/* Display Options */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium">Display Options</label>
                            <div className="grid grid-cols-2 gap-2">
                                {([
                                    { label: "Health Score", key: "showHealthScore" },
                                    { label: "Symptoms", key: "showSymptoms" },
                                    { label: "Medications", key: "showMedications" },
                                    { label: "Triggers", key: "showTriggers" },
                                ] as const).map((toggle) => (
                                    <label key={toggle.key} className="flex items-center gap-2 rounded-lg border p-2 text-sm hover:bg-muted/50 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={displayOptions[toggle.key]}
                                            onChange={(event) =>
                                                onDisplayOptionsChange({ [toggle.key]: event.target.checked })
                                            }
                                            className="rounded border-primary text-primary focus:ring-primary"
                                        />
                                        <span>{toggle.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Severity Range */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium">Severity Range</label>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-auto p-0 text-xs text-muted-foreground hover:text-primary"
                                    onClick={() => onSeverityChange([0, 10])}
                                >
                                    Reset
                                </Button>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="grid gap-1">
                                    <span className="text-xs text-muted-foreground">Min</span>
                                    <Input
                                        type="number"
                                        min={0}
                                        max={10}
                                        step={0.5}
                                        value={filters.severityRange?.[0] ?? 0}
                                        onChange={(e) =>
                                            onSeverityChange([Number(e.target.value), filters.severityRange?.[1] ?? 10])
                                        }
                                        className="h-8 w-20"
                                    />
                                </div>
                                <div className="grid gap-1">
                                    <span className="text-xs text-muted-foreground">Max</span>
                                    <Input
                                        type="number"
                                        min={0}
                                        max={10}
                                        step={0.5}
                                        value={filters.severityRange?.[1] ?? 10}
                                        onChange={(e) =>
                                            onSeverityChange([filters.severityRange?.[0] ?? 0, Number(e.target.value)])
                                        }
                                        className="h-8 w-20"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Categories */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Categories</label>
                            <div className="flex flex-wrap gap-2">
                                {filterOptions.categories.map((category) => (
                                    <Badge
                                        key={category}
                                        variant={filters.categories?.includes(category) ? "default" : "outline"}
                                        className="cursor-pointer"
                                        onClick={() =>
                                            onFiltersChange({
                                                categories: toggleValue(filters.categories, category),
                                            })
                                        }
                                    >
                                        {category}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Symptoms */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Symptoms</label>
                            <div className="flex flex-wrap gap-2">
                                {filterOptions.symptoms.map((symptom) => (
                                    <Badge
                                        key={symptom}
                                        variant={filters.symptoms?.includes(symptom) ? "secondary" : "outline"}
                                        className="cursor-pointer hover:bg-secondary/80"
                                        onClick={() =>
                                            onFiltersChange({
                                                symptoms: toggleValue(filters.symptoms, symptom),
                                            })
                                        }
                                    >
                                        {symptom}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Medications */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Medications</label>
                            <div className="flex flex-wrap gap-2">
                                {filterOptions.medications.map((medication) => (
                                    <Badge
                                        key={medication}
                                        variant={filters.medications?.includes(medication) ? "secondary" : "outline"}
                                        className="cursor-pointer hover:bg-secondary/80"
                                        onClick={() =>
                                            onFiltersChange({
                                                medications: toggleValue(filters.medications, medication),
                                            })
                                        }
                                    >
                                        {medication}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Triggers */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Triggers</label>
                            <div className="flex flex-wrap gap-2">
                                {filterOptions.triggers.map((trigger) => (
                                    <Badge
                                        key={trigger}
                                        variant={filters.triggers?.includes(trigger) ? "secondary" : "outline"}
                                        className="cursor-pointer hover:bg-secondary/80"
                                        onClick={() =>
                                            onFiltersChange({
                                                triggers: toggleValue(filters.triggers, trigger),
                                            })
                                        }
                                    >
                                        {trigger}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-between pt-4 border-t">
                            <Button variant="ghost" onClick={onClearFilters}>
                                Clear all filters
                            </Button>
                            <Button onClick={() => setIsOpen(false)}>
                                Done
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
