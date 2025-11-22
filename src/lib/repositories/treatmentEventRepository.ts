import { db } from "../db/client";
import { TreatmentEventRecord } from "../db/schema";
import { generateId } from "../utils/idGenerator";

export class TreatmentEventRepository {
    /**
     * Find all treatment events in a date range for a user
     */
    async findByDateRange(
        userId: string,
        startDate: number,
        endDate: number
    ): Promise<TreatmentEventRecord[]> {
        return await db.treatmentEvents
            .where("[userId+timestamp]")
            .between([userId, startDate], [userId, endDate], true, true)
            .toArray();
    }

    /**
     * Find treatment events for a specific treatment in a date range
     */
    async findByTreatment(
        userId: string,
        treatmentId: string,
        startDate: number,
        endDate: number
    ): Promise<TreatmentEventRecord[]> {
        const allEvents = await this.findByDateRange(userId, startDate, endDate);
        return allEvents.filter((event) => event.treatmentId === treatmentId);
    }

    /**
     * Create a new treatment event
     */
    async create(
        eventData: Omit<TreatmentEventRecord, "id" | "createdAt" | "updatedAt">
    ): Promise<string> {
        const id = generateId();
        const now = Date.now();

        await db.treatmentEvents.add({
            ...eventData,
            id,
            createdAt: now,
            updatedAt: now,
        });

        // Dispatch custom event to trigger correlation recalculation
        window.dispatchEvent(
            new CustomEvent("data-logged", {
                detail: { type: "treatment", userId: eventData.userId },
            })
        );

        return id;
    }

    /**
     * Update an existing treatment event
     */
    async update(
        id: string,
        updates: Partial<TreatmentEventRecord>
    ): Promise<void> {
        await db.treatmentEvents.update(id, {
            ...updates,
            updatedAt: Date.now(),
        });
    }

    /**
     * Delete a treatment event
     */
    async delete(id: string): Promise<void> {
        await db.treatmentEvents.delete(id);
    }

    /**
     * Get treatment event by ID
     */
    async getById(id: string): Promise<TreatmentEventRecord | undefined> {
        return await db.treatmentEvents.get(id);
    }

    /**
     * Get all treatment events for a treatment
     */
    async findAllByTreatment(
        userId: string,
        treatmentId: string
    ): Promise<TreatmentEventRecord[]> {
        return await db.treatmentEvents
            .where("[userId+treatmentId]")
            .equals([userId, treatmentId])
            .toArray();
    }

    /**
     * Delete all treatment events for a treatment
     */
    async deleteByTreatment(userId: string, treatmentId: string): Promise<void> {
        const events = await this.findAllByTreatment(userId, treatmentId);
        const ids = events.map((e) => e.id);
        await db.treatmentEvents.bulkDelete(ids);
    }
}

export const treatmentEventRepository = new TreatmentEventRepository();
