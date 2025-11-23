# Development Guide

**Project**: Pocket Symptom Tracker
**Last Updated**: 2025-11-04
**Version**: 0.2.0

## Prerequisites

### Required Software

- **Node.js**: v20.x or later (LTS recommended)
- **npm**: v10.x or later (comes with Node.js)
- **Git**: Latest version for version control

### Recommended IDE

Any of the following IDEs with integrated AI coding assistance:
- **Claude Code** (`.claude/` configurations included)
- **Cursor** (`.cursor/` configurations included)
- **VS Code** (`.vscode/` configurations included)
- **Roo** (`.roo/` configurations included)
- **Gemini** (`.gemini/` configurations included)

### Browser Requirements

- **Chrome** 100+ (recommended for development)
- **Firefox** 100+
- **Safari** 15+
- **Edge** 100+

---

## Getting Started

### 1. Clone Repository

```bash
git clone https://github.com/your-org/symptom-tracker.git
cd symptom-tracker
```

### 2. Install Dependencies

```bash
npm install
```

**Installs**:
- Next.js 15.5.4
- React 19.1.0
- TypeScript 5.x
- Dexie v4.2.0
- Tailwind CSS v4
- 300+ total packages (~500MB)

### 3. Start Development Server

```bash
npm run dev
```

**Output**:
```
▲ Next.js 15.5.4 with Turbopack
- Local:        http://localhost:3001
- Network:      http://192.168.1.x:3001

✓ Ready in 1.2s
```

**Note**: App runs on port **3001** (not default 3000) to avoid conflicts

### 4. Open Application

Navigate to `http://localhost:3001` in your browser

**First Time**:
- Landing page will load
- Click "Get Started" to begin onboarding
- Complete privacy-focused setup wizard

---

## Development Commands

### Running the App

```bash
# Development server with Turbopack (fast refresh)
npm run dev

# Clean development (remove .next folder first)
npm run dev:clean

# Production build
npm run build

# Start production server
npm start
```

### Testing

```bash
# Run all tests (Jest + React Testing Library)
npm test

# Watch mode (auto-rerun on file changes)
npm run test:watch

# Coverage report
npm run test:coverage
```

**Coverage Targets**:
- Overall: 80%+
- Critical paths: 85%+
- Service layer: 90%+

### Code Quality

```bash
# Run ESLint
npm run lint

# ESLint auto-fix (where possible)
npm run lint -- --fix
```

### UX Validation

```bash
# Export UX instrumentation events (opt-in only)
npm run ux:validate
```

**Purpose**: Validate task completion times and interaction patterns

---

## Project Structure

### Key Directories

```
symptom-tracker/
├── src/                   # Application source
│   ├── app/              # Next.js App Router (pages & API)
│   ├── components/       # React components (298 files)
│   ├── lib/              # Business logic (db, services, utils)
│   └── styles/           # Global styles
│
├── public/               # Static assets (icons, manifest)
├── docs/                 # Project documentation (70+ files)
├── scripts/              # Build scripts
├── __mocks__/            # Jest mocks
└── bmad/                 # BMad Method framework
```

### Source Code Organization

- **`src/app/`**: Next.js App Router with file-system routing
- **`src/components/`**: Organized by feature (analytics, flare, body-mapping)
- **`src/lib/db/`**: Database schema and Dexie client (18 tables)
- **`src/lib/repositories/`**: Data access layer (Repository pattern)
- **`src/lib/services/`**: Business logic (correlation, flare tracking)
- **`src/lib/utils/`**: Pure utility functions (date, crypto, validation)

---

## Technology Stack

### Core Framework

- **Next.js**: 15.5.4 (App Router, React Server Components)
- **React**: 19.1.0 (latest stable with React Compiler support)
- **TypeScript**: 5.x (strict mode, 100% type coverage)

### Styling

- **Tailwind CSS**: v4 (utility-first CSS framework)
- **PostCSS**: v4 (CSS processing)
- **Radix UI**: Accessible component primitives

### Database

- **Dexie**: v4.2.0 (IndexedDB wrapper)
- **IndexedDB**: Browser-native storage (no backend)
- **Schema**: 18 tables with compound indexes

### State Management

- **React Context API**: Global state
- **Custom Hooks**: Feature-specific logic
- **No Redux/MobX**: Lightweight state management

### Testing

- **Jest**: 30.2.0 (test runner)
- **React Testing Library**: 16.3.0 (component testing)
- **fake-indexeddb**: 6.2.4 (database mocking)
- **@testing-library/user-event**: 14.6.1 (user interaction simulation)

### Build Tools

- **Turbopack**: Next.js 15 bundler (faster than Webpack)
- **ESLint**: 9.x (code linting)
- **TypeScript Compiler**: tsc for type checking

---

## Environment Setup

### Environment Variables

**Not required for local development** (all data is client-side)

**Production only**:
- `CRON_SECRET`: Vercel Cron authentication token (correlation recomputation)

### Local Storage

- **IndexedDB**: All user data stored locally
- **Service Worker**: PWA offline cache
- **No cookies**: Privacy-first architecture

