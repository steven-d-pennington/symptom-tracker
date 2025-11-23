"use client";

import React, { useState, useEffect } from "react";
import {
    Moon,
    Sun,
    CloudRain,
    Save,
    Calendar as CalendarIcon,
    Smile,
    Frown,
    Meh,
    Activity,
    BedDouble,
    BrainCircuit
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SeveritySlider } from "@/components/ui/SeveritySlider";
import { dailyLogsRepository } from "@/lib/repositories/dailyLogsRepository";
import { DailyLog } from "@/types/daily-log";

interface SimpleDailyLogFormProps {
    userId: string;
    onSave?: () => void;
}

export function SimpleDailyLogForm({ userId, onSave }: SimpleDailyLogFormProps) {
    const [date, setDate] = useState(new Date());
    const [mood, setMood] = useState<number>(3);
    const [sleepHours, setSleepHours] = useState<number>(7);
    const [sleepQuality, setSleepQuality] = useState<number>(3);
    const [stressLevel, setStressLevel] = useState<number>(5);
    const [notes, setNotes] = useState<string>("");
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

    // Greeting based on time of day
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    };

    // Load existing entry for the selected date
    useEffect(() => {
        const loadEntry = async () => {
            try {
                const formattedDate = format(date, "yyyy-MM-dd");
                const existing = await dailyLogsRepository.getByDate(userId, formattedDate);

                if (existing) {
                    setMood(existing.mood);
                    // Round to nearest 0.5
                    setSleepHours(Math.round(existing.sleepHours * 2) / 2);
                    setSleepQuality(existing.sleepQuality);
                    setStressLevel(existing.stressLevel);
                    setNotes(existing.notes || "");
                } else {
                    // Reset to defaults if no entry exists
                    setMood(3);
                    setSleepHours(7);
                    setSleepQuality(3);
                    setStressLevel(5);
                    setNotes("");
                }
            } catch (error) {
                console.error("Failed to load daily log:", error);
            }
        };

        loadEntry();
    }, [date, userId]);

    const handleSave = async () => {
        setIsSaving(true);
        setSaveStatus("idle");
        try {
            const formattedDate = format(date, "yyyy-MM-dd");

            const entry: Partial<DailyLog> = {
                userId,
                date: formattedDate,
                mood: mood as 1 | 2 | 3 | 4 | 5,
                sleepHours,
                sleepQuality: sleepQuality as 1 | 2 | 3 | 4 | 5,
                stressLevel,
                notes
            };

            await dailyLogsRepository.upsert(entry);
            setSaveStatus("success");
            setTimeout(() => setSaveStatus("idle"), 3000);

            if (onSave) onSave();
        } catch (error) {
            console.error("Failed to save daily log:", error);
            setSaveStatus("error");
        } finally {
            setIsSaving(false);
        }
    };

    const moodIcons = [
        { value: 1, icon: Frown, label: "Bad", color: "text-red-500" },
        { value: 2, icon: Frown, label: "Poor", color: "text-orange-500" },
        { value: 3, icon: Meh, label: "Okay", color: "text-yellow-500" },
        { value: 4, icon: Smile, label: "Good", color: "text-lime-500" },
        { value: 5, icon: Smile, label: "Great", color: "text-green-500" },
    ];

    return (
        <div className="max-w-2xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    {getGreeting()}, Steven.
                </h1>
                <p className="text-muted-foreground">
                    How was your day? Let's track the essentials.
                </p>
            </div>

            {/* Date Picker (Simplified) */}
            <div className="flex items-center space-x-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        const prev = new Date(date);
                        prev.setDate(prev.getDate() - 1);
                        setDate(prev);
                    }}
                >
                    Previous
                </Button>
                <div className="flex items-center font-medium">
                    <CalendarIcon className="w-4 h-4 mr-2 text-primary" />
                    {format(date, "MMMM d, yyyy")}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        const next = new Date(date);
                        next.setDate(next.getDate() + 1);
                        setDate(next);
                    }}
                    disabled={date.toDateString() === new Date().toDateString()}
                >
                    Next
                </Button>
            </div>

            {/* Mood Section */}
            <Card className="p-6 space-y-4 glass-panel border-none">
                <div className="flex items-center space-x-2">
                    <Smile className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-semibold">Mood</h2>
                </div>
                <div className="flex justify-between">
                    {moodIcons.map((item) => (
                        <button
                            key={item.value}
                            onClick={() => setMood(item.value)}
                            className={cn(
                                "flex flex-col items-center space-y-2 p-3 rounded-xl transition-all",
                                mood === item.value
                                    ? "bg-primary/10 scale-110"
                                    : "hover:bg-muted/50 opacity-50 hover:opacity-100"
                            )}
                        >
                            <item.icon
                                className={cn(
                                    "w-8 h-8",
                                    mood === item.value ? item.color : "text-muted-foreground"
                                )}
                            />
                            <span className="text-xs font-medium">{item.label}</span>
                        </button>
                    ))}
                </div>
            </Card>

            {/* Sleep Section */}
            <Card className="p-6 space-y-6 glass-panel border-none">
                <div className="flex items-center space-x-2">
                    <BedDouble className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-semibold">Sleep</h2>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium mb-2 block">Duration (Hours)</label>
                        <div className="flex items-center space-x-4">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setSleepHours(Math.max(0, sleepHours - 0.5))}
                            >
                                -
                            </Button>
                            <span className="text-2xl font-bold w-16 text-center">{Number(sleepHours).toFixed(1).replace(/\.0$/, '')}</span>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setSleepHours(Math.min(24, sleepHours + 0.5))}
                            >
                                +
                            </Button>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-2 block">Quality (1-5)</label>
                        <div className="flex space-x-2">
                            {[1, 2, 3, 4, 5].map((q) => (
                                <button
                                    key={q}
                                    onClick={() => setSleepQuality(q)}
                                    className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all",
                                        sleepQuality === q
                                            ? "bg-primary text-primary-foreground scale-110 shadow-lg"
                                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                                    )}
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </Card>

            {/* Stress Section */}
            <Card className="p-6 space-y-4 glass-panel border-none">
                <div className="flex items-center space-x-2">
                    <BrainCircuit className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-semibold">Stress Level</h2>
                </div>
                <div className="px-2">
                    <SeveritySlider
                        value={stressLevel}
                        onChange={setStressLevel}
                        min={1}
                        max={10}
                        step={1}
                        labels={{ 1: "Low", 5: "Moderate", 10: "High" }}
                    />
                </div>
            </Card>

            {/* Journal Section */}
            <Card className="p-6 space-y-4 glass-panel border-none">
                <div className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-semibold">Journal</h2>
                </div>
                <textarea
                    placeholder="Write down your thoughts, feelings, or anything notable about today..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="flex min-h-[150px] w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                />
            </Card>

            {/* Save Button */}
            <div className="space-y-2">
                <Button
                    onClick={handleSave}
                    className="w-full h-14 text-lg font-semibold shadow-lg bg-gradient-to-r from-primary to-teal-600 hover:from-primary/90 hover:to-teal-600/90 transition-all"
                    disabled={isSaving}
                >
                    {isSaving ? (
                        "Saving..."
                    ) : (
                        <>
                            <Save className="w-5 h-5 mr-2" />
                            Save Daily Log
                        </>
                    )}
                </Button>
                {saveStatus === "success" && (
                    <p className="text-center text-green-500 font-medium animate-in fade-in slide-in-from-bottom-2">
                        Daily log saved successfully!
                    </p>
                )}
                {saveStatus === "error" && (
                    <p className="text-center text-red-500 font-medium animate-in fade-in slide-in-from-bottom-2">
                        Failed to save daily log. Please try again.
                    </p>
                )}
            </div>
        </div>
    );

}
