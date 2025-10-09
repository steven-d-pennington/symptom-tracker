/**
 * Calculates the sum of a subarray.
 * @param data The input array.
 * @param start The starting index (inclusive).
 * @param end The ending index (exclusive).
 * @returns The sum of the subarray.
 */
function sum(data: number[], start: number, end: number): number {
    let total = 0;
    for (let i = start; i < end; i++) {
        total += data[i];
    }
    return total;
}

/**
 * Calculates the mean of a subarray.
 * @param data The input array.
 * @param start The starting index (inclusive).
 * @param end The ending index (exclusive).
 * @returns The mean of the subarray.
 */
function mean(data: number[], start: number, end: number): number {
    if (start >= end) {
        return 0;
    }
    return sum(data, start, end) / (end - start);
}

/**
 * Squared error cost function for a segment.
 * This cost function is suitable for detecting changes in the mean of a signal.
 * @param data The input array.
 * @param start The starting index of the segment (inclusive).
 * @param end The ending index of the segment (exclusive).
 * @returns The squared error cost for the segment.
 */
export function squaredErrorCost(data: number[], start: number, end: number): number {
    if (start >= end) {
        return 0;
    }
    const segmentMean = mean(data, start, end);
    let cost = 0;
    for (let i = start; i < end; i++) {
        cost += Math.pow(data[i] - segmentMean, 2);
    }
    return cost;
}

/**
 * Implements the Pruned Exact Linear Time (PELT) algorithm for change point detection.
 * @param data The input time series data (array of numbers).
 * @param costFunction The cost function to use for evaluating segments. It should take (data, start, end) and return a number.
 * @param penalty The penalty value for introducing a new change point. A higher penalty results in fewer change points.
 * @returns An array of detected change point indices (0-based).
 */
export function pelt(data: number[], costFunction: (data: number[], start: number, end: number) => number, penalty: number): number[] {
    const n = data.length;
    if (n === 0) {
        return [];
    }

    // F[i] stores the minimum cost for a segmentation of data[0...i-1]
    const F: number[] = new Array(n + 1).fill(Infinity);
    F[0] = 0;

    // R[i] stores the last change point before index i
    const R: number[] = new Array(n + 1).fill(0);

    // Candidates for the previous change point (t in the algorithm description)
    // This array is pruned to maintain efficiency
    let tauCandidates: number[] = [0];

    for (let t = 1; t <= n; t++) {
        let minCost = Infinity;
        let bestTau = 0;
        let newTauCandidates: number[] = [];

        for (const tau of tauCandidates) {
            const currentCost = F[tau] + costFunction(data, tau, t) + penalty;
            if (currentCost < minCost) {
                minCost = currentCost;
                bestTau = tau;
            }
            // Pruning step: If F[tau] + cost(data, tau, t) is already greater than
            // the current minimum cost for F[t], then tau cannot be an optimal
            // previous change point for any future t' > t. So, we can prune it.
            // This is a simplified pruning condition, more rigorous conditions exist.
            // For squared error cost, a common pruning condition involves a constant K.
            // Here, we use a more general condition that might be less aggressive but safer.
            if (F[tau] + costFunction(data, tau, t) < minCost + penalty) { // Simplified pruning
                newTauCandidates.push(tau);
            }
        }

        F[t] = minCost;
        R[t] = bestTau;
        newTauCandidates.push(t); // Add current point as a candidate for future t'
        tauCandidates = newTauCandidates;
    }

    // Backtrack to find the change points
    const changePoints: number[] = [];
    let current = n;
    while (current > 0 && R[current] !== 0) {
        changePoints.push(R[current]);
        current = R[current];
    }

    // The change points are typically the end of the segments, so we adjust indices
    // and sort them in ascending order.
    return changePoints.reverse().filter(cp => cp !== 0);
}
