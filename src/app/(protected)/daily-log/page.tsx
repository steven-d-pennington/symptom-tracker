'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { format, subDays, addDays, isToday, isFuture } from 'date-fns';
import { EmoticonMoodSelector } from '@/components/daily-log/EmoticonMoodSelector';
import { SleepQualityInput } from '@/components/daily-log/SleepQualityInput';
import { FlareQuickUpdateList } from '@/components/daily-log/FlareQuickUpdateList';
import { EventSummaryCard } from '@/components/daily-log/EventSummaryCard';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { dailyLogsRepository } from '@/lib/repositories/dailyLogsRepository';
import { DailyLog, FlareQuickUpdate } from '@/types/daily-log';
import { cn } from '@/lib/utils/cn';

// Toast notification (simple implementation - could be replaced with a toast library)
function showToast(message: string, duration = 3000) {
  // For now, use alert - would be replaced with proper toast library
  console.log('Toast:', message);
  // In production, use a proper toast library like react-hot-toast or sonner
}

/**
 * Daily Log Page (Story 6.2)
 * Unified end-of-day reflection for mood, sleep, and notes.
 */
export default function DailyLogPage() {
  // Get current user GUID from localStorage (set during onboarding)
  const { userId } = useCurrentUser();

  // Date navigation state
  const [currentDate, setCurrentDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [isLoadingLog, setIsLoadingLog] = useState(true);

  // Form state
  const [mood, setMood] = useState<1 | 2 | 3 | 4 | 5 | undefined>(undefined);
  const [sleepHours, setSleepHours] = useState<number>(7);
  const [sleepQuality, setSleepQuality] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [notes, setNotes] = useState<string>('');
  const [flareUpdates, setFlareUpdates] = useState<FlareQuickUpdate[]>([]);

  // Smart defaults state
  const [defaultMood, setDefaultMood] = useState<1 | 2 | 3 | 4 | 5 | undefined>(undefined);
  const [defaultSleepHours, setDefaultSleepHours] = useState<number | undefined>(undefined);
  const [defaultSleepQuality, setDefaultSleepQuality] = useState<1 | 2 | 3 | 4 | 5 | undefined>(undefined);

  // Auto-save draft state
  const [draftSaved, setDraftSaved] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Validation state
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Load daily log for current date
  useEffect(() => {
    async function loadDailyLog() {
      setIsLoadingLog(true);
      try {
        // Try to load existing log for this date
        const existingLog = await dailyLogsRepository.getByDate(userId, currentDate);

        if (existingLog) {
          // Load existing log data
          setMood(existingLog.mood);
          setSleepHours(existingLog.sleepHours);
          setSleepQuality(existingLog.sleepQuality);
          setNotes(existingLog.notes || '');
          setFlareUpdates(existingLog.flareUpdates || []);

          // No smart defaults when loading existing log
          setDefaultMood(undefined);
          setDefaultSleepHours(undefined);
          setDefaultSleepQuality(undefined);
        } else {
          // Load smart defaults from previous day
          const previousLog = await dailyLogsRepository.getPreviousDayLog(userId, currentDate);

          if (previousLog) {
            setMood(previousLog.mood);
            setSleepHours(previousLog.sleepHours);
            setSleepQuality(previousLog.sleepQuality);

            // Store as defaults for UI indication
            setDefaultMood(previousLog.mood);
            setDefaultSleepHours(previousLog.sleepHours);
            setDefaultSleepQuality(previousLog.sleepQuality);
          } else {
            // No previous log - use default values
            setMood(3); // Default to "Okay"
            setSleepHours(7);
            setSleepQuality(3);
            setDefaultMood(undefined);
            setDefaultSleepHours(undefined);
            setDefaultSleepQuality(undefined);
          }

          // Always clear notes when loading new date
          setNotes('');
          setFlareUpdates([]);
        }

        // Try to load draft from localStorage
        const draftKey = `dailyLog_draft_${currentDate}`;
        const draft = localStorage.getItem(draftKey);
        if (draft && !existingLog) {
          try {
            const draftData = JSON.parse(draft);
            if (draftData.notes) setNotes(draftData.notes);
            setDraftSaved(true);
          } catch (e) {
            console.error('Failed to parse draft:', e);
          }
        }
      } catch (error) {
        console.error('Failed to load daily log:', error);
      } finally {
        setIsLoadingLog(false);
      }
    }

    loadDailyLog();
  }, [currentDate, userId]);

  // Auto-save draft to localStorage (debounced)
  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      const draftKey = `dailyLog_draft_${currentDate}`;
      const draft = { notes };
      localStorage.setItem(draftKey, JSON.stringify(draft));
      setDraftSaved(true);
    }, 5000); // 5 second debounce

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [notes, currentDate]);

  // Date navigation
  const goToPreviousDay = useCallback(() => {
    const prevDate = format(subDays(new Date(currentDate), 1), 'yyyy-MM-dd');
    setCurrentDate(prevDate);
  }, [currentDate]);

  const goToToday = useCallback(() => {
    setCurrentDate(format(new Date(), 'yyyy-MM-dd'));
  }, []);

  const goToNextDay = useCallback(() => {
    const nextDate = format(addDays(new Date(currentDate), 1), 'yyyy-MM-dd');
    setCurrentDate(nextDate);
  }, [currentDate]);

  // Handle flare update callback
  const handleFlareUpdate = useCallback((update: FlareQuickUpdate) => {
    setFlareUpdates(prev => {
      // Check if update for this flare already exists
      const existingIndex = prev.findIndex(u => u.flareId === update.flareId);
      if (existingIndex >= 0) {
        // Update existing
        const updated = [...prev];
        updated[existingIndex] = update;
        return updated;
      } else {
        // Add new
        return [...prev, update];
      }
    });
  }, []);

  // Validate form
  const validate = useCallback((): boolean => {
    const errors: string[] = [];

    if (mood === undefined || mood === null) {
      errors.push('Mood is required');
    }

    if (sleepHours === undefined || sleepHours === null) {
      errors.push('Sleep hours is required');
    } else if (sleepHours < 0 || sleepHours > 24) {
      errors.push('Sleep hours must be between 0 and 24');
    }

    if (sleepQuality === undefined || sleepQuality === null) {
      errors.push('Sleep quality is required');
    }

    if (notes.length > 2000) {
      errors.push('Notes must be at most 2000 characters');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  }, [mood, sleepHours, sleepQuality, notes]);

  // Save daily log
  const handleSave = useCallback(async () => {
    if (!validate()) {
      return;
    }

    setIsSaving(true);
    try {
      const dailyLog: Partial<DailyLog> = {
        userId,
        date: currentDate,
        mood: mood!,
        sleepHours,
        sleepQuality,
        notes: notes.trim() || undefined,
        flareUpdates: flareUpdates.length > 0 ? flareUpdates : undefined,
      };

      await dailyLogsRepository.upsert(dailyLog);

      // Clear draft from localStorage
      const draftKey = `dailyLog_draft_${currentDate}`;
      localStorage.removeItem(draftKey);
      setDraftSaved(false);

      showToast('Daily log saved successfully!');
    } catch (error) {
      console.error('Failed to save daily log:', error);
      alert('Failed to save daily log. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [validate, userId, currentDate, mood, sleepHours, sleepQuality, notes, flareUpdates]);

  // Format date for display
  const displayDate = format(new Date(currentDate), 'EEEE, MMMM d yyyy');
  const isCurrentDateToday = isToday(new Date(currentDate));
  const isCurrentDateFuture = isFuture(new Date(currentDate));
  const canGoNext = !isCurrentDateToday && !isCurrentDateFuture;

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      {/* Page Header with Date Navigation */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Daily Log</h1>
        </div>

        {/* Date Navigation */}
        <div className="flex items-center justify-between bg-accent/30 rounded-lg p-4 border border-border">
          <button
            onClick={goToPreviousDay}
            disabled={isLoadingLog}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-colors",
              "hover:bg-accent",
              isLoadingLog && "opacity-50 cursor-not-allowed"
            )}
          >
            ← Prev
          </button>

          <div className="text-center">
            <p className="text-lg font-semibold">{displayDate}</p>
            {isCurrentDateToday && (
              <p className="text-xs text-primary">Today</p>
            )}
          </div>

          <div className="flex gap-2">
            {!isCurrentDateToday && (
              <button
                onClick={goToToday}
                disabled={isLoadingLog}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  "bg-primary text-primary-foreground hover:bg-primary/90",
                  isLoadingLog && "opacity-50 cursor-not-allowed"
                )}
              >
                Today
              </button>
            )}
            <button
              onClick={goToNextDay}
              disabled={!canGoNext || isLoadingLog}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                "hover:bg-accent",
                (!canGoNext || isLoadingLog) && "opacity-50 cursor-not-allowed"
              )}
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      {isLoadingLog ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading daily log...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="font-semibold text-red-800 dark:text-red-200 mb-2">
                Please fix the following errors:
              </p>
              <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-300">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Mood Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              How was your mood today? *
              {defaultMood !== undefined && mood === defaultMood && (
                <span className="ml-2 text-xs text-muted-foreground">
                  (from yesterday)
                </span>
              )}
            </label>
            <EmoticonMoodSelector
              value={mood}
              onChange={setMood}
              disabled={isSaving}
            />
          </div>

          {/* Sleep Quality Input */}
          <SleepQualityInput
            hours={sleepHours}
            quality={sleepQuality}
            onHoursChange={setSleepHours}
            onQualityChange={setSleepQuality}
            defaultHours={defaultSleepHours}
            defaultQuality={defaultSleepQuality}
            disabled={isSaving}
          />

          {/* Event Summary */}
          <EventSummaryCard
            userId={userId}
            date={currentDate}
          />

          {/* Flare Quick Updates */}
          <FlareQuickUpdateList
            userId={userId}
            onFlareUpdate={handleFlareUpdate}
          />

          {/* Daily Notes */}
          <div className="space-y-2">
            <label htmlFor="daily-notes" className="text-sm font-medium text-foreground">
              Daily Notes
              {draftSaved && (
                <span className="ml-2 text-xs text-muted-foreground">
                  (draft auto-saved)
                </span>
              )}
            </label>
            <textarea
              id="daily-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How was your day? Any observations or patterns you noticed?"
              maxLength={2000}
              rows={6}
              disabled={isSaving}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
            />
            <p className="text-xs text-muted-foreground text-right">
              {notes.length}/2000 characters
            </p>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={cn(
                "px-6 py-3 rounded-md bg-primary text-primary-foreground text-base font-semibold",
                "hover:bg-primary/90 transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                isSaving && "opacity-50 cursor-not-allowed"
              )}
            >
              {isSaving ? 'Saving...' : 'Save Daily Log'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
