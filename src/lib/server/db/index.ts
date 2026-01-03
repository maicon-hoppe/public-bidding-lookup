import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { env } from '$env/dynamic/private';
import type { TableContract } from '$lib/types';

if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

const client = postgres(env.DATABASE_URL);

export const db = drizzle(client, { schema });

export async function getDBContracts(quantity?: number)
{
    if (quantity)
    {   
        return await db
            .select()
            .from(schema.contractsTable)
            .limit(quantity);
    }

    return await db
        .select()
        .from(schema.contractsTable);
}

export async function insertDBContracts(contracts: [TableContract])
{
    await db
    .insert(schema.contractsTable)
    .values(contracts);
}