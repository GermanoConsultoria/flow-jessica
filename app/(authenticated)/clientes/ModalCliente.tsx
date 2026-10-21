'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

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
  cliente: Cliente | null
  onClose: () => void
  onSalvar: (cliente: Cliente) => void
}

function toInputDate(value: string | null) {
  if (!value) return ''
  return new Date(value).toISOString().split('T')[0]
}

export default function ModalCliente({ cliente, onClose, onSalvar }: Props) {
  const [nome, setNome] = useState(cliente?.nome ?? '')
  const [plano, setPlano] = useState(cliente?.plano_contratado ?? '')
  const [valor, setValor] = useState(cliente?.valor_mensalidade?.toString() ?? '')
  const [vencimento1, setVencimento1] = useState(toInputDate(cliente?.vencimento_1 ?? null))
  const [vencimento2, setVencimento2] = useState(toInputDate(cliente?.vencimento_2 ?? null))
  const [dataEntrada, setDataEntrada] = useState(toInputDate(cliente?.data_entrada ?? null))
  const [dataPrevista, setDataPrevista] = useState(toInputDate(cliente?.data_prevista ?? null))
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  async function handleSalvar() {
    if (!nome.trim()) {
      setErro('O nome do cliente é obrigatório.')
      return
    }

    setSalvando(true)
    setErro('')

    const body = {
      nome: nome.trim(),
      plano_contratado: plano.trim() || null,
      valor_mensalidade: valor ? parseFloat(valor.replace(',', '.')) : null,
      vencimento_1: vencimento1 || null,
      vencimento_2: vencimento2 || null,
      data_entrada: dataEntrada || null,
      data_prevista: dataPrevista || null,
    }

    const url = cliente ? `/api/clientes/${cliente.id}` : '/api/clientes'
    const method = cliente ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      const salvo = await res.json()
      onSalvar(salvo)
    } else {
      setErro('Erro ao salvar. Tente novamente.')
    }

    setSalvando(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface border border-border rounded-xl w-full max-w-lg shadow-2xl">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">
            {cliente ? 'Editar Cliente' : 'Novo Cliente'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-md text-gray-400 hover:text-foreground hover:bg-surface-highlight transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* BODY */}
        <div className="px-6 py-5 space-y-4">
          {erro && (
            <div className="px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
              {erro}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Nome do cliente <span className="text-red-400">*</span></label>
            <input
              type="text"
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="Ex: Empresa XYZ"
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Plano contratado</label>
            <input
              type="text"
              value={plano}
              onChange={e => setPlano(e.target.value)}
              placeholder="Ex: Pro, Básico, Enterprise..."
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Valor mensalidade</label>
            <input
              type="number"
              value={valor}
              onChange={e => setValor(e.target.value)}
              placeholder="0,00"
              min="0"
              step="0.01"
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Vencimento 1</label>
              <input
                type="date"
                value={vencimento1}
                onChange={e => setVencimento1(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Vencimento 2</label>
              <input
                type="date"
                value={vencimento2}
                onChange={e => setVencimento2(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Data de entrada</label>
              <input
                type="date"
                value={dataEntrada}
                onChange={e => setDataEntrada(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Data prevista</label>
              <input
                type="date"
                value={dataPrevista}
                onChange={e => setDataPrevista(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-400 hover:text-foreground hover:bg-surface-highlight rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSalvar}
            disabled={salvando}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {salvando ? 'Salvando...' : cliente ? 'Salvar alterações' : 'Adicionar cliente'}
          </button>
        </div>
      </div>
    </div>
  )
}