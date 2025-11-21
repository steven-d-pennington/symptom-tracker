import { useState, useEffect, useCallback } from "react";
import { TreatmentRecord } from "../db/schema";
import { treatmentRepository } from "../repositories/treatmentRepository";
import { treatmentEventRepository } from "../repositories/treatmentEventRepository";
import { useAuth } from "./useAuth";

export function useTreatmentManagement() {
    const { user } = useAuth();
    const [treatments, setTreatments] = useState<TreatmentRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");

    const loadTreatments = useCallback(async () => {
        if (!user) return;

        try {
            setLoading(true);
            const data = await treatmentRepository.getAll(user.id);
            setTreatments(data);
        } catch (error) {
            console.error("Failed to load treatments:", error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadTreatments();
    }, [loadTreatments]);

    const createTreatment = useCallback(
        async (data: Omit<TreatmentRecord, "id" | "userId" | "createdAt" | "updatedAt">) => {
            if (!user) throw new Error("User not authenticated");

            const id = await treatmentRepository.create({
                ...data,
                userId: user.id,
            });

            await loadTreatments();
            return id;
        },
        [user, loadTreatments]
    );

    const updateTreatment = useCallback(
        async (id: string, updates: Partial<TreatmentRecord>) => {
            await treatmentRepository.update(id, updates);
            await loadTreatments();
        },
        [loadTreatments]
    );

    const toggleTreatmentActive = useCallback(
        async (id: string) => {
            const treatment = treatments.find((t) => t.id === id);
            if (!treatment) return;

            await treatmentRepository.update(id, {
                isActive: !treatment.isActive,
            });
            await loadTreatments();
        },
        [treatments, loadTreatments]
    );

    const deleteTreatment = useCallback(
        async (id: string) => {
            await treatmentRepository.delete(id);
            await loadTreatments();
        },
        [loadTreatments]
    );

    const getTreatmentUsageCount = useCallback(
        async (treatmentId: string) => {
            if (!user) return 0;

            const events = await treatmentEventRepository.findAllByTreatment(user.id, treatmentId);
            return events.length;
        },
        [user]
    );

    const checkDuplicateName = useCallback(
        async (name: string, excludeId?: string) => {
            const normalizedName = name.trim().toLowerCase();
            return treatments.some(
                (t) => t.name.toLowerCase() === normalizedName && t.id !== excludeId
            );
        },
        [treatments]
    );

    // Filter treatments based on search and status
    const filteredTreatments = treatments.filter((treatment) => {
        const matchesSearch = treatment.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        const matchesStatus =
            filterStatus === "all" ||
            (filterStatus === "active" && treatment.isActive) ||
            (filterStatus === "inactive" && !treatment.isActive);

        return matchesSearch && matchesStatus;
    });

    return {
        treatments: filteredTreatments,
        loading,
        searchQuery,
        setSearchQuery,
        filterStatus,
        setFilterStatus,
        createTreatment,
        updateTreatment,
        toggleTreatmentActive,
        deleteTreatment,
        getTreatmentUsageCount,
        checkDuplicateName,
    };
}
