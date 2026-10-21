import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import NotificacoesView from './NotificacoesView'

export const dynamic = 'force-dynamic'

export default async function NotificacoesPage() {
  const session = await auth()
  if (!session?.user?.email) redirect('/login')

  const usuario = await prisma.usuario.findUnique({ where: { email: session.user.email } })
  if (!usuario) redirect('/login')

  const notificacoes = await prisma.notificacao.findMany({
    where: { destinatario_id: usuario.id },
    include: {
      remetente: { select: { id: true, nome: true } },
      tarefa: { select: { id: true, titulo: true, projeto_id: true, projeto: { select: { id: true, nome: true, equipe_id: true } } } },
    },
    orderBy: [
      { lida: 'asc' },
      { dt_insert: 'desc' },
    ],
  })

  const [usuariosDoWorkspace, projetos] = await Promise.all([
    prisma.usuario.findMany({ where: { workspace_id: usuario.workspace_id }, select: { id: true, nome: true, email: true, cargo: true, imagem: true } }),
    prisma.projeto.findMany({
      where: { workspace_id: usuario.workspace_id, ativo: true },
      include: {
        colunas: { include: { coluna: true }, orderBy: { ordem: 'asc' } },
        tarefas: {
          include: { usuario: true, coluna: true, prioridade: true, dificuldade: true, anexos: true, comentarios: { include: { usuario: true } } }
        }
      }
    })
  ])

  return (
    <NotificacoesView
      notificacoes={notificacoes as unknown as import('@/types').NotificacaoComRelacoes[]}
      usuarioId={usuario.id}
      usuarios={usuariosDoWorkspace}
      projetos={projetos as unknown as import('@/types').ProjetoComColunas[]}
    />
  )
}
