import { db } from "../db/client";
import { MedicationEventRecord } from "../db/schema";
import { generateId } from "../utils/idGenerator";
import { medicationRepository } from "./medicationRepository";

export interface MedicationEventDraft {
  id?: string;
  userId: string;
  medicationId: string;
  timestamp: number;
  taken: boolean;
  dosage?: string;
  notes?: string;
}

export class MedicationEventRepository {
  /**
   * Calculate timing warning based on medication schedule
   * Returns 'early' if taken >2h before scheduled, 'late' if taken >2h after, null otherwise
   */
  private async calculateTimingWarning(
    medicationId: string,
    eventTimestamp: number
  ): Promise<'early' | 'late' | null> {
    const medication = await medicationRepository.getById(medicationId);
    if (!medication || !medication.schedule || medication.schedule.length === 0) {
      return null; // No schedule = no warning
    }

    const eventDate = new Date(eventTimestamp);
    const eventDayOfWeek = eventDate.getDay();
    const eventHours = eventDate.getHours();
    const eventMinutes = eventDate.getMinutes();
    const eventTimeInMinutes = eventHours * 60 + eventMinutes;

    // Find relevant schedule entries for this day of week
    const relevantSchedules = medication.schedule.filter(s =>
      s.daysOfWeek.includes(eventDayOfWeek)
    );

    if (relevantSchedules.length === 0) {
      return null; // Not scheduled for this day
    }

    // Check each schedule entry
    for (const schedule of relevantSchedules) {
      const [schedHours, schedMinutes] = schedule.time.split(':').map(Number);
      const schedTimeInMinutes = schedHours * 60 + schedMinutes;

      const diffMinutes = eventTimeInMinutes - schedTimeInMinutes;

      // Within ±2 hours (120 minutes) = no warning
      if (Math.abs(diffMinutes) <= 120) {
        return null;
      }

      // More than 2 hours early
      if (diffMinutes < -120) {
        return 'early';
      }

      // More than 2 hours late
      if (diffMinutes > 120) {
        return 'late';
      }
    }

    return null;
  }

  /**
   * Get all medication events for a user
   */
  async getAll(userId: string): Promise<MedicationEventRecord[]> {
    return await db.medicationEvents
      .where("userId")
      .equals(userId)
      .reverse()
      .sortBy("timestamp");
  }

  /**
   * Get medication event by ID
   */
  async getById(id: string): Promise<MedicationEventRecord | undefined> {
    return await db.medicationEvents.get(id);
  }

  /**
   * Get medication events by user ID
   */
  async findByUserId(userId: string): Promise<MedicationEventRecord[]> {
    return await db.medicationEvents
      .where("userId")
      .equals(userId)
      .reverse()
      .sortBy("timestamp");
  }

  /**
   * Get medication events in date range
   * Optimized for timeline queries using [userId+timestamp] compound index
   */
  async findByDateRange(
    userId: string,
    startTimestamp: number,
    endTimestamp: number
  ): Promise<MedicationEventRecord[]> {
    const records = await db.medicationEvents
      .where("[userId+timestamp]")
      .between([userId, startTimestamp], [userId, endTimestamp], true, true)
      .toArray();

    // Sort manually to ensure correct results (sortBy() can break .between() filters)
    return records.sort((a, b) => b.timestamp - a.timestamp); // Descending order
  }

  /**
   * Get medication events for a specific medication
   * Useful for adherence tracking
   */
  async findByMedicationId(
    userId: string,
    medicationId: string
  ): Promise<MedicationEventRecord[]> {
    return await db.medicationEvents
      .where("[userId+medicationId]")
      .equals([userId, medicationId])
      .reverse()
      .sortBy("timestamp");
  }

