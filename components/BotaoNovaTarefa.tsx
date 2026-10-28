'use client'

import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { criarTarefa, criarChecklistComItens, salvarAnexoNoBanco } from '@/app/actions'
import { uploadFiles } from '@/lib/uploadthing'
import ItensAdicionarMenu, { type ItemMenuAdicionar } from '@/components/ItensAdicionarMenu'
import ChecklistBuilder from '@/components/checklist/ChecklistBuilder'
import AnexoStager from '@/components/AnexoStager'
import type { UsuarioBasico, ColunaBasica } from '@/types'
import type { Recorrencia } from '@prisma/client'

interface Props {
  projetoId: string
  colunas?: ColunaBasica[]
  usuarios?: UsuarioBasico[]
}

const ITENS_ADICIONAR: ItemMenuAdicionar[] = [
  { key: 'data', label: 'Data e Hora', icone: '📅' },
  { key: 'responsavel', label: 'Responsável', icone: '👤' },
  { key: 'prioridade', label: 'Prioridade e Dificuldade', icone: '🎯' },
  { key: 'checklist', label: 'Checklist', icone: '✅' },
  { key: 'anexo', label: 'Anexo', icone: '📎' },
]

export default function BotaoNovaTarefa({ projetoId, colunas = [], usuarios = [] }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [colunaId, setColunaId] = useState(colunas.length > 0 ? colunas[0].id : '')
  const [recorrencia, setRecorrencia] = useState<Recorrencia>('NAO')
  const [diasRecorrencia, setDiasRecorrencia] = useState<number[]>([0, 1, 2, 3, 4, 5, 6])
  const [diaMesRecorrencia, setDiaMesRecorrencia] = useState<number>(1)

  const [itensAtivos, setItensAtivos] = useState<Set<string>>(new Set())

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
        className="bg-indigo-600 text-white px-3 py-2 rounded text-sm font-bold"
      >
        + Nova Tarefa
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface p-6 rounded-lg w-full max-w-md shadow-xl border border-border max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4 text-foreground">Nova Tarefa</h2>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase">Título</label>
                <input value={titulo} onChange={e => setTitulo(e.target.value)} required autoFocus className="w-full border border-border bg-background rounded p-2 text-foreground" />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-muted uppercase">Descrição</label>
                <textarea
                  ref={descricaoRef}
                  value={descricao}
                  onChange={e => setDescricao(e.target.value)}
                  rows={2}
                  className="w-full border border-border bg-background rounded p-2 text-foreground resize-none overflow-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-muted uppercase">Etapa Inicial</label>
                <select value={colunaId} onChange={e => setColunaId(e.target.value)} className="w-full border border-border bg-background rounded p-2 text-foreground">
                  {colunas.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-muted uppercase">Repetir</label>
                <select value={recorrencia} onChange={e => setRecorrencia(e.target.value as Recorrencia)} className="w-full border border-border bg-background rounded p-2 text-foreground">
                  <option value="NAO">Nunca</option>
                  <option value="DIARIAMENTE">Diariamente</option>
                  <option value="SEMANALMENTE">Semanalmente</option>
                  <option value="MENSALMENTE">Mensalmente</option>
                </select>
              </div>

              {recorrencia !== 'NAO' && (
                recorrencia === 'MENSALMENTE' ? (
                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase">Dia do mês</label>
                    <input
                      type="number" min={1} max={31}
                      value={diaMesRecorrencia}
                      onChange={e => setDiaMesRecorrencia(Math.min(31, Math.max(1, Number(e.target.value))))}
                      className="w-24 border border-border bg-background rounded p-2 text-foreground"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase mb-1">Dias da semana</label>
                    <div className="flex gap-1.5">
                      {DIAS_SEMANA.map(d => (
                        <button
                          key={d.idx} type="button" onClick={() => toggleDia(d.idx)}
                          className={`px-2 py-1 rounded text-xs font-bold transition-colors ${diasRecorrencia.includes(d.idx) ? 'bg-indigo-600 text-white' : 'bg-background border border-border text-text-muted'}`}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              )}

              {itensAtivos.has('data') && (
                <div className="bg-background border border-border rounded p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-bold text-text-muted uppercase">📅 Data e Hora</label>
                    <button type="button" onClick={() => removerItem('data')} className="text-text-muted hover:text-red-500 text-xs">✕</button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="date" value={dtVencimento} onChange={e => setDtVencimento(e.target.value)} className="w-full border border-border bg-background rounded p-2 text-foreground scheme-dark" />
                    <input type="time" value={horaVencimento} onChange={e => setHoraVencimento(e.target.value)} className="w-full border border-border bg-background rounded p-2 text-foreground scheme-dark" />
                  </div>
                </div>
              )}

              {itensAtivos.has('responsavel') && (
                <div className="bg-background border border-border rounded p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-bold text-text-muted uppercase">👤 Responsável</label>
                    <button type="button" onClick={() => removerItem('responsavel')} className="text-text-muted hover:text-red-500 text-xs">✕</button>
                  </div>
                  <select value={usuarioId} onChange={e => setUsuarioId(e.target.value)} className="w-full border border-border bg-background rounded p-2 text-foreground">
                    <option value="">Selecione...</option>
                    {usuarios.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
                  </select>
                </div>
              )}

              {itensAtivos.has('prioridade') && (
                <div className="bg-background border border-border rounded p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-bold text-text-muted uppercase">🎯 Prioridade e Dificuldade</label>
                    <button type="button" onClick={() => removerItem('prioridade')} className="text-text-muted hover:text-red-500 text-xs">✕</button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <select value={prioridadeId} onChange={e => setPrioridadeId(e.target.value)} className="w-full border border-border bg-background rounded p-2 text-foreground">
                      <option value="1">Baixa</option>
                      <option value="2">Média</option>
                      <option value="3">Alta</option>
                    </select>
                    <select value={dificuldadeId} onChange={e => setDificuldadeId(e.target.value)} className="w-full border border-border bg-background rounded p-2 text-foreground">
                      <option value="1">Muito Fácil</option>
                      <option value="2">Fácil</option>
                      <option value="3">Média</option>
                      <option value="4">Difícil</option>
                      <option value="5">Muito Difícil</option>
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

              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-text-muted">Cancelar</button>
                <button type="submit" disabled={isSaving} className="bg-indigo-600 text-white px-4 py-2 rounded disabled:opacity-50">
                  {isSaving ? 'Salvando...' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
