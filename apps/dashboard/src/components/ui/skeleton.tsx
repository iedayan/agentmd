import { cn } from '@/lib/core/utils';

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-[var(--radius-sm)] bg-muted', className)}
      {...props}
    />
  );
}

export { Skeleton };
