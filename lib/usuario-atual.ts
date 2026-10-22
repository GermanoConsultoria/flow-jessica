import { cache } from 'react'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// cache() dedupa chamadas idênticas dentro da mesma requisição: o layout e a
// page podem chamar isso sem gerar duas consultas ao banco por navegação.
export const getUsuarioAtual = cache(async () => {
  const session = await auth()
  if (!session?.user?.email) return null

  return prisma.usuario.findUnique({
    where: { email: session.user.email },
    include: { equipes: { include: { equipe: true } } },
  })
})
