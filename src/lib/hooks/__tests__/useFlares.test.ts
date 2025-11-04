/**
 * Tests for useFlares hook
 * Data-fetching hook for flares with trend calculation and filtering
 * Story 2.1: Uses getActiveFlares + getFlareHistory API
 */

import { jest } from '@jest/globals';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useFlares } from '../useFlares';
import { flareRepository } from '@/lib/repositories/flareRepository';
import { FlareRecord, FlareEventRecord } from '@/lib/db/schema';

// Mock the flare repository
jest.mock('@/lib/repositories/flareRepository', () => ({
  flareRepository: {
    getActiveFlares: jest.fn(),
    getResolvedFlares: jest.fn(),
    getFlareHistory: jest.fn(),
    getFlareById: jest.fn(),
  },
}));

// Get references to the mocked functions
const mockGetActiveFlares = flareRepository.getActiveFlares as jest.MockedFunction<typeof flareRepository.getActiveFlares>;
const mockGetResolvedFlares = flareRepository.getResolvedFlares as jest.MockedFunction<typeof flareRepository.getResolvedFlares>;
const mockGetFlareHistory = flareRepository.getFlareHistory as jest.MockedFunction<typeof flareRepository.getFlareHistory>;
const mockGetFlareById = flareRepository.getFlareById as jest.MockedFunction<typeof flareRepository.getFlareById>;

