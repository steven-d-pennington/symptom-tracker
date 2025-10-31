"use client";

import { Keyboard, Navigation, Command, X, ArrowLeft, ArrowRight, ArrowUp, ArrowDown } from "lucide-react";
import Link from "next/link";

interface ShortcutItem {
  keys: string[];
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface ShortcutCategory {
  title: string;
  shortcuts: ShortcutItem[];
}

export default function KeyboardShortcutsPage() {
  const categories: ShortcutCategory[] = [
    {
      title: "Navigation",
      shortcuts: [
        {
          keys: ["Tab"],
          description: "Navigate forward through interactive elements",
          icon: Navigation,
        },
        {
          keys: ["Shift", "Tab"],
          description: "Navigate backward through interactive elements",
          icon: Navigation,
        },
        {
          keys: ["D"],
          description: "Go to Dashboard",
        },
        {
          keys: ["C"],
          description: "Go to Calendar",
        },
        {
          keys: ["L"],
          description: "Go to Log page",
        },
        {
          keys: ["B"],
          description: "Go to Body Map / Active Flares",
        },
        {
          keys: ["F"],
          description: "Go to Food Logging",
        },
        {
          keys: ["M"],
          description: "Go to Medication Logging",
        },
        {
          keys: ["T"],
          description: "Go to Trigger Logging",
        },
        {
          keys: ["Shift", "S"],
          description: "Go to Symptom Logging",
        },
        {
          keys: ["?"],
          description: "Open this Keyboard Shortcuts help page",
        },
      ],
    },
    {
      title: "Actions",
      shortcuts: [
        {
          keys: ["Enter"],
          description: "Activate buttons and links",
        },
        {
          keys: ["Space"],
          description: "Activate buttons (triggers click)",
        },
        {
          keys: ["Escape"],
          description: "Close modals and dialogs",
          icon: X,
        },
      ],
    },
    {
      title: "Body Map View Switching",
      shortcuts: [
        {
          keys: ["F"],
          description: "Switch to Front view",
        },
        {
          keys: ["B"],
          description: "Switch to Back view",
        },
        {
          keys: ["L"],
          description: "Switch to Left view",
        },
        {
          keys: ["R"],
          description: "Switch to Right view",
        },
      ],
    },
    {
      title: "Photo Annotation Tools",
      shortcuts: [
        {
          keys: ["A"],
          description: "Select Arrow tool",
        },
        {
          keys: ["C"],
          description: "Select Circle tool",
        },
        {
          keys: ["R"],
          description: "Select Rectangle tool",
        },
        {
          keys: ["T"],
          description: "Select Text tool",
        },
        {
          keys: ["B"],
          description: "Select Blur tool",
        },
        {
          keys: ["Ctrl/Cmd", "Z"],
          description: "Undo last annotation",
        },
        {
          keys: ["Ctrl/Cmd", "Shift", "Z"],
          description: "Redo annotation",
        },
        {
          keys: ["Ctrl/Cmd", "S"],
          description: "Save annotations",
        },
      ],
    },
    {
      title: "Forms",
      shortcuts: [
        {
          keys: ["Enter"],
          description: "Submit form (when focused on input)",
        },
        {
          keys: ["↑", "↓"],
          description: "Navigate through dropdown menu items",
          icon: ArrowUp,
        },
        {
          keys: ["Home"],
          description: "Jump to first item in list",
        },
        {
          keys: ["End"],
          description: "Jump to last item in list",
        },
      ],
    },
  ];

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-lg bg-primary/10 p-3">
            <Keyboard className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Keyboard Shortcuts
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Navigate the app faster using keyboard shortcuts
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800 p-4">
          <div className="flex items-start gap-3">
            <Command className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                Accessibility Note
              </p>
              <p className="text-blue-800 dark:text-blue-200">
                Keyboard shortcuts are automatically disabled when typing in text fields.
                All interactive elements have visible focus indicators and support screen readers.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Shortcuts by Category */}
      <div className="space-y-8">
        {categories.map((category) => (
          <section key={category.title}>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              {category.title}
            </h2>
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 w-1/3">
                      Shortcut
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {category.shortcuts.map((shortcut, index) => {
                    const Icon = shortcut.icon;
                    return (
                      <tr
                        key={index}
                        className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            {shortcut.keys.map((key, keyIndex) => (
                              <span key={keyIndex} className="inline-flex items-center gap-1">
                                <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-sm">
                                  {key}
                                </kbd>
                                {keyIndex < shortcut.keys.length - 1 && (
                                  <span className="text-gray-400 text-xs">+</span>
                                )}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                            {Icon && <Icon className="h-4 w-4 text-gray-400" />}
                            {shortcut.description}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>

      {/* Additional Info */}
      <div className="mt-8 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Accessibility Features
        </h3>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">•</span>
            <span>
              <strong>Focus Indicators:</strong> All interactive elements have visible focus
              indicators that meet WCAG 2.2 requirements (minimum 2px outline).
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">•</span>
            <span>
              <strong>Screen Reader Support:</strong> All dynamic content changes are announced
              to screen readers using ARIA live regions.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">•</span>
            <span>
              <strong>Skip Links:</strong> Press Tab when the page loads to reveal a "Skip to
              main content" link that bypasses navigation.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">•</span>
            <span>
              <strong>Tab Order:</strong> Tab navigation follows a logical order from top to
              bottom, left to right, matching the visual layout.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-bold">•</span>
            <span>
              <strong>Context-Aware Shortcuts:</strong> Keyboard shortcuts are automatically
              disabled when you're typing in text fields to prevent conflicts.
            </span>
          </li>
        </ul>
      </div>

      {/* Footer */}
      <div className="mt-8 flex justify-center">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
