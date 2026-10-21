'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import { Bell, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { getNotificacoes, getContadorNotificacoes, marcarComoLida, marcarComoNaoLida, marcarTodasComoLidas, getTarefaCompleta } from '@/app/actions'
import ModalTarefa from './ModalTarefa'
import type { NotificacaoComRelacoes, TarefaComRelacoes, UsuarioBasico, ProjetoComColunas } from '@/types'

interface Props {
  usuarioId: string
  usuarios: UsuarioBasico[]
  projetos: ProjetoComColunas[]
}

export default function SinoNotificacoes({ usuarioId, usuarios, projetos }: Props) {
  const [aberto, setAberto] = useState(false)
  const [naoLidas, setNaoLidas] = useState<NotificacaoComRelacoes[]>([])
  const [lidas, setLidas] = useState<NotificacaoComRelacoes[]>([])
  const [contador, setContador] = useState(0)
  const [carregado, setCarregado] = useState(false)
  const [tarefaAberta, setTarefaAberta] = useState<TarefaComRelacoes | null>(null)
  const [buscandoTarefa, setBuscandoTarefa] = useState(false)
  const [, startTransition] = useTransition()
  const ref = useRef<HTMLDivElement>(null)

  async function carregar() {
    const dados = await getNotificacoes()
    setNaoLidas(dados.naoLidas as NotificacaoComRelacoes[])
    setLidas(dados.lidas as NotificacaoComRelacoes[])
    setContador(dados.naoLidas.length)
    setCarregado(true)
  }

  async function atualizarContador() {
    if (document.visibilityState !== 'visible') return
    const total = await getContadorNotificacoes()
    setContador(total)
  }

  useEffect(() => {
    atualizarContador()
    const interval = setInterval(atualizarContador, 120000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    function fechar(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false)
    }
    document.addEventListener('mousedown', fechar)
    return () => document.removeEventListener('mousedown', fechar)
  }, [])

  async function handleAbrir(n: NotificacaoComRelacoes) {
    if (!n.lida) {
      setNaoLidas(prev => prev.filter(x => x.id !== n.id))
      setLidas(prev => [{ ...n, lida: true }, ...prev])
      startTransition(async () => { await marcarComoLida(n.id) })
    }
    setAberto(false)
    // Busca a tarefa sob demanda (evita carregar TODOS os projetos/tarefas no layout)
    if (n.tarefa_id) {
      setBuscandoTarefa(true)
      const tarefa = await getTarefaCompleta(n.tarefa_id)
      if (tarefa) setTarefaAberta(tarefa as unknown as TarefaComRelacoes)
      setBuscandoTarefa(false)
    }
  }

  function handleMarcarNaoLida(e: React.MouseEvent, n: NotificacaoComRelacoes) {
    e.stopPropagation()
    setLidas(prev => prev.filter(x => x.id !== n.id))
    setNaoLidas(prev => [{ ...n, lida: false }, ...prev])
    startTransition(async () => { await marcarComoNaoLida(n.id) })
  }

  function handleMarcarTodas() {
    setLidas(prev => [...naoLidas.map(n => ({ ...n, lida: true })), ...prev])
    setNaoLidas([])
    startTransition(async () => { await marcarTodasComoLidas() })
  }

  const todas = [
    ...naoLidas,
    ...lidas,
  ]

  function formatarTempo(dt: Date | string) {
    const diff = Date.now() - new Date(dt).getTime()
    const min = Math.floor(diff / 60000)
    if (min < 1) return 'agora'
    if (min < 60) return `${min}min`
    const h = Math.floor(min / 60)
    if (h < 24) return `${h}h`
    return `${Math.floor(h / 24)}d`
  }

  return (
    <>
      <div ref={ref} className="relative">
        <button
          onClick={() => { setAberto(v => !v); carregar() }}
          className="relative p-2 rounded-lg hover:bg-surface-highlight/50 text-gray-400 hover:text-foreground transition-colors"
        >
          <Bell size={18} />
          {contador > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
              {contador > 99 ? '99+' : contador}
            </span>
          )}
        </button>

        {aberto && (
          <div className="absolute top-full right-0 mt-2 w-80 bg-surface border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <span className="text-sm font-bold text-foreground">Notificações</span>
              <div className="flex items-center gap-2">
                {naoLidas.length > 0 && (
                  <button onClick={handleMarcarTodas} className="text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors">
                    Marcar todas como lidas
                  </button>
                )}
              </div>
            </div>

            {/* Lista */}
            <div className="max-h-[420px] overflow-y-auto custom-scrollbar-dark">
              {todas.length === 0 ? (
                <div className="py-10 text-center text-sm text-gray-500">Nenhuma notificação</div>
              ) : (
                <>
                  {naoLidas.length > 0 && (
                    <div className="px-3 pt-2 pb-1">
                      <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider">Não lidas</p>
                    </div>
                  )}
                  {naoLidas.map(n => (
                    <ItemNotificacao key={n.id} n={n} onClicar={handleAbrir} onMarcarNaoLida={handleMarcarNaoLida} formatarTempo={formatarTempo} />
                  ))}
                  {lidas.length > 0 && (
                    <div className="px-3 pt-2 pb-1">
                      <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Lidas</p>
                    </div>
                  )}
                  {lidas.map(n => (
                    <ItemNotificacao key={n.id} n={n} onClicar={handleAbrir} onMarcarNaoLida={handleMarcarNaoLida} formatarTempo={formatarTempo} />
                  ))}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-border px-4 py-2.5">
              <Link href="/notificacoes" onClick={() => setAberto(false)} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                Ver todas as notificações →
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Loading ao buscar tarefa */}
      {buscandoTarefa && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/30">
          <div className="bg-surface rounded-xl p-4 shadow-xl border border-border">
            <Loader2 className="animate-spin text-indigo-400" size={28} />
          </div>
        </div>
      )}

      {/* Modal da tarefa ao clicar na notificação */}
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
    </>
  )
}

function ItemNotificacao({
  n,
  onClicar,
  onMarcarNaoLida,
  formatarTempo,
}: {
  n: NotificacaoComRelacoes
  onClicar: (n: NotificacaoComRelacoes) => void
  onMarcarNaoLida: (e: React.MouseEvent, n: NotificacaoComRelacoes) => void
  formatarTempo: (dt: Date | string) => string
}) {
  return (
    <div
      onClick={() => onClicar(n)}
      className={`w-full flex items-start gap-3 px-3 py-2.5 text-left transition-colors hover:bg-surface-highlight group cursor-pointer ${!n.lida ? 'bg-indigo-500/5' : ''}`}
    >
      <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center text-[10px] font-bold text-indigo-400 shrink-0 mt-0.5">
        {n.remetente.nome.substring(0, 2).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-foreground leading-snug">
          {n.mensagem}
        </p>
        <p className="text-[10px] text-indigo-400 font-medium truncate mt-0.5">{n.tarefa.titulo}</p>
        {n.tarefa.projeto && (
          <p className="text-[10px] text-gray-500 truncate">{n.tarefa.projeto.nome}</p>
        )}
        <p className="text-[10px] text-gray-500 mt-0.5">{formatarTempo(n.dt_insert)}</p>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        {!n.lida && <span className="w-2 h-2 rounded-full bg-indigo-500 mt-1" />}
        {n.lida && (
          <button
            onClick={e => onMarcarNaoLida(e, n)}
            title="Marcar como não lida"
            className="opacity-0 group-hover:opacity-100 text-[9px] text-gray-500 hover:text-indigo-400 transition-all"
          >
            ↩
          </button>
        )}
      </div>
    </div>
  )
}
