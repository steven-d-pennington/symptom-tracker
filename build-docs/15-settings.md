# Settings - Implementation Plan

## Overview

The Settings system provides comprehensive configuration options for the entire symptom tracker application. This feature includes user preferences, privacy controls, data management, notification settings, and system configuration. The settings are organized into logical categories with an intuitive interface that allows users to customize their experience while maintaining data privacy and security.

## Core Requirements

### User Experience Goals
- **Intuitive Organization**: Logical grouping of settings with clear navigation
- **Real-time Feedback**: Immediate preview of setting changes
- **Safe Configuration**: Validation and confirmation for critical changes
- **Accessibility**: Screen reader support and keyboard navigation
- **Progressive Disclosure**: Advanced options hidden until needed

### Technical Goals
- **Persistent Storage**: Secure local storage of user preferences
- **Validation**: Input validation and conflict detection
- **Synchronization**: Cross-device settings synchronization
- **Backup/Restore**: Settings export and import capabilities
- **Audit Trail**: Change history for critical settings

## System Architecture

### Data Model
```typescript
interface UserSettings {
  id: string;
  userId: string;
  version: string;
  lastModified: Date;
  categories: SettingsCategory[];
}

interface SettingsCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  sections: SettingsSection[];
  order: number;
}

interface SettingsSection {
  id: string;
  name: string;
  description: string;
  fields: SettingsField[];
  order: number;
  requiresRestart?: boolean;
  requiresConfirmation?: boolean;
}

interface SettingsField {
  id: string;
  type: FieldType;
  name: string;
  description: string;
  value: any;
  defaultValue: any;
  validation?: ValidationRule[];
  dependencies?: Dependency[];
  options?: FieldOption[];
  advanced?: boolean;
  requiresRestart?: boolean;
  lastModified?: Date;
}

type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'boolean'
  | 'select'
  | 'multi-select'
  | 'date'
  | 'time'
  | 'color'
  | 'file'
  | 'password'
  | 'email'
  | 'url'
  | 'range'
  | 'radio'
  | 'checkbox-group';

interface ValidationRule {
  type: ValidationType;
  value?: any;
  message: string;
}

type ValidationType =
  | 'required'
  | 'min'
  | 'max'
  | 'minLength'
  | 'maxLength'
  | 'pattern'
  | 'email'
  | 'url'
  | 'custom';

interface Dependency {
  fieldId: string;
  condition: 'equals' | 'not-equals' | 'contains' | 'greater-than' | 'less-than';
  value: any;
  action: 'show' | 'hide' | 'enable' | 'disable' | 'set-value';
}

interface FieldOption {
  value: any;
  label: string;
  description?: string;
  icon?: string;
  disabled?: boolean;
}

interface SettingsPreset {
  id: string;
  name: string;
  description: string;
  category: 'beginner' | 'intermediate' | 'advanced' | 'custom';
  settings: Record<string, any>;
  isDefault: boolean;
  createdBy: string;
  usageCount: number;
}

interface SettingsChange {
  id: string;
  userId: string;
  fieldId: string;
  oldValue: any;
  newValue: any;
  timestamp: Date;
  source: 'user' | 'auto' | 'import' | 'reset';
  requiresRestart: boolean;
}

interface SettingsBackup {
  id: string;
  userId: string;
  name: string;
  description?: string;
  settings: UserSettings;
  createdAt: Date;
  version: string;
  size: number;
}

interface SettingsSync {
  id: string;
  userId: string;
  deviceId: string;
  lastSync: Date;
  syncStatus: 'pending' | 'in-progress' | 'completed' | 'failed';
  changesCount: number;
  conflicts: SettingsConflict[];
}

interface SettingsConflict {
  fieldId: string;
  localValue: any;
  remoteValue: any;
  lastModified: Date;
  resolution?: 'local' | 'remote' | 'merge' | 'manual';
}
```

