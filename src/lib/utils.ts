export const BRLDateFormatter = new Intl.DateTimeFormat(
    "pt-BR",
    { dateStyle: 'long' }
);

export const BRLCurrencyFormatter = new Intl.NumberFormat(
    "pt-BR",
    {
        style: "currency",
        currency: "BRL"
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