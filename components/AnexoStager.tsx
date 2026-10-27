'use client'

import { useRef } from 'react'

interface Props {
  arquivos: File[]
  onChange: (arquivos: File[]) => void
  onRemover: () => void
}

export default function AnexoStager({ arquivos, onChange, onRemover }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  function adicionarArquivos(novos: FileList | null) {
    if (!novos || novos.length === 0) return
    onChange([...arquivos, ...Array.from(novos)])
    if (inputRef.current) inputRef.current.value = ''
  }

  function removerArquivo(index: number) {
    onChange(arquivos.filter((_, i) => i !== index))
  }

  return (
    <div className="bg-surface-highlight/10 border border-border rounded-lg p-3 space-y-2">
      <div className="flex justify-between items-center">
        <label className="block text-xs font-semibold text-text-muted uppercase">📎 Anexo</label>
        <button type="button" onClick={onRemover} className="text-text-muted hover:text-red-500 text-xs" title="Remover anexo">
          ✕
        </button>
      </div>

      {arquivos.length > 0 && (
        <div className="space-y-1.5">
          {arquivos.map((arquivo, index) => (
            <div key={`${arquivo.name}-${index}`} className="flex items-center justify-between gap-2 bg-surface border border-border rounded-lg px-3 py-1.5">
              <span className="text-sm text-foreground truncate" title={arquivo.name}>{arquivo.name}</span>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] text-text-muted">{Math.round(arquivo.size / 1024)} KB</span>
                <button type="button" onClick={() => removerArquivo(index)} className="text-text-muted hover:text-red-500 text-xs" title="Remover arquivo">
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="text-xs font-medium text-indigo-500 hover:text-indigo-600"
      >
        + Selecionar arquivo(s)
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        onChange={e => adicionarArquivos(e.target.files)}
        className="hidden"
      />
      <p className="text-[10px] text-text-muted">Enviado ao criar a tarefa. Máx. 4 arquivos, 8MB cada.</p>
    </div>
  )
}
