import { db } from "../db/client";
import { TriggerEventRecord } from "../db/schema";
import { generateId } from "../utils/idGenerator";

export interface TriggerEventDraft {
  id?: string;
  userId: string;
  triggerId: string;
  timestamp: number;
  intensity: 'low' | 'medium' | 'high';
  notes?: string;
}

export class TriggerEventRepository {
  /**
   * Validate intensity value
   */
  private validateIntensity(intensity: string): intensity is 'low' | 'medium' | 'high' {
    return intensity === 'low' || intensity === 'medium' || intensity === 'high';
  }

  /**
   * Get all trigger events for a user
   */
  async getAll(userId: string): Promise<TriggerEventRecord[]> {
    return await db.triggerEvents
      .where("userId")
      .equals(userId)
      .reverse()
      .sortBy("timestamp");
  }

  /**
   * Get trigger event by ID
   */
  async getById(id: string): Promise<TriggerEventRecord | undefined> {
    return await db.triggerEvents.get(id);
  }

  /**
   * Get trigger events by user ID
   */
  async findByUserId(userId: string): Promise<TriggerEventRecord[]> {
    return await db.triggerEvents
      .where("userId")
      .equals(userId)
      .reverse()
      .sortBy("timestamp");
  }

  /**
   * Get trigger events in date range
   * Optimized for timeline queries using [userId+timestamp] compound index
   */
  async findByDateRange(
    userId: string,
    startTimestamp: number,
    endTimestamp: number
  ): Promise<TriggerEventRecord[]> {
    return await db.triggerEvents
      .where("[userId+timestamp]")
      .between([userId, startTimestamp], [userId, endTimestamp], true, true)
      .reverse()
      .sortBy("timestamp");
  }

  /**
   * Get trigger events for a specific trigger
   * Useful for pattern analysis
   */
  async findByTriggerId(
    userId: string,
    triggerId: string
  ): Promise<TriggerEventRecord[]> {
    return await db.triggerEvents
      .where("[userId+triggerId]")
      .equals([userId, triggerId])
      .reverse()
      .sortBy("timestamp");
  }

  /**
   * Create a new trigger event
   * Validates required fields and intensity value
   */
  async create(eventData: TriggerEventDraft): Promise<string> {
    // Validate required fields
    if (!eventData.userId) {
      throw new Error("userId is required");
    }
    if (!eventData.triggerId) {
      throw new Error("triggerId is required");
    }
    if (eventData.timestamp === undefined || eventData.timestamp === null) {
      throw new Error("timestamp is required");
    }
    if (!eventData.intensity) {
      throw new Error("intensity is required");
    }

    // Validate intensity value
    if (!this.validateIntensity(eventData.intensity)) {
      throw new Error("intensity must be 'low', 'medium', or 'high'");
    }

    const id = eventData.id || generateId();
    const now = Date.now();

    const record: TriggerEventRecord = {
      id,
      userId: eventData.userId,
      triggerId: eventData.triggerId,
      timestamp: eventData.timestamp,
      intensity: eventData.intensity,
      notes: eventData.notes,
      createdAt: now,
      updatedAt: now,
    };

    await db.triggerEvents.add(record);
    return id;
  }

  /**
   * Update an existing trigger event
   */
  async update(
    id: string,
    updates: Partial<TriggerEventDraft>
  ): Promise<void> {
    const existing = await db.triggerEvents.get(id);
    if (!existing) {
      throw new Error(`Trigger event not found: ${id}`);
    }

    // Validate intensity if provided
    if (updates.intensity && !this.validateIntensity(updates.intensity)) {
      throw new Error("intensity must be 'low', 'medium', or 'high'");
    }

    const updateRecord: Partial<TriggerEventRecord> = {
      ...updates,
      updatedAt: Date.now(),
    };

    await db.triggerEvents.update(id, updateRecord);
  }

  /**
   * Delete a trigger event
   */
  async delete(id: string): Promise<void> {
    await db.triggerEvents.delete(id);
  }

