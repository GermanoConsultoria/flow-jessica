'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { editarUsuario } from '@/app/actions'

interface Props {
  isOpen: boolean
  onClose: () => void
  usuario: { id: string; nome: string; email: string; cargo: string | null; role: string }
}

export default function ModalEditarUsuario({ isOpen, onClose, usuario }: Props) {
  const [nome, setNome] = useState(usuario.nome)
  const [email, setEmail] = useState(usuario.email)
  const [cargo, setCargo] = useState(usuario.cargo || '')
  const [role, setRole] = useState(usuario.role)
  const [isSaving, setIsSaving] = useState(false)

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    const resultado = await editarUsuario(usuario.id, { nome, email, cargo, role })
    setIsSaving(false)
    if (!resultado.success) {
      toast.error(resultado.error)
      return
    }
    toast.success('Usuário atualizado.')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface rounded-xl shadow-2xl w-full max-w-md border border-border animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center">
          <h2 className="text-lg font-bold text-foreground">Editar Usuário</h2>
          <button onClick={onClose} className="text-text-muted hover:text-foreground">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase mb-1">Nome</label>
            <input
              value={nome} onChange={e => setNome(e.target.value)}
              required autoFocus autoComplete="off"
              className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase mb-1">E-mail</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              required autoComplete="off"
              className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase mb-1">Cargo <span className="normal-case font-normal">(opcional)</span></label>
            <input
              value={cargo} onChange={e => setCargo(e.target.value)}
              placeholder="Ex: Designer, Copywriter..."
              className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-indigo-500 outline-none placeholder-text-muted"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase mb-1">Perfil de Acesso</label>
            <select
              value={role} onChange={e => setRole(e.target.value)}
              className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="MEMBER">Membro</option>
              <option value="MANAGER">Gerente</option>
              <option value="OWNER">Administrador</option>
              <option value="USER">Usuário</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-text-muted hover:text-foreground">Cancelar</button>
            <button type="submit" disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
              {isSaving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
