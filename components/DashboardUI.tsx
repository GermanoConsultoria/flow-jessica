'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts'
import { 
  LayoutDashboard, Users, AlertTriangle, History, Filter, 
  BarChart3, LineChart as IconLine, PieChart as IconPie, CheckCircle2, 
  Clock
} from 'lucide-react'

const COLOR_CONCLUIDA = '#10b981' 
const COLOR_PENDENTE = '#6366f1'  
const COLOR_ATRASADA = '#ef4444'  

const COLORS_PROJETOS = [
    '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
    '#ec4899', '#06b6d4', '#84cc16', '#14b8a6', '#f43f5e',
    '#22c55e', '#eab308', '#d946ef', '#3b82f6', '#f97316'
]

interface DadosProjeto {
  nome: string
  total: number
  concluidas: number
  pendentes: number
  atrasadas: number
}

interface DadosUsuario {
  id?: string | null
  nome: string
  concluidas: number
  pendentes: number
  atrasadas: number
  total?: number
}

interface DadosEtapa {
  name: string
  qtd: number
}

interface DadosHistorico {
  projeto: string
  qtd: number
}

interface ResumoGeral {
  total: number
  concluidas: number
  atrasadas: number
  pendentes: number
  taxaConclusao: number
  taxaAtraso: number
  taxaPendente: number
}

interface DashboardUIProps {
  equipeId: string
  dadosProjetos: DadosProjeto[]
  dadosUsuarios: DadosUsuario[]
  dadosEtapas: DadosEtapa[]
  dadosHistorico: DadosHistorico[]
  resumoGeral: ResumoGeral
  listaProjetos: { id: string; nome: string }[]
  listaUsuarios: { id: string; nome: string }[]
}

interface BarConfig {
  key: string
  name: string
  color: string
}

interface GraficoUniversalProps {
  type: 'BAR' | 'LINE' | 'PIE'
  data: Record<string, unknown>[]
  xKey: string
  bars: BarConfig[]
}

