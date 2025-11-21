import { db } from "../db/client";
import { SymptomInstanceRecord } from "../db/schema";
import { Symptom, SymptomDraft } from "../types/symptoms";
import { generateId } from "../utils/idGenerator";

export class SymptomInstanceRepository {
  /**
   * Convert SymptomInstanceRecord to Symptom
   */
  private recordToSymptom(record: SymptomInstanceRecord): Symptom {
    return {
      ...record,
      severityScale: record.severityScale ? JSON.parse(record.severityScale) : undefined,
      triggers: record.triggers ? JSON.parse(record.triggers) : undefined,
      photos: record.photos ? JSON.parse(record.photos) : undefined,
    };
  }

  /**
   * Convert Symptom to SymptomInstanceRecord
   */
  private symptomToRecord(symptom: Symptom): SymptomInstanceRecord {
    return {
      ...symptom,
      severityScale: JSON.stringify(symptom.severityScale),
      triggers: symptom.triggers ? JSON.stringify(symptom.triggers) : undefined,
      photos: symptom.photos ? JSON.stringify(symptom.photos) : undefined,
    };
  }

  /**
   * Get all symptom instances for a user
   */
  async getAll(userId: string): Promise<Symptom[]> {
    const records = await db.symptomInstances
      .where("userId")
      .equals(userId)
      .reverse()
      .sortBy("timestamp");
    return records.map(r => this.recordToSymptom(r));
  }

  /**
   * Get symptom instance by ID
   */
  async getById(id: string): Promise<Symptom | undefined> {
    const record = await db.symptomInstances.get(id);
    return record ? this.recordToSymptom(record) : undefined;
  }

  /**
   * Get symptom instances by category
   */
  async getByCategory(userId: string, category: string): Promise<Symptom[]> {
    const records = await db.symptomInstances
      .where("[userId+category]")
      .equals([userId, category])
      .reverse()
      .sortBy("timestamp");
    return records.map(r => this.recordToSymptom(r));
  }

  /**
   * Get symptom instances in date range
   * CRITICAL: Compound indexes with Date fields require Date objects for comparison
   * Dexie compares Date objects properly when stored as Date type
   */
  async getByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Symptom[]> {
    // Use all records and filter manually since compound index comparison is unreliable
    const allRecords = await db.symptomInstances
      .where("userId")
      .equals(userId)
      .toArray();

    // Filter by date range manually
    const filteredRecords = allRecords.filter(record => {
      const recordTime = record.timestamp instanceof Date
        ? record.timestamp.getTime()
        : new Date(record.timestamp).getTime();
      const startTime = startDate.getTime();
      const endTime = endDate.getTime();
      return recordTime >= startTime && recordTime <= endTime;
    });

    // Sort descending (most recent first)
    const sorted = filteredRecords.sort((a, b) => {
      const aTime = a.timestamp instanceof Date ? a.timestamp.getTime() : new Date(a.timestamp).getTime();
      const bTime = b.timestamp instanceof Date ? b.timestamp.getTime() : new Date(b.timestamp).getTime();
      return bTime - aTime;
    });

    return sorted.map(r => this.recordToSymptom(r));
  }

  /**
   * Find symptom instances by date range (epoch milliseconds)
   * Used for correlation analysis
   */
  async findByDateRange(
    userId: string,
    startMs: number,
    endMs: number
  ): Promise<SymptomInstanceRecord[]> {
    const records = await db.symptomInstances
      .where("[userId+timestamp]")
      .between([userId, new Date(startMs)], [userId, new Date(endMs)], true, true)
      .toArray();

    return records.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Create a new symptom instance
   */
  async create(symptomData: SymptomDraft): Promise<string> {
    const id = symptomData.id || generateId();
    const now = new Date();

    const record: SymptomInstanceRecord = {
      id,
      userId: symptomData.userId,
      name: symptomData.name,
      category: symptomData.category,
      severity: symptomData.severity,
      severityScale: JSON.stringify(symptomData.severityScale),
      location: symptomData.location,
      duration: symptomData.duration,
      triggers: symptomData.triggers ? JSON.stringify(symptomData.triggers) : undefined,
      notes: symptomData.notes,
      photos: symptomData.photos ? JSON.stringify(symptomData.photos) : undefined,
      timestamp: symptomData.timestamp || now,
      updatedAt: now,
    };

    await db.symptomInstances.add(record);

    // Dispatch event to update calendar and other views
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("symptom-instance-updated"));
    }

