"use client";

import { Settings as SettingsIcon, Bell, Lock, Palette, Globe, Database, Keyboard, Activity, Pill, Zap, Utensils, Cloud } from "lucide-react";
import DevDataControls from "@/components/settings/DevDataControls";
import { ThemeToggle } from "@/components/settings/ThemeToggle";
import { CorrelationSettings } from "@/components/settings/CorrelationSettings";
import { MedicationList } from "@/components/manage/MedicationList";
import { SymptomList } from "@/components/manage/SymptomList";
import { TriggerList } from "@/components/manage/TriggerList";
import { FoodList } from "@/components/manage/FoodList";
import { DatabaseManager } from "@/components/settings/DatabaseManager";
import { CloudSyncSection } from "@/components/cloud-sync/CloudSyncSection";
import { useState } from "react";
import Link from "next/link";

export default function SettingsPage() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [manageDataTab, setManageDataTab] = useState<"medications" | "symptoms" | "triggers" | "foods">("medications");

  const settingsSections = [
    {
      title: "Manage Data",
      icon: Database,
      description: "Manage your medications, symptoms, triggers, and foods",
      comingSoon: false,
      content: (
        <div className="space-y-4">
          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 border-b border-border">
            <button
              type="button"
              onClick={() => setManageDataTab("medications")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap border-b-2 ${
                manageDataTab === "medications"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              <Pill className="h-4 w-4" />
              Medications
            </button>
            <button
              type="button"
              onClick={() => setManageDataTab("symptoms")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap border-b-2 ${
                manageDataTab === "symptoms"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              <Activity className="h-4 w-4" />
              Symptoms
            </button>
            <button
              type="button"
              onClick={() => setManageDataTab("triggers")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap border-b-2 ${
                manageDataTab === "triggers"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              <Zap className="h-4 w-4" />
              Triggers
            </button>
            <button
              type="button"
              onClick={() => setManageDataTab("foods")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap border-b-2 ${
                manageDataTab === "foods"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              <Utensils className="h-4 w-4" />
              Foods
            </button>
          </div>

          {/* Tab Content */}
          <div>
            {manageDataTab === "medications" && <MedicationList />}
            {manageDataTab === "symptoms" && <SymptomList />}
            {manageDataTab === "triggers" && <TriggerList />}
            {manageDataTab === "foods" && <FoodList />}
          </div>
        </div>
      ),
    },
    {
      title: "Correlation Analysis",
      icon: Activity,
      description: "Recalculate food-symptom correlations and health insights",
      comingSoon: false,
      content: <CorrelationSettings />,
    },
    {
      title: "Cloud Sync",
      icon: Cloud,
      description: "Back up and restore your data with encrypted cloud storage",
      comingSoon: false,
      content: <CloudSyncSection />,
    },
    {
      title: "Notifications",
      icon: Bell,
      description: "Manage notification preferences",
      comingSoon: true,
    },
    {
      title: "Privacy & Security",
      icon: Lock,
      description: "Data encryption and privacy controls",
      comingSoon: true,
    },
    {
      title: "Appearance",
      icon: Palette,
      description: "Theme and display settings",
      comingSoon: false,
      content: <ThemeToggle />,
    },
    {
      title: "Language & Region",
      icon: Globe,
      description: "Language, timezone, and units",
      comingSoon: true,
    },
  ];

  const accessibilitySections = [
    {
      title: "Keyboard Shortcuts",
      icon: Keyboard,
      description: "View all keyboard shortcuts and accessibility features",
      href: "/help/keyboard-shortcuts",
    },
  ];

  const advancedSections = [
    {
      title: "Database Manager",
      icon: Database,
      description: "View, search, edit, and export IndexedDB data",
      comingSoon: false,
      content: <DatabaseManager />,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="mt-2 text-muted-foreground">
          Customize your app experience
        </p>
      </div>

      <div className="space-y-4">
        {/* Settings Sections */}
        <div className="space-y-3">
          {settingsSections.map((section) => {
            const Icon = section.icon;
            const isExpanded = expandedSection === section.title;
            const hasContent = !section.comingSoon && section.content;

            return (
              <div
                key={section.title}
                className="rounded-lg border border-border bg-card overflow-hidden"
              >
                <button
                  onClick={() =>
                    hasContent
                      ? setExpandedSection(isExpanded ? null : section.title)
                      : undefined
                  }
                  disabled={!hasContent}
                  className={`w-full p-4 text-left ${
                    hasContent ? "cursor-pointer hover:bg-muted/50" : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10 text-primary">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">
                          {section.title}
                        </h3>
                        {section.comingSoon && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-orange-500/10 text-orange-700 rounded">
                            Coming Soon
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {section.description}
                      </p>
                    </div>
                  </div>
                </button>
                {hasContent && isExpanded && (
                  <div className="px-6 pb-6 pt-0 border-t border-border">
                    <div className="pt-4">{section.content}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Accessibility Sections */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">Accessibility</h2>
          <div className="space-y-4">
            {accessibilitySections.map((section) => {
              const Icon = section.icon;

              return (
                <Link
                  key={section.title}
                  href={section.href}
                  className="block rounded-lg border border-border bg-card overflow-hidden hover:bg-muted/50 transition-colors"
                >
                  <div className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-primary/10 text-primary">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1">
                          {section.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {section.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Advanced Sections */}
        {advancedSections.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-3">Advanced</h2>
            <div className="space-y-4">
              {advancedSections.map((section) => {
                const Icon = section.icon;
                const isExpanded = expandedSection === section.title;
                const hasContent = !section.comingSoon && section.content;

                return (
                  <div
                    key={section.title}
                    className="rounded-lg border border-border bg-card overflow-hidden"
                  >
                    <button
                      onClick={() =>
                        hasContent
                          ? setExpandedSection(isExpanded ? null : section.title)
                          : undefined
                      }
                      disabled={!hasContent}
                      className={`w-full p-4 text-left ${
                        hasContent ? "cursor-pointer hover:bg-muted/50" : ""
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-orange-500/10 text-orange-700 dark:text-orange-400">
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground">
                              {section.title}
                            </h3>
                            {section.comingSoon && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-orange-500/10 text-orange-700 rounded">
                                Coming Soon
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {section.description}
                          </p>
                        </div>
                      </div>
                    </button>
                    {hasContent && isExpanded && (
                      <div className="px-6 pb-6 pt-0 border-t border-border">
                        <div className="pt-4">{section.content}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 p-4 rounded-lg bg-muted/50">
        <div className="flex items-start gap-3">
          <SettingsIcon className="w-5 h-5 text-muted-foreground mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p>
              Settings features will be added in Phase 3. For now, all data is
              stored locally on your device with client-side encryption.
            </p>
          </div>
        </div>
      </div>

      <DevDataControls />
    </div>
  );
}