### Component Architecture
```
SettingsSystem/
├── SettingsDashboard.tsx               # Main settings interface
├── SettingsCategory.tsx                # Category navigation and display
├── SettingsField.tsx                   # Individual setting field components
├── SettingsValidation.tsx              # Input validation system
├── SettingsPresets.tsx                 # Preset configurations
├── SettingsBackup.tsx                  # Backup and restore functionality
├── SettingsSync.tsx                    # Cross-device synchronization
├── SettingsSearch.tsx                  # Settings search and discovery
├── SettingsAudit.tsx                   # Change history and audit trail
└── SettingsImportExport.tsx            # Settings data import/export
```

## Settings Dashboard Implementation

### Main Settings Component
```tsx
function SettingsDashboard({ userId }: SettingsDashboardProps) {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [currentCategory, setCurrentCategory] = useState<string>('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSettings, setFilteredSettings] = useState<UserSettings | null>(null);

  useEffect(() => {
    loadSettings();
  }, [userId]);

  useEffect(() => {
    if (settings && searchQuery) {
      setFilteredSettings(filterSettings(settings, searchQuery));
    } else {
      setFilteredSettings(settings);
    }
  }, [settings, searchQuery]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const userSettings = await loadUserSettings(userId);
      setSettings(userSettings);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (fieldId: string, value: any) => {
    if (!settings) return;

    const updatedSettings = updateSettingValue(settings, fieldId, value);
    setSettings(updatedSettings);
    setHasUnsavedChanges(true);

    // Auto-save for non-critical settings
    const field = findFieldById(settings, fieldId);
    if (field && !field.requiresRestart) {
      debouncedAutoSave(updatedSettings);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      await saveUserSettings(userId, settings);
      setHasUnsavedChanges(false);

      // Log setting changes for audit
      await logSettingsChanges(userId, settings);

      // Check if restart is required
      const requiresRestart = checkRequiresRestart(settings);
      if (requiresRestart) {
        showRestartNotification();
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefaults = async () => {
    if (!confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) {
      return;
    }

    try {
      const defaultSettings = await loadDefaultSettings();
      setSettings(defaultSettings);
      setHasUnsavedChanges(true);
    } catch (error) {
      console.error('Failed to reset settings:', error);
    }
  };

  const handleApplyPreset = async (preset: SettingsPreset) => {
    try {
      const presetSettings = await applySettingsPreset(userId, preset);
      setSettings(presetSettings);
      setHasUnsavedChanges(true);
    } catch (error) {
      console.error('Failed to apply preset:', error);
    }
  };

  const handleExportSettings = async () => {
    try {
      const exportData = await exportSettings(settings!);
      downloadFile(exportData, `settings-backup-${new Date().toISOString().split('T')[0]}.json`);
    } catch (error) {
      console.error('Failed to export settings:', error);
    }
  };

  const handleImportSettings = async (file: File) => {
    try {
      const importedSettings = await importSettings(file);
      // Validate imported settings
      const validatedSettings = await validateImportedSettings(importedSettings);
      setSettings(validatedSettings);
      setHasUnsavedChanges(true);
    } catch (error) {
      console.error('Failed to import settings:', error);
    }
  };

  if (loading) {
    return (
      <div className="settings-loading">
        <Spinner />
        <p>Loading settings...</p>
      </div>
    );
  }

  if (!filteredSettings) {
    return (
      <div className="settings-error">
        <AlertIcon />
        <h3>Failed to load settings</h3>
        <Button onClick={loadSettings}>Retry</Button>
      </div>
    );
  }

  const currentCategoryData = filteredSettings.categories.find(
    cat => cat.id === currentCategory
  );

  return (
    <div className="settings-dashboard">
      {/* Header */}
      <div className="settings-header">
        <div className="header-title">
          <h1>Settings</h1>
          <p>Customize your symptom tracker experience</p>
        </div>

        <div className="header-actions">
          <div className="search-container">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search settings..."
            />
          </div>

          <Button
            variant="outline"
            onClick={() => setShowPresets(true)}
          >
            <PresetIcon />
            Presets
          </Button>

          <Button
            variant="outline"
            onClick={handleExportSettings}
          >
            <DownloadIcon />
            Export
          </Button>

          <Button
            variant="outline"
            onClick={() => setShowImport(true)}
          >
            <UploadIcon />
            Import
          </Button>

          <Button
            variant="outline"
            onClick={handleResetToDefaults}
            disabled={saving}
          >
            <ResetIcon />
            Reset
          </Button>

          <Button
            onClick={handleSaveSettings}
            disabled={!hasUnsavedChanges || saving}
          >
            {saving ? <Spinner /> : <SaveIcon />}
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Unsaved Changes Warning */}
      {hasUnsavedChanges && (
        <div className="unsaved-changes-warning">
          <AlertTriangleIcon />
          <span>You have unsaved changes. Don't forget to save!</span>
        </div>
      )}

      {/* Main Content */}
      <div className="settings-content">
        {/* Sidebar Navigation */}
        <div className="settings-sidebar">
          <SettingsNavigation
            categories={filteredSettings.categories}
            currentCategory={currentCategory}
            onCategoryChange={setCurrentCategory}
            searchQuery={searchQuery}
          />
        </div>

        {/* Settings Content */}
        <div className="settings-main">
          {currentCategoryData ? (
            <SettingsCategory
              category={currentCategoryData}
              onSettingChange={handleSettingChange}
              searchQuery={searchQuery}
            />
          ) : (
            <div className="no-category">
              <p>Select a category to view settings</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showPresets && (
        <SettingsPresetsModal
          onClose={() => setShowPresets(false)}
          onApplyPreset={handleApplyPreset}
        />
      )}

      {showImport && (
        <SettingsImportModal
          onClose={() => setShowImport(false)}
          onImport={handleImportSettings}
        />
      )}
    </div>
  );
}
```