export default function DashboardUI({ 
    equipeId, dadosProjetos, dadosUsuarios, dadosEtapas, dadosHistorico, resumoGeral,
    listaProjetos, listaUsuarios 
}: DashboardUIProps) {
  
  const [abaAtiva, setAbaAtiva] = useState<'TAREFAS' | 'PROJETOS' | 'SPRINT'>('TAREFAS')
  
  const [relatorioTarefas, setRelatorioTarefas] = useState('PRODUTIVIDADE')
  const [tipoGraficoTarefas, setTipoGraficoTarefas] = useState<'BAR' | 'LINE' | 'PIE'>('BAR')

  const [relatorioProjetos, setRelatorioProjetos] = useState('STATUS_GERAL')
  const [tipoGraficoProjetos, setTipoGraficoProjetos] = useState<'BAR' | 'LINE' | 'PIE'>('BAR')

  const router = useRouter()
  const searchParams = useSearchParams()

  const getValorInicial = (chave: string) => {
      const valorUrl = searchParams.get(chave)
      if (valorUrl) return valorUrl
      const hoje = new Date()
      if (chave === 'inicio') return new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0]
      if (chave === 'fim') return new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().split('T')[0]
      return ''
  }

  const [filtros, setFiltros] = useState({
      inicio: getValorInicial('inicio'),
      fim: getValorInicial('fim'),
      projetoId: searchParams.get('projetoId') || '',
      usuarioId: searchParams.get('usuarioId') || ''
  })

  useEffect(() => {
      setFiltros({
          inicio: getValorInicial('inicio'),
          fim: getValorInicial('fim'),
          projetoId: searchParams.get('projetoId') || '',
          usuarioId: searchParams.get('usuarioId') || ''
      })
  }, [searchParams])

  const aplicarFiltro = () => {
      const params = new URLSearchParams()
      if (filtros.inicio) params.set('inicio', filtros.inicio)
      if (filtros.fim) params.set('fim', filtros.fim)
      if (filtros.projetoId) params.set('projetoId', filtros.projetoId)
      if (filtros.usuarioId) params.set('usuarioId', filtros.usuarioId)
      router.push(`/equipe/${equipeId}/dashboards?${params.toString()}`)
      router.refresh()
  }

  return (
    <div className="space-y-6">
      {/* BARRA DE FILTROS */}
      <div className="bg-surface border border-border rounded-xl p-4 flex flex-wrap gap-4 items-end shadow-sm">
          <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Início</label>
              <input type="date" value={filtros.inicio} onChange={e => setFiltros(prev => ({ ...prev, inicio: e.target.value }))} className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-indigo-500 scheme-dark"/>
          </div>
          <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fim</label>
              <input type="date" value={filtros.fim} onChange={e => setFiltros(prev => ({ ...prev, fim: e.target.value }))} className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-indigo-500 scheme-dark"/>
          </div>
          <div className="min-w-[150px]">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Projeto</label>
              <select value={filtros.projetoId} onChange={e => setFiltros(prev => ({ ...prev, projetoId: e.target.value }))} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">Todos os Projetos</option>
                  {listaProjetos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
          </div>
          <div className="min-w-[150px]">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Usuário</label>
              <select value={filtros.usuarioId} onChange={e => setFiltros(prev => ({ ...prev, usuarioId: e.target.value }))} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">Todos os Usuários</option>
                  {listaUsuarios.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
              </select>
          </div>
          <button onClick={aplicarFiltro} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors h-[38px]">
              <Filter size={16} /> Filtrar
          </button>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <CardKPI titulo="Total Tarefas" valor={resumoGeral.total} icon={<LayoutDashboard size={20}/>} cor="indigo" />
          <CardKPI titulo="Concluídas" valor={resumoGeral.concluidas} sub={`${resumoGeral.taxaConclusao}%`} icon={<Users size={20}/>} cor="emerald" />
          <CardKPI titulo="Atrasadas" valor={resumoGeral.atrasadas} sub={`${resumoGeral.taxaAtraso}%`} icon={<AlertTriangle size={20}/>} cor="red" />
          <CardKPI titulo="Pendentes" valor={resumoGeral.pendentes} sub={`${resumoGeral.taxaPendente}%`} icon={<Clock size={20}/>} cor="indigo" />
          <CardKPI titulo="Alterações" valor={dadosHistorico.reduce((acc, curr) => acc + curr.qtd, 0)} icon={<History size={20}/>} cor="amber" />
      </div>

      {/* RESUMO POR USUÁRIO */}
      {dadosUsuarios.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-text-muted uppercase tracking-wider">Resumo por Usuário</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {dadosUsuarios.map(u => {
              const total = u.total ?? (u.concluidas + u.atrasadas + (u.pendentes ?? 0))
              const taxa = total > 0 ? Math.round((u.concluidas / total) * 100) : 0
              const isAtivo = filtros.usuarioId === u.id
              return (
                <button
                  key={u.id ?? u.nome}
                  onClick={() => {
                    if (!u.id) return
                    const params = new URLSearchParams()
                    if (filtros.inicio) params.set('inicio', filtros.inicio)
                    if (filtros.fim) params.set('fim', filtros.fim)
                    if (filtros.projetoId) params.set('projetoId', filtros.projetoId)
                    if (isAtivo) {
                      params.delete('usuarioId')
                    } else {
                      params.set('usuarioId', u.id)
                    }
                    router.push(`/equipe/${equipeId}/dashboards?${params.toString()}`)
                    router.refresh()
                  }}
                  className={`text-left p-4 rounded-xl border transition-all ${isAtivo ? 'border-indigo-500 bg-indigo-500/10 shadow-sm' : 'border-border bg-surface hover:border-indigo-400/50 hover:bg-surface-highlight/30'}`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isAtivo ? 'bg-indigo-600 text-white' : 'bg-indigo-500/20 text-indigo-400'}`}>
                      {u.nome.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="text-sm font-bold text-foreground truncate leading-tight" title={u.nome}>{u.nome}</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-text-muted">{u.concluidas} concluídas</span>
                      <span className="font-bold text-emerald-500">{taxa}%</span>
                    </div>
                    <div className="w-full bg-surface-highlight rounded-full h-1.5">
                      <div className="bg-emerald-500 h-1.5 rounded-full transition-all" style={{ width: `${taxa}%` }} />
                    </div>
                    {u.atrasadas > 0 && (
                      <p className="text-[11px] text-red-500 font-medium">{u.atrasadas} atrasada{u.atrasadas > 1 ? 's' : ''}</p>
                    )}
                    <p className="text-[10px] text-text-muted">{total} no período</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ABAS */}
      <div className="border-b border-gray-200 mt-6 overflow-x-auto">
        <nav className="-mb-px flex space-x-8 whitespace-nowrap">
          <TabButton active={abaAtiva === 'TAREFAS'} onClick={() => setAbaAtiva('TAREFAS')} label="Tarefas & Equipe" />
          <TabButton active={abaAtiva === 'PROJETOS'} onClick={() => setAbaAtiva('PROJETOS')} label="Projetos & Etapas" />
          <TabButton active={abaAtiva === 'SPRINT'} onClick={() => setAbaAtiva('SPRINT')} label="Sprint" />
        </nav>
      </div>

      {/* CONTEÚDO */}
      <div className="min-h-[500px] pt-6 animate-in fade-in">
          
          {/* ABA TAREFAS */}
          {abaAtiva === 'TAREFAS' && (
             <div className="flex flex-col gap-4">
                <div className="flex flex-wrap justify-between items-center gap-4 bg-surface-highlight/10 p-4 rounded-xl border border-border">
                    <select value={relatorioTarefas} onChange={e => setRelatorioTarefas(e.target.value)} className="bg-surface border border-border rounded-lg px-3 py-2 text-sm font-bold text-foreground outline-none focus:border-indigo-500 min-w-[250px]">
                        <option value="PRODUTIVIDADE">Tarefas Concluidas por Usuário</option>
                        <option value="ATRASOS">Tarefas Atrasadas por Usuário</option>
                    </select>
                    <TypeSelector active={tipoGraficoTarefas} onChange={setTipoGraficoTarefas} />
                </div>

                <div className="bg-surface border border-border rounded-xl p-6 shadow-sm min-h-[450px]">
                    {relatorioTarefas === 'PRODUTIVIDADE' && (
                        <GraficoUniversal 
                            type={tipoGraficoTarefas} 
                            data={dadosUsuarios as unknown as Record<string, unknown>[]} 
                            xKey="nome" 
                            bars={[{ key: 'concluidas', name: 'Entregues', color: COLOR_CONCLUIDA }]} 
                        />
                    )}
                    {relatorioTarefas === 'ATRASOS' && (
                        <GraficoUniversal 
                            type={tipoGraficoTarefas} 
                            data={[...dadosUsuarios].sort((a,b) => b.atrasadas - a.atrasadas) as unknown as Record<string, unknown>[]}
                            xKey="nome" 
                            bars={[{ key: 'atrasadas', name: 'Atrasos', color: COLOR_ATRASADA }]} 
                        />
                    )}
                </div>
             </div>
          )}

          {/* ABA PROJETOS */}
          {abaAtiva === 'PROJETOS' && (
              <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap justify-between items-center gap-4 bg-surface-highlight/10 p-4 rounded-xl border border-border">
                    <select value={relatorioProjetos} onChange={e => setRelatorioProjetos(e.target.value)} className="bg-surface border border-border rounded-lg px-3 py-2 text-sm font-bold text-foreground outline-none focus:border-indigo-500 min-w-[250px]">
                        <option value="STATUS_GERAL">Status Geral (Total)</option>
                        <option value="ETAPAS">Volume por Etapa</option>
                        <option value="VOLATILIDADE">Reagendamentos</option>
                    </select>
                    <TypeSelector active={tipoGraficoProjetos} onChange={setTipoGraficoProjetos} />
                </div>

                <div className="bg-surface border border-border rounded-xl p-6 shadow-sm min-h-[450px]">
                    {relatorioProjetos === 'STATUS_GERAL' && (
                         <GraficoUniversal 
                            type={tipoGraficoProjetos}
                            data={dadosProjetos as unknown as Record<string, unknown>[]}
                            xKey="nome"
                            bars={tipoGraficoProjetos === 'PIE'
                                ? [{ key: 'total', name: 'Total de Tarefas', color: '#888' }]
                                : [
                                    { key: 'concluidas', name: 'Concluídas', color: COLOR_CONCLUIDA },
                                    { key: 'pendentes', name: 'Abertas', color: COLOR_PENDENTE },
                                    { key: 'atrasadas', name: 'Atrasadas', color: COLOR_ATRASADA }
                                ]
                            }
                         />
                    )}
                    {relatorioProjetos === 'ETAPAS' && (
                        <GraficoUniversal type={tipoGraficoProjetos} data={dadosEtapas as unknown as Record<string, unknown>[]} xKey="name" bars={[{ key: 'qtd', name: 'Volume', color: COLORS_PROJETOS[0] }]} />
                    )}
                    {relatorioProjetos === 'VOLATILIDADE' && (
                        <GraficoUniversal type={tipoGraficoProjetos} data={dadosHistorico as unknown as Record<string, unknown>[]} xKey="projeto" bars={[{ key: 'qtd', name: 'Alterações', color: COLORS_PROJETOS[1] }]} />
                    )}
                </div>
              </div>
          )}

          {/* ABA SPRINT */}
          {abaAtiva === 'SPRINT' && (
              <div className="flex flex-col items-center justify-center py-12 text-center bg-surface border border-border rounded-xl border-dashed">
                  <div className="bg-indigo-50 p-4 rounded-full mb-4"><History className="w-8 h-8 text-indigo-500" /></div>
                  <h3 className="text-lg font-bold text-foreground">Relatório de Sprint</h3>
                  <p className="text-gray-500 max-w-md">Em breve.</p>
              </div>
          )}
      </div>
    </div>
  )
}

function GraficoUniversal({ type, data, xKey, bars }: GraficoUniversalProps) {

    const dadosLimpos = data?.filter((item) => {
        const totalItem = bars.reduce((acc: number, b) => acc + ((item[b.key] as number) || 0), 0)
        return totalItem > 0
    }) || []

    if (dadosLimpos.length === 0) {
        return (
            <div className="h-full min-h-[350px] flex flex-col items-center justify-center text-gray-400 animate-in fade-in">
                <div className="bg-gray-100 p-4 rounded-full mb-3 dark:bg-gray-800"><CheckCircle2 size={40} className="text-gray-400" /></div>
                <p className="font-medium text-lg">Sem dados relevantes</p>
                <p className="text-sm">Nenhum registro encontrado com valor maior que zero.</p>
            </div>
        )
    }

    const barrasAtivas = bars.filter((b) => {
        if (type === 'PIE') return true
        const somaTotalMetrica = dadosLimpos.reduce((acc: number, item) => acc + ((item[b.key] as number) || 0), 0)
        return somaTotalMetrica > 0
    })

    if (type === 'BAR') {
        return (
            <ResponsiveContainer width="100%" height={400}>
                <BarChart data={dadosLimpos} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey={xKey} fontSize={11} interval={0} textAnchor="end" height={60} tick={{fill: 'var(--color-foreground)', fontSize: 12, fontWeight: 600}}/>
                    <YAxis />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend />
                    {barrasAtivas.map((b) => (
                        <Bar key={b.key} dataKey={b.key} name={b.name} fill={b.color} radius={[4,4,0,0]} />
                    ))}
                </BarChart>
            </ResponsiveContainer>
        )
    }

    if (type === 'LINE') {
        return (
            <ResponsiveContainer width="100%" height={400}>
                <LineChart data={dadosLimpos} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey={xKey} fontSize={11} interval={0} textAnchor="end" height={60} tick={{fill: 'var(--color-foreground)', fontSize: 12, fontWeight: 600}}/>
                    <YAxis />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
                    <Legend />
                    {barrasAtivas.map((b) => (
                        <Line key={b.key} type="monotone" dataKey={b.key} name={b.name} stroke={b.color} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        )
    }

    if (type === 'PIE') {
        const metricaPrincipal = barrasAtivas[0];

        return (
            <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                    <Pie
                        data={dadosLimpos}
                        cx="50%" cy="50%"
                        innerRadius={80}
                        outerRadius={140}
                        paddingAngle={5}
                        dataKey={metricaPrincipal.key} 
                        nameKey={xKey === 'name' ? 'name' : xKey}
                        label={false}
                    >
                        {dadosLimpos.map((_entry, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS_PROJETOS[index % COLORS_PROJETOS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend /> 
                </PieChart>
            </ResponsiveContainer>
        )
    }

    return null
}

interface TypeSelectorProps {
  active: 'BAR' | 'LINE' | 'PIE'
  onChange: (t: 'BAR' | 'LINE' | 'PIE') => void
}

function TypeSelector({ active, onChange }: TypeSelectorProps) {
    return (
        <div className="flex bg-surface border border-border rounded-lg p-1 gap-1">
            <button onClick={() => onChange('BAR')} title="Gráfico de Barras" className={`p-2 rounded-md transition-colors ${active === 'BAR' ? 'bg-indigo-100 text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-foreground'}`}><BarChart3 size={18} /></button>
            <button onClick={() => onChange('LINE')} title="Gráfico de Linhas" className={`p-2 rounded-md transition-colors ${active === 'LINE' ? 'bg-indigo-100 text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-foreground'}`}><IconLine size={18} /></button>
            <button onClick={() => onChange('PIE')} title="Gráfico de Pizza" className={`p-2 rounded-md transition-colors ${active === 'PIE' ? 'bg-indigo-100 text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-foreground'}`}><IconPie size={18} /></button>
        </div>
    )
}

type CorKPI = 'indigo' | 'emerald' | 'red' | 'amber'

interface CardKPIProps {
  titulo: string
  valor: number
  sub?: string
  icon: React.ReactNode
  cor: CorKPI
}

function CardKPI({ titulo, valor, sub, icon, cor }: CardKPIProps) {
    const cores: Record<CorKPI, string> = { indigo: 'bg-indigo-50 text-indigo-600', emerald: 'bg-emerald-50 text-emerald-600', red: 'bg-red-50 text-red-600', amber: 'bg-amber-50 text-amber-600' }
    return (
        <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-xs font-bold text-text-muted uppercase tracking-wider">{titulo}</p>
                    <h3 className="text-2xl font-bold text-foreground mt-1">{valor}</h3>
                    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
                </div>
                <div className={`p-2 rounded-lg ${cores[cor]}`}>{icon}</div>
            </div>
        </div>
    )
}

interface TabButtonProps {
  active: boolean
  onClick: () => void
  label: string
}

function TabButton({ active, onClick, label }: TabButtonProps) {
    return (
        <button onClick={onClick} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${active ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {label}
        </button>
    )
}