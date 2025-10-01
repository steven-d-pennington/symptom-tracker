# Daily Entry System - Implementation Plan

## Overview

The Daily Entry System provides a streamlined, efficient way for users to log their daily health status. This is the most frequently used feature of the app, designed for quick check-ins that capture essential health metrics without requiring extensive time or effort. The system balances comprehensive data collection with user-friendly, rapid entry workflows.

## Core Requirements

### User Experience Goals
- **Quick Entry**: Complete daily check-in in under 2 minutes
- **Minimal Friction**: Intuitive interface with smart defaults
- **Progressive Disclosure**: Start simple, allow deeper logging as needed
- **Context Awareness**: Remember recent patterns and preferences
- **Offline First**: Full functionality without internet connection

### Data Collection Scope
- **Overall Health Rating**: Single daily wellness score
- **Key Symptoms**: Most important symptoms for quick tracking
- **Energy Levels**: Physical and mental energy assessment
- **Sleep Quality**: Previous night's sleep rating
- **Mood**: Emotional state tracking
- **Optional Deep Dive**: Expand to detailed symptom logging

## System Architecture

### Data Model
```typescript
interface DailyEntry {
  id: string;
  date: Date;
  userId: string;

  // Core metrics
  overallHealth: number; // 1-10 scale
  energyLevel: number; // 1-10 scale
  sleepQuality: number; // 1-10 scale
  mood: number; // 1-10 scale

  // Quick symptom tracking
  topSymptoms: QuickSymptomEntry[];

  // Optional detailed logging
  detailedSymptoms?: SymptomLog[];
  medications?: MedicationEntry[];
  triggers?: TriggerEntry[];
  notes?: string;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  entryTime: number; // Time spent on entry in seconds
  completionStatus: 'quick' | 'detailed' | 'skipped';
}

interface QuickSymptomEntry {
  symptomId: string;
  name: string;
  severity: number; // 1-10 scale
  isNew: boolean; // First time logging this symptom
  trend: 'improving' | 'worsening' | 'stable' | 'unknown';
}
```

### Component Architecture
```
DailyEntrySystem/
├── DailyEntryProvider.tsx          # Context provider for entry state
├── DailyEntryWizard.tsx            # Main entry flow component
├── QuickEntryForm.tsx              # Rapid 4-question check-in
├── DetailedEntryForm.tsx           # Expanded logging options
├── EntryHistory.tsx                # Recent entries display
├── EntryAnalytics.tsx              # Quick insights from entries
├── SmartDefaults.tsx               # ML-powered entry suggestions
└── EntryScheduler.tsx              # Reminder and notification system
```

## Quick Entry Flow