    return id;
  }

  /**
   * Update an existing symptom instance
   */
  async update(id: string, updates: Partial<SymptomDraft>): Promise<void> {
    const existing = await db.symptomInstances.get(id);
    if (!existing) {
      throw new Error(`Symptom instance not found: ${id}`);
    }

    const updateRecord: Partial<SymptomInstanceRecord> = {
      ...updates,
      severityScale: updates.severityScale ? JSON.stringify(updates.severityScale) : undefined,
      triggers: updates.triggers ? JSON.stringify(updates.triggers) : undefined,
      photos: updates.photos ? JSON.stringify(updates.photos) : undefined,
      timestamp: updates.timestamp ? new Date(updates.timestamp) : undefined,
      updatedAt: new Date(),
    };

    await db.symptomInstances.update(id, updateRecord);

    // Dispatch event to update calendar and other views
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("symptom-instance-updated"));
    }
  }

  /**
   * Delete a symptom instance
   */
  async delete(id: string): Promise<void> {
    await db.symptomInstances.delete(id);

    // Dispatch event to update calendar and other views
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("symptom-instance-updated"));
    }
  }

  /**
   * Bulk create symptom instances
   */
  async bulkCreate(symptoms: SymptomDraft[]): Promise<string[]> {
    const now = new Date();
    const records: SymptomInstanceRecord[] = symptoms.map((symptom) => ({
      id: symptom.id || generateId(),
      userId: symptom.userId,
      name: symptom.name,
      category: symptom.category,
      severity: symptom.severity,
      severityScale: JSON.stringify(symptom.severityScale),
      location: symptom.location,
      duration: symptom.duration,
      triggers: symptom.triggers ? JSON.stringify(symptom.triggers) : undefined,
      notes: symptom.notes,
      photos: symptom.photos ? JSON.stringify(symptom.photos) : undefined,
      timestamp: symptom.timestamp || now,
      updatedAt: now,
    }));

    await db.symptomInstances.bulkAdd(records);
    return records.map(r => r.id);
  }

  /**
   * Get symptom statistics
   */
  async getStats(userId: string) {
    const symptoms = await this.getAll(userId);

    if (symptoms.length === 0) {
      return {
        total: 0,
        averageSeverity: 0,
        categories: [],
      };
    }

    const totalSeverity = symptoms.reduce((sum, s) => sum + s.severity, 0);
    const categories = Array.from(new Set(symptoms.map(s => s.category)));

    return {
      total: symptoms.length,
      averageSeverity: Number((totalSeverity / symptoms.length).toFixed(1)),
      categories,
      categoryCounts: categories.map(category => ({
        category,
        count: symptoms.filter(s => s.category === category).length,
      })),
    };
  }

  /**
   * Search symptom instances by name
   */
  async searchByName(userId: string, query: string): Promise<Symptom[]> {
    const allSymptoms = await this.getAll(userId);
    const lowerQuery = query.toLowerCase();
    return allSymptoms.filter(symptom =>
      symptom.name.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get unique locations
   */
  async getLocations(userId: string): Promise<string[]> {
    const symptoms = await this.getAll(userId);
    const locations = new Set<string>();
    symptoms.forEach(s => {
      if (s.location) locations.add(s.location);
    });
    return Array.from(locations).sort();
  }

  /**
   * Get trigger suggestions
   */
  async getTriggerSuggestions(userId: string): Promise<string[]> {
    const symptoms = await this.getAll(userId);
    const triggers = new Set<string>();
    symptoms.forEach(s => {
      (s.triggers || []).forEach(t => triggers.add(t));
    });
    return Array.from(triggers).sort();
  }

  /**
   * Get symptom name suggestions
   */
  async getSymptomNameSuggestions(userId: string): Promise<string[]> {
    const symptoms = await this.getAll(userId);
    const names = new Set<string>();
    symptoms.forEach(s => names.add(s.name));
    return Array.from(names).sort();
  }

  /**
   * Get recent notes for a symptom (for smart suggestions)
   */
  async getRecentNotes(
    userId: string,
    symptomName: string,
    limit: number = 10
  ): Promise<string[]> {
    const records = await db.symptomInstances
      .where("userId")
      .equals(userId)
      .reverse()
      .limit(limit * 3) // Get more to filter by name
      .toArray();

    // Filter by symptom name and extract notes
    const notes = records
      .filter(r => r.name === symptomName && r.notes && r.notes.trim().length > 0)
      .map(r => r.notes!)
      .slice(0, limit);

    // Return unique notes
    return Array.from(new Set(notes));
  }
}

export const symptomInstanceRepository = new SymptomInstanceRepository();
