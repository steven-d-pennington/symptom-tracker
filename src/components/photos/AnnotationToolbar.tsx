"use client";

import { AnnotationTool } from '@/lib/types/annotation';
import { ArrowUpRight, Circle, Square, Type, Ban } from 'lucide-react';

interface AnnotationToolbarProps {
  selectedTool: AnnotationTool;
  onToolSelect: (tool: AnnotationTool) => void;
  disabled?: boolean;
}

export function AnnotationToolbar({ selectedTool, onToolSelect, disabled = false }: AnnotationToolbarProps) {
  const tools = [
    { type: 'arrow' as AnnotationTool, icon: ArrowUpRight, label: 'Arrow' },
    { type: 'circle' as AnnotationTool, icon: Circle, label: 'Circle' },
    { type: 'rectangle' as AnnotationTool, icon: Square, label: 'Rectangle' },
    { type: 'text' as AnnotationTool, icon: Type, label: 'Text' },
    { type: 'blur' as AnnotationTool, icon: Ban, label: 'Blur (Permanent)', isWarning: true },
  ];

  return (
    <div className="flex gap-2 rounded-lg bg-white/10 p-2 backdrop-blur-sm">
      {tools.map((tool) => {
        const Icon = tool.icon;
        const isActive = selectedTool === tool.type;
        const isWarning = 'isWarning' in tool && tool.isWarning;
        
        return (
          <button
            key={tool.type}
            onClick={() => onToolSelect(tool.type)}
            disabled={disabled}
            className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md p-2 transition-colors ${
              isActive
                ? isWarning 
                  ? 'bg-yellow-500 text-white shadow-lg'
                  : 'bg-blue-500 text-white shadow-lg'
                : isWarning
                  ? 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30'
                  : 'bg-white/20 text-white hover:bg-white/30'
            } ${disabled ? 'opacity-40 cursor-not-allowed hover:bg-white/20' : ''}`}
            title={disabled ? 'Maximum annotations reached' : tool.label}
            aria-label={tool.label}
            aria-pressed={isActive}
          >
            <Icon className="h-6 w-6" />
          </button>
        );
      })}
    </div>
  );
}
