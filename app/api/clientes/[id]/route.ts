import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

async function getWorkspaceId() {
  const session = await auth()
  if (!session?.user?.email) return null
  const usuario = await prisma.usuario.findUnique({ where: { email: session.user.email } })
  return usuario?.workspace_id ?? null
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const workspace_id = await getWorkspaceId()
  if (!workspace_id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  const cliente = await prisma.cliente.update({
    where: { id },
    data: {
      nome: body.nome,
      plano_contratado: body.plano_contratado || null,
      valor_mensalidade: body.valor_mensalidade ? parseFloat(body.valor_mensalidade) : null,
      vencimento_1: body.vencimento_1 ? new Date(body.vencimento_1) : null,
      vencimento_2: body.vencimento_2 ? new Date(body.vencimento_2) : null,
      data_entrada: body.data_entrada ? new Date(body.data_entrada) : null,
      data_prevista: body.data_prevista ? new Date(body.data_prevista) : null,
    },
  })

  return NextResponse.json(cliente)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const workspace_id = await getWorkspaceId()
  if (!workspace_id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  await prisma.cliente.delete({ where: { id } })

  return NextResponse.json({ ok: true })
}