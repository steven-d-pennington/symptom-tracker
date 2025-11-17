"use client";

import React from "react";

/**
 * PROFESSIONAL FEMALE BODY ILLUSTRATION
 *
 * Uses nested SVG with original viewBox to properly display the professional paths
 * The nested SVG handles the coordinate transformation automatically
 */

interface SimplifiedFemaleBodyProps {
  view: "front" | "back";
  className?: string;
}

export function SimplifiedFemaleBody({ view, className = "" }: SimplifiedFemaleBodyProps) {
  if (view === "front") {
    return (
      <g className={className}>
        {/* Nested SVG with original viewBox - browser handles scaling */}
        <svg
          x="0"
          y="0"
          width="400"
          height="800"
          viewBox="800 1800 2000 3800"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Front body outline from original SVG (path6) */}
          <path
            d="m 1449.69,3529.81 -53.42,-459.31 c 9.97,-86.42 -23.93,-209.48 -41.23,-264.87 -3.13,-10.01 -38.31,-145.97 -62.15,-238.38 -14.22,-55.09 -11.67,-113.87 7.2,-167.18 v 0 c 7.02,-19.82 9.66,-40.36 7.8,-60.64 l -13.08,-142.63 c -0.7,-7.67 -2.55,-15.27 -6.16,-21.83 -8.91,-16.19 -17.77,-8.07 -24.24,3.53 -6.9,12.37 -10.06,26.91 -10.36,41.49 l -2.08,102.85 c -14.13,-24.59 -19.1,-53.83 -20.74,-74.75 -1.3,-16.67 3.38,-33.45 13.44,-48.4 l 51.17,-76.05 c 11.48,-17.5 9.98,-30.03 5.18,-38.4 -4.7,-8.2 -18.97,-8.56 -25.25,-0.72 l -21.03,26.23 -73.69,72.73 c -6.42,6.34 -10.91,13.79 -13.09,21.71 l -19.39,70.76 c -1.53,5.59 -1.88,11.31 -1.03,16.92 l 25.37,167.64 c 7.49,49.56 10.92,99.78 10.23,150.03 l -4.73,344.21 c -0.48,35.02 5.58,69.69 17.97,102.84 16.28,43.53 24.1,89.16 23.19,135.17 -2.1,105.08 -6.97,210.18 -6.43,315.3 0.33,64.35 -10.18,318.93 267.93,342.56 l 114.15,-6.22"
            fill="#ffffff"
            fillOpacity="0.3"
            stroke="#78716C"
            strokeWidth="15"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </g>
    );
  }

  // Back view
  return (
    <g className={className}>
      {/* Nested SVG with original viewBox - browser handles scaling */}
      <svg
        x="0"
        y="0"
        width="400"
        height="800"
        viewBox="1600 1800 2000 3800"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Back body outline from original SVG (path13) */}
        <path
          d="m 2146.68,3529.81 53.42,-459.31 c -9.97,-86.42 23.93,-209.48 41.23,-264.87 3.13,-10.01 38.31,-145.97 62.15,-238.38 14.22,-55.09 11.67,-113.87 -7.2,-167.18 v 0 c -7.02,-19.82 -9.66,-40.36 -7.8,-60.64 l 13.08,-142.63 c 0.7,-7.67 2.55,-15.27 6.16,-21.83 8.91,-16.19 17.77,-8.07 24.24,3.53 6.9,12.37 10.06,26.91 10.36,41.49 l 2.08,102.85 c 14.13,-24.59 19.1,-53.83 20.74,-74.75 1.3,-16.67 -3.38,-33.45 -13.44,-48.4 l -51.17,-76.05 c -11.48,-17.5 -9.98,-30.03 -5.18,-38.4 4.7,-8.2 18.97,-8.56 25.25,-0.72 l 21.03,26.23 73.69,72.73 c 6.42,6.34 10.91,13.79 13.09,21.71 l 19.39,70.76 c 1.53,5.59 1.88,11.31 1.03,16.92 l -25.37,167.64 c -7.5,49.56 -10.92,99.78 -10.23,150.03 l 4.73,344.21 c 0.48,35.02 -5.58,69.69 -17.97,102.84 -16.28,43.53 -24.1,89.16 -23.19,135.17 2.1,105.08 6.96,210.18 6.43,315.3 -0.33,64.35 10.18,318.93 -267.93,342.56 l -114.15,-6.22"
          fill="#ffffff"
          fillOpacity="0.3"
          stroke="#78716C"
          strokeWidth="15"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </g>
  );
}
