/**
 * Manual mock for useCorrelations hooks (Test support for Story 6.4)
 */

export const useCorrelations = jest.fn(() => ({
  correlations: [],
  isLoading: false,
  error: null,
}));

export const useLoggedDaysCount = jest.fn(() => ({
  loggedDaysCount: 5,
  isLoading: false,
  error: null,
}));
