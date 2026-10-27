'use client'

import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { criarTarefa, criarChecklistComItens, salvarAnexoNoBanco } from '@/app/actions'
import { uploadFiles } from '@/lib/uploadthing'
import ItensAdicionarMenu, { type ItemMenuAdicionar } from '@/components/ItensAdicionarMenu'
import ChecklistBuilder from '@/components/checklist/ChecklistBuilder'
import AnexoStager from '@/components/AnexoStager'
import type { ColunaBasica, UsuarioBasico } from '@/types'
import type { Recorrencia } from '@prisma/client'

interface Props {
  projetoId: string
  colunas: ColunaBasica[]
  usuarios: UsuarioBasico[]
}

const ITENS_ADICIONAR: ItemMenuAdicionar[] = [
  { key: 'data', label: 'Data e Hora', icone: '📅' },
  { key: 'responsavel', label: 'Responsável', icone: '👤' },
  { key: 'prioridade', label: 'Prioridade e Dificuldade', icone: '🎯' },
  { key: 'checklist', label: 'Checklist', icone: '✅' },
  { key: 'anexo', label: 'Anexo', icone: '📎' },
]

export default function ModalCriarTarefa({ projetoId, colunas, usuarios }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Estados base (sempre visíveis)
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [colunaId, setColunaId] = useState(colunas.length > 0 ? colunas[0].id : '')
  const [recorrencia, setRecorrencia] = useState<Recorrencia>('NAO')
  const [diasRecorrencia, setDiasRecorrencia] = useState<number[]>([0, 1, 2, 3, 4, 5, 6])
  const [diaMesRecorrencia, setDiaMesRecorrencia] = useState<number>(1)

  // Itens opcionais ativos
  const [itensAtivos, setItensAtivos] = useState<Set<string>>(new Set())

  // Estados dos blocos opcionais
  const [dtVencimento, setDtVencimento] = useState('')
  const [horaVencimento, setHoraVencimento] = useState('')
  const [usuarioId, setUsuarioId] = useState('')
  const [prioridadeId, setPrioridadeId] = useState('2')
  const [dificuldadeId, setDificuldadeId] = useState('3')
  const [checklistTitulo, setChecklistTitulo] = useState('')
  const [checklistItens, setChecklistItens] = useState<string[]>([''])
  const [anexoArquivos, setAnexoArquivos] = useState<File[]>([])

  const descricaoRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (descricaoRef.current) {
      descricaoRef.current.style.height = 'auto'
      descricaoRef.current.style.height = `${descricaoRef.current.scrollHeight}px`
    }
  }, [descricao, isOpen])

  const DIAS_SEMANA = [
    { idx: 0, label: 'DOM' },
    { idx: 1, label: 'SEG' },
    { idx: 2, label: 'TER' },
    { idx: 3, label: 'QUA' },
    { idx: 4, label: 'QUI' },
    { idx: 5, label: 'SEX' },
    { idx: 6, label: 'SAB' },
  ]

  const toggleDia = (idx: number) =>
    setDiasRecorrencia(prev =>
      prev.includes(idx) ? prev.filter(d => d !== idx) : [...prev, idx]
    )

  const itensDisponiveis = ITENS_ADICIONAR.filter(item => !itensAtivos.has(item.key))

  function adicionarItem(key: string) {
    setItensAtivos(prev => new Set(prev).add(key))
  }

  function removerItem(key: string) {
    setItensAtivos(prev => {
      const novo = new Set(prev)
      novo.delete(key)
      return novo
    })
    if (key === 'data') { setDtVencimento(''); setHoraVencimento('') }
    if (key === 'responsavel') setUsuarioId('')
    if (key === 'prioridade') { setPrioridadeId('2'); setDificuldadeId('3') }
    if (key === 'checklist') { setChecklistTitulo(''); setChecklistItens(['']) }
    if (key === 'anexo') setAnexoArquivos([])
  }

  function resetForm() {
    setTitulo('')
    setDescricao('')
    setColunaId(colunas.length > 0 ? colunas[0].id : '')
    setRecorrencia('NAO')
    setDiasRecorrencia([0, 1, 2, 3, 4, 5, 6])
    setDiaMesRecorrencia(1)
    setItensAtivos(new Set())
    setDtVencimento('')
    setHoraVencimento('')
    setUsuarioId('')
    setPrioridadeId('2')
    setDificuldadeId('3')
    setChecklistTitulo('')
    setChecklistItens([''])
    setAnexoArquivos([])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!titulo.trim()) return

    setIsSaving(true)

    let dataIso: Date | null = null
    if (itensAtivos.has('data') && dtVencimento) {
      const [ano, mes, dia] = dtVencimento.split('-').map(Number)
      if (horaVencimento) {
        const [hora, minuto] = horaVencimento.split(':').map(Number)
        dataIso = new Date(ano, mes - 1, dia, hora, minuto, 0)
      } else {
        dataIso = new Date(ano, mes - 1, dia, 12, 0, 0)
      }
    }

    const resultado = await criarTarefa({
      titulo,
      descricao,
      dt_vencimento: dataIso,
      projeto_id: projetoId,
      coluna_id: colunaId,
      prioridade_id: Number(prioridadeId),
      dificuldade_id: Number(dificuldadeId),
      usuario_id: itensAtivos.has('responsavel') ? (usuarioId || null) : null,
      recorrencia,
      dias_recorrencia: recorrencia !== 'NAO' && recorrencia !== 'MENSALMENTE' && diasRecorrencia.length > 0
        ? diasRecorrencia.sort((a, b) => a - b).join(',')
        : null,
      dia_mes_recorrencia: recorrencia === 'MENSALMENTE' ? diaMesRecorrencia : null,
    })

    if (!resultado.success) {
      setIsSaving(false)
      toast.error(resultado.error)
      return
    }

    const novoId = resultado.data.id

    if (itensAtivos.has('checklist') && checklistTitulo.trim()) {
      await criarChecklistComItens(novoId, checklistTitulo, checklistItens)
    }

    if (itensAtivos.has('anexo') && anexoArquivos.length > 0) {
      try {
        const enviados = await uploadFiles('anexoUploader', { files: anexoArquivos })
        for (const arquivo of enviados) {
          await salvarAnexoNoBanco({ nome: arquivo.name, url: arquivo.url, key: arquivo.key, tamanho: arquivo.size, tarefaId: novoId })
        }
      } catch {
        toast.error('Tarefa criada, mas houve um erro ao enviar os anexos.')
      }
    }

    setIsSaving(false)
    setIsOpen(false)
    resetForm()
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
      >
        <span className="text-lg leading-none">+</span>
        <span className="hidden sm:inline">Nova Tarefa</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsOpen(false)} />

          <div className="relative bg-surface sm:rounded-xl rounded-t-2xl shadow-2xl w-full sm:max-w-lg flex flex-col max-h-[92vh] sm:max-h-[90vh] animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 border border-border border-b-0 sm:border-b overflow-hidden">
            {/* drag handle mobile */}
            <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 bg-border rounded-full" />
            </div>

            <div className="px-5 py-3 pt-4 border-b border-border bg-surface-highlight/20 flex justify-between items-center shrink-0">
              <h2 className="text-base font-bold text-foreground">Criar Nova Tarefa</h2>
              <button onClick={() => setIsOpen(false)} className="text-text-muted hover:text-foreground p-1">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto">

              {/* TÍTULO */}
              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase mb-1">Título</label>
                <input
                  value={titulo} onChange={e => setTitulo(e.target.value)}
                  required
                  autoFocus
                  className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-indigo-500 outline-none placeholder-text-muted"
                  placeholder="O que precisa ser feito?"
                />
              </div>

              {/* DESCRIÇÃO */}
              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase mb-1">Descrição</label>
                <textarea
                  ref={descricaoRef}
                  value={descricao} onChange={e => setDescricao(e.target.value)}
                  rows={2}
                  className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-indigo-500 outline-none placeholder-text-muted resize-none overflow-hidden"
                  placeholder="Detalhes da tarefa..."
                />
              </div>

              {/* ETAPA */}
              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase mb-1">Etapa Inicial</label>
                <select value={colunaId} onChange={e => setColunaId(e.target.value)} className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-indigo-500 outline-none">
                  {colunas.map(c => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>

              {/* REPETIR */}
              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase mb-1">Repetir</label>
                <select
                  value={recorrencia} onChange={e => setRecorrencia(e.target.value as Recorrencia)}
                  className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="NAO">Nunca</option>
                  <option value="DIARIAMENTE">Diariamente</option>
                  <option value="SEMANALMENTE">Semanalmente</option>
                  <option value="MENSALMENTE">Mensalmente</option>
                </select>
              </div>

              {/* SELETOR DE DIAS / DIA DO MÊS */}
              {recorrencia !== 'NAO' && (
                <div>
                  {recorrencia === 'MENSALMENTE' ? (
                    <div>
                      <label className="block text-xs font-semibold text-text-muted uppercase mb-1">Dia do mês</label>
                      <input
                        type="number"
                        min={1} max={31}
                        value={diaMesRecorrencia}
                        onChange={e => setDiaMesRecorrencia(Math.min(31, Math.max(1, Number(e.target.value))))}
                        className="w-24 bg-surface border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-semibold text-text-muted uppercase mb-1">Dias da semana</label>
                      <div className="flex gap-1.5">
                        {DIAS_SEMANA.map(d => (
                          <button
                            key={d.idx}
                            type="button"
                            onClick={() => toggleDia(d.idx)}
                            className={`px-2 py-1 rounded text-xs font-bold transition-colors ${
                              diasRecorrencia.includes(d.idx)
                                ? 'bg-indigo-600 text-white'
                                : 'bg-surface border border-border text-text-muted hover:border-indigo-400'
                            }`}
                          >
                            {d.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* --- ITENS OPCIONAIS --- */}

              {itensAtivos.has('data') && (
                <div className="bg-surface-highlight/10 border border-border rounded-lg p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-semibold text-text-muted uppercase">📅 Data e Hora</label>
                    <button type="button" onClick={() => removerItem('data')} className="text-text-muted hover:text-red-500 text-xs">✕</button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="date"
                      value={dtVencimento} onChange={e => setDtVencimento(e.target.value)}
                      className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-indigo-500 outline-none scheme-dark"
                    />
                    <input
                      type="time"
                      value={horaVencimento} onChange={e => setHoraVencimento(e.target.value)}
                      className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-indigo-500 outline-none scheme-dark"
                    />
                  </div>
                </div>
              )}

              {itensAtivos.has('responsavel') && (
                <div className="bg-surface-highlight/10 border border-border rounded-lg p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-semibold text-text-muted uppercase">👤 Responsável</label>
                    <button type="button" onClick={() => removerItem('responsavel')} className="text-text-muted hover:text-red-500 text-xs">✕</button>
                  </div>
                  <select value={usuarioId} onChange={e => setUsuarioId(e.target.value)} className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option value="">Selecione...</option>
                    {usuarios.map(u => (
                      <option key={u.id} value={u.id}>{u.nome}</option>
                    ))}
                  </select>
                </div>
              )}

              {itensAtivos.has('prioridade') && (
                <div className="bg-surface-highlight/10 border border-border rounded-lg p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-semibold text-text-muted uppercase">🎯 Prioridade e Dificuldade</label>
                    <button type="button" onClick={() => removerItem('prioridade')} className="text-text-muted hover:text-red-500 text-xs">✕</button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={prioridadeId} onChange={e => setPrioridadeId(e.target.value)}
                      className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="1">1 - Baixa</option>
                      <option value="2">2 - Média</option>
                      <option value="3">3 - Alta</option>
                    </select>
                    <select
                      value={dificuldadeId} onChange={e => setDificuldadeId(e.target.value)}
                      className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="1">1 - Muito Fácil</option>
                      <option value="2">2 - Fácil</option>
                      <option value="3">3 - Média</option>
                      <option value="4">4 - Difícil</option>
                      <option value="5">5 - Muito Difícil</option>
                    </select>
                  </div>
                </div>
              )}

              {itensAtivos.has('checklist') && (
                <ChecklistBuilder
                  titulo={checklistTitulo}
                  itens={checklistItens}
                  onChangeTitulo={setChecklistTitulo}
                  onChangeItens={setChecklistItens}
                  onRemover={() => removerItem('checklist')}
                />
              )}

              {itensAtivos.has('anexo') && (
                <AnexoStager
                  arquivos={anexoArquivos}
                  onChange={setAnexoArquivos}
                  onRemover={() => removerItem('anexo')}
                />
              )}

              <ItensAdicionarMenu itens={itensDisponiveis} onSelect={adicionarItem} />

              <div className="flex justify-end pt-4 gap-2 border-t border-border mt-2 pb-safe">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2.5 text-sm text-text-muted hover:text-foreground transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving ? 'Criando...' : 'Criar Tarefa'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </>
  )
}
