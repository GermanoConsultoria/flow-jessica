'use client'

import { useState, useTransition } from 'react'
import { Bell, MailOpen, Mail } from 'lucide-react'
import { marcarComoLida, marcarComoNaoLida, marcarTodasComoLidas } from '@/app/actions'
import ModalTarefa from '@/components/ModalTarefa'
import type { NotificacaoComRelacoes, TarefaComRelacoes, UsuarioBasico, ProjetoComColunas } from '@/types'

interface Props {
  notificacoes: NotificacaoComRelacoes[]
  usuarioId: string
  usuarios: UsuarioBasico[]
  projetos: ProjetoComColunas[]
}

export default function NotificacoesView({ notificacoes: inicial, usuarioId, usuarios, projetos }: Props) {
  const [lista, setLista] = useState(inicial)
  const [filtro, setFiltro] = useState<'todas' | 'nao_lidas' | 'lidas'>('todas')
  const [tarefaAberta, setTarefaAberta] = useState<TarefaComRelacoes | null>(null)
  const [, startTransition] = useTransition()

  const listafiltrada = lista.filter(n => {
    if (filtro === 'nao_lidas') return !n.lida
    if (filtro === 'lidas') return n.lida
    return true
  })

  const naoLidasCount = lista.filter(n => !n.lida).length

  function handleClicar(n: NotificacaoComRelacoes) {
    if (!n.lida) {
      setLista(prev => prev.map(x => x.id === n.id ? { ...x, lida: true } : x))
      startTransition(async () => { await marcarComoLida(n.id) })
    }
    const tarefa = projetos.flatMap(p => (p as ProjetoComColunas & { tarefas?: TarefaComRelacoes[] }).tarefas ?? []).find(t => t.id === n.tarefa_id)
    if (tarefa) setTarefaAberta(tarefa)
  }

  function handleToggleLida(e: React.MouseEvent, n: NotificacaoComRelacoes) {
    e.stopPropagation()
    if (n.lida) {
      setLista(prev => prev.map(x => x.id === n.id ? { ...x, lida: false } : x))
      startTransition(async () => { await marcarComoNaoLida(n.id) })
    } else {
      setLista(prev => prev.map(x => x.id === n.id ? { ...x, lida: true } : x))
      startTransition(async () => { await marcarComoLida(n.id) })
    }
  }

  function handleMarcarTodas() {
    setLista(prev => prev.map(x => ({ ...x, lida: true })))
    startTransition(async () => { await marcarTodasComoLidas() })
  }

  function formatarTempo(dt: Date | string) {
    const diff = Date.now() - new Date(dt).getTime()
    const min = Math.floor(diff / 60000)
    if (min < 1) return 'agora mesmo'
    if (min < 60) return `há ${min} min`
    const h = Math.floor(min / 60)
    if (h < 24) return `há ${h}h`
    const d = Math.floor(h / 24)
    return `há ${d} dia${d > 1 ? 's' : ''}`
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell size={20} className="text-indigo-400" />
          <h1 className="text-xl font-bold text-foreground">Notificações</h1>
          {naoLidasCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{naoLidasCount}</span>
          )}
        </div>
        {naoLidasCount > 0 && (
          <button onClick={handleMarcarTodas} className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
            Marcar todas como lidas
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="flex gap-1 mb-4 bg-surface border border-border rounded-lg p-1 w-fit">
        {([
          { id: 'todas', label: 'Todas' },
          { id: 'nao_lidas', label: 'Não lidas' },
          { id: 'lidas', label: 'Lidas' },
        ] as const).map(f => (
          <button
            key={f.id}
            onClick={() => setFiltro(f.id)}
            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${filtro === f.id ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-foreground'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        {listafiltrada.length === 0 ? (
          <div className="py-16 text-center">
            <Bell size={32} className="text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Nenhuma notificação</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {listafiltrada.map(n => (
              <div
                key={n.id}
                onClick={() => handleClicar(n)}
                className={`flex items-start gap-4 px-5 py-4 cursor-pointer hover:bg-surface-highlight transition-colors group ${!n.lida ? 'bg-indigo-500/5' : ''}`}
              >
                <div className="w-9 h-9 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400 shrink-0">
                  {n.remetente.nome.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{n.mensagem}</p>
                  <p className="text-xs text-indigo-400 font-medium truncate mt-0.5">{n.tarefa.titulo}</p>
                  {n.tarefa.projeto && (
                    <p className="text-xs text-gray-500 truncate">{n.tarefa.projeto.nome}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">{formatarTempo(n.dt_insert)}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!n.lida && <span className="w-2 h-2 rounded-full bg-indigo-500" />}
                  <button
                    onClick={e => handleToggleLida(e, n)}
                    title={n.lida ? 'Marcar como não lida' : 'Marcar como lida'}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-surface-highlight transition-all text-gray-400 hover:text-indigo-400"
                  >
                    {n.lida ? <Mail size={14} /> : <MailOpen size={14} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {tarefaAberta && (
        <ModalTarefa
          tarefa={tarefaAberta}
          isOpen={true}
          onClose={() => setTarefaAberta(null)}
          usuarios={usuarios}
          projetos={projetos}
          usuarioLogadoId={usuarioId}
        />
      )}
    </div>
  )
}