  /**
   * Bulk create trigger events
   */
  async bulkCreate(events: TriggerEventDraft[]): Promise<string[]> {
    const now = Date.now();
    const records: TriggerEventRecord[] = [];

    for (const event of events) {
      // Validate required fields
      if (!event.userId || !event.triggerId || event.timestamp === undefined || !event.intensity) {
        throw new Error("Missing required fields in bulk create");
      }

      // Validate intensity
      if (!this.validateIntensity(event.intensity)) {
        throw new Error("intensity must be 'low', 'medium', or 'high'");
      }

      const id = event.id || generateId();

      records.push({
        id,
        userId: event.userId,
        triggerId: event.triggerId,
        timestamp: event.timestamp,
        intensity: event.intensity,
        notes: event.notes,
        createdAt: now,
        updatedAt: now,
      });
    }

    await db.triggerEvents.bulkAdd(records);
    return records.map(r => r.id);
  }

  /**
   * Get trigger frequency statistics
   */
  async getTriggerFrequency(
    userId: string,
    startTimestamp: number,
    endTimestamp: number
  ): Promise<{ triggerId: string; count: number; intensity: Record<string, number> }[]> {
    const events = await this.findByDateRange(userId, startTimestamp, endTimestamp);

    const frequencyMap = new Map<string, { count: number; intensity: Record<string, number> }>();

    events.forEach(event => {
      const existing = frequencyMap.get(event.triggerId);
      if (existing) {
        existing.count++;
        existing.intensity[event.intensity] = (existing.intensity[event.intensity] || 0) + 1;
      } else {
        frequencyMap.set(event.triggerId, {
          count: 1,
          intensity: { [event.intensity]: 1 },
        });
      }
    });

    return Array.from(frequencyMap.entries()).map(([triggerId, data]) => ({
      triggerId,
      count: data.count,
      intensity: data.intensity,
    }));
  }

  /**
   * Get recent notes for a trigger (for smart suggestions)
   */
  async getRecentNotes(
    userId: string,
    triggerId: string,
    limit: number = 10
  ): Promise<string[]> {
    const events = await db.triggerEvents
      .where("[userId+triggerId]")
      .equals([userId, triggerId])
      .reverse()
      .limit(limit)
      .toArray();

    const notes = events
      .filter(e => e.notes && e.notes.trim().length > 0)
      .map(e => e.notes!);

    // Return unique notes
    return Array.from(new Set(notes));
  }

  /**
   * Get events for today (for quick-log modal)
   */
  async getTodayEvents(userId: string): Promise<TriggerEventRecord[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfDay = today.getTime();

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const endOfDay = tomorrow.getTime();

    return await this.findByDateRange(userId, startOfDay, endOfDay);
  }

  /**
   * Get most common triggers for a user
   */
  async getMostCommonTriggers(
    userId: string,
    limit: number = 5
  ): Promise<{ triggerId: string; count: number }[]> {
    const allEvents = await this.findByUserId(userId);

    const countMap = new Map<string, number>();
    allEvents.forEach(event => {
      countMap.set(event.triggerId, (countMap.get(event.triggerId) || 0) + 1);
    });

    return Array.from(countMap.entries())
      .map(([triggerId, count]) => ({ triggerId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Get trigger statistics
   */
  async getStats(userId: string) {
    const events = await this.findByUserId(userId);

    if (events.length === 0) {
      return {
        total: 0,
        byIntensity: { low: 0, medium: 0, high: 0 },
        uniqueTriggers: 0,
      };
    }

    const intensityCounts = {
      low: events.filter(e => e.intensity === 'low').length,
      medium: events.filter(e => e.intensity === 'medium').length,
      high: events.filter(e => e.intensity === 'high').length,
    };

    const uniqueTriggers = new Set(events.map(e => e.triggerId)).size;

    return {
      total: events.length,
      byIntensity: intensityCounts,
      uniqueTriggers,
    };
  }
}

export const triggerEventRepository = new TriggerEventRepository();
