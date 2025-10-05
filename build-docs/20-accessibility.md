# Accessibility - Implementation Plan

## Overview

The Pocket Symptom Tracker implements comprehensive accessibility features to ensure the application is usable by people with disabilities. Following WCAG 2.1 AA guidelines, the app provides multiple ways to access all functionality and accommodates various assistive technologies.

## Core Accessibility Principles

### Perceivable
- **Text Alternatives**: All non-text content has text alternatives
- **Adaptable**: Content can be presented in different ways without losing meaning
- **Distinguishable**: Content is easily distinguishable from surroundings

### Operable
- **Keyboard Accessible**: All functionality available via keyboard
- **Enough Time**: Users have sufficient time to read and use content
- **Seizure Safe**: No content causes seizures
- **Navigable**: Easy to navigate and find content

### Understandable
- **Readable**: Text is readable and understandable
- **Predictable**: Interface behaves predictably
- **Input Assistance**: Help users avoid and correct mistakes

### Robust
- **Compatible**: Works with current and future assistive technologies

## Screen Reader Support

### ARIA Implementation
```typescript
// Symptom severity slider with screen reader support
function SeveritySlider({ value, onChange, label }: SeveritySliderProps) {
  const sliderRef = useRef<HTMLInputElement>(null);
  const [announcedValue, setAnnouncedValue] = useState(value);

  useEffect(() => {
    // Announce value changes to screen readers
    if (announcedValue !== value) {
      announceToScreenReader(`Severity set to ${value} out of 10`);
      setAnnouncedValue(value);
    }
  }, [value, announcedValue]);

  return (
    <div className="severity-slider">
      <Label htmlFor="severity-slider" id="severity-label">
        {label}
      </Label>

      <div className="slider-container">
        <input
          ref={sliderRef}
          id="severity-slider"
          type="range"
          min="1"
          max="10"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          aria-labelledby="severity-label"
          aria-valuemin={1}
          aria-valuemax={10}
          aria-valuenow={value}
          aria-valuetext={`Severity level ${value} out of 10`}
          aria-describedby="severity-description"
        />

        <div className="severity-markers">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => (
            <button
              key={level}
              type="button"
              className="severity-marker"
              onClick={() => onChange(level)}
              aria-label={`Set severity to ${level}`}
              tabIndex={-1} // Focus managed by slider
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      <div id="severity-description" className="sr-only">
        Use the slider or click on numbers 1 through 10 to set symptom severity.
        1 is mild, 10 is severe.
      </div>

      <output
        htmlFor="severity-slider"
        aria-live="polite"
        aria-atomic="true"
      >
        Current severity: {value}/10
      </output>
    </div>
  );
}

// Screen reader announcement utility
function announceToScreenReader(message: string) {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'assertive');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}
```

### Semantic HTML Structure
```tsx
function SymptomEntryForm() {
  return (
    <form
      role="form"
      aria-labelledby="form-title"
      noValidate
    >
      <header>
        <h1 id="form-title">Log Symptom</h1>
        <p id="form-description">
          Record details about your symptom experience
        </p>
      </header>

      <fieldset>
        <legend>Symptom Details</legend>

        <div className="form-group">
          <Label htmlFor="symptom-name">Symptom Name</Label>
          <Input
            id="symptom-name"
            type="text"
            required
            aria-describedby="symptom-name-help"
            aria-invalid={hasError('name')}
          />
          <div id="symptom-name-help" className="form-help">
            Enter the name of the symptom you're experiencing
          </div>
          {hasError('name') && (
            <div role="alert" aria-live="polite" className="error-message">
              {getError('name')}
            </div>
          )}
        </div>

        <SeveritySlider
          label="Severity Level"
          value={severity}
          onChange={setSeverity}
        />

        <div className="form-group">
          <Label htmlFor="symptom-location">Location on Body</Label>
          <select
            id="symptom-location"
            aria-describedby="location-help"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          >
            <option value="">Select location...</option>
            <option value="head">Head</option>
            <option value="neck">Neck</option>
            <option value="chest">Chest</option>
            {/* ... more options */}
          </select>
          <div id="location-help" className="form-help">
            Select where on your body you're experiencing this symptom
          </div>
        </div>
      </fieldset>

      <div className="form-actions">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!isValid}>
          Save Symptom
        </Button>
      </div>
    </form>
  );
}
```

