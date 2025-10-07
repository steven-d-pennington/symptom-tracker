"use client";

import React from "react";
import { SEVERITY_COLORS } from "@/lib/types/body-mapping";

interface BodyMapLegendProps {
  className?: string;
}

export function BodyMapLegend({ className = "" }: BodyMapLegendProps) {
  const severityLevels = [
    { label: "Minimal (1-2)", color: SEVERITY_COLORS.minimal, range: "1-2" },
    { label: "Mild (3-4)", color: SEVERITY_COLORS.mild, range: "3-4" },
    { label: "Moderate (5-6)", color: SEVERITY_COLORS.moderate, range: "5-6" },
    { label: "Severe (7-8)", color: SEVERITY_COLORS.severe, range: "7-8" },
    { label: "Extreme (9-10)", color: SEVERITY_COLORS.extreme, range: "9-10" },
  ];

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Severity Scale</h3>
      <div className="space-y-2">
        {severityLevels.map((level) => (
          <div key={level.range} className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full border border-gray-300"
              style={{ backgroundColor: level.color }}
            />
            <span className="text-sm text-gray-600">{level.label}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <h4 className="text-xs font-semibold text-gray-700 mb-2">Instructions</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Click a region to select it</li>
          <li>• Scroll to zoom in/out</li>
          <li>• Shift+Drag to pan</li>
          <li>• Hover for region details</li>
        </ul>
      </div>
    </div>
  );
}
