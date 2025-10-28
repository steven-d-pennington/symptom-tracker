"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const themes = [
    {
      value: "light" as const,
      label: "Light",
      icon: Sun,
      description: "Light mode",
    },
    {
      value: "dark" as const,
      label: "Dark",
      icon: Moon,
      description: "Dark mode",
    },
    {
      value: "system" as const,
      label: "System",
      icon: Monitor,
      description: "Follow system",
    },
  ];

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Choose your theme preference</p>
      <div className="grid grid-cols-3 gap-3">
        {themes.map(({ value, label, icon: Icon, description }) => (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={`
              relative flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all
              ${
                theme === value
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-primary/50 hover:bg-primary/5"
              }
            `}
          >
            <Icon
              className={`w-6 h-6 ${
                theme === value ? "text-primary" : "text-muted-foreground"
              }`}
            />
            <div className="text-center">
              <div
                className={`text-sm font-medium ${
                  theme === value ? "text-primary" : "text-foreground"
                }`}
              >
                {label}
              </div>
              <div className="text-xs text-muted-foreground">{description}</div>
            </div>
            {theme === value && (
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