## Keyboard Navigation

### Focus Management
```typescript
class FocusManager {
  private focusStack: HTMLElement[] = [];

  // Trap focus within modal dialogs
  setupFocusTrap(container: HTMLElement) {
    const focusableElements = this.getFocusableElements(container);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.closeModal(container);
      }
    };

    container.addEventListener('keydown', handleTabKey);
    container.addEventListener('keydown', handleEscapeKey);

    // Focus first element
    firstElement.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
      container.removeEventListener('keydown', handleEscapeKey);
    };
  }

  // Manage focus when opening/closing panels
  managePanelFocus(panel: HTMLElement, trigger: HTMLElement) {
    this.focusStack.push(document.activeElement as HTMLElement);

    const cleanup = this.setupFocusTrap(panel);

    // Restore focus when panel closes
    const restoreFocus = () => {
      cleanup();
      const previousElement = this.focusStack.pop();
      if (previousElement) {
        previousElement.focus();
      } else {
        trigger.focus();
      }
    };

    return restoreFocus;
  }

  private getFocusableElements(container: HTMLElement): HTMLElement[] {
    const selectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ];

    return Array.from(
      container.querySelectorAll(selectors.join(', '))
    ) as HTMLElement[];
  }
}

// Skip link for keyboard users
function SkipLink() {
  return (
    <a
      href="#main-content"
      className="skip-link"
      onFocus={(e) => e.target.style.display = 'block'}
      onBlur={(e) => e.target.style.display = 'none'}
    >
      Skip to main content
    </a>
  );
}
```

### Keyboard Shortcuts
```typescript
class KeyboardShortcuts {
  private shortcuts = new Map<string, () => void>();

  constructor() {
    this.setupDefaultShortcuts();
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  registerShortcut(key: string, callback: () => void, description: string) {
    this.shortcuts.set(key, callback);

    // Store for help display
    this.shortcutDescriptions.set(key, description);
  }

  private setupDefaultShortcuts() {
    // Navigation shortcuts
    this.registerShortcut('g h', () => this.navigateTo('home'), 'Go to Home');
    this.registerShortcut('g j', () => this.navigateTo('journal'), 'Go to Journal');
    this.registerShortcut('g l', () => this.navigateTo('log'), 'Go to Log Symptom');

    // Action shortcuts
    this.registerShortcut('n', () => this.newEntry(), 'New Entry');
    this.registerShortcut('s', () => this.saveEntry(), 'Save Entry');
    this.registerShortcut('/', () => this.focusSearch(), 'Focus Search');

    // Help
    this.registerShortcut('?', () => this.showShortcuts(), 'Show Keyboard Shortcuts');
  }

  private handleKeyDown(event: KeyboardEvent) {
    // Don't trigger shortcuts when user is typing in inputs
    if (this.isTypingInInput(event.target as HTMLElement)) {
      return;
    }

    const key = this.getKeyString(event);

    if (this.shortcuts.has(key)) {
      event.preventDefault();
      this.shortcuts.get(key)!();
    }
  }

  private getKeyString(event: KeyboardEvent): string {
    const parts = [];

    if (event.ctrlKey || event.metaKey) parts.push('ctrl');
    if (event.altKey) parts.push('alt');
    if (event.shiftKey) parts.push('shift');

    parts.push(event.key.toLowerCase());

    return parts.join('+');
  }

  private isTypingInInput(element: HTMLElement): boolean {
    const tagName = element.tagName.toLowerCase();
    const contentEditable = element.contentEditable === 'true';

    return tagName === 'input' ||
           tagName === 'textarea' ||
           tagName === 'select' ||
           contentEditable;
  }
}
```

## Visual Accessibility

