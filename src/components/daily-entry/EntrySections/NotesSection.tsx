"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DailyEntry, WeatherData } from "@/lib/types/daily-entry";
import { MOOD_OPTIONS } from "@/lib/data/daily-entry-presets";

interface NotesSectionProps {
  notes: string;
  mood?: string;
  weather?: WeatherData;
  location?: string;
  onChange: (changes: Partial<DailyEntry>) => void;
  onAutoSave?: () => void;
}

const formatRelativeTime = (date: Date) => {
  const diffInSeconds = Math.round((Date.now() - date.getTime()) / 1000);
  if (diffInSeconds < 5) return "just now";
  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
  const diffInMinutes = Math.round(diffInSeconds / 60);
  return diffInMinutes === 1 ? "a minute ago" : `${diffInMinutes} minutes ago`;
};

export const NotesSection = ({
  notes,
  mood,
  weather,
  location,
  onChange,
  onAutoSave,
}: NotesSectionProps) => {
  const [notesValue, setNotesValue] = useState(notes);
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setNotesValue(notes);
  }, [notes]);

  useEffect(() => {
    if (!onAutoSave) {
      return;
    }

    const timer = window.setTimeout(() => {
      setLastAutoSave(new Date());
      onAutoSave();
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [notesValue, mood, weather, location, onAutoSave]);

  const applyFormatting = (wrapper: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    const { selectionStart, selectionEnd, value } = textarea;
    const selected = value.slice(selectionStart, selectionEnd) || "text";
    const wrapped = `${wrapper}${selected}${wrapper}`;
    const nextValue = `${value.slice(0, selectionStart)}${wrapped}${value.slice(selectionEnd)}`;

    setNotesValue(nextValue);
    onChange({ notes: nextValue });

    requestAnimationFrame(() => {
      textarea.focus();
      const cursorStart = selectionStart + wrapper.length;
      const cursorEnd = cursorStart + selected.length;
      textarea.setSelectionRange(cursorStart, cursorEnd);
    });
  };

  const insertBullet = () => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    const { selectionStart, selectionEnd, value } = textarea;
    const selected = value.slice(selectionStart, selectionEnd);
    const lines = selected.split("\n").map((line) => (line.startsWith("- ") ? line : `- ${line || "item"}`));
    const nextValue = `${value.slice(0, selectionStart)}${lines.join("\n")}${value.slice(selectionEnd)}`;

    setNotesValue(nextValue);
    onChange({ notes: nextValue });

    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = selectionStart + 2;
      textarea.setSelectionRange(cursor, cursor + lines[0].length - 2);
    });
  };

  const handleWeatherChange = (key: keyof WeatherData, value: number | string | undefined) => {
    const updatedWeather: WeatherData = {
      ...(weather ?? {}),
      [key]: value,
    };

    if (
      updatedWeather.temperatureCelsius === undefined &&
      updatedWeather.humidity === undefined &&
      !updatedWeather.conditions
    ) {
      onChange({ weather: undefined });
    } else {
      onChange({ weather: updatedWeather });
    }
  };

  const moodToneClass = useMemo(() => {
    const option = MOOD_OPTIONS.find((item) => item.id === mood);
    if (!option) return "bg-muted text-muted-foreground";
    if (option.tone === "positive") return "bg-emerald-100 text-emerald-900";
    if (option.tone === "neutral") return "bg-blue-100 text-blue-900";
    return "bg-amber-100 text-amber-900";
  }, [mood]);

  return (
    <section className="space-y-4" aria-label="Notes and additional context">
      <header className="space-y-1">
        <h3 className="text-lg font-semibold text-foreground">Notes & context</h3>
        <p className="text-sm text-muted-foreground">
          Capture wins, stressors, weather, or anything else that helps tell the story of today.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {MOOD_OPTIONS.map((option) => {
          const isActive = option.id === mood;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange({ mood: option.id })}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                isActive
                  ? moodToneClass
                  : "border border-border bg-background text-muted-foreground hover:border-primary/60"
              }`}
            >
              {option.label}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => onChange({ mood: undefined })}
          className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground hover:border-primary/60"
        >
          Clear mood
        </button>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-background/60 p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Formatting</span>
          <button
            type="button"
            onClick={() => applyFormatting("**")}
            className="rounded border border-border px-2 py-1"
          >
            Bold
          </button>
          <button
            type="button"
            onClick={() => applyFormatting("*")}
            className="rounded border border-border px-2 py-1"
          >
            Italic
          </button>
          <button
            type="button"
            onClick={insertBullet}
            className="rounded border border-border px-2 py-1"
          >
            Bullet list
          </button>
          {lastAutoSave && (
            <span className="ml-auto text-[11px] uppercase tracking-wide">
              Auto-saved {formatRelativeTime(lastAutoSave)}
            </span>
          )}
        </div>

        <textarea
          ref={textareaRef}
          value={notesValue}
          onChange={(event) => {
            setNotesValue(event.target.value);
            onChange({ notes: event.target.value });
          }}
          placeholder="Add reflections, coping strategies, or wins from today. Markdown formatting is supported."
          className="min-h-40 rounded-lg border border-border bg-background px-4 py-3 text-sm leading-relaxed"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium text-foreground">Location</span>
          <input
            type="text"
            value={location ?? ""}
            onChange={(event) => onChange({ location: event.target.value })}
            placeholder="Home, work, travel..."
            className="rounded-lg border border-border bg-background px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium text-foreground">Temperature (°C)</span>
          <input
            type="number"
            value={weather?.temperatureCelsius ?? ""}
            onChange={(event) =>
              handleWeatherChange(
                "temperatureCelsius",
                event.target.value ? Number(event.target.value) : undefined,
              )
            }
            className="rounded-lg border border-border bg-background px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium text-foreground">Humidity (%)</span>
          <input
            type="number"
            value={weather?.humidity ?? ""}
            onChange={(event) =>
              handleWeatherChange(
                "humidity",
                event.target.value ? Number(event.target.value) : undefined,
              )
            }
            className="rounded-lg border border-border bg-background px-3 py-2"
          />
        </label>
      </div>

      <label className="flex flex-col gap-2 text-sm md:w-1/2">
        <span className="font-medium text-foreground">Conditions</span>
        <input
          type="text"
          value={weather?.conditions ?? ""}
          onChange={(event) => handleWeatherChange("conditions", event.target.value || undefined)}
          placeholder="Sunny, rainy, windy..."
          className="rounded-lg border border-border bg-background px-3 py-2"
        />
      </label>
    </section>
  );
};
