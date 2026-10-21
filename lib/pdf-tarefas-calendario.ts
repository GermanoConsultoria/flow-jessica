import jsPDF from 'jspdf'
import { autoTable } from 'jspdf-autotable'
import type { TarefaComRelacoes } from '@/types'

function formatarData(data: Date | string) {
  return new Date(data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
}

interface GerarPdfCalendarioParams {
  tarefas: TarefaComRelacoes[]
  periodoLabel: string
}

export function gerarPdfCalendarioTarefas({ tarefas, periodoLabel }: GerarPdfCalendarioParams): Blob {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(20)
  doc.text('Tarefas — Calendário', 14, 16)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(110)
  doc.text(`Período: ${periodoLabel}`, 14, 22)
  doc.text(
    `Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
    14,
    27
  )

  const ordenadas = [...tarefas].sort((a, b) => {
    const da = a.dt_vencimento ? new Date(a.dt_vencimento).getTime() : 0
    const db = b.dt_vencimento ? new Date(b.dt_vencimento).getTime() : 0
    return da - db
  })

  const linhas = ordenadas.map(t => [
    t.dt_vencimento ? formatarData(t.dt_vencimento) : '—',
    t.titulo,
    t.projeto?.nome ?? '—',
    t.usuario?.nome ?? '—',
    t.prioridade?.nome ?? '—',
    t.concluida ? 'Concluída' : (t.coluna?.nome || 'A Fazer'),
  ])

  autoTable(doc, {
    startY: 32,
    head: [['Data', 'Tarefa', 'Projeto', 'Responsável', 'Prioridade', 'Status']],
    body: linhas,
    styles: { fontSize: 8, cellPadding: 2.2, textColor: 30 },
    headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [246, 247, 249] },
    margin: { left: 14, right: 14 },
  })

  if (linhas.length === 0) {
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(10)
    doc.setTextColor(150)
    doc.text('Nenhuma tarefa no período selecionado.', 14, 40)
  }

  const totalPaginas = doc.getNumberOfPages()
  for (let i = 1; i <= totalPaginas; i++) {
    doc.setPage(i)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(150)
    const largura = doc.internal.pageSize.getWidth()
    const altura = doc.internal.pageSize.getHeight()
    doc.text(`Página ${i} de ${totalPaginas}`, largura - 14, altura - 8, { align: 'right' })
  }

  return doc.output('blob')
}
