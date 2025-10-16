import { cn } from '@/lib/utils/cn';

interface CustomFoodBadgeProps {
  className?: string;
}

/**
 * Badge component to visually identify custom (user-created) foods
 * Displays "Custom" in a blue badge
 */
export function CustomFoodBadge({ className }: CustomFoodBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        'bg-sky-100 text-sky-800',
        className
      )}
    >
      Custom
    </span>
  );
}