### High Contrast Support
```css
/* High contrast theme variables */
:root {
  --text-color: #000000;
  --background-color: #ffffff;
  --border-color: #000000;
  --focus-color: #0066cc;
  --error-color: #cc0000;
}

/* High contrast mode detection */
@media (prefers-contrast: high) {
  :root {
    --text-color: #ffffff;
    --background-color: #000000;
    --border-color: #ffffff;
    --focus-color: #ffff00;
    --error-color: #ff6b6b;
  }
}

/* Focus indicators */
.focus-indicator {
  outline: 2px solid var(--focus-color);
  outline-offset: 2px;
}

.focus-indicator:focus-visible {
  outline: 3px solid var(--focus-color);
  outline-offset: 3px;
}

/* High contrast buttons */
.button-high-contrast {
  background-color: var(--background-color);
  color: var(--text-color);
  border: 2px solid var(--border-color);
  font-weight: bold;
}

.button-high-contrast:hover,
.button-high-contrast:focus {
  background-color: var(--text-color);
  color: var(--background-color);
}
```

### Color Blindness Support
```typescript
// Color blindness simulation and testing
class ColorAccessibility {
  // Test color combinations for accessibility
  testColorContrast(foreground: string, background: string): ContrastResult {
    const contrast = this.calculateContrastRatio(foreground, background);

    return {
      ratio: contrast,
      aa: contrast >= 4.5,
      aaa: contrast >= 7,
      largeTextAA: contrast >= 3,
      largeTextAAA: contrast >= 4.5
    };
  }

  // Color palette designed for accessibility
  getAccessibleColorPalette(): ColorPalette {
    return {
      primary: '#0066cc',      // Blue with good contrast
      secondary: '#666666',    // Gray for secondary elements
      success: '#228b22',      // Green, distinguishable from red
      warning: '#ff8c00',      // Orange, distinguishable from green/red
      error: '#cc0000',       // Red, high contrast
      info: '#0066cc',        // Same as primary for consistency

      // Severity colors (designed for color blindness)
      severity: {
        1: '#e6f3ff',   // Very light blue
        2: '#cce7ff',   // Light blue
        3: '#99ceff',   // Medium light blue
        4: '#66b3ff',   // Medium blue
        5: '#3399ff',   // Blue
        6: '#0080ff',   // Darker blue
        7: '#0066cc',   // Dark blue
        8: '#005299',   // Very dark blue
        9: '#003d66',   // Very very dark blue
        10: '#00264d'   // Darkest blue
      }
    };
  }

  // Provide text labels for color-coded elements
  getColorLabel(colorKey: string): string {
    const labels = {
      'severity-1': 'Very mild (1/10)',
      'severity-5': 'Moderate (5/10)',
      'severity-10': 'Very severe (10/10)',
      'success': 'Success',
      'warning': 'Warning',
      'error': 'Error'
    };

    return labels[colorKey] || colorKey;
  }

  private calculateContrastRatio(color1: string, color2: string): number {
    const l1 = this.getLuminance(color1);
    const l2 = this.getLuminance(color2);

    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
  }

  private getLuminance(color: string): number {
    // Convert hex to RGB, then to relative luminance
    const rgb = this.hexToRgb(color);
    const rsRGB = rgb.r / 255;
    const gsRGB = rgb.g / 255;
    const bsRGB = rgb.b / 255;

    const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }
}
```

### Motion and Animation

```typescript
class MotionManager {
  // Respect user's motion preferences
  private prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Apply motion preferences to animations
  applyMotionPreferences() {
    if (this.prefersReducedMotion) {
      this.disableAnimations();
    } else {
      this.enableAnimations();
    }

    // Listen for changes
    window.matchMedia('(prefers-reduced-motion: reduce)')
      .addEventListener('change', (e) => {
        if (e.matches) {
          this.disableAnimations();
        } else {
          this.enableAnimations();
        }
      });
  }

  private disableAnimations() {
    document.documentElement.style.setProperty('--animation-duration', '0s');
    document.documentElement.style.setProperty('--transition-duration', '0s');
  }

  private enableAnimations() {
    document.documentElement.style.setProperty('--animation-duration', '0.3s');
    document.documentElement.style.setProperty('--transition-duration', '0.2s');
  }

  // Provide animation alternatives for screen readers
  announceMotion(text: string) {
    if (!this.prefersReducedMotion) {
      announceToScreenReader(text);
    }
  }
}

// Accessible loading spinner
function AccessibleSpinner({ size = 'medium', label = 'Loading' }: SpinnerProps) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className="spinner-container"
    >
      {!prefersReducedMotion ? (
        <div
          className={`spinner spinner-${size}`}
          aria-hidden="true"
        />
      ) : (
        <div aria-hidden="true">⟳</div>
      )}
      <span className="sr-only">{label}</span>
    </div>
  );
}
```

