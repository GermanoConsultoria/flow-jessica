'use client'

interface Props {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isSaving: boolean
  nomeColunaDest: string
  nomeResponsavelDest: string | null
}

export default function ModalTransferirTarefa({
  isOpen,
  onClose,
  onConfirm,
  isSaving,
  nomeColunaDest,
  nomeResponsavelDest,
}: Props) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-surface rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <h3 className="text-lg font-bold text-foreground mb-3">Concluir e transferir tarefa?</h3>

          <p className="text-sm text-gray-500 mb-2">
            Ao confirmar, esta tarefa será marcada como{' '}
            <strong className="text-green-600">concluída</strong> para você e uma nova será
            criada em{' '}
            <strong className="text-foreground">{nomeColunaDest}</strong>.
          </p>

          {nomeResponsavelDest && (
            <p className="text-xs text-indigo-500 font-medium mb-2">
              Será atribuída a: {nomeResponsavelDest}
            </p>
          )}

          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-gray-500 hover:bg-surface/50 rounded-lg text-sm font-medium transition-colors border border-border"
            >
              Não
            </button>
            <button
              onClick={onConfirm}
              disabled={isSaving}
              className="px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors bg-green-600 hover:bg-green-700 text-white disabled:opacity-60"
            >
              {isSaving ? 'Transferindo...' : 'Sim, concluir e transferir'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
