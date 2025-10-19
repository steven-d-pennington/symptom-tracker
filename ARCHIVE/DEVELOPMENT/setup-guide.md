# Development Setup Guide

**Last Updated**: October 13, 2025  
**Version**: 2.0  
**Prerequisites**: Node.js 18+, npm 9+

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Development Environment](#development-environment)
4. [Project Structure](#project-structure)
5. [Development Workflow](#development-workflow)
6. [Testing](#testing)
7. [Build & Deployment](#build--deployment)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software
- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 9.0.0 or higher (comes with Node.js)
- **Git**: For version control
- **VS Code**: Recommended IDE with extensions

### Recommended VS Code Extensions
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "ms-vscode.vscode-json",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

### Browser Requirements
- **Chrome**: 90+ (recommended for development)
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

## Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/steven-d-pennington/symptom-tracker.git
cd symptom-tracker
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Open Application
Visit `http://localhost:3000` in your browser.

## Development Environment

### Environment Variables
Create a `.env.local` file in the root directory:

```env
# Development Configuration
NEXT_PUBLIC_APP_VERSION=2.0.0
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_DEBUG_MODE=true

# Optional: Feature Flags
NEXT_PUBLIC_ENABLE_PHOTO_ENCRYPTION=true
NEXT_PUBLIC_ENABLE_ADVANCED_ANALYTICS=false
```

### Development Scripts

| Command | Description | Usage |
|---------|-------------|-------|
| `npm run dev` | Start development server with Turbopack | Development |
| `npm run build` | Create production build | Testing/Deployment |
| `npm run start` | Start production server | Production testing |
| `npm run lint` | Run ESLint | Code quality |
| `npm run lint:fix` | Fix ESLint issues | Code quality |
| `npm run type-check` | TypeScript type checking | Code quality |
| `npm run test` | Run Jest tests | Testing |
| `npm run test:watch` | Run tests in watch mode | Testing |
| `npm run test:coverage` | Run tests with coverage | Testing |

### Development Server Features
- **Hot Module Replacement**: Fast refresh for component changes
- **Turbopack**: Optimized bundling for faster builds
- **Error Overlay**: Detailed error information in browser
- **TypeScript**: Full type checking and IntelliSense

## Project Structure

### Directory Overview
```
symptom-tracker/
├── public/                     # Static assets
│   ├── icons/                 # PWA icons
│   ├── manifest.json          # PWA manifest
│   └── sw.js                  # Service worker
├── src/                       # Source code
│   ├── app/                   # Next.js App Router pages
│   ├── components/            # React components
│   ├── lib/                   # Utilities and libraries
│   ├── hooks/                 # Custom React hooks
│   └── types/                 # TypeScript type definitions
├── docs/                      # Documentation
├── tests/                     # Test files
└── build-docs/                # Implementation plans
```

### Component Organization
```
src/components/
├── analytics/                 # Data visualization
├── body-mapping/             # Interactive body maps
├── calendar/                 # Calendar and timeline views
├── daily-entry/              # Daily health logging
├── data-management/          # Export/import functionality
├── flare/                    # Flare tracking dashboard
├── manage/                   # CRUD operations
├── navigation/               # App navigation
├── photos/                   # Photo documentation
├── providers/                # React context providers
├── pwa/                      # PWA-specific components
├── settings/                 # User preferences
├── symptoms/                 # Symptom tracking
└── triggers/                 # Trigger analysis
```

### Data Layer Organization
```
src/lib/
├── db/                       # Database schema and migrations
├── repositories/             # Data access layer
├── services/                 # Business logic
├── utils/                    # Utility functions
└── types/                    # TypeScript definitions
```

## Development Workflow

### 1. Feature Development
```bash
# Create feature branch
git checkout -b feature/new-feature-name

# Start development
npm run dev

# Make changes and test
npm run test
npm run lint
npm run type-check

# Commit changes
git add .
git commit -m "feat: add new feature description"

# Push and create PR
git push origin feature/new-feature-name
```

### 2. Component Development Pattern
```typescript
// 1. Define types
interface MyComponentProps {
  title: string;
  onAction: () => void;
}

// 2. Create component
export function MyComponent({ title, onAction }: MyComponentProps) {
  // 3. Add hooks for state/logic
  const [isLoading, setIsLoading] = useState(false);
  
  // 4. Handle events
  const handleClick = useCallback(() => {
    setIsLoading(true);
    onAction();
  }, [onAction]);
  
  // 5. Return JSX
  return (
    <div className="my-component">
      <h2>{title}</h2>
      <button onClick={handleClick} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Action'}
      </button>
    </div>
  );
}
```

### 3. Database Operations
```typescript
// Repository pattern for data access
import { symptomRepository } from '@/lib/repositories';

// Create
const newSymptom = await symptomRepository.create({
  userId: 'user-123',
  name: 'Headache',
  severity: 7,
  category: 'pain'
});

// Read
const symptoms = await symptomRepository.getAll('user-123');
const activeSymptoms = await symptomRepository.getActive('user-123');

// Update
await symptomRepository.update(symptom.id, { severity: 8 });

// Delete
await symptomRepository.delete(symptom.id);
```

### 4. Testing Pattern
```typescript
// Component test
import { render, screen, fireEvent } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders title correctly', () => {
    render(<MyComponent title="Test Title" onAction={jest.fn()} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });
  
  it('calls onAction when button clicked', () => {
    const mockOnAction = jest.fn();
    render(<MyComponent title="Test" onAction={mockOnAction} />);
    
    fireEvent.click(screen.getByText('Action'));
    expect(mockOnAction).toHaveBeenCalledTimes(1);
  });
});
```

## Testing

### Test Setup
The project uses **Jest** and **React Testing Library** for testing.

### Test Structure
```
src/
├── components/
│   └── __tests__/           # Component tests
├── lib/
│   ├── repositories/
│   │   └── __tests__/       # Repository tests
│   └── services/
│       └── __tests__/       # Service tests
└── hooks/
    └── __tests__/           # Hook tests
```

### Running Tests
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test -- MyComponent.test.ts
```

### Testing Guidelines
1. **Unit Tests**: Test individual functions and components
2. **Integration Tests**: Test component interactions
3. **Repository Tests**: Test data access layer
4. **Hook Tests**: Test custom hooks with renderHook

### Test Example
```typescript
// Hook test
import { renderHook, act } from '@testing-library/react';
import { useSymptoms } from './useSymptoms';

describe('useSymptoms', () => {
  it('loads symptoms on mount', async () => {
    const { result } = renderHook(() => useSymptoms());
    
    expect(result.current.isLoading).toBe(true);
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.symptoms).toHaveLength(5);
  });
});
```

## Build & Deployment

### Production Build
```bash
# Create optimized production build
npm run build

# Test production build locally
npm run start
```

### Build Optimization
- **Code Splitting**: Automatic route-based splitting
- **Tree Shaking**: Dead code elimination
- **Minification**: JavaScript and CSS optimization
- **Image Optimization**: Automatic WebP conversion
- **Bundle Analysis**: Use `npm run analyze` to inspect bundle size

### Deployment Process
```bash
# 1. Build for production
npm run build

# 2. Test production build
npm run start

# 3. Deploy to Vercel (automatic on git push)
# Or deploy manually:
vercel --prod
```

### Environment-Specific Builds
```bash
# Development build with debugging
npm run build:dev

# Production build
npm run build:prod

# Analyze bundle size
npm run analyze
```

## Troubleshooting

### Common Issues

#### 1. TypeScript Errors
```bash
# Check TypeScript configuration
npm run type-check

# Common fixes:
# - Update import paths
# - Add type definitions
# - Check tsconfig.json configuration
```

#### 2. ESLint Errors
```bash
# Fix ESLint issues automatically
npm run lint:fix

# Common fixes:
# - Add missing imports
# - Fix formatting
# - Remove unused variables
```

#### 3. Test Failures
```bash
# Run tests with verbose output
npm run test -- --verbose

# Update test snapshots
npm run test -- --updateSnapshot

# Common fixes:
# - Update mock implementations
# - Check async/await handling
# - Verify test setup
```

#### 4. Build Errors
```bash
# Clear build cache
rm -rf .next

# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Common fixes:
# - Check environment variables
# - Verify import paths
# - Check for circular dependencies
```

### Performance Issues

#### 1. Slow Development Server
```bash
# Check for large dependencies
npm ls --depth=0

# Update dependencies
npm update

# Use Turbopack (enabled by default)
# Already optimized for development
```

#### 2. Memory Issues
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run dev

# Check for memory leaks in development
# Use Chrome DevTools Memory tab
```

### Debugging Tools

#### 1. React Developer Tools
- Install browser extension
- Inspect component state and props
- Profile component performance

#### 2. Chrome DevTools
- **Elements**: Inspect DOM and styles
- **Console**: Debug JavaScript errors
- **Network**: Monitor API calls and resources
- **Application**: Inspect IndexedDB and local storage
- **Performance**: Profile app performance

#### 3. Next.js Debugging
```typescript
// Add debug statements
console.log('Debug info:', data);

// Use debugger statement
debugger; // Pauses execution in DevTools

// Use Next.js debugging
import { debug } from 'debug';
const log = debug('app:component');
log('Component rendered');
```

## Development Best Practices

### 1. Code Organization
- Keep components focused and single-purpose
- Use custom hooks for reusable logic
- Follow the repository pattern for data access
- Organize files by feature, not by type

### 2. TypeScript Usage
- Enable strict mode
- Avoid `any` types
- Use interfaces for object shapes
- Leverage type inference

### 3. Performance
- Use React.memo for expensive components
- Implement virtualization for long lists
- Optimize images and assets
- Use code splitting for large features

### 4. Accessibility
- Use semantic HTML elements
- Add ARIA labels where needed
- Ensure keyboard navigation
- Test with screen readers

### 5. Testing
- Write tests for critical paths
- Use descriptive test names
- Test edge cases and error states
- Maintain good test coverage

---

**Related Documentation**:
- [Component Library](./component-library.md) - Component documentation
- [Testing Strategy](./testing-strategy.md) - Detailed testing approach
- [API Reference](./api-reference.md) - Internal API documentation
- [Deployment Guide](./deployment.md) - Build and deployment instructions
