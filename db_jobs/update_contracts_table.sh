#!/bin/bash

shopt -s extglob

FLAG=$1;

function get_api_contracts()
{
    local THIS_MONTH_FIRST=$(date +%Y-%m-01);
    local THIS_MONTH_LAST=$(date -d "`date +%Y%m01` +1 month -2 day" +%Y-%m-%d);

    local PAGE=$1
    local PAGE_SIZE=200
    if [ "$FLAG" = '--emergency' -o "$FLAG" = '-e' ]; then
        local BEGIN=$THIS_MONTH_FIRST
        local END=$THIS_MONTH_LAST
    else
        local BEGIN=$(date -d "yesterday" +%Y-%m-%d);
        local END=$(date -d "yesterday" +%Y-%m-%d);
    fi;
    local CONTRACTS_ENDPOINT="https://dadosabertos.compras.gov.br/modulo-contratos/1_consultarContratos?pagina=${PAGE}&tamanhoPagina=${PAGE_SIZE}&dataVigenciaInicialMin=${BEGIN}&dataVigenciaInicialMax=${END}";

    local RESPONSE=$(curl -s -X 'GET' \
                       $CONTRACTS_ENDPOINT \
                         -H 'accept: application/json');

    if [ $? -eq 0 ]; then
        echo $RESPONSE;
    else
        echo "[$(date --utc '+%F %T')] ERROR: Unable to establish connection with the API" >> update_db.log
	exit 1;
    fi;
}

function contract_to_table_format()
{
    local API_CONTRACTS=$1
    echo $API_CONTRACTS | jq "[.[] | pick(.dataVigenciaInicial, \
                                          .dataVigenciaFinal, \
                                          .nomeOrgao, \
                                          .nomeUnidadeGestora, \
                                          .nomeUnidadeRealizadoraCompra, \
                                          .niFornecedor, \
                                          .nomeRazaoSocialFornecedor, \
                                          .valorGlobal, \
                                          .objeto, \
                                          .informacoesComplementares, \
                                          .nomeCategoria, \
                                          .nomeTipo, \
                                          .nomeModalidadeCompra)]"
}

PAGE_NUMBER=1;
REMAINING_PAGES=1;
while [ $REMAINING_PAGES -gt 0 ]; do
    CONTRACTS=$(get_api_contracts $PAGE_NUMBER);
    CONTRACTS_REQUEST_TIME=$(date --utc '+%FT%T');
    REMAINING_PAGES=$(echo $CONTRACTS | jq '.totalPaginas' 2> /dev/null);
    DEBT_CONTRACTS=$(echo $CONTRACTS \
                     | tee "invalid_response_${CONTRACTS_REQUEST_TIME}.txt" \
                     | jq '[.resultado.[] | select(.receitaDespesa=="D")]' 2> /dev/null \
                   );

    if [ $? -eq 0 ]; then
        DEBT_CONTRACTS_LENGTH=$(echo $DEBT_CONTRACTS | jq "length");
        if [ $DEBT_CONTRACTS_LENGTH -gt 0 ]; then
            rm invalid_response_${CONTRACTS_REQUEST_TIME}.txt
            TABLE_CONTRACTS=$(contract_to_table_format "$DEBT_CONTRACTS");
            SQL_CONTRACTS=$(echo $TABLE_CONTRACTS | jq 'foreach .[] as $item (0; [$item[]])' \
                                                  | sed -E -e "s/(\w)'(\w)/\1\\\\'\2/" \
                                                  | sed -e 's/^\]$/),/' -e 's/^\[$/(/' -e "s/\"/E'/" -e "s/\"/'/g");

            echo "====v PAGE_NUMBER: $PAGE_NUMBER v==========v REMAINING_PAGES: $REMAINING_PAGES v===="
            psql -h 127.0.0.1 -U svelte_user -d svelte_data -c "INSERT INTO contratos ( \
                                                                        vigencia_inicial, \
                                                                        vigencia_final, \
                                                                        orgao, \
                                                                        unidade_gestora, \
                                                                        unidade_compradora, \
                                                                        ni_fornecedor, \
                                                                        fornecedor, \
                                                                        valor_global, \
                                                                        objeto, \
                                                                        informações_complementares, \
                                                                        categoria, \
                                                                        tipo, \
                                                                        modalidade_compra
                                                                ) VALUES ${SQL_CONTRACTS/%,/};";
        else
            echo "[$(date --utc '+%F %T')] WARNING: No contracts were found when updating the database" >> update_db.log
        fi
    else
        echo "[$(date --utc '+%F %T')] ERROR: Invalid API response" >> update_db.log
        exit 1;
    fi
    PAGE_NUMBER=$[++PAGE_NUMBER];
done;
