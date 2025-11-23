"use client";

import { useMemo, useState } from "react";
import { DailyEntryTemplate } from "@/lib/types/daily-entry";
import { TemplateDraft, TemplateSectionType } from "./hooks/useEntryTemplates";

interface EntryTemplatesProps {
  templates: DailyEntryTemplate[];
  activeTemplateId: string;
  onActivate: (templateId: string) => void;
  onCreate: (draft: TemplateDraft) => void;
  onUpdate: (templateId: string, draft: Partial<TemplateDraft>) => void;
  onDelete: (templateId: string) => void;
  onSetDefault: (templateId: string) => void;
}

const SECTION_OPTIONS: Array<{ type: TemplateSectionType; label: string }> = [
  { type: "health", label: "Health metrics" },
  { type: "symptoms", label: "Symptoms" },
  { type: "medications", label: "Medications" },
  { type: "treatments", label: "Treatments" },
  { type: "triggers", label: "Triggers" },
  { type: "notes", label: "Notes & context" },
];

const ensureRequiredSections = (sections: TemplateSectionType[]) => {
  const merged = new Set<TemplateSectionType>(sections);
  merged.add("health");
  merged.add("symptoms");
  return Array.from(merged);
};

const renderSectionsList = (
  sections: TemplateSectionType[],
  onChange: (next: TemplateSectionType[]) => void,
) => (
  <div className="flex flex-wrap gap-2">
    {SECTION_OPTIONS.map((option) => {
      const isChecked = sections.includes(option.type);
      return (
        <label
          key={option.type}
          className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${isChecked
            ? "border-primary bg-primary/10 text-primary"
            : "border-border text-muted-foreground hover:border-primary/60"
            }`}
        >
          <input
            type="checkbox"
            checked={isChecked}
            onChange={() => {
              const next = isChecked
                ? sections.filter((section) => section !== option.type)
                : [...sections, option.type];
              onChange(next);
            }}
            className="hidden"
          />
          {option.label}
        </label>
      );
    })}
  </div>
);

export const EntryTemplates = ({
  templates,
  activeTemplateId,
  onActivate,
  onCreate,
  onUpdate,
  onDelete,
  onSetDefault,
}: EntryTemplatesProps) => {
  const [name, setName] = useState("Weekend check-in");
  const [selectedSections, setSelectedSections] = useState<TemplateSectionType[]>([
    "health",
    "symptoms",
    "notes",
  ]);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [editSections, setEditSections] = useState<TemplateSectionType[]>([]);
  const [error, setError] = useState<string | null>(null);

  const activeTemplate = useMemo(
    () => templates.find((template) => template.id === activeTemplateId),
    [templates, activeTemplateId],
  );

  const handleCreateTemplate = () => {
    if (!name.trim()) {
      setError("Template name is required");
      return;
    }

    setError(null);
    onCreate({ name: name.trim(), sectionTypes: ensureRequiredSections(selectedSections) });
    setName("Custom template");
    setSelectedSections(["health", "symptoms"]);
  };

  const beginEditing = (template: DailyEntryTemplate) => {
    setEditingTemplate(template.id);
    setEditSections(template.sections.map((section) => section.type));
  };

  const commitEdit = () => {
    if (!editingTemplate) {
      return;
    }

    onUpdate(editingTemplate, {
      name:
        templates.find((template) => template.id === editingTemplate)?.name ??
        "Template",
      sectionTypes: ensureRequiredSections(editSections),
    });
    setEditingTemplate(null);
    setEditSections([]);
  };

  return (
    <section className="space-y-6" aria-label="Entry templates">
      <header className="space-y-1">
        <h3 className="text-lg font-semibold text-foreground">Templates</h3>
        <p className="text-sm text-muted-foreground">
          Customize what you track each day. Required sections are automatically included.
        </p>
      </header>

      <div className="space-y-3 rounded-2xl border border-border bg-background/60 p-4 shadow-sm">
        <h4 className="text-sm font-semibold text-foreground">Create template</h4>
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-foreground">Name</span>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2"
              placeholder="Name your template"
            />
          </label>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Sections
            </p>
            {renderSectionsList(selectedSections, setSelectedSections)}
            <p className="text-xs text-muted-foreground">
              Health metrics and symptoms are always included to maintain data quality.
            </p>
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <button
            type="button"
            onClick={handleCreateTemplate}
            className="self-start rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            Save template
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Your templates
        </h4>
        <ul className="space-y-3">
          {templates.map((template) => {
            const isEditing = editingTemplate === template.id;
            return (
              <li
                key={template.id}
                className={`space-y-3 rounded-2xl border p-4 shadow-sm transition-colors ${template.id === activeTemplateId
                  ? "border-primary bg-primary/5"
                  : "border-border bg-background/60"
                  }`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{template.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Created {template.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                  {template.isDefault && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary">
                      Default
                    </span>
                  )}
                  {template.id === activeTemplate?.id && (
                    <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-sky-900 dark:bg-sky-900/30 dark:text-sky-100">
                      Active
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-xs text-muted-foreground">
                  <p className="font-medium text-foreground">Sections</p>
                  <div className="flex flex-wrap gap-2">
                    {template.sections.map((section) => (
                      <span
                        key={section.type}
                        className="rounded-full border border-border px-3 py-1 text-[11px] font-medium text-muted-foreground"
                      >
                        {SECTION_OPTIONS.find((option) => option.type === section.type)?.label ?? section.type}
                      </span>
                    ))}
                  </div>
                </div>

                {isEditing && (
                  <div className="space-y-3 rounded-lg border border-dashed border-border bg-muted/20 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Customize sections
                    </p>
                    {renderSectionsList(editSections, setEditSections)}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={commitEdit}
                        className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
                      >
                        Save changes
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingTemplate(null);
                          setEditSections([]);
                        }}
                        className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <button
                    type="button"
                    onClick={() => onActivate(template.id)}
                    className="rounded-md border border-border px-3 py-1 font-semibold text-foreground transition-colors hover:border-primary"
                  >
                    Use template
                  </button>
                  <button
                    type="button"
                    onClick={() => beginEditing(template)}
                    className="rounded-md border border-border px-3 py-1 font-semibold text-foreground transition-colors hover:border-primary"
                  >
                    Edit
                  </button>
                  {!template.isDefault && (
                    <button
                      type="button"
                      onClick={() => onSetDefault(template.id)}
                      className="rounded-md border border-border px-3 py-1 font-semibold text-foreground transition-colors hover:border-primary"
                    >
                      Make default
                    </button>
                  )}
                  {!template.isDefault && (
                    <button
                      type="button"
                      onClick={() => onDelete(template.id)}
                      className="rounded-md border border-destructive px-3 py-1 font-semibold text-destructive transition-colors hover:bg-destructive/10"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};
