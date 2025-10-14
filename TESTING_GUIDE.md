# Pocket Symptom Tracker - Testing Guide

**Last Updated**: October 12, 2025  
**Testing Framework**: Jest 30.2.0  
**Component Testing**: React Testing Library 16.3.0  
**Coverage Target**: 80% (branches, functions, lines, statements)

---

## Table of Contents

1. [Overview](#overview)
2. [Testing Setup](#testing-setup)
3. [Running Tests](#running-tests)
4. [Unit Testing](#unit-testing)
5. [Component Testing](#component-testing)
6. [Integration Testing](#integration-testing)
7. [Testing Patterns](#testing-patterns)
8. [Mocking](#mocking)
9. [Code Coverage](#code-coverage)
10. [Debugging Tests](#debugging-tests)
11. [Best Practices](#best-practices)
12. [Common Issues](#common-issues)

---

## Overview

### Testing Philosophy

**Test Pyramid**:
```
           E2E (Manual)
        /               \
      Integration (Few)
    /                     \
  Unit Tests (Many)
```

**Priorities**:
1. **Unit Tests** (70%): Functions, utilities, repositories
2. **Component Tests** (25%): React components, user interactions
3. **Integration Tests** (5%): Multi-component workflows
4. **E2E Tests** (Manual): Critical user journeys

**What to Test**:
- ✅ Business logic (analytics, correlations)
- ✅ Data transformations (repositories, services)
- ✅ Component rendering and interactions
- ✅ Edge cases and error handling

**What NOT to Test**:
- ❌ Third-party libraries (Dexie, Chart.js)
- ❌ Trivial getters/setters
- ❌ Styles and CSS

---

## Testing Setup

### Jest Configuration

**File**: `jest.config.js`

```javascript
module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.+(ts|tsx)', '**/?(*.)+(spec|test).+(ts|tsx)'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { useESM: true, tsconfig: { jsx: 'react-jsx' } }]
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
    '!src/app/**/*'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

**Key Settings**:
- `testEnvironment: 'jsdom'` - Simulates browser environment
- `moduleNameMapper` - Resolves `@/` imports
- `coverageThreshold` - Enforces 80% coverage

### Jest Setup

**File**: `jest.setup.js`

```javascript
import '@testing-library/jest-dom';

// Mock IndexedDB
global.indexedDB = {
  open: jest.fn(),
  // ... mock implementation
};

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
```

### Test File Structure

**Location**: `src/**/__tests__/*.test.tsx`

**Example**:
```
src/
├── lib/
│   ├── repositories/
│   │   ├── dailyEntryRepository.ts
│   │   └── __tests__/
│   │       └── dailyEntryRepository.test.ts
│   └── utils/
│       ├── statistics/
│       │   ├── linearRegression.ts
│       │   └── __tests__/
│       │       └── linearRegression.test.ts
└── components/
    └── analytics/
        ├── TrendChart.tsx
        └── __tests__/
            └── TrendChart.test.tsx
```

---

## Running Tests

### Command Line

```powershell
# Run all tests
npm test

# Run in watch mode (re-run on file change)
npm run test:watch

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- src/lib/utils/statistics/__tests__/linearRegression.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="linear regression"

# Update snapshots
npm test -- -u
```

### VS Code (Jest Runner Extension)

1. Install "Jest Runner" extension
2. Click ▶️ icon above test function
3. View results in VS Code terminal

### Watch Mode

**Recommended for Development**:

```powershell
npm run test:watch
```

**Interactive Menu**:
```
Watch Usage
 › Press f to run only failed tests.
 › Press o to only run tests related to changed files.
 › Press p to filter by a filename regex pattern.
 › Press t to filter by a test name regex pattern.
 › Press q to quit watch mode.
 › Press Enter to trigger a test run.
```

---

## Unit Testing

### Testing Utilities

**Example**: `src/lib/utils/statistics/__tests__/linearRegression.test.ts`

```typescript
import { computeLinearRegression } from '../linearRegression';
import { Point } from '../types';

describe('linearRegression', () => {
  describe('computeLinearRegression', () => {
    it('computes correct slope and intercept', () => {
      const points: Point[] = [
        { x: new Date('2025-01-01'), y: 1 },
        { x: new Date('2025-01-02'), y: 2 },
        { x: new Date('2025-01-03'), y: 3 },
        { x: new Date('2025-01-04'), y: 4 },
        { x: new Date('2025-01-05'), y: 5 },
      ];

      const result = computeLinearRegression(points);

      expect(result.slope).toBeCloseTo(1, 2);
      expect(result.intercept).toBeCloseTo(1, 2);
      expect(result.rSquared).toBeCloseTo(1, 2);
    });

    it('handles insufficient data', () => {
      const points: Point[] = [
        { x: new Date('2025-01-01'), y: 1 },
      ];

      const result = computeLinearRegression(points);

      expect(result).toBeNull();
    });

    it('handles outliers correctly', () => {
      const points: Point[] = [
        { x: new Date('2025-01-01'), y: 5 },
        { x: new Date('2025-01-02'), y: 5 },
        { x: new Date('2025-01-03'), y: 100 },  // Outlier
        { x: new Date('2025-01-04'), y: 5 },
        { x: new Date('2025-01-05'), y: 5 },
      ];

      const result = computeLinearRegression(points);

      // Outlier should be removed, slope should be ~0
      expect(result.slope).toBeCloseTo(0, 1);
    });
  });
});
```

### Testing Repositories

**Example**: `src/lib/repositories/__tests__/dailyEntryRepository.test.ts`

```typescript
import { DailyEntryRepository } from '../dailyEntryRepository';
import { db } from '../../db/client';

// Mock Dexie
jest.mock('../../db/client', () => ({
  db: {
    dailyEntries: {
      add: jest.fn(),
      get: jest.fn(),
      where: jest.fn(() => ({
        equals: jest.fn(() => ({
          first: jest.fn(),
          toArray: jest.fn(),
        })),
      })),
    },
  },
}));

describe('DailyEntryRepository', () => {
  let repo: DailyEntryRepository;

  beforeEach(() => {
    repo = new DailyEntryRepository();
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('creates daily entry with generated ID', async () => {
      const mockEntry = {
        userId: 'user-123',
        date: '2025-10-12',
        overallHealth: 7,
        energyLevel: 6,
        sleepQuality: 8,
        stressLevel: 4,
        symptoms: [],
        medications: [],
        triggers: [],
        duration: 180,
        completedAt: new Date(),
      };

      (db.dailyEntries.add as jest.Mock).mockResolvedValue('generated-id');

      const result = await repo.create(mockEntry);

      expect(result.id).toBeDefined();
      expect(result.userId).toBe('user-123');
      expect(db.dailyEntries.add).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-123',
          date: '2025-10-12',
        })
      );
    });
  });

  describe('getByDate', () => {
    it('fetches entry by user ID and date', async () => {
      const mockEntry = { id: 'entry-1', userId: 'user-123', date: '2025-10-12' };
      (db.dailyEntries.where as jest.Mock).mockReturnValue({
        equals: jest.fn().mockReturnValue({
          first: jest.fn().mockResolvedValue(mockEntry),
        }),
      });

      const result = await repo.getByDate('user-123', '2025-10-12');

      expect(result).toEqual(mockEntry);
      expect(db.dailyEntries.where).toHaveBeenCalledWith('[userId+date]');
    });
  });
});
```

### Testing Services

**Example**: `src/lib/services/__tests__/TrendAnalysisService.test.ts`

```typescript
import { TrendAnalysisService } from '../TrendAnalysisService';
import { DailyEntryRepository } from '../../repositories/dailyEntryRepository';
import { AnalysisRepository } from '../../repositories/analysisRepository';

describe('TrendAnalysisService', () => {
  let service: TrendAnalysisService;
  let mockDailyEntryRepo: jest.Mocked<DailyEntryRepository>;
  let mockAnalysisRepo: jest.Mocked<AnalysisRepository>;

  beforeEach(() => {
    mockDailyEntryRepo = {
      getMetricData: jest.fn(),
    } as any;

    mockAnalysisRepo = {
      getResult: jest.fn(),
      saveResult: jest.fn(),
    } as any;

    service = new TrendAnalysisService(mockDailyEntryRepo, mockAnalysisRepo);
  });

  describe('analyzeTrend', () => {
    it('returns cached result if fresh', async () => {
      const cachedResult = {
        id: 1,
        userId: 'user-123',
        metric: 'overallHealth',
        timeRange: '30d',
        result: { slope: 0.05, intercept: 6.2, rSquared: 0.72, predictions: [] },
        createdAt: new Date(),
      };

      mockAnalysisRepo.getResult.mockResolvedValue(cachedResult);

      const result = await service.analyzeTrend('user-123', 'overallHealth', '30d');

      expect(result).toEqual(cachedResult.result);
      expect(mockDailyEntryRepo.getMetricData).not.toHaveBeenCalled();
    });

    it('computes new result if no cache', async () => {
      mockAnalysisRepo.getResult.mockResolvedValue(undefined);
      mockDailyEntryRepo.getMetricData.mockResolvedValue([
        { x: new Date('2025-10-01'), y: 7 },
        { x: new Date('2025-10-02'), y: 6 },
        // ... 28 more points (30 total)
      ]);

      const result = await service.analyzeTrend('user-123', 'overallHealth', '30d');

      expect(result).toBeDefined();
      expect(result!.slope).toBeDefined();
      expect(mockAnalysisRepo.saveResult).toHaveBeenCalled();
    });

    it('returns null if insufficient data', async () => {
      mockAnalysisRepo.getResult.mockResolvedValue(undefined);
      mockDailyEntryRepo.getMetricData.mockResolvedValue([
        { x: new Date('2025-10-01'), y: 7 },
        // Only 1 point (< 14 required)
      ]);

      const result = await service.analyzeTrend('user-123', 'overallHealth', '30d');

      expect(result).toBeNull();
    });
  });

  describe('interpretTrend', () => {
    it('interprets improving trend', () => {
      const result = { slope: 0.15, intercept: 6, rSquared: 0.8, predictions: [] };
      const interpretation = service.interpretTrend(result);

      expect(interpretation.direction).toBe('improving');
      expect(interpretation.confidence).toBe('high');
    });

    it('interprets worsening trend', () => {
      const result = { slope: -0.15, intercept: 6, rSquared: 0.5, predictions: [] };
      const interpretation = service.interpretTrend(result);

      expect(interpretation.direction).toBe('worsening');
      expect(interpretation.confidence).toBe('medium');
    });

    it('interprets stable trend', () => {
      const result = { slope: 0.05, intercept: 6, rSquared: 0.3, predictions: [] };
      const interpretation = service.interpretTrend(result);

      expect(interpretation.direction).toBe('stable');
      expect(interpretation.confidence).toBe('low');
    });
  });
});
```

---

## Component Testing

### Testing React Components

**Example**: `src/components/analytics/__tests__/TrendChart.test.tsx`

```typescript
import { render, screen } from '@testing-library/react';
import { TrendChart } from '../TrendChart';
import { Point } from '@/lib/utils/statistics/types';

describe('TrendChart', () => {
  const mockData: Point[] = [
    { x: new Date('2025-10-01'), y: 7 },
    { x: new Date('2025-10-02'), y: 6 },
    { x: new Date('2025-10-03'), y: 8 },
  ];

  const mockPredictions: Point[] = [
    { x: new Date('2025-10-01'), y: 7.1 },
    { x: new Date('2025-10-02'), y: 7.2 },
    { x: new Date('2025-10-03'), y: 7.3 },
  ];

  it('renders chart with data', () => {
    render(
      <TrendChart
        data={mockData}
        predictions={mockPredictions}
        metric="overallHealth"
        rSquared={0.72}
      />
    );

    // Chart.js renders canvas
    const canvas = screen.getByRole('img', { hidden: true });
    expect(canvas).toBeInTheDocument();
  });

  it('displays R² value', () => {
    render(
      <TrendChart
        data={mockData}
        predictions={mockPredictions}
        metric="overallHealth"
        rSquared={0.72}
      />
    );

    expect(screen.getByText(/R² = 0.72/i)).toBeInTheDocument();
  });

  it('renders compact variant', () => {
    const { container } = render(
      <TrendChart
        data={mockData}
        predictions={mockPredictions}
        metric="overallHealth"
        variant="compact"
      />
    );

    // Compact variant has smaller height
    expect(container.firstChild).toHaveClass('h-40');
  });
});
```

### Testing User Interactions

**Example**: `src/components/analytics/__tests__/TimeRangeSelector.test.tsx`

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TimeRangeSelector } from '../TimeRangeSelector';

describe('TimeRangeSelector', () => {
  it('calls onChange when button clicked', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();

    render(<TimeRangeSelector value="7d" onChange={handleChange} />);

    const button30d = screen.getByRole('button', { name: '30d' });
    await user.click(button30d);

    expect(handleChange).toHaveBeenCalledWith('30d');
  });

  it('highlights selected range', () => {
    render(<TimeRangeSelector value="30d" onChange={jest.fn()} />);

    const button30d = screen.getByRole('button', { name: '30d' });
    expect(button30d).toHaveClass('bg-blue-500');
  });

  it('disables buttons when disabled prop is true', () => {
    render(<TimeRangeSelector value="30d" onChange={jest.fn()} disabled />);

    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });
});
```

### Testing Forms

**Example**: `src/components/daily-entry/__tests__/DailyEntryForm.test.tsx`

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DailyEntryForm } from '../DailyEntryForm';

describe('DailyEntryForm', () => {
  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all sections', () => {
    render(
      <DailyEntryForm
        userId="user-123"
        date="2025-10-12"
        onSave={mockOnSave}
      />
    );

    expect(screen.getByLabelText(/overall health/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/energy level/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/sleep quality/i)).toBeInTheDocument();
  });

  it('submits form with entered data', async () => {
    const user = userEvent.setup();

    render(
      <DailyEntryForm
        userId="user-123"
        date="2025-10-12"
        onSave={mockOnSave}
      />
    );

    // Fill health section
    const overallHealthSlider = screen.getByLabelText(/overall health/i);
    await user.click(overallHealthSlider);
    // ... simulate slider interaction

    // Submit form
    const submitButton = screen.getByRole('button', { name: /save entry/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-123',
          date: '2025-10-12',
          overallHealth: expect.any(Number),
        })
      );
    });
  });

  it('displays validation errors', async () => {
    const user = userEvent.setup();

    render(
      <DailyEntryForm
        userId="user-123"
        date="2025-10-12"
        onSave={mockOnSave}
      />
    );

    // Submit without filling required fields
    const submitButton = screen.getByRole('button', { name: /save entry/i });
    await user.click(submitButton);

    expect(await screen.findByText(/required field/i)).toBeInTheDocument();
    expect(mockOnSave).not.toHaveBeenCalled();
  });
});
```

---

## Integration Testing

### Multi-Component Workflows

**Example**: `src/components/flare/__tests__/FlareDashboard.integration.test.tsx`

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ActiveFlareDashboard } from '../ActiveFlareDashboard';

// Mock repositories
jest.mock('@/lib/repositories/flareRepository');

describe('ActiveFlareDashboard Integration', () => {
  it('creates new flare and updates dashboard', async () => {
    const user = userEvent.setup();

    render(<ActiveFlareDashboard userId="user-123" />);

    // Initially, no flares
    expect(screen.getByText(/no active flares/i)).toBeInTheDocument();

    // Click "New Flare" button
    const newFlareButton = screen.getByRole('button', { name: /new flare/i });
    await user.click(newFlareButton);

    // Fill new flare dialog
    const symptomSelect = screen.getByLabelText(/symptom/i);
    await user.selectOptions(symptomSelect, 'Lesion');

    const severitySlider = screen.getByLabelText(/severity/i);
    await user.click(severitySlider);

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    // Wait for dashboard to update
    await waitFor(() => {
      expect(screen.queryByText(/no active flares/i)).not.toBeInTheDocument();
      expect(screen.getByText(/lesion/i)).toBeInTheDocument();
    });
  });

  it('updates flare status', async () => {
    const user = userEvent.setup();

    // Mock existing flare
    const mockFlare = {
      id: 'flare-1',
      userId: 'user-123',
      symptomName: 'Lesion',
      status: 'active',
      severity: 7,
    };

    render(<ActiveFlareDashboard userId="user-123" />);

    // Find flare card
    const flareCard = screen.getByText(/lesion/i).closest('[data-testid="flare-card"]');
    expect(flareCard).toBeInTheDocument();

    // Update status to "improving"
    const statusSelect = within(flareCard!).getByLabelText(/status/i);
    await user.selectOptions(statusSelect, 'improving');

    await waitFor(() => {
      expect(screen.getByText(/improving/i)).toBeInTheDocument();
    });
  });
});
```

---

## Testing Patterns

### AAA Pattern (Arrange, Act, Assert)

```typescript
it('computes average correctly', () => {
  // Arrange
  const numbers = [1, 2, 3, 4, 5];
  
  // Act
  const result = computeAverage(numbers);
  
  // Assert
  expect(result).toBe(3);
});
```

### Test Data Builders

**Pattern**: Create reusable test data factories

```typescript
// src/lib/__tests__/testUtils/builders.ts
export function buildDailyEntry(overrides = {}) {
  return {
    id: 'entry-1',
    userId: 'user-123',
    date: '2025-10-12',
    overallHealth: 7,
    energyLevel: 6,
    sleepQuality: 8,
    stressLevel: 4,
    symptoms: [],
    medications: [],
    triggers: [],
    duration: 180,
    completedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

// Usage in tests
it('processes daily entry', () => {
  const entry = buildDailyEntry({ overallHealth: 5 });
  // ...
});
```

### Snapshot Testing

**Use Case**: Ensure UI doesn't change unexpectedly

```typescript
import { render } from '@testing-library/react';
import { SymptomCard } from '../SymptomCard';

it('matches snapshot', () => {
  const mockSymptom = {
    id: 'symptom-1',
    name: 'Lesion',
    category: 'skin',
  };

  const { container } = render(<SymptomCard symptom={mockSymptom} />);
  expect(container).toMatchSnapshot();
});
```

**Update Snapshots**:
```powershell
npm test -- -u
```

---

## Mocking

### Mocking Modules

```typescript
// Mock entire module
jest.mock('@/lib/db/client', () => ({
  db: {
    symptoms: {
      add: jest.fn(),
      get: jest.fn(),
    },
  },
}));
```

### Mocking Functions

```typescript
// Mock specific function
const mockFetch = jest.fn();
global.fetch = mockFetch;

mockFetch.mockResolvedValue({
  json: async () => ({ data: 'test' }),
});
```

### Mocking Dexie (IndexedDB)

```typescript
// src/lib/__tests__/testUtils/mockDexie.ts
export function mockDexieTable(tableName: string) {
  const storage = new Map();

  return {
    add: jest.fn((record) => {
      const id = record.id || generateId();
      storage.set(id, { ...record, id });
      return Promise.resolve(id);
    }),
    get: jest.fn((id) => {
      return Promise.resolve(storage.get(id));
    }),
    where: jest.fn(() => ({
      equals: jest.fn(() => ({
        first: jest.fn(() => {
          const values = Array.from(storage.values());
          return Promise.resolve(values[0]);
        }),
        toArray: jest.fn(() => {
          return Promise.resolve(Array.from(storage.values()));
        }),
      })),
    })),
  };
}

// Usage
jest.mock('@/lib/db/client', () => ({
  db: {
    symptoms: mockDexieTable('symptoms'),
  },
}));
```

### Mocking React Hooks

```typescript
// Mock useState
const mockSetState = jest.fn();
jest.spyOn(React, 'useState').mockReturnValue([mockValue, mockSetState]);

// Mock useEffect (prevent side effects)
jest.spyOn(React, 'useEffect').mockImplementation((f) => f());
```

---

## Code Coverage

### Viewing Coverage

```powershell
npm run test:coverage
```

**Output**:
```
---------------------|---------|----------|---------|---------|-------------------
File                 | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
---------------------|---------|----------|---------|---------|-------------------
All files            |   82.5  |   78.3   |   85.1  |   82.8  |
 repositories/       |   88.2  |   82.5   |   90.3  |   88.5  |
  dailyEntryRepo.ts  |   92.1  |   88.2   |   95.0  |   92.4  | 45-48,102
 services/           |   76.8  |   70.1   |   80.2  |   77.1  |
  exportService.ts   |   68.5  |   62.3   |   70.5  |   69.0  | 23-35,78-92
 utils/              |   90.3  |   85.7   |   92.1  |   90.6  |
---------------------|---------|----------|---------|---------|-------------------
```

**HTML Report**:
```powershell
npm run test:coverage
# Open coverage/lcov-report/index.html
```

### Coverage Thresholds

**Configuration** (`jest.config.js`):
```javascript
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80,
  },
}
```

**Failure**: If coverage falls below 80%, `npm test` will fail.

### Ignoring Files from Coverage

**Method 1**: Configuration
```javascript
collectCoverageFrom: [
  'src/**/*.{ts,tsx}',
  '!src/**/*.d.ts',
  '!src/**/*.stories.tsx',
  '!src/app/**/*',
]
```

**Method 2**: Inline comment
```typescript
/* istanbul ignore next */
function debugOnlyFunction() {
  // Not covered
}
```

---

## Debugging Tests

### VS Code Debugging

1. Set breakpoint in test file
2. Right-click test name → "Debug Test"
3. Execution pauses at breakpoint

### Console Logging

```typescript
it('debugs component state', () => {
  const { container } = render(<MyComponent />);
  
  // Log rendered HTML
  console.log(container.innerHTML);
  
  // Log specific element
  const button = screen.getByRole('button');
  console.log(button.textContent);
  
  // Debug Testing Library state
  screen.debug();
});
```

### Using `only` and `skip`

```typescript
// Run only this test
it.only('runs only this test', () => { ... });

// Skip this test
it.skip('skips this test', () => { ... });

// Skip entire suite
describe.skip('skips this suite', () => { ... });
```

### Verbose Mode

```powershell
npm test -- --verbose
```

**Output**: Shows all test names and results

---

## Best Practices

### 1. Test Behavior, Not Implementation

**Good**:
```typescript
it('displays user name', () => {
  render(<UserCard userId="user-123" />);
  expect(screen.getByText('John Doe')).toBeInTheDocument();
});
```

**Bad**:
```typescript
it('sets state correctly', () => {
  const wrapper = shallow(<UserCard userId="user-123" />);
  expect(wrapper.state('userName')).toBe('John Doe');
});
```

### 2. Use Accessible Queries

**Priority** (highest to lowest):
1. `getByRole` - Most accessible
2. `getByLabelText` - Form fields
3. `getByPlaceholderText` - Inputs
4. `getByText` - Non-interactive text
5. `getByTestId` - Last resort

**Example**:
```typescript
// Good
const button = screen.getByRole('button', { name: /submit/i });

// Okay
const input = screen.getByLabelText(/email/i);

// Last resort
const element = screen.getByTestId('custom-element');
```

### 3. Avoid Testing Implementation Details

**Don't test**:
- Private functions
- Internal state
- CSS classes (unless critical)

**Do test**:
- Public API
- User-visible behavior
- Accessibility

### 4. Keep Tests Independent

```typescript
// Bad (tests depend on each other)
let sharedData;

it('creates data', () => {
  sharedData = createData();
});

it('uses data', () => {
  processData(sharedData);  // ❌ Depends on previous test
});

// Good (tests are independent)
it('creates data', () => {
  const data = createData();
  expect(data).toBeDefined();
});

it('processes data', () => {
  const data = createData();
  processData(data);
  expect(data.processed).toBe(true);
});
```

### 5. Use `beforeEach` for Setup

```typescript
describe('MyComponent', () => {
  let mockProps;

  beforeEach(() => {
    mockProps = {
      userId: 'user-123',
      onSave: jest.fn(),
    };
  });

  it('renders correctly', () => {
    render(<MyComponent {...mockProps} />);
  });

  it('calls onSave', () => {
    render(<MyComponent {...mockProps} />);
    // ...
    expect(mockProps.onSave).toHaveBeenCalled();
  });
});
```

### 6. Test Edge Cases

```typescript
describe('computeAverage', () => {
  it('computes average of normal numbers', () => {
    expect(computeAverage([1, 2, 3])).toBe(2);
  });

  it('handles empty array', () => {
    expect(computeAverage([])).toBeNull();
  });

  it('handles single number', () => {
    expect(computeAverage([5])).toBe(5);
  });

  it('handles negative numbers', () => {
    expect(computeAverage([-1, -2, -3])).toBe(-2);
  });

  it('handles decimals', () => {
    expect(computeAverage([1.5, 2.5])).toBeCloseTo(2, 1);
  });
});
```

---

## Common Issues

### Issue: "Cannot find module"

**Cause**: Import path incorrect

**Solution**:
- Check `@/` paths resolve correctly
- Verify `moduleNameMapper` in `jest.config.js`

### Issue: "TextEncoder is not defined"

**Cause**: Missing polyfill for Node environment

**Solution**: Add to `jest.setup.js`:
```javascript
global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;
```

### Issue: "IndexedDB not available"

**Cause**: IndexedDB not mocked

**Solution**: Mock in `jest.setup.js` or test file

### Issue: "async act(...) warning"

**Cause**: State updates not wrapped in `act()`

**Solution**: Use `waitFor` from Testing Library:
```typescript
await waitFor(() => {
  expect(screen.getByText(/loaded/i)).toBeInTheDocument();
});
```

### Issue: "Coverage too low"

**Cause**: Test coverage below 80% threshold

**Solution**:
1. Run `npm run test:coverage` to see uncovered lines
2. Add tests for uncovered code
3. Or adjust threshold in `jest.config.js` (not recommended)

---

## References

- **Jest Documentation**: https://jestjs.io/docs
- **React Testing Library**: https://testing-library.com/docs/react-testing-library/intro
- **Testing Best Practices**: https://kentcdodds.com/blog/common-mistakes-with-react-testing-library
- **jest-dom Matchers**: https://github.com/testing-library/jest-dom
- **User Event**: https://testing-library.com/docs/user-event/intro

---

**For development guide, see**: [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)  
**For architecture overview, see**: [ARCHITECTURE.md](./ARCHITECTURE.md)
