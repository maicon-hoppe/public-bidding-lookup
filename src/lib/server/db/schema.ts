import { sql } from 'drizzle-orm';
import {
	pgTable, serial, varchar,
	text, timestamp, numeric,
	integer, check
} from 'drizzle-orm/pg-core';

export const contractsTable = pgTable('contratos', {
	id: serial('id').primaryKey(),
	idCompra: varchar("id_compra", { length: 30 }).unique().notNull(),
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

export const contractItemsTable = pgTable("itens_contrato", {
	id: serial("id").primaryKey(),
	idCompra: varchar("id_compra", { length: 30 }).notNull().references(() => contractsTable.idCompra),
	quantidadeItem: integer("quantidade").notNull(),
	valorUnitarioItem: numeric("valor_unitario", { precision: 11, scale: 2 }).notNull(),
	descricaoIitem: text("descricao").notNull(),
	esfera: varchar("esfera", { length: 9 }).notNull(),
	poder: varchar("poder", { length: 11 }).notNull()
},
	(table) => [
		check('esfera_valida', sql`${table.esfera} IN ('Federal', 'Estadual', 'Municipal')`),
		check('poder_valido', sql`${table.poder} IN ('Executivo', 'Legislativo', 'Judiciário')`)
	]
);