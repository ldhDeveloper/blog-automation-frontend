export function PostsLoading() {
  return (
    <div className="space-y-4">
      {/* 헤더 스켈레톤 */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="h-4 w-72 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-10 w-32 bg-muted animate-pulse rounded" />
      </div>

      {/* 필터 스켈레톤 */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        <div className="flex-1 space-y-2">
          <div className="h-4 w-12 bg-muted animate-pulse rounded" />
          <div className="h-10 w-full bg-muted animate-pulse rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-8 bg-muted animate-pulse rounded" />
          <div className="h-10 w-full md:w-[180px] bg-muted animate-pulse rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-8 bg-muted animate-pulse rounded" />
          <div className="h-10 w-full md:w-[180px] bg-muted animate-pulse rounded" />
        </div>
      </div>

      {/* 테이블 스켈레톤 */}
      <div className="rounded-md border">
        <div className="border-b">
          <div className="flex p-4">
            <div className="flex-1 h-4 bg-muted animate-pulse rounded mr-4" />
            <div className="w-20 h-4 bg-muted animate-pulse rounded mr-4" />
            <div className="w-20 h-4 bg-muted animate-pulse rounded mr-4" />
            <div className="w-20 h-4 bg-muted animate-pulse rounded mr-4" />
            <div className="w-20 h-4 bg-muted animate-pulse rounded mr-4" />
            <div className="w-16 h-4 bg-muted animate-pulse rounded" />
          </div>
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="border-b last:border-b-0">
            <div className="flex p-4">
              <div className="flex-1 h-4 bg-muted animate-pulse rounded mr-4" />
              <div className="w-20 h-6 bg-muted animate-pulse rounded mr-4" />
              <div className="w-20 h-4 bg-muted animate-pulse rounded mr-4" />
              <div className="w-20 h-4 bg-muted animate-pulse rounded mr-4" />
              <div className="w-20 h-4 bg-muted animate-pulse rounded mr-4" />
              <div className="w-16 h-8 bg-muted animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
