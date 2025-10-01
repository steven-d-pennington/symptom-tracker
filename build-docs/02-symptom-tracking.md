# Symptom Tracking - Implementation Plan

## Overview

The Symptom Tracking system provides flexible, customizable symptom recording with support for both predefined and user-created symptoms. It handles the complexity of autoimmune symptom documentation while maintaining ease of use during flare-ups and difficult health days.

## Core Requirements

### Symptom Definition System
- **Predefined Symptoms**: Curated list of common autoimmune symptoms
- **Custom Symptoms**: User-defined symptoms with full customization
- **Symptom Categories**: Organized grouping for better navigation
- **Symptom Metadata**: Units, value ranges, descriptions

### Symptom Logging Interface
- **Quick Selection**: Rapid symptom tagging from predefined lists
- **Detailed Logging**: Comprehensive symptom documentation
- **Bulk Operations**: Add multiple symptoms efficiently
- **Symptom History**: View past occurrences of specific symptoms

## Symptom Data Model

```typescript
interface Symptom {
  id: string;
  name: string;
  category: SymptomCategory;
  description?: string;
  unit?: string; // e.g., "scale 1-10", "hours", "cm"
  minValue?: number;
  maxValue?: number;
  isCustom: boolean;
  isActive: boolean; // Can be archived
  createdAt: Date;
  updatedAt: Date;
  usageCount: number; // Track how often used
}

interface SymptomOccurrence {
  id: string;
  symptomId: string;
  entryId: string;
  severity: number; // 1-10 scale
  bodyLocation?: string;
  duration?: number; // in hours
  quality?: SymptomQuality[];
  notes?: string;
  photos?: string[]; // Photo IDs
  timestamp: Date;
}

enum SymptomCategory {
  PAIN = 'pain',
  SKIN = 'skin',
  DIGESTIVE = 'digestive',
  FATIGUE = 'fatigue',
  COGNITIVE = 'cognitive',
  JOINT = 'joint',
  RESPIRATORY = 'respiratory',
  OTHER = 'other'
}

enum SymptomQuality {
  SHARP = 'sharp',
  DULL = 'dull',
  BURNING = 'burning',
  THROBBING = 'throbbing',
  ACHING = 'aching',
  STABBING = 'stabbing',
  TENDER = 'tender',
  ITCHY = 'itchy'
}
```

## Predefined Symptom Library

### HS-Specific Symptoms
```typescript
const hsSymptoms = [
  {
    name: "New Lesion/Nodule",
    category: SymptomCategory.SKIN,
    description: "New inflammatory lump under the skin",
    unit: "count",
    qualities: [SymptomQuality.TENDER, SymptomQuality.PAIN]
  },
  {
    name: "Active Abscess",
    category: SymptomCategory.SKIN,
    description: "Painful, swollen lesion with pus",
    unit: "count",
    qualities: [SymptomQuality.PAIN, SymptomQuality.BURNING]
  },
  {
    name: "Drainage",
    category: SymptomCategory.SKIN,
    description: "Fluid discharge from lesion",
    unit: "amount",
    qualities: [SymptomQuality.BURNING]
  },
  {
    name: "Pain",
    category: SymptomCategory.PAIN,
    description: "General pain associated with lesions",
    unit: "scale 1-10",
    qualities: [SymptomQuality.SHARP, SymptomQuality.DULL, SymptomQuality.BURNING]
  },
  {
    name: "Itching",
    category: SymptomCategory.SKIN,
    description: "Itchy skin around lesions",
    unit: "scale 1-10",
    qualities: [SymptomQuality.ITCHY]
  }
];
```

### General Autoimmune Symptoms
```typescript
const generalSymptoms = [
  {
    name: "Joint Pain",
    category: SymptomCategory.JOINT,
    description: "Pain in joints",
    unit: "scale 1-10",
    qualities: [SymptomQuality.ACHING, SymptomQuality.STABBING]
  },
  {
    name: "Fatigue",
    category: SymptomCategory.FATIGUE,
    description: "General tiredness and lack of energy",
    unit: "scale 1-10"
  },
  {
    name: "Brain Fog",
    category: SymptomCategory.COGNITIVE,
    description: "Difficulty thinking clearly",
    unit: "scale 1-10"
  },
  {
    name: "Fever",
    category: SymptomCategory.OTHER,
    description: "Elevated body temperature",
    unit: "temperature °F"
  }
];
```

