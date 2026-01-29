import type { Contract, TableContract } from "../types";

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