import * as DB from "$lib/server/db/index";
import { error } from "@sveltejs/kit";

export async function load()
{
    const contracts = await DB.getDBContracts(100);

    if (!contracts) { error(404); }
        
    return { contracts };
}