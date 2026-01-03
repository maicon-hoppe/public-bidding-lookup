import * as API from "$lib/server/api/index";

export async function load()
{
    const incio = new Date("2025-01-01");
    const fim = new Date("2025-01-31");
    const contracts = await API.getAPIContracts(incio, fim);

    return { contracts };
}