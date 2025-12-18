export default function Skeleton({ className = '' }) {
  return (
    <div 
      className={`animate-pulse bg-slate-700/50 rounded ${className}`}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700/50">
      <div className="flex items-start gap-3">
        <Skeleton className="w-5 h-5 rounded" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex gap-2 mt-3">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-slate-800 rounded-xl p-5 border border-slate-700/50">
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="w-10 h-10 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-16 mb-1" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-slate-800 rounded-xl p-5 border border-slate-700/50">
      <Skeleton className="h-5 w-40 mb-4" />
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  );
}
