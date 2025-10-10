"use client";

import { useEffect, useState } from "react";
import { runAllMigrations, needsMigration } from "@/lib/utils/storageMigration";

export function MigrationProvider({ children }: { children: React.ReactNode }) {
  const [isMigrating, setIsMigrating] = useState(true);

  useEffect(() => {
    const runMigrations = async () => {
      if (typeof window === "undefined") {
        setIsMigrating(false);
        return;
      }

      if (!needsMigration()) {
        console.log("[Migration] No migrations needed");
        setIsMigrating(false);
        return;
      }

      try {
        await runAllMigrations();
      } catch (error) {
        console.error("[Migration] Migration failed", error);
      } finally {
        setIsMigrating(false);
      }
    };

    runMigrations();
  }, []);

  if (isMigrating) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Migrating your data...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
