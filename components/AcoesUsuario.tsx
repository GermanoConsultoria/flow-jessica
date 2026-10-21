'use client'

import { useState, useTransition } from 'react'
import { Key, Power, Loader2, Pencil } from 'lucide-react'
import { toggleStatusUsuario } from '@/app/actions'
import ModalAlterarSenha from './ModalAlterarSenha'
import ModalEditarUsuario from './ModalEditarUsuario'

interface Props {
  usuario: {
    id: string
    nome: string
    email: string
    cargo: string | null
    role: string
    ativo: boolean
  }
}

export default function AcoesUsuario({ usuario }: Props) {
  const [modalSenhaAberto, setModalSenhaAberto] = useState(false)
  const [modalEditarAberto, setModalEditarAberto] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleToggleStatus = () => {
    startTransition(async () => {
      await toggleStatusUsuario(usuario.id)
    })
  }

  return (
    <>
      <div className="flex justify-end items-center gap-2">
        {/* Editar nome/email/cargo */}
        <button
          onClick={() => setModalEditarAberto(true)}
          className="p-2 text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors border border-transparent hover:border-indigo-500/20"
          title="Editar Usuário"
        >
          <Pencil size={18} />
        </button>

        {/* Alterar Senha */}
        <button
          onClick={() => setModalSenhaAberto(true)}
          className="p-2 text-amber-500 hover:bg-amber-500/10 rounded-lg transition-colors border border-transparent hover:border-amber-500/20"
          title="Alterar Senha"
        >
          <Key size={18} />
        </button>

        {/* Ativar/Inativar */}
        <button
          onClick={handleToggleStatus}
          disabled={isPending}
          className={`p-2 rounded-lg transition-colors border border-transparent flex items-center justify-center w-[36px] h-[36px] ${
            usuario.ativo
              ? 'text-red-500 hover:bg-red-500/10 hover:border-red-500/20'
              : 'text-green-500 hover:bg-green-500/10 hover:border-green-500/20'
          }`}
          title={usuario.ativo ? 'Inativar Usuário' : 'Ativar Usuário'}
        >
          {isPending ? <Loader2 size={18} className="animate-spin" /> : <Power size={18} />}
        </button>
      </div>

      <ModalAlterarSenha
        isOpen={modalSenhaAberto}
        onClose={() => setModalSenhaAberto(false)}
        usuario={usuario}
      />

      <ModalEditarUsuario
        isOpen={modalEditarAberto}
        onClose={() => setModalEditarAberto(false)}
        usuario={usuario}
      />
    </>
  )
}
