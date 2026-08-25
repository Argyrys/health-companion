const Skeleton = ({ className = '', count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-slate-200 rounded-lg ${className}`}
        />
      ))}
    </>
  );
};

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="animate-fadeIn">
        <Skeleton className="w-56 h-8 mb-2" />
        <Skeleton className="w-40 h-3" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-fadeIn" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="p-5">
              <Skeleton className="w-11 h-11 rounded-xl mb-3" />
              <Skeleton className="w-14 h-7 mb-1" />
              <Skeleton className="w-24 h-3" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <Skeleton className="w-32 h-4" />
            <Skeleton className="w-16 h-3" />
          </div>
          <div className="divide-y divide-slate-50">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="px-5 py-4 flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
                <div className="flex-1">
                  <Skeleton className="w-28 h-4 mb-1.5" />
                  <Skeleton className="w-40 h-3" />
                </div>
                <Skeleton className="w-14 h-5 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <Skeleton className="w-28 h-4 mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl">
                <Skeleton className="w-9 h-9 rounded-lg flex-shrink-0" />
                <div className="flex-1">
                  <Skeleton className="w-24 h-3.5 mb-1" />
                  <Skeleton className="w-16 h-2.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <Skeleton className="w-36 h-4 mb-5" />
            <div className="space-y-3.5">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j}>
                  <div className="flex justify-between mb-1.5">
                    <Skeleton className="w-20 h-3" />
                    <Skeleton className="w-6 h-3" />
                  </div>
                  <Skeleton className="w-full h-2 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PatientListSkeleton() {
  return (
    <div className="space-y-5">
      <div className="animate-fadeIn">
        <Skeleton className="w-32 h-8 mb-1" />
        <Skeleton className="w-40 h-3" />
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="flex items-center gap-2 flex-1 w-full">
          <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
          <Skeleton className="flex-1 h-10 rounded-xl" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
          <Skeleton className="w-28 h-10 rounded-xl" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-3 border-b border-slate-100">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className={`h-3 ${i === 0 ? 'col-span-4 w-20' : i === 4 ? 'col-span-1 w-12' : 'col-span-2 w-16'}`} />
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="px-5 py-4 flex items-center gap-3 border-b border-slate-50 last:border-0">
            <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
            <div className="flex-1">
              <Skeleton className="w-28 h-4 mb-1.5" />
              <Skeleton className="w-36 h-3" />
            </div>
            <Skeleton className="w-16 h-6 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function PatientReportSkeleton() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Skeleton className="w-9 h-9 rounded-xl" />
        <div className="flex-1">
          <Skeleton className="w-40 h-6 mb-1" />
          <Skeleton className="w-28 h-3" />
        </div>
        <Skeleton className="w-20 h-8 rounded-xl" />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <Skeleton className="w-full h-1.5" />
        <div className="p-5 flex items-start gap-4">
          <Skeleton className="w-14 h-14 rounded-xl flex-shrink-0" />
          <div className="flex-1">
            <Skeleton className="w-36 h-6 mb-2" />
            <div className="flex gap-3">
              <Skeleton className="w-12 h-3" />
              <Skeleton className="w-8 h-3" />
              <Skeleton className="w-20 h-3" />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 flex items-center gap-3">
              <Skeleton className="w-9 h-9 rounded-lg" />
              <Skeleton className="w-32 h-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
