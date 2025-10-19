# Testing Strategy

This document outlines the testing strategy for the Pocket Symptom Tracker application, focusing on the patterns used for unit and integration tests.

## Overview

The project uses [Jest](https://jestjs.io/) with [ts-jest](https://kulshekhar.github.io/ts-jest/) to test TypeScript code. The configuration is set up to handle ES Modules, which requires a specific setup.

### Key Configuration (`jest.config.js` & `package.json`)

-   **ESM Support**: To handle ES Modules (`import`/`export`) and features like `import.meta.url`, the `test` script in `package.json` must use `node --experimental-vm-modules`.
-   **`ts-jest` Preset**: The `jest.config.js` uses the `ts-jest/presets/default-esm` preset and correctly configures the `transform` property for ESM.
-   **`@jest/globals`**: When writing tests in the ESM environment, `jest`, `describe`, `it`, `expect`, etc., are not automatically global. You must import them from `@jest/globals` at the top of each test file:
    ```typescript
    import { jest, describe, it, expect } from '@jest/globals';
    ```

## Testing Patterns

The application uses a dependency injection (DI) pattern to make code more modular and testable.

### Services and Repositories

Services (containing business logic) and Repositories (containing data access logic) are tested as units by mocking their dependencies.

**Example: Testing `TrendAnalysisService`**

The `TrendAnalysisService.test.ts` file demonstrates the standard pattern:

1.  **Create Mocks**: In the `beforeEach` block, create mock objects for all dependencies that the service needs (e.g., repositories, worker pools). These are simple objects with `jest.fn()` for each method that will be called.

    ```typescript
    // From TrendAnalysisService.test.ts
    beforeEach(() => {
        mockDailyEntryRepo = { getByDateRange: jest.fn() };
        mockAnalysisRepo = { getResult: jest.fn(), saveResult: jest.fn() };
        mockWorkerPool = { runTask: jest.fn(), terminate: jest.fn() };
    });
    ```

2.  **Inject Mocks**: Create a *new instance* of the service for each test, passing the mock dependencies into the constructor.

    ```typescript
    // From TrendAnalysisService.test.ts
    service = new TrendAnalysisService(
        mockDailyEntryRepo,
        // ...other mocks
        mockWorkerPool
    );
    ```

3.  **Configure Mocks**: In each test (`it` block), configure the return values for your mock functions to simulate different scenarios (e.g., cache hit, cache miss).

    ```typescript
    // From TrendAnalysisService.test.ts
    it('should return a cached result', async () => {
        const cached = { result: { slope: 1 } };
        mockAnalysisRepo.getResult.mockResolvedValue(cached); // Configure mock
        
        const result = await service.analyzeTrend(...);
        
        expect(result).toEqual(cached.result);
        expect(mockDailyEntryRepo.getByDateRange).not.toHaveBeenCalled(); // Assert
    });
    ```

### Web Worker Testing

Testing code that uses Web Workers is challenging in Jest's Node.js environment. The `import.meta.url` syntax, used to locate worker scripts, is not supported.

The solution in this project is:

1.  **Environment Check**: The `WorkerPool` constructor checks if `process.env.NODE_ENV === 'test'`. If it is, it does **not** attempt to create a `new Worker()`. This avoids the parsing error in Jest.
2.  **Dependency Injection**: The `TrendAnalysisService` receives the `WorkerPool` via DI. In tests, a mock `WorkerPool` object is injected (as shown above), allowing us to test the service's logic for offloading tasks to the worker without ever creating a real worker.

This strategy allows us to have full test coverage of the service logic while gracefully handling the limitations of the test environment.
