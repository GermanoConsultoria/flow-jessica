'use client'

import { useState } from 'react'

interface Props {
  isOpen: boolean
  onClose: () => void
  onConfirm: (comentario: string) => void
  isSaving: boolean
}

export default function ModalVoltarTarefa({ isOpen, onClose, onConfirm, isSaving }: Props) {
  const [comentario, setComentario] = useState('')

  if (!isOpen) return null

  const podeConfirmar = comentario.trim().length >= 10

  const handleConfirm = () => {
    if (!podeConfirmar) return
    onConfirm(comentario)
    setComentario('')
  }

  const handleClose = () => {
    setComentario('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-surface rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">↩️</span>
            <h3 className="text-lg font-bold text-foreground">Por que está voltando esta tarefa?</h3>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Explique o motivo do retorno. <strong>Mínimo 10 caracteres.</strong>
          </p>

          <textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="Ex: Revisar o layout conforme feedback do cliente..."
            className="w-full border border-border rounded-lg p-3 text-sm bg-background text-foreground focus:ring-2 focus:ring-orange-400 outline-none resize-none h-32 mb-1"
            autoFocus
          />

          <div className="flex justify-between items-center mb-4">
            <span className={`text-[10px] font-medium ${podeConfirmar ? 'text-green-500' : 'text-gray-400'}`}>
              {comentario.trim().length}/10 caracteres mínimos
            </span>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={handleClose}
              disabled={isSaving}
              className="px-4 py-2 text-gray-500 hover:bg-surface/50 rounded-lg text-sm font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={!podeConfirmar || isSaving}
              className={`px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors ${
                podeConfirmar
                  ? 'bg-orange-500 hover:bg-orange-600 text-white'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isSaving ? 'Movendo...' : 'Confirmar Retorno'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
