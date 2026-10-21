-- Renomeia o campo vencimento para vencimento_1 e adiciona vencimento_2
ALTER TABLE "cliente" RENAME COLUMN "vencimento" TO "vencimento_1";
ALTER TABLE "cliente" ADD COLUMN "vencimento_2" TIMESTAMP(3);
