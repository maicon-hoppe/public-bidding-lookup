ALTER TABLE "itens_contrato" DROP CONSTRAINT "esfera_valida";--> statement-breakpoint
ALTER TABLE "itens_contrato" DROP CONSTRAINT "poder_valido";--> statement-breakpoint
ALTER TABLE "contratos" ADD COLUMN "esfera" varchar(13) NOT NULL;--> statement-breakpoint
ALTER TABLE "contratos" ADD COLUMN "poder" varchar(13) NOT NULL;--> statement-breakpoint
ALTER TABLE "itens_contrato" DROP COLUMN "esfera";--> statement-breakpoint
ALTER TABLE "itens_contrato" DROP COLUMN "poder";--> statement-breakpoint
ALTER TABLE "contratos" ADD CONSTRAINT "esfera_valida" CHECK ("contratos"."esfera" IN ('Federal', 'Estadual', 'Municipal', 'Não se aplica'));--> statement-breakpoint
ALTER TABLE "contratos" ADD CONSTRAINT "poder_valido" CHECK ("contratos"."poder" IN ('Executivo', 'Legislativo', 'Judiciário', 'Não se aplica'));