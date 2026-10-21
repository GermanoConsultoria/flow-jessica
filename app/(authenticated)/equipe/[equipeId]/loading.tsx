export default function Loading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 animate-pulse space-y-6">
      <div className="h-8 w-48 bg-surface-highlight rounded-lg" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-40 bg-surface-highlight rounded-xl" />
        ))}
      </div>
    </div>
  )
}
