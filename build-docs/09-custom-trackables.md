# Custom Trackables - Implementation Plan

## Overview

The Custom Trackables system enables users to create personalized tracking metrics tailored to their specific autoimmune condition and health goals. This feature extends beyond standard symptom tracking to include custom metrics like energy levels, cognitive function, sleep quality, and condition-specific measurements. The system provides flexible data collection, intelligent analysis, and personalized insights.

## Core Requirements

### User Experience Goals
- **Flexible Tracking**: Create custom metrics for any health aspect
- **Intuitive Creation**: Easy-to-use interface for defining new trackables
- **Smart Analysis**: Automated pattern recognition and trend analysis
- **Personalized Insights**: Condition-specific recommendations and correlations
- **Seamless Integration**: Custom trackables work alongside standard symptoms

### Technical Goals
- **Dynamic Schema**: Runtime creation of new data types and validation
- **Scalable Storage**: Efficient storage of variable custom data structures
- **Intelligent Processing**: ML-powered analysis of custom metrics
- **Performance Optimized**: Fast queries across diverse data types
- **Privacy Preserving**: Secure handling of sensitive custom health data

## System Architecture

### Data Model
```typescript
interface CustomTrackable {
  id: string;
  userId: string;
  name: string;
  description?: string;
  category: TrackableCategory;
  dataType: TrackableDataType;
  unit?: string; // e.g., "hours", "scale 1-10", "mg/dL"
  configuration: TrackableConfiguration;
  validation: TrackableValidation;
  analysis: TrackableAnalysis;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  metadata: TrackableMetadata;
}

type TrackableCategory =
  | 'energy'
  | 'sleep'
  | 'cognitive'
  | 'physical'
  | 'emotional'
  | 'dietary'
  | 'environmental'
  | 'medication'
  | 'laboratory'
  | 'custom';

type TrackableDataType =
  | 'numeric'      // Numbers with units
  | 'scale'        // 1-10 or custom scale
  | 'boolean'      // Yes/No, True/False
  | 'text'         // Free-form text
  | 'selection'    // Multiple choice
  | 'time'         // Duration or time
  | 'location'     // Geographic location
  | 'photo'        // Image capture
  | 'audio';       // Voice recording

interface TrackableConfiguration {
  // Data collection settings
  inputMethod: InputMethod;
  defaultValue?: any;
  required: boolean;
  frequency: TrackingFrequency;

  // UI customization
  icon?: string;
  color?: string;
  displayFormat?: string;

  // Advanced settings
  aggregationMethod?: AggregationMethod;
  targetRange?: ValueRange;
  alertThresholds?: AlertThreshold[];
}

type InputMethod =
  | 'slider'
  | 'number-input'
  | 'text-input'
  | 'selection'
  | 'time-picker'
  | 'location-picker'
  | 'camera'
  | 'voice-recorder'
  | 'quick-buttons';

type TrackingFrequency =
  | 'daily'
  | 'multiple-daily'
  | 'weekly'
  | 'monthly'
  | 'as-needed'
  | 'event-triggered';

type AggregationMethod =
  | 'average'
  | 'sum'
  | 'count'
  | 'latest'
  | 'minimum'
  | 'maximum'
  | 'custom';

interface ValueRange {
  min?: number;
  max?: number;
  optimal?: {
    min: number;
    max: number;
  };
}

interface AlertThreshold {
  condition: 'above' | 'below' | 'equals' | 'between';
  value: number | [number, number];
  severity: 'info' | 'warning' | 'critical';
  message: string;
  actionRequired?: boolean;
}

interface TrackableValidation {
  required: boolean;
  minValue?: number;
  maxValue?: number;
  allowedValues?: any[]; // For selection type
  pattern?: string; // Regex for text validation
  customValidation?: string; // Function code for complex validation
}

interface TrackableAnalysis {
  enabled: boolean;
  correlationTargets: string[]; // Other trackables/symptoms to correlate with
  trendAnalysis: boolean;
  predictiveModeling: boolean;
  anomalyDetection: boolean;
  customAnalysis?: string; // Custom analysis function
}

interface TrackableMetadata {
  conditionSpecific?: string[]; // Related autoimmune conditions
  researchContributions?: boolean; // Opt-in for anonymized research
  dataRetention?: number; // Days to retain data
  exportFormat?: string;
  tags: string[];
}

interface TrackableEntry {
  id: string;
  trackableId: string;
  userId: string;
  value: any;
  timestamp: Date;
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  context: EntryContext;
  metadata: EntryMetadata;
}

interface EntryContext {
  symptoms?: string[]; // Related symptom entries
  triggers?: string[]; // Related trigger entries
  medications?: string[]; // Related medication entries
  activities?: string[]; // Related activities
  notes?: string;
}

interface EntryMetadata {
  inputMethod: InputMethod;
  deviceInfo?: {
    type: string;
    os: string;
    appVersion: string;
  };
  dataQuality: 'high' | 'medium' | 'low';
  edited: boolean;
  editedAt?: Date;
  originalValue?: any;
}

interface TrackableTemplate {
  id: string;
  name: string;
  description: string;
  category: TrackableCategory;
  condition: string; // Autoimmune condition this template is for
  configuration: TrackableConfiguration;
  popularity: number; // Usage count
  createdBy: string; // User ID or 'system'
  isPublic: boolean;
}
```