  /**
   * Create a new medication event
   * Validates required fields and calculates timing warnings
   */
  async create(eventData: MedicationEventDraft): Promise<string> {
    // Validate required fields
    if (!eventData.userId) {
      throw new Error("userId is required");
    }
    if (!eventData.medicationId) {
      throw new Error("medicationId is required");
    }
    if (eventData.timestamp === undefined || eventData.timestamp === null) {
      throw new Error("timestamp is required");
    }
    if (eventData.taken === undefined || eventData.taken === null) {
      throw new Error("taken is required");
    }

    const id = eventData.id || generateId();
    const now = Date.now();

    // Calculate timing warning
    const timingWarning = await this.calculateTimingWarning(
      eventData.medicationId,
      eventData.timestamp
    );

    const record: MedicationEventRecord = {
      id,
      userId: eventData.userId,
      medicationId: eventData.medicationId,
      timestamp: eventData.timestamp,
      taken: eventData.taken,
      dosage: eventData.dosage,
      notes: eventData.notes,
      timingWarning,
      createdAt: now,
      updatedAt: now,
    };

    await db.medicationEvents.add(record);
    return id;
  }

  /**
   * Update an existing medication event
   */
  async update(
    id: string,
    updates: Partial<MedicationEventDraft>
  ): Promise<void> {
    const existing = await db.medicationEvents.get(id);
    if (!existing) {
      throw new Error(`Medication event not found: ${id}`);
    }

    const updateRecord: Partial<MedicationEventRecord> = {
      ...updates,
      updatedAt: Date.now(),
    };

    // Recalculate timing warning if timestamp or medicationId changed
    if (updates.timestamp !== undefined || updates.medicationId !== undefined) {
      const medicationId = updates.medicationId || existing.medicationId;
      const timestamp = updates.timestamp || existing.timestamp;
      updateRecord.timingWarning = await this.calculateTimingWarning(
        medicationId,
        timestamp
      );
    }

    await db.medicationEvents.update(id, updateRecord);
  }

  /**
   * Delete a medication event
   */
  async delete(id: string): Promise<void> {
    await db.medicationEvents.delete(id);
  }

  /**
   * Bulk create medication events
   */
  async bulkCreate(events: MedicationEventDraft[]): Promise<string[]> {
    const now = Date.now();
    const records: MedicationEventRecord[] = [];

    for (const event of events) {
      // Validate required fields
      if (!event.userId || !event.medicationId || event.timestamp === undefined || event.taken === undefined) {
        throw new Error("Missing required fields in bulk create");
      }

      const id = event.id || generateId();
      const timingWarning = await this.calculateTimingWarning(
        event.medicationId,
        event.timestamp
      );

      records.push({
        id,
        userId: event.userId,
        medicationId: event.medicationId,
        timestamp: event.timestamp,
        taken: event.taken,
        dosage: event.dosage,
        notes: event.notes,
        timingWarning,
        createdAt: now,
        updatedAt: now,
      });
    }

    await db.medicationEvents.bulkAdd(records);
    return records.map(r => r.id);
  }

  /**
   * Get medication adherence statistics
   */
  async getAdherenceStats(
    userId: string,
    medicationId: string,
    startTimestamp: number,
    endTimestamp: number
  ) {
    const events = await db.medicationEvents
      .where("[userId+medicationId]")
      .equals([userId, medicationId])
      .and(e => e.timestamp >= startTimestamp && e.timestamp <= endTimestamp)
      .toArray();

    const taken = events.filter(e => e.taken).length;
    const skipped = events.filter(e => !e.taken).length;
    const total = events.length;

    return {
      total,
      taken,
      skipped,
      adherenceRate: total > 0 ? (taken / total) * 100 : 0,
      withTimingWarnings: events.filter(e => e.timingWarning !== null).length,
    };
  }

  /**
   * Get recent notes for a medication (for smart suggestions)
   */
  async getRecentNotes(
    userId: string,
    medicationId: string,
    limit: number = 10
  ): Promise<string[]> {
    const events = await db.medicationEvents
      .where("[userId+medicationId]")
      .equals([userId, medicationId])
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
   * Get events for today (for medication log modal)
   */
  async getTodayEvents(userId: string): Promise<MedicationEventRecord[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfDay = today.getTime();

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const endOfDay = tomorrow.getTime();

    return await this.findByDateRange(userId, startOfDay, endOfDay);
  }
}

export const medicationEventRepository = new MedicationEventRepository();
