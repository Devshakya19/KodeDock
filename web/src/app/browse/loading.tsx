export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="h-16 bg-white border-b border-slate-200" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-40 bg-slate-200 rounded-2xl animate-pulse mb-8" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-video bg-slate-200 rounded-t-xl" />
              <div className="p-4 space-y-3 border border-t-0 border-slate-200 rounded-b-xl">
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-200 rounded w-full" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
