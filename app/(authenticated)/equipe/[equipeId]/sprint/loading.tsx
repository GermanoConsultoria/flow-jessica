export default function Loading() {
  return (
    <div className="animate-pulse space-y-4 p-4 sm:p-6">
      <div className="h-8 w-40 bg-surface-highlight rounded-lg" />
      <div className="h-12 bg-surface-highlight rounded-xl" />
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-16 bg-surface-highlight rounded-xl" />
      ))}
    </div>
  )
}
