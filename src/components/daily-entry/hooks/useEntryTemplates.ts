"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DailyEntryTemplate, EntrySection } from "@/lib/types/daily-entry";

const STORAGE_KEY = "pst-entry-templates";
const ACTIVE_TEMPLATE_KEY = "pst-active-template";

const DEFAULT_SECTIONS: EntrySection[] = [
  { type: "health", required: true, order: 0, config: {} },
  { type: "symptoms", required: true, order: 1, config: {} },
  { type: "medications", required: false, order: 2, config: {} },
  { type: "triggers", required: false, order: 3, config: {} },
  { type: "notes", required: false, order: 4, config: {} },
];

const createTemplate = (name: string, sections: EntrySection[], isDefault = false): DailyEntryTemplate => ({
  id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`,
  userId: "demo",
  name,
  sections,
  isDefault,
  createdAt: new Date(),
});

const deserializeTemplate = (template: DailyEntryTemplate): DailyEntryTemplate => ({
  ...template,
  createdAt: new Date(template.createdAt),
  sections: template.sections.map((section, index) => ({
    ...section,
    order: section.order ?? index,
    config: section.config ?? {},
  })),
});

const loadTemplates = () => {
  if (typeof window === "undefined") {
    return [createTemplate("Daily health check", DEFAULT_SECTIONS, true)];
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [createTemplate("Daily health check", DEFAULT_SECTIONS, true)];
    }

    const parsed: DailyEntryTemplate[] = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      return [createTemplate("Daily health check", DEFAULT_SECTIONS, true)];
    }

    return parsed.map(deserializeTemplate);
  } catch (error) {
    console.warn("Unable to read entry templates", error);
    return [createTemplate("Daily health check", DEFAULT_SECTIONS, true)];
  }
};

const persistTemplates = (templates: DailyEntryTemplate[]) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      templates.map((template) => ({
        ...template,
        createdAt: template.createdAt.toISOString(),
      })),
    ),
  );
};

const loadActiveTemplateId = (templates: DailyEntryTemplate[]) => {
  if (typeof window === "undefined") {
    return templates.find((template) => template.isDefault)?.id ?? templates[0].id;
  }

  const stored = window.localStorage.getItem(ACTIVE_TEMPLATE_KEY);
  if (stored && templates.some((template) => template.id === stored)) {
    return stored;
  }

  return templates.find((template) => template.isDefault)?.id ?? templates[0].id;
};

export type TemplateSectionType = EntrySection["type"];

export interface TemplateDraft {
  name: string;
  sectionTypes: TemplateSectionType[];
  required?: TemplateSectionType[];
}

export const useEntryTemplates = () => {
  const [templates, setTemplates] = useState<DailyEntryTemplate[]>(loadTemplates);
  const [activeTemplateId, setActiveTemplateId] = useState<string>(() =>
    loadActiveTemplateId(templates),
  );

  useEffect(() => {
    persistTemplates(templates);
  }, [templates]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(ACTIVE_TEMPLATE_KEY, activeTemplateId);
  }, [activeTemplateId]);

  const activeTemplate = useMemo(() => {
    return (
      templates.find((template) => template.id === activeTemplateId) ??
      templates[0]
    );
  }, [templates, activeTemplateId]);

  const ensureOrder = useCallback((sectionTypes: TemplateSectionType[]) =>
    sectionTypes.map((type, index) => ({
      type,
      required: type === "health" || type === "symptoms",
      order: index,
      config: {},
    })), []);

  const createTemplateFromDraft = useCallback(
    (draft: TemplateDraft) => {
      if (!draft.name.trim()) {
        throw new Error("Template name is required");
      }

      const sections = ensureOrder(draft.sectionTypes);
      const next = createTemplate(draft.name.trim(), sections, false);
      setTemplates((prev) => [...prev, next]);
      setActiveTemplateId(next.id);
    },
    [ensureOrder],
  );

  const updateTemplate = useCallback(
    (templateId: string, draft: Partial<TemplateDraft>) => {
      setTemplates((prev) =>
        prev.map((template) => {
          if (template.id !== templateId) {
            return template;
          }

          return {
            ...template,
            name: draft.name?.trim() ? draft.name.trim() : template.name,
            sections: draft.sectionTypes
              ? ensureOrder(draft.sectionTypes)
              : template.sections,
          };
        }),
      );
    },
    [ensureOrder],
  );

  const deleteTemplate = useCallback((templateId: string) => {
    setTemplates((prev) => {
      if (prev.length === 1) {
        return prev;
      }

      const filtered = prev.filter((template) => template.id !== templateId);
      if (!filtered.some((template) => template.isDefault)) {
        filtered[0] = { ...filtered[0], isDefault: true };
      }

      if (!filtered.some((template) => template.id === activeTemplateId)) {
        setActiveTemplateId(filtered[0].id);
      }

      return filtered;
    });
  }, [activeTemplateId]);

  const setDefaultTemplate = useCallback((templateId: string) => {
    setTemplates((prev) =>
      prev.map((template) => ({
        ...template,
        isDefault: template.id === templateId,
      })),
    );
    setActiveTemplateId(templateId);
  }, []);

  const activateTemplate = useCallback((templateId: string) => {
    setActiveTemplateId(templateId);
  }, []);

  return {
    templates,
    activeTemplate,
    activeTemplateId,
    createTemplate: createTemplateFromDraft,
    updateTemplate,
    deleteTemplate,
    setDefaultTemplate,
    setActiveTemplateId: activateTemplate,
  };
};
