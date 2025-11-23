"use client";

import React, { useState } from "react";
import { RealisticFrontBody } from "@/components/body-map/RealisticFrontBody";

export default function BodyMapPreviewPage() {
    const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
    const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

    const handleRegionClick = (regionId: string) => {
        setSelectedRegions((prev) =>
            prev.includes(regionId)
                ? prev.filter((id) => id !== regionId)
                : [...prev, regionId]
        );
    };

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Body Map SVG Preview</h1>
                <p className="text-muted-foreground mb-8">
                    This is a preview of the new realistic body map SVG. Click on regions to test selection.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="card p-6 flex flex-col items-center bg-card border rounded-xl shadow-sm">
                        <h2 className="text-xl font-semibold mb-4">Interactive Preview</h2>
                        <div className="w-full max-w-[400px] border rounded-lg p-4 bg-white/50 dark:bg-black/20">
                            <RealisticFrontBody
                                selectedRegions={selectedRegions}
                                onRegionClick={handleRegionClick}
                                hoveredRegion={hoveredRegion}
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="card p-6 border rounded-xl shadow-sm">
                            <h2 className="text-xl font-semibold mb-4">Selected Regions</h2>
                            {selectedRegions.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {selectedRegions.map((region) => (
                                        <span
                                            key={region}
                                            className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                                        >
                                            {region}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground italic">No regions selected</p>
                            )}
                        </div>

                        <div className="card p-6 border rounded-xl shadow-sm">
                            <h2 className="text-xl font-semibold mb-4">Design Notes</h2>
                            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                                <li>Replaced geometric shapes with anatomical paths</li>
                                <li>Maintained existing ID structure for compatibility</li>
                                <li>Added hover and selection states</li>
                                <li>Optimized for responsive scaling</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
