'use client'

import { useEffect, useRef, useState } from 'react'

export interface ItemMenuAdicionar {
  key: string
  label: string
  icone: string
}

interface Props {
  itens: ItemMenuAdicionar[]
  onSelect: (key: string) => void
}

export default function ItensAdicionarMenu({ itens, onSelect }: Props) {
  const [aberto, setAberto] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function fechar(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false)
    }
    document.addEventListener('mousedown', fechar)
    return () => document.removeEventListener('mousedown', fechar)
  }, [])

  if (itens.length === 0) return null

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={() => setAberto(v => !v)}
        className="flex items-center gap-1.5 text-sm font-medium text-indigo-500 hover:text-indigo-600 border border-dashed border-indigo-300 hover:border-indigo-400 rounded-lg px-3 py-1.5 transition-colors"
      >
        <span className="text-base leading-none">+</span> Adicionar
      </button>

      {aberto && (
        <div className="absolute z-10 mt-1 w-52 bg-surface border border-border rounded-lg shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {itens.map(item => (
            <button
              key={item.key}
              type="button"
              onClick={() => { onSelect(item.key); setAberto(false) }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-surface-highlight/40 transition-colors text-left"
            >
              <span>{item.icone}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
