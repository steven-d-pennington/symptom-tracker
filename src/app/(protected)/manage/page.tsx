"use client";

import { useState } from "react";
import { Pill, Activity, Zap, Utensils } from "lucide-react";
import { MedicationList } from "@/components/manage/MedicationList";
import { SymptomList } from "@/components/manage/SymptomList";
import { TriggerList } from "@/components/manage/TriggerList";
import { FavoritesList } from "@/components/manage/FavoritesList";

type Tab = "medications" | "symptoms" | "triggers" | "foods";

export default function ManagePage() {
  const [activeTab, setActiveTab] = useState<Tab>("medications");

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Manage Data</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Customize your tracking experience with medications, symptoms, and triggers
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-border">
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("medications")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "medications"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            <Pill className="h-4 w-4" />
            Medications
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("symptoms")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "symptoms"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            <Activity className="h-4 w-4" />
            Symptoms
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("triggers")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "triggers"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            <Zap className="h-4 w-4" />
            Triggers
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("foods")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "foods"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            <Utensils className="h-4 w-4" />
            Foods
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "medications" && <MedicationList />}
        {activeTab === "symptoms" && <SymptomList />}
        {activeTab === "triggers" && <TriggerList />}
        {activeTab === "foods" && <FavoritesList />}
      </div>
    </div>
  );
}
