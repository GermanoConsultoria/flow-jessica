'use client'

import { useState } from 'react'

export const CORES_PROJETO = [
  '#6366f1', // indigo
  '#3b82f6', // blue
  '#06b6d4', // cyan
  '#10b981', // green
  '#84cc16', // lime
  '#eab308', // yellow
  '#f97316', // orange
  '#ef4444', // red
  '#ec4899', // pink
  '#a855f7', // purple
  '#64748b', // slate
]

interface Props {
  name: string
  defaultValue?: string | null
}

export default function SeletorCorProjeto({ name, defaultValue }: Props) {
  const [corSelecionada, setCorSelecionada] = useState<string>(defaultValue || '')

  return (
    <div>
      <input type="hidden" name={name} value={corSelecionada} />
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => setCorSelecionada('')}
          title="Sem cor"
          className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] text-gray-400 bg-surface transition-transform ${
            corSelecionada === '' ? 'border-indigo-500 scale-110' : 'border-border hover:scale-105'
          }`}
        >
          ✕
        </button>
        {CORES_PROJETO.map(cor => (
          <button
            key={cor}
            type="button"
            onClick={() => setCorSelecionada(cor)}
            title={cor}
            style={{ backgroundColor: cor }}
            className={`w-7 h-7 rounded-full border-2 transition-transform ${
              corSelecionada === cor ? 'border-foreground scale-110' : 'border-transparent hover:scale-105'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
