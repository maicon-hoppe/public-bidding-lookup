import type { ContractsResponse } from "$lib/types";

export async function getAPIContracts(
    dataVigenciaInicialMin: Date,
    dataVigenciaInicialMax: Date,
    pagina: number = 1,
    tamanhoPagina: number = 10 // Minimum
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
                pagina: pagina.toString(),
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
        contracts = {
            resultado: [],
            totalRegistros: 0,
            totalPaginas: 0,
            paginasRestantes: 0
        }
    }

    return contracts;
}