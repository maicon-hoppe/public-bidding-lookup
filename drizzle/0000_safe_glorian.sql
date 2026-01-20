CREATE TABLE "contratos" (
	"id" serial PRIMARY KEY NOT NULL,
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
	"modalidade_compra" text NOT NULL
);
