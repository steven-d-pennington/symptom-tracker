"use client";

import { useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { DailyEntryForm } from "@/components/daily-entry/DailyEntryForm";
import { EntryHistory } from "@/components/daily-entry/EntryHistory";
import { EntryTemplates } from "@/components/daily-entry/EntryTemplates";
import { useDailyEntry } from "@/components/daily-entry/hooks/useDailyEntry";
import { useEntryTemplates } from "@/components/daily-entry/hooks/useEntryTemplates";
import { useSmartSuggestions } from "@/components/daily-entry/hooks/useSmartSuggestions";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";

const DailyLogPage = () => {
  const searchParams = useSearchParams();
  const entryId = searchParams.get("id");
  const { isLoading: userLoading } = useCurrentUser();
  const dailyEntry = useDailyEntry();
  const templateState = useEntryTemplates();

  const activeTemplate = useMemo(() => templateState.activeTemplate, [templateState.activeTemplate]);
  const { suggestions } = useSmartSuggestions(dailyEntry.entry, dailyEntry.history);

  // Load specific entry if ID is provided
  useEffect(() => {
    if (entryId && dailyEntry.history.length > 0) {
      const targetEntry = dailyEntry.history.find(e => e.id === entryId);
      if (targetEntry) {
        dailyEntry.loadEntry(targetEntry);
      }
    }
  }, [entryId, dailyEntry.history, dailyEntry.loadEntry]);

  // Convert medications to the format needed by MedicationSection
  const medicationSchedule = useMemo(() =>
    dailyEntry.medications.map(med => ({
      id: med.id,
      name: med.name,
      dosage: med.dosage || '',
      schedule: med.frequency,
    })),
    [dailyEntry.medications]
  );

  // Show loading state while user data is being loaded
  if (userLoading || !activeTemplate) {
    return (
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
            <p className="text-sm text-muted-foreground">Loading your daily log...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 lg:flex-row">
      <section className="flex-1 space-y-8">
        <DailyEntryForm
          entry={dailyEntry.entry}
          template={activeTemplate}
          updateEntry={dailyEntry.updateEntry}
          upsertSymptom={dailyEntry.upsertSymptom}
          removeSymptom={dailyEntry.removeSymptom}
          updateMedication={dailyEntry.updateMedication}
          toggleMedicationTaken={dailyEntry.toggleMedicationTaken}
          upsertTrigger={dailyEntry.upsertTrigger}
          removeTrigger={dailyEntry.removeTrigger}
          saveEntry={dailyEntry.saveEntry}
          isSaving={dailyEntry.isSaving}
          completion={dailyEntry.completion}
          lastSavedAt={dailyEntry.lastSavedAt}
          suggestions={suggestions}
          queueLength={dailyEntry.queue.length}
          onSyncQueue={dailyEntry.syncQueuedEntries}
          recentSymptomIds={dailyEntry.recentSymptoms}
          medicationSchedule={medicationSchedule}
        />
      </section>
      <aside className="w-full max-w-sm space-y-6">
        <EntryTemplates
          templates={templateState.templates}
          activeTemplateId={templateState.activeTemplateId}
          onActivate={templateState.setActiveTemplateId}
          onCreate={templateState.createTemplate}
          onUpdate={templateState.updateTemplate}
          onDelete={templateState.deleteTemplate}
          onSetDefault={templateState.setDefaultTemplate}
        />
        <EntryHistory entries={dailyEntry.history} onSelectEntry={dailyEntry.loadEntry} />
      </aside>
    </main>
  );
};

export default DailyLogPage;