### Core Interface Design
```tsx
function QuickEntryForm({ onComplete, onExpand }: QuickEntryFormProps) {
  const [entry, setEntry] = useState<Partial<DailyEntry>>({
    overallHealth: 5,
    energyLevel: 5,
    sleepQuality: 5,
    mood: 5
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [topSymptoms, setTopSymptoms] = useState<QuickSymptomEntry[]>([]);

  const steps = [
    {
      key: 'overall',
      title: 'How are you feeling today?',
      component: (
        <HealthSlider
          value={entry.overallHealth || 5}
          onChange={(value) => setEntry(prev => ({ ...prev, overallHealth: value }))}
          labels={{ 1: 'Terrible', 5: 'Okay', 10: 'Excellent' }}
        />
      )
    },
    {
      key: 'energy',
      title: 'Energy level today?',
      component: (
        <EnergySlider
          value={entry.energyLevel || 5}
          onChange={(value) => setEntry(prev => ({ ...prev, energyLevel: value }))}
          labels={{ 1: 'Exhausted', 5: 'Normal', 10: 'Energized' }}
        />
      )
    },
    {
      key: 'sleep',
      title: 'How did you sleep?',
      component: (
        <SleepSlider
          value={entry.sleepQuality || 5}
          onChange={(value) => setEntry(prev => ({ ...prev, sleepQuality: value }))}
          labels={{ 1: 'Poor', 5: 'Okay', 10: 'Restful' }}
        />
      )
    },
    {
      key: 'mood',
      title: 'Mood today?',
      component: (
        <MoodSlider
          value={entry.mood || 5}
          onChange={(value) => setEntry(prev => ({ ...prev, mood: value }))}
          labels={{ 1: 'Low', 5: 'Neutral', 10: 'Great' }}
        />
      )
    },
    {
      key: 'symptoms',
      title: 'Any symptoms to note?',
      component: (
        <SymptomQuickSelect
          selectedSymptoms={topSymptoms}
          onChange={setTopSymptoms}
          recentSymptoms={getRecentSymptoms()}
        />
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    const completeEntry: DailyEntry = {
      ...entry,
      id: generateId(),
      date: new Date(),
      topSymptoms,
      completionStatus: 'quick',
      createdAt: new Date(),
      updatedAt: new Date(),
      entryTime: calculateEntryTime()
    };

    await saveDailyEntry(completeEntry);
    onComplete(completeEntry);
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">
          Daily Check-in
        </CardTitle>
        <Progress value={(currentStep + 1) / steps.length * 100} />
      </CardHeader>

      <CardContent>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center mb-6">
              <h3 className="text-lg font-medium mb-2">
                {steps[currentStep].title}
              </h3>
              {steps[currentStep].component}
            </div>
          </motion.div>
        </AnimatePresence>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
        >
          Back
        </Button>

        <Button onClick={handleNext}>
          {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
        </Button>
      </CardFooter>

      {currentStep === steps.length - 1 && (
        <CardFooter className="pt-0">
          <Button
            variant="ghost"
            className="w-full"
            onClick={onExpand}
          >
            Add more details →
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
```

### Smart Slider Components
```tsx
function HealthSlider({ value, onChange, labels }: SliderProps) {
  const [isDragging, setIsDragging] = useState(false);

  // Haptic feedback for mobile
  const handleValueChange = (newValue: number) => {
    onChange(newValue);
    if ('vibrate' in navigator && isDragging) {
      navigator.vibrate(10);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="range"
          min="1"
          max="10"
          value={value}
          onChange={(e) => handleValueChange(parseInt(e.target.value))}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          className="health-slider"
          aria-valuemin={1}
          aria-valuemax={10}
          aria-valuenow={value}
          aria-valuetext={`Health rating: ${value} out of 10`}
        />

        {/* Visual markers */}
        <div className="flex justify-between mt-2 px-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => (
            <button
              key={level}
              onClick={() => handleValueChange(level)}
              className={`w-3 h-3 rounded-full transition-colors ${
                level <= value ? 'bg-primary' : 'bg-muted'
              }`}
              aria-label={`Set health rating to ${level}`}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-between text-sm text-muted-foreground">
        <span>{labels[1]}</span>
        <span className="font-medium text-foreground">
          {value}/10
        </span>
        <span>{labels[10]}</span>
      </div>
    </div>
  );
}
```

