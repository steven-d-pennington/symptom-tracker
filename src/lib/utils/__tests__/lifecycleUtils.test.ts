/**
 * Lifecycle Utils Tests (Story 8.1)
 *
 * Comprehensive test suite for lifecycle utility functions.
 * Tests stage progression, transition validation, formatting, and helper functions.
 */

import {
  getNextLifecycleStage,
  isValidStageTransition,
  formatLifecycleStage,
  getLifecycleStageDescription,
  getLifecycleStageIcon,
  getDaysInStage,
} from '../lifecycleUtils';
import { FlareLifecycleStage, BodyMarkerRecord, BodyMarkerEventRecord } from '../../db/schema';

describe('lifecycleUtils (Story 8.1)', () => {
  describe('getNextLifecycleStage', () => {
    it('should return growth for onset', () => {
      expect(getNextLifecycleStage('onset')).toBe('growth');
    });

    it('should return rupture for growth', () => {
      expect(getNextLifecycleStage('growth')).toBe('rupture');
    });

    it('should return draining for rupture', () => {
      expect(getNextLifecycleStage('rupture')).toBe('draining');
    });

    it('should return healing for draining', () => {
      expect(getNextLifecycleStage('draining')).toBe('healing');
    });

    it('should return resolved for healing', () => {
      expect(getNextLifecycleStage('healing')).toBe('resolved');
    });

    it('should return null for resolved (terminal stage)', () => {
      expect(getNextLifecycleStage('resolved')).toBeNull();
    });
  });

  describe('isValidStageTransition', () => {
    describe('Valid forward transitions', () => {
      it('should allow onset → growth', () => {
        expect(isValidStageTransition('onset', 'growth')).toBe(true);
      });

      it('should allow growth → rupture', () => {
        expect(isValidStageTransition('growth', 'rupture')).toBe(true);
      });

      it('should allow rupture → draining', () => {
        expect(isValidStageTransition('rupture', 'draining')).toBe(true);
      });

      it('should allow draining → healing', () => {
        expect(isValidStageTransition('draining', 'healing')).toBe(true);
      });

      it('should allow healing → resolved', () => {
        expect(isValidStageTransition('healing', 'resolved')).toBe(true);
      });
    });

    describe('Invalid backward transitions', () => {
      it('should reject draining → growth', () => {
        expect(isValidStageTransition('draining', 'growth')).toBe(false);
      });

      it('should reject rupture → growth', () => {
        expect(isValidStageTransition('rupture', 'growth')).toBe(false);
      });

      it('should reject healing → draining', () => {
        expect(isValidStageTransition('healing', 'draining')).toBe(false);
      });
    });

    describe('Early resolution (resolved from any stage)', () => {
      it('should allow onset → resolved', () => {
        expect(isValidStageTransition('onset', 'resolved')).toBe(true);
      });

      it('should allow growth → resolved', () => {
        expect(isValidStageTransition('growth', 'resolved')).toBe(true);
      });

      it('should allow rupture → resolved', () => {
        expect(isValidStageTransition('rupture', 'resolved')).toBe(true);
      });

      it('should allow draining → resolved', () => {
        expect(isValidStageTransition('draining', 'resolved')).toBe(true);
      });

      it('should allow healing → resolved', () => {
        expect(isValidStageTransition('healing', 'resolved')).toBe(true);
      });
    });

    describe('Terminal state (resolved)', () => {
      it('should reject resolved → onset', () => {
        expect(isValidStageTransition('resolved', 'onset')).toBe(false);
      });

      it('should reject resolved → growth', () => {
        expect(isValidStageTransition('resolved', 'growth')).toBe(false);
      });

      it('should reject resolved → healing', () => {
        expect(isValidStageTransition('resolved', 'healing')).toBe(false);
      });
    });

    describe('Invalid transitions', () => {
      it('should reject onset → rupture (skipping growth)', () => {
        expect(isValidStageTransition('onset', 'rupture')).toBe(false);
      });

      it('should reject growth → healing (skipping rupture and draining)', () => {
        expect(isValidStageTransition('growth', 'healing')).toBe(false);
      });
    });
  });

  describe('formatLifecycleStage', () => {
    it('should capitalize first letter', () => {
      expect(formatLifecycleStage('onset')).toBe('Onset');
      expect(formatLifecycleStage('growth')).toBe('Growth');
      expect(formatLifecycleStage('rupture')).toBe('Rupture');
      expect(formatLifecycleStage('draining')).toBe('Draining');
      expect(formatLifecycleStage('healing')).toBe('Healing');
      expect(formatLifecycleStage('resolved')).toBe('Resolved');
    });
  });

  describe('getLifecycleStageDescription', () => {
    it('should return correct descriptions for all stages', () => {
      expect(getLifecycleStageDescription('onset')).toBe('Initial appearance of flare');
      expect(getLifecycleStageDescription('growth')).toBe('Flare is growing/increasing in size');
      expect(getLifecycleStageDescription('rupture')).toBe('Flare has ruptured/broken open');
      expect(getLifecycleStageDescription('draining')).toBe('Flare is draining fluid');
      expect(getLifecycleStageDescription('healing')).toBe('Flare is healing/closing up');
      expect(getLifecycleStageDescription('resolved')).toBe('Flare is fully resolved');
    });
  });

  describe('getLifecycleStageIcon', () => {
    it('should return correct icons for all stages', () => {
      expect(getLifecycleStageIcon('onset')).toBe('🔴');
      expect(getLifecycleStageIcon('growth')).toBe('📈');
      expect(getLifecycleStageIcon('rupture')).toBe('💥');
      expect(getLifecycleStageIcon('draining')).toBe('💧');
      expect(getLifecycleStageIcon('healing')).toBe('🩹');
      expect(getLifecycleStageIcon('resolved')).toBe('✅');
    });
  });

  describe('getDaysInStage', () => {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const threeDaysAgo = now - 3 * 24 * 60 * 60 * 1000;

    it('should calculate days since marker creation when no stage change events', () => {
      const marker: BodyMarkerRecord = {
        id: 'test-1',
        userId: 'user-1',
        type: 'flare',
        bodyRegionId: 'armpit',
        startDate: threeDaysAgo,
        status: 'active',
        initialSeverity: 5,
        currentSeverity: 5,
        createdAt: threeDaysAgo,
        updatedAt: threeDaysAgo,
      };

      const days = getDaysInStage(marker, []);
      expect(days).toBe(3);
    });

    it('should calculate days since most recent stage change', () => {
      const marker: BodyMarkerRecord = {
        id: 'test-2',
        userId: 'user-1',
        type: 'flare',
        bodyRegionId: 'armpit',
        startDate: threeDaysAgo,
        status: 'active',
        initialSeverity: 5,
        currentSeverity: 5,
        currentLifecycleStage: 'growth',
        createdAt: threeDaysAgo,
        updatedAt: oneDayAgo,
      };

      const events: BodyMarkerEventRecord[] = [
        {
          id: 'event-1',
          markerId: 'test-2',
          userId: 'user-1',
          eventType: 'lifecycle_stage_change',
          timestamp: oneDayAgo,
          lifecycleStage: 'growth',
        },
      ];

      const days = getDaysInStage(marker, events);
      expect(days).toBe(1);
    });

    it('should use most recent event when multiple stage changes exist', () => {
      const marker: BodyMarkerRecord = {
        id: 'test-3',
        userId: 'user-1',
        type: 'flare',
        bodyRegionId: 'armpit',
        startDate: threeDaysAgo,
        status: 'active',
        initialSeverity: 5,
        currentSeverity: 5,
        currentLifecycleStage: 'rupture',
        createdAt: threeDaysAgo,
        updatedAt: oneDayAgo,
      };

      const events: BodyMarkerEventRecord[] = [
        {
          id: 'event-1',
          markerId: 'test-3',
          userId: 'user-1',
          eventType: 'lifecycle_stage_change',
          timestamp: threeDaysAgo,
          lifecycleStage: 'growth',
        },
        {
          id: 'event-2',
          markerId: 'test-3',
          userId: 'user-1',
          eventType: 'lifecycle_stage_change',
          timestamp: oneDayAgo,
          lifecycleStage: 'rupture',
        },
      ];

      const days = getDaysInStage(marker, events);
      expect(days).toBe(1); // Should use most recent event (rupture)
    });

    it('should filter out non-lifecycle events', () => {
      const marker: BodyMarkerRecord = {
        id: 'test-4',
        userId: 'user-1',
        type: 'flare',
        bodyRegionId: 'armpit',
        startDate: threeDaysAgo,
        status: 'active',
        initialSeverity: 5,
        currentSeverity: 5,
        currentLifecycleStage: 'growth',
        createdAt: threeDaysAgo,
        updatedAt: oneDayAgo,
      };

      const events: BodyMarkerEventRecord[] = [
        {
          id: 'event-1',
          markerId: 'test-4',
          userId: 'user-1',
          eventType: 'severity_update',
          timestamp: threeDaysAgo,
          severity: 6,
        },
        {
          id: 'event-2',
          markerId: 'test-4',
          userId: 'user-1',
          eventType: 'lifecycle_stage_change',
          timestamp: oneDayAgo,
          lifecycleStage: 'growth',
        },
      ];

      const days = getDaysInStage(marker, events);
      expect(days).toBe(1); // Should only consider lifecycle_stage_change event
    });
  });
});

