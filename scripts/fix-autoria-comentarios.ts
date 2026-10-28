import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { writeFileSync } from 'fs'
import { join } from 'path'

const prisma = new PrismaClient()

// Padrão usado na migração original do Trello: "**Nome** (importado do Trello, DD/MM/AAAA, HH:MM:SS): resto"
const REGEX = /^\*\*(.+?)\*\*\s*\(importado do Trello,[^)]*\):\s*/

const MAPA_AUTORES: Record<string, string> = {
  'Jéssica Casciano': '22a8fa92-9787-468f-b8d7-2c621b441d4d',
  'Geovana': 'd9bfe062-1116-4fac-a670-e47042edd41a',
  // "Luana Pereira" propositalmente FORA do mapa — ainda não tem conta no Flow, fica intacta.
}

interface Alteracao {
  id: string
  usuario_id_antigo: string
  usuario_id_novo: string
  texto_antigo: string
  texto_novo: string
  autor: string
}

async function main() {
  const apply = process.argv.includes('--apply')

  const comentarios = await prisma.comentario.findMany({
    select: { id: true, texto: true, usuario_id: true },
  })

  const alteracoes: Alteracao[] = []
  let jaCorretos = 0
  let ignorados = 0
  let semMatch = 0

  for (const c of comentarios) {
    const m = c.texto.match(REGEX)
    if (!m) { semMatch++; continue }

    const autor = m[1].trim()
    const usuarioIdNovo = MAPA_AUTORES[autor]

    if (!usuarioIdNovo) {
      ignorados++
      continue
    }

    const textoNovo = c.texto.replace(REGEX, '')
    const jaEstaCorreto = c.usuario_id === usuarioIdNovo && c.texto === textoNovo

    if (jaEstaCorreto) {
      jaCorretos++
      continue
    }

    alteracoes.push({
      id: c.id,
      usuario_id_antigo: c.usuario_id,
      usuario_id_novo: usuarioIdNovo,
      texto_antigo: c.texto,
      texto_novo: textoNovo,
      autor,
    })
  }

  const porAutor = alteracoes.reduce<Record<string, number>>((acc, a) => {
    acc[a.autor] = (acc[a.autor] ?? 0) + 1
    return acc
  }, {})

  console.log(`Total de comentarios: ${comentarios.length}`)
  console.log(`Sem match de regex (nao e prefixo Trello): ${semMatch}`)
  console.log(`Ignorados (Luana Pereira ou autor fora do mapa): ${ignorados}`)
  console.log(`Ja corretos (idempotencia): ${jaCorretos}`)
  console.log(`A corrigir: ${alteracoes.length}`, porAutor)

  if (alteracoes.length === 0) {
    console.log('Nada a fazer. Saindo.')
    return
  }

  const backupPath = join(process.cwd(), `backup-comentarios-${Date.now()}.json`)
  writeFileSync(backupPath, JSON.stringify(alteracoes, null, 2), 'utf-8')
  console.log(`Backup salvo em: ${backupPath}`)

  if (!apply) {
    console.log('DRY-RUN: nenhuma alteracao foi gravada no banco. Rode novamente com --apply para aplicar.')
    return
  }

  await prisma.$transaction(
    alteracoes.map((a) =>
      prisma.$executeRaw`
        UPDATE "comentario"
        SET "usuario_id" = ${a.usuario_id_novo}, "texto" = ${a.texto_novo}
        WHERE "id" = ${a.id}
      `
    )
  )

  console.log(`${alteracoes.length} comentarios corrigidos.`)

  const contagem = await prisma.comentario.groupBy({
    by: ['usuario_id'],
    _count: { _all: true },
  })
  const usuarios = await prisma.usuario.findMany({
    where: { id: { in: contagem.map((c) => c.usuario_id) } },
    select: { id: true, nome: true },
  })
  const nomePorId = new Map(usuarios.map((u) => [u.id, u.nome]))

  console.log('--- Contagem final por autor ---')
  for (const c of contagem) {
    console.log(`${nomePorId.get(c.usuario_id) ?? c.usuario_id}: ${c._count._all}`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
