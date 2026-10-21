export default function Loading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 animate-pulse space-y-6">
      <div className="h-8 w-56 bg-surface-highlight rounded-lg" />
      {/* Filtros */}
      <div className="h-16 bg-surface-highlight rounded-xl" />
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-24 bg-surface-highlight rounded-xl" />
        ))}
      </div>
      {/* Resumo usuários */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-surface-highlight rounded-xl" />
        ))}
      </div>
      {/* Gráfico */}
      <div className="h-96 bg-surface-highlight rounded-xl" />
    </div>
  )
}
