import {
		pgTable, serial, varchar,
		text, timestamp, customType
	} from 'drizzle-orm/pg-core';

const money = customType<{ data: string | number }>({
	dataType() {
		return "money"
	}
})

export const contractsTable = pgTable('contratos', {
	id: serial('id').primaryKey(),
	dataVigenciaInicial: timestamp("vigencia_inicial").notNull(),
	dataVigenciaFinal: timestamp("vigencia_final").notNull(),
	nomeOrgao: text("orgao").notNull(),
	nomeUnidadeRealizadoraCompra: text("unidade_compradora").notNull(),
	niFornecedor: varchar("ni_fornecedor", { length: 14 }).notNull(),
	nomeRazaoSocialFornecedor: text("fornecedor").notNull(),
	valorGlobal: money("valor_global").notNull(),
	objeto: text().notNull(),
	informacoesComplementares: text("informações_complementares"),
	nomeCategoria: text("categoria").notNull(),
	nomeTipo: text("tipo").notNull(),
	nomeModalidadeCompra: text("modalidade_compra").notNull()
});
