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
    niFornecedor?: string,
    nomeRazaoSocialFornecedor?: string,
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
};

export type ContractsResponse = {
    resultado: Contract[],
    totalRegistros: number,
    totalPaginas: number,
    paginasRestantes: number
};

export type TableContract = Pick<Contract,
    "nomeOrgao"
    | "nomeUnidadeGestora"
    | "nomeUnidadeRealizadoraCompra"
    | "niFornecedor"
    | "nomeRazaoSocialFornecedor"
    | "objeto"
    | "informacoesComplementares"
    | "nomeCategoria"
    | "nomeTipo"
    | "nomeModalidadeCompra"
    | "idCompra"
> & {
    "id"?: number,
    "dataVigenciaInicial": Date,
    "dataVigenciaFinal"?: Date,
    "valorGlobal": string
};

export type TableContractItem = {
    id: number,
    idCompra: string,
    quantidadeItem: number,
    valorUnitarioItem: string,
    descricaoIitem: string,
    esfera: 'Federal' | 'Estadual' | 'Municipal',
    poder: 'Executivo' | 'Legislativo' | 'Judiciário'
};

export type LocalContractRequestParameters = {
    quantity: number,
    offset: number
};

export type FilterOptions = {
    textSearch: {
        text: string,
        textOptions: [
            "Comprador",
            "Fornecedor",
            "Unidade Gestora"
        ],
        selected: "Comprador" | "Fornecedor" | "Unidade Gestora"
    },
    filterSearch: {
        title: string,
        type: "number" | "date" | "checkbox",
        choices: string[],
        selected: (string | number)[]
    }[]
};

export type validCategory = (
    "Compras"
    | "Serviços"
    | "Serviços de Engenharia"
    | "Serviços de Saúde"
    | "Obras"
    | "Mão de Obra"
    | "Informática (TIC)"
);

export type validType = (
    "Contrato"
    | "Termo de Adesão"
    | "Acordo de Cooperação Técnica (ACT)"
    | "Credenciamento"
    | "Concessão"
    | "Empenho"
    | "Outros"
);

export type validMode = (
    "Pregão"
    | "Concorrência"
    | "Inexigibilidade"
    | "Dispensa"
    | "Não se aplica"
);

export type validURLTitle = (
    "despesa_minima"
    | "despesa_maxima"
    | "vigencia_inicial"
    | "vigencia_final"
    | "categoria"
    | "tipo"
    | "modalidade"
);

export type validURLCategory = (
    "compras"
    | "servicos"
    | "servicos_de_engenharia"
    | "servicos_de_saude"
    | "obras"
    | "mao_de_obra"
    | "informatica"
);

export type validURLType = (
    "contrato"
    | "termo_de_adesao"
    | "acordo_de_cooperação_tecnica"
    | "credenciamento"
    | "concessao"
    | "empenho"
    | "outros"
);

export type validURLMode = (
    "pregao"
    | "concorrencia"
    | "inexigibilidade"
    | "dispensa"
    | "nao_se_aplica"
);

export type URLFilterOptions = Partial<{
    despesa_minima: string,
    despesa_maxima: string,
    vigencia_inicial: string,
    vigencia_final: string,
    categoria: validURLCategory[],
    tipo: validURLType[],
    modalidade: validURLMode[]
}>;