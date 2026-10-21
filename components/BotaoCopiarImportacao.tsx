'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export default function BotaoCopiarImportacao({ projetoId, projetoNome }: { projetoId: string; projetoNome: string }) {
  const [copiado, setCopiado] = useState(false)

  function copiar() {
    navigator.clipboard.writeText(projetoId)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <button
      onClick={copiar}
      title={`Copiar ID do projeto para importação\n${projetoNome}`}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-gray-400 hover:text-indigo-400 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all"
    >
      {copiado ? (
        <>
          <Check size={13} className="text-green-400" />
          <span className="text-green-400">ID copiado!</span>
        </>
      ) : (
        <>
          <Copy size={13} />
          Copiar ID
        </>
      )}
    </button>
  )
}
