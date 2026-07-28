"use client";

export default function ProductCardSkeleton() {
  return (
    <div className="bg-[#1E1E1E] border-2 border-[#C0C0C0]/10 rounded-[2.5rem] overflow-hidden flex flex-col shadow-lg animate-pulse">
      {/* Image Skeleton */}
      <div className="bg-neutral-800 aspect-square sm:aspect-[4/3] w-full skeleton" />

      {/* Content Skeleton */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="h-4 bg-neutral-800 rounded w-3/4 skeleton" />
          <div className="h-3 bg-neutral-800/60 rounded w-full skeleton" />
          <div className="h-3 bg-neutral-800/60 rounded w-5/6 skeleton" />
        </div>

        <div className="border-t border-neutral-800 pt-4 flex items-center justify-between">
          <div className="h-12 bg-neutral-800 rounded-2xl w-full skeleton" />
        </div>
      </div>
    </div>
  );
}
