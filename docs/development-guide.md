# Development Guide

## Overview

This guide covers the development workflow for the **Pocket Symptom Tracker**, a local-first PWA built with Next.js, Dexie.js, and Tailwind CSS.

## Getting Started

### Prerequisites
-   **Node.js**: 20+ (LTS recommended)
-   **npm**: 10+
-   **Git**: Latest version
-   **VS Code**: Recommended IDE

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/steven-d-pennington/symptom-tracker.git
    cd symptom-tracker
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Start the development server**:
    ```bash
    npm run dev
    ```
    The app will be available at `http://localhost:3001`.

## Project Structure

For a detailed file tree, see [Source Tree](./source-tree.md).

-   **`src/app`**: Next.js App Router pages and API routes.
-   **`src/components`**: React components organized by feature.
-   **`src/lib/db`**: Dexie.js database client and schema.
-   **`src/lib/repositories`**: Data access layer.
-   **`public`**: Static assets and PWA service worker.

## Key Technologies

-   **Framework**: Next.js 15.5.4
-   **Language**: TypeScript 5.9.3
-   **UI**: React 19.1.0, Tailwind CSS 4, Radix UI
-   **Database**: Dexie.js 4.2.0 (IndexedDB wrapper)
-   **Testing**: Jest, React Testing Library

## Development Workflow

### Database Changes
The application uses **Dexie.js** for client-side storage. Schema changes require versioning.
See [Data Models](./data-models.md) for the current schema.

To modify the schema:
1.  Edit `src/lib/db/schema.ts` to define new interfaces.
2.  Edit `src/lib/db/client.ts` to increment the version number and define the new store.
3.  Add migration logic in the `.upgrade()` block if needed.

### Component Development
Components are organized by feature domain (e.g., `flares`, `medications`).
See [UI Components](./ui-components.md) for the component library structure.

### Testing
Run tests using Jest:
```bash
npm test
```
See `TESTING_GUIDE.md` in the project root for detailed testing strategies.

### Linting & Formatting
```bash
npm run lint
```
The project uses ESLint and Prettier. VS Code should be configured to format on save.

## Deployment

The application is deployed to **Vercel**.
-   **Build Command**: `npm run build`
-   **Output**: Static site with ISR.

## Documentation Links

-   [Architecture](./architecture.md)
-   [API Contracts](./api-contracts.md)
-   [Data Models](./data-models.md)
-   [UI Components](./ui-components.md)
-   [Source Tree](./source-tree.md)
