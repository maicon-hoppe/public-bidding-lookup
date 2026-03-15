CREATE TABLE "itens_contrato" (
	"id" serial PRIMARY KEY NOT NULL,
	"id_compra" varchar(30) NOT NULL,
	"quantidade" integer NOT NULL,
	"valor_unitario" numeric(11, 2) NOT NULL,
	"descricao" text NOT NULL,
	"esfera" varchar(9) NOT NULL,
	"poder" varchar(11) NOT NULL,
	CONSTRAINT "esfera_valida" CHECK ("itens_contrato"."esfera" IN ('Federal', 'Estadual', 'Municipal')),
	CONSTRAINT "poder_valido" CHECK ("itens_contrato"."poder" IN ('Executivo', 'Legislativo', 'Judiciário'))
);
--> statement-breakpoint
CREATE TABLE "contratos" (
	"id" serial PRIMARY KEY NOT NULL,
	"id_compra" varchar(30) NOT NULL,
	"vigencia_inicial" timestamp with time zone NOT NULL,
	"vigencia_final" timestamp with time zone,
	"orgao" text NOT NULL,
	"unidade_gestora" text NOT NULL,
	"unidade_compradora" text NOT NULL,
	"ni_fornecedor" varchar(14),
	"fornecedor" text,
	"valor_global" numeric(11, 2) NOT NULL,
	"objeto" text NOT NULL,
	"informações_complementares" text,
	"categoria" text NOT NULL,
	"tipo" text NOT NULL,
	"modalidade_compra" text NOT NULL,
	CONSTRAINT "contratos_id_compra_unique" UNIQUE("id_compra")
);
--> statement-breakpoint
ALTER TABLE "itens_contrato" ADD CONSTRAINT "itens_contrato_id_compra_contratos_id_compra_fk" FOREIGN KEY ("id_compra") REFERENCES "public"."contratos"("id_compra") ON DELETE no action ON UPDATE no action;