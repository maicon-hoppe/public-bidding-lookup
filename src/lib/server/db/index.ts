import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { env } from '$env/dynamic/private';
import type { TableContract } from '$lib/types';
import { count, desc, eq, sql } from 'drizzle-orm';

if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

const client = postgres(env.DATABASE_URL);

export const db = drizzle(client, { schema });

export async function getDBExpensesDistribution(parts: number)
{
    if (parts <= 1)
    {
        return await (db
            .select({
                quantity: sql<number>`count(*)`.mapWith(Number),
                part: sql<string>`FORMAT('0.00 -| %s', MAX(${schema.contractsTable.valorGlobal}))`.as("maior_valor")
            })
            .from(schema.contractsTable)
        );
    }

    const upperLimit = db.$with("limite_superior").as(db
        .select({
            maior_valor: sql<number>`MAX(${schema.contractsTable.valorGlobal})`.as('maior_valor')
        })
        .from(schema.contractsTable)
    );

    let partList: {
        quantity: number;
        part: string;
    }[] = [];
    for (let index = 1; index <= parts; index++)
    {
        const valueInterval = db.$with("intervalo").as(db
            .select({
                inicio: sql<number>`(maior_valor * ${index - 1}/${parts})::NUMERIC(11,2)`.as('inicio'),
                fim: sql<number>`(maior_valor * ${index}/${parts})::NUMERIC(11,2)`.as('fim')
            })
            .from(upperLimit)
        );

        const fraction = await db.with(upperLimit, valueInterval)
            .select({
                quantity: count(schema.contractsTable.valorGlobal),
                part: sql<string>`FORMAT('%s à %s', i.inicio, i.fim)`.as('parte')
            })
            .from(sql`intervalo AS i`)
            .leftJoin(
                schema.contractsTable,
                sql<boolean>`
                    ${schema.contractsTable.valorGlobal} > i.inicio
                    AND ${schema.contractsTable.valorGlobal} <= i.fim
            `)
            .groupBy(sql`i.inicio, i.fim`);

        partList.push(fraction[0]);
    }

    return partList;
}

export async function getDBMonthlyCurrentExpenses()
{
    const finalDate = db.$with("data_final").as(db
        .select({
            maior_data: sql<Date>`MAX(${schema.contractsTable.dataVigenciaInicial})`.as('maior_data')
        })
        .from(schema.contractsTable)
    );

    return await (db.with(finalDate)
        .select({
            dia: sql<Date>`${schema.contractsTable.dataVigenciaInicial}::DATE`
                .mapWith(schema.contractsTable.dataVigenciaInicial).as('dia'),
            total: sql<number>`SUM(${schema.contractsTable.valorGlobal})`
                .mapWith(Number).as('total')
        })
        .from(sql`${schema.contractsTable}, data_final`)
        .where(sql`
            ${schema.contractsTable.dataVigenciaInicial} >= DATE_TRUNC('month', maior_data)::DATE
            AND ${schema.contractsTable.dataVigenciaInicial} < (maior_data + INTERVAL '1 day')::DATE
        `)
        .groupBy(sql`dia`)
        .orderBy(sql`dia`)
    )
}

export async function getDBContractData(id: number)
{
    let contract_list;
    if (id === 0) { id = 1 }
    if (id > 0)
    {
        contract_list = await (db
            .select()
            .from(schema.contractsTable)
            .where(eq(schema.contractsTable.id, id))
        ) as TableContract[]
    }
    else if (id < 0)
    {
        contract_list = await (db
            .select()
            .from(schema.contractsTable)
            .orderBy(desc(schema.contractsTable.id))
            .where(eq(
                    schema.contractsTable.id, 
                    sql<number>`
                    (
                        SELECT ${schema.contractsTable.id}
                        FROM ${schema.contractsTable}
                        ORDER BY ${schema.contractsTable.id} DESC
                        LIMIT 1
                    ) + (${id} + 1)`
                )
            )
        ) as TableContract[]
    }

    return contract_list ? contract_list[0] : null;
}

export async function getDBContracts(quantity?: number, offset?: number)
{
    if (quantity && offset)
    {
        return await (db
            .select()
            .from(schema.contractsTable)
            .orderBy(desc(schema.contractsTable.dataVigenciaInicial),
                     schema.contractsTable.id)
            .limit(quantity)
            .offset(offset)) as TableContract[];
    }
    else if (quantity)
    {
        return await (db
            .select()
            .from(schema.contractsTable)
            .orderBy(desc(schema.contractsTable.dataVigenciaInicial),
                     schema.contractsTable.id)
            .limit(quantity)) as TableContract[];
    }
    else if (offset)
    {
        return await (db
            .select()
            .from(schema.contractsTable)
            .orderBy(desc(schema.contractsTable.dataVigenciaInicial),
                     schema.contractsTable.id)
            .offset(offset)) as TableContract[];
    }

    return await (db
        .select()
        .from(schema.contractsTable)
        .orderBy(desc(schema.contractsTable.dataVigenciaInicial),
                 schema.contractsTable.id)
    ) as TableContract[];
}

export async function insertDBContracts(contracts: TableContract[])
{
    return await db
        .insert(schema.contractsTable)
        .values(contracts)
        .onConflictDoNothing()
        .returning({ insertedId: schema.contractsTable.id });
}