## Component Architecture

### SymptomSelector Component
```typescript
interface SymptomSelectorProps {
  selectedSymptoms: SymptomOccurrence[];
  onSymptomAdd: (symptom: Symptom, occurrence: Partial<SymptomOccurrence>) => void;
  onSymptomUpdate: (id: string, updates: Partial<SymptomOccurrence>) => void;
  onSymptomRemove: (id: string) => void;
  mode: 'quick' | 'detailed';
}

function SymptomSelector({
  selectedSymptoms,
  onSymptomAdd,
  onSymptomUpdate,
  onSymptomRemove,
  mode
}: SymptomSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCustomForm, setShowCustomForm] = useState(false);

  // Filter symptoms based on search
  const filteredSymptoms = useMemo(() => {
    return symptoms.filter(symptom =>
      symptom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      symptom.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <div className="symptom-selector">
      <SymptomSearch
        value={searchTerm}
        onChange={setSearchTerm}
        onAddCustom={() => setShowCustomForm(true)}
      />

      <SymptomGrid
        symptoms={filteredSymptoms}
        selectedIds={selectedSymptoms.map(s => s.symptomId)}
        onSelect={handleSymptomSelect}
      />

      {selectedSymptoms.map(occurrence => (
        <SymptomOccurrenceForm
          key={occurrence.id}
          occurrence={occurrence}
          mode={mode}
          onUpdate={onSymptomUpdate}
          onRemove={onSymptomRemove}
        />
      ))}

      {showCustomForm && (
        <CustomSymptomForm
          onSave={handleCustomSymptomSave}
          onCancel={() => setShowCustomForm(false)}
        />
      )}
    </div>
  );
}
```

### SymptomOccurrenceForm Component
```typescript
interface SymptomOccurrenceFormProps {
  occurrence: SymptomOccurrence;
  mode: 'quick' | 'detailed';
  onUpdate: (updates: Partial<SymptomOccurrence>) => void;
  onRemove: () => void;
}

function SymptomOccurrenceForm({
  occurrence,
  mode,
  onUpdate,
  onRemove
}: SymptomOccurrenceFormProps) {
  const symptom = getSymptomById(occurrence.symptomId);

  return (
    <div className="symptom-occurrence-card">
      <div className="symptom-header">
        <h4>{symptom.name}</h4>
        <button onClick={onRemove} aria-label="Remove symptom">
          ×
        </button>
      </div>

      <div className="symptom-fields">
        <RatingSlider
          label="Severity"
          value={occurrence.severity}
          onChange={(value) => onUpdate({ severity: value })}
          min={1}
          max={10}
        />

        {mode === 'detailed' && (
          <>
            <LocationSelector
              value={occurrence.bodyLocation}
              onChange={(location) => onUpdate({ bodyLocation: location })}
            />

            <DurationInput
              value={occurrence.duration}
              onChange={(duration) => onUpdate({ duration })}
              unit="hours"
            />

            <QualitySelector
              symptom={symptom}
              selected={occurrence.quality || []}
              onChange={(quality) => onUpdate({ quality })}
            />

            <TextArea
              label="Notes"
              value={occurrence.notes || ''}
              onChange={(notes) => onUpdate({ notes })}
              placeholder="Additional details..."
            />
          </>
        )}
      </div>
    </div>
  );
}
```

## Symptom Management Features

