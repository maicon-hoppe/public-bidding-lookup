import {
		pgTable, serial, varchar,
		text, timestamp, customType,
		numeric,
		pgView
	} from 'drizzle-orm/pg-core';

export const contractsTable = pgTable('contratos', {
	id: serial('id').primaryKey(),
	dataVigenciaInicial: timestamp("vigencia_inicial", { withTimezone: true }).notNull(),
	dataVigenciaFinal: timestamp("vigencia_final", { withTimezone: true }),
	nomeOrgao: text("orgao").notNull(),
	nomeUnidadeGestora: text("unidade_gestora").notNull(),
	nomeUnidadeRealizadoraCompra: text("unidade_compradora").notNull(),
	niFornecedor: varchar("ni_fornecedor", { length: 14 }),
	nomeRazaoSocialFornecedor: text("fornecedor"),
	valorGlobal: numeric("valor_global", { precision: 11, scale: 2 }).notNull(),
	objeto: text().notNull(),
	informacoesComplementares: text("informações_complementares"),
	nomeCategoria: text("categoria").notNull(),
	nomeTipo: text("tipo").notNull(),
	nomeModalidadeCompra: text("modalidade_compra").notNull()
});

//export const serviceDetailsTable = pgTable("detalhes_serviços");

//export const materialDetailsTable = pgTable("detalhes_materiais");

// export const contractPageView = pgView("detalhes_contratos");