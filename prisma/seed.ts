// prisma/seed.ts
// Cria o primeiro usuário OWNER (admin) do sistema.
// Uso:
//   ADMIN_NOME="Seu Nome" ADMIN_EMAIL="voce@empresa.com" ADMIN_SENHA="senha-forte" npx prisma db seed
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function seedOpcoes() {
  const prioridades = [
    { id: 1, nome: 'Baixa' },
    { id: 2, nome: 'Média' },
    { id: 3, nome: 'Alta' },
  ]
  const dificuldades = [
    { id: 1, nome: 'Muito Fácil' },
    { id: 2, nome: 'Fácil' },
    { id: 3, nome: 'Média' },
    { id: 4, nome: 'Difícil' },
    { id: 5, nome: 'Muito Difícil' },
  ]

  for (const p of prioridades) {
    await prisma.opcaoPrioridade.upsert({ where: { id: p.id }, update: {}, create: p })
  }
  for (const d of dificuldades) {
    await prisma.opcaoDificuldade.upsert({ where: { id: d.id }, update: {}, create: d })
  }
  console.log('✅ Opções de prioridade/dificuldade garantidas.')
}

async function main() {
  await seedOpcoes()

  const nome = process.env.ADMIN_NOME
  const email = process.env.ADMIN_EMAIL
  const senha = process.env.ADMIN_SENHA
  const workspaceNome = process.env.WORKSPACE_NOME || 'Workspace Principal'

  if (!nome || !email || !senha) {
    console.log('ℹ️  ADMIN_NOME/ADMIN_EMAIL/ADMIN_SENHA não definidos — pulando criação de admin.')
    return
  }

  const existente = await prisma.usuario.findUnique({ where: { email } })
  if (existente) {
    console.log(`✅ Usuário ${email} já existe (role: ${existente.role}). Nada a fazer.`)
    return
  }

  let workspace = await prisma.workspace.findFirst()
  if (!workspace) {
    workspace = await prisma.workspace.create({ data: { nome: workspaceNome } })
    console.log(`🏢 Workspace criado: ${workspace.nome} (${workspace.id})`)
  }

  const senhaHash = await bcrypt.hash(senha, 10)

  const admin = await prisma.usuario.create({
    data: {
      nome,
      email,
      senha: senhaHash,
      role: 'OWNER',
      ativo: true,
      workspace_id: workspace.id,
    },
  })

  console.log(`✅ Admin criado: ${admin.email} (role: ${admin.role})`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
