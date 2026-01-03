import type { ContractsResponse } from "$lib/types";

export async function getAPIContracts(
    dataVigenciaInicialMin: Date,
    dataVigenciaInicialMax: Date,
    tamanhoPagina: number = 10
) {
    let ISODate;

    ISODate = dataVigenciaInicialMin.toISOString();
    const inicialDate = ISODate.slice(0, ISODate.indexOf("T"));

    ISODate = dataVigenciaInicialMax.toISOString();
    const finalDate = ISODate.slice(0, ISODate.indexOf("T"));

    const contractsURL = `https://dadosabertos.compras.gov.br/modulo-contratos/1_consultarContratos?dataVigenciaInicialMin=${inicialDate}&dataVigenciaInicialMax=${finalDate}`;
    let contractsRequest: Response;
    try
    {
        contractsRequest = await fetch(contractsURL, {
            method: "GET", headers: new Headers({
                accept: "application/json",
                pagina: "1",
                tamanhoPagina: tamanhoPagina.toString()
            })
        });
    }
    catch (err)
    {
        throw new Error("Não foi possível buscar os dados.", { cause: err });
    }

    let contracts: Awaited<ContractsResponse>;
    try
    {
        contracts = await contractsRequest.json();
    }
    catch (e)
    {
        if (e instanceof SyntaxError)
        {
            contracts = {
                resultado: [],
                totalRegistros: 0,
                totalPaginas: 0,
                paginasRestantes: 0
            }
        }
        else { throw new Error(e) }
    }

    return contracts;
}