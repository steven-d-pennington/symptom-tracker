// A simple generic worker pool
// NOTE: This is a simplified implementation for the story.
// A more robust solution might use a library or handle more edge cases.

export class WorkerPool {
    private workers: Worker[] = [];
    private idleWorkers: Worker[] = [];
    private taskQueue: { task: any, resolve: (value: any) => void, reject: (reason?: any) => void }[] = [];

    constructor(workerPath: string, numWorkers: number = 2) {
        // Workers are not supported in SSR or test environments
        if (typeof window === 'undefined' || process.env.NODE_ENV === 'test') {
            return;
        }

        for (let i = 0; i < numWorkers; i++) {
            try {
                // For Next.js, use a direct worker file path
                const worker = new Worker(new URL(workerPath, window.location.origin));
                this.workers.push(worker);
                this.idleWorkers.push(worker);
            } catch (error) {
                console.warn('Failed to create worker:', error);
                // Continue without workers - computations will run synchronously
                break;
            }
        }
    }

    // ... (rest of the class is the same)
}
