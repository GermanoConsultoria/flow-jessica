import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'
import { getUsuarioAtual } from '@/lib/usuario-atual'

export default async function AuthenticatedRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const usuario = await getUsuarioAtual()

  if (!usuario) redirect('/login')

  const minhasEquipes = usuario.equipes.map(e => e.equipe)
  const equipeAtual = minhasEquipes[0] ?? null

  const [projetosIniciais, usuariosDoWorkspace, projetosParaSino] = await Promise.all([
    prisma.projeto.findMany({
      where: { workspace_id: usuario.workspace_id, ativo: true },
      orderBy: { dt_acesso: 'desc' },
      take: 10,
      select: { id: true, nome: true, dt_acesso: true, imagem: true }
    }),
    prisma.usuario.findMany({
      where: { workspace_id: usuario.workspace_id },
      select: { id: true, nome: true, email: true, cargo: true, imagem: true }
    }),
    prisma.projeto.findMany({
      where: { workspace_id: usuario.workspace_id, ativo: true },
      select: {
        id: true, nome: true,
        colunas: { include: { coluna: true }, orderBy: { ordem: 'asc' } }
      }
    })
  ])

  return (
    <AuthenticatedLayout
      usuario={usuario as unknown as import('@/types').Usuario}
      equipeAtual={equipeAtual}
      minhasEquipes={minhasEquipes}
      projetosIniciais={projetosIniciais}
      usuarioLogadoId={usuario.id}
      usuariosDoWorkspace={usuariosDoWorkspace}
      projetosParaSino={projetosParaSino as unknown as import('@/types').ProjetoComColunas[]}
    >
      {children}
    </AuthenticatedLayout>
  )
}
