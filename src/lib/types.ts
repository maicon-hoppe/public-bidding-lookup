export type Contract = {
    codigoOrgao: string,
    nomeOrgao: string,
    codigoUnidadeGestora: string,
    nomeUnidadeGestora: string,
    codigoUnidadeGestoraOrigemContrato: string,
    nomeUnidadeGestoraOrigemContrato: string,
    receitaDespesa: string,
    numeroContrato: string,
    codigoUnidadeRealizadoraCompra: string,
    nomeUnidadeRealizadoraCompra: string,
    numeroCompra: string,
    codigoModalidadeCompra: string,
    nomeModalidadeCompra: string,
    codigoTipo: string,
    nomeTipo: string,
    codigoCategoria: string,
    nomeCategoria: string,
    codigoSubcategoria?: string,
    nomeSubcategoria?: string,
    niFornecedor: string,
    nomeRazaoSocialFornecedor: string,
    processo: string,
    objeto: string,
    informacoesComplementares?: string,
    dataVigenciaInicial: string, //"2025-12-29T00:57:24.027Z",
    dataVigenciaFinal: string, // "2025-12-29T00:57:24.027Z",
    valorGlobal: number,
    numeroParcelas: number,
    valorParcela: number,
    valorAcumulado: number,
    totalDespesasAcessorias?: number,
    dataHoraInclusao: string, // "2025-12-29T00:57:24.027Z"
    numeroControlePncpContrato: string,
    idCompra: string,
    dataHoraExclusao?: string, // "2025-12-29T00:57:24.027Z",
    contratoExcluido: boolean,
    unidadesRequisitantes: string
}

export type ContractsResponse = {
    resultado: [
        Contract?
    ],
    totalRegistros: number,
    totalPaginas: number,
    paginasRestantes: number
}

export type TableContract = Pick<Contract,
                        "nomeOrgao"
                        | "nomeUnidadeRealizadoraCompra"
                        | "niFornecedor"
                        | "nomeRazaoSocialFornecedor"
                        | "valorGlobal"
                        | "objeto"
                        | "informacoesComplementares"
                        | "nomeCategoria"
                        | "nomeTipo"
                        | "nomeModalidadeCompra"
                        > & {
                            "dataVigenciaInicial": Date,
                            "dataVigenciaFinal": Date
                        }