### Component Architecture
```
CustomTrackablesSystem/
├── TrackableCreator.tsx               # Create new custom trackables
├── TrackableManager.tsx               # Manage existing trackables
├── TrackableLogger.tsx                # Log entries for trackables
├── TrackableDashboard.tsx             # View trackable data and insights
├── TrackableAnalyzer.tsx              # Pattern analysis and correlations
├── TrackableTemplates.tsx             # Pre-built trackable templates
├── TrackableImporter.tsx              # Import trackables from templates
├── TrackableExporter.tsx              # Export trackable configurations
└── TrackableValidator.tsx             # Runtime validation engine
```

## Trackable Creation and Management

### Trackable Creator
```tsx
function TrackableCreator({ onTrackableCreated }: TrackableCreatorProps) {
  const [step, setStep] = useState<CreationStep>('basic');
  const [trackableData, setTrackableData] = useState<Partial<CustomTrackable>>({
    isActive: true,
    configuration: {
      required: false,
      frequency: 'daily'
    },
    validation: {
      required: false
    },
    analysis: {
      enabled: true,
      correlationTargets: [],
      trendAnalysis: true,
      predictiveModeling: false,
      anomalyDetection: true
    },
    metadata: {
      tags: []
    }
  });

  const handleBasicSubmit = () => {
    if (!trackableData.name || !trackableData.category || !trackableData.dataType) {
      return;
    }
    setStep('configuration');
  };

  const handleConfigurationSubmit = () => {
    setStep('validation');
  };

  const handleValidationSubmit = () => {
    setStep('analysis');
  };

  const handleAnalysisSubmit = async () => {
    try {
      const trackable: CustomTrackable = {
        ...trackableData,
        id: generateId(),
        userId: currentUser.id,
        createdAt: new Date(),
        updatedAt: new Date()
      } as CustomTrackable;

      await db.customTrackables.add(trackable);

      // Create database table for this trackable's entries
      await createTrackableTable(trackable);

      onTrackableCreated(trackable);
      resetForm();
    } catch (error) {
      console.error('Failed to create trackable:', error);
    }
  };

  const createTrackableTable = async (trackable: CustomTrackable) => {
    // Create IndexedDB object store for this trackable
    const db = await openCustomTrackablesDB();
    const storeName = `trackable_${trackable.id}`;

    if (!db.objectStoreNames.contains(storeName)) {
      const store = db.createObjectStore(storeName, { keyPath: 'id' });
      store.createIndex('timestamp', 'timestamp');
      store.createIndex('userId', 'userId');
    }
  };

  const resetForm = () => {
    setTrackableData({
      isActive: true,
      configuration: {
        required: false,
        frequency: 'daily'
      },
      validation: {
        required: false
      },
      analysis: {
        enabled: true,
        correlationTargets: [],
        trendAnalysis: true,
        predictiveModeling: false,
        anomalyDetection: true
      },
      metadata: {
        tags: []
      }
    });
    setStep('basic');
  };

  return (
    <div className="trackable-creator">
      {/* Progress indicator */}
      <div className="creation-steps">
        {[
          { key: 'basic', label: 'Basic Info' },
          { key: 'configuration', label: 'Configuration' },
          { key: 'validation', label: 'Validation' },
          { key: 'analysis', label: 'Analysis' }
        ].map(({ key, label }) => (
          <div
            key={key}
            className={`step ${step === key ? 'active' : getStepStatus(step, key)}`}
          >
            <span className="step-label">{label}</span>
          </div>
        ))}
      </div>

      {/* Step content */}
      {step === 'basic' && (
        <BasicInfoStep
          data={trackableData}
          onChange={setTrackableData}
          onSubmit={handleBasicSubmit}
        />
      )}

      {step === 'configuration' && (
        <ConfigurationStep
          data={trackableData}
          onChange={setTrackableData}
          onSubmit={handleConfigurationSubmit}
          onBack={() => setStep('basic')}
        />
      )}

      {step === 'validation' && (
        <ValidationStep
          data={trackableData}
          onChange={setTrackableData}
          onSubmit={handleValidationSubmit}
          onBack={() => setStep('configuration')}
        />
      )}

      {step === 'analysis' && (
        <AnalysisStep
          data={trackableData}
          onChange={setTrackableData}
          onSubmit={handleAnalysisSubmit}
          onBack={() => setStep('validation')}
        />
      )}
    </div>
  );
}

function BasicInfoStep({ data, onChange, onSubmit }: BasicInfoStepProps) {
  return (
    <div className="basic-info-step">
      <h2>Create Custom Trackable</h2>

      <div className="form-grid">
        <div className="form-group">
          <Label htmlFor="trackable-name">Name *</Label>
          <Input
            id="trackable-name"
            value={data.name || ''}
            onChange={(e) => onChange(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Morning Energy Level"
          />
        </div>

        <div className="form-group">
          <Label htmlFor="trackable-description">Description</Label>
          <Textarea
            id="trackable-description"
            value={data.description || ''}
            onChange={(e) => onChange(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe what this trackable measures..."
          />
        </div>

        <div className="form-group">
          <Label htmlFor="category">Category *</Label>
          <Select
            value={data.category}
            onValueChange={(value) => onChange(prev => ({ ...prev, category: value as TrackableCategory }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="energy">Energy & Fatigue</SelectItem>
              <SelectItem value="sleep">Sleep</SelectItem>
              <SelectItem value="cognitive">Cognitive Function</SelectItem>
              <SelectItem value="physical">Physical Health</SelectItem>
              <SelectItem value="emotional">Emotional Well-being</SelectItem>
              <SelectItem value="dietary">Dietary</SelectItem>
              <SelectItem value="environmental">Environmental</SelectItem>
              <SelectItem value="medication">Medication Response</SelectItem>
              <SelectItem value="laboratory">Laboratory Values</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="form-group">
          <Label htmlFor="data-type">Data Type *</Label>
          <Select
            value={data.dataType}
            onValueChange={(value) => onChange(prev => ({ ...prev, dataType: value as TrackableDataType }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select data type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="numeric">Number (with units)</SelectItem>
              <SelectItem value="scale">Scale (1-10)</SelectItem>
              <SelectItem value="boolean">Yes/No</SelectItem>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="selection">Multiple Choice</SelectItem>
              <SelectItem value="time">Time/Duration</SelectItem>
              <SelectItem value="location">Location</SelectItem>
              <SelectItem value="photo">Photo</SelectItem>
              <SelectItem value="audio">Audio Recording</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {data.dataType === 'numeric' && (
          <div className="form-group">
            <Label htmlFor="unit">Unit</Label>
            <Input
              id="unit"
              value={data.unit || ''}
              onChange={(e) => onChange(prev => ({ ...prev, unit: e.target.value }))}
              placeholder="e.g., hours, mg/dL, lbs"
            />
          </div>
        )}
      </div>

      <div className="step-actions">
        <Button onClick={onSubmit} disabled={!data.name || !data.category || !data.dataType}>
          Continue
        </Button>
      </div>
    </div>
  );
}
```

