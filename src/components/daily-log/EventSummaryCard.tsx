'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils/cn';
import { db } from '@/lib/db/client';
import { format, startOfDay, endOfDay } from 'date-fns';

export interface EventSummaryCardProps {
  /** User ID for filtering events */
  userId: string;
  /** Date to query (ISO string YYYY-MM-DD), defaults to today */
  date?: string;
  /** Optional CSS class name */
  className?: string;
}

interface EventCount {
  label: string;
  count: number;
  icon: string;
  link: string;
  color: string;
}

/**
 * EventSummaryCard component for daily log event summary (Story 6.2).
 * Displays counts of today's tracked items with links to quick action pages.
 *
 * Features:
 * - Shows counts for foods, medications, symptoms, triggers logged today
 * - Links to respective quick action pages to add more entries
 * - Empty state with action buttons when count is 0
 * - Uses shadcn/ui Card component for layout
 *
 * @see docs/ux-design-specification.md#Daily-Log-UX-Flow
 */
export function EventSummaryCard({
  userId,
  date,
  className
}: EventSummaryCardProps) {
  const [counts, setCounts] = useState<EventCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCounts() {
      setIsLoading(true);
      try {
        // Determine date range for today
        const targetDate = date ? new Date(date) : new Date();
        const startTimestamp = startOfDay(targetDate).getTime();
        const endTimestamp = endOfDay(targetDate).getTime();

        // Query counts in parallel
        const [
          foodCount,
          medicationCount,
          symptomCount,
          triggerCount
        ] = await Promise.all([
          // Foods logged
          db.foodEvents
            .where('userId')
            .equals(userId)
            .and(event => event.timestamp >= startTimestamp && event.timestamp <= endTimestamp)
            .count(),

          // Medications taken
          db.medicationEvents
            .where('userId')
            .equals(userId)
            .and(event => event.timestamp >= startTimestamp && event.timestamp <= endTimestamp)
            .count(),

          // Symptoms logged
          db.symptomInstances
            .where('userId')
            .equals(userId)
            .and(instance => {
              const timestamp = instance.timestamp instanceof Date
                ? instance.timestamp.getTime()
                : instance.timestamp;
              return timestamp >= startTimestamp && timestamp <= endTimestamp;
            })
            .count(),

          // Triggers logged
          db.triggerEvents
            .where('userId')
            .equals(userId)
            .and(event => event.timestamp >= startTimestamp && event.timestamp <= endTimestamp)
            .count()
        ]);

        setCounts([
          {
            label: 'Foods',
            count: foodCount,
            icon: '🍎',
            link: '/log/food',
            color: 'text-orange-500'
          },
          {
            label: 'Medications',
            count: medicationCount,
            icon: '💊',
            link: '/log/medication',
            color: 'text-blue-500'
          },
          {
            label: 'Symptoms',
            count: symptomCount,
            icon: '🤒',
            link: '/log/symptom',
            color: 'text-red-500'
          },
          {
            label: 'Triggers',
            count: triggerCount,
            icon: '⚡',
            link: '/log/trigger',
            color: 'text-yellow-500'
          }
        ]);
      } catch (error) {
        console.error('Failed to load event counts:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadCounts();
  }, [userId, date]);

  const totalCount = counts.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="text-lg">Today's Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : totalCount === 0 ? (
          // Empty state
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground text-center">
              No items logged yet today
            </p>
            <div className="grid grid-cols-2 gap-2">
              {counts.map((item) => (
                <Link
                  key={item.label}
                  href={item.link}
                  className="flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-border hover:bg-accent hover:border-primary/50 transition-colors"
                >
                  <span className="text-2xl" aria-hidden="true">
                    {item.icon}
                  </span>
                  <span className="text-sm font-medium">
                    Add {item.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          // Event counts list
          <div className="space-y-2">
            {counts.map((item) => (
              <Link
                key={item.label}
                href={item.link}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl" aria-hidden="true">
                    {item.icon}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.count} {item.count === 1 ? 'entry' : 'entries'}
                    </p>
                  </div>
                </div>
                <span className="text-sm text-primary group-hover:underline">
                  {item.count > 0 ? 'View →' : 'Add →'}
                </span>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
