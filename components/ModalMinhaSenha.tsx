'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { alterarMinhaSenha } from '@/app/actions'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function ModalMinhaSenha({ isOpen, onClose }: Props) {
  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (novaSenha !== confirmar) {
      toast.error('A nova senha e a confirmação não coincidem.')
      return
    }
    setIsSaving(true)
    const resultado = await alterarMinhaSenha(senhaAtual, novaSenha)
    setIsSaving(false)
    if (!resultado.success) {
      toast.error(resultado.error)
      return
    }
    toast.success('Senha alterada com sucesso.')
    setSenhaAtual('')
    setNovaSenha('')
    setConfirmar('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface rounded-xl shadow-2xl w-full max-w-sm border border-border animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center">
          <h2 className="text-lg font-bold text-foreground">Alterar Minha Senha</h2>
          <button onClick={onClose} className="text-text-muted hover:text-foreground">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase mb-1">Senha Atual</label>
            <input
              type="password" value={senhaAtual} onChange={e => setSenhaAtual(e.target.value)}
              required autoFocus
              className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase mb-1">Nova Senha</label>
            <input
              type="password" value={novaSenha} onChange={e => setNovaSenha(e.target.value)}
              required minLength={6}
              className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase mb-1">Confirmar Nova Senha</label>
            <input
              type="password" value={confirmar} onChange={e => setConfirmar(e.target.value)}
              required minLength={6}
              className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-text-muted hover:text-foreground">Cancelar</button>
            <button type="submit" disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
              {isSaving ? 'Salvando...' : 'Alterar Senha'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