### Symptom Quick Select
```tsx
function SymptomQuickSelect({ selectedSymptoms, onChange, recentSymptoms }: SymptomQuickSelectProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSymptoms = recentSymptoms.filter(symptom =>
    symptom.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSymptomToggle = (symptom: Symptom) => {
    const existing = selectedSymptoms.find(s => s.symptomId === symptom.id);

    if (existing) {
      // Remove symptom
      onChange(selectedSymptoms.filter(s => s.symptomId !== symptom.id));
    } else {
      // Add symptom with severity prompt
      const severity = prompt(`Severity for ${symptom.name} (1-10):`, '5');
      if (severity && parseInt(severity) >= 1 && parseInt(severity) <= 10) {
        const quickEntry: QuickSymptomEntry = {
          symptomId: symptom.id,
          name: symptom.name,
          severity: parseInt(severity),
          isNew: false,
          trend: calculateTrend(symptom.id)
        };
        onChange([...selectedSymptoms, quickEntry]);
      }
    }
  };

  const calculateTrend = (symptomId: string): Trend => {
    // Compare with last 7 days
    const recentEntries = getRecentEntriesForSymptom(symptomId, 7);
    if (recentEntries.length < 2) return 'unknown';

    const avgRecent = recentEntries.slice(-3).reduce((sum, e) => sum + e.severity, 0) / 3;
    const avgPrevious = recentEntries.slice(0, -3).reduce((sum, e) => sum + e.severity, 0) / (recentEntries.length - 3);

    const diff = avgRecent - avgPrevious;
    if (diff > 1) return 'worsening';
    if (diff < -1) return 'improving';
    return 'stable';
  };

  return (
    <div className="space-y-4">
      {/* Selected symptoms */}
      {selectedSymptoms.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Selected Symptoms:</h4>
          {selectedSymptoms.map(symptom => (
            <div key={symptom.symptomId} className="flex items-center justify-between p-2 bg-muted rounded">
              <div className="flex items-center gap-2">
                <span>{symptom.name}</span>
                <Badge variant={
                  symptom.trend === 'improving' ? 'default' :
                  symptom.trend === 'worsening' ? 'destructive' :
                  'secondary'
                }>
                  {symptom.severity}/10
                </Badge>
                {symptom.isNew && <Badge variant="outline">New</Badge>}
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleSymptomToggle({ id: symptom.symptomId, name: symptom.name })}
              >
                ×
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Symptom search */}
      <div className="relative">
        <Input
          placeholder="Search symptoms..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
        />

        {showSuggestions && filteredSymptoms.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg max-h-48 overflow-y-auto z-10">
            {filteredSymptoms.slice(0, 10).map(symptom => (
              <button
                key={symptom.id}
                className="w-full text-left px-3 py-2 hover:bg-muted flex items-center justify-between"
                onClick={() => {
                  handleSymptomToggle(symptom);
                  setSearchTerm('');
                  setShowSuggestions(false);
                }}
              >
                <span>{symptom.name}</span>
                {selectedSymptoms.some(s => s.symptomId === symptom.id) && (
                  <Check className="w-4 h-4" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick add new symptom */}
      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          const name = prompt('New symptom name:');
          if (name?.trim()) {
            const severity = prompt('Severity (1-10):', '5');
            if (severity && parseInt(severity) >= 1 && parseInt(severity) <= 10) {
              const newSymptom: QuickSymptomEntry = {
                symptomId: generateId(),
                name: name.trim(),
                severity: parseInt(severity),
                isNew: true,
                trend: 'unknown'
              };
              onChange([...selectedSymptoms, newSymptom]);
            }
          }
        }}
      >
        + Add New Symptom
      </Button>
    </div>
  );
}
```

## Smart Defaults and Context Awareness

