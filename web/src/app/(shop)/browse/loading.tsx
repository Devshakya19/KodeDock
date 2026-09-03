export default function BrowseLoading() {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#07060b] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Sidebar Skeleton */}
      <div className="hidden lg:block w-[260px] h-screen bg-white dark:bg-[#08070d] border-r border-slate-200 dark:border-[#1e1b2e] p-5 shrink-0 animate-pulse">
        <div className="h-8 w-36 bg-slate-200 dark:bg-[#1a172c] rounded-xl mb-8" />
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-9 bg-slate-100 dark:bg-[#141220] rounded-xl w-full" />
          ))}
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-16 bg-white dark:bg-[#08070d] border-b border-slate-200 dark:border-[#1e1b2e] px-8 flex items-center justify-between animate-pulse">
          <div className="h-10 w-80 bg-slate-100 dark:bg-[#110f1c] rounded-xl" />
          <div className="flex gap-3">
            <div className="h-9 w-20 bg-slate-100 dark:bg-[#131122] rounded-xl" />
            <div className="h-9 w-9 bg-slate-100 dark:bg-[#131122] rounded-xl" />
          </div>
        </div>

        <div className="p-8 max-w-[1600px] mx-auto w-full space-y-8 animate-pulse">
          <div className="h-64 bg-slate-200 dark:bg-gradient-to-r dark:from-[#0e0a1f] dark:to-[#140e2b] rounded-[28px] border border-slate-200 dark:border-violet-500/20" />
          <div className="flex gap-2 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-9 w-28 bg-slate-100 dark:bg-[#120f20] rounded-xl shrink-0"
              />
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-[#110f1c] p-3 rounded-[22px] border border-slate-200 dark:border-[#211d35] space-y-3"
              >
                <div className="aspect-[16/10] bg-slate-100 dark:bg-[#1a162b] rounded-[16px]" />
                <div className="h-3 bg-slate-100 dark:bg-[#1e1933] rounded w-1/3" />
                <div className="h-4 bg-slate-100 dark:bg-[#1e1933] rounded w-3/4" />
                <div className="h-3 bg-slate-100 dark:bg-[#1e1933] rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
