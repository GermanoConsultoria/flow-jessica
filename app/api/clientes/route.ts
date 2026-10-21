import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

async function getWorkspaceId() {
  const session = await auth()
  if (!session?.user?.email) return null
  const usuario = await prisma.usuario.findUnique({ where: { email: session.user.email } })
  return usuario?.workspace_id ?? null
}

export async function GET() {
  const workspace_id = await getWorkspaceId()
  if (!workspace_id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const clientes = await prisma.cliente.findMany({
    where: { workspace_id },
    orderBy: { nome: 'asc' },
  })

  return NextResponse.json(clientes)
}

export async function POST(req: NextRequest) {
  const workspace_id = await getWorkspaceId()
  if (!workspace_id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json()

  const cliente = await prisma.cliente.create({
    data: {
      workspace_id,
      nome: body.nome,
      plano_contratado: body.plano_contratado || null,
      valor_mensalidade: body.valor_mensalidade ? parseFloat(body.valor_mensalidade) : null,
      vencimento_1: body.vencimento_1 ? new Date(body.vencimento_1) : null,
      vencimento_2: body.vencimento_2 ? new Date(body.vencimento_2) : null,
      data_entrada: body.data_entrada ? new Date(body.data_entrada) : null,
      data_prevista: body.data_prevista ? new Date(body.data_prevista) : null,
    },
  })

  return NextResponse.json(cliente, { status: 201 })
}