### Pattern Recognition
```typescript
class SmartDefaults {
  // Predict likely symptoms based on recent patterns
  async getPredictedSymptoms(): Promise<Symptom[]> {
    const recentEntries = await this.getRecentEntries(30); // Last 30 days
    const symptomFrequency = new Map<string, number>();

    // Count symptom occurrences
    recentEntries.forEach(entry => {
      entry.topSymptoms.forEach(symptom => {
        symptomFrequency.set(
          symptom.symptomId,
          (symptomFrequency.get(symptom.symptomId) || 0) + 1
        );
      });
    });

    // Get top 5 most frequent symptoms
    return Array.from(symptomFrequency.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([symptomId]) => this.getSymptomById(symptomId))
      .filter(Boolean);
  }

  // Suggest severity based on recent trends
  async getSuggestedSeverity(symptomId: string): Promise<number> {
    const recentEntries = await this.getRecentEntriesForSymptom(symptomId, 7);

    if (recentEntries.length === 0) return 5;

    // Use weighted average favoring recent entries
    const weightedSum = recentEntries.reduce((sum, entry, index) => {
      const weight = index + 1; // More recent = higher weight
      return sum + (entry.severity * weight);
    }, 0);

    const totalWeight = recentEntries.reduce((sum, _, index) => sum + (index + 1), 0);

    return Math.round(weightedSum / totalWeight);
  }

  // Detect patterns and suggest insights
  async getEntryInsights(): Promise<EntryInsight[]> {
    const insights: EntryInsight[] = [];
    const recentEntries = await this.getRecentEntries(14);

    // Energy and sleep correlation
    const energySleepCorrelation = this.calculateCorrelation(
      recentEntries.map(e => e.energyLevel),
      recentEntries.map(e => e.sleepQuality)
    );

    if (energySleepCorrelation > 0.7) {
      insights.push({
        type: 'correlation',
        title: 'Energy & Sleep Connection',
        description: 'Your energy levels closely follow your sleep quality. Better sleep may improve your energy.',
        actionable: true
      });
    }

    // Symptom flare detection
    const symptomTrends = this.analyzeSymptomTrends(recentEntries);
    symptomTrends.forEach(trend => {
      if (trend.trend === 'worsening' && trend.days > 3) {
        insights.push({
          type: 'warning',
          title: `${trend.symptomName} Flare Detected`,
          description: `${trend.symptomName} has been worsening for ${trend.days} days. Consider tracking triggers.`,
          actionable: true
        });
      }
    });

    return insights;
  }
}
```

### Contextual Suggestions
```tsx
function EntrySuggestions({ currentEntry, onSuggestionApply }: EntrySuggestionsProps) {
  const [suggestions, setSuggestions] = useState<EntrySuggestion[]>([]);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadSuggestions();
  }, [currentEntry]);

  const loadSuggestions = async () => {
    const smartSuggestions = await smartDefaults.getEntrySuggestions(currentEntry);

    // Filter out dismissed suggestions
    const activeSuggestions = smartSuggestions.filter(
      s => !dismissedSuggestions.has(s.id)
    );

    setSuggestions(activeSuggestions);
  };

  const handleApplySuggestion = (suggestion: EntrySuggestion) => {
    onSuggestionApply(suggestion);
    setDismissedSuggestions(prev => new Set([...prev, suggestion.id]));
  };

  const handleDismissSuggestion = (suggestionId: string) => {
    setDismissedSuggestions(prev => new Set([...prev, suggestionId]));
  };

  if (suggestions.length === 0) return null;

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-sm">Suggestions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {suggestions.map(suggestion => (
          <div key={suggestion.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded">
            <div className="flex-1">
              <p className="text-sm font-medium">{suggestion.title}</p>
              <p className="text-xs text-muted-foreground">{suggestion.description}</p>
            </div>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleApplySuggestion(suggestion)}
              >
                Apply
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDismissSuggestion(suggestion.id)}
              >
                ×
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
```

## Entry Scheduling and Reminders

