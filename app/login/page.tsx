'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { authenticate } from '@/app/actions'
import Image from 'next/image'

export default function LoginPage() {
  const [errorMessage, dispatch, isPending] = useActionState(authenticate, undefined)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface/50 p-4 overflow-hidden">

      {/* CARD CENTRALIZADO */}
      {/* max-h-full garante que o card nunca seja maior que a tela */}
      <div className="w-full max-w-sm bg-surface rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-full border border-border">
        
        {/* --- LOGO SUPERIOR (JÉSSICA CASCIANO) --- */}
        <div className="h-36 flex justify-center items-center shrink-0 relative overflow-hidden bg-white">
            <div className="relative w-40 h-32 z-10">
                <Image
                    src="/logo-jessica.png"
                    alt="Jéssica Casciano Assessoria Contábil"
                    fill
                    className="object-contain"
                    priority
                />
            </div>
        </div>

        {/* FORMULÁRIO (COM SCROLL INTERNO SE NECESSÁRIO) */}
        {/* Se a tela for minúscula (celular deitado), o scroll aparece SÓ AQUI dentro */}
        <form action={dispatch} className="px-8 py-6 space-y-5 flex-1 overflow-y-auto custom-scrollbar-thin">
          
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase mb-2" htmlFor="email">
              E-mail
            </label>
            <input
              className="w-full border border-border rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              id="email"
              type="email"
              name="email"
              required
              autoFocus
              placeholder="exemplo@gertech.com.br"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-muted uppercase mb-2" htmlFor="password">
              Senha
            </label>
            <input
              className="w-full border border-border rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              id="password"
              type="password"
              name="password"
              required
              placeholder="••••••••"
            />
          </div>

          {errorMessage && (
            <div className="bg-red-900/20 text-red-400 text-xs p-3 rounded-lg flex items-center gap-2 border border-red-900/50 shrink-0">
              ⚠️ {errorMessage}
            </div>
          )}

          <div className="pt-2">
            <LoginButton />
          </div>
        </form>

        {/* --- LOGOS INFERIORES (G-TECH | FLOW) --- */}
        <div className="pb-6 pt-2 flex justify-center items-center shrink-0">
          <div className="flex items-center gap-3 bg-black rounded-xl px-5 py-3">
            <div className="relative w-16 h-8">
                <Image
                    src="/logo-gtech-sem-fundo.png"
                    alt="G-Tech"
                    fill
                    className="object-contain"
                />
            </div>
            <span className="text-white/30 text-lg font-thin select-none">|</span>
            <div className="relative w-24 h-10">
                <Image
                    src="/flow-sem-fundo.png"
                    alt="Flow"
                    fill
                    className="object-contain"
                />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

function LoginButton() {
  const { pending } = useFormStatus()

  return (
    <button
      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
      aria-disabled={pending}
      disabled={pending}
    >
      {pending ? 'Entrando...' : 'Entrar'}
    </button>
  )
}