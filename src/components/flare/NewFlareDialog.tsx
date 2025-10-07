"use client";

import { useState } from "react";
import { flareRepository } from "@/lib/repositories/flareRepository";
import { BodyRegionSelector } from "@/components/body-mapping/BodyRegionSelector";
import { BodyViewSwitcher } from "@/components/body-mapping/BodyViewSwitcher";
import { BodyViewType } from "@/lib/types/body-mapping";
import { X } from "lucide-react";

interface NewFlareDialogProps {
  userId: string;
  onClose: () => void;
  onCreated: () => void;
  initialRegion?: string;
}

export function NewFlareDialog({ userId, onClose, onCreated, initialRegion }: NewFlareDialogProps) {
  const [formData, setFormData] = useState({
    symptomName: "",
    severity: 5,
    bodyRegions: initialRegion ? [initialRegion] : ([] as string[]),
    notes: "",
  });
  const [currentView, setCurrentView] = useState<BodyViewType>("front");

  const handleRegionToggle = (regionId: string) => {
    setFormData((prev) => ({
      ...prev,
      bodyRegions: prev.bodyRegions.includes(regionId)
        ? prev.bodyRegions.filter((r) => r !== regionId)
        : [...prev.bodyRegions, regionId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await flareRepository.create({
        userId,
        symptomId: "custom",
        symptomName: formData.symptomName,
        startDate: new Date(),
        severity: formData.severity,
        bodyRegions: formData.bodyRegions,
        status: "active",
        interventions: [],
        notes: formData.notes,
        photoIds: [],
      });

      onCreated();
    } catch (error) {
      console.error("Failed to create flare:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 overflow-y-auto">
      <div className="min-h-screen flex items-start sm:items-center justify-center p-4">
        <div className="w-full max-w-4xl rounded-lg bg-card p-4 sm:p-6 my-4 sm:my-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Track New Flare</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-muted rounded-lg transition-colors flex-shrink-0"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left column: Form fields */}
              <div className="space-y-4 order-2 md:order-1">
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    Symptom Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.symptomName}
                    onChange={(e) => setFormData({ ...formData, symptomName: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none"
                    placeholder="e.g., Abscess, Lesion, Pain"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    Severity: {formData.severity}/10
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Minimal</span>
                    <span>Extreme</span>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    Affected Body Regions
                  </label>
                  <div className="text-sm text-muted-foreground mb-2">
                    {formData.bodyRegions.length === 0 ? (
                      <span>Click regions on the body map →</span>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {formData.bodyRegions.map((region) => (
                          <span
                            key={region}
                            className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium"
                          >
                            {region.replace(/-/g, " ")}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={4}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none resize-none"
                    placeholder="Additional details about this flare..."
                  />
                </div>
              </div>

              {/* Right column: Body map selector */}
              <div className="space-y-4 order-1 md:order-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Select Affected Regions
                  </label>
                  <BodyViewSwitcher
                    currentView={currentView}
                    onViewChange={setCurrentView}
                  />
                </div>
                <div className="h-[300px] sm:h-[400px] bg-gray-50 rounded-lg border border-border">
                  <BodyRegionSelector
                    view={currentView}
                    selectedRegions={formData.bodyRegions}
                    onRegionSelect={handleRegionToggle}
                    multiSelect={true}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Click multiple regions to mark all affected areas. You can switch between front and back views.
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!formData.symptomName || formData.bodyRegions.length === 0}
                className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Create Flare
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
