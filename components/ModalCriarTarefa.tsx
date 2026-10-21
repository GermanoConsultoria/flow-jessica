'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { criarTarefa } from '@/app/actions'
import type { ColunaBasica, UsuarioBasico } from '@/types'
import type { Recorrencia } from '@prisma/client'

interface Props {
  projetoId: string
  colunas: ColunaBasica[]
  usuarios: UsuarioBasico[]
}

export default function ModalCriarTarefa({ projetoId, colunas, usuarios }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Estados locais
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [dtVencimento, setDtVencimento] = useState('')
  const [horaVencimento, setHoraVencimento] = useState('')
  const [colunaId, setColunaId] = useState(colunas.length > 0 ? colunas[0].id : '')
  const [prioridadeId, setPrioridadeId] = useState('2') 
  const [dificuldadeId, setDificuldadeId] = useState('3') 
  const [usuarioId, setUsuarioId] = useState('')
  
  const [recorrencia, setRecorrencia] = useState<Recorrencia>('NAO')
  const [diasRecorrencia, setDiasRecorrencia] = useState<number[]>([0,1,2,3,4,5,6])
  const [diaMesRecorrencia, setDiaMesRecorrencia] = useState<number>(1)
  const [formato, setFormato] = useState('')
  const [selecionar, setSelecionar] = useState('')

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if(!titulo || !usuarioId) return;

    setIsSaving(true)

    let dataIso = null
    if (dtVencimento) {
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
        usuario_id: usuarioId,
        recorrencia,
        dias_recorrencia: recorrencia !== 'NAO' && recorrencia !== 'MENSALMENTE' && diasRecorrencia.length > 0
          ? diasRecorrencia.sort((a, b) => a - b).join(',')
          : null,
        dia_mes_recorrencia: recorrencia === 'MENSALMENTE' ? diaMesRecorrencia : null,
        formato: formato || null,
        selecionar: selecionar || null,
    })

    setIsSaving(false)
    if (!resultado.success) {
      toast.error(resultado.error)
      return
    }
    setIsOpen(false)
    
    // Limpa form
    setTitulo('')
    setDescricao('')
    setDtVencimento('')
    setHoraVencimento('')
    setRecorrencia('NAO')
    setDiasRecorrencia([0,1,2,3,4,5,6])
    setDiaMesRecorrencia(1)
    setFormato('')
    setSelecionar('')
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

          <div className="relative bg-surface sm:rounded-xl rounded-t-2xl shadow-2xl w-full sm:max-w-lg flex flex-col max-h-[92vh] sm:max-h-[90vh] animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 border border-border border-b-0 sm:border-b">
            {/* drag handle mobile */}
            <div className="sm:hidden flex justify-center pt-3 pb-0 shrink-0">
              <div className="w-10 h-1 bg-border rounded-full" />
            </div>

            <div className="px-6 py-4 border-b border-border bg-surface-highlight/20 flex justify-between items-center shrink-0">
              <h2 className="text-lg font-bold text-foreground">Criar Nova Tarefa</h2>
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
                  value={descricao} onChange={e => setDescricao(e.target.value)}
                  rows={3}
                  className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-indigo-500 outline-none placeholder-text-muted resize-none"
                  placeholder="Detalhes da tarefa..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* DATA */}
                <div>
                   <label className="block text-xs font-semibold text-text-muted uppercase mb-1">Vencimento</label>
                   <input
                      type="date"
                      value={dtVencimento} onChange={e => setDtVencimento(e.target.value)}
                      required
                      className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-indigo-500 outline-none scheme-dark"
                   />
                </div>

                {/* HORA */}
                <div>
                   <label className="block text-xs font-semibold text-text-muted uppercase mb-1">Hora <span className="normal-case font-normal">(opcional)</span></label>
                   <div className="flex items-center gap-1">
                     <select
                       value={horaVencimento ? horaVencimento.split(':')[0] : ''}
                       onChange={e => {
                         const h = e.target.value
                         const m = horaVencimento ? (horaVencimento.split(':')[1] || '00') : '00'
                         setHoraVencimento(h ? `${h}:${m}` : '')
                       }}
                       className="flex-1 bg-surface border border-border rounded-lg px-2 py-2 text-foreground focus:ring-2 focus:ring-indigo-500 outline-none"
                     >
                       <option value="">--</option>
                       {Array.from({length: 24}, (_, i) => String(i).padStart(2, '0')).map(h => (
                         <option key={h} value={h}>{h}</option>
                       ))}
                     </select>
                     <span className="text-text-muted font-bold self-center">:</span>
                     <select
                       value={horaVencimento ? (horaVencimento.split(':')[1] || '00') : ''}
                       onChange={e => {
                         const h = horaVencimento ? horaVencimento.split(':')[0] : '00'
                         setHoraVencimento(h ? `${h}:${e.target.value}` : '')
                       }}
                       disabled={!horaVencimento}
                       className="flex-1 bg-surface border border-border rounded-lg px-2 py-2 text-foreground focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-40"
                     >
                       {['00','05','10','15','20','25','30','35','40','45','50','55'].map(m => (
                         <option key={m} value={m}>{m}</option>
                       ))}
                     </select>
                   </div>
                </div>
              </div>

              {/* COLUNA INICIAL */}
              <div>
                 <label className="block text-xs font-semibold text-text-muted uppercase mb-1">Etapa Inicial</label>
                 <select value={colunaId} onChange={e => setColunaId(e.target.value)} className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-indigo-500 outline-none">
                    {colunas.map(c => (
                      <option key={c.id} value={c.id}>{c.nome}</option>
                    ))}
                 </select>
              </div>

              {/* --- NOVA LINHA: PRIORIDADE E RECORRÊNCIA --- */}
              <div className="grid grid-cols-2 xs:grid-cols-2 gap-3 sm:gap-4">
                 {/* PRIORIDADE */}
                 <div>
                   <label className="block text-xs font-semibold text-text-muted uppercase mb-1">Prioridade</label>
                   <select 
                      value={prioridadeId} onChange={e => setPrioridadeId(e.target.value)}
                      className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-indigo-500 outline-none"
                   >
                      <option value="1">1 - Baixa</option>
                      <option value="2">2 - Média</option>
                      <option value="3">3 - Alta</option>
                   </select>
                </div>

                {/* RECORRÊNCIA (NOVO) */}
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

              {/* DIFICULDADE E RESPONSÁVEL */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-muted uppercase mb-1">Dificuldade</label>
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
                  
                  <div>
                    <label className="block text-xs font-semibold text-text-muted uppercase mb-1">Responsável</label>
                    <select value={usuarioId} onChange={e => setUsuarioId(e.target.value)} required className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-indigo-500 outline-none">
                        <option value="">Selecione...</option>
                        {usuarios.map(u => (
                        <option key={u.id} value={u.id}>{u.nome}</option>
                        ))}
                    </select>
                  </div>
              </div>

              {/* FORMATO E SELECIONAR */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase mb-1">Formato <span className="normal-case font-normal">(opcional)</span></label>
                  <select value={formato} onChange={e => setFormato(e.target.value)} className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option value="">Nenhum</option>
                    <option value="REELS">Reels</option>
                    <option value="CARROSSEL">Carrossel</option>
                    <option value="ÚNICO">Único</option>
                    <option value="STORIES">Stories</option>
                    <option value="FOTO">Foto</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase mb-1">Funil <span className="normal-case font-normal">(opcional)</span></label>
                  <select value={selecionar} onChange={e => setSelecionar(e.target.value)} className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option value="">Nenhum</option>
                    <option value="TOPO">Topo</option>
                    <option value="MEIO">Meio</option>
                    <option value="FUNDO">Fundo</option>
                  </select>
                </div>
              </div>

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