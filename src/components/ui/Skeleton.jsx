import { cn } from "@/lib/utils";

export default function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-skeleton-base after:absolute after:inset-0 after:-translate-x-full after:animate-[skeleton-shimmer_1.5s_infinite] after:bg-gradient-to-r after:from-transparent after:via-skeleton-shine after:to-transparent",
        className
      )}
      {...props}
    />
  );
}

export function SkeletonBlock({ lines = 3, className }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-3", i === lines - 1 ? "w-3/5" : "w-full")}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border-subtle bg-surface-1 p-4 space-y-3",
        className
      )}
    >
      <Skeleton className="h-4 w-1/3" />
      <SkeletonBlock lines={2} />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="h-8 w-16 rounded-lg" />
      </div>
    </div>
  );
}
