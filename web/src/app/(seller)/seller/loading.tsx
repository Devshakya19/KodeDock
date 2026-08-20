export default function SellerLoading() {
  return (
    <div className="w-full font-sans animate-pulse">
      {/* Header Skeleton */}
      <div className="mb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="h-6 bg-slate-200/80 rounded-full w-28 mb-3" />
          <div className="h-10 bg-slate-200/80 rounded-2xl w-64 mb-2" />
          <div className="h-4 bg-secondary rounded-lg w-96 max-w-full" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-11 bg-slate-200/80 rounded-xl w-32" />
          <div className="h-11 bg-slate-900/20 rounded-xl w-36" />
        </div>
      </div>

      {/* 4 Metrics Deck Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-[26px] bg-background p-1.5 ring-1 ring-border/60 shadow-xs"
          >
            <div className="rounded-[calc(26px-6px)] bg-slate-50/50 p-5 h-32 flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <div className="h-3.5 bg-slate-200 rounded-md w-24" />
                <div className="h-4 bg-slate-200 rounded-full w-12" />
              </div>
              <div>
                <div className="h-8 bg-slate-300/80 rounded-xl w-32 mb-2" />
                <div className="h-3 bg-slate-200 rounded-md w-40" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bento Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-[28px] bg-background p-2 ring-1 ring-border/60 shadow-xs">
            <div className="rounded-[22px] bg-slate-50/40 p-6 h-[340px]" />
          </div>
          <div className="rounded-[28px] bg-background p-2 ring-1 ring-border/60 shadow-xs">
            <div className="rounded-[22px] bg-slate-50/40 p-6 h-[280px]" />
          </div>
        </div>

        {/* Right Column (Span 1) */}
        <div className="space-y-6">
          <div className="rounded-[28px] bg-background p-2 ring-1 ring-border/60 shadow-xs">
            <div className="rounded-[22px] bg-slate-900/10 p-6 h-[240px]" />
          </div>
          <div className="rounded-[28px] bg-background p-2 ring-1 ring-border/60 shadow-xs">
            <div className="rounded-[22px] bg-slate-50/40 p-6 h-[300px]" />
          </div>
        </div>
      </div>
    </div>
  );
}
