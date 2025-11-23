import { db } from "../db/client";
import { TreatmentRecord } from "../db/schema";
import { generateId } from "../utils/idGenerator";

export class TreatmentRepository {
    /**
     * Get all treatments for a user
     */
    async getAll(userId: string): Promise<TreatmentRecord[]> {
        return await db.treatments.where("userId").equals(userId).toArray();
    }

    /**
     * Get active treatments for a user
     */
    async getActive(userId: string): Promise<TreatmentRecord[]> {
        return await db.treatments
            .where("userId")
            .equals(userId)
            .filter((treatment) => treatment.isActive)
            .toArray();
    }

    /**
     * Get treatment by ID
     */
    async getById(id: string): Promise<TreatmentRecord | undefined> {
        return await db.treatments.get(id);
    }

    /**
     * Search treatments by name
     */
    async searchByName(
        userId: string,
        query: string
    ): Promise<TreatmentRecord[]> {
        const allTreatments = await this.getAll(userId);
        const lowerQuery = query.toLowerCase();

        return allTreatments.filter((treatment) =>
            treatment.name.toLowerCase().includes(lowerQuery)
        );
    }

    /**
     * Create a new treatment
     */
    async create(
        treatmentData: Omit<TreatmentRecord, "id" | "createdAt" | "updatedAt">
    ): Promise<string> {
        const id = generateId();
        const now = new Date();

        await db.treatments.add({
            ...treatmentData,
            id,
            createdAt: now,
            updatedAt: now,
        });

        return id;
    }

    /**
     * Update an existing treatment
     */
    async update(
        id: string,
        updates: Partial<TreatmentRecord>
    ): Promise<void> {
        await db.treatments.update(id, {
            ...updates,
            updatedAt: new Date(),
        });
    }

    /**
     * Soft delete a treatment (mark as inactive)
     */
    async softDelete(id: string): Promise<void> {
        await this.update(id, { isActive: false });
    }

    /**
     * Hard delete a treatment
     */
    async delete(id: string): Promise<void> {
        await db.treatments.delete(id);
    }

    /**
     * Bulk create treatments
     */
    async bulkCreate(
        treatments: Omit<TreatmentRecord, "id" | "createdAt" | "updatedAt">[]
    ): Promise<string[]> {
        const now = new Date();
        const treatmentsWithIds = treatments.map((treatment) => ({
            ...treatment,
            id: generateId(),
            createdAt: now,
            updatedAt: now,
        }));

        await db.treatments.bulkAdd(treatmentsWithIds);
        return treatmentsWithIds.map((t) => t.id);
    }

    /**
     * Get treatment statistics
     */
    async getStats(userId: string) {
        const treatments = await this.getAll(userId);
        const activeTreatments = treatments.filter((t) => t.isActive);

        const categoryCounts: Record<string, number> = {};
        treatments.forEach((t) => {
            if (t.category) {
                categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
            }
        });

        return {
            total: treatments.length,
            active: activeTreatments.length,
            inactive: treatments.length - activeTreatments.length,
            categories: Object.entries(categoryCounts).map(
                ([category, count]) => ({
                    category,
                    count,
                })
            ),
        };
    }
}

export const treatmentRepository = new TreatmentRepository();