---

## Development Workflow

### 1. Feature Development

**Typical Flow**:

```bash
# 1. Create feature branch
git checkout -b feature/my-feature

# 2. Start dev server
npm run dev

# 3. Make changes (hot reload enabled)
# - Edit files in src/
# - Changes auto-reload in browser

# 4. Run tests
npm test

# 5. Check types
npx tsc --noEmit

# 6. Lint code
npm run lint

# 7. Commit changes
git add .
git commit -m "Add: My feature description"

# 8. Push to GitHub
git push origin feature/my-feature

# 9. Create Pull Request
# - GitHub Actions run tests automatically
# - Code review by team
```

### 2. Adding New Features

**Follow BMad Method** (see `bmad/` folder):

1. **Analysis**: Product brief, research
2. **Planning**: PRD, epics, user stories
3. **Solutioning**: Architecture decisions, tech spec
4. **Implementation**: Story-by-story development
5. **Review**: Code review, testing, validation

**Documentation**:
- Stories: `docs/stories/story-X.Y.md`
- Architecture: `docs/solution-architecture.md`
- Backlog: `docs/backlog.md`

### 3. Database Changes

**Schema Versioning** (`src/lib/db/client.ts`):

```typescript
db.version(19).stores({
  // New version with schema changes
  newTable: 'id, userId, timestamp'
});
```

**Migration Strategy**:
- Increment version number
- Add new tables/indexes
- Dexie handles data migration automatically
- Test with existing data before deploying

### 4. Component Development

**Best Practices**:

```typescript
// 1. TypeScript interface for props
interface MyComponentProps {
  title: string;
  onAction: () => void;
}

// 2. Functional component with destructuring
export function MyComponent({ title, onAction }: MyComponentProps) {
  // 3. Custom hooks for logic
  const data = useMyData();

  // 4. Event handlers
  const handleClick = () => {
    onAction();
  };

  // 5. JSX with Tailwind classes
  return (
    <div className="p-4 bg-white dark:bg-gray-800">
      <h2 className="text-xl font-bold">{title}</h2>
      <button onClick={handleClick}>Action</button>
    </div>
  );
}
```

**Testing**:

```typescript
// MyComponent.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { MyComponent } from './MyComponent';

test('calls onAction when button clicked', () => {
  const mockAction = jest.fn();
  render(<MyComponent title="Test" onAction={mockAction} />);

  const button = screen.getByRole('button', { name: /action/i });
  fireEvent.click(button);

  expect(mockAction).toHaveBeenCalledTimes(1);
});
```

---

## Building for Production

### 1. Production Build

```bash
npm run build
```

**Output**:
```
▲ Next.js 15.5.4

✓ Creating optimized production build
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (15/15)
✓ Finalizing page optimization

Route (app)                              Size     First Load JS
┌ ○ /                                   142 B          87.2 kB
├ ○ /dashboard                          1.23 kB        92.1 kB
├ ○ /flares                             2.45 kB        94.3 kB
└ ○ /analytics                          3.12 kB        96.2 kB

○  (Static)  prerendered as static content
```

**Build Artifacts**:
- `.next/` folder with optimized bundles
- Static pages pre-rendered
- Client JavaScript chunks code-split
- Images optimized automatically

### 2. Test Production Locally

```bash
npm start
```

Opens production server on `http://localhost:3000`

### 3. Deploy to Vercel

**Automatic Deployment**:
- Push to `main` branch
- Vercel auto-deploys
- CI/CD via GitHub Actions

**Manual Deployment**:
```bash
npx vercel
```

---

## Testing Strategy

### Unit Tests

**What to Test**:
- Utility functions (date, crypto, validation)
- Repository methods (CRUD operations)
- Service logic (correlation, analytics)
- Custom hooks (data fetching, state management)

**Example**:
```typescript
// date-utils.test.ts
import { formatDate, parseDate } from './date-utils';

test('formats date correctly', () => {
  const date = new Date('2025-11-04');
  expect(formatDate(date)).toBe('Nov 4, 2025');
});
```

### Component Tests

**What to Test**:
- User interactions (clicks, inputs, form submissions)
- Conditional rendering
- Accessibility (ARIA labels, roles)
- Error states

**Example**:
```typescript
// FlareCard.test.tsx
import { render, screen } from '@testing-library/react';
import { FlareCard } from './FlareCard';

test('displays flare severity', () => {
  const flare = { id: '1', severity: 7, status: 'active' };
  render(<FlareCard flare={flare} />);

  expect(screen.getByText(/severity: 7/i)).toBeInTheDocument();
});
```

### Integration Tests

**What to Test**:
- Multi-component workflows
- Database operations
- API endpoint responses
- User journeys (e.g., logging a flare from body map)

**Location**: `src/__tests__/integration/`

### Accessibility Testing

**Tools**:
- `@testing-library/jest-dom` (accessibility matchers)
- Manual keyboard navigation testing
- Screen reader testing (NVDA, JAWS, VoiceOver)

