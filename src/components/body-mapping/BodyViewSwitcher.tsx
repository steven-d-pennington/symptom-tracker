"use client";

import React from "react";
import { User, UserSquare } from "lucide-react";
import { isTyping } from "@/lib/hooks/useKeyboardShortcuts";

interface BodyViewSwitcherProps {
  currentView: "front" | "back" | "left" | "right";
  onViewChange: (view: "front" | "back" | "left" | "right") => void;
}

export function BodyViewSwitcher({
  currentView,
  onViewChange,
}: BodyViewSwitcherProps) {
  const views = [
    { id: "front" as const, label: "Front", icon: User, key: "F" },
    { id: "back" as const, label: "Back", icon: UserSquare, key: "B" },
  ];

  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't handle shortcuts when user is typing in text fields
      if (isTyping()) return;

      // Ignore if modifier keys are pressed
      if (e.ctrlKey || e.metaKey) return;

      switch (e.key.toLowerCase()) {
        case "f":
          onViewChange("front");
          break;
        case "b":
          onViewChange("back");
          break;
        case "l":
          onViewChange("left");
          break;
        case "r":
          onViewChange("right");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [onViewChange]);

  return (
    <div className="flex gap-2">
      {views.map((view) => {
        const Icon = view.icon;
        const isActive = currentView === view.id;

        return (
          <button
            key={view.id}
            onClick={() => onViewChange(view.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
              ${
                isActive
                  ? "btn-primary"
                  : "btn-secondary"
              }
            `}
            aria-label={`Switch to ${view.label} view`}
            aria-pressed={isActive}
          >
            <Icon className="w-4 h-4" />
            <span>{view.label}</span>
            <span className="text-xs opacity-70">({view.key})</span>
          </button>
        );
      })}
    </div>
  );
}
