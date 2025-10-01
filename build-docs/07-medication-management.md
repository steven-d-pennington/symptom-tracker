# Medication Management - Implementation Plan

## Overview

The Medication Management system provides comprehensive tracking and analysis of medications, supplements, and treatments for autoimmune conditions. This feature enables users to monitor medication effectiveness, side effects, adherence, and interactions while maintaining detailed records for healthcare providers. The system combines medication logging, scheduling, interaction checking, and effectiveness analysis.

## Core Requirements

### User Experience Goals
- **Complete Medication Profile**: Track all medications, dosages, frequencies, and changes over time
- **Smart Scheduling**: Intelligent reminders and scheduling based on medication routines
- **Effectiveness Tracking**: Correlate medication changes with symptom patterns
- **Safety First**: Built-in interaction checking and side effect monitoring
- **Provider Ready**: Export detailed medication history for medical appointments

### Technical Goals
- **Comprehensive Database**: Extensive medication database with interactions and side effects
- **Offline Functionality**: Full medication tracking without internet connectivity
- **Secure Storage**: Encrypted medication data with privacy protection
- **Intelligent Analysis**: Pattern recognition for medication effectiveness and side effects
- **Accessibility**: Voice-guided medication logging and simplified interfaces

## System Architecture

### Data Model
```typescript
interface Medication {
  id: string;
  userId: string;
  name: string;
  genericName?: string;
  brandName?: string;
  type: MedicationType;
  category: MedicationCategory;
  dosage: Dosage;
  frequency: Frequency;
  schedule: MedicationSchedule;
  startDate: Date;
  endDate?: Date;
  prescribingPhysician?: string;
  pharmacy?: string;
  prescriptionNumber?: string;
  indications: string[]; // What it's prescribed for
  sideEffects: SideEffect[];
  interactions: MedicationInteraction[];
  notes?: string;
  isActive: boolean;
  metadata: MedicationMetadata;
}

type MedicationType =
  | 'prescription'
  | 'otc'
  | 'supplement'
  | 'herbal'
  | 'vitamin'
  | 'mineral'
  | 'injection'
  | 'topical'
  | 'other';

type MedicationCategory =
  | 'nsaid'
  | 'steroid'
  | 'immunosuppressant'
  | 'biologic'
  | 'antibiotic'
  | 'antiviral'
  | 'antifungal'
  | 'vitamin'
  | 'mineral'
  | 'herbal'
  | 'pain-reliever'
  | 'anti-inflammatory'
  | 'other';

interface Dosage {
  amount: number;
  unit: DosageUnit;
  form: DosageForm;
  strength?: string; // e.g., "500mg", "10mg/ml"
}

type DosageUnit =
  | 'mg' | 'mcg' | 'g' | 'ml' | 'l' | 'units' | 'tablets' | 'capsules'
  | 'drops' | 'sprays' | 'patches' | 'other';

type DosageForm =
  | 'tablet' | 'capsule' | 'liquid' | 'injection' | 'topical' | 'inhaler'
  | 'patch' | 'suppository' | 'other';

interface Frequency {
  type: 'fixed' | 'as-needed' | 'scheduled';
  timesPerDay?: number;
  intervalHours?: number;
  specificTimes?: string[]; // HH:MM format
  daysOfWeek?: number[]; // 0-6, Sunday = 0
}

interface MedicationSchedule {
  id: string;
  medicationId: string;
  scheduledTime: Date;
  taken: boolean;
  takenTime?: Date;
  skipped: boolean;
  skipReason?: string;
  notes?: string;
  adherenceScore: number; // 0-1
}

interface SideEffect {
  id: string;
  medicationId: string;
  symptom: string;
  severity: 'mild' | 'moderate' | 'severe';
  onsetDate: Date;
  duration?: number; // Days
  notes?: string;
  reportedToPhysician: boolean;
  resolved: boolean;
  resolvedDate?: Date;
}

interface MedicationInteraction {
  id: string;
  medicationId: string;
  interactingMedication: string;
  interactionType: 'major' | 'moderate' | 'minor';
  description: string;
  management: string;
  source: string; // Database source
  lastUpdated: Date;
}

interface MedicationMetadata {
  rxNormId?: string; // RxNorm identifier
  ndc?: string; // National Drug Code
  fdaApproved: boolean;
  controlledSubstance: boolean;
  pregnancyCategory?: string;
  manufacturer?: string;
  lotNumber?: string;
  expirationDate?: Date;
  storageInstructions?: string;
}

interface MedicationEffectiveness {
  id: string;
  medicationId: string;
  symptomType: string;
  effectiveness: number; // -1 to 1 (worsening to improving)
  confidence: number;
  timeFrame: {
    start: Date;
    end: Date;
  };
  notes?: string;
  lastUpdated: Date;
}
```

