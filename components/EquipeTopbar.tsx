'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import { ChevronDown, Search, Globe, Key, LogOut, Sun, Moon } from 'lucide-react'
import { signOut } from 'next-auth/react'
import type { EquipeBasica, UsuarioBasico, ProjetoComColunas } from '@/types'
import ModalMinhaSenha from './ModalMinhaSenha'
import SinoNotificacoes from './SinoNotificacoes'
import { useTheme } from './ThemeProvider'

interface Props {
  equipeAtual: EquipeBasica | null
  minhasEquipes: EquipeBasica[]
  botaoMenu: React.ReactNode
  usuarioNome?: string
  usuarioLogadoId?: string
  usuariosDoWorkspace?: UsuarioBasico[]
  projetosParaSino?: ProjetoComColunas[]
}

export default function EquipeTopbar({ equipeAtual, minhasEquipes, botaoMenu, usuarioNome, usuarioLogadoId, usuariosDoWorkspace = [], projetosParaSino = [] }: Props) {
  const [menuEquipeOpen, setMenuEquipeOpen] = useState(false)
  const [menuUsuarioOpen, setMenuUsuarioOpen] = useState(false)
  const [modalSenhaAberto, setModalSenhaAberto] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuUsuarioRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const pathname = usePathname()
  const isGlobalHome = pathname === '/' || pathname?.startsWith('/configuracoes') || pathname?.startsWith('/financeiro')

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuEquipeOpen(false)
      }
      if (menuUsuarioRef.current && !menuUsuarioRef.current.contains(event.target as Node)) {
        setMenuUsuarioOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const { theme, toggle } = useTheme()
  const iniciais = usuarioNome ? usuarioNome.substring(0, 2).toUpperCase() : '?'

  return (
    <>
      <header className="h-16 bg-surface border-b border-border flex items-center px-4 lg:px-6 flex-shrink-0 z-30">

        {/* 1. Logo e Hambúrguer */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {botaoMenu}
          <div className="hidden sm:flex items-center gap-2">
            <div className="relative w-24 h-9">
              <Image
                src="/flow-sem-fundo.png"
                alt="Flow"
                fill
                className="object-contain object-left"
                style={theme === 'light' ? { filter: 'drop-shadow(0 0 3px rgba(0,0,0,0.55))' } : undefined}
                priority
              />
            </div>
          </div>
        </div>

        {/* 2. Área Contextual */}
        <div className="flex items-center gap-4 ml-1 sm:ml-2 border-l border-border pl-3 sm:pl-6">
          {isGlobalHome ? (
            <div className="flex items-center gap-2 px-2 py-1.5 cursor-default select-none">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center shadow-sm border border-indigo-500/20">
                <Globe size={18} />
              </div>
              <div className="text-left hidden md:block">
                <p className="text-[9px] text-indigo-400 font-bold uppercase leading-none mb-0.5">Workspace</p>
                <p className="text-sm font-bold text-foreground leading-none">Visão Global</p>
              </div>
            </div>
          ) : (
            <div className="relative" ref={menuRef}>
              <button onClick={() => setMenuEquipeOpen(!menuEquipeOpen)} className="flex items-center gap-2 hover:bg-surface-highlight/50 px-2 py-1.5 rounded-lg transition-colors">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  {equipeAtual?.nome?.substring(0, 2).toUpperCase() || '?'}
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-[9px] text-text-muted font-bold uppercase leading-none mb-0.5">Equipe Atual</p>
                  <p className="text-sm font-bold text-foreground leading-none">{equipeAtual?.nome || 'Carregando...'}</p>
                </div>
                <ChevronDown size={14} className="text-gray-400 ml-1" />
              </button>

              {menuEquipeOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-surface rounded-xl shadow-xl border border-border overflow-hidden z-50">
                  <div className="p-2 space-y-1">
                    {minhasEquipes.map(eq => (
                      <button
                        key={eq.id}
                        onClick={() => {
                          setMenuEquipeOpen(false)
                          const currentContext = pathname.split('/').slice(3).join('/') || 'projetos'
                          router.push(`/equipe/${eq.id}/${currentContext}`)
                        }}
                        className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${eq.id === equipeAtual?.id ? 'bg-indigo-50/10 border border-indigo-500/30' : 'hover:bg-surface-highlight'}`}
                      >
                        <div className={`w-7 h-7 rounded flex items-center justify-center font-bold text-xs ${eq.id === equipeAtual?.id ? 'bg-indigo-600 text-white' : 'bg-surface-highlight border border-border text-gray-400'}`}>
                          {eq.nome.substring(0, 2).toUpperCase()}
                        </div>
                        <span className={`text-sm truncate ${eq.id === equipeAtual?.id ? 'font-bold text-indigo-400' : 'font-medium text-foreground'}`}>{eq.nome}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3. Busca */}
        <div className="flex-1 max-w-md ml-8 hidden lg:block">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Buscar tarefas ou projetos..." className="w-full bg-surface-highlight/10 border border-border rounded-full pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 text-foreground placeholder:text-gray-500 transition-all" />
          </div>
        </div>

        {/* 4. Menu do Usuário + Sino */}
        <div className="ml-auto flex items-center gap-1 relative" ref={menuUsuarioRef}>
          <button
            onClick={toggle}
            title={theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
            className="p-2 rounded-lg text-text-muted hover:text-foreground hover:bg-surface-highlight/50 transition-colors"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={() => setMenuUsuarioOpen(!menuUsuarioOpen)}
            className="flex items-center gap-2 hover:bg-surface-highlight/50 px-2 py-1.5 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              {iniciais}
            </div>
            <span className="text-sm font-medium text-foreground hidden md:block">{usuarioNome?.split(' ')[0]}</span>
            <ChevronDown size={14} className="text-gray-400" />
          </button>

          {usuarioLogadoId && (
            <SinoNotificacoes
              usuarioId={usuarioLogadoId}
              usuarios={usuariosDoWorkspace}
              projetos={projetosParaSino}
            />
          )}

          {menuUsuarioOpen && (
            <div className="absolute top-full right-0 mt-2 w-52 bg-surface rounded-xl shadow-xl border border-border overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-bold text-foreground truncate">{usuarioNome}</p>
              </div>
              <div className="p-2 space-y-1">
                <button
                  onClick={() => { setMenuUsuarioOpen(false); setModalSenhaAberto(true) }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-surface-highlight transition-colors text-left"
                >
                  <Key size={15} className="text-amber-500" />
                  Alterar minha senha
                </button>
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-500/10 transition-colors text-left"
                >
                  <LogOut size={15} />
                  Sair
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <ModalMinhaSenha isOpen={modalSenhaAberto} onClose={() => setModalSenhaAberto(false)} />
    </>
  )
}
