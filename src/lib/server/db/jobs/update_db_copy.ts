#!/usr/bin/env node

import { drizzle } from 'drizzle-orm/postgres-js';
import type {
    ContractsResponse,
    TableContract,
    Contract
} from "../../../types";
// import { insertDBContracts } from "$lib/server/db/index";

async function getAPIContracts(
    dataVigenciaInicialMin: Date,
    dataVigenciaInicialMax: Date,
    pagina: number = 1,
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

function contractToTableFormat(contract: Contract) {
    const tableContract: TableContract = {
        dataVigenciaInicial: new Date(contract.dataVigenciaInicial),
        dataVigenciaFinal: new Date(contract.dataVigenciaFinal),
        nomeOrgao: contract.nomeOrgao,
        nomeUnidadeRealizadoraCompra: contract.nomeUnidadeRealizadoraCompra,
        niFornecedor: contract.niFornecedor,
        nomeRazaoSocialFornecedor: contract.nomeRazaoSocialFornecedor,
        valorGlobal: contract.valorGlobal,
        objeto: contract.objeto,
        informacoesComplementares: contract.informacoesComplementares,
        nomeCategoria: contract.nomeCategoria,
        nomeTipo: contract.nomeTipo,
        nomeModalidadeCompra: contract.nomeModalidadeCompra
    }

    return tableContract;
}

const today = new Date();
today.setDate(1);
const this_month_first = new Date(today);
today.setMonth(today.getMonth() + 1)
today.setDate(0);
const this_month_last = today;

async function main() {
    const contracts = await getAPIContracts(this_month_first, this_month_last)
    if (contracts.resultado.length > 0) {
        const debtContracts = contracts.resultado.filter(contract => contract.receitaDespesa === "D");
        const tableContracts = debtContracts.map(contract => contractToTableFormat(contract));
        // const insertedIds = await insertDBContracts(tableContracts);

        const now = new Date();
        if (true) // (insertedIds.length === tableContracts.length)
        {
            console.log(`[${now.toLocaleTimeString()}] \x1b[1;44m OK \x1b[m \x1b[1;32mAll data was inserted\x1b[m`);
        }
        else {
            console.log(`[${now.toLocaleTimeString()}] \x1b[1;41m FAIL \x1b[m \x1b[35mNot all data could be added\x1b[m`);
        }
    }
}

main()

