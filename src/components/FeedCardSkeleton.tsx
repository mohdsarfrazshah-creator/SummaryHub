import React from "react";

interface FeedCardSkeletonProps {
  className?: string;
}

export const FeedCardSkeleton: React.FC<FeedCardSkeletonProps> = ({ className = "" }) => {
  return (
    <article
      data-testid="feed-card-skeleton"
      className={`relative flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200/90 bg-white p-4 sm:p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900/90 animate-pulse ${className}`}
    >
      {/* Top Header: Creator & Badges */}
      <div>
        <div className="flex items-center justify-between gap-3">
          {/* Creator Avatar & Name */}
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 shrink-0 rounded-full bg-neutral-200 dark:bg-neutral-800" />
            <div className="space-y-1.5">
              <div className="h-3.5 w-28 rounded-md bg-neutral-200 dark:bg-neutral-800" />
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-14 rounded bg-neutral-100 dark:bg-neutral-800/60" />
                <div className="h-2 w-2 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                <div className="h-2.5 w-16 rounded bg-neutral-100 dark:bg-neutral-800/60" />
              </div>
            </div>
          </div>

          {/* Right Badges */}
          <div className="flex items-center gap-1.5">
            <div className="hidden h-6 w-20 rounded-md bg-emerald-100/60 dark:bg-emerald-950/30 sm:block" />
            <div className="h-6 w-16 rounded-lg bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-6 w-14 rounded-lg bg-neutral-100 dark:bg-neutral-800/60" />
            <div className="h-6 w-6 rounded-lg bg-neutral-100 dark:bg-neutral-800/60" />
          </div>
        </div>

        {/* Title skeleton */}
        <div className="mt-3.5 space-y-2">
          <div className="h-4 w-11/12 rounded-md bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-4 w-3/5 rounded-md bg-neutral-200 dark:bg-neutral-800" />
        </div>

        {/* Thumbnail & Quick Bullets */}
        <div className="mt-3.5 flex flex-col gap-3 sm:flex-row sm:items-start">
          {/* Thumbnail preview */}
          <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-xl bg-neutral-200 dark:bg-neutral-800 sm:w-44">
            <div className="absolute inset-0 bg-gradient-to-tr from-neutral-300/30 via-transparent to-white/10 dark:from-neutral-700/20" />
          </div>

          {/* Bullet points */}
          <div className="flex-1 space-y-2.5 py-1">
            <div className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-300 dark:bg-indigo-900" />
              <div className="h-3 w-11/12 rounded bg-neutral-200 dark:bg-neutral-800" />
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-300 dark:bg-indigo-900" />
              <div className="h-3 w-5/6 rounded bg-neutral-200 dark:bg-neutral-800" />
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-300 dark:bg-indigo-900" />
              <div className="h-3 w-3/4 rounded bg-neutral-200 dark:bg-neutral-800" />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="-mx-4 -mb-4 sm:-mx-5 sm:-mb-5 mt-4 flex items-center justify-between border-t border-neutral-100 bg-neutral-50/60 px-4 py-2.5 dark:border-neutral-800/80 dark:bg-neutral-850/40 sm:px-5">
        <div className="flex items-center gap-1.5">
          {/* Read summary button skeleton */}
          <div className="h-7 w-28 rounded-lg bg-indigo-200/60 dark:bg-indigo-950/60" />
          {/* Ask AI button skeleton */}
          <div className="h-7 w-20 rounded-lg bg-neutral-200 dark:bg-neutral-800" />
          {/* Listen audio button skeleton */}
          <div className="h-7 w-16 rounded-lg bg-neutral-200 dark:bg-neutral-800" />
        </div>

        {/* Right action icons */}
        <div className="flex items-center gap-1.5">
          <div className="h-6 w-6 rounded-lg bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-6 w-6 rounded-lg bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-6 w-6 rounded-lg bg-neutral-200 dark:bg-neutral-800" />
        </div>
      </div>
    </article>
  );
};

export const FeedCardSkeletonList: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="space-y-4" role="status" aria-label="Loading feed articles">
      {Array.from({ length: count }).map((_, idx) => (
        <FeedCardSkeleton key={`skeleton-${idx}`} />
      ))}
      <span className="sr-only">Loading latest articles and summaries...</span>
    </div>
  );
};
