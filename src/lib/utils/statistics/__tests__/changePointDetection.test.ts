import { jest } from '@jest/globals';
import { pelt, squaredErrorCost } from '../changePointDetection';

describe('PELT Change Point Detection', () => {
    it('should detect a single change point in mean', () => {
        const data = [
            ...Array(50).fill(0),
            ...Array(50).fill(5),
        ];
        const penalty = 10; // A penalty value
        const changePoints = pelt(data, squaredErrorCost, penalty);
        expect(changePoints.length).toBe(1);
        expect(changePoints[0]).toBe(50);
    });

    it('should not detect change points in stable data', () => {
        const data = Array(100).fill(1);
        const penalty = 10;
        const changePoints = pelt(data, squaredErrorCost, penalty);
        expect(changePoints.length).toBe(0);
    });

    it('should detect multiple change points', () => {
        const data = [
            ...Array(30).fill(0),
            ...Array(30).fill(10),
            ...Array(40).fill(2),
        ];
        const penalty = 20;
        const changePoints = pelt(data, squaredErrorCost, penalty);
        expect(changePoints.length).toBe(2);
        expect(changePoints[0]).toBe(30);
        expect(changePoints[1]).toBe(60);
    });

    it('should be sensitive to the penalty value', () => {
        const data = [
            ...Array(30).fill(0),
            ...Array(30).fill(10),
            ...Array(40).fill(2),
        ];
        // A high penalty should result in fewer change points
        const highPenaltyChangePoints = pelt(data, squaredErrorCost, 1000);
        expect(highPenaltyChangePoints.length).toBeLessThan(2);

        // A low penalty might result in more change points
        const lowPenaltyChangePoints = pelt(data, squaredErrorCost, 5);
        expect(lowPenaltyChangePoints.length).toBeGreaterThanOrEqual(2);
    });

    it('should handle an empty array', () => {
        const data: number[] = [];
        const changePoints = pelt(data, squaredErrorCost, 10);
        expect(changePoints).toEqual([]);
    });
});
