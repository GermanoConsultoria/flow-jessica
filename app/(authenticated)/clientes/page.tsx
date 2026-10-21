import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import ClientesView from './ClientesView'

export default async function ClientesPage() {
  const session = await auth()
  if (!session?.user?.email) redirect('/login')

  const usuario = await prisma.usuario.findUnique({
    where: { email: session.user.email }
  })

  if (!usuario) redirect('/login')

  const clientes = await prisma.cliente.findMany({
    where: { workspace_id: usuario.workspace_id },
    orderBy: { nome: 'asc' }
  })

  const clientesSerializados = clientes.map(c => ({
    ...c,
    valor_mensalidade: c.valor_mensalidade ? parseFloat(c.valor_mensalidade.toString()) : null,
    vencimento_1: c.vencimento_1 ? c.vencimento_1.toISOString() : null,
    vencimento_2: c.vencimento_2 ? c.vencimento_2.toISOString() : null,
    data_entrada: c.data_entrada ? c.data_entrada.toISOString() : null,
    data_prevista: c.data_prevista ? c.data_prevista.toISOString() : null,
    dt_insert: c.dt_insert.toISOString(),
    dt_update: c.dt_update.toISOString(),
  }))

  return <ClientesView clientesIniciais={clientesSerializados} />
}