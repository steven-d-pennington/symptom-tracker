// Symptom Tracker Test Data Generator
// Run this in your browser console on the Symptom Tracker page to populate localStorage with test data

(function() {
    console.log('🩺 Generating Symptom Tracker test data...');

    // Utility functions
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    function randomDate(start, end) {
        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    }

    function randomChoice(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Default severity scale
    const DEFAULT_SEVERITY_SCALE = {
        type: "numeric",
        min: 1,
        max: 10,
        labels: {
            1: "Minimal", 3: "Mild", 5: "Moderate", 7: "Severe", 10: "Extreme"
        },
        colors: {
            1: "#10B981", 3: "#F59E0B", 5: "#F59E0B", 7: "#EF4444", 10: "#7C3AED"
        }
    };

    // Symptom categories
    const SYMPTOM_CATEGORIES = [
        { id: generateId(), userId: "test-user", name: "Joint Pain", description: "Pain and stiffness in joints", color: "#EF4444", icon: "🦴", isDefault: true, createdAt: new Date() },
        { id: generateId(), userId: "test-user", name: "Fatigue", description: "Tiredness and low energy", color: "#F59E0B", icon: "😴", isDefault: true, createdAt: new Date() },
        { id: generateId(), userId: "test-user", name: "Headache", description: "Head pain and migraines", color: "#8B5CF6", icon: "🤕", isDefault: true, createdAt: new Date() },
        { id: generateId(), userId: "test-user", name: "Digestive", description: "GI symptoms and issues", color: "#10B981", icon: "🤢", isDefault: true, createdAt: new Date() },
        { id: generateId(), userId: "test-user", name: "Mood", description: "Emotional and mental health", color: "#EC4899", icon: "😢", isDefault: true, createdAt: new Date() },
        { id: generateId(), userId: "test-user", name: "Skin", description: "Rashes and skin conditions", color: "#06B6D4", icon: "🩹", isDefault: true, createdAt: new Date() },
        { id: generateId(), userId: "test-user", name: "Sleep", description: "Sleep quality and issues", color: "#84CC16", icon: "🌙", isDefault: true, createdAt: new Date() },
        { id: generateId(), userId: "test-user", name: "Other", description: "Miscellaneous symptoms", color: "#6B7280", icon: "📝", isDefault: true, createdAt: new Date() }
    ];

    // Symptom templates
    const SYMPTOM_TEMPLATES = [
        { name: "Joint Pain", category: "Joint Pain", locations: ["Right knee", "Left wrist", "Lower back", "Neck"], triggers: ["Cold weather", "Exercise", "Sitting too long"] },
        { name: "Fatigue", category: "Fatigue", locations: [], triggers: ["Poor sleep", "Stress", "Medication side effects"] },
        { name: "Migraine", category: "Headache", locations: ["Right temple", "Forehead", "Behind eyes"], triggers: ["Bright lights", "Loud noises", "Stress", "Hormonal changes"] },
        { name: "Nausea", category: "Digestive", locations: ["Stomach"], triggers: ["Certain foods", "Strong smells", "Motion"] },
        { name: "Anxiety", category: "Mood", locations: [], triggers: ["Social situations", "Work stress", "Caffeine"] },
        { name: "Rash", category: "Skin", locations: ["Arms", "Legs", "Back", "Face"], triggers: ["New soap", "Sun exposure", "Stress"] },
        { name: "Insomnia", category: "Sleep", locations: [], triggers: ["Stress", "Screen time", "Caffeine"] },
        { name: "Brain Fog", category: "Other", locations: [], triggers: ["Fatigue", "Stress", "Poor nutrition"] }
    ];

    function generateSymptoms() {
        const symptoms = [];
        const now = new Date();
        const sixMonthsAgo = new Date(now.getTime() - (180 * 24 * 60 * 60 * 1000));

        const numSymptoms = randomInt(45, 60);

        for (let i = 0; i < numSymptoms; i++) {
            const template = randomChoice(SYMPTOM_TEMPLATES);
            const timestamp = randomDate(sixMonthsAgo, now);
            const severity = randomInt(1, 10);

            const month = timestamp.getMonth();
            const monthsSinceStart = (now.getTime() - timestamp.getTime()) / (30 * 24 * 60 * 60 * 1000);

            let adjustedSeverity = severity;
            if (month >= 10 || month <= 1) {
                adjustedSeverity = Math.min(10, severity + randomInt(0, 2));
            }
            if (monthsSinceStart < 2) {
                adjustedSeverity = Math.max(1, adjustedSeverity - randomInt(0, 1));
            }

            const symptom = {
                id: generateId(),
                userId: "test-user",
                name: template.name,
                category: template.category,
                severity: adjustedSeverity,
                severityScale: DEFAULT_SEVERITY_SCALE,
                location: template.locations.length > 0 ? randomChoice(template.locations) : undefined,
                duration: randomInt(30, 480),
                triggers: Math.random() > 0.5 ? [randomChoice(template.triggers)] : undefined,
                notes: Math.random() > 0.7 ? randomChoice([
                    "Worse in the morning", "Improved with rest", "Triggered by weather change",
                    "Better after medication", "Interfering with daily activities", "Managed with heat therapy"
                ]) : undefined,
                photos: [],
                timestamp: timestamp,
                updatedAt: timestamp
            };

            symptoms.push(symptom);
        }

        return symptoms.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }

    function generateDailyEntries(symptoms) {
        const entries = [];
        const now = new Date();
        const sixMonthsAgo = new Date(now.getTime() - (180 * 24 * 60 * 60 * 1000));

        const totalDays = Math.floor((now.getTime() - sixMonthsAgo.getTime()) / (24 * 60 * 60 * 1000));

        for (let i = 0; i < totalDays; i++) {
            if (Math.random() < 0.2) continue;

            const entryDate = new Date(sixMonthsAgo.getTime() + (i * 24 * 60 * 60 * 1000));
            const dateStr = entryDate.toISOString().split('T')[0];

            const daySymptoms = symptoms.filter(s => {
                const symptomDate = new Date(s.timestamp);
                const diffDays = Math.abs((entryDate.getTime() - symptomDate.getTime()) / (24 * 60 * 60 * 1000));
                return diffDays <= 1;
            });

            let overallHealth = 8;
            if (daySymptoms.length > 0) {
                const avgSeverity = daySymptoms.reduce((sum, s) => sum + s.severity, 0) / daySymptoms.length;
                overallHealth = Math.max(1, 10 - Math.floor(avgSeverity / 2));
            }
            overallHealth = Math.max(1, Math.min(10, overallHealth + randomInt(-1, 1)));

            const entry = {
                id: generateId(),
                userId: "test-user",
                date: dateStr,
                overallHealth: overallHealth,
                energyLevel: Math.max(1, overallHealth - randomInt(0, 2)),
                sleepQuality: randomInt(1, 10),
                stressLevel: randomInt(1, 10),
                symptoms: daySymptoms.slice(0, randomInt(0, 3)).map(s => ({
                    symptomId: s.id,
                    severity: s.severity,
                    notes: Math.random() > 0.8 ? "Consistent with yesterday" : undefined
                })),
                medications: Math.random() > 0.7 ? [{
                    medicationId: "med-" + randomInt(1, 3),
                    taken: Math.random() > 0.3,
                    dosage: "As prescribed",
                    notes: Math.random() > 0.8 ? "No side effects" : undefined
                }] : [],
                triggers: Math.random() > 0.6 ? [{
                    triggerId: "trigger-" + randomInt(1, 5),
                    intensity: randomInt(1, 5),
                    notes: Math.random() > 0.8 ? "Weather-related" : undefined
                }] : [],
                notes: Math.random() > 0.8 ? randomChoice([
                    "Good day overall", "Feeling a bit off", "Better than yesterday",
                    "Worse than expected", "Managed symptoms well"
                ]) : undefined,
                mood: randomChoice(["Good", "Okay", "Tired", "Anxious", "Calm"]),
                weather: Math.random() > 0.7 ? {
                    temperatureCelsius: randomInt(5, 25),
                    humidity: randomInt(30, 80),
                    conditions: randomChoice(["Sunny", "Cloudy", "Rainy", "Snowy"])
                } : undefined,
                location: "Home",
                duration: randomInt(5, 15),
                completedAt: new Date(entryDate.getTime() + randomInt(8, 22) * 60 * 60 * 1000)
            };

            entries.push(entry);
        }

        return entries.sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());
    }

    function generateFilterPresets() {
        return [
            {
                id: generateId(),
                name: "Recent Severe Symptoms",
                filters: {
                    severityRange: [7, 10],
                    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                },
                createdAt: new Date()
            },
            {
                id: generateId(),
                name: "Joint Pain History",
                filters: {
                    categories: ["Joint Pain"],
                    startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
                },
                createdAt: new Date()
            },
            {
                id: generateId(),
                name: "This Month",
                filters: {
                    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                },
                createdAt: new Date()
            }
        ];
    }

    // Generate and store data
    try {
        const symptoms = generateSymptoms();
        const dailyEntries = generateDailyEntries(symptoms);
        const filterPresets = generateFilterPresets();

        localStorage.setItem("pst:symptoms", JSON.stringify(symptoms));
        localStorage.setItem("pst-entry-history", JSON.stringify(dailyEntries));
        localStorage.setItem("pst:symptom-categories", JSON.stringify(SYMPTOM_CATEGORIES));
        localStorage.setItem("pst:symptom-filter-presets", JSON.stringify(filterPresets));
        localStorage.setItem("pst-entry-templates", JSON.stringify([]));
        localStorage.setItem("pst-offline-entry-queue", JSON.stringify([]));

        console.log('✅ Test data generated successfully!');
        console.log(`📊 ${symptoms.length} symptoms`);
        console.log(`📅 ${dailyEntries.length} daily entries`);
        console.log(`🏷️ ${SYMPTOM_CATEGORIES.length} categories`);
        console.log(`🔍 ${filterPresets.length} filter presets`);
        console.log('\n🔄 Refresh your Symptom Tracker app to see the data!');

    } catch (error) {
        console.error('❌ Error generating test data:', error);
    }

    // Clear function for removing all test data
    window.clearSymptomTrackerData = function() {
        const keys = [
            'pst:symptoms',
            'pst-entry-history',
            'pst:symptom-categories',
            'pst:symptom-filter-presets',
            'pst-entry-templates',
            'pst-active-template',
            'pst-offline-entry-queue',
            'pst-calendar-filter-presets',
            'symptom-tracker-backups',
            'symptom-tracker-backup-settings',
            'pocket:onboarding-state',
            'pocket:user-settings'
        ];
        keys.forEach(key => localStorage.removeItem(key));
        console.log('🗑️ All Symptom Tracker data cleared!');
    };

})();