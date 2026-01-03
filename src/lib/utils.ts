import type { Contract, TableContract } from "./types";

export const BRLCurrencyFormatter = new Intl.NumberFormat(
    "pt-BR",
    {
        style: "currency",
        currency: "BRL"
    }
);

export function contractToTableFormat(contract: Contract) {
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