### Custom Symptom Creation
```typescript
interface CustomSymptomFormData {
  name: string;
  category: SymptomCategory;
  description?: string;
  unit?: string;
  minValue?: number;
  maxValue?: number;
}

class CustomSymptomManager {
  async createCustomSymptom(data: CustomSymptomFormData): Promise<Symptom> {
    // Validate uniqueness
    const existing = await this.checkSymptomExists(data.name, data.category);
    if (existing) {
      throw new Error('Symptom with this name already exists in this category');
    }

    // Create new symptom
    const symptom: Symptom = {
      id: generateId(),
      ...data,
      isCustom: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      usageCount: 0
    };

    await this.saveSymptom(symptom);
    return symptom;
  }

  async archiveSymptom(symptomId: string): Promise<void> {
    const symptom = await this.getSymptom(symptomId);
    symptom.isActive = false;
    symptom.updatedAt = new Date();
    await this.saveSymptom(symptom);
  }
}
```

### Symptom Analytics
```typescript
class SymptomAnalytics {
  async getSymptomFrequency(symptomId: string, dateRange: DateRange): Promise<FrequencyData> {
    const occurrences = await this.getSymptomOccurrences(symptomId, dateRange);

    return {
      totalOccurrences: occurrences.length,
      averageSeverity: this.calculateAverageSeverity(occurrences),
      frequencyByWeek: this.groupByWeek(occurrences),
      bodyLocations: this.getLocationDistribution(occurrences),
      trends: this.calculateTrends(occurrences)
    };
  }

  async getSymptomCorrelations(symptomId: string): Promise<CorrelationData[]> {
    // Find triggers that frequently occur before this symptom
    const symptomEntries = await this.getSymptomEntries(symptomId);

    const correlations = [];
    for (const trigger of allTriggers) {
      const correlation = await this.calculateCorrelation(symptomEntries, trigger);
      if (correlation.confidence > 0.7) { // High confidence threshold
        correlations.push({
          triggerId: trigger.id,
          triggerName: trigger.name,
          confidence: correlation.confidence,
          averageLag: correlation.averageLag,
          occurrences: correlation.occurrences
        });
      }
    }

    return correlations.sort((a, b) => b.confidence - a.confidence);
  }
}
```

## Body Location Integration

### Location-Aware Symptom Logging
```typescript
interface BodyLocation {
  id: string;
  name: string;
  region: BodyRegion;
  coordinates?: { x: number; y: number }; // For visual mapping
  commonSymptoms: string[]; // Symptom IDs commonly logged here
}

enum BodyRegion {
  HEAD = 'head',
  TORSO = 'torso',
  ARMS = 'arms',
  LEGS = 'legs',
  HANDS = 'hands',
  FEET = 'feet'
}

class LocationManager {
  async getSymptomsForLocation(locationId: string): Promise<Symptom[]> {
    const location = await this.getLocation(locationId);
    return await Promise.all(
      location.commonSymptoms.map(id => this.getSymptom(id))
    );
  }

  async getLocationHistory(locationId: string, dateRange: DateRange): Promise<LocationHistory> {
    const symptoms = await this.getSymptomsForLocation(locationId);
    const symptomIds = symptoms.map(s => s.id);

    const occurrences = await this.db.symptomOccurrences
      .where('bodyLocation')
      .equals(locationId)
      .and(occ => symptomIds.includes(occ.symptomId))
      .and(occ => {
        const entryDate = new Date(occ.timestamp);
        return entryDate >= dateRange.start && entryDate <= dateRange.end;
      })
      .toArray();

    return {
      locationId,
      totalOccurrences: occurrences.length,
      symptomBreakdown: this.groupBySymptom(occurrences),
      severityTrend: this.calculateSeverityTrend(occurrences),
      lastActivity: this.getLastActivityDate(occurrences)
    };
  }
}
```

## Performance Optimizations