### Trackable Logger
```tsx
function TrackableLogger({ trackable, onEntryLogged }: TrackableLoggerProps) {
  const [value, setValue] = useState<any>(null);
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState<GeolocationCoordinates | null>(null);
  const [isLogging, setIsLogging] = useState(false);

  useEffect(() => {
    // Set default value based on trackable configuration
    if (trackable.configuration.defaultValue !== undefined) {
      setValue(trackable.configuration.defaultValue);
    }

    // Get location if trackable requires it
    if (trackable.dataType === 'location' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setLocation(position.coords),
        (error) => console.warn('Location access denied:', error)
      );
    }
  }, [trackable]);

  const validateValue = (inputValue: any): boolean => {
    const validation = trackable.validation;

    if (validation.required && (inputValue === null || inputValue === undefined || inputValue === '')) {
      return false;
    }

    if (typeof inputValue === 'number') {
      if (validation.minValue !== undefined && inputValue < validation.minValue) return false;
      if (validation.maxValue !== undefined && inputValue > validation.maxValue) return false;
    }

    if (validation.allowedValues && !validation.allowedValues.includes(inputValue)) {
      return false;
    }

    if (validation.pattern && typeof inputValue === 'string') {
      const regex = new RegExp(validation.pattern);
      if (!regex.test(inputValue)) return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateValue(value)) {
      alert('Please enter a valid value');
      return;
    }

    setIsLogging(true);
    try {
      const entry: TrackableEntry = {
        id: generateId(),
        trackableId: trackable.id,
        userId: currentUser.id,
        value,
        timestamp: new Date(),
        location: location ? {
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy
        } : undefined,
        context: {
          notes: notes.trim() || undefined
        },
        metadata: {
          inputMethod: trackable.configuration.inputMethod,
          dataQuality: 'high',
          edited: false
        }
      };

      // Store in custom trackables database
      await storeTrackableEntry(trackable.id, entry);

      // Check for alerts
      await checkAlertThresholds(trackable, value);

      onEntryLogged(entry);
      resetForm();
    } catch (error) {
      console.error('Failed to log trackable entry:', error);
    } finally {
      setIsLogging(false);
    }
  };

  const checkAlertThresholds = async (trackable: CustomTrackable, value: any) => {
    const thresholds = trackable.configuration.alertThresholds || [];

    for (const threshold of thresholds) {
      let triggered = false;

      switch (threshold.condition) {
        case 'above':
          triggered = typeof value === 'number' && value > threshold.value;
          break;
        case 'below':
          triggered = typeof value === 'number' && value < threshold.value;
          break;
        case 'equals':
          triggered = value === threshold.value;
          break;
        case 'between':
          const [min, max] = threshold.value as [number, number];
          triggered = typeof value === 'number' && value >= min && value <= max;
          break;
      }

      if (triggered) {
        await createAlert(trackable, threshold, value);
      }
    }
  };

  const resetForm = () => {
    setValue(trackable.configuration.defaultValue || null);
    setNotes('');
  };

  const renderInput = () => {
    const config = trackable.configuration;

    switch (config.inputMethod) {
      case 'slider':
        return (
          <Slider
            min={trackable.validation.minValue || 0}
            max={trackable.validation.maxValue || 10}
            step={1}
            value={[value || 5]}
            onValueChange={([newValue]) => setValue(newValue)}
            className="trackable-slider"
          />
        );

      case 'number-input':
        return (
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => setValue(parseFloat(e.target.value))}
            min={trackable.validation.minValue}
            max={trackable.validation.maxValue}
            step={0.1}
          />
        );

      case 'text-input':
        return (
          <Textarea
            value={value || ''}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter your observation..."
          />
        );

      case 'selection':
        return (
          <Select value={value} onValueChange={setValue}>
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {trackable.validation.allowedValues?.map(option => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'boolean':
        return (
          <div className="boolean-input">
            <Button
              variant={value === true ? 'default' : 'outline'}
              onClick={() => setValue(true)}
            >
              Yes
            </Button>
            <Button
              variant={value === false ? 'default' : 'outline'}
              onClick={() => setValue(false)}
            >
              No
            </Button>
          </div>
        );

      case 'time-picker':
        return (
          <Input
            type="time"
            value={value || ''}
            onChange={(e) => setValue(e.target.value)}
          />
        );

      case 'quick-buttons':
        return (
          <div className="quick-buttons">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
              <Button
                key={num}
                variant={value === num ? 'default' : 'outline'}
                onClick={() => setValue(num)}
              >
                {num}
              </Button>
            ))}
          </div>
        );

      default:
        return (
          <Input
            value={value || ''}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter value..."
          />
        );
    }
  };

  return (
    <div className="trackable-logger">
      <div className="logger-header">
        <h3>Log {trackable.name}</h3>
        {trackable.unit && <span className="unit">({trackable.unit})</span>}
      </div>

      <div className="input-section">
        <Label>Value {trackable.validation.required && '*'}</Label>
        {renderInput()}
      </div>

      <div className="notes-section">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any additional context..."
          rows={2}
        />
      </div>

      <div className="log-actions">
        <Button
          onClick={handleSubmit}
          disabled={!validateValue(value) || isLogging}
        >
          {isLogging ? <Spinner /> : 'Log Entry'}
        </Button>
      </div>
    </div>
  );
}
```

