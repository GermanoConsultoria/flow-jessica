import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface TarefaCronograma {
  titulo: string
  data_postagem: string        // "YYYY-MM-DD"
  legenda?: string
  link_referencia?: string
  orientacoes_gravacao?: string
  orientacoes_design?: string
  roteiro?: string
}

interface Body {
  projeto_id: string
  tarefas: TarefaCronograma[]
}

export async function POST(req: NextRequest) {
  // Autenticação via API Key
  const apiKey = req.headers.get('x-api-key')
  if (!apiKey || apiKey !== process.env.FLOW_API_KEY) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  let body: Body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido.' }, { status: 400 })
  }

  const { projeto_id, tarefas } = body

  if (!projeto_id || !Array.isArray(tarefas) || tarefas.length === 0) {
    return NextResponse.json({ error: 'projeto_id e tarefas são obrigatórios.' }, { status: 400 })
  }

  // Busca o projeto e valida
  const projeto = await prisma.projeto.findUnique({
    where: { id: projeto_id },
    include: {
      colunas: { include: { coluna: true }, orderBy: { ordem: 'asc' } }
    }
  })

  if (!projeto) {
    return NextResponse.json({ error: 'Projeto não encontrado.' }, { status: 404 })
  }

  // Encontra coluna inicial — prioridade: NÃO INICIADO > PLANEJAMENTO > PARA FAZER > primeira do projeto
  const colunaInicial = projeto.colunas.find(pc => pc.coluna.nome.toUpperCase() === 'NÃO INICIADO')
    ?? projeto.colunas.find(pc => pc.coluna.nome.toUpperCase() === 'PLANEJAMENTO')
    ?? projeto.colunas.find(pc => pc.coluna.nome.toUpperCase() === 'PARA FAZER')
    ?? projeto.colunas[0]

  const colunaId = colunaInicial?.coluna_id ?? null

  // Busca prioridade e dificuldade padrão do workspace
  const [prioridade, dificuldade] = await Promise.all([
    prisma.opcaoPrioridade.findFirst({ where: { id: { gt: 0 } }, orderBy: { id: 'asc' } }),
    prisma.opcaoDificuldade.findFirst({ where: { id: { gt: 0 } }, orderBy: { id: 'asc' } }),
  ])

  if (!prioridade || !dificuldade) {
    return NextResponse.json({ error: 'Prioridade ou dificuldade padrão não encontrada.' }, { status: 500 })
  }

  const criadas: string[] = []
  const erros: string[] = []

  for (const item of tarefas) {
    try {
      // Monta a descrição consolidando todos os campos ricos
      const partes: string[] = []
      if (item.legenda) partes.push(`📝 LEGENDA\n\n${item.legenda}`)
      if (item.roteiro) partes.push(`🎬 ROTEIRO / DESENVOLVIMENTO\n\n${item.roteiro}`)
      if (item.orientacoes_gravacao) partes.push(`🎥 ORIENTAÇÕES DE GRAVAÇÃO\n\n${item.orientacoes_gravacao}`)
      if (item.orientacoes_design) partes.push(`🎨 ORIENTAÇÕES DE DESIGN\n\n${item.orientacoes_design}`)
      if (item.link_referencia) partes.push(`🔗 LINK DE REFERÊNCIA\n\n${item.link_referencia}`)
      const descricao = partes.join('\n\n---\n\n') || null

      // Parse da data — espera YYYY-MM-DD
      const dtVencimento = item.data_postagem ? new Date(`${item.data_postagem}T12:00:00-03:00`) : null

      await prisma.tarefa.create({
        data: {
          titulo: item.titulo,
          descricao,
          projeto_id,
          coluna_id: colunaId,
          prioridade_id: prioridade.id,
          dificuldade_id: dificuldade.id,
          dt_vencimento: dtVencimento,
          recorrencia: 'NAO',
          ordem: 0,
        }
      })

      criadas.push(item.titulo)
    } catch {
      erros.push(item.titulo)
    }
  }

  return NextResponse.json({
    sucesso: true,
    criadas: criadas.length,
    erros: erros.length,
    detalhes_erros: erros,
    mensagem: `${criadas.length} tarefa(s) criada(s) com sucesso no projeto "${projeto.nome}".${erros.length > 0 ? ` ${erros.length} falha(s): ${erros.join(', ')}` : ''}`,
  })
}