### Symptom Loading Strategy
```typescript
class SymptomLoader {
  // Cache frequently used symptoms
  private symptomCache = new Map<string, Symptom>();
  private categoryCache = new Map<SymptomCategory, Symptom[]>();

  async getSymptom(symptomId: string): Promise<Symptom> {
    if (this.symptomCache.has(symptomId)) {
      return this.symptomCache.get(symptomId)!;
    }

    const symptom = await this.db.symptoms.get(symptomId);
    if (symptom) {
      this.symptomCache.set(symptomId, symptom);
    }
    return symptom;
  }

  async getSymptomsByCategory(category: SymptomCategory): Promise<Symptom[]> {
    if (this.categoryCache.has(category)) {
      return this.categoryCache.get(category)!;
    }

    const symptoms = await this.db.symptoms
      .where('category')
      .equals(category)
      .and(s => s.isActive)
      .sortBy('usageCount');

    this.categoryCache.set(category, symptoms);
    return symptoms;
  }

  // Preload commonly used symptoms
  async preloadCommonSymptoms(): Promise<void> {
    const commonCategories = [SymptomCategory.PAIN, SymptomCategory.SKIN];
    await Promise.all(
      commonCategories.map(cat => this.getSymptomsByCategory(cat))
    );
  }
}
```

### Search Optimization
```typescript
class SymptomSearch {
  private searchIndex: Map<string, string[]>; // term -> symptom IDs

  async buildSearchIndex(): Promise<void> {
    const symptoms = await this.db.symptoms.toArray();
    this.searchIndex = new Map();

    for (const symptom of symptoms) {
      const terms = this.extractSearchTerms(symptom);
      for (const term of terms) {
        if (!this.searchIndex.has(term)) {
          this.searchIndex.set(term, []);
        }
        this.searchIndex.get(term)!.push(symptom.id);
      }
    }
  }

  searchSymptoms(query: string): string[] {
    const terms = query.toLowerCase().split(' ');
    const resultSets = terms.map(term => this.searchIndex.get(term) || []);

    // Return intersection of all result sets
    return resultSets.reduce((acc, set) => acc.filter(id => set.includes(id)));
  }

  private extractSearchTerms(symptom: Symptom): string[] {
    const terms = [
      symptom.name.toLowerCase(),
      symptom.category.toLowerCase(),
      ...(symptom.description ? symptom.description.toLowerCase().split(' ') : [])
    ];

    return [...new Set(terms)]; // Remove duplicates
  }
}
```

## Accessibility Features

### Screen Reader Support
- Descriptive labels for all symptom inputs
- Progress announcements when adding/removing symptoms
- Context-aware help text for complex symptoms
- Keyboard navigation for symptom selection

### Motor Accessibility
- Large touch targets for symptom buttons
- Drag-and-drop reordering of selected symptoms
- Voice input for symptom notes
- Reduced steps for common operations

### Cognitive Accessibility
- Clear visual hierarchy for symptom information
- Consistent terminology throughout
- Undo functionality for symptom additions
- Progressive disclosure to avoid overwhelming users

## Testing Strategy

### Unit Tests
- Symptom validation logic
- Custom symptom creation
- Search functionality
- Analytics calculations

### Integration Tests
- Complete symptom logging workflow
- Body location integration
- Search and filtering
- Data persistence

### User Acceptance Tests
- HS-specific symptom logging
- Custom symptom creation
- Symptom history viewing
- Performance with large symptom sets

## Implementation Checklist

### Core Functionality
- [ ] Symptom database schema
- [ ] Predefined symptom library
- [ ] Symptom selection interface
- [ ] Custom symptom creation
- [ ] Symptom occurrence logging
- [ ] Body location integration

### Advanced Features
- [ ] Symptom analytics and trends
- [ ] Search and filtering
- [ ] Symptom correlations
- [ ] Performance optimizations
- [ ] Accessibility compliance

### Quality Assurance
- [ ] Unit test coverage >90%
- [ ] Integration tests passing
- [ ] Accessibility audit passed
- [ ] Performance benchmarks met
- [ ] Cross-browser compatibility verified

---

## Related Documents

- [Daily Entry System](../01-daily-entry-system.md) - Primary interface for symptom logging
- [Body Mapping System](../03-body-mapping-system.md) - Visual location tracking
- [Data Analysis](../11-data-analysis.md) - Symptom pattern identification
- [Accessibility Features](../15-accessibility-features.md) - Inclusive symptom logging

---

*Document Version: 1.0 | Last Updated: October 2025*