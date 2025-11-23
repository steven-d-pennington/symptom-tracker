"use client";

import { Lightbulb } from "lucide-react";

export function InsightSnippet() {
    return (
        <div className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/10 flex items-start gap-4">
            <div className="p-2 rounded-full bg-primary/20 text-primary-dark shrink-0">
                <Lightbulb className="w-5 h-5" />
            </div>
            <div>
                <h4 className="text-sm font-bold text-primary-dark mb-1">Daily Insight</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    Consistency is key. Tracking your symptoms at the same time each day helps identify clearer patterns over time.
                </p>
            </div>
        </div>
    );
}
