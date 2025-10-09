"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DailyEntryTemplate, EntrySection } from "@/lib/types/daily-entry";
import { userRepository } from "@/lib/repositories/userRepository";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";

const DEFAULT_SECTIONS: EntrySection[] = [
  { type: "health", required: true, order: 0, config: {} },
  { type: "symptoms", required: true, order: 1, config: {} },
  { type: "medications", required: false, order: 2, config: {} },
  { type: "triggers", required: false, order: 3, config: {} },
  { type: "notes", required: false, order: 4, config: {} },
];

const DEFAULT_TEMPLATE_NAME = "Daily health check";

const createTemplate = (userId: string, name: string, sections: EntrySection[], isDefault = false): DailyEntryTemplate => ({
  id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`,
  userId,
  name,
  sections,
  isDefault,
  createdAt: new Date(),
});

const createDefaultTemplate = (userId: string) => createTemplate(userId, DEFAULT_TEMPLATE_NAME, DEFAULT_SECTIONS, true);

const ensureDefaultTemplate = (userId: string, templates: DailyEntryTemplate[]) => {
  return templates.length > 0 ? templates : [createDefaultTemplate(userId)];
};

export type TemplateSectionType = EntrySection["type"];

export interface TemplateDraft {
  name: string;
  sectionTypes: TemplateSectionType[];
  required?: TemplateSectionType[];
}

export const useEntryTemplates = () => {
  const { userId } = useCurrentUser();
  const [templates, setTemplates] = useState<DailyEntryTemplate[]>([]);
  const [activeTemplateId, setActiveTemplateId] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from IndexedDB on mount
  useEffect(() => {
    if (!userId) return;

    const loadData = async () => {
      try {
        const storedTemplates = await userRepository.getEntryTemplates(userId);

        if (storedTemplates.length > 0) {
          const parsed = storedTemplates.map(record => ({
            id: record.id,
            userId: record.userId,
            name: record.name,
            sections: JSON.parse(record.sections),
            isDefault: record.isDefault,
            createdAt: new Date(record.createdAt),
          }));
          setTemplates(ensureDefaultTemplate(userId, parsed));
        } else {
          setTemplates([createDefaultTemplate(userId)]);
        }

        const storedActiveId = await userRepository.getActiveTemplateId(userId);
        if (storedActiveId) {
          setActiveTemplateId(storedActiveId);
        } else {
          setActiveTemplateId(templates[0]?.id || "");
        }

        setIsLoaded(true);
      } catch (error) {
        console.error("Failed to load templates", error);
        setTemplates([createDefaultTemplate(userId)]);
        setIsLoaded(true);
      }
    };

    loadData();
  }, [userId]);

  // Save templates to IndexedDB
  useEffect(() => {
    if (!isLoaded || !userId) return;

    const saveData = async () => {
      try {
        const records = templates.map(template => ({
          id: template.id,
          userId: template.userId,
          name: template.name,
          sections: JSON.stringify(template.sections),
          isDefault: template.isDefault,
          createdAt: template.createdAt,
        }));
        await userRepository.saveEntryTemplates(userId, records);
      } catch (error) {
        console.error("Failed to save templates", error);
      }
    };

    saveData();
  }, [templates, isLoaded, userId]);

  // Save active template ID
  useEffect(() => {
    if (!isLoaded || !activeTemplateId || !userId) return;

    const saveActiveId = async () => {
      try {
        await userRepository.setActiveTemplateId(userId, activeTemplateId);
      } catch (error) {
        console.error("Failed to save active template ID", error);
      }
    };

    saveActiveId();
  }, [activeTemplateId, isLoaded, userId]);

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
      if (!userId) return;
      if (!draft.name.trim()) {
        throw new Error("Template name is required");
      }

      const sections = ensureOrder(draft.sectionTypes);
      const next = createTemplate(userId, draft.name.trim(), sections, false);
      setTemplates((prev) => [...prev, next]);
      setActiveTemplateId(next.id);
    },
    [ensureOrder, userId],
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