## Cognitive Accessibility

### Simplified Interface
```typescript
// Progressive disclosure for complex forms
function ProgressiveForm({ steps }: ProgressiveFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const nextStep = () => {
    setCompletedSteps(prev => new Set([...prev, currentStep]));
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  return (
    <div className="progressive-form">
      {/* Progress indicator */}
      <div role="progressbar" aria-valuenow={currentStep + 1} aria-valuemax={steps.length}>
        Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
      </div>

      {/* Step content */}
      <div className="step-content">
        {steps[currentStep].component}
      </div>

      {/* Navigation */}
      <div className="step-navigation">
        <Button
          onClick={prevStep}
          disabled={currentStep === 0}
          aria-label="Previous step"
        >
          Previous
        </Button>

        <Button
          onClick={nextStep}
          disabled={currentStep === steps.length - 1}
          aria-label="Next step"
        >
          Next
        </Button>
      </div>

      {/* Step overview for cognitive support */}
      <details className="step-overview">
        <summary>All Steps</summary>
        <ol>
          {steps.map((step, index) => (
            <li key={index} className={completedSteps.has(index) ? 'completed' : ''}>
              {step.title}
            </li>
          ))}
        </ol>
      </details>
    </div>
  );
}

// Error prevention and recovery
class ErrorHandler {
  preventCommonErrors(formData: any): ValidationResult {
    const suggestions: string[] = [];

    // Check for common mistakes
    if (formData.severity > 10) {
      suggestions.push('Severity cannot be higher than 10. Did you mean to enter a different value?');
    }

    if (formData.dateLogged > new Date()) {
      suggestions.push('Cannot log symptoms for future dates. Please select today or a past date.');
    }

    if (formData.symptoms?.length === 0) {
      suggestions.push('Consider adding at least one symptom to make this entry more useful.');
    }

    return {
      isValid: suggestions.length === 0,
      suggestions
    };
  }

  provideHelpfulErrors(errors: string[]): string[] {
    return errors.map(error => {
      // Convert technical errors to user-friendly messages
      switch (error) {
        case 'severity_required':
          return 'Please rate how severe this symptom feels to you on a scale of 1-10.';
        case 'name_required':
          return 'What symptom are you experiencing? This helps track patterns over time.';
        default:
          return error;
      }
    });
  }
}
```

## Assistive Technology Integration

### Voice Control Support
```typescript
class VoiceControl {
  private recognition: SpeechRecognition | null = null;

  initializeVoiceControl() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();

      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = this.handleVoiceResult.bind(this);
      this.recognition.onerror = this.handleVoiceError.bind(this);
    }
  }

  startListening() {
    if (this.recognition) {
      this.recognition.start();
      announceToScreenReader('Voice control activated. Try saying "log headache severity 7"');
    }
  }

  private handleVoiceResult(event: SpeechRecognitionEvent) {
    const transcript = event.results[0][0].transcript.toLowerCase();

    // Parse voice commands
    if (transcript.includes('log') && transcript.includes('severity')) {
      const symptomMatch = transcript.match(/log (\w+) severity (\d+)/);
      if (symptomMatch) {
        const [, symptom, severity] = symptomMatch;
        this.logSymptomByVoice(symptom, parseInt(severity));
      }
    }
  }

  private async logSymptomByVoice(symptomName: string, severity: number) {
    // Create symptom entry from voice command
    const symptom = {
      name: symptomName,
      severity: Math.max(1, Math.min(10, severity)), // Clamp to valid range
      dateLogged: new Date(),
      source: 'voice'
    };

    await this.saveSymptom(symptom);
    announceToScreenReader(`Logged ${symptomName} with severity ${severity}`);
  }
}
```