### Component Architecture
```
MedicationManagementSystem/
├── MedicationLogger.tsx               # Add/edit medication profiles
├── MedicationList.tsx                 # Active medication overview
├── MedicationScheduler.tsx            # Dosage scheduling and reminders
├── MedicationTracker.tsx              # Daily medication tracking
├── MedicationHistory.tsx              # Historical medication records
├── MedicationAnalyzer.tsx             # Effectiveness and side effect analysis
├── MedicationInteractions.tsx         # Drug interaction checking
├── MedicationReminders.tsx            # Notification system
├── MedicationExporter.tsx             # Export medication history
└── MedicationDatabase.tsx             # Local medication database
```

## Medication Logging Implementation

### Medication Profile Creation
```tsx
function MedicationLogger({ onMedicationAdded }: MedicationLoggerProps) {
  const [step, setStep] = useState<LogStep>('basic');
  const [medicationData, setMedicationData] = useState<Partial<Medication>>({
    type: 'prescription',
    isActive: true,
    startDate: new Date(),
    sideEffects: [],
    interactions: [],
    indications: []
  });
  const [searchResults, setSearchResults] = useState<MedicationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleBasicInfoSubmit = async () => {
    // Validate basic information
    if (!medicationData.name || !medicationData.dosage) {
      return;
    }

    // Search for medication in database
    setIsSearching(true);
    const results = await searchMedicationDatabase(medicationData.name!);
    setSearchResults(results);
    setIsSearching(false);

    if (results.length > 0) {
      setStep('select');
    } else {
      setStep('details');
    }
  };

  const handleMedicationSelect = (selectedMed: MedicationSearchResult) => {
    setMedicationData(prev => ({
      ...prev,
      ...selectedMed,
      id: generateId(),
      userId: currentUser.id
    }));
    setStep('details');
  };

  const handleDetailsSubmit = async () => {
    try {
      const medication: Medication = {
        ...medicationData,
        id: medicationData.id || generateId(),
        userId: currentUser.id,
        schedule: generateInitialSchedule(medicationData),
        metadata: {
          ...medicationData.metadata,
          fdaApproved: true, // Default assumption
          controlledSubstance: false
        }
      } as Medication;

      await db.medications.add(medication);
      await checkInteractions(medication);

      onMedicationAdded(medication);
      resetForm();
    } catch (error) {
      console.error('Failed to add medication:', error);
    }
  };

  const generateInitialSchedule = (data: Partial<Medication>): MedicationSchedule[] => {
    const schedules: MedicationSchedule[] = [];
    const frequency = data.frequency!;

    if (frequency.type === 'fixed' && frequency.specificTimes) {
      const startDate = data.startDate || new Date();

      // Generate schedule for next 30 days
      for (let day = 0; day < 30; day++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + day);

        frequency.specificTimes.forEach(time => {
          const [hours, minutes] = time.split(':').map(Number);
          const scheduledTime = new Date(date);
          scheduledTime.setHours(hours, minutes, 0, 0);

          schedules.push({
            id: generateId(),
            medicationId: data.id!,
            scheduledTime,
            taken: false,
            adherenceScore: 1.0
          });
        });
      }
    }

    return schedules;
  };

  const resetForm = () => {
    setMedicationData({
      type: 'prescription',
      isActive: true,
      startDate: new Date(),
      sideEffects: [],
      interactions: [],
      indications: []
    });
    setStep('basic');
    setSearchResults([]);
  };

  return (
    <div className="medication-logger">
      {/* Progress indicator */}
      <div className="step-indicator">
        <div className={`step ${step === 'basic' ? 'active' : step === 'select' || step === 'details' ? 'completed' : ''}`}>
          <span>1</span>
          <span>Basic Info</span>
        </div>
        <div className={`step ${step === 'select' ? 'active' : step === 'details' ? 'completed' : ''}`}>
          <span>2</span>
          <span>Select</span>
        </div>
        <div className={`step ${step === 'details' ? 'active' : ''}`}>
          <span>3</span>
          <span>Details</span>
        </div>
      </div>

      {/* Step content */}
      {step === 'basic' && (
        <BasicInfoStep
          data={medicationData}
          onChange={setMedicationData}
          onSubmit={handleBasicInfoSubmit}
        />
      )}

      {step === 'select' && (
        <MedicationSelectStep
          searchResults={searchResults}
          isSearching={isSearching}
          onSelect={handleMedicationSelect}
          onSkip={() => setStep('details')}
        />
      )}

      {step === 'details' && (
        <MedicationDetailsStep
          data={medicationData}
          onChange={setMedicationData}
          onSubmit={handleDetailsSubmit}
          onBack={() => setStep(searchResults.length > 0 ? 'select' : 'basic')}
        />
      )}
    </div>
  );
}

function BasicInfoStep({ data, onChange, onSubmit }: BasicInfoStepProps) {
  return (
    <div className="basic-info-step">
      <h2>Add Medication</h2>

      <div className="form-grid">
        <div className="form-group">
          <Label htmlFor="med-name">Medication Name *</Label>
          <Input
            id="med-name"
            value={data.name || ''}
            onChange={(e) => onChange(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Prednisone, Vitamin D3"
          />
        </div>

        <div className="form-group">
          <Label htmlFor="med-type">Type</Label>
          <Select
            value={data.type}
            onValueChange={(value) => onChange(prev => ({ ...prev, type: value as MedicationType }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="prescription">Prescription</SelectItem>
              <SelectItem value="otc">Over-the-Counter</SelectItem>
              <SelectItem value="supplement">Supplement</SelectItem>
              <SelectItem value="herbal">Herbal</SelectItem>
              <SelectItem value="vitamin">Vitamin</SelectItem>
              <SelectItem value="injection">Injection</SelectItem>
              <SelectItem value="topical">Topical</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="form-group">
          <Label>Dosage *</Label>
          <div className="dosage-inputs">
            <Input
              type="number"
              placeholder="Amount"
              value={data.dosage?.amount || ''}
              onChange={(e) => onChange(prev => ({
                ...prev,
                dosage: {
                  ...prev.dosage,
                  amount: parseFloat(e.target.value),
                  unit: prev.dosage?.unit || 'mg',
                  form: prev.dosage?.form || 'tablet'
                }
              }))}
            />
            <Select
              value={data.dosage?.unit || 'mg'}
              onValueChange={(value) => onChange(prev => ({
                ...prev,
                dosage: { ...prev.dosage, unit: value as DosageUnit }
              }))}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mg">mg</SelectItem>
                <SelectItem value="mcg">mcg</SelectItem>
                <SelectItem value="g">g</SelectItem>
                <SelectItem value="ml">ml</SelectItem>
                <SelectItem value="units">units</SelectItem>
                <SelectItem value="tablets">tablets</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={data.dosage?.form || 'tablet'}
              onValueChange={(value) => onChange(prev => ({
                ...prev,
                dosage: { ...prev.dosage, form: value as DosageForm }
              }))}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tablet">Tablet</SelectItem>
                <SelectItem value="capsule">Capsule</SelectItem>
                <SelectItem value="liquid">Liquid</SelectItem>
                <SelectItem value="injection">Injection</SelectItem>
                <SelectItem value="topical">Topical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="form-group">
          <Label>Frequency</Label>
          <FrequencyInput
            frequency={data.frequency}
            onChange={(frequency) => onChange(prev => ({ ...prev, frequency }))}
          />
        </div>
      </div>

      <div className="step-actions">
        <Button onClick={onSubmit} disabled={!data.name || !data.dosage}>
          Continue
        </Button>
      </div>
    </div>
  );
}
```