### Smart Reminder System
```typescript
class EntryScheduler {
  private readonly PREFERRED_HOUR = 20; // 8 PM default
  private readonly REMINDER_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

  async scheduleDailyReminder(): Promise<void> {
    const permission = await this.requestNotificationPermission();
    if (permission !== 'granted') return;

    const nextReminder = this.calculateNextReminderTime();
    await this.scheduleNotification(nextReminder);
  }

  private calculateNextReminderTime(): Date {
    const now = new Date();
    const todayReminder = new Date(now);
    todayReminder.setHours(this.PREFERRED_HOUR, 0, 0, 0);

    // If already past today's reminder time, schedule for tomorrow
    if (now > todayReminder) {
      todayReminder.setDate(todayReminder.getDate() + 1);
    }

    return todayReminder;
  }

  private async scheduleNotification(scheduledTime: Date): Promise<void> {
    if ('serviceWorker' in navigator && 'Notification' in window) {
      const registration = await navigator.serviceWorker.ready;

      await registration.showNotification('Daily Health Check-in', {
        body: 'How are you feeling today? Take a moment to log your symptoms.',
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: 'daily-entry-reminder',
        requireInteraction: false,
        silent: false,
        actions: [
          {
            action: 'log-entry',
            title: 'Quick Check-in'
          },
          {
            action: 'snooze',
            title: 'Remind Later'
          }
        ],
        data: {
          scheduledTime: scheduledTime.toISOString(),
          type: 'daily-reminder'
        }
      });
    }
  }

  // Handle notification clicks
  setupNotificationHandlers(): void {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'notification-action') {
          this.handleNotificationAction(event.data.action, event.data.data);
        }
      });
    }
  }

  private handleNotificationAction(action: string, data: any): void {
    switch (action) {
      case 'log-entry':
        // Navigate to entry form
        window.location.href = '/log/daily';
        break;
      case 'snooze':
        // Schedule reminder for 2 hours later
        const snoozeTime = new Date(Date.now() + 2 * 60 * 60 * 1000);
        this.scheduleNotification(snoozeTime);
        break;
    }
  }

  // Adaptive scheduling based on user patterns
  async adaptScheduleBasedOnUsage(): Promise<void> {
    const entries = await this.getRecentEntries(30);
    const entryTimes = entries.map(e => e.createdAt.getHours());

    if (entryTimes.length > 5) {
      // Find most common entry hour
      const hourCounts = entryTimes.reduce((counts, hour) => {
        counts[hour] = (counts[hour] || 0) + 1;
        return counts;
      }, {} as Record<number, number>);

      const mostCommonHour = Object.entries(hourCounts)
        .sort(([, a], [, b]) => b - a)[0][0];

      this.PREFERRED_HOUR = parseInt(mostCommonHour);
    }
  }
}
```

## Entry History and Analytics

