# Trigger Tracking - Implementation Plan

## Overview

The Trigger Tracking system helps users identify and monitor environmental, dietary, and lifestyle factors that may influence their autoimmune symptoms. This feature enables pattern recognition and proactive management by correlating triggers with symptom occurrences, severity, and timing. The system combines intelligent data collection, pattern analysis, and personalized insights.

## Core Requirements

### User Experience Goals
- **Intuitive Logging**: Quick trigger entry with smart suggestions
- **Pattern Discovery**: Automated correlation analysis between triggers and symptoms
- **Personalized Insights**: Actionable recommendations based on individual patterns
- **Comprehensive Coverage**: Support for dietary, environmental, stress, and activity triggers
- **Privacy First**: Local analysis with optional anonymized sharing for research

### Technical Goals
- **Smart Correlation**: Advanced algorithms for trigger-symptom pattern detection
- **Efficient Storage**: Optimized data structures for large trigger datasets
- **Real-time Analysis**: Live pattern updates as new data is entered
- **Scalable Processing**: Handle complex correlations across multiple trigger types
- **Accessible Interface**: Voice input and simplified entry for users with mobility challenges

## System Architecture

### Data Model
```typescript
interface Trigger {
  id: string;
  userId: string;
  type: TriggerType;
  name: string;
  description?: string;
  category: TriggerCategory;
  severity: TriggerSeverity;
  timestamp: Date;
  duration?: number; // Duration in minutes
  intensity: number; // 1-10 scale
  location?: string; // Where the trigger occurred
  notes?: string;
  tags: string[];
  metadata: TriggerMetadata;
  symptomCorrelations: SymptomCorrelation[];
  isRecurring: boolean;
  recurrencePattern?: RecurrencePattern;
}

type TriggerType =
  | 'food'
  | 'drink'
  | 'medication'
  | 'supplement'
  | 'exercise'
  | 'stress'
  | 'weather'
  | 'environment'
  | 'sleep'
  | 'hormonal'
  | 'infection'
  | 'travel'
  | 'other';

type TriggerCategory =
  | 'dietary'
  | 'environmental'
  | 'lifestyle'
  | 'medical'
  | 'emotional'
  | 'physical';

type TriggerSeverity =
  | 'mild'
  | 'moderate'
  | 'severe'
  | 'critical';

interface TriggerMetadata {
  food?: {
    ingredients?: string[];
    preparation?: string;
    source?: string;
    allergens?: string[];
  };
  weather?: {
    temperature: number;
    humidity: number;
    pressure: number;
    conditions: string;
  };
  exercise?: {
    type: string;
    duration: number;
    intensity: string;
  };
  stress?: {
    source: string;
    copingStrategies?: string[];
  };
  location?: {
    latitude: number;
    longitude: number;
    placeName?: string;
  };
}

interface SymptomCorrelation {
  symptomId: string;
  correlationStrength: number; // -1 to 1 (negative/positive correlation)
  timeLag: number; // Hours between trigger and symptom onset
  confidence: number; // Statistical confidence in correlation
  occurrences: number; // Number of correlated instances
  lastUpdated: Date;
}

interface RecurrencePattern {
  frequency: 'daily' | 'weekly' | 'monthly' | 'irregular';
  interval?: number; // For periodic triggers
  daysOfWeek?: number[]; // 0-6, Sunday = 0
  timeOfDay?: string; // HH:MM format
  estimatedNext: Date;
}

interface TriggerPattern {
  id: string;
  triggerType: TriggerType;
  triggerName: string;
  averageIntensity: number;
  frequency: number; // Triggers per week
  symptomImpact: {
    symptomType: string;
    averageDelay: number; // Hours
    severityIncrease: number; // Average symptom severity increase
    confidence: number;
  }[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  lastAnalyzed: Date;
}
```

