import { TreatmentRecord } from "../db/schema";

/**
 * Default preset treatments for new users
 * Categories: Thermal, Physical, Manual, Electrical
 */
export const DEFAULT_TREATMENTS: Omit<
    TreatmentRecord,
    "id" | "userId" | "createdAt" | "updatedAt"
>[] = [
        // Thermal Treatments
        {
            name: "Ice Pack",
            category: "Thermal",
            description: "Cold therapy to reduce inflammation and numb pain",
            duration: 20,
            frequency: "As needed",
            isActive: true,
            isDefault: true,
            isEnabled: true,
        },
        {
            name: "Heat Therapy",
            category: "Thermal",
            description: "Warm compress or heating pad to relax muscles and improve circulation",
            duration: 20,
            frequency: "As needed",
            isActive: true,
            isDefault: true,
            isEnabled: true,
        },
        {
            name: "Contrast Therapy",
            category: "Thermal",
            description: "Alternating hot and cold to reduce swelling",
            duration: 15,
            frequency: "As needed",
            isActive: true,
            isDefault: true,
            isEnabled: true,
        },

        // Physical Treatments
        {
            name: "Compression",
            category: "Physical",
            description: "Compression bandage or garment to reduce swelling",
            duration: undefined,
            frequency: "As needed",
            isActive: true,
            isDefault: true,
            isEnabled: true,
        },
        {
            name: "Elevation",
            category: "Physical",
            description: "Elevate affected area above heart level",
            duration: 30,
            frequency: "As needed",
            isActive: true,
            isDefault: true,
            isEnabled: true,
        },
        {
            name: "Rest",
            category: "Physical",
            description: "Avoid activity and allow healing",
            duration: undefined,
            frequency: "As needed",
            isActive: true,
            isDefault: true,
            isEnabled: true,
        },
        {
            name: "Stretching",
            category: "Physical",
            description: "Gentle stretching exercises",
            duration: 10,
            frequency: "Daily",
            isActive: true,
            isDefault: true,
            isEnabled: true,
        },

        // Manual Treatments
        {
            name: "Massage",
            category: "Manual",
            description: "Gentle massage to improve circulation and reduce tension",
            duration: 15,
            frequency: "As needed",
            isActive: true,
            isDefault: true,
            isEnabled: true,
        },
        {
            name: "Physical Therapy",
            category: "Manual",
            description: "Professional physical therapy session",
            duration: 60,
            frequency: "Weekly",
            isActive: true,
            isDefault: true,
            isEnabled: true,
        },

        // Electrical Treatments
        {
            name: "TENS Unit",
            category: "Electrical",
            description: "Transcutaneous electrical nerve stimulation for pain relief",
            duration: 30,
            frequency: "As needed",
            isActive: true,
            isDefault: true,
            isEnabled: true,
        },
    ];
