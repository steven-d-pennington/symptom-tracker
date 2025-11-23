import Dexie from "dexie";
import { db } from "../db/client";
import { UxEventRecord } from "../db/schema";
import { generateId } from "../utils/idGenerator";

export interface UxEvent {
  id: string;
  userId: string;
  eventType: string;
  metadata: Record<string, unknown>;
  timestamp: number;
  createdAt: number;
}

interface RecordEventInput {
  userId: string;
  eventType: string;
  metadata?: Record<string, unknown>;
  timestamp?: number;
}

interface ListRecentOptions {
  eventType?: string;
  limit?: number;
  since?: number;
}

interface ClearOptions {
  eventType?: string;
  before?: number;
}

class UxEventRepository {
  private parseRecord(record: UxEventRecord): UxEvent {
    let metadata: Record<string, unknown> = {};
    if (record.metadata) {
      try {
        metadata = JSON.parse(record.metadata) as Record<string, unknown>;
      } catch {
        metadata = {};
      }
    }

    return {
      id: record.id,
      userId: record.userId,
      eventType: record.eventType,
      metadata,
      timestamp: record.timestamp,
      createdAt: record.createdAt,
    };
  }

  async recordEvent(input: RecordEventInput): Promise<string> {
    const { userId, eventType, metadata, timestamp } = input;
    if (!userId) {
      throw new Error("userId is required");
    }
    if (!eventType) {
      throw new Error("eventType is required");
    }

    const id = generateId();
    const occurredAt = timestamp ?? Date.now();
    const createdAt = Date.now();

    const record: UxEventRecord = {
      id,
      userId,
      eventType,
      metadata: JSON.stringify(metadata ?? {}),
      timestamp: occurredAt,
      createdAt,
    };

    await db.uxEvents.add(record);
    return id;
  }

  async listRecent(userId: string, options: ListRecentOptions = {}): Promise<UxEvent[]> {
    if (!userId) {
      throw new Error("userId is required");
    }

    const { eventType, limit = 50, since } = options;
    let collection: Dexie.Collection<UxEventRecord, string>;

    if (eventType) {
      collection = db.uxEvents.where("[userId+eventType]").equals([userId, eventType]);
    } else {
      collection = db.uxEvents
        .where("[userId+timestamp]")
        .between([userId, Dexie.minKey], [userId, Dexie.maxKey]);
    }

    if (since !== undefined) {
      collection = collection.and(record => record.timestamp >= since);
    }

    const results = await collection.reverse().limit(Math.max(limit, 1)).toArray();
    return results.map(record => this.parseRecord(record));
  }

  async clear(userId: string, options: ClearOptions = {}): Promise<number> {
    if (!userId) {
      throw new Error("userId is required");
    }

    const { eventType, before } = options;
    let collection: Dexie.Collection<UxEventRecord, string>;

    if (eventType) {
      collection = db.uxEvents.where("[userId+eventType]").equals([userId, eventType]);
    } else {
      collection = db.uxEvents
        .where("[userId+timestamp]")
        .between([userId, Dexie.minKey], [userId, Dexie.maxKey]);
    }

    if (before !== undefined) {
      collection = collection.and(record => record.timestamp <= before);
    }

    return await collection.delete();
  }
}

export const uxEventRepository = new UxEventRepository();
export { UxEventRepository };
