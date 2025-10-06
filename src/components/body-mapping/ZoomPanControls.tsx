"use client";

import React from "react";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

interface ZoomPanControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export function ZoomPanControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onReset,
}: ZoomPanControlsProps) {
  return (
    <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
      {/* Zoom In */}
      <button
        onClick={onZoomIn}
        disabled={zoom >= 3}
        className="p-2 bg-white rounded-lg shadow-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        title="Zoom In"
        aria-label="Zoom in"
      >
        <ZoomIn className="w-5 h-5 text-gray-700" />
      </button>

      {/* Zoom Level Indicator */}
      <div className="px-3 py-1 bg-white rounded-lg shadow-lg text-sm font-medium text-gray-700">
        {Math.round(zoom * 100)}%
      </div>

      {/* Zoom Out */}
      <button
        onClick={onZoomOut}
        disabled={zoom <= 0.5}
        className="p-2 bg-white rounded-lg shadow-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        title="Zoom Out"
        aria-label="Zoom out"
      >
        <ZoomOut className="w-5 h-5 text-gray-700" />
      </button>

      {/* Reset View */}
      <button
        onClick={onReset}
        className="p-2 bg-white rounded-lg shadow-lg hover:bg-gray-100 transition-all"
        title="Reset View"
        aria-label="Reset view to default"
      >
        <Maximize2 className="w-5 h-5 text-gray-700" />
      </button>
    </div>
  );
}
