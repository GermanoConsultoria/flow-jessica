'use client'

import { useState, useEffect } from 'react'
import { criarProjeto, getColunasDaEquipe, getUsuariosDoWorkspace } from '@/app/actions'
import { toast } from 'sonner'

interface Props {
  isOpen: boolean
  onClose: () => void
  equipeId: string
}

type ColunaOpcao = { id: string; nome: string }
type UsuarioOpcao = { id: string; nome: string }

export default function ModalCriarProjeto({ isOpen, onClose, equipeId }: Props) {
  const [loading, setLoading] = useState(false)
  const [colunasDisponiveis, setColunasDisponiveis] = useState<ColunaOpcao[]>([])
  const [usuariosDisponiveis, setUsuariosDisponiveis] = useState<UsuarioOpcao[]>([])

  // Busca colunas e usuários quando o modal abre
  useEffect(() => {
    if (isOpen) {
        getColunasDaEquipe(equipeId).then(dados => setColunasDisponiveis(dados))
        getUsuariosDoWorkspace().then(dados => setUsuariosDisponiveis(dados.map(u => ({ id: u.id, nome: u.nome }))))
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    const resultado = await criarProjeto(formData)
    setLoading(false)
    if (!resultado.success) {
      toast.error(resultado.error)
      return
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-surface rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
        
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-surface/50">
          <h3 className="font-bold text-foreground">Criar Novo Projeto</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <form action={handleSubmit} className="p-6 space-y-5">
          <input type="hidden" name="equipeId" value={equipeId} />

          {/* ========================================== */}
          {/* DADOS BÁSICOS (Sempre aparecem)            */}
          {/* ========================================== */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome do Cliente/Projeto *</label>
            <input name="nome" type="text" required placeholder="Ex: Macropack Distribuidora" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-background text-foreground" autoFocus />
          </div>

          <div>
             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descrição</label>
             <textarea name="descricao" rows={2} placeholder="Detalhes adicionais..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none bg-background text-foreground" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Responsável</label>
            <select name="responsavelId" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-background text-foreground">
              <option value="">Não atribuído</option>
              {usuariosDisponiveis.map(u => (
                <option key={u.id} value={u.id}>{u.nome}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Data de Início</label>
              <input name="data_inicio" type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-background text-foreground" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Previsão de Entrega</label>
              <input name="data_prevista_entrega" type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-background text-foreground" />
            </div>
          </div>

          {/* ========================================== */}
          {/* ETAPAS DO PROJETO                          */}
          {/* ========================================== */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Quais etapas este projeto terá?</label>
            {colunasDisponiveis.length === 0 ? (
                <div className="p-3 bg-yellow-50 text-yellow-700 text-xs rounded border border-yellow-100">
                    ⚠️ Seu workspace ainda não tem colunas cadastradas. Vá em Gerenciar Colunas primeiro.
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border rounded-lg bg-surface/50">
                    {colunasDisponiveis.map(col => (
                        <label key={col.id} className="flex items-center space-x-2 bg-surface p-2 rounded border cursor-pointer hover:border-indigo-300 transition-colors">
                            <input
                                type="checkbox"
                                name="colunas"
                                value={col.id}
                                className="rounded text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm text-gray-700">{col.nome}</span>
                        </label>
                    ))}
                </div>
            )}
            <p className="text-[10px] text-gray-400 mt-1">Selecione na ordem que deseja que apareçam.</p>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-surface/50 rounded-lg">Cancelar</button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50">
              {loading ? 'Processando...' : 'Criar Projeto'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}