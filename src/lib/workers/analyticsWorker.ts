import { computeLinearRegression, Point } from '../utils/statistics/linearRegression';

interface WorkerMessage {
    type: 'linearRegression';
    payload: Point[];
}

self.onmessage = (event: MessageEvent<WorkerMessage>) => {
    const { type, payload } = event.data;

    if (type === 'linearRegression') {
        try {
            const result = computeLinearRegression(payload);
            self.postMessage({ type: 'success', payload: result });
        } catch (error) {
            self.postMessage({ type: 'error', payload: (error as Error).message });
        }
    }
};

// This is needed to make TypeScript treat this as a module.
export {};
