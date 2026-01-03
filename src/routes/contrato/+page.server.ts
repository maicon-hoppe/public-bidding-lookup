export async function load({ parent, locals })
{
    return await parent();
}