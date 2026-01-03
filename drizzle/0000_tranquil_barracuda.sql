CREATE TABLE "contratos" (
	"id" serial PRIMARY KEY NOT NULL,
	"vigencia_inicial" timestamp NOT NULL,
	"vigencia_final" timestamp NOT NULL,
	"orgao" text NOT NULL,
	"unidade_compradora" text NOT NULL,
	"ni_fornecedor" varchar(14) NOT NULL,
	"fornecedor" text NOT NULL,
	"valor_global" "money" NOT NULL,
	"objeto" text NOT NULL,
	"informações_complementares" text,
	"categoria" text NOT NULL,
	"tipo" text NOT NULL,
	"modalidade_compra" text NOT NULL
);
