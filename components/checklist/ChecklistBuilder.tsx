'use client'

interface Props {
  titulo: string
  itens: string[]
  onChangeTitulo: (titulo: string) => void
  onChangeItens: (itens: string[]) => void
  onRemover: () => void
}

export default function ChecklistBuilder({ titulo, itens, onChangeTitulo, onChangeItens, onRemover }: Props) {
  function atualizarItem(index: number, texto: string) {
    const novos = [...itens]
    novos[index] = texto
    onChangeItens(novos)
  }

  function removerItem(index: number) {
    onChangeItens(itens.filter((_, i) => i !== index))
  }

  function adicionarItem() {
    onChangeItens([...itens, ''])
  }

  return (
    <div className="bg-surface-highlight/10 border border-border rounded-lg p-3 space-y-2">
      <div className="flex justify-between items-center">
        <label className="block text-xs font-semibold text-text-muted uppercase">✅ Checklist</label>
        <button type="button" onClick={onRemover} className="text-text-muted hover:text-red-500 text-xs" title="Remover checklist">
          ✕
        </button>
      </div>

      <input
        value={titulo}
        onChange={e => onChangeTitulo(e.target.value)}
        placeholder="Título da checklist (ex: Itens de publicação)"
        className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-indigo-500 outline-none placeholder-text-muted"
      />

      <div className="space-y-1.5">
        {itens.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              value={item}
              onChange={e => atualizarItem(index, e.target.value)}
              placeholder={`Item ${index + 1}`}
              className="flex-1 bg-surface border border-border rounded-lg px-3 py-1.5 text-sm text-foreground focus:ring-2 focus:ring-indigo-500 outline-none placeholder-text-muted"
            />
            <button type="button" onClick={() => removerItem(index)} className="text-text-muted hover:text-red-500 text-xs px-1" title="Remover item">
              ✕
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={adicionarItem}
        className="text-xs font-medium text-indigo-500 hover:text-indigo-600"
      >
        + Adicionar item
      </button>
    </div>
  )
}
