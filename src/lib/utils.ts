import type { Contract, TableContract } from "./types";

export const BRLCurrencyFormatter = new Intl.NumberFormat(
    "pt-BR",
    {
        style: "currency",
        currency: "BRL"
    }
);

export function niFormatter(ni: string)
{
    if (ni.length === 11)
    {
        return ni.replace(
            /(\d{3})(\d{3})(\d{3})(\d{2})/,
            '$1.$2.$3-$4'
        );
    }
    else if (ni.length === 14)
    {
        return ni.replace(
            /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
            '$1.$2.$3/$4-$5'
        );
    }

    return ni;
}

export function contractToTableFormat(contract: Contract) {
    const tableContract: TableContract = {
        dataVigenciaInicial: new Date(contract.dataVigenciaInicial),
        dataVigenciaFinal: new Date(contract.dataVigenciaFinal),
        nomeOrgao: contract.nomeOrgao,
        nomeUnidadeGestora: contract.nomeUnidadeGestora,
        nomeUnidadeRealizadoraCompra: contract.nomeUnidadeRealizadoraCompra,
        niFornecedor: contract.niFornecedor,
        nomeRazaoSocialFornecedor: contract.nomeRazaoSocialFornecedor,
        valorGlobal: contract.valorGlobal.toString(),
        objeto: contract.objeto,
        informacoesComplementares: contract.informacoesComplementares,
        nomeCategoria: contract.nomeCategoria,
        nomeTipo: contract.nomeTipo,
        nomeModalidadeCompra: contract.nomeModalidadeCompra
    }

    return tableContract;
}