### Medication Tracking and Scheduling
```tsx
function MedicationTracker({ date }: MedicationTrackerProps) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [schedules, setSchedules] = useState<MedicationSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMedicationsAndSchedules();
  }, [date]);

  const loadMedicationsAndSchedules = async () => {
    setLoading(true);
    try {
      // Get active medications
      const activeMeds = await db.medications
        .where('isActive')
        .equals(true)
        .and(med => {
          const startDate = new Date(med.startDate);
          const endDate = med.endDate ? new Date(med.endDate) : null;
          const checkDate = new Date(date);

          return checkDate >= startDate && (!endDate || checkDate <= endDate);
        })
        .toArray();

      setMedications(activeMeds);

      // Get schedules for the date
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const daySchedules = await db.schedules
        .where('scheduledTime')
        .between(dayStart, dayEnd)
        .toArray();

      setSchedules(daySchedules);
    } catch (error) {
      console.error('Failed to load medication data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMedicationTaken = async (scheduleId: string, taken: boolean) => {
    try {
      const schedule = schedules.find(s => s.id === scheduleId);
      if (!schedule) return;

      const updatedSchedule = {
        ...schedule,
        taken,
        takenTime: taken ? new Date() : undefined,
        adherenceScore: taken ? 1.0 : 0.0
      };

      await db.schedules.put(updatedSchedule);

      // Update local state
      setSchedules(prev => prev.map(s =>
        s.id === scheduleId ? updatedSchedule : s
      ));

      // Recalculate adherence for medication
      await updateMedicationAdherence(schedule.medicationId);
    } catch (error) {
      console.error('Failed to update medication status:', error);
    }
  };

  const updateMedicationAdherence = async (medicationId: string) => {
    const medSchedules = await db.schedules
      .where('medicationId')
      .equals(medicationId)
      .toArray();

    const totalSchedules = medSchedules.length;
    const takenSchedules = medSchedules.filter(s => s.taken).length;
    const adherenceRate = totalSchedules > 0 ? takenSchedules / totalSchedules : 0;

    // Update medication with adherence info
    const medication = await db.medications.get(medicationId);
    if (medication) {
      await db.medications.put({
        ...medication,
        adherenceRate
      });
    }
  };

  const getSchedulesByTime = () => {
    const grouped: { [time: string]: MedicationSchedule[] } = {};

    schedules.forEach(schedule => {
      const timeKey = schedule.scheduledTime.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });

      if (!grouped[timeKey]) {
        grouped[timeKey] = [];
      }
      grouped[timeKey].push(schedule);
    });

    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  };

  if (loading) {
    return <div className="loading">Loading medications...</div>;
  }

  const timeGroups = getSchedulesByTime();

  return (
    <div className="medication-tracker">
      <div className="tracker-header">
        <h2>Medication Schedule</h2>
        <div className="date-display">
          {date.toLocaleDateString([], {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
      </div>

      {timeGroups.length === 0 ? (
        <div className="empty-state">
          <PillIcon />
          <h3>No medications scheduled</h3>
          <p>All caught up for today!</p>
        </div>
      ) : (
        <div className="schedule-timeline">
          {timeGroups.map(([time, timeSchedules]) => (
            <div key={time} className="time-group">
              <div className="time-header">
                <ClockIcon />
                <span className="time-label">{time}</span>
              </div>

              <div className="medication-items">
                {timeSchedules.map(schedule => {
                  const medication = medications.find(m => m.id === schedule.medicationId);
                  if (!medication) return null;

                  return (
                    <div
                      key={schedule.id}
                      className={`medication-item ${schedule.taken ? 'taken' : ''}`}
                    >
                      <div className="medication-info">
                        <div className="medication-name">
                          {medication.name}
                        </div>
                        <div className="medication-dosage">
                          {medication.dosage.amount} {medication.dosage.unit}
                        </div>
                      </div>

                      <div className="medication-actions">
                        {!schedule.taken ? (
                          <Button
                            onClick={() => handleMedicationTaken(schedule.id, true)}
                            className="take-button"
                          >
                            <CheckIcon />
                            Take
                          </Button>
                        ) : (
                          <div className="taken-indicator">
                            <CheckCircleIcon />
                            <span>Taken at {schedule.takenTime?.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}</span>
                          </div>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMedicationTaken(schedule.id, false)}
                          disabled={schedule.taken}
                        >
                          Skip
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Adherence summary */}
      <div className="adherence-summary">
        <h3>Today's Adherence</h3>
        <div className="adherence-stats">
          <div className="stat">
            <span className="stat-value">
              {schedules.filter(s => s.taken).length}/{schedules.length}
            </span>
            <span className="stat-label">Doses Taken</span>
          </div>
          <div className="stat">
            <span className="stat-value">
              {schedules.length > 0 ?
                Math.round((schedules.filter(s => s.taken).length / schedules.length) * 100) : 0}%
            </span>
            <span className="stat-label">Adherence Rate</span>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## Medication Analysis and Effectiveness

### Effectiveness Analyzer
```tsx
function MedicationAnalyzer({ userId }: MedicationAnalyzerProps) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [effectivenessData, setEffectivenessData] = useState<MedicationEffectiveness[]>([]);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year'>('quarter');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMedicationAnalysis();
  }, [userId, timeRange]);

  const loadMedicationAnalysis = async () => {
    setLoading(true);
    try {
      const userMedications = await db.medications
        .where('userId')
        .equals(userId)
        .toArray();

      setMedications(userMedications);

      // Analyze effectiveness for each medication
      const effectiveness = await Promise.all(
        userMedications.map(med => analyzeMedicationEffectiveness(med, timeRange))
      );

      setEffectivenessData(effectiveness.flat());
    } catch (error) {
      console.error('Failed to load medication analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeMedicationEffectiveness = async (
    medication: Medication,
    timeRange: string
  ): Promise<MedicationEffectiveness[]> => {
    const endDate = new Date();
    const startDate = new Date();

    switch (timeRange) {
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
    }

    // Get symptom data for the time range
    const symptoms = await db.symptoms
      .where('timestamp')
      .between(startDate, endDate)
      .toArray();

    // Get medication schedules for adherence
    const schedules = await db.schedules
      .where('medicationId')
      .equals(medication.id)
      .and(s => s.scheduledTime >= startDate && s.scheduledTime <= endDate)
      .toArray();

    const effectiveness: MedicationEffectiveness[] = [];

    // Analyze by symptom type
    const symptomTypes = [...new Set(symptoms.map(s => s.type))];

    symptomTypes.forEach(symptomType => {
      const symptomData = symptoms.filter(s => s.type === symptomType);

      if (symptomData.length < 7) return; // Need minimum data points

      // Split data into before/after medication periods
      const medStartDate = new Date(medication.startDate);
      const beforeSymptoms = symptomData.filter(s => s.timestamp < medStartDate);
      const afterSymptoms = symptomData.filter(s => s.timestamp >= medStartDate);

      if (beforeSymptoms.length === 0 || afterSymptoms.length === 0) return;

      // Calculate average severity before and after
      const avgBefore = beforeSymptoms.reduce((sum, s) => sum + s.severity, 0) / beforeSymptoms.length;
      const avgAfter = afterSymptoms.reduce((sum, s) => sum + s.severity, 0) / afterSymptoms.length;

      // Calculate effectiveness (negative = improvement)
      const effectivenessScore = (avgBefore - avgAfter) / avgBefore;

      // Calculate confidence based on data points and variance
      const confidence = calculateConfidence(beforeSymptoms, afterSymptoms);

      effectiveness.push({
        id: generateId(),
        medicationId: medication.id,
        symptomType,
        effectiveness: Math.max(-1, Math.min(1, effectivenessScore)),
        confidence,
        timeFrame: { start: startDate, end: endDate },
        lastUpdated: new Date()
      });
    });

    return effectiveness;
  };

  const calculateConfidence = (before: SymptomLog[], after: SymptomLog[]): number => {
    const totalPoints = before.length + after.length;
    if (totalPoints < 14) return 0.3; // Low confidence with small sample

    // Calculate variance
    const allSeverities = [...before, ...after].map(s => s.severity);
    const mean = allSeverities.reduce((sum, s) => sum + s, 0) / allSeverities.length;
    const variance = allSeverities.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / allSeverities.length;
    const stdDev = Math.sqrt(variance);

    // Higher confidence with more data points and lower variance
    const dataPointFactor = Math.min(1, totalPoints / 30); // Max confidence at 30+ points
    const varianceFactor = Math.max(0.1, 1 - (stdDev / 5)); // Lower variance = higher confidence

    return Math.min(1, (dataPointFactor + varianceFactor) / 2);
  };

  const getEffectivenessColor = (score: number): string => {
    if (score <= -0.5) return 'excellent'; // Significant improvement
    if (score <= -0.2) return 'good'; // Moderate improvement
    if (score <= 0.2) return 'neutral'; // No significant change
    if (score <= 0.5) return 'concerning'; // Moderate worsening
    return 'poor'; // Significant worsening
  };

  const getEffectivenessLabel = (score: number): string => {
    if (score <= -0.5) return 'Excellent';
    if (score <= -0.2) return 'Good';
    if (score <= 0.2) return 'Neutral';
    if (score <= 0.5) return 'Concerning';
    return 'Poor';
  };

  return (
    <div className="medication-analyzer">
      <div className="analyzer-header">
        <h2>Medication Effectiveness</h2>
        <div className="time-range-selector">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
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
          <p>Analyzing medication effectiveness...</p>
        </div>
      ) : medications.length === 0 ? (
        <div className="empty-state">
          <PillIcon />
          <h3>No medications to analyze</h3>
          <p>Add medications to see effectiveness analysis</p>
        </div>
      ) : (
        <div className="effectiveness-grid">
          {medications.map(medication => {
            const medEffectiveness = effectivenessData.filter(
              e => e.medicationId === medication.id
            );

            const avgEffectiveness = medEffectiveness.length > 0 ?
              medEffectiveness.reduce((sum, e) => sum + e.effectiveness, 0) / medEffectiveness.length : 0;

            const avgConfidence = medEffectiveness.length > 0 ?
              medEffectiveness.reduce((sum, e) => sum + e.confidence, 0) / medEffectiveness.length : 0;

            return (
              <div
                key={medication.id}
                className="medication-card"
                onClick={() => setSelectedMedication(medication)}
              >
                <div className="medication-header">
                  <div className="medication-name">
                    {medication.name}
                  </div>
                  <div className="medication-dosage">
                    {medication.dosage.amount} {medication.dosage.unit}
                  </div>
                </div>

                <div className="effectiveness-summary">
                  <div className={`effectiveness-score ${getEffectivenessColor(avgEffectiveness)}`}>
                    <span className="score-label">Effectiveness</span>
                    <span className="score-value">
                      {getEffectivenessLabel(avgEffectiveness)}
                    </span>
                  </div>

                  <div className="confidence-indicator">
                    <span className="confidence-label">Confidence</span>
                    <div className="confidence-bar">
                      <div
                        className="confidence-fill"
                        style={{ width: `${avgConfidence * 100}%` }}
                      />
                    </div>
                    <span className="confidence-value">
                      {Math.round(avgConfidence * 100)}%
                    </span>
                  </div>
                </div>

                {medEffectiveness.length > 0 && (
                  <div className="symptom-breakdown">
                    <h4>By Symptom Type</h4>
                    {medEffectiveness.slice(0, 3).map(effect => (
                      <div key={effect.symptomType} className="symptom-effect">
                        <span className="symptom-name">
                          {formatSymptomType(effect.symptomType)}
                        </span>
                        <div className="effect-bar">
                          <div
                            className="effect-fill"
                            style={{
                              width: `${Math.abs(effect.effectiveness) * 100}%`,
                              backgroundColor: effect.effectiveness < 0 ? '#10b981' : '#ef4444'
                            }}
                          />
                        </div>
                        <span className="effect-value">
                          {effect.effectiveness > 0 ? '+' : ''}
                          {Math.round(effect.effectiveness * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Medication Detail Modal */}
      {selectedMedication && (
        <MedicationDetailModal
          medication={selectedMedication}
          effectiveness={effectivenessData.filter(e => e.medicationId === selectedMedication.id)}
          onClose={() => setSelectedMedication(null)}
        />
      )}
    </div>
  );
}
```

## Implementation Checklist

### Medication Logging
- [ ] Comprehensive medication database integration
- [ ] Smart medication search and selection
- [ ] Detailed dosage and frequency tracking
- [ ] Prescription information capture
- [ ] Medication history and changes tracking

### Scheduling & Reminders
- [ ] Intelligent scheduling based on frequency
- [ ] Customizable reminder notifications
- [ ] Adherence tracking and reporting
- [ ] Missed dose handling and rescheduling
- [ ] Voice-guided medication taking

### Effectiveness Analysis
- [ ] Symptom-medication correlation analysis
- [ ] Before/after effectiveness calculations
- [ ] Statistical confidence scoring
- [ ] Visual effectiveness dashboards
- [ ] Provider-ready effectiveness reports

### Safety & Interactions
- [ ] Drug interaction database integration
- [ ] Real-time interaction checking
- [ ] Side effect tracking and reporting
- [ ] Allergic reaction monitoring
- [ ] Safety alert system

### User Experience
- [ ] Touch-optimized medication logging
- [ ] Voice input for accessibility
- [ ] Emergency medication information
- [ ] Medication photo attachment
- [ ] Export medication lists for travel

### Advanced Features
- [ ] Medication cost tracking
- [ ] Insurance and prescription management
- [ ] Pharmacy integration
- [ ] Medication tapering schedules
- [ ] Research study participation

---

## Related Documents

- [Symptom Tracking](../02-symptom-tracking.md) - Symptom data for effectiveness analysis
- [Data Storage Architecture](../16-data-storage.md) - Medication data persistence
- [Privacy & Security](../18-privacy-security.md) - Medication data privacy
- [Data Import/Export](../19-data-import-export.md) - Medication history export
- [Settings](../15-settings.md) - Medication preferences and notifications

---

*Document Version: 1.0 | Last Updated: October 2025*