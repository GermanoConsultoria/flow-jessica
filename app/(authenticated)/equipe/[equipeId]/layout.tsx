import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export default async function EquipeLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ equipeId: string }>
}) {
  const { equipeId } = await params
  const session = await auth()
  if (!session?.user?.email) redirect('/login')

  const membership = await prisma.equipeUsuario.findFirst({
    where: {
      equipe_id: equipeId,
      usuario: { email: session.user.email }
    },
    select: { equipe_id: true }
  })

  if (!membership) redirect('/')

  return <>{children}</>
}