## Trackable Analysis Engine

### Pattern Analysis
```tsx
class TrackableAnalyzer {
  async analyzeTrackablePatterns(trackableId: string): Promise<TrackableInsights> {
    const entries = await getTrackableEntries(trackableId);
    if (entries.length < 7) {
      return { insights: [], confidence: 0 };
    }

    const insights: TrackableInsight[] = [];

    // Trend analysis
    const trendInsight = await this.analyzeTrends(entries);
    if (trendInsight) insights.push(trendInsight);

    // Cyclical patterns
    const cyclicalInsights = await this.analyzeCyclicalPatterns(entries);
    insights.push(...cyclicalInsights);

    // Correlation analysis
    const correlationInsights = await this.analyzeCorrelations(trackableId, entries);
    insights.push(...correlationInsights);

    // Anomaly detection
    const anomalyInsights = await this.detectAnomalies(entries);
    insights.push(...anomalyInsights);

    // Predictive modeling
    const predictionInsights = await this.generatePredictions(entries);
    insights.push(...predictionInsights);

    return {
      insights: insights.sort((a, b) => b.confidence - a.confidence),
      confidence: this.calculateOverallConfidence(insights)
    };
  }

  private async analyzeTrends(entries: TrackableEntry[]): Promise<TrackableInsight | null> {
    if (entries.length < 14) return null;

    // Sort entries by timestamp
    const sortedEntries = entries.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    // Calculate moving averages
    const windowSize = Math.min(7, Math.floor(sortedEntries.length / 3));
    const movingAverages = this.calculateMovingAverages(sortedEntries, windowSize);

    if (movingAverages.length < 2) return null;

    // Calculate trend slope
    const trend = this.calculateTrendSlope(movingAverages);

    let trendDirection: 'increasing' | 'decreasing' | 'stable';
    let confidence: number;

    if (Math.abs(trend.slope) < 0.01) {
      trendDirection = 'stable';
      confidence = 0.8;
    } else if (trend.slope > 0) {
      trendDirection = 'increasing';
      confidence = Math.min(1, Math.abs(trend.slope) * 10);
    } else {
      trendDirection = 'decreasing';
      confidence = Math.min(1, Math.abs(trend.slope) * 10);
    }

    return {
      type: 'trend',
      title: `${trendDirection === 'stable' ? 'Stable' : trendDirection.charAt(0).toUpperCase() + trendDirection.slice(1)} Trend`,
      description: `Your ${getTrackableName(trackableId)} has been ${trendDirection} over the past ${sortedEntries.length} days`,
      confidence,
      data: {
        direction: trendDirection,
        slope: trend.slope,
        period: sortedEntries.length
      },
      recommendations: this.generateTrendRecommendations(trendDirection, getTrackableCategory(trackableId))
    };
  }

  private async analyzeCorrelations(trackableId: string, entries: TrackableEntry[]): Promise<TrackableInsight[]> {
    const insights: TrackableInsight[] = [];

    // Get related symptoms
    const symptomEntries = await getRelatedSymptomEntries(entries);

    // Get related triggers
    const triggerEntries = await getRelatedTriggerEntries(entries);

    // Analyze symptom correlations
    for (const symptomType of Object.keys(symptomEntries)) {
      const correlation = this.calculateCorrelation(
        entries.map(e => this.extractNumericValue(e)),
        symptomEntries[symptomType].map(s => s.severity)
      );

      if (Math.abs(correlation) > 0.3) {
        insights.push({
          type: 'correlation',
          title: `${correlation > 0 ? 'Positive' : 'Negative'} Correlation with ${symptomType}`,
          description: `Changes in ${getTrackableName(trackableId)} are ${correlation > 0 ? 'associated with' : 'inversely related to'} ${symptomType} severity`,
          confidence: Math.abs(correlation),
          data: {
            correlatedWith: symptomType,
            correlationStrength: correlation,
            sampleSize: Math.min(entries.length, symptomEntries[symptomType].length)
          },
          recommendations: [
            correlation > 0 ?
              `Monitor ${getTrackableName(trackableId)} closely when ${symptomType} symptoms increase` :
              `Consider ${getTrackableName(trackableId)} as a potential protective factor against ${symptomType}`
          ]
        });
      }
    }

    // Analyze trigger correlations
    for (const triggerType of Object.keys(triggerEntries)) {
      const correlation = this.calculateTriggerCorrelation(entries, triggerEntries[triggerType]);

      if (correlation.confidence > 0.4) {
        insights.push({
          type: 'trigger-correlation',
          title: `Association with ${triggerType}`,
          description: `${triggerType} exposure ${correlation.strength > 0 ? 'increases' : 'decreases'} your ${getTrackableName(trackableId)}`,
          confidence: correlation.confidence,
          data: {
            triggerType,
            impact: correlation.strength,
            timeLag: correlation.timeLag
          },
          recommendations: [
            correlation.strength > 0 ?
              `Consider ${triggerType} as a positive factor for ${getTrackableName(trackableId)}` :
              `Be aware that ${triggerType} may negatively impact ${getTrackableName(trackableId)}`
          ]
        });
      }
    }

    return insights;
  }

  private calculateCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length < 2) return 0;

    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  private extractNumericValue(entry: TrackableEntry): number {
    const value = entry.value;

    if (typeof value === 'number') return value;
    if (typeof value === 'boolean') return value ? 1 : 0;
    if (typeof value === 'string') {
      // Try to parse as number
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }

    return 0;
  }

  private generateTrendRecommendations(direction: string, category: TrackableCategory): string[] {
    const recommendations: string[] = [];

    switch (category) {
      case 'energy':
        if (direction === 'decreasing') {
          recommendations.push('Consider consulting with your healthcare provider about persistent fatigue');
          recommendations.push('Review your sleep patterns and energy management strategies');
        }
        break;

      case 'sleep':
        if (direction === 'decreasing') {
          recommendations.push('Evaluate your sleep hygiene and environment');
          recommendations.push('Consider tracking caffeine and screen time before bed');
        }
        break;

      case 'cognitive':
        if (direction === 'decreasing') {
          recommendations.push('Consider cognitive exercises or brain training activities');
          recommendations.push('Review medication side effects that may affect cognition');
        }
        break;
    }

    return recommendations;
  }
}
```

