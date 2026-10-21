import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const API_KEY = process.env.FLOW_API_KEY

function validateKey(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7) === API_KEY
  }
  return new URL(req.url).searchParams.get('api_key') === API_KEY
}

const FORMATO_MAP: Record<string, string> = {
  reels: 'REELS', carrossel: 'CARROSSEL', carrosseis: 'CARROSSEL',
  estático: 'ÚNICO', estatico: 'ÚNICO', único: 'ÚNICO', unico: 'ÚNICO',
}
const FUNIL_MAP: Record<string, string> = { topo: 'TOPO', meio: 'MEIO', fundo: 'FUNDO' }

const TOOLS = [
  {
    name: 'listar_projetos',
    description: 'Lista todos os projetos ativos do workspace do Flow.',
    inputSchema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'importar_cronograma',
    description: 'Cria múltiplas tarefas em um projeto a partir de um cronograma de conteúdo aprovado.',
    inputSchema: {
      type: 'object',
      properties: {
        projeto_id: { type: 'string', description: 'ID do projeto onde as tarefas serão criadas.' },
        tarefas: {
          type: 'array',
          description: 'Lista de conteúdos do cronograma.',
          items: {
            type: 'object',
            properties: {
              titulo: { type: 'string' },
              data_postagem: { type: 'string', description: 'Formato YYYY-MM-DD.' },
              formato: { type: 'string', enum: ['Reels', 'Carrossel', 'Estático'] },
              funil: { type: 'string', enum: ['TOPO', 'MEIO', 'FUNDO'] },
              legenda: { type: 'string' },
              roteiro: { type: 'string' },
              orientacoes_gravacao: { type: 'string' },
              orientacoes_design: { type: 'string' },
              link_referencia: { type: 'string' },
            },
            required: ['titulo', 'data_postagem', 'formato', 'funil'],
          },
        },
      },
      required: ['projeto_id', 'tarefas'],
    },
  },
]

export async function POST(req: NextRequest) {
  if (!validateKey(req)) {
    return NextResponse.json({ jsonrpc: '2.0', error: { code: -32001, message: 'Unauthorized' }, id: null }, { status: 401 })
  }

  const body = await req.json()
  const { jsonrpc, id, method, params } = body as {
    jsonrpc: string
    id: string | number | null
    method: string
    params?: Record<string, unknown>
  }

  // initialize
  if (method === 'initialize') {
    return NextResponse.json({
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: '2025-03-26',
        capabilities: { tools: {} },
        serverInfo: { name: 'Flow', version: '1.0.0' },
      },
    })
  }

  // notifications/initialized — sem resposta
  if (method === 'notifications/initialized') {
    return new NextResponse(null, { status: 202 })
  }

  // tools/list
  if (method === 'tools/list') {
    return NextResponse.json({ jsonrpc: '2.0', id, result: { tools: TOOLS } })
  }

  // tools/call
  if (method === 'tools/call') {
    const { name, arguments: args } = params as { name: string; arguments: Record<string, unknown> }

    // ── listar_projetos ────────────────────────────────────────────────────────
    if (name === 'listar_projetos') {
      const projetos = await prisma.projeto.findMany({
        where: { ativo: true },
        orderBy: { nome: 'asc' },
        select: { id: true, nome: true, equipe: { select: { nome: true } } },
      })

      const texto = projetos
        .map(p => `• ${p.nome} (ID: ${p.id})${p.equipe ? ` — Equipe: ${p.equipe.nome}` : ''}`)
        .join('\n')

      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        result: { content: [{ type: 'text', text: `Projetos ativos:\n\n${texto}` }] },
      })
    }

    // ── importar_cronograma ────────────────────────────────────────────────────
    if (name === 'importar_cronograma') {
      const { projeto_id, tarefas } = args as {
        projeto_id: string
        tarefas: Array<{
          titulo: string
          data_postagem: string
          formato: string
          funil: string
          legenda?: string
          roteiro?: string
          orientacoes_gravacao?: string
          orientacoes_design?: string
          link_referencia?: string
        }>
      }

      const projeto = await prisma.projeto.findUnique({
        where: { id: projeto_id },
        include: { colunas: { include: { coluna: true }, orderBy: { ordem: 'asc' } } },
      })

      if (!projeto) {
        return NextResponse.json({
          jsonrpc: '2.0', id,
          result: { content: [{ type: 'text', text: 'Projeto não encontrado.' }] },
        })
      }

      const colunaInicial =
        projeto.colunas.find(pc => pc.coluna.nome.toUpperCase() === 'NÃO INICIADO') ??
        projeto.colunas.find(pc => pc.coluna.nome.toUpperCase() === 'PLANEJAMENTO') ??
        projeto.colunas.find(pc => pc.coluna.nome.toUpperCase() === 'PARA FAZER') ??
        projeto.colunas[0]

      const colunaId = colunaInicial?.coluna_id ?? null

      const [prioridade, dificuldade] = await Promise.all([
        prisma.opcaoPrioridade.findFirst({ orderBy: { id: 'asc' } }),
        prisma.opcaoDificuldade.findFirst({ orderBy: { id: 'asc' } }),
      ])

      if (!prioridade || !dificuldade) {
        return NextResponse.json({
          jsonrpc: '2.0', id,
          result: { content: [{ type: 'text', text: 'Configuração do workspace incompleta.' }] },
        })
      }

      const criadas: string[] = []
      const erros: string[] = []

      for (const item of tarefas) {
        try {
          const partes: string[] = []
          if (item.legenda) partes.push(`📝 LEGENDA\n\n${item.legenda}`)
          if (item.roteiro) partes.push(`🎬 ROTEIRO / DESENVOLVIMENTO\n\n${item.roteiro}`)
          if (item.orientacoes_gravacao) partes.push(`🎥 ORIENTAÇÕES DE GRAVAÇÃO\n\n${item.orientacoes_gravacao}`)
          if (item.orientacoes_design) partes.push(`🎨 ORIENTAÇÕES DE DESIGN\n\n${item.orientacoes_design}`)
          if (item.link_referencia) partes.push(`🔗 LINK DE REFERÊNCIA\n\n${item.link_referencia}`)

          await prisma.tarefa.create({
            data: {
              titulo: item.titulo,
              descricao: partes.join('\n\n---\n\n') || null,
              projeto_id,
              coluna_id: colunaId,
              prioridade_id: prioridade.id,
              dificuldade_id: dificuldade.id,
              dt_vencimento: item.data_postagem ? new Date(`${item.data_postagem}T12:00:00-03:00`) : null,
              formato: FORMATO_MAP[item.formato?.toLowerCase()?.trim()] ?? null,
              selecionar: FUNIL_MAP[item.funil?.toLowerCase()?.trim()] ?? null,
              recorrencia: 'NAO',
              ordem: 0,
            },
          })
          criadas.push(item.titulo)
        } catch {
          erros.push(item.titulo)
        }
      }

      const msg = `✅ ${criadas.length} tarefa(s) criada(s) no projeto "${projeto.nome}".${erros.length > 0 ? `\n\n❌ Falhas: ${erros.join(', ')}` : ''}`

      return NextResponse.json({
        jsonrpc: '2.0', id,
        result: { content: [{ type: 'text', text: msg }] },
      })
    }

    return NextResponse.json({
      jsonrpc: '2.0', id,
      error: { code: -32601, message: 'Tool not found' },
    })
  }

  return NextResponse.json({
    jsonrpc: '2.0', id,
    error: { code: -32601, message: 'Method not found' },
  })
}

export async function GET() {
  return new NextResponse('Method Not Allowed', { status: 405 })
}
