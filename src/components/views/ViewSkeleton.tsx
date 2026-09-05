'use client';

export function ViewSkeleton() {
  return (
    <div className="container-editorial space-y-8 py-24" aria-busy="true" aria-label="Loading">
      <div className="h-16 w-2/3 max-w-xl animate-pulse bg-parchment" />
      <div className="h-4 w-1/3 animate-pulse bg-parchment" />
      <div className="grid grid-cols-2 gap-6 pt-8 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="space-y-3">
            <div className="aspect-[4/5] animate-pulse bg-parchment" />
            <div className="h-4 w-3/4 animate-pulse bg-parchment" />
            <div className="h-4 w-1/3 animate-pulse bg-parchment" />
          </div>
        ))}
      </div>
    </div>
  );
}
