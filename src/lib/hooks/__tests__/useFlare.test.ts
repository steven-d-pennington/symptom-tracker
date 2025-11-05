/**
 * Tests for useFlare hook
 * Data-fetching hook for individual flare details
 */

import { jest } from '@jest/globals';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useFlare } from '../useFlare';
import { flareRepository } from '@/lib/repositories/flareRepository';

// Mock the flare repository
jest.mock('@/lib/repositories/flareRepository', () => ({
  flareRepository: {
    getFlareById: jest.fn(),
  },
}));

// Get reference to the mocked function
const mockGetFlareById = flareRepository.getFlareById as jest.MockedFunction<typeof flareRepository.getFlareById>;

describe('useFlare', () => {
  const mockUserId = 'user-123';
  const mockFlareId = 'flare-456';

  const mockFlareData = {
    id: mockFlareId,
    userId: mockUserId,
    status: 'active' as const,
    severity: 7,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    locations: [
      {
        id: 'loc-1',
        flareId: mockFlareId,
        bodyRegionId: 'knee-left',
        viewType: 'front' as const,
        coordinates: { x: 0.5, y: 0.6 },
        severity: 7,
        notes: 'Test location',
        createdAt: Date.now(),
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('[P1] Data fetching', () => {
    it('should fetch flare data successfully', async () => {
      mockGetFlareById.mockResolvedValue(mockFlareData);

      const { result } = renderHook(() => useFlare(mockFlareId, mockUserId));

      // Initially loading
      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeNull();

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockFlareData);
      expect(result.current.error).toBeNull();
      expect(mockGetFlareById).toHaveBeenCalledWith(mockUserId, mockFlareId);
    });

    it('should handle loading state correctly', async () => {
      mockGetFlareById.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve(mockFlareData), 100)
          )
      );

      const { result } = renderHook(() => useFlare(mockFlareId, mockUserId));

      // Should be loading initially
      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeNull();

      // Wait for loading to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockFlareData);
    });

    it('should handle error state when fetch fails', async () => {
      const mockError = new Error('Failed to fetch flare');
      mockGetFlareById.mockRejectedValue(mockError);

      const { result } = renderHook(() => useFlare(mockFlareId, mockUserId));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toBeNull();
      expect(result.current.error).toEqual(mockError);
      expect(mockGetFlareById).toHaveBeenCalledWith(mockUserId, mockFlareId);
    });

    it('should return null when flareId is missing', async () => {
      const { result } = renderHook(() => useFlare('', mockUserId));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toBeNull();
      expect(mockGetFlareById).not.toHaveBeenCalled();
    });

    it('should return null when userId is missing', async () => {
      const { result } = renderHook(() => useFlare(mockFlareId, ''));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toBeNull();
      expect(mockGetFlareById).not.toHaveBeenCalled();
    });
  });

  describe('[P1] Refetch functionality', () => {
    it('should provide refetch function that reloads data', async () => {
      mockGetFlareById.mockResolvedValue(mockFlareData);

      const { result } = renderHook(() => useFlare(mockFlareId, mockUserId));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockGetFlareById).toHaveBeenCalledTimes(1);

      // Call refetch
      act(() => {
        result.current.refetch();
      });

      await waitFor(() => {
        expect(mockGetFlareById).toHaveBeenCalledTimes(2);
      });
    });

    it('should handle refetch with updated data', async () => {
      const updatedFlareData = {
        ...mockFlareData,
        severity: 5,
        status: 'improving' as const,
      };

      mockGetFlareById
        .mockResolvedValueOnce(mockFlareData)
        .mockResolvedValueOnce(updatedFlareData);

      const { result } = renderHook(() => useFlare(mockFlareId, mockUserId));

      await waitFor(() => {
        expect(result.current.data?.severity).toBe(7);
      });

      // Refetch
      act(() => {
        result.current.refetch();
      });

      await waitFor(() => {
        expect(result.current.data?.severity).toBe(5);
        expect(result.current.data?.status).toBe('improving');
      });
    });
  });

  describe('[P2] Hook lifecycle', () => {
    it('should refetch when flareId changes', async () => {
      mockGetFlareById.mockResolvedValue(mockFlareData);

      const { result, rerender } = renderHook(
        ({ flareId, userId }) => useFlare(flareId, userId),
        {
          initialProps: { flareId: mockFlareId, userId: mockUserId },
        }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockGetFlareById).toHaveBeenCalledTimes(1);

      // Change flareId
      rerender({ flareId: 'flare-789', userId: mockUserId });

      await waitFor(() => {
        expect(mockGetFlareById).toHaveBeenCalledTimes(2);
      });

      expect(mockGetFlareById).toHaveBeenLastCalledWith(mockUserId, 'flare-789');
    });

    it('should refetch when userId changes', async () => {
      mockGetFlareById.mockResolvedValue(mockFlareData);

      const { result, rerender } = renderHook(
        ({ flareId, userId }) => useFlare(flareId, userId),
        {
          initialProps: { flareId: mockFlareId, userId: mockUserId },
        }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockGetFlareById).toHaveBeenCalledTimes(1);

      // Change userId
      rerender({ flareId: mockFlareId, userId: 'user-789' });

      await waitFor(() => {
        expect(mockGetFlareById).toHaveBeenCalledTimes(2);
      });

      expect(mockGetFlareById).toHaveBeenLastCalledWith('user-789', mockFlareId);
    });

    it('should not fetch when both IDs are empty', () => {
      const { result } = renderHook(() => useFlare('', ''));

      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeNull();
      expect(mockGetFlareById).not.toHaveBeenCalled();
    });
  });

  describe('[P1] Error recovery', () => {
    it('should clear previous error on successful refetch', async () => {
      const mockError = new Error('Network error');

      mockGetFlareById
        .mockRejectedValueOnce(mockError)
        .mockResolvedValueOnce(mockFlareData);

      const { result } = renderHook(() => useFlare(mockFlareId, mockUserId));

      // Wait for error
      await waitFor(() => {
        expect(result.current.error).toEqual(mockError);
      });

      // Refetch
      act(() => {
        result.current.refetch();
      });

      // Wait for success
      await waitFor(() => {
        expect(result.current.data).toEqual(mockFlareData);
        expect(result.current.error).toBeNull();
      });
    });

    it('should update error state on failed refetch', async () => {
      const firstError = new Error('First error');
      const secondError = new Error('Second error');

      mockGetFlareById
        .mockRejectedValueOnce(firstError)
        .mockRejectedValueOnce(secondError);

      const { result } = renderHook(() => useFlare(mockFlareId, mockUserId));

      await waitFor(() => {
        expect(result.current.error).toEqual(firstError);
      });

      // Refetch
      act(() => {
        result.current.refetch();
      });

      await waitFor(() => {
        expect(result.current.error).toEqual(secondError);
      });
    });
  });
});
