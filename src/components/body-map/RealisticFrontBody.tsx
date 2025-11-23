"use client";

import React from "react";

interface RealisticFrontBodyProps {
    onRegionClick?: (regionId: string) => void;
    selectedRegions?: string[];
    hoveredRegion?: string | null;
}

export function RealisticFrontBody({
    onRegionClick,
    selectedRegions = [],
    hoveredRegion,
}: RealisticFrontBodyProps) {
    const getRegionStyle = (regionId: string) => {
        const isSelected = selectedRegions.includes(regionId);
        const isHovered = hoveredRegion === regionId;

        return {
            fill: isSelected ? "#0F9D91" : isHovered ? "#E0F5F3" : "#F5F5F4",
            stroke: isSelected ? "#0F9D91" : "#78716C",
            strokeWidth: isSelected ? 2 : 1,
            opacity: isSelected ? 0.6 : 1,
            cursor: "pointer",
            transition: "all 0.2s ease"
        };
    };

    return (
        <svg
            viewBox="0 0 400 800"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full max-w-[400px] mx-auto"
        >
            <defs>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <linearGradient id="skin-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#F5F5F4" />
                    <stop offset="50%" stopColor="#FAFAFA" />
                    <stop offset="100%" stopColor="#F5F5F4" />
                </linearGradient>
            </defs>

            {/* Head - More organic oval with chin definition */}
            <path
                d="M200,35 C182,35 168,48 168,72 C168,92 178,108 200,108 C222,108 232,92 232,72 C232,48 218,35 200,35 Z"
                id="head-front"
                style={getRegionStyle("head-front")}
                onClick={() => onRegionClick?.("head-front")}
            />

            {/* Neck - Tapered naturally */}
            <path
                d="M186,102 Q186,125 182,130 L218,130 Q214,125 214,102 Q200,110 186,102 Z"
                id="neck-front"
                style={getRegionStyle("neck-front")}
                onClick={() => onRegionClick?.("neck-front")}
            />

            {/* Torso - Chest Left - Pectoral shape */}
            <path
                d="M200,130 L200,230 Q170,225 155,215 Q145,180 150,155 Q160,135 200,130 Z"
                id="chest-left"
                style={getRegionStyle("chest-left")}
                onClick={() => onRegionClick?.("chest-left")}
            />

            {/* Torso - Chest Right - Pectoral shape */}
            <path
                d="M200,130 L200,230 Q230,225 245,215 Q255,180 250,155 Q240,135 200,130 Z"
                id="chest-right"
                style={getRegionStyle("chest-right")}
                onClick={() => onRegionClick?.("chest-right")}
            />

            {/* Torso - Abdomen Upper - Ribcage hint */}
            <path
                d="M155,215 Q170,225 200,230 Q230,225 245,215 L242,290 Q200,300 158,290 Z"
                id="abdomen-upper"
                style={getRegionStyle("abdomen-upper")}
                onClick={() => onRegionClick?.("abdomen-upper")}
            />

            {/* Torso - Abdomen Lower - Tapering to hips */}
            <path
                d="M158,290 Q200,300 242,290 L238,350 Q200,365 162,350 Z"
                id="abdomen-lower"
                style={getRegionStyle("abdomen-lower")}
                onClick={() => onRegionClick?.("abdomen-lower")}
            />

            {/* Shoulders - Deltoid curve */}
            <path
                d="M182,130 Q160,132 145,140 Q135,150 132,165 L145,175 Q165,150 182,130 Z"
                id="shoulder-left"
                style={getRegionStyle("shoulder-left")}
                onClick={() => onRegionClick?.("shoulder-left")}
            />
            <path
                d="M218,130 Q240,132 255,140 Q265,150 268,165 L255,175 Q235,150 218,130 Z"
                id="shoulder-right"
                style={getRegionStyle("shoulder-right")}
                onClick={() => onRegionClick?.("shoulder-right")}
            />

            {/* Upper Arms - Bicep curve */}
            <path
                d="M132,165 Q120,200 122,245 L142,245 Q148,200 145,175 Z"
                id="upper-arm-left"
                style={getRegionStyle("upper-arm-left")}
                onClick={() => onRegionClick?.("upper-arm-left")}
            />
            <path
                d="M268,165 Q280,200 278,245 L258,245 Q252,200 255,175 Z"
                id="upper-arm-right"
                style={getRegionStyle("upper-arm-right")}
                onClick={() => onRegionClick?.("upper-arm-right")}
            />

            {/* Elbows - Subtle joint */}
            <circle
                cx="132" cy="255" r="14"
                id="elbow-left"
                style={getRegionStyle("elbow-left")}
                onClick={() => onRegionClick?.("elbow-left")}
            />
            <circle
                cx="268" cy="255" r="14"
                id="elbow-right"
                style={getRegionStyle("elbow-right")}
                onClick={() => onRegionClick?.("elbow-right")}
            />

            {/* Forearms - Taper to wrist */}
            <path
                d="M122,265 Q115,300 112,350 L138,350 Q140,300 142,265 Z"
                id="forearm-left"
                style={getRegionStyle("forearm-left")}
                onClick={() => onRegionClick?.("forearm-left")}
            />
            <path
                d="M278,265 Q285,300 288,350 L262,350 Q260,300 258,265 Z"
                id="forearm-right"
                style={getRegionStyle("forearm-right")}
                onClick={() => onRegionClick?.("forearm-right")}
            />

            {/* Hands - Simple mitten shape for clarity */}
            <path
                d="M112,350 Q105,380 105,400 Q115,415 130,405 Q140,380 138,350 Z"
                id="hand-left"
                style={getRegionStyle("hand-left")}
                onClick={() => onRegionClick?.("hand-left")}
            />
            <path
                d="M288,350 Q295,380 295,400 Q285,415 270,405 Q260,380 262,350 Z"
                id="hand-right"
                style={getRegionStyle("hand-right")}
                onClick={() => onRegionClick?.("hand-right")}
            />

            {/* Hips - Iliac crest curve */}
            <path
                d="M162,350 Q150,370 145,390 L185,410 L200,365 Z"
                id="hip-left"
                style={getRegionStyle("hip-left")}
                onClick={() => onRegionClick?.("hip-left")}
            />
            <path
                d="M238,350 Q250,370 255,390 L215,410 L200,365 Z"
                id="hip-right"
                style={getRegionStyle("hip-right")}
                onClick={() => onRegionClick?.("hip-right")}
            />

            {/* Groin Center */}
            <path
                d="M185,410 L215,410 L200,440 Z"
                id="center-groin"
                style={getRegionStyle("center-groin")}
                onClick={() => onRegionClick?.("center-groin")}
            />

            {/* Thighs - Quadricep curve */}
            <path
                d="M145,390 Q135,450 145,540 L190,540 Q195,450 200,440 L185,410 Z"
                id="thigh-left"
                style={getRegionStyle("thigh-left")}
                onClick={() => onRegionClick?.("thigh-left")}
            />
            <path
                d="M255,390 Q265,450 255,540 L210,540 Q205,450 200,440 L215,410 Z"
                id="thigh-right"
                style={getRegionStyle("thigh-right")}
                onClick={() => onRegionClick?.("thigh-right")}
            />

            {/* Knees - Patella definition */}
            <circle
                cx="168" cy="555" r="18"
                id="knee-left"
                style={getRegionStyle("knee-left")}
                onClick={() => onRegionClick?.("knee-left")}
            />
            <circle
                cx="232" cy="555" r="18"
                id="knee-right"
                style={getRegionStyle("knee-right")}
                onClick={() => onRegionClick?.("knee-right")}
            />

            {/* Calves - Gastrocnemius curve */}
            <path
                d="M150,570 Q140,600 148,650 L160,710 L180,710 L186,570 Z"
                id="calf-left"
                style={getRegionStyle("calf-left")}
                onClick={() => onRegionClick?.("calf-left")}
            />
            <path
                d="M250,570 Q260,600 252,650 L240,710 L220,710 L214,570 Z"
                id="calf-right"
                style={getRegionStyle("calf-right")}
                onClick={() => onRegionClick?.("calf-right")}
            />

            {/* Feet - Natural stance */}
            <path
                d="M160,710 Q150,740 145,760 L185,760 Q182,740 180,710 Z"
                id="foot-left"
                style={getRegionStyle("foot-left")}
                onClick={() => onRegionClick?.("foot-left")}
            />
            <path
                d="M240,710 Q250,740 255,760 L215,760 Q218,740 220,710 Z"
                id="foot-right"
                style={getRegionStyle("foot-right")}
                onClick={() => onRegionClick?.("foot-right")}
            />

        </svg>
    );
}
