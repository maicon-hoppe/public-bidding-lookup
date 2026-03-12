import type {
    validCategory,
    validMode,
    validType,
    validURLCategory,
    validURLMode,
    validURLType
} from "$lib/types";

export const isISODateString = /\d{4}-0[1-9]|1[012]-0[1-9]|[1-2]\d|3[01]/;

export const BRLDateFormatter = new Intl.DateTimeFormat(
    "pt-BR",
    { dateStyle: 'long' }
);

export const BRLCurrencyFormatter = new Intl.NumberFormat(
    "pt-BR",
    {
        style: "currency",
        currency: "BRL",
    }
);

export function niFormatter(ni: string) {
    if (ni.length === 11) {
        return ni.replace(
            /(\d{3})(\d{3})(\d{3})(\d{2})/,
            '$1.$2.$3-$4'
        );
    }
    else if (ni.length === 14) {
        return ni.replace(
            /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
            '$1.$2.$3/$4-$5'
        );
    }

    return ni;
}

export const filterMaps: {
    categoryFromURL: Record<validURLCategory, validCategory>,
    typeFromURL: Record<validURLType, validType>,
    modeFromURL: Record<validURLMode, validMode>
} = {
    categoryFromURL: {
        "compras": "Compras",
        "servicos": "Serviços",
        "servicos_de_engenharia": "Serviços de Engenharia",
        "servicos_de_saude": "Serviços de Saúde",
        "obras": "Obras",
        "mao_de_obra": "Mão de Obra",
        "informatica": "Informática (TIC)",
    },
    typeFromURL: {
        "contrato": "Contrato",
        "termo_de_adesao": "Termo de Adesão",
        "acordo_de_cooperação_tecnica": "Acordo de Cooperação Técnica (ACT)",
        "credenciamento": "Credenciamento",
        "concessao": "Concessão",
        "empenho": "Empenho",
        "outros": "Outros",
    },
    modeFromURL: {
        "pregao": "Pregão",
        "concorrencia": "Concorrência",
        "inexigibilidade": "Inexigibilidade",
        "dispensa": "Dispensa",
        "nao_se_aplica": "Não se aplica",
    }
}