**WCAG 2.1 Level AA Compliance**

---

## Performance Optimization

### Current Metrics

| Metric | Target | Current |
|--------|--------|---------|
| FCP | < 1.5s | 1.2s |
| TTI | < 3s | 2.1s |
| LCP | < 2.5s | 1.8s |
| CLS | < 0.1 | 0.05 |
| IndexedDB Query | < 50ms | 35ms avg |
| Body Map Interaction | < 100ms | <100ms |
| Lighthouse Score | > 90 | 95+ |

### Optimization Techniques

**Code Splitting**:
- Next.js automatic route-based splitting
- Dynamic imports for large components

**Image Optimization**:
- Next.js Image component with automatic WebP conversion
- Lazy loading for off-screen images

**Database Performance**:
- Compound indexes on high-traffic queries
- Batch operations for bulk inserts
- Connection pooling (Dexie manages automatically)

**Bundle Size**:
- Initial load: <300KB
- Tree shaking to remove unused code
- Minification in production builds

---

## Debugging

### Browser DevTools

**React DevTools**:
- Inspect component tree
- View props and state
- Profile performance

**IndexedDB Inspector**:
- Chrome DevTools → Application → IndexedDB
- View all tables and records
- Execute manual queries

**Network Tab**:
- Monitor API calls (correlation endpoints)
- Check service worker caching

### Common Issues

#### 1. Database Not Initializing

**Symptom**: "Database failed to open" error

**Solution**:
```bash
# Clear IndexedDB in browser DevTools
# Application → IndexedDB → Right-click → Delete database

# Reload page to reinitialize
```

#### 2. Hot Reload Not Working

**Symptom**: Changes not reflecting in browser

**Solution**:
```bash
# Stop dev server (Ctrl+C)
npm run dev:clean  # Cleans .next folder
```

#### 3. Type Errors

**Symptom**: TypeScript compilation errors

**Solution**:
```bash
# Check types explicitly
npx tsc --noEmit

# Fix errors and restart dev server
```

#### 4. Tests Failing

**Symptom**: Jest tests not passing

**Solution**:
```bash
# Run tests in watch mode to see details
npm run test:watch

# Check for async timing issues
# Add `waitFor` or `findBy` queries for async operations
```

---

## CI/CD Pipeline

### GitHub Actions

**Workflow**: `.github/workflows/ci.yml` (if exists)

**Triggers**:
- Push to `main` or `develop` branches
- Pull request creation

**Steps**:
1. Checkout code
2. Install dependencies
3. Run linter
4. Run type check
5. Run tests with coverage
6. Build production bundle
7. Deploy to Vercel (on `main` only)

### Vercel Deployment

**Automatic**:
- Every push to `main` → Production deployment
- Every PR → Preview deployment with unique URL

**Cron Jobs**:
- Correlation recomputation: Daily at 2 AM UTC
- Endpoint: `/api/correlation/cron`

---

## Security Considerations

### Data Privacy

- **No backend**: All data stays on device
- **No tracking**: No analytics, no telemetry (except opt-in UX events)
- **No authentication**: Single-user PWA without accounts

### Photo Encryption

- **AES-256-GCM**: Military-grade encryption
- **Unique keys**: Per-photo encryption keys
- **EXIF stripping**: Automatic removal of GPS and device metadata
- **Secure deletion**: Key destruction on photo deletion

### Content Security Policy

**Headers** (configured in `next.config.ts`):
- No inline scripts
- No `eval()` usage
- Strict CSP for XSS prevention

---

## Troubleshooting

### Build Issues

**Issue**: Build fails with memory error

**Solution**:
```bash
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

### Database Corruption

**Issue**: Database in inconsistent state

**Solution**:
```javascript
// Delete and recreate database
await db.delete();
location.reload();
```

### Service Worker Issues

**Issue**: Old content cached

**Solution**:
- DevTools → Application → Service Workers → Unregister
- Hard reload (Ctrl+Shift+R)

---

## Resources

### Documentation

- **Project Docs**: `docs/` folder (70+ files)
- **API Contracts**: `docs/api-contracts.md`
- **Data Models**: `docs/data-models.md`
- **Component Inventory**: `docs/component-inventory.md`
- **Source Tree**: `docs/source-tree-analysis.md`

### External Resources

- **Next.js Docs**: https://nextjs.org/docs
- **React Docs**: https://react.dev
- **Dexie Docs**: https://dexie.org
- **Tailwind CSS**: https://tailwindcss.com
- **TypeScript**: https://www.typescriptlang.org

### Community

- **Issues**: GitHub Issues tracker
- **Discussions**: GitHub Discussions
- **Contributing**: See `CONTRIBUTING.md`

---

## Support

### Getting Help

1. **Check Documentation**: Start with `docs/` folder
2. **Search Issues**: Existing GitHub issues
3. **Ask Team**: Internal communication channels
4. **Create Issue**: File new GitHub issue with reproduction steps

### Contributing

See `CONTRIBUTING.md` for:
- Code style guidelines
- PR process
- Commit message conventions
- Testing requirements
