import { getDBContractItems } from '$lib/server/db/index.js';
import { error } from '@sveltejs/kit';

export async function load({ parent, params })
{
    const contract_id = params.contract_id;
    const content = await parent();
    const contract = content.contracts.find((contract) => contract?.id === +contract_id);

    if (!contract) { error(404); }

    const contract_items = await getDBContractItems(contract.idCompra);

    return { contract_id, contract, contract_items };
}