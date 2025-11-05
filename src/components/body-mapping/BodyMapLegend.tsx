"use client";

import React, { useState } from "react";
import { Info } from "lucide-react";

interface BodyMapLegendProps {
  className?: string;
}

export function BodyMapLegend({ className = "" }: BodyMapLegendProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-small hover:bg-primary-light transition-colors"
        style={{ color: 'var(--text-secondary)' }}
        aria-label="Body map instructions"
      >
        <Info className="h-4 w-4" />
        <span className="font-medium">Instructions</span>
      </button>

      {isHovered && (
        <div
          className="card p-4 absolute left-0 top-full mt-2 z-10 w-64"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <h4 className="text-tiny mb-2">How to use:</h4>
          <ul className="text-small space-y-1.5" style={{ color: 'var(--text-secondary)' }}>
            <li>• Click a region to select it</li>
            <li>• Scroll to zoom in/out</li>
            <li>• Shift+Drag to pan</li>
            <li>• Hover for region details</li>
          </ul>
        </div>
      )}
    </div>
  );
}