### Component Architecture
```
TriggerTrackingSystem/
├── TriggerLogger.tsx                 # Main trigger entry interface
├── TriggerQuickAdd.tsx               # Rapid trigger logging
├── TriggerHistory.tsx                # Trigger timeline and history
├── TriggerAnalyzer.tsx               # Pattern analysis and insights
├── TriggerCorrelator.tsx             # Trigger-symptom correlation engine
├── TriggerPredictor.tsx              # Risk prediction and alerts
├── TriggerCategories.tsx             # Category management and customization
├── TriggerTemplates.tsx              # Pre-defined trigger templates
├── TriggerImport.tsx                 # Bulk trigger data import
└── TriggerExport.tsx                 # Data export and backup
```

## Trigger Logging Implementation

### Main Trigger Logger
```tsx
function TriggerLogger({ onTriggerLogged }: TriggerLoggerProps) {
  const [selectedCategory, setSelectedCategory] = useState<TriggerCategory | null>(null);
  const [selectedType, setSelectedType] = useState<TriggerType | null>(null);
  const [triggerData, setTriggerData] = useState<Partial<Trigger>>({
    timestamp: new Date(),
    intensity: 5,
    tags: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentTriggers, setRecentTriggers] = useState<Trigger[]>([]);

  useEffect(() => {
    loadRecentTriggers();
  }, []);

  const loadRecentTriggers = async () => {
    const recent = await db.triggers
      .orderBy('timestamp')
      .reverse()
      .limit(10)
      .toArray();
    setRecentTriggers(recent);
  };

  const handleCategorySelect = (category: TriggerCategory) => {
    setSelectedCategory(category);
    setSelectedType(null);
    setTriggerData(prev => ({
      ...prev,
      category,
      type: undefined
    }));
  };

  const handleTypeSelect = (type: TriggerType) => {
    setSelectedType(type);
    setTriggerData(prev => ({
      ...prev,
      type,
      name: getDefaultNameForType(type)
    }));
  };

  const handleSubmit = async () => {
    if (!selectedType || !triggerData.name) return;

    setIsSubmitting(true);
    try {
      const trigger: Trigger = {
        id: generateId(),
        userId: currentUser.id,
        type: selectedType,
        category: selectedCategory!,
        name: triggerData.name,
        description: triggerData.description,
        severity: calculateSeverity(triggerData.intensity!),
        timestamp: triggerData.timestamp!,
        duration: triggerData.duration,
        intensity: triggerData.intensity!,
        location: triggerData.location,
        notes: triggerData.notes,
        tags: triggerData.tags || [],
        metadata: generateMetadata(selectedType, triggerData),
        symptomCorrelations: [],
        isRecurring: false
      };

      await db.triggers.add(trigger);
      await analyzeNewTrigger(trigger);

      onTriggerLogged(trigger);
      resetForm();
      await loadRecentTriggers();
    } catch (error) {
      console.error('Failed to log trigger:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateMetadata = (type: TriggerType, data: Partial<Trigger>): TriggerMetadata => {
    const metadata: TriggerMetadata = {};

    switch (type) {
      case 'food':
        metadata.food = {
          ingredients: data.tags?.filter(tag => tag.startsWith('ingredient:')),
          preparation: data.notes,
          allergens: data.tags?.filter(tag => tag.startsWith('allergen:'))
        };
        break;

      case 'weather':
        // Get current weather data
        metadata.weather = getCurrentWeatherData();
        break;

      case 'exercise':
        metadata.exercise = {
          type: data.name,
          duration: data.duration,
          intensity: getIntensityLabel(data.intensity!)
        };
        break;

      case 'stress':
        metadata.stress = {
          source: data.name,
          copingStrategies: data.tags?.filter(tag => tag.startsWith('coping:'))
        };
        break;
    }

    // Add location if available
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        metadata.location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
      });
    }

    return metadata;
  };

  const resetForm = () => {
    setSelectedCategory(null);
    setSelectedType(null);
    setTriggerData({
      timestamp: new Date(),
      intensity: 5,
      tags: []
    });
  };

  return (
    <div className="trigger-logger">
      <div className="logger-header">
        <h2>Log Trigger</h2>
        <p>Record what might be affecting your symptoms</p>
      </div>

      {/* Category Selection */}
      <div className="category-grid">
        {Object.values(TriggerCategory).map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            className="category-button"
            onClick={() => handleCategorySelect(category)}
          >
            <CategoryIcon category={category} />
            <span>{formatCategoryName(category)}</span>
          </Button>
        ))}
      </div>

      {/* Type Selection */}
      {selectedCategory && (
        <div className="type-grid">
          {getTypesForCategory(selectedCategory).map(type => (
            <Button
              key={type}
              variant={selectedType === type ? 'default' : 'outline'}
              className="type-button"
              onClick={() => handleTypeSelect(type)}
            >
              <TypeIcon type={type} />
              <span>{formatTypeName(type)}</span>
            </Button>
          ))}
        </div>
      )}

      {/* Trigger Details Form */}
      {selectedType && (
        <div className="trigger-form">
          <div className="form-row">
            <Label htmlFor="trigger-name">What specifically?</Label>
            <Input
              id="trigger-name"
              value={triggerData.name || ''}
              onChange={(e) => setTriggerData(prev => ({ ...prev, name: e.target.value }))}
              placeholder={getPlaceholderForType(selectedType)}
            />
          </div>

          <div className="form-row">
            <Label htmlFor="intensity">Intensity (1-10)</Label>
            <Slider
              id="intensity"
              min={1}
              max={10}
              step={1}
              value={[triggerData.intensity || 5]}
              onValueChange={([value]) => setTriggerData(prev => ({ ...prev, intensity: value }))}
              className="intensity-slider"
            />
            <div className="intensity-labels">
              <span>Mild</span>
              <span>Severe</span>
            </div>
          </div>

          <div className="form-row">
            <Label htmlFor="timestamp">When did this happen?</Label>
            <DateTimePicker
              value={triggerData.timestamp}
              onChange={(date) => setTriggerData(prev => ({ ...prev, timestamp: date }))}
            />
          </div>

          <div className="form-row">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              value={triggerData.duration || ''}
              onChange={(e) => setTriggerData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
              placeholder="Optional"
            />
          </div>

          <div className="form-row">
            <Label htmlFor="notes">Additional notes</Label>
            <Textarea
              id="notes"
              value={triggerData.notes || ''}
              onChange={(e) => setTriggerData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any additional details..."
            />
          </div>

          {/* Tags */}
          <div className="form-row">
            <Label>Tags</Label>
            <TagInput
              tags={triggerData.tags || []}
              onTagsChange={(tags) => setTriggerData(prev => ({ ...prev, tags }))}
              suggestions={getSuggestedTags(selectedType)}
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="form-actions">
        <Button variant="outline" onClick={resetForm}>
          Clear
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!selectedType || !triggerData.name || isSubmitting}
        >
          {isSubmitting ? <Spinner /> : 'Log Trigger'}
        </Button>
      </div>

      {/* Recent Triggers */}
      {recentTriggers.length > 0 && (
        <div className="recent-triggers">
          <h3>Recent Triggers</h3>
          <div className="recent-list">
            {recentTriggers.map(trigger => (
              <div key={trigger.id} className="recent-trigger-item">
                <div className="trigger-icon">
                  <TypeIcon type={trigger.type} />
                </div>
                <div className="trigger-info">
                  <span className="trigger-name">{trigger.name}</span>
                  <span className="trigger-time">
                    {formatRelativeTime(trigger.timestamp)}
                  </span>
                </div>
                <div className="trigger-intensity">
                  <IntensityIndicator intensity={trigger.intensity} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

### Quick Add Interface
```tsx
function TriggerQuickAdd({ onTriggerAdded }: TriggerQuickAddProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTriggers, setFilteredTriggers] = useState<QuickTrigger[]>([]);
  const [recentTriggers, setRecentTriggers] = useState<QuickTrigger[]>([]);

  useEffect(() => {
    loadRecentTriggers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = commonTriggers.filter(trigger =>
        trigger.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trigger.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredTriggers(filtered);
    } else {
      setFilteredTriggers([]);
    }
  }, [searchQuery]);

  const loadRecentTriggers = async () => {
    const recent = await db.triggers
      .orderBy('timestamp')
      .reverse()
      .limit(5)
      .toArray();

    const quickTriggers = recent.map(trigger => ({
      id: trigger.id,
      name: trigger.name,
      type: trigger.type,
      category: trigger.category,
      intensity: trigger.intensity,
      lastUsed: trigger.timestamp
    }));

    setRecentTriggers(quickTriggers);
  };

  const handleQuickAdd = async (trigger: QuickTrigger) => {
    const newTrigger: Trigger = {
      id: generateId(),
      userId: currentUser.id,
      type: trigger.type,
      category: trigger.category,
      name: trigger.name,
      severity: calculateSeverity(trigger.intensity),
      timestamp: new Date(),
      intensity: trigger.intensity,
      tags: [],
      metadata: {},
      symptomCorrelations: [],
      isRecurring: false
    };

    await db.triggers.add(newTrigger);
    await analyzeNewTrigger(newTrigger);

    onTriggerAdded(newTrigger);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <>
      {/* Trigger button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="quick-add-trigger-btn"
        aria-label="Quick add trigger"
      >
        <PlusIcon />
        <span>Trigger</span>
      </Button>

      {/* Quick add modal */}
      {isOpen && (
        <div className="quick-add-modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="quick-add-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Quick Add Trigger</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                aria-label="Close"
              >
                <XIcon />
              </Button>
            </div>

            {/* Search */}
            <div className="search-container">
              <SearchIcon />
              <Input
                placeholder="Search triggers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>

            {/* Results */}
            <div className="trigger-results">
              {searchQuery.trim() ? (
                // Search results
                filteredTriggers.length > 0 ? (
                  <div className="trigger-list">
                    {filteredTriggers.map(trigger => (
                      <button
                        key={trigger.id}
                        className="trigger-item"
                        onClick={() => handleQuickAdd(trigger)}
                      >
                        <TypeIcon type={trigger.type} />
                        <span>{trigger.name}</span>
                        <Badge variant="secondary">
                          {trigger.category}
                        </Badge>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="no-results">
                    <p>No triggers found</p>
                    <Button
                      variant="outline"
                      onClick={() => setIsOpen(false)}
                    >
                      Add Custom Trigger
                    </Button>
                  </div>
                )
              ) : (
                // Recent triggers
                <div className="recent-section">
                  <h4>Recent Triggers</h4>
                  <div className="trigger-list">
                    {recentTriggers.map(trigger => (
                      <button
                        key={trigger.id}
                        className="trigger-item"
                        onClick={() => handleQuickAdd(trigger)}
                      >
                        <TypeIcon type={trigger.type} />
                        <span>{trigger.name}</span>
                        <span className="last-used">
                          {formatRelativeTime(trigger.lastUsed)}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="common-section">
                    <h4>Common Triggers</h4>
                    <div className="trigger-list">
                      {commonTriggers.slice(0, 8).map(trigger => (
                        <button
                          key={trigger.id}
                          className="trigger-item"
                          onClick={() => handleQuickAdd(trigger)}
                        >
                          <TypeIcon type={trigger.type} />
                          <span>{trigger.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
```

## Pattern Analysis Engine

### Correlation Analysis
```typescript
class TriggerCorrelator {
  async analyzeTriggerCorrelations(userId: string): Promise<SymptomCorrelation[]> {
    const triggers = await db.triggers.where('userId').equals(userId).toArray();
    const symptoms = await db.symptoms.where('userId').equals(userId).toArray();

    const correlations: SymptomCorrelation[] = [];

    // Group triggers and symptoms by date
    const triggerGroups = this.groupByDate(triggers);
    const symptomGroups = this.groupByDate(symptoms);

    // Analyze each symptom type
    const symptomTypes = [...new Set(symptoms.map(s => s.type))];

    for (const symptomType of symptomTypes) {
      const symptomCorrelations = await this.analyzeSymptomTypeCorrelations(
        symptomType,
        triggerGroups,
        symptomGroups
      );
      correlations.push(...symptomCorrelations);
    }

    return correlations;
  }

  private async analyzeSymptomTypeCorrelations(
    symptomType: string,
    triggerGroups: Map<string, Trigger[]>,
    symptomGroups: Map<string, SymptomLog[]>
  ): Promise<SymptomCorrelation[]> {
    const correlations: SymptomCorrelation[] = [];
    const triggerTypes = [...new Set(Array.from(triggerGroups.values()).flat().map(t => t.type))];

    for (const triggerType of triggerTypes) {
      const correlation = await this.calculateCorrelation(
        triggerType,
        symptomType,
        triggerGroups,
        symptomGroups
      );

      if (correlation.confidence > 0.3) { // Minimum confidence threshold
        correlations.push({
          symptomId: symptomType,
          correlationStrength: correlation.strength,
          timeLag: correlation.timeLag,
          confidence: correlation.confidence,
          occurrences: correlation.occurrences,
          lastUpdated: new Date()
        });
      }
    }

    return correlations;
  }

  private async calculateCorrelation(
    triggerType: TriggerType,
    symptomType: string,
    triggerGroups: Map<string, Trigger[]>,
    symptomGroups: Map<string, SymptomLog[]>
  ): Promise<CorrelationResult> {
    const dates = Array.from(triggerGroups.keys()).sort();

    let totalOccurrences = 0;
    let correlatedOccurrences = 0;
    let timeLags: number[] = [];
    let strengths: number[] = [];

    for (const date of dates) {
      const dayTriggers = triggerGroups.get(date) || [];
      const daySymptoms = symptomGroups.get(date) || [];

      const triggerPresent = dayTriggers.some(t => t.type === triggerType);
      const symptomPresent = daySymptoms.some(s => s.type === symptomType);

      if (triggerPresent) {
        totalOccurrences++;

        // Check for symptoms in the following days (lag analysis)
        for (let lag = 0; lag <= 7; lag++) { // Check up to 7 days later
          const lagDate = this.addDays(new Date(date), lag);
          const lagDateStr = lagDate.toISOString().split('T')[0];
          const lagSymptoms = symptomGroups.get(lagDateStr) || [];

          if (lagSymptoms.some(s => s.type === symptomType)) {
            correlatedOccurrences++;
            timeLags.push(lag);

            // Calculate strength based on symptom severity
            const avgSeverity = lagSymptoms
              .filter(s => s.type === symptomType)
              .reduce((sum, s) => sum + s.severity, 0) / lagSymptoms.length;

            strengths.push(avgSeverity / 10); // Normalize to 0-1
            break; // Only count first occurrence
          }
        }
      }
    }

    const correlationStrength = totalOccurrences > 0 ?
      (correlatedOccurrences / totalOccurrences) - 0.5 : 0; // Center around 0

    const avgTimeLag = timeLags.length > 0 ?
      timeLags.reduce((sum, lag) => sum + lag, 0) / timeLags.length : 0;

    const confidence = this.calculateConfidence(totalOccurrences, correlatedOccurrences);

    return {
      strength: Math.max(-1, Math.min(1, correlationStrength)),
      timeLag: avgTimeLag,
      confidence,
      occurrences: correlatedOccurrences
    };
  }

  private calculateConfidence(totalTriggers: number, correlatedTriggers: number): number {
    if (totalTriggers < 5) return 0; // Not enough data

    // Use binomial confidence interval
    const p = correlatedTriggers / totalTriggers;
    const n = totalTriggers;

    // Wilson score interval approximation
    const z = 1.96; // 95% confidence
    const denominator = 1 + z * z / n;
    const adjustedP = (p + z * z / (2 * n)) / denominator;
    const adjustedSE = Math.sqrt((p * (1 - p) / n + z * z / (4 * n * n))) / denominator;

    return Math.min(1, adjustedP + z * adjustedSE); // Upper bound of confidence interval
  }

  private groupByDate<T extends { timestamp: Date }>(items: T[]): Map<string, T[]> {
    const groups = new Map<string, T[]>();

    items.forEach(item => {
      const dateStr = item.timestamp.toISOString().split('T')[0];
      if (!groups.has(dateStr)) {
        groups.set(dateStr, []);
      }
      groups.get(dateStr)!.push(item);
    });

    return groups;
  }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
}
```

### Pattern Insights Dashboard
```tsx
function TriggerAnalyzer({ userId }: TriggerAnalyzerProps) {
  const [patterns, setPatterns] = useState<TriggerPattern[]>([]);
  const [selectedPattern, setSelectedPattern] = useState<TriggerPattern | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyzePatterns();
  }, [userId, timeRange]);

  const analyzePatterns = async () => {
    setLoading(true);
    try {
      const correlator = new TriggerCorrelator();
      const correlations = await correlator.analyzeTriggerCorrelations(userId);

      const patterns = await generatePatterns(correlations, timeRange);
      setPatterns(patterns);
    } catch (error) {
      console.error('Failed to analyze patterns:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePatterns = async (
    correlations: SymptomCorrelation[],
    timeRange: string
  ): Promise<TriggerPattern[]> => {
    const patterns: TriggerPattern[] = [];

    // Group correlations by trigger type
    const triggerGroups = new Map<string, SymptomCorrelation[]>();

    correlations.forEach(correlation => {
      const key = `${correlation.symptomId}-${correlation.triggerType}`;
      if (!triggerGroups.has(key)) {
        triggerGroups.set(key, []);
      }
      triggerGroups.get(key)!.push(correlation);
    });

    for (const [key, groupCorrelations] of triggerGroups) {
      const [symptomType, triggerType] = key.split('-');

      // Calculate pattern metrics
      const avgCorrelation = groupCorrelations.reduce(
        (sum, c) => sum + c.correlationStrength, 0
      ) / groupCorrelations.length;

      const avgDelay = groupCorrelations.reduce(
        (sum, c) => sum + c.timeLag, 0
      ) / groupCorrelations.length;

      const totalOccurrences = groupCorrelations.reduce(
        (sum, c) => sum + c.occurrences, 0
      );

      const avgConfidence = groupCorrelations.reduce(
        (sum, c) => sum + c.confidence, 0
      ) / groupCorrelations.length;

      // Get trigger frequency
      const triggerFrequency = await calculateTriggerFrequency(triggerType as TriggerType, timeRange);

      // Generate recommendations
      const recommendations = generateRecommendations(
        triggerType as TriggerType,
        avgCorrelation,
        avgConfidence
      );

      patterns.push({
        id: generateId(),
        triggerType: triggerType as TriggerType,
        triggerName: getTriggerDisplayName(triggerType as TriggerType),
        averageIntensity: await getAverageTriggerIntensity(triggerType as TriggerType),
        frequency: triggerFrequency,
        symptomImpact: [{
          symptomType,
          averageDelay: avgDelay,
          severityIncrease: avgCorrelation * 2, // Rough estimate
          confidence: avgConfidence
        }],
        riskLevel: calculateRiskLevel(avgCorrelation, avgConfidence),
        recommendations,
        lastAnalyzed: new Date()
      });
    }

    return patterns.sort((a, b) => b.symptomImpact[0].confidence - a.symptomImpact[0].confidence);
  };

  const calculateRiskLevel = (correlation: number, confidence: number): 'low' | 'medium' | 'high' | 'critical' => {
    const riskScore = Math.abs(correlation) * confidence;

    if (riskScore > 0.8) return 'critical';
    if (riskScore > 0.6) return 'high';
    if (riskScore > 0.4) return 'medium';
    return 'low';
  };

  const generateRecommendations = (
    triggerType: TriggerType,
    correlation: number,
    confidence: number
  ): string[] => {
    const recommendations: string[] = [];

    if (correlation > 0.3 && confidence > 0.5) {
      switch (triggerType) {
        case 'food':
          recommendations.push('Consider eliminating this food from your diet for 2-4 weeks to test for improvement');
          recommendations.push('Keep a detailed food diary noting portion sizes and preparation methods');
          break;
        case 'stress':
          recommendations.push('Practice stress-reduction techniques like meditation or deep breathing');
          recommendations.push('Consider speaking with a therapist about stress management strategies');
          break;
        case 'exercise':
          recommendations.push('Try modifying your exercise routine - consider gentler forms of movement');
          recommendations.push('Ensure adequate recovery time between exercise sessions');
          break;
        case 'weather':
          recommendations.push('Monitor weather patterns and plan activities accordingly');
          recommendations.push('Consider using air purifiers or humidifiers to control indoor environment');
          break;
      }
    }

    return recommendations;
  };

  return (
    <div className="trigger-analyzer">
      <div className="analyzer-header">
        <h2>Trigger Analysis</h2>
        <div className="time-range-selector">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <Spinner />
          <p>Analyzing your trigger patterns...</p>
        </div>
      ) : patterns.length === 0 ? (
        <div className="empty-state">
          <AlertTriangleIcon />
          <h3>Not enough data</h3>
          <p>Log more triggers and symptoms to see pattern analysis</p>
        </div>
      ) : (
        <div className="patterns-grid">
          {patterns.map(pattern => (
            <div
              key={pattern.id}
              className={`pattern-card risk-${pattern.riskLevel}`}
              onClick={() => setSelectedPattern(pattern)}
            >
              <div className="pattern-header">
                <div className="trigger-icon">
                  <TypeIcon type={pattern.triggerType} />
                </div>
                <div className="pattern-info">
                  <h3>{pattern.triggerName}</h3>
                  <div className="pattern-metrics">
                    <span className="frequency">
                      {pattern.frequency}× per week
                    </span>
                    <Badge variant={getRiskVariant(pattern.riskLevel)}>
                      {pattern.riskLevel.toUpperCase()} RISK
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="pattern-impact">
                <div className="impact-item">
                  <span className="impact-label">Avg. Delay</span>
                  <span className="impact-value">
                    {Math.round(pattern.symptomImpact[0].averageDelay)}h
                  </span>
                </div>
                <div className="impact-item">
                  <span className="impact-label">Confidence</span>
                  <span className="impact-value">
                    {Math.round(pattern.symptomImpact[0].confidence * 100)}%
                  </span>
                </div>
              </div>

              {pattern.recommendations.length > 0 && (
                <div className="pattern-recommendations">
                  <h4>Recommendations</h4>
                  <ul>
                    {pattern.recommendations.slice(0, 2).map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pattern Detail Modal */}
      {selectedPattern && (
        <PatternDetailModal
          pattern={selectedPattern}
          onClose={() => setSelectedPattern(null)}
        />
      )}
    </div>
  );
}
```

## Implementation Checklist

### Core Logging Features
- [ ] Comprehensive trigger categorization (dietary, environmental, lifestyle, etc.)
- [ ] Quick-add interface for common triggers
- [ ] Detailed trigger logging with metadata
- [ ] Voice input support for accessibility
- [ ] Location and timestamp tracking

### Pattern Analysis
- [ ] Trigger-symptom correlation analysis
- [ ] Time-lag detection and analysis
- [ ] Statistical confidence calculations
- [ ] Risk level assessment
- [ ] Personalized recommendations

### User Experience
- [ ] Intuitive trigger entry forms
- [ ] Visual pattern dashboards
- [ ] Exportable analysis reports
- [ ] Trigger history and timeline
- [ ] Custom trigger templates

### Advanced Features
- [ ] Predictive trigger alerts
- [ ] Trigger combination analysis
- [ ] Seasonal and cyclical pattern detection
- [ ] Integration with calendar and scheduling
- [ ] Research data contribution (opt-in)

### Privacy & Security
- [ ] Local data processing only
- [ ] Encrypted trigger storage
- [ ] Anonymized research contributions
- [ ] Granular privacy controls
- [ ] Secure data export

### Performance & Scalability
- [ ] Efficient correlation algorithms
- [ ] Indexed trigger database
- [ ] Background analysis processing
- [ ] Memory-optimized large datasets
- [ ] Progressive loading for analysis

---

## Related Documents

- [Symptom Tracking](../02-symptom-tracking.md) - Symptom data for correlation analysis
- [Data Storage Architecture](../16-data-storage.md) - Trigger data persistence
- [Privacy & Security](../18-privacy-security.md) - Trigger data privacy
- [Data Analysis](../13-data-analysis.md) - Advanced pattern analysis
- [Calendar/Timeline](../11-calendar-timeline.md) - Trigger timeline integration

---

*Document Version: 1.0 | Last Updated: October 2025*