### Settings Categories Implementation
```tsx
function SettingsCategory({ category, onSettingChange, searchQuery }: SettingsCategoryProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const filteredSections = category.sections.filter(section =>
    !searchQuery ||
    section.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.fields.some(field =>
      field.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      field.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="settings-category">
      {/* Category Header */}
      <div className="category-header">
        <div className="category-icon">
          <Icon name={category.icon} />
        </div>
        <div className="category-info">
          <h2>{category.name}</h2>
          <p>{category.description}</p>
        </div>
      </div>

      {/* Sections */}
      <div className="category-sections">
        {filteredSections.map(section => (
          <div key={section.id} className="settings-section">
            <div
              className="section-header"
              onClick={() => toggleSection(section.id)}
            >
              <div className="section-title">
                <h3>{section.name}</h3>
                <p>{section.description}</p>
              </div>
              <div className="section-controls">
                {section.requiresRestart && (
                  <Badge variant="warning">Requires Restart</Badge>
                )}
                <Button variant="ghost" size="sm">
                  {expandedSections.has(section.id) ? <ChevronUpIcon /> : <ChevronDownIcon />}
                </Button>
              </div>
            </div>

            {expandedSections.has(section.id) && (
              <div className="section-content">
                {section.fields.map(field => (
                  <SettingsField
                    key={field.id}
                    field={field}
                    onChange={(value) => onSettingChange(field.id, value)}
                    searchQuery={searchQuery}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Settings Field Component
```tsx
function SettingsField({ field, onChange, searchQuery }: SettingsFieldProps) {
  const [value, setValue] = useState(field.value);
  const [errors, setErrors] = useState<string[]>([]);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    setValue(field.value);
  }, [field.value]);

  const handleChange = (newValue: any) => {
    setValue(newValue);
    setTouched(true);

    // Validate input
    const validationErrors = validateField(newValue, field.validation || []);
    setErrors(validationErrors);

    // Only propagate valid changes
    if (validationErrors.length === 0) {
      onChange(newValue);
    }
  };

  const validateField = (value: any, rules: ValidationRule[]): string[] => {
    const errors: string[] = [];

    for (const rule of rules) {
      switch (rule.type) {
        case 'required':
          if (!value || (typeof value === 'string' && value.trim() === '')) {
            errors.push(rule.message);
          }
          break;
        case 'min':
          if (typeof value === 'number' && value < rule.value) {
            errors.push(rule.message);
          }
          break;
        case 'max':
          if (typeof value === 'number' && value > rule.value) {
            errors.push(rule.message);
          }
          break;
        case 'minLength':
          if (typeof value === 'string' && value.length < rule.value) {
            errors.push(rule.message);
          }
          break;
        case 'maxLength':
          if (typeof value === 'string' && value.length > rule.value) {
            errors.push(rule.message);
          }
          break;
        case 'pattern':
          if (typeof value === 'string' && !new RegExp(rule.value).test(value)) {
            errors.push(rule.message);
          }
          break;
        case 'email':
          if (typeof value === 'string' && !isValidEmail(value)) {
            errors.push(rule.message);
          }
          break;
        case 'url':
          if (typeof value === 'string' && !isValidUrl(value)) {
            errors.push(rule.message);
          }
          break;
      }
    }

    return errors;
  };

  const renderField = () => {
    const commonProps = {
      value,
      onChange: handleChange,
      onBlur: () => setTouched(true),
      disabled: field.disabled,
      'aria-label': field.name,
      'aria-describedby': errors.length > 0 ? `${field.id}-error` : undefined
    };

    switch (field.type) {
      case 'text':
        return (
          <TextInput
            {...commonProps}
            placeholder={field.placeholder}
            maxLength={field.maxLength}
          />
        );

      case 'textarea':
        return (
          <TextArea
            {...commonProps}
            placeholder={field.placeholder}
            rows={field.rows || 3}
            maxLength={field.maxLength}
          />
        );

      case 'number':
        return (
          <NumberInput
            {...commonProps}
            min={field.min}
            max={field.max}
            step={field.step || 1}
          />
        );

      case 'boolean':
        return (
          <Switch
            {...commonProps}
            checked={value}
          />
        );

      case 'select':
        return (
          <Select {...commonProps}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'multi-select':
        return (
          <MultiSelect
            {...commonProps}
            options={field.options || []}
            value={value || []}
          />
        );

      case 'range':
        return (
          <RangeSlider
            {...commonProps}
            min={field.min}
            max={field.max}
            step={field.step || 1}
          />
        );

      case 'color':
        return (
          <ColorPicker
            {...commonProps}
            value={value}
          />
        );

      case 'date':
        return (
          <DatePicker
            {...commonProps}
            value={value ? new Date(value) : null}
          />
        );

      case 'time':
        return (
          <TimePicker
            {...commonProps}
            value={value}
          />
        );

      case 'radio':
        return (
          <RadioGroup {...commonProps}>
            {field.options?.map(option => (
              <RadioGroupItem
                key={option.value}
                value={option.value}
                label={option.label}
              />
            ))}
          </RadioGroup>
        );

      case 'checkbox-group':
        return (
          <CheckboxGroup {...commonProps}>
            {field.options?.map(option => (
              <Checkbox
                key={option.value}
                value={option.value}
                label={option.label}
                checked={value?.includes(option.value)}
              />
            ))}
          </CheckboxGroup>
        );

      default:
        return <div>Unsupported field type: {field.type}</div>;
    }
  };

  // Highlight search matches
  const highlightText = (text: string) => {
    if (!searchQuery) return text;

    const regex = new RegExp(`(${searchQuery})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="search-highlight">{part}</mark>
      ) : part
    );
  };

  return (
    <div className={`settings-field ${field.advanced ? 'advanced' : ''}`}>
      <div className="field-header">
        <label htmlFor={field.id} className="field-label">
          {highlightText(field.name)}
          {field.required && <span className="required">*</span>}
        </label>
        {field.description && (
          <p className="field-description">
            {highlightText(field.description)}
          </p>
        )}
      </div>

      <div className="field-input">
        {renderField()}
      </div>

      {errors.length > 0 && touched && (
        <div id={`${field.id}-error`} className="field-errors">
          {errors.map((error, index) => (
            <div key={index} className="error-message">
              <AlertCircleIcon />
              {error}
            </div>
          ))}
        </div>
      )}

      {field.lastModified && (
        <div className="field-last-modified">
          Last modified: {field.lastModified.toLocaleDateString()}
        </div>
      )}
    </div>
  );
}
```

## Settings Categories Structure

### General Settings
- **Profile**: Name, avatar, timezone, language
- **Appearance**: Theme, font size, color scheme, layout preferences
- **Notifications**: Push notifications, email alerts, sound preferences
- **Privacy**: Data sharing, analytics opt-in, visibility settings

### Health Tracking Settings
- **Symptom Tracking**: Default severity scale, custom symptoms, tracking frequency
- **Medication Management**: Reminder settings, interaction warnings, dosage tracking
- **Trigger Logging**: Default categories, automatic detection, correlation settings
- **Data Entry**: Quick entry options, smart defaults, validation rules

### Data Management Settings
- **Storage**: Local storage limits, auto-cleanup, backup frequency
- **Export**: Default formats, scheduled exports, data ranges
- **Import**: Data validation, conflict resolution, merge strategies
- **Backup**: Automatic backups, cloud sync, recovery options

### Analysis & Reports Settings
- **Analytics**: Analysis frequency, insight preferences, trend detection
- **Reports**: Default templates, auto-generation, sharing permissions
- **Visualization**: Chart preferences, color schemes, data display options
- **Alerts**: Threshold settings, anomaly detection, prediction preferences

### Security & Privacy Settings
- **Authentication**: Password requirements, two-factor auth, session management
- **Data Encryption**: Encryption settings, key management, secure deletion
- **Access Control**: Sharing permissions, data visibility, audit logging
- **Compliance**: HIPAA settings, data retention, legal requirements

### Advanced Settings
- **Performance**: Caching options, background sync, resource limits
- **Integration**: API access, third-party connections, webhook settings
- **Debugging**: Logging levels, error reporting, diagnostic tools
- **Experimental**: Beta features, A/B testing, advanced options

## Implementation Checklist

### Core Settings Framework
- [ ] Hierarchical settings structure with categories and sections
- [ ] Dynamic field types with validation and dependencies
- [ ] Real-time validation and error handling
- [ ] Settings persistence with IndexedDB
- [ ] Change detection and auto-save functionality

### User Interface
- [ ] Intuitive navigation with search and filtering
- [ ] Progressive disclosure for advanced options
- [ ] Responsive design for mobile and desktop
- [ ] Accessibility support with ARIA labels and keyboard navigation
- [ ] Contextual help and tooltips

### Data Management
- [ ] Settings export and import with validation
- [ ] Preset configurations for different user types
- [ ] Backup and restore functionality
- [ ] Cross-device synchronization
- [ ] Settings version control and migration

### Validation & Security
- [ ] Input validation with custom rules
- [ ] Secure storage of sensitive settings
- [ ] Audit trail for critical setting changes
- [ ] Confirmation dialogs for destructive actions
- [ ] Settings integrity verification

### Advanced Features
- [ ] Conditional field visibility based on dependencies
- [ ] Settings recommendations based on usage patterns
- [ ] Bulk settings operations and templates
- [ ] Settings comparison and diff viewing
- [ ] Automated settings optimization

---

## Related Documents

- [Data Storage Architecture](../16-data-storage.md) - Settings data persistence
- [Privacy & Security](../18-privacy-security.md) - Settings security measures
- [Data Import/Export](../19-data-import-export.md) - Settings backup/restore
- [PWA Infrastructure](../17-pwa-infrastructure.md) - Settings synchronization
- [Onboarding](../01-onboarding.md) - Initial settings configuration

---

*Document Version: 1.0 | Last Updated: October 2025*