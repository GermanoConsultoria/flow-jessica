-- Remove campos "Formato" e "Funil" da tarefa (não usados mais pelo cliente)
ALTER TABLE "tarefa" DROP COLUMN IF EXISTS "formato";
ALTER TABLE "tarefa" DROP COLUMN IF EXISTS "selecionar";

-- Checklist (nova feature)
CREATE TABLE IF NOT EXISTS "checklist" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "titulo" TEXT NOT NULL,
    "tarefa_id" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "dt_insert" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "checklist_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "checklist_item" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "texto" TEXT NOT NULL,
    "concluido" BOOLEAN NOT NULL DEFAULT false,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "checklist_id" TEXT NOT NULL,
    CONSTRAINT "checklist_item_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Checklist_tarefa_id_fkey') THEN
        ALTER TABLE "checklist" ADD CONSTRAINT "Checklist_tarefa_id_fkey"
            FOREIGN KEY ("tarefa_id") REFERENCES "tarefa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ChecklistItem_checklist_id_fkey') THEN
        ALTER TABLE "checklist_item" ADD CONSTRAINT "ChecklistItem_checklist_id_fkey"
            FOREIGN KEY ("checklist_id") REFERENCES "checklist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
