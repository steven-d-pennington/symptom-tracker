"use client";

import { useEffect, useState } from "react";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { cn } from "@/lib/utils/cn";
import { useTheme } from "@/components/providers/ThemeProvider";
import { Moon, Sun } from "lucide-react";

export function DashboardHeader() {
    const { userId } = useCurrentUser();
    const [greeting, setGreeting] = useState("Hello");
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const hour = new Date().getHours();
        if (hour < 12) setGreeting("Good morning");
        else if (hour < 18) setGreeting("Good afternoon");
        else setGreeting("Good evening");
    }, []);

    if (!mounted) return <div className="h-20" />;

    return (
        <div className="mb-6 flex items-start justify-between animate-in fade-in slide-in-from-top-4 duration-700">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    {greeting}, <span className="text-primary">Steven</span>
                </h1>
                <p className="text-muted-foreground mt-1 text-lg">
                    How are you feeling today?
                </p>
            </div>
            <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-full bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Toggle theme"
            >
                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
        </div>
    );
}
