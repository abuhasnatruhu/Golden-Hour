import { Skeleton } from "@/components/ui/skeleton"

export function GoldenHourCardSkeleton() {
  return (
    <div className="text-center mb-8">
      <div className="relative inline-flex flex-col items-center">
        <div className="relative z-10 inline-flex flex-col items-center gap-4 rounded-3xl px-4 sm:px-8 md:px-12 py-6 sm:py-8 w-full max-w-2xl mx-auto shadow-2xl border border-amber-200/40 bg-gradient-to-b from-sky-100 to-orange-50">
          <Skeleton className="w-12 h-12 rounded-full" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-16 w-48" />
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-8 w-36" />
          <div className="flex flex-col items-center gap-2">
            <Skeleton className="h-4 w-56" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function TimeCardsSkeleton() {
  return (
    <div className="max-w-4xl mx-auto grid gap-6 md:grid-cols-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white/95 backdrop-blur-sm border-0 shadow-xl rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="w-5 h-5 rounded" />
            <Skeleton className="h-5 w-24" />
          </div>
          <div className="space-y-4">
            <div className="p-3 bg-orange-50 rounded-lg">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-6 w-32" />
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-6 w-32" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function MapSkeleton() {
  return (
    <div className="max-w-6xl mx-auto mb-8">
      <Skeleton className="h-[400px] w-full rounded-lg" />
    </div>
  )
}

export function WeatherBadgesSkeleton() {
  return (
    <div className="flex items-center gap-2 mt-1">
      <Skeleton className="h-6 w-24 rounded-full" />
      <Skeleton className="h-6 w-24 rounded-full" />
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>
  )
}
