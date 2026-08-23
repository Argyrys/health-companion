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
    <div className="space-y-3 sm:space-y-5">
      <div className="animate-fadeIn">
        <Skeleton className="w-24 h-3 mb-2" />
        <Skeleton className="w-48 h-7 mb-1" />
        <Skeleton className="w-64 h-3" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl sm:rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-fadeIn" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="h-1 bg-slate-100" />
            <div className="p-3 sm:p-4 lg:p-5">
              <Skeleton className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl mb-3" />
              <Skeleton className="w-12 h-6 sm:h-7 mb-1" />
              <Skeleton className="w-20 h-3" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl sm:rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-4 sm:px-5 py-3 border-b border-slate-100 flex items-center justify-between">
            <Skeleton className="w-32 h-4" />
            <Skeleton className="w-16 h-3" />
          </div>
          <div className="divide-y divide-slate-50">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="px-4 sm:px-5 py-3.5 flex items-center gap-2.5">
                <Skeleton className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0" />
                <div className="flex-1">
                  <Skeleton className="w-28 h-4 mb-1.5" />
                  <Skeleton className="w-40 h-3" />
                </div>
                <Skeleton className="w-14 h-5 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5">
          <Skeleton className="w-24 h-4 mb-4" />
          <div className="space-y-2.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-xl">
                <Skeleton className="w-8 h-8 rounded-lg flex-shrink-0" />
                <div className="flex-1">
                  <Skeleton className="w-24 h-3.5 mb-1" />
                  <Skeleton className="w-16 h-2.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl sm:rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5">
            <Skeleton className="w-36 h-4 mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j}>
                  <div className="flex justify-between mb-1">
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
    <div className="space-y-3 sm:space-y-5">
      <div className="animate-fadeIn">
        <Skeleton className="w-28 h-6 mb-1" />
        <Skeleton className="w-36 h-3" />
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-2.5">
        <div className="flex items-center gap-2 flex-1 sm:flex-none sm:w-auto w-full">
          <Skeleton className="w-9 h-9 rounded-xl flex-shrink-0" />
          <Skeleton className="flex-1 sm:w-56 h-10 rounded-xl" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="w-9 h-9 rounded-xl flex-shrink-0" />
          <Skeleton className="w-28 h-10 rounded-xl" />
        </div>
      </div>

      <div className="space-y-2 sm:space-y-2.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl sm:rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex">
              <Skeleton className="w-1 flex-shrink-0" />
              <div className="flex-1 p-3 sm:p-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <Skeleton className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex-shrink-0" />
                  <div>
                    <Skeleton className="w-28 h-4 mb-1.5" />
                    <Skeleton className="w-36 h-3" />
                  </div>
                </div>
                <Skeleton className="w-14 h-5 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PatientReportSkeleton() {
  return (
    <div className="space-y-3 sm:space-y-5">
      <div className="flex items-center gap-2.5 sm:gap-3">
        <Skeleton className="w-9 h-9 rounded-xl" />
        <div className="flex-1">
          <Skeleton className="w-40 h-5 mb-1" />
          <Skeleton className="w-28 h-3" />
        </div>
        <Skeleton className="w-20 h-6 rounded-full" />
      </div>

      <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <Skeleton className="w-full h-1.5" />
        <div className="p-4 sm:p-5 flex items-start sm:items-center gap-3 sm:gap-4">
          <Skeleton className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex-shrink-0" />
          <div className="flex-1">
            <Skeleton className="w-36 h-5 mb-2" />
            <div className="flex gap-3">
              <Skeleton className="w-12 h-3" />
              <Skeleton className="w-8 h-3" />
              <Skeleton className="w-20 h-3" />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2.5 sm:space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl sm:rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-4 sm:px-5 py-3 sm:py-4 flex items-center gap-2.5 sm:gap-3">
              <Skeleton className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl" />
              <Skeleton className="w-32 h-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