## Implementation Checklist

### Trackable Creation
- [ ] Dynamic trackable definition system
- [ ] Multiple data type support (numeric, scale, boolean, text, etc.)
- [ ] Flexible input method configuration
- [ ] Validation rule setup
- [ ] Analysis configuration options

### Data Collection
- [ ] Runtime input validation
- [ ] Location data capture
- [ ] Context linking (symptoms, triggers, medications)
- [ ] Alert threshold monitoring
- [ ] Data quality assessment

### Analysis Engine
- [ ] Trend analysis and visualization
- [ ] Cyclical pattern detection
- [ ] Correlation with symptoms and triggers
- [ ] Anomaly detection
- [ ] Predictive modeling

### User Experience
- [ ] Template-based trackable creation
- [ ] Drag-and-drop dashboard customization
- [ ] Voice-guided data entry
- [ ] Accessibility-compliant interfaces
- [ ] Offline data collection

### Advanced Features
- [ ] Machine learning insights
- [ ] Custom analysis functions
- [ ] Research data contribution
- [ ] Cross-device synchronization
- [ ] Automated report generation

### Performance & Scalability
- [ ] Efficient custom data storage
- [ ] Indexed queries for large datasets
- [ ] Background analysis processing
- [ ] Memory-optimized data structures
- [ ] Progressive data loading

---

## Related Documents

- [Symptom Tracking](../02-symptom-tracking.md) - Integration with standard symptoms
- [Trigger Tracking](../06-trigger-tracking.md) - Correlation with triggers
- [Data Storage Architecture](../16-data-storage.md) - Custom data persistence
- [Data Analysis](../13-data-analysis.md) - Advanced analytics integration
- [Settings](../15-settings.md) - Trackable preferences and configuration

---

*Document Version: 1.0 | Last Updated: October 2025*