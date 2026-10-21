'use client'

import { useState } from 'react'
import { Plus, Search, Pencil, Trash2, Users } from 'lucide-react'
import ModalCliente from './ModalCliente'

interface Cliente {
  id: string
  nome: string
  plano_contratado: string | null
  valor_mensalidade: number | null
  vencimento_1: string | null
  vencimento_2: string | null
  data_entrada: string | null
  data_prevista: string | null
  ativo: boolean
}

interface Props {
  clientesIniciais: Cliente[]
}

function formatarData(data: string | null) {
  if (!data) return '—'
  return new Date(data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
}

function formatarMoeda(valor: number | null) {
  if (valor === null || valor === undefined) return '—'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)
}

export default function ClientesView({ clientesIniciais }: Props) {
  const [clientes, setClientes] = useState<Cliente[]>(clientesIniciais)
  const [busca, setBusca] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null)

  const clientesFiltrados = clientes.filter(c =>
    c.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (c.plano_contratado?.toLowerCase().includes(busca.toLowerCase()))
  )

  function abrirModalNovo() {
    setClienteEditando(null)
    setModalAberto(true)
  }

  function abrirModalEditar(cliente: Cliente) {
    setClienteEditando(cliente)
    setModalAberto(true)
  }

  async function excluirCliente(id: string) {
    if (!confirm('Deseja excluir este cliente?')) return
    await fetch(`/api/clientes/${id}`, { method: 'DELETE' })
    setClientes(prev => prev.filter(c => c.id !== id))
  }

  function onSalvar(clienteSalvo: Cliente) {
    if (clienteEditando) {
      setClientes(prev => prev.map(c => c.id === clienteSalvo.id ? clienteSalvo : c))
    } else {
      setClientes(prev => [...prev, clienteSalvo].sort((a, b) => a.nome.localeCompare(b.nome)))
    }
    setModalAberto(false)
  }

  return (
    <div className="space-y-6">
      {/* CABEÇALHO */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <Users size={20} className="text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Meus Clientes</h1>
            <p className="text-sm text-gray-400">{clientes.length} cliente{clientes.length !== 1 ? 's' : ''} cadastrado{clientes.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <button
          onClick={abrirModalNovo}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus size={16} />
          Novo Cliente
        </button>
      </div>

      {/* BARRA DE BUSCA */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nome ou plano..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-surface border border-border rounded-lg text-sm text-foreground placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>

      {/* TABELA */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-highlight/30">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Cliente</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Plano</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Mensalidade</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Vencimento 1</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Vencimento 2</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Entrada</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Previsão</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {clientesFiltrados.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-gray-500">
                  {busca ? 'Nenhum cliente encontrado para essa busca.' : 'Nenhum cliente cadastrado ainda.'}
                </td>
              </tr>
            ) : (
              clientesFiltrados.map(cliente => (
                <tr key={cliente.id} className="hover:bg-surface-highlight/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{cliente.nome}</td>
                  <td className="px-4 py-3 text-gray-300">{cliente.plano_contratado || '—'}</td>
                  <td className="px-4 py-3 text-gray-300">{formatarMoeda(cliente.valor_mensalidade)}</td>
                  <td className="px-4 py-3 text-gray-300">{formatarData(cliente.vencimento_1)}</td>
                  <td className="px-4 py-3 text-gray-300">{formatarData(cliente.vencimento_2)}</td>
                  <td className="px-4 py-3 text-gray-300">{formatarData(cliente.data_entrada)}</td>
                  <td className="px-4 py-3 text-gray-300">{formatarData(cliente.data_prevista)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => abrirModalEditar(cliente)}
                        className="p-1.5 rounded-md text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => excluirCliente(cliente.id)}
                        className="p-1.5 rounded-md text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {modalAberto && (
        <ModalCliente
          cliente={clienteEditando}
          onClose={() => setModalAberto(false)}
          onSalvar={onSalvar}
        />
      )}
    </div>
  )
}