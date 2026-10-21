// prisma/fix-orphan-projeto.ts
// Lista e remove projetos sem equipe vinculada (equipe_id = null), causados
// por um bug já corrigido no botão "Novo Projeto" da sidebar.
//
// 1. Listar órfãos:
//   npx tsx prisma/fix-orphan-projeto.ts
//
// 2. Excluir um deles (com tudo em cascata: tarefas, comentários, anexos, colunas):
//   PROJETO_ID="cole-o-id-aqui" npx tsx prisma/fix-orphan-projeto.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const projetoId = process.env.PROJETO_ID

  if (!projetoId) {
    const orfaos = await prisma.projeto.findMany({
      where: { equipe_id: null },
      select: { id: true, nome: true, workspace_id: true, dt_insert: true },
    })

    if (orfaos.length === 0) {
      console.log('✅ Nenhum projeto órfão encontrado.')
      return
    }

    console.log(`⚠️  ${orfaos.length} projeto(s) sem equipe encontrados:`)
    for (const p of orfaos) {
      console.log(`  - ${p.nome}  (id: ${p.id}, criado em: ${p.dt_insert.toISOString()})`)
    }
    console.log('\nPra excluir um deles, rode:')
    console.log('  PROJETO_ID="<id>" npx tsx prisma/fix-orphan-projeto.ts')
    return
  }

  const projeto = await prisma.projeto.findUnique({ where: { id: projetoId } })
  if (!projeto) {
    throw new Error(`Projeto ${projetoId} não encontrado.`)
  }
  if (projeto.equipe_id) {
    throw new Error(`Projeto ${projetoId} já está vinculado a uma equipe (${projeto.equipe_id}) — não é órfão, abortando por segurança.`)
  }

  const tarefas = await prisma.tarefa.findMany({ where: { projeto_id: projetoId }, select: { id: true } })
  const tarefaIds = tarefas.map(t => t.id)

  if (tarefaIds.length > 0) {
    await prisma.comentario.deleteMany({ where: { tarefa_id: { in: tarefaIds } } })
    await prisma.historicoTarefa.deleteMany({ where: { tarefa_id: { in: tarefaIds } } })
    await prisma.anexo.deleteMany({ where: { tarefa_id: { in: tarefaIds } } })
    await prisma.tarefa.deleteMany({ where: { projeto_id: projetoId } })
  }

  await prisma.projetoColuna.deleteMany({ where: { projeto_id: projetoId } })
  await prisma.projeto.delete({ where: { id: projetoId } })

  console.log(`✅ Projeto "${projeto.nome}" (${projetoId}) excluído.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
