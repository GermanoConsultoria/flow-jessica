import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import RecursosView from '@/components/RecursosView'

export const dynamic = 'force-dynamic'

export default async function RecursosPage({ params }: { params: Promise<{ equipeId: string }> }) {
  const { equipeId } = await params

  const session = await auth()
  if (!session?.user?.email) redirect('/login')

  const usuarioLogado = await prisma.usuario.findUnique({ where: { email: session.user.email } })
  if (!usuarioLogado) redirect('/login')

  const equipe = await prisma.equipe.findUnique({ where: { id: equipeId } })
  if (!equipe) redirect('/')

  const [recursos, membroEquipe] = await Promise.all([
    prisma.recursoEquipe.findMany({
      where: { equipe_id: equipeId },
      orderBy: [{ ordem: 'asc' }]
    }),
    prisma.equipeUsuario.findUnique({
      where: { equipe_id_usuario_id: { equipe_id: equipeId, usuario_id: usuarioLogado.id } }
    })
  ])

  const roleNaEquipe = membroEquipe?.role ?? 'MEMBER'
  const roleEfetivo = usuarioLogado.role === 'OWNER' || usuarioLogado.role === 'MANAGER'
    ? usuarioLogado.role
    : roleNaEquipe

  return (
    <RecursosView
      equipeId={equipeId}
      equipeNome={equipe.nome}
      recursosIniciais={recursos}
      roleUsuario={roleEfetivo}
    />
  )
}
