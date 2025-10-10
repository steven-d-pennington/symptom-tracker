"use client";

import { AnnotationTool } from '@/lib/types/annotation';
import { ArrowUpRight, Circle, Square, Type } from 'lucide-react';

interface AnnotationToolbarProps {
  selectedTool: AnnotationTool;
  onToolSelect: (tool: AnnotationTool) => void;
}

export function AnnotationToolbar({ selectedTool, onToolSelect }: AnnotationToolbarProps) {
  const tools = [
    { type: 'arrow' as AnnotationTool, icon: ArrowUpRight, label: 'Arrow' },
    { type: 'circle' as AnnotationTool, icon: Circle, label: 'Circle' },
    { type: 'rectangle' as AnnotationTool, icon: Square, label: 'Rectangle' },
    { type: 'text' as AnnotationTool, icon: Type, label: 'Text' },
  ];

  return (
    <div className="flex gap-2 rounded-lg bg-white/10 p-2 backdrop-blur-sm">
      {tools.map((tool) => {
        const Icon = tool.icon;
        const isActive = selectedTool === tool.type;
        
        return (
          <button
            key={tool.type}
            onClick={() => onToolSelect(tool.type)}
            className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md p-2 transition-colors ${
              isActive
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
            title={tool.label}
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
