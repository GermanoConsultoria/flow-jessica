'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import SidebarRecentes from '@/components/SidebarRecentes'
import ModalCriarProjeto from '@/components/ModalCriarProjeto'
import EquipeTopbar from '@/components/EquipeTopbar'
import { signOut } from 'next-auth/react'
import { toast } from 'sonner'
import { Menu, ChevronDown, ChevronRight, Lock } from 'lucide-react'
import Link from 'next/link'
import type { Usuario, EquipeBasica, ProjetoRecente, UsuarioBasico, ProjetoComColunas } from '@/types'

interface AuthenticatedLayoutProps {
  children: React.ReactNode
  usuario: Usuario
  equipeAtual: EquipeBasica | null
  minhasEquipes: EquipeBasica[]
  projetosIniciais: ProjetoRecente[]
  usuarioLogadoId?: string
  usuariosDoWorkspace?: UsuarioBasico[]
  projetosParaSino?: ProjetoComColunas[]
}

export default function AuthenticatedLayout({ children, usuario, equipeAtual: equipeAtualProp, minhasEquipes, projetosIniciais, usuarioLogadoId, usuariosDoWorkspace, projetosParaSino }: AuthenticatedLayoutProps) {
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const equipeIdFromPath = pathname?.match(/\/equipe\/([^/]+)/)?.[1]
  const equipeAtual = equipeIdFromPath
    ? (minhasEquipes.find(e => e.id === equipeIdFromPath) ?? equipeAtualProp)
    : equipeAtualProp
  const [showModalProjeto, setShowModalProjeto] = useState(false)
  const abrirModalProjeto = () => {
    if (!equipeAtual?.id) {
      toast.error('Selecione uma equipe antes de criar um projeto.')
      return
    }
    setShowModalProjeto(true)
  }
  const [financeiroAberto, setFinanceiroAberto] = useState(pathname?.startsWith('/financeiro') ?? false)

  // Ignora o layout se for a tela de login
  if (pathname?.startsWith('/login')) {
      return <main className="min-h-screen bg-surface/50 flex flex-col justify-center">{children}</main>
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <ModalCriarProjeto isOpen={showModalProjeto} onClose={() => setShowModalProjeto(false)} equipeId={equipeAtual?.id ?? ''}/>

      {/* CHAMADA DA TOPBAR PASSANDO O BOTÃO COMO PROP */}
      <EquipeTopbar
        equipeAtual={equipeAtual}
        minhasEquipes={minhasEquipes || []}
        usuarioNome={usuario?.nome}
        usuarioLogadoId={usuarioLogadoId}
        usuariosDoWorkspace={usuariosDoWorkspace || []}
        projetosParaSino={projetosParaSino || []}
        botaoMenu={
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-md hover:bg-surface-highlight/50 text-gray-400 hover:text-foreground transition-all">
            <Menu size={20} />
          </button>
        }
      />

      <div className="relative flex flex-1 overflow-hidden">
         {/* BACKDROP MOBILE */}
         {isSidebarOpen && (
           <div
             className="fixed inset-0 bg-black/50 z-10 md:hidden"
             onClick={() => setIsSidebarOpen(false)}
           />
         )}

         {/* SIDEBAR */}
         <aside className={`
           fixed md:relative inset-y-0 left-0 h-full md:h-auto z-20
           bg-surface border-r border-border flex flex-col flex-shrink-0 transition-all duration-300
           ${isSidebarOpen
             ? 'w-64 translate-x-0'
             : 'w-64 -translate-x-full md:translate-x-0 md:w-[72px]'
           }
         `}>
            
            <div className="flex-1 flex flex-col overflow-hidden pt-4">
                {/* LINKS DE NAVEGAÇÃO */}
                <div className="p-2 space-y-1">
                  {/* O Início agora aponta para a raiz Global (/) */}
                  <SidebarLink href="/" icon="🏠" label="Início" isOpen={isSidebarOpen} active={pathname === '/'} />

                  {/* MÓDULO FINANCEIRO — apenas OWNER */}
                  {usuario?.role === 'OWNER' && <div>
                    {isSidebarOpen ? (
                      <button
                        onClick={() => setFinanceiroAberto(v => !v)}
                        className={`w-full group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap ${pathname?.startsWith('/financeiro') ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-sm' : 'text-gray-400 border border-transparent hover:bg-surface-highlight hover:text-foreground'}`}
                      >
                        <span className="text-lg">💰</span>
                        <span className="ml-3 flex-1 text-left">Financeiro</span>
                        {financeiroAberto ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </button>
                    ) : (
                      <SidebarLink href="/financeiro/balancete" icon="💰" label="Financeiro" isOpen={false} active={pathname?.startsWith('/financeiro') ?? false} />
                    )}
                    {isSidebarOpen && financeiroAberto && (
                      <div className="ml-4 mt-1 space-y-0.5 border-l border-border pl-3">
                        <SubSidebarLink href="/financeiro/balancete" label="Balancete" active={pathname?.startsWith('/financeiro/balancete')} />
                        <SubSidebarLink href="/financeiro/contas-a-pagar" label="Contas a Pagar" active={pathname?.startsWith('/financeiro/contas-a-pagar')} />
                        <SubSidebarLink href="/financeiro/contas-a-receber" label="Contas a Receber" active={pathname?.startsWith('/financeiro/contas-a-receber')} />
                        <SubSidebarLink href="/financeiro/plano-contas" label="Plano de Contas" active={pathname?.startsWith('/financeiro/plano-contas')} />
                      </div>
                    )}
                  </div>}

                  {/* O Resto aponta para a equipe selecionada */}
                  {equipeAtual?.id && (
                      <>
                          <SidebarLink href={`/equipe/${equipeAtual.id}/projetos`} icon="📂" label="Projetos" isOpen={isSidebarOpen} active={pathname.includes('/projetos')} />
                          <SidebarLink href={`/equipe/${equipeAtual.id}/minhas-tarefas`} icon="✅" label="Tarefas" isOpen={isSidebarOpen} active={pathname.includes('/minhas-tarefas')} />
                          <SidebarLink href={`/equipe/${equipeAtual.id}/sprint`} icon="🚀" label="Sprint" isOpen={isSidebarOpen} active={pathname.includes('/sprint')} />
                          <SidebarLink href={`/equipe/${equipeAtual.id}/dashboards`} icon="📊" label="Dashboards" isOpen={isSidebarOpen} active={pathname.includes('/dashboards')} />
                          <SidebarLink href={`/equipe/${equipeAtual.id}/portfolio`} icon="🎯" label="Portfólio" isOpen={isSidebarOpen} active={pathname.includes('/portfolio')} />
                          <SidebarLink href={`/equipe/${equipeAtual.id}/recursos`} icon="🔗" label="Recursos" isOpen={isSidebarOpen} active={pathname.includes('/recursos')} />
                          <SidebarLink href={`/equipe/${equipeAtual.id}/relatorio`} icon="📋" label="Relatório" isOpen={isSidebarOpen} active={pathname.includes('/relatorio')} />
                      </>
                  )}
                </div>

                <div className={`border-t border-border my-2 ${!isSidebarOpen && 'border-transparent'}`}></div>

                {/* BOTÃO NOVO PROJETO E LISTA RECENTE */}
                <div className={`px-4 py-2 ${!isSidebarOpen && 'flex justify-center'}`}>
                    {isSidebarOpen ? (
                        <button onClick={abrirModalProjeto} className="w-full flex items-center justify-between px-2 py-1 text-xs font-semibold text-gray-500 hover:text-foreground hover:bg-surface-highlight rounded transition-colors uppercase">
                            <span>Projetos Recentes</span>
                            <span className="text-lg leading-none">+</span>
                        </button>
                    ) : (
                        <button onClick={abrirModalProjeto} className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center justify-center shadow-md" title="Novo Projeto">+</button>
                    )}
                </div>

                <div className={`flex-1 overflow-y-auto custom-scrollbar-dark ${!isSidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                    <SidebarRecentes inicialProjetos={projetosIniciais || []} equipeId={equipeAtual?.id ?? ''} />
                </div>
            </div>

            {/* RODAPÉ DA SIDEBAR */}
            <div className="mt-auto pt-2 border-t border-border pb-4 px-2 bg-surface">
                {usuario?.role === 'OWNER' && (
                    <div className="pb-1">
                        <SidebarLink href="/configuracoes" icon="⚙️" label="Configurações" isOpen={isSidebarOpen} active={pathname?.includes('/configuracoes')} />
                    </div>
                )}
                 <div className="pb-1">
                     <button
                       onClick={() => toast.info('Funcionalidade em breve.')}
                       title={!isSidebarOpen ? 'Boleto' : ''}
                       className={`w-full group flex items-center px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap text-gray-600 cursor-not-allowed opacity-60 ${!isSidebarOpen && 'justify-center'}`}
                     >
                        <span className="text-lg">🧾</span>
                        <span className={`ml-3 transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>Boleto</span>
                        <Lock size={12} className={`ml-auto transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`} />
                     </button>
                 </div>
                 <button onClick={() => signOut({ callbackUrl: '/login' })} className={`w-full group flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-red-500/10 text-gray-500 hover:text-red-400 whitespace-nowrap transition-colors ${!isSidebarOpen && 'justify-center'}`} title="Sair">
                    <span className="text-lg">🚪</span>
                    <span className={`ml-3 transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>Sair</span>
                 </button>
            </div>
         </aside>

         {/* ÁREA DE CONTEÚDO (PÁGINAS) */}
         <main className="relative flex-1 h-full bg-background overflow-hidden">
            <div className="relative z-10 h-full overflow-y-auto p-4 lg:p-6">
              {children}
            </div>
         </main>
      </div>
    </div>
  )
}

// COMPONENTE AUXILIAR PARA OS BOTOES DO MENU
interface SidebarLinkProps {
    href: string
    icon: string
    label: string
    isOpen: boolean
    active: boolean
}

function SidebarLink({ href, icon, label, isOpen, active }: SidebarLinkProps) {
    return (
        <Link href={href} className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap ${!isOpen && 'justify-center'} ${active ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-sm' : 'text-gray-400 border border-transparent hover:bg-surface-highlight hover:text-foreground'}`} title={!isOpen ? label : ''}>
            <span className="text-lg">{icon}</span>
            <span className={`ml-3 transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>{label}</span>
        </Link>
    )
}

function SubSidebarLink({ href, label, active }: { href: string; label: string; active: boolean }) {
    return (
        <Link href={href} className={`flex items-center px-2 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${active ? 'text-indigo-400 bg-indigo-500/10' : 'text-gray-400 hover:text-foreground hover:bg-surface-highlight'}`}>
            {label}
        </Link>
    )
}