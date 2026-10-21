-- CreateTable
CREATE TABLE "pagamento_parcial" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "lancamento_id" TEXT NOT NULL,
    "valor" DECIMAL(15,2) NOT NULL,
    "dt_pagamento" TIMESTAMP(3) NOT NULL,
    "observacao" TEXT,
    "dt_insert" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pagamento_parcial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pagamento_parcial_lancamento_id_idx" ON "pagamento_parcial"("lancamento_id");

-- AddForeignKey
ALTER TABLE "pagamento_parcial" ADD CONSTRAINT "pagamento_parcial_lancamento_id_fkey" FOREIGN KEY ("lancamento_id") REFERENCES "lancamento_financeiro"("id") ON DELETE CASCADE ON UPDATE CASCADE;
