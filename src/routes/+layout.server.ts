import * as DB from "$lib/server/db/index";
import { error } from "@sveltejs/kit";

export async function load() {
    const incio = new Date("2025-01-01");
    const fim = new Date("2025-01-31");
    const contracts = await DB.getDBContracts(100);

    if (!contracts) { error(404); }
        
    return { contracts };
}