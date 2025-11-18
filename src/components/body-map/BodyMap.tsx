import React, { useState, useRef, MouseEvent } from 'react';

// --- Types ---
export type BodyPartKey = 'head' | 'torso' | 'leftArm' | 'rightArm' | 'leftLeg' | 'rightLeg';

interface Marker {
  id: number;
  x: number;
  y: number;
  part: BodyPartKey;
}

interface BodyPartDef {
  id: BodyPartKey;
  name: string;
  path: string; // The SVG Path 'd' attribute
  viewBox: string; // The viewbox specific to this part for zooming
}

// --- Configuration: Body Parts SVG Paths & Zoom Zones ---
// Standard ViewBox for full body: "0 0 200 400"
const BODY_PARTS: Record<BodyPartKey, BodyPartDef> = {
  head: {
    id: 'head',
    name: 'Head',
    // Simple circular path for head
    path: 'M100,10 a30,30 0 1,0 0,60 a30,30 0 1,0 0,-60', 
    viewBox: '60 0 80 80' // Zoom in on the head area
  },
  torso: {
    id: 'torso',
    name: 'Torso',
    // Rectangular-ish path for torso
    path: 'M70,75 L130,75 L120,200 L80,200 Z', 
    viewBox: '60 70 80 140'
  },
  leftArm: {
    id: 'leftArm',
    name: 'Left Arm',
    // Angled arm
    path: 'M70,75 L40,180 L60,180 L80,100 Z', 
    viewBox: '30 70 60 120'
  },
  rightArm: {
    id: 'rightArm',
    name: 'Right Arm',
    path: 'M130,75 L160,180 L140,180 L120,100 Z', 
    viewBox: '110 70 60 120'
  },
  leftLeg: {
    id: 'leftLeg',
    name: 'Left Leg',
    path: 'M80,200 L70,380 L95,380 L98,200 Z', 
    viewBox: '60 190 50 200'
  },
  rightLeg: {
    id: 'rightLeg',
    name: 'Right Leg',
    path: 'M120,200 L130,380 L105,380 L102,200 Z', 
    viewBox: '90 190 50 200'
  }
};

const FULL_BODY_VIEWBOX = "0 0 200 400";

// --- Main Component ---
export const BodyMap: React.FC = () => {
  const [selectedPart, setSelectedPart] = useState<BodyPartKey | null>(null);
  const [markers, setMarkers] = useState<Marker[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);

  // Helper: Convert DOM click coordinates to SVG coordinates
  const getSVGPoint = (event: MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };

    // Create an SVG point
    const pt = svg.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;

    // Transform point to SVG coordinate system
    // This handles zoom, scaling, and viewbox logic automatically
    const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    return { x: svgP.x, y: svgP.y };
  };

  const handlePartClick = (partId: BodyPartKey) => {
    if (selectedPart === null) {
      setSelectedPart(partId);
    }
  };

  const handleCanvasClick = (event: MouseEvent<SVGSVGElement>) => {
    // Only allow placing markers if we are currently zoomed in
    if (selectedPart !== null) {
      const { x, y } = getSVGPoint(event);
      
      const newMarker: Marker = {
        id: Date.now(),
        x,
        y,
        part: selectedPart
      };

      setMarkers((prev) => [...prev, newMarker]);
    }
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering SVG click
    setSelectedPart(null);
  };

  // Determine current viewBox
  const currentViewBox = selectedPart 
    ? BODY_PARTS[selectedPart].viewBox 
    : FULL_BODY_VIEWBOX;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3>{selectedPart ? BODY_PARTS[selectedPart].name : "Select a Body Region"}</h3>
        {selectedPart && (
          <button onClick={handleReset} style={styles.backButton}>
            ← Back to Full Body
          </button>
        )}
      </div>

      <svg
        ref={svgRef}
        viewBox={currentViewBox}
        style={styles.svg}
        onClick={handleCanvasClick}
        // Smooth transition for zoom effect
        className="body-svg" 
      >
        {/* Render All Body Parts */}
        {(Object.values(BODY_PARTS) as BodyPartDef[]).map((part) => {
          const isSelected = selectedPart === part.id;
          const isDimmed = selectedPart !== null && !isSelected;

          return (
            <path
              key={part.id}
              d={part.path}
              fill={isSelected ? "#e3f2fd" : "#eeeeee"}
              stroke="#333"
              strokeWidth="2"
              style={{
                cursor: selectedPart === null ? 'pointer' : 'crosshair',
                opacity: isDimmed ? 0.3 : 1,
                transition: 'opacity 0.3s ease, fill 0.3s ease'
              }}
              onClick={(e) => {
                e.stopPropagation(); // Stop bubbling to canvas
                if (selectedPart === null) {
                  handlePartClick(part.id);
                } else if (selectedPart === part.id) {
                   // If already selected, treat as canvas click to place marker
                   handleCanvasClick(e); 
                }
              }}
              onMouseEnter={(e) => {
                 if(!selectedPart) e.currentTarget.style.fill = "#bbdefb";
              }}
              onMouseLeave={(e) => {
                 if(!selectedPart) e.currentTarget.style.fill = "#eeeeee";
              }}
            />
          );
        })}

        {/* Render Markers */}
        {markers.map((marker) => (
          <circle
            key={marker.id}
            cx={marker.x}
            cy={marker.y}
            r={selectedPart ? 2 : 5} // Scale down dot if we are zoomed out so it doesn't look huge
            fill="#ff1744"
            stroke="white"
            strokeWidth={selectedPart ? 0.5 : 1}
          />
        ))}
      </svg>

      {/* Optional: Instructions */}
      <p style={styles.instruction}>
        {selectedPart 
          ? "Tap anywhere on the region to place a marker." 
          : "Tap a region to zoom in."}
      </p>
      
      <style>{`
        .body-svg {
          transition: view-box 0.5s ease; /* Note: standard CSS transition for viewBox is partial support, React handles re-render */
          display: block;
          width: 100%;
          height: 100%;
        }
      `}</style>
    </div>
  );
};

// --- Inline Styles for Quick Prototyping ---
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '400px',
    margin: '0 auto',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '1rem',
    fontFamily: 'sans-serif',
    backgroundColor: '#fff'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px'
  },
  backButton: {
    padding: '5px 10px',
    cursor: 'pointer',
    backgroundColor: '#333',
    color: '#fff',
    border: 'none',
    borderRadius: '4px'
  },
  svg: {
    width: '100%',
    height: '500px',
    backgroundColor: '#fafafa',
    borderRadius: '4px',
    touchAction: 'none' // Prevents scrolling on mobile while tapping
  },
  instruction: {
    textAlign: 'center',
    color: '#666',
    fontSize: '0.9rem',
    marginTop: '10px'
  }
};

export default BodyMap;