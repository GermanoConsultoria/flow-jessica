// prisma/seed-financeiro.ts
// Popula Plano de Contas + Lançamentos (Contas a Pagar/Receber) de teste.
//
// Uso:
//   npx tsx prisma/seed-financeiro.ts
//
// Se o workspace já tiver lançamentos, o script não roda de novo (evita duplicar).
// Pra forçar mesmo assim:
//   FORCE=true npx tsx prisma/seed-financeiro.ts
import { PrismaClient, TipoLancamento, StatusLancamento } from '@prisma/client'

const prisma = new PrismaClient()

function addDias(base: Date, dias: number) {
  const d = new Date(base)
  d.setDate(d.getDate() + dias)
  return d
}

async function garantirPlanoContas(workspaceId: string, tipo: TipoLancamento, nomes: string[]) {
  const ids: Record<string, string> = {}
  for (const nome of nomes) {
    let categoria = await prisma.planoContas.findFirst({ where: { workspace_id: workspaceId, tipo, nome } })
    if (!categoria) {
      categoria = await prisma.planoContas.create({ data: { workspace_id: workspaceId, tipo, nome } })
    }
    ids[nome] = categoria.id
  }
  return ids
}

async function main() {
  const workspace = await prisma.workspace.findFirst()
  if (!workspace) {
    throw new Error('Nenhum workspace encontrado. Rode "npx prisma db seed" primeiro pra criar o workspace/admin.')
  }

  const jaTemLancamentos = await prisma.lancamentoFinanceiro.count({ where: { workspace_id: workspace.id } })
  if (jaTemLancamentos > 0 && process.env.FORCE !== 'true') {
    console.log(`ℹ️  Workspace "${workspace.nome}" já tem ${jaTemLancamentos} lançamento(s). Nada a fazer.`)
    console.log('   Pra popular mesmo assim: FORCE=true npx tsx prisma/seed-financeiro.ts')
    return
  }

  const categoriasDespesa = await garantirPlanoContas(workspace.id, 'DESPESA', [
    'Fornecedores', 'Salários', 'Aluguel', 'Impostos', 'Marketing',
  ])
  const categoriasReceita = await garantirPlanoContas(workspace.id, 'RECEITA', [
    'Vendas', 'Serviços', 'Mensalidades',
  ])

  const hoje = new Date()
  hoje.setHours(12, 0, 0, 0)

  const despesas: { descricao: string; beneficiario: string; valor: number; categoria: string; venceEm: number; status: StatusLancamento; doc?: string }[] = [
    { descricao: 'Aluguel do escritório', beneficiario: 'Imobiliária Central', valor: 4500, categoria: 'Aluguel', venceEm: -35, status: 'PAGO', doc: 'NF-1001' },
    { descricao: 'Aluguel do escritório', beneficiario: 'Imobiliária Central', valor: 4500, categoria: 'Aluguel', venceEm: -5, status: 'PAGO', doc: 'NF-1002' },
    { descricao: 'Aluguel do escritório', beneficiario: 'Imobiliária Central', valor: 4500, categoria: 'Aluguel', venceEm: 25, status: 'PENDENTE', doc: 'NF-1003' },
    { descricao: 'Folha de pagamento', beneficiario: 'RH Interno', valor: 18500, categoria: 'Salários', venceEm: -3, status: 'PAGO' },
    { descricao: 'Folha de pagamento', beneficiario: 'RH Interno', valor: 19200, categoria: 'Salários', venceEm: 27, status: 'PENDENTE' },
    { descricao: 'Licença software ERP', beneficiario: 'Sankhya Ltda', valor: 890, categoria: 'Fornecedores', venceEm: -12, status: 'PAGO', doc: 'NF-2231' },
    { descricao: 'Hospedagem AWS', beneficiario: 'Amazon Web Services', valor: 620.5, categoria: 'Fornecedores', venceEm: -8, status: 'PENDENTE', doc: 'INV-88213' },
    { descricao: 'Material de escritório', beneficiario: 'Papelaria Modelo', valor: 245.9, categoria: 'Fornecedores', venceEm: 10, status: 'PENDENTE' },
    { descricao: 'DAS - Simples Nacional', beneficiario: 'Receita Federal', valor: 3120, categoria: 'Impostos', venceEm: -20, status: 'PAGO', doc: 'DAS-072026' },
    { descricao: 'DAS - Simples Nacional', beneficiario: 'Receita Federal', valor: 3350, categoria: 'Impostos', venceEm: 15, status: 'PENDENTE', doc: 'DAS-082026' },
    { descricao: 'Campanha Google Ads', beneficiario: 'Google Brasil', valor: 1500, categoria: 'Marketing', venceEm: -15, status: 'PAGO' },
    { descricao: 'Campanha Google Ads', beneficiario: 'Google Brasil', valor: 1500, categoria: 'Marketing', venceEm: 12, status: 'PENDENTE' },
    { descricao: 'Consultoria de branding', beneficiario: 'Estúdio Criativo', valor: 2800, categoria: 'Marketing', venceEm: 40, status: 'PENDENTE' },
    { descricao: 'Manutenção de impressora', beneficiario: 'TechFix Assistência', valor: 180, categoria: 'Fornecedores', venceEm: -60, status: 'CANCELADO' },
  ]

  const receitas: { descricao: string; valor: number; categoria: string; venceEm: number; status: StatusLancamento; doc?: string }[] = [
    { descricao: 'Implantação WMS - Cliente Macropack', valor: 25000, categoria: 'Serviços', venceEm: -30, status: 'PAGO', doc: 'FAT-501' },
    { descricao: 'Implantação WMS - Cliente Macropack', valor: 25000, categoria: 'Serviços', venceEm: 0, status: 'PENDENTE', doc: 'FAT-502' },
    { descricao: 'Mensalidade Onblox - Distribuidora Sul', valor: 3200, categoria: 'Mensalidades', venceEm: -10, status: 'PAGO' },
    { descricao: 'Mensalidade Onblox - Distribuidora Sul', valor: 3200, categoria: 'Mensalidades', venceEm: 20, status: 'PENDENTE' },
    { descricao: 'Mensalidade Onblox - Comercial Rio', valor: 2750, categoria: 'Mensalidades', venceEm: -6, status: 'PENDENTE' },
    { descricao: 'Venda de licença adicional', valor: 4900, categoria: 'Vendas', venceEm: -18, status: 'PAGO', doc: 'FAT-498' },
    { descricao: 'Venda de licença adicional', valor: 4900, categoria: 'Vendas', venceEm: 8, status: 'PENDENTE', doc: 'FAT-510' },
    { descricao: 'Consultoria pontual - Cliente Nova Era', valor: 6500, categoria: 'Serviços', venceEm: 33, status: 'PENDENTE' },
    { descricao: 'Setup inicial - Cliente Porto Trading', valor: 12000, categoria: 'Serviços', venceEm: -50, status: 'CANCELADO' },
  ]

  let criados = 0

  for (const d of despesas) {
    await prisma.lancamentoFinanceiro.create({
      data: {
        workspace_id: workspace.id,
        tipo: 'DESPESA',
        descricao: d.descricao,
        beneficiario: d.beneficiario,
        valor: d.valor,
        dt_vencimento: addDias(hoje, d.venceEm),
        dt_pagamento: d.status === 'PAGO' ? addDias(hoje, d.venceEm) : null,
        numero_documento: d.doc ?? null,
        plano_contas_id: categoriasDespesa[d.categoria],
        status: d.status,
      },
    })
    criados++
  }

  for (const r of receitas) {
    await prisma.lancamentoFinanceiro.create({
      data: {
        workspace_id: workspace.id,
        tipo: 'RECEITA',
        descricao: r.descricao,
        valor: r.valor,
        dt_vencimento: addDias(hoje, r.venceEm),
        dt_pagamento: r.status === 'PAGO' ? addDias(hoje, r.venceEm) : null,
        numero_documento: r.doc ?? null,
        plano_contas_id: categoriasReceita[r.categoria],
        status: r.status,
      },
    })
    criados++
  }

  console.log(`✅ ${Object.keys(categoriasDespesa).length + Object.keys(categoriasReceita).length} categorias garantidas.`)
  console.log(`✅ ${criados} lançamentos criados (${despesas.length} despesas, ${receitas.length} receitas) no workspace "${workspace.nome}".`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
