import { jest } from '@jest/globals';
import { flareRepository } from '../flareRepository';
import { db } from '../../db/client';
import { ActiveFlare } from '../../types/flare';

const mockDexie: any = {
  get: jest.fn(),
  update: jest.fn(),
  where: jest.fn(),
  equals: jest.fn(),
  toArray: jest.fn(),
};

const mockTable = jest.fn(() => mockDexie);

describe('FlareRepository - Enhanced Methods', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (db as any).table = mockTable;
    mockDexie.where.mockReturnValue(mockDexie);
    mockDexie.equals.mockReturnValue(mockDexie);
    mockDexie.get.mockResolvedValue(undefined);
    mockDexie.update.mockResolvedValue(undefined);
    mockDexie.toArray.mockResolvedValue([]);
  });

  describe('updateSeverity', () => {
    it('should update severity and add to history', async () => {
      const existingFlare: ActiveFlare = {
        id: 'flare-1',
        userId: 'user-1',
        symptomId: 'symptom-1',
        symptomName: 'Armpit Flare',
        startDate: new Date(),
        severity: 7,
        bodyRegions: ['armpit-right'],
        status: 'active',
        interventions: [],
        notes: '',
        photoIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDexie.get.mockResolvedValue(existingFlare);

      await flareRepository.updateSeverity('flare-1', 8);

      expect(mockDexie.update).toHaveBeenCalled();
      const updateCall = (mockDexie.update as jest.Mock).mock.calls[0];
      expect(updateCall[0]).toBe('flare-1');
      expect(updateCall[1].severity).toBe(8);
      expect(updateCall[1].severityHistory).toBeDefined();
      expect(updateCall[1].severityHistory.length).toBe(1);
      expect(updateCall[1].severityHistory[0].severity).toBe(8);
      expect(updateCall[1].severityHistory[0].timestamp).toBeDefined();
    });

    it('should auto-detect worsening status when severity increases by 2+', async () => {
      const existingFlare: ActiveFlare = {
        id: 'flare-1',
        userId: 'user-1',
        symptomId: 'symptom-1',
        symptomName: 'Armpit Flare',
        startDate: new Date(),
        severity: 5,
        bodyRegions: ['armpit-right'],
        status: 'active',
        interventions: [],
        notes: '',
        photoIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDexie.get.mockResolvedValue(existingFlare);

      await flareRepository.updateSeverity('flare-1', 8); // +3 increase

      const updateCall = (mockDexie.update as jest.Mock).mock.calls[0];
      expect(updateCall[1].status).toBe('worsening');
      expect(updateCall[1].severityHistory[0].status).toBe('worsening');
    });

    it('should auto-detect improving status when severity decreases by 2+', async () => {
      const existingFlare: ActiveFlare = {
        id: 'flare-1',
        userId: 'user-1',
        symptomId: 'symptom-1',
        symptomName: 'Armpit Flare',
        startDate: new Date(),
        severity: 8,
        bodyRegions: ['armpit-right'],
        status: 'worsening',
        interventions: [],
        notes: '',
        photoIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDexie.get.mockResolvedValue(existingFlare);

      await flareRepository.updateSeverity('flare-1', 5); // -3 decrease

      const updateCall = (mockDexie.update as jest.Mock).mock.calls[0];
      expect(updateCall[1].status).toBe('improving');
      expect(updateCall[1].severityHistory[0].status).toBe('improving');
    });

    it('should keep status as active when severity changes by <2', async () => {
      const existingFlare: ActiveFlare = {
        id: 'flare-1',
        userId: 'user-1',
        symptomId: 'symptom-1',
        symptomName: 'Armpit Flare',
        startDate: new Date(),
        severity: 7,
        bodyRegions: ['armpit-right'],
        status: 'active',
        interventions: [],
        notes: '',
        photoIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDexie.get.mockResolvedValue(existingFlare);

      await flareRepository.updateSeverity('flare-1', 8); // +1 increase

      const updateCall = (mockDexie.update as jest.Mock).mock.calls[0];
      expect(updateCall[1].status).toBe('active');
    });

    it('should accept manual status override', async () => {
      const existingFlare: ActiveFlare = {
        id: 'flare-1',
        userId: 'user-1',
        symptomId: 'symptom-1',
        symptomName: 'Armpit Flare',
        startDate: new Date(),
        severity: 5,
        bodyRegions: ['armpit-right'],
        status: 'active',
        interventions: [],
        notes: '',
        photoIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDexie.get.mockResolvedValue(existingFlare);

      await flareRepository.updateSeverity('flare-1', 6, 'improving');

      const updateCall = (mockDexie.update as jest.Mock).mock.calls[0];
      expect(updateCall[1].status).toBe('improving');
    });

    it('should throw error when flare not found', async () => {
      mockDexie.get.mockResolvedValue(undefined);

      await expect(
        flareRepository.updateSeverity('nonexistent', 8)
      ).rejects.toThrow('Flare not found: nonexistent');
    });

    it('should throw error for severity < 1', async () => {
      const existingFlare: ActiveFlare = {
        id: 'flare-1',
        userId: 'user-1',
        symptomId: 'symptom-1',
        symptomName: 'Armpit Flare',
        startDate: new Date(),
        severity: 7,
        bodyRegions: ['armpit-right'],
        status: 'active',
        interventions: [],
        notes: '',
        photoIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDexie.get.mockResolvedValue(existingFlare);

      await expect(
        flareRepository.updateSeverity('flare-1', 0)
      ).rejects.toThrow('Severity must be between 1 and 10');
    });

    it('should throw error for severity > 10', async () => {
      const existingFlare: ActiveFlare = {
        id: 'flare-1',
        userId: 'user-1',
        symptomId: 'symptom-1',
        symptomName: 'Armpit Flare',
        startDate: new Date(),
        severity: 7,
        bodyRegions: ['armpit-right'],
        status: 'active',
        interventions: [],
        notes: '',
        photoIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDexie.get.mockResolvedValue(existingFlare);

      await expect(
        flareRepository.updateSeverity('flare-1', 11)
      ).rejects.toThrow('Severity must be between 1 and 10');
    });

    it('should handle existing severityHistory backward compatibility', async () => {
      const existingFlare: any = {
        id: 'flare-1',
        userId: 'user-1',
        symptomId: 'symptom-1',
        symptomName: 'Armpit Flare',
        startDate: new Date(),
        severity: 7,
        bodyRegions: ['armpit-right'],
        status: 'active',
        interventions: [],
        notes: '',
        photoIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        severityHistory: [
          { timestamp: Date.now() - 3600000, severity: 6, status: 'active' },
        ],
      };

      mockDexie.get.mockResolvedValue(existingFlare);

      await flareRepository.updateSeverity('flare-1', 8);

      const updateCall = (mockDexie.update as jest.Mock).mock.calls[0];
      expect(updateCall[1].severityHistory.length).toBe(2);
      expect(updateCall[1].severityHistory[0].severity).toBe(6);
      expect(updateCall[1].severityHistory[1].severity).toBe(8);
    });
  });

  describe('addIntervention', () => {
    it('should add intervention to flare', async () => {
      const existingFlare: ActiveFlare = {
        id: 'flare-1',
        userId: 'user-1',
        symptomId: 'symptom-1',
        symptomName: 'Armpit Flare',
        startDate: new Date(),
        severity: 7,
        bodyRegions: ['armpit-right'],
        status: 'active',
        interventions: [],
        notes: '',
        photoIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDexie.get.mockResolvedValue(existingFlare);

      await flareRepository.addIntervention('flare-1', 'ice', 'Applied ice pack');

      expect(mockDexie.update).toHaveBeenCalled();
      const updateCall = (mockDexie.update as jest.Mock).mock.calls[0];
      expect(updateCall[0]).toBe('flare-1');
      expect(updateCall[1].interventions).toBeDefined();
      expect(updateCall[1].interventions.length).toBe(1);
      expect(updateCall[1].interventions[0].type).toBe('ice');
      expect(updateCall[1].interventions[0].notes).toBe('Applied ice pack');
      expect(updateCall[1].interventions[0].timestamp).toBeDefined();
    });

    it('should add multiple interventions', async () => {
      const existingFlare: any = {
        id: 'flare-1',
        userId: 'user-1',
        symptomId: 'symptom-1',
        symptomName: 'Armpit Flare',
        startDate: new Date(),
        severity: 7,
        bodyRegions: ['armpit-right'],
        status: 'active',
        interventions: [
          { timestamp: Date.now() - 3600000, type: 'ice', notes: 'First ice pack' },
        ],
        notes: '',
        photoIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDexie.get.mockResolvedValue(existingFlare);

      await flareRepository.addIntervention('flare-1', 'medication', 'Took ibuprofen');

      const updateCall = (mockDexie.update as jest.Mock).mock.calls[0];
      expect(updateCall[1].interventions.length).toBe(2);
      expect(updateCall[1].interventions[0].type).toBe('ice');
      expect(updateCall[1].interventions[1].type).toBe('medication');
    });

    it('should support all intervention types', async () => {
      const existingFlare: ActiveFlare = {
        id: 'flare-1',
        userId: 'user-1',
        symptomId: 'symptom-1',
        symptomName: 'Armpit Flare',
        startDate: new Date(),
        severity: 7,
        bodyRegions: ['armpit-right'],
        status: 'active',
        interventions: [],
        notes: '',
        photoIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDexie.get.mockResolvedValue(existingFlare);

      const types: Array<'ice' | 'medication' | 'rest' | 'other'> = ['ice', 'medication', 'rest', 'other'];

      for (const type of types) {
        await flareRepository.addIntervention('flare-1', type);
        const updateCall = (mockDexie.update as jest.Mock).mock.calls.slice(-1)[0];
        expect(updateCall[1].interventions[0].type).toBe(type);
        mockDexie.update.mockClear();
        mockDexie.get.mockResolvedValue(existingFlare);
      }
    });

    it('should allow intervention without notes', async () => {
      const existingFlare: ActiveFlare = {
        id: 'flare-1',
        userId: 'user-1',
        symptomId: 'symptom-1',
        symptomName: 'Armpit Flare',
        startDate: new Date(),
        severity: 7,
        bodyRegions: ['armpit-right'],
        status: 'active',
        interventions: [],
        notes: '',
        photoIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDexie.get.mockResolvedValue(existingFlare);

      await flareRepository.addIntervention('flare-1', 'rest');

      const updateCall = (mockDexie.update as jest.Mock).mock.calls[0];
      expect(updateCall[1].interventions[0].notes).toBeUndefined();
    });

    it('should throw error when flare not found', async () => {
      mockDexie.get.mockResolvedValue(undefined);

      await expect(
        flareRepository.addIntervention('nonexistent', 'ice')
      ).rejects.toThrow('Flare not found: nonexistent');
    });
  });

  describe('resolve', () => {
    it('should resolve flare with endDate and status', async () => {
      const existingFlare: ActiveFlare = {
        id: 'flare-1',
        userId: 'user-1',
        symptomId: 'symptom-1',
        symptomName: 'Armpit Flare',
        startDate: new Date(),
        severity: 3,
        bodyRegions: ['armpit-right'],
        status: 'improving',
        interventions: [],
        notes: '',
        photoIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDexie.get.mockResolvedValue(existingFlare);

      await flareRepository.resolve('flare-1');

      expect(mockDexie.update).toHaveBeenCalled();
      const updateCall = (mockDexie.update as jest.Mock).mock.calls[0];
      expect(updateCall[0]).toBe('flare-1');
      expect(updateCall[1].status).toBe('resolved');
      expect(updateCall[1].endDate).toBeInstanceOf(Date);
    });

    it('should resolve flare with resolution notes', async () => {
      const existingFlare: ActiveFlare = {
        id: 'flare-1',
        userId: 'user-1',
        symptomId: 'symptom-1',
        symptomName: 'Armpit Flare',
        startDate: new Date(),
        severity: 2,
        bodyRegions: ['armpit-right'],
        status: 'improving',
        interventions: [],
        notes: '',
        photoIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDexie.get.mockResolvedValue(existingFlare);

      await flareRepository.resolve('flare-1', 'Ice packs and rest helped significantly');

      const updateCall = (mockDexie.update as jest.Mock).mock.calls[0];
      expect(updateCall[1].resolutionNotes).toBe('Ice packs and rest helped significantly');
    });

    it('should throw error when flare not found', async () => {
      mockDexie.get.mockResolvedValue(undefined);

      await expect(
        flareRepository.resolve('nonexistent')
      ).rejects.toThrow('Flare not found: nonexistent');
    });
  });

  describe('getActiveFlaresWithTrend', () => {
    it('should return active flares with stable trend when no severity history', async () => {
      const activeFlares: ActiveFlare[] = [
        {
          id: 'flare-1',
          userId: 'user-1',
          symptomId: 'symptom-1',
          symptomName: 'Armpit Flare',
          startDate: new Date(),
          severity: 7,
          bodyRegions: ['armpit-right'],
          status: 'active',
          interventions: [],
          notes: '',
          photoIds: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockDexie.toArray.mockResolvedValue(activeFlares);

      const result = await flareRepository.getActiveFlaresWithTrend('user-1');

      expect(result.length).toBe(1);
      expect(result[0].trend).toBe('stable');
    });

    it('should calculate worsening trend based on 24h severity change', async () => {
      const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;

      const activeFlares: any[] = [
        {
          id: 'flare-1',
          userId: 'user-1',
          symptomId: 'symptom-1',
          symptomName: 'Armpit Flare',
          startDate: new Date(),
          severity: 8,
          bodyRegions: ['armpit-right'],
          status: 'worsening',
          interventions: [],
          notes: '',
          photoIds: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          severityHistory: [
            { timestamp: twentyFourHoursAgo, severity: 5, status: 'active' },
            { timestamp: Date.now(), severity: 8, status: 'worsening' },
          ],
        },
      ];

      mockDexie.toArray.mockResolvedValue(activeFlares);

      const result = await flareRepository.getActiveFlaresWithTrend('user-1');

      expect(result.length).toBe(1);
      expect(result[0].trend).toBe('worsening');
    });

    it('should calculate improving trend based on 24h severity change', async () => {
      const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;

      const activeFlares: any[] = [
        {
          id: 'flare-1',
          userId: 'user-1',
          symptomId: 'symptom-1',
          symptomName: 'Armpit Flare',
          startDate: new Date(),
          severity: 4,
          bodyRegions: ['armpit-right'],
          status: 'improving',
          interventions: [],
          notes: '',
          photoIds: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          severityHistory: [
            { timestamp: twentyFourHoursAgo, severity: 8, status: 'active' },
            { timestamp: Date.now(), severity: 4, status: 'improving' },
          ],
        },
      ];

      mockDexie.toArray.mockResolvedValue(activeFlares);

      const result = await flareRepository.getActiveFlaresWithTrend('user-1');

      expect(result.length).toBe(1);
      expect(result[0].trend).toBe('improving');
    });

    it('should calculate stable trend when severity change is <2', async () => {
      const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;

      const activeFlares: any[] = [
        {
          id: 'flare-1',
          userId: 'user-1',
          symptomId: 'symptom-1',
          symptomName: 'Armpit Flare',
          startDate: new Date(),
          severity: 7,
          bodyRegions: ['armpit-right'],
          status: 'active',
          interventions: [],
          notes: '',
          photoIds: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          severityHistory: [
            { timestamp: twentyFourHoursAgo, severity: 6, status: 'active' },
            { timestamp: Date.now(), severity: 7, status: 'active' },
          ],
        },
      ];

      mockDexie.toArray.mockResolvedValue(activeFlares);

      const result = await flareRepository.getActiveFlaresWithTrend('user-1');

      expect(result.length).toBe(1);
      expect(result[0].trend).toBe('stable');
    });

    it('should handle multiple flares with different trends', async () => {
      const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;

      const activeFlares: any[] = [
        {
          id: 'flare-1',
          userId: 'user-1',
          symptomId: 'symptom-1',
          symptomName: 'Armpit Flare',
          startDate: new Date(),
          severity: 8,
          bodyRegions: ['armpit-right'],
          status: 'worsening',
          interventions: [],
          notes: '',
          photoIds: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          severityHistory: [
            { timestamp: twentyFourHoursAgo, severity: 5, status: 'active' },
            { timestamp: Date.now(), severity: 8, status: 'worsening' },
          ],
        },
        {
          id: 'flare-2',
          userId: 'user-1',
          symptomId: 'symptom-1',
          symptomName: 'Groin Flare',
          startDate: new Date(),
          severity: 3,
          bodyRegions: ['groin-left'],
          status: 'improving',
          interventions: [],
          notes: '',
          photoIds: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          severityHistory: [
            { timestamp: twentyFourHoursAgo, severity: 7, status: 'active' },
            { timestamp: Date.now(), severity: 3, status: 'improving' },
          ],
        },
      ];

      mockDexie.toArray.mockResolvedValue(activeFlares);

      const result = await flareRepository.getActiveFlaresWithTrend('user-1');

      expect(result.length).toBe(2);
      expect(result[0].trend).toBe('worsening');
      expect(result[1].trend).toBe('improving');
    });
  });
});
