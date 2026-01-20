import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { env } from '$env/dynamic/private';
import type { TableContract } from '$lib/types';
import { desc, eq, sql } from 'drizzle-orm';

if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

const client = postgres(env.DATABASE_URL);

export const db = drizzle(client, { schema });

export async function getDBContractData(id: number, onlyContract: boolean = false)
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
            .orderBy(schema.contractsTable.dataVigenciaInicial,
                     schema.contractsTable.id)
            .limit(quantity)
            .offset(offset)) as TableContract[];
    }
    else if (quantity)
    {
        return await (db
            .select()
            .from(schema.contractsTable)
            .orderBy(schema.contractsTable.dataVigenciaInicial,
                     schema.contractsTable.id)
            .limit(quantity)) as TableContract[];
    }
    else if (offset)
    {
        return await (db
            .select()
            .from(schema.contractsTable)
            .orderBy(schema.contractsTable.dataVigenciaInicial,
                     schema.contractsTable.id)
            .offset(offset)) as TableContract[];
    }

    return await (db
        .select()
        .from(schema.contractsTable)
        .orderBy(schema.contractsTable.dataVigenciaInicial,
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