## Testing and Validation

### Accessibility Testing Suite
```typescript
class AccessibilityTester {
  async runAccessibilityTests(): Promise<TestResults> {
    const results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      issues: [] as AccessibilityIssue[]
    };

    // Automated tests
    results.issues.push(...await this.testColorContrast());
    results.issues.push(...await this.testKeyboardNavigation());
    results.issues.push(...await this.testScreenReaderSupport());
    results.issues.push(...await this.testFocusManagement());

    // Calculate results
    results.passed = results.issues.filter(i => i.severity === 'pass').length;
    results.failed = results.issues.filter(i => i.severity === 'fail').length;
    results.warnings = results.issues.filter(i => i.severity === 'warning').length;

    return results;
  }

  private async testColorContrast(): Promise<AccessibilityIssue[]> {
    const issues: AccessibilityIssue[] = [];
    const elements = document.querySelectorAll('*');

    for (const element of elements) {
      const style = window.getComputedStyle(element);
      const foreground = style.color;
      const background = style.backgroundColor;

      if (foreground && background && background !== 'rgba(0, 0, 0, 0)') {
        const contrast = this.calculateContrast(foreground, background);

        if (contrast < 4.5) {
          issues.push({
            type: 'color_contrast',
            severity: 'fail',
            element: element,
            message: `Contrast ratio ${contrast.toFixed(2)} is below 4.5:1`,
            suggestion: 'Increase contrast between text and background colors'
          });
        }
      }
    }

    return issues;
  }

  private async testKeyboardNavigation(): Promise<AccessibilityIssue[]> {
    // Simulate keyboard navigation
    const issues: AccessibilityIssue[] = [];

    // Test tab order
    const focusableElements = this.getFocusableElements(document.body);
    const tabOrder = await this.simulateTabNavigation(focusableElements);

    if (!this.isLogicalTabOrder(tabOrder)) {
      issues.push({
        type: 'keyboard_navigation',
        severity: 'warning',
        message: 'Tab order may not be logical',
        suggestion: 'Ensure tab order follows visual layout'
      });
    }

    return issues;
  }
}
```

## Implementation Checklist

### Screen Reader Support
- [ ] ARIA labels and descriptions for all interactive elements
- [ ] Semantic HTML structure throughout the application
- [ ] Screen reader announcements for dynamic content changes
- [ ] Form validation messages accessible to screen readers
- [ ] Skip links for keyboard navigation

### Keyboard Accessibility
- [ ] All functionality accessible via keyboard
- [ ] Logical tab order through all interfaces
- [ ] Keyboard shortcuts for common actions
- [ ] Focus management for modals and dynamic content
- [ ] Visible focus indicators

### Visual Accessibility
- [ ] High contrast mode support
- [ ] Color blindness friendly color palette
- [ ] Sufficient color contrast ratios (4.5:1 minimum)
- [ ] Respect user's motion preferences
- [ ] Scalable text and interface elements

### Cognitive Accessibility
- [ ] Progressive disclosure for complex tasks
- [ ] Clear, simple language throughout
- [ ] Consistent navigation patterns
- [ ] Error prevention and helpful error messages
- [ ] Optional simplified interface modes

### Assistive Technology
- [ ] Voice control support for common actions
- [ ] Braille display compatibility
- [ ] Switch device accessibility
- [ ] Alternative input method support
- [ ] Integration with popular screen readers

### Testing & Compliance
- [ ] Automated accessibility testing in CI/CD
- [ ] Manual testing with assistive technologies
- [ ] WCAG 2.1 AA compliance validation
- [ ] User testing with people with disabilities
- [ ] Accessibility audit reports

---

## Related Documents

- [Settings & Customization](../14-settings-customization.md) - Accessibility preferences
- [PWA Infrastructure](../17-pwa-infrastructure.md) - Offline accessibility
- [Privacy & Security](../18-privacy-security.md) - Accessible security features
- [Data Import/Export](../19-data-import-export.md) - Accessible data management

---

*Document Version: 1.0 | Last Updated: October 2025*