### Recent Entries Display
```tsx
function EntryHistory({ limit = 7 }: EntryHistoryProps) {
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentEntries();
  }, [limit]);

  const loadRecentEntries = async () => {
    setLoading(true);
    try {
      const recentEntries = await db.dailyEntries
        .orderBy('date')
        .reverse()
        .limit(limit)
        .toArray();

      setEntries(recentEntries);
    } catch (error) {
      console.error('Failed to load entries:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading recent entries...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Recent Check-ins</h3>

      {entries.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No entries yet. Start your first daily check-in!
        </p>
      ) : (
        <div className="space-y-3">
          {entries.map(entry => (
            <Card key={entry.id} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="font-medium">
                  {entry.date.toLocaleDateString()}
                </div>
                <Badge variant={
                  entry.completionStatus === 'detailed' ? 'default' :
                  entry.completionStatus === 'quick' ? 'secondary' : 'outline'
                }>
                  {entry.completionStatus}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Health:</span>
                  <span className="ml-2 font-medium">{entry.overallHealth}/10</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Energy:</span>
                  <span className="ml-2 font-medium">{entry.energyLevel}/10</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Sleep:</span>
                  <span className="ml-2 font-medium">{entry.sleepQuality}/10</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Mood:</span>
                  <span className="ml-2 font-medium">{entry.mood}/10</span>
                </div>
              </div>

              {entry.topSymptoms.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <div className="flex flex-wrap gap-1">
                    {entry.topSymptoms.map(symptom => (
                      <Badge key={symptom.symptomId} variant="outline" className="text-xs">
                        {symptom.name} ({symptom.severity})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {entry.notes && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm text-muted-foreground">{entry.notes}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Quick Analytics Dashboard
```tsx
function EntryAnalytics({ timeframe = 30 }: EntryAnalyticsProps) {
  const [analytics, setAnalytics] = useState<EntryAnalyticsData | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, [timeframe]);

  const loadAnalytics = async () => {
    const entries = await db.dailyEntries
      .where('date')
      .above(new Date(Date.now() - timeframe * 24 * 60 * 60 * 1000))
      .toArray();

    const analytics = this.calculateAnalytics(entries);
    setAnalytics(analytics);
  };

  const calculateAnalytics = (entries: DailyEntry[]): EntryAnalyticsData => {
    if (entries.length === 0) return null;

    const avgHealth = entries.reduce((sum, e) => sum + e.overallHealth, 0) / entries.length;
    const avgEnergy = entries.reduce((sum, e) => sum + e.energyLevel, 0) / entries.length;
    const avgSleep = entries.reduce((sum, e) => sum + e.sleepQuality, 0) / entries.length;
    const avgMood = entries.reduce((sum, e) => sum + e.mood, 0) / entries.length;

    // Calculate trends (comparing first half vs second half)
    const midpoint = Math.floor(entries.length / 2);
    const recentEntries = entries.slice(0, midpoint);
    const olderEntries = entries.slice(midpoint);

    const calculateTrend = (recent: number[], older: number[]): Trend => {
      const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
      const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
      const diff = recentAvg - olderAvg;

      if (diff > 0.5) return 'improving';
      if (diff < -0.5) return 'worsening';
      return 'stable';
    };

    return {
      averages: {
        health: Math.round(avgHealth * 10) / 10,
        energy: Math.round(avgEnergy * 10) / 10,
        sleep: Math.round(avgSleep * 10) / 10,
        mood: Math.round(avgMood * 10) / 10
      },
      trends: {
        health: calculateTrend(
          recentEntries.map(e => e.overallHealth),
          olderEntries.map(e => e.overallHealth)
        ),
        energy: calculateTrend(
          recentEntries.map(e => e.energyLevel),
          olderEntries.map(e => e.energyLevel)
        ),
        sleep: calculateTrend(
          recentEntries.map(e => e.sleepQuality),
          olderEntries.map(e => e.sleepQuality)
        ),
        mood: calculateTrend(
          recentEntries.map(e => e.mood),
          olderEntries.map(e => e.mood)
        )
      },
      streak: this.calculateStreak(entries),
      totalEntries: entries.length
    };
  };

  const calculateStreak = (entries: DailyEntry[]): number => {
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);

      const hasEntry = entries.some(entry => {
        const entryDate = new Date(entry.date);
        entryDate.setHours(0, 0, 0, 0);
        return entryDate.getTime() === checkDate.getTime();
      });

      if (hasEntry) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  if (!analytics) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Your Health Trends</CardTitle>
        <p className="text-sm text-muted-foreground">
          Last {timeframe} days • {analytics.totalEntries} entries
        </p>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {analytics.averages.health}
            </div>
            <div className="text-sm text-muted-foreground">Avg Health</div>
            <TrendIndicator trend={analytics.trends.health} />
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {analytics.streak}
            </div>
            <div className="text-sm text-muted-foreground">Day Streak</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {analytics.averages.energy}
            </div>
            <div className="text-sm text-muted-foreground">Avg Energy</div>
            <TrendIndicator trend={analytics.trends.energy} />
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {analytics.averages.sleep}
            </div>
            <div className="text-sm text-muted-foreground">Avg Sleep</div>
            <TrendIndicator trend={analytics.trends.sleep} />
          </div>
        </div>

        <div className="text-center">
          <div className="text-lg font-medium">Mood: {analytics.averages.mood}/10</div>
          <TrendIndicator trend={analytics.trends.mood} />
        </div>
      </CardContent>
    </Card>
  );
}

function TrendIndicator({ trend }: { trend: Trend }) {
  const icons = {
    improving: '↗️',
    worsening: '↘️',
    stable: '→'
  };

  const colors = {
    improving: 'text-green-600',
    worsening: 'text-red-600',
    stable: 'text-gray-600'
  };

  return (
    <span className={`text-sm ${colors[trend]}`}>
      {icons[trend]} {trend}
    </span>
  );
}
```

## Offline Support and Data Synchronization

### Offline Queue Management
```typescript
class OfflineEntryManager {
  private readonly QUEUE_KEY = 'pending_entries';
  private readonly SYNC_STATUS_KEY = 'sync_status';

  async saveEntry(entry: DailyEntry): Promise<void> {
    try {
      // Try to save to local database first
      await db.dailyEntries.add(entry);

      // If online, sync immediately
      if (navigator.onLine) {
        await this.syncEntry(entry);
      } else {
        // Queue for later sync
        await this.queueEntryForSync(entry);
      }
    } catch (error) {
      // If local save fails, queue for retry
      await this.queueEntryForSync(entry);
    }
  }

  private async queueEntryForSync(entry: DailyEntry): Promise<void> {
    const queue = await this.getSyncQueue();
    queue.push({
      id: entry.id,
      data: entry,
      timestamp: Date.now(),
      retryCount: 0
    });

    await this.saveSyncQueue(queue);
  }

  async syncPendingEntries(): Promise<void> {
    if (!navigator.onLine) return;

    const queue = await this.getSyncQueue();
    const remainingQueue: SyncQueueItem[] = [];

    for (const item of queue) {
      try {
        await this.syncEntry(item.data);
        // Remove from queue on success
      } catch (error) {
        item.retryCount++;

        // Keep in queue if retries remaining
        if (item.retryCount < 3) {
          remainingQueue.push(item);
        } else {
          // Log failed sync for manual resolution
          await this.logFailedSync(item);
        }
      }
    }

    await this.saveSyncQueue(remainingQueue);
  }

  private async syncEntry(entry: DailyEntry): Promise<void> {
    // Implementation depends on sync strategy
    // Could sync to cloud service or just mark as synced locally
    await this.markEntryAsSynced(entry.id);
  }

  // Listen for online/offline events
  setupConnectivityListeners(): void {
    window.addEventListener('online', () => {
      this.syncPendingEntries();
    });

    // Periodic sync check
    setInterval(() => {
      if (navigator.onLine) {
        this.syncPendingEntries();
      }
    }, 5 * 60 * 1000); // Check every 5 minutes
  }
}
```

## Implementation Checklist

### Core Entry Flow
- [ ] Quick entry form with 4 core metrics (health, energy, sleep, mood)
- [ ] Symptom quick-select with severity input
- [ ] Smart defaults based on recent patterns
- [ ] Progressive disclosure to detailed logging
- [ ] Entry completion time tracking

### User Experience
- [ ] Intuitive slider controls with haptic feedback
- [ ] Visual progress indicators
- [ ] Contextual suggestions and insights
- [ ] Smooth animations and transitions
- [ ] Keyboard and screen reader accessibility

### Smart Features
- [ ] Pattern recognition for symptom prediction
- [ ] Trend analysis and severity suggestions
- [ ] Adaptive reminder scheduling
- [ ] Entry insights and correlations
- [ ] Personalized suggestions

### Data Management
- [ ] Local storage with IndexedDB
- [ ] Offline entry queuing
- [ ] Data synchronization when online
- [ ] Backup and recovery support
- [ ] Data validation and sanitization

### Notifications & Scheduling
- [ ] Daily reminder notifications
- [ ] Adaptive scheduling based on usage patterns
- [ ] Snooze and reschedule options
- [ ] Notification action handling
- [ ] Do not disturb preferences

### Analytics & History
- [ ] Recent entries display
- [ ] Quick analytics dashboard
- [ ] Trend indicators and streak tracking
- [ ] Historical data visualization
- [ ] Export capabilities for entries

### Performance & Reliability
- [ ] Fast loading and responsive UI
- [ ] Efficient data queries and caching
- [ ] Error handling and recovery
- [ ] Memory management for large datasets
- [ ] Battery-efficient background processing

---

## Related Documents

- [Data Storage Architecture](../16-data-storage.md) - Entry data persistence
- [PWA Infrastructure](../17-pwa-infrastructure.md) - Offline entry support
- [Symptom Tracking](../02-symptom-tracking.md) - Detailed symptom logging integration
- [Settings & Customization](../14-settings-customization.md) - Entry preferences
- [Accessibility](../20-accessibility.md) - Inclusive entry interface

---

*Document Version: 1.0 | Last Updated: October 2025*