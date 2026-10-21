export default function Loading() {
  return (
    <div className="animate-pulse space-y-4 p-4">
      <div className="h-10 w-64 bg-surface-highlight rounded-lg" />
      <div className="flex gap-3 overflow-x-auto pb-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="min-w-[280px] h-[500px] bg-surface-highlight rounded-xl shrink-0" />
        ))}
      </div>
    </div>
  )
}
