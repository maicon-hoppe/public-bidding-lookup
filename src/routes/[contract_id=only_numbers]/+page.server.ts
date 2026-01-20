export async function load({ parent, params })
{
    const contract_id = params.contract_id;
    const contracts = await parent();

    return { contract_id, ...contracts };
}