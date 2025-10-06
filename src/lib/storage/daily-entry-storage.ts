import { DailyEntry } from "@/lib/types/daily-entry";

export interface SerializedDailyEntry
  extends Omit<DailyEntry, "completedAt"> {
  completedAt: string;
}

export const HISTORY_STORAGE_KEY = "pst-entry-history";
export const OFFLINE_QUEUE_STORAGE_KEY = "pst-offline-entry-queue";

export const serializeDailyEntry = (entry: DailyEntry): SerializedDailyEntry => ({
  ...entry,
  completedAt: entry.completedAt.toISOString(),
});

export const deserializeDailyEntry = (
  entry: SerializedDailyEntry,
): DailyEntry => ({
  ...entry,
  completedAt: new Date(entry.completedAt),
});

export const loadDailyEntries = (storageKey: string): DailyEntry[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return (parsed as SerializedDailyEntry[]).map(deserializeDailyEntry);
  } catch (error) {
    console.warn(`Unable to read ${storageKey} from storage`, error);
    return [];
  }
};

export const persistDailyEntries = (
  storageKey: string,
  entries: DailyEntry[],
) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const serialized = entries.map(serializeDailyEntry);
    window.localStorage.setItem(storageKey, JSON.stringify(serialized));
  } catch (error) {
    console.error(`Unable to persist ${storageKey}`, error);
  }
};

export const HISTORY_UPDATED_EVENT = "pst-entry-history-updated";
