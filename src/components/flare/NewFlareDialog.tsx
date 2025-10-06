"use client";

import { useState } from "react";
import { flareRepository } from "@/lib/repositories/flareRepository";

interface NewFlareDialogProps {
  userId: string;
  onClose: () => void;
  onCreated: () => void;
}

export function NewFlareDialog({ userId, onClose, onCreated }: NewFlareDialogProps) {
  const [formData, setFormData] = useState({
    symptomName: "",
    severity: 5,
    bodyRegions: [] as string[],
    notes: "",
  });

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold text-foreground">Track New Flare</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
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
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Create Flare
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