describe('useFlares', () => {
  const mockUserId = 'user-123';

  const mockFlareRecord: FlareRecord = {
    id: 'flare-1',
    userId: mockUserId,
    bodyRegionId: 'knee-left',
    viewType: 'front',
    coordinates: { x: 0.5, y: 0.6 },
    currentSeverity: 7,
    status: 'active',
    startDate: Date.now(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const mockEnrichedFlare = {
    ...mockFlareRecord,
    bodyLocations: [
      {
        id: 'loc-1',
        flareId: 'flare-1',
        bodyRegionId: 'knee-left',
        viewType: 'front' as const,
        coordinates: { x: 0.5, y: 0.6 },
        severity: 7,
        notes: '',
        createdAt: Date.now(),
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('[P1] Trend calculation - calculateTrend (internal)', () => {
    it('should return "worsening" when severity increases', async () => {
      const events: FlareEventRecord[] = [
        {
          id: 'evt-1',
          flareId: 'flare-1',
          userId: mockUserId,
          eventType: 'created',
          severity: 5,
          timestamp: Date.now() - 1000,
          createdAt: Date.now() - 1000,
        },
        {
          id: 'evt-2',
          flareId: 'flare-1',
          userId: mockUserId,
          eventType: 'severity_update',
          severity: 8,
          timestamp: Date.now(),
          createdAt: Date.now(),
        },
      ];

      mockGetActiveFlares.mockResolvedValue([mockFlareRecord]);
      mockGetFlareHistory.mockResolvedValue(events);
      mockGetFlareById.mockResolvedValue(mockEnrichedFlare);

      const { result } = renderHook(() => useFlares({ userId: mockUserId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Trend should be "worsening" because severity went from 5 to 8
      expect(result.current.data[0]?.trend).toBe('worsening');
    });

    it('should return "improving" when severity decreases', async () => {
      const events: FlareEventRecord[] = [
        {
          id: 'evt-1',
          flareId: 'flare-1',
          userId: mockUserId,
          eventType: 'created',
          severity: 8,
          timestamp: Date.now() - 1000,
          createdAt: Date.now() - 1000,
        },
        {
          id: 'evt-2',
          flareId: 'flare-1',
          userId: mockUserId,
          eventType: 'severity_update',
          severity: 5,
          timestamp: Date.now(),
          createdAt: Date.now(),
        },
      ];

      mockGetActiveFlares.mockResolvedValue([mockFlareRecord]);
      mockGetFlareHistory.mockResolvedValue(events);
      mockGetFlareById.mockResolvedValue(mockEnrichedFlare);

      const { result } = renderHook(() => useFlares({ userId: mockUserId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data[0]?.trend).toBe('improving');
    });

    it('should return "stable" when severity is unchanged', async () => {
      const events: FlareEventRecord[] = [
        {
          id: 'evt-1',
          flareId: 'flare-1',
          userId: mockUserId,
          eventType: 'created',
          severity: 7,
          timestamp: Date.now() - 1000,
          createdAt: Date.now() - 1000,
        },
        {
          id: 'evt-2',
          flareId: 'flare-1',
          userId: mockUserId,
          eventType: 'severity_update',
          severity: 7,
          timestamp: Date.now(),
          createdAt: Date.now(),
        },
      ];

      mockGetActiveFlares.mockResolvedValue([mockFlareRecord]);
      mockGetFlareHistory.mockResolvedValue(events);
      mockGetFlareById.mockResolvedValue(mockEnrichedFlare);

      const { result } = renderHook(() => useFlares({ userId: mockUserId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data[0]?.trend).toBe('stable');
    });

    it('should return "stable" with insufficient data (< 2 events)', async () => {
      const events: FlareEventRecord[] = [
        {
          id: 'evt-1',
          flareId: 'flare-1',
          userId: mockUserId,
          eventType: 'created',
          severity: 7,
          timestamp: Date.now(),
          createdAt: Date.now(),
        },
      ];

      mockGetActiveFlares.mockResolvedValue([mockFlareRecord]);
      mockGetFlareHistory.mockResolvedValue(events);
      mockGetFlareById.mockResolvedValue(mockEnrichedFlare);

      const { result } = renderHook(() => useFlares({ userId: mockUserId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data[0]?.trend).toBe('stable');
    });
  });

  describe('[P1] Data fetching - active flares', () => {
    it('should fetch active flares successfully', async () => {
      const events: FlareEventRecord[] = [
        {
          id: 'evt-1',
          flareId: 'flare-1',
          userId: mockUserId,
          eventType: 'created',
          severity: 7,
          timestamp: Date.now(),
          createdAt: Date.now(),
        },
      ];

      mockGetActiveFlares.mockResolvedValue([mockFlareRecord]);
      mockGetFlareHistory.mockResolvedValue(events);
      mockGetFlareById.mockResolvedValue(mockEnrichedFlare);

      const { result } = renderHook(() => useFlares({ userId: mockUserId }));

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toEqual([]);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toHaveLength(1);
      expect(result.current.data[0].id).toBe('flare-1');
      expect(result.current.error).toBeNull();
      expect(mockGetActiveFlares).toHaveBeenCalledWith(mockUserId);
    });

    it('should handle loading state correctly', async () => {
      mockGetActiveFlares.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve([mockFlareRecord]), 100))
      );
      mockGetFlareHistory.mockResolvedValue([]);
      mockGetFlareById.mockResolvedValue(mockEnrichedFlare);

      const { result } = renderHook(() => useFlares({ userId: mockUserId }));

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should handle error state when fetch fails', async () => {
      const mockError = new Error('Network error');
      mockGetActiveFlares.mockRejectedValue(mockError);

      const { result } = renderHook(() => useFlares({ userId: mockUserId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isError).toBe(true);
      expect(result.current.error).toEqual(mockError);
      expect(result.current.data).toEqual([]);
    });
  });

  describe('[P1] Data fetching - resolved flares', () => {
    it('should fetch resolved flares when status="resolved"', async () => {
      const resolvedFlare: FlareRecord = {
        ...mockFlareRecord,
        status: 'resolved',
      };

      mockGetResolvedFlares.mockResolvedValue([resolvedFlare]);
      mockGetFlareHistory.mockResolvedValue([]);
      mockGetFlareById.mockResolvedValue({
        ...resolvedFlare,
        bodyLocations: [],
      });

      const { result } = renderHook(() =>
        useFlares({ userId: mockUserId, status: 'resolved' })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockGetResolvedFlares).toHaveBeenCalledWith(mockUserId);
      expect(mockGetActiveFlares).not.toHaveBeenCalled();
    });

    it('should fetch resolved flares when includeResolved=true and status includes "resolved"', async () => {
      mockGetResolvedFlares.mockResolvedValue([mockFlareRecord]);
      mockGetFlareHistory.mockResolvedValue([]);
      mockGetFlareById.mockResolvedValue(mockEnrichedFlare);

      const { result } = renderHook(() =>
        useFlares({
          userId: mockUserId,
          includeResolved: true,
          status: ['active', 'resolved'] as any,
        })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockGetResolvedFlares).toHaveBeenCalled();
    });
  });

  describe('[P2] Filtering by status', () => {
    it('should filter by single status', async () => {
      const activeFlare: FlareRecord = { ...mockFlareRecord, status: 'active' };
      const improvingFlare: FlareRecord = { ...mockFlareRecord, id: 'flare-2', status: 'improving' };

      mockGetActiveFlares.mockResolvedValue([activeFlare, improvingFlare]);
      mockGetFlareHistory.mockResolvedValue([]);
      mockGetFlareById.mockImplementation(async (_, id) => ({
        ...(id === 'flare-1' ? activeFlare : improvingFlare),
        bodyLocations: [],
      }));

      const { result } = renderHook(() =>
        useFlares({ userId: mockUserId, status: 'active' })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toHaveLength(1);
      expect(result.current.data[0].status).toBe('active');
    });

    it('should filter by multiple statuses', async () => {
      const activeFlare: FlareRecord = { ...mockFlareRecord, status: 'active' };
      const improvingFlare: FlareRecord = { ...mockFlareRecord, id: 'flare-2', status: 'improving' };
      const worseningFlare: FlareRecord = { ...mockFlareRecord, id: 'flare-3', status: 'worsening' };

      mockGetActiveFlares.mockResolvedValue([
        activeFlare,
        improvingFlare,
        worseningFlare,
      ]);
      mockGetFlareHistory.mockResolvedValue([]);
      mockGetFlareById.mockImplementation(async (_, id) => ({
        ...(id === 'flare-1' ? activeFlare : id === 'flare-2' ? improvingFlare : worseningFlare),
        bodyLocations: [],
      }));

      const { result } = renderHook(() =>
        useFlares({ userId: mockUserId, status: ['active', 'worsening'] as any })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toHaveLength(2);
      expect(result.current.data.map(f => f.status).sort()).toEqual(['active', 'worsening']);
    });
  });

  describe('[P2] Filtering by bodyRegionId', () => {
    it('should filter by bodyRegionId', async () => {
      const kneeFlare: FlareRecord = { ...mockFlareRecord, bodyRegionId: 'knee-left' };
      const shoulderFlare: FlareRecord = {
        ...mockFlareRecord,
        id: 'flare-2',
        bodyRegionId: 'shoulder-right',
      };

      mockGetActiveFlares.mockResolvedValue([kneeFlare, shoulderFlare]);
      mockGetFlareHistory.mockResolvedValue([]);
      mockGetFlareById.mockImplementation(async (_, id) => ({
        ...(id === 'flare-1' ? kneeFlare : shoulderFlare),
        bodyLocations: id === 'flare-1'
          ? [{ ...mockEnrichedFlare.bodyLocations[0], bodyRegionId: 'knee-left' }]
          : [{ ...mockEnrichedFlare.bodyLocations[0], bodyRegionId: 'shoulder-right', id: 'loc-2' }],
      }));

      const { result } = renderHook(() =>
        useFlares({ userId: mockUserId, bodyRegionId: 'knee-left' })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toHaveLength(1);
      expect(result.current.data[0].bodyRegions).toContain('knee-left');
    });
  });

  describe('[P1] Refetch functionality', () => {
    it('should provide refetch function that reloads data', async () => {
      mockGetActiveFlares.mockResolvedValue([mockFlareRecord]);
      mockGetFlareHistory.mockResolvedValue([]);
      mockGetFlareById.mockResolvedValue(mockEnrichedFlare);

      const { result } = renderHook(() => useFlares({ userId: mockUserId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockGetActiveFlares).toHaveBeenCalledTimes(1);

      // Call refetch
      act(() => {
        result.current.refetch();
      });

      await waitFor(() => {
        expect(mockGetActiveFlares).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('[P2] Hook lifecycle', () => {
    it('should cleanup on unmount', async () => {
      mockGetActiveFlares.mockResolvedValue([mockFlareRecord]);
      mockGetFlareHistory.mockResolvedValue([]);
      mockGetFlareById.mockResolvedValue(mockEnrichedFlare);

      const { result, unmount } = renderHook(() => useFlares({ userId: mockUserId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should not throw on unmount
      expect(() => unmount()).not.toThrow();
    });

    it('should refetch when options change', async () => {
      mockGetActiveFlares.mockResolvedValue([mockFlareRecord]);
      mockGetFlareHistory.mockResolvedValue([]);
      mockGetFlareById.mockResolvedValue(mockEnrichedFlare);

      const { result, rerender } = renderHook(
        (props) => useFlares(props),
        { initialProps: { userId: mockUserId } }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockGetActiveFlares).toHaveBeenCalledTimes(1);

      // Change options
      rerender({ userId: mockUserId, includeResolved: true });

      await waitFor(() => {
        expect(mockGetActiveFlares).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('[P1] Story 3.7.5 - Multi-location flare support', () => {
    it('should handle flares with multiple body locations', async () => {
      const multiLocationFlare = {
        ...mockFlareRecord,
        bodyLocations: [
          {
            id: 'loc-1',
            flareId: 'flare-1',
            bodyRegionId: 'knee-left',
            viewType: 'front' as const,
            coordinates: { x: 0.5, y: 0.6 },
            severity: 7,
            notes: '',
            createdAt: Date.now(),
          },
          {
            id: 'loc-2',
            flareId: 'flare-1',
            bodyRegionId: 'knee-right',
            viewType: 'front' as const,
            coordinates: { x: 0.5, y: 0.6 },
            severity: 7,
            notes: '',
            createdAt: Date.now(),
          },
        ],
      };

      mockGetActiveFlares.mockResolvedValue([mockFlareRecord]);
      mockGetFlareHistory.mockResolvedValue([]);
      mockGetFlareById.mockResolvedValue(multiLocationFlare);

      const { result } = renderHook(() => useFlares({ userId: mockUserId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const flare = result.current.data[0];
      expect(flare.bodyRegions).toEqual(['knee-left', 'knee-right']);
      expect(flare.coordinates).toHaveLength(2);
      expect(flare.coordinates?.[0].locationId).toBe('loc-1');
      expect(flare.coordinates?.[1].locationId).toBe('loc-2');
    });

    it('should fallback to legacy single coordinate when bodyLocations is empty', async () => {
      const legacyFlare = {
        ...mockFlareRecord,
        bodyLocations: [],
      };

      mockGetActiveFlares.mockResolvedValue([mockFlareRecord]);
      mockGetFlareHistory.mockResolvedValue([]);
      mockGetFlareById.mockResolvedValue(legacyFlare);

      const { result } = renderHook(() => useFlares({ userId: mockUserId }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const flare = result.current.data[0];
      expect(flare.coordinates).toHaveLength(1);
      expect(flare.coordinates?.[0].locationId).toContain('legacy');
      expect(flare.coordinates?.[0].x).toBe(0.5);
      expect(flare.coordinates?.[0].y).toBe(0.6);
    });
  });
});
