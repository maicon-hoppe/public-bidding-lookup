#!/bin/bash

shopt -s extglob

FLAG=$1;

function get_api_contracts()
{
    local THIS_MONTH_FIRST=$(date +%Y-%m-01);
    local THIS_MONTH_LAST=$(date -d "`date +%Y-%m-01` +1 month -2 day" +%Y-%m-%d);

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
        echo "[$(date --utc '+%F %T')] ERROR: Unable to establish connection with contracts API" >> update_db.log
	exit 1;
    fi;
}

function get_api_contract_items()
{
    local PURCHASE_ID=$1;
    local VALIDITY_DATE=$2;
    local PAGE=$3;

    local CONTRACT_ITEMS_ENDPOINT="https://dadosabertos.compras.gov.br/modulo-contratos/2_consultarContratosItem?pagina=${PAGE}&tamanhoPagina=200&dataVigenciaInicialMin=${VALIDITY_DATE}&dataVigenciaInicialMax=${VALIDITY_DATE}&idCompra=${PURCHASE_ID}";
    local RESPONSE=$(curl -s -X 'GET' \
                       $CONTRACT_ITEMS_ENDPOINT \
                         -H 'accept: application/json');

    sleep 1;
    if [ $? -eq 0 ]; then
        echo $RESPONSE;
    else
        echo "[$(date --utc '+%F %T')] ERROR: Unable to establish connection with contract items API" >> update_db.log
        exit 1;
    fi;
}

function contracts_to_table_format()
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
                                          .nomeModalidadeCompra, \
                                          .idCompra)]"
}

function contract_items_to_table_format()
{
    local API_CONTRACT_ITEMS=$1;
    echo $API_CONTRACT_ITEMS | jq "[.[] | pick(.idCompra, \
                                               .quantidadeItem, \
                                               .valorUnitarioItem, \
                                               .descricaoIitem, \
                                               .esfera, \
                                               .poder)]"
}

PAGE_NUMBER=1;
REMAINING_PAGES=1;
echo "┏———————————————————————— CONTRACTS ————————————————————————┓"
while [ $REMAINING_PAGES -gt 0 ]; do
    CONTRACTS=$(get_api_contracts $PAGE_NUMBER);
    CONTRACTS_REQUEST_TIME=$(date --utc '+%FT%T');
    REMAINING_PAGES=$(echo $CONTRACTS | jq '.totalPaginas' 2> /dev/null);
    DEBT_CONTRACTS=$(echo $CONTRACTS \
                     | tee "contracts_invalid_response_${CONTRACTS_REQUEST_TIME}.txt" \
                     | jq '[.resultado.[] | select(.receitaDespesa=="D")]' 2> /dev/null \
                   );

    if [ $? -eq 0 ]; then
        DEBT_CONTRACTS_LENGTH=$(echo $DEBT_CONTRACTS | jq "length");
        rm contracts_invalid_response_${CONTRACTS_REQUEST_TIME}.txt
        if [ $DEBT_CONTRACTS_LENGTH -gt 0 ]; then
            TABLE_CONTRACTS=$(contracts_to_table_format "$DEBT_CONTRACTS");
            SQL_CONTRACTS=$(echo $TABLE_CONTRACTS | jq 'foreach .[] as $item (0; [$item[]])' \
                                                  | sed -E -e "s/(\w)'(\w)/\1\\\\'\2/" \
                                                  | sed -e 's/^\]$/),/' -e 's/^\[$/(/' -e "s/\"/E'/" -e "s/\"/'/g");

            echo "| ====v PAGE_NUMBER: $PAGE_NUMBER v=========v REMAINING_PAGES: $REMAINING_PAGES v==== |"
            printf "| "
            INSERTIONS=$(psql -h 127.0.0.1 -U svelte_user -d svelte_data -c "INSERT INTO contratos ( \
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
                                                                        modalidade_compra, \
                                                                        id_compra \
                                                                ) VALUES ${SQL_CONTRACTS/%,/};");
            if [ ${#INSERTIONS} -eq 10 ];then
                echo "$INSERTIONS                                                |"
            else
                echo "$INSERTIONS                                               |"
            fi;

            if [[ -z $FLAG ]]; then
                DB_CONTRACT_PURCHASES=$(echo $TABLE_CONTRACTS | jq '[.[] | pick(.idCompra, .dataVigenciaInicial)]');

                PURCHASE_TOTAL=$(echo $DB_CONTRACT_PURCHASES | jq '.|length');
                echo "┏—————————————————————— CONTRACT_ITEMS ——————————————————————┓"
                for (( I=0; I < $PURCHASE_TOTAL; I++ )); do
                    PURCHASE_ID=$(echo $DB_CONTRACT_PURCHASES | jq -r ".[${I}].id_compra");
                    VALIDITY_DATE=$(echo $DB_CONTRACT_PURCHASES | jq ".[${I}].vigencia_inicial" | xargs date --utc '+%F' -d);

                    ITEM_PAGE_NUMBER=1;
                    ITEM_PAGES_REMAINING=1;
                    while [ $ITEM_PAGES_REMAINING -gt 0 ]; do
                        CONTRACT_ITEMS_RESPONSE=$(get_api_contract_items $PURCHASE_ID $VALIDITY_DATE $ITEM_PAGE_NUMBER);
                        CONTRACT_ITEMS_REQUEST_TIME=$(date --utc '+%FT%T');
                        CONTRACT_ITEMS=$(echo $CONTRACT_ITEMS_RESPONSE \
                                         | tee "contract_items_invalid_response_${CONTRACT_ITEMS_REQUEST_TIME}.txt" \
                                         | jq '.resultado' 2> /dev/null);

                        if [ $? -eq 0 ]; then
                            CONTRACT_ITEMS_LENGTH=$(echo $CONTRACT_ITEMS | jq 'length' 2> /dev/null);
                            rm contract_items_invalid_response_${CONTRACT_ITEMS_REQUEST_TIME}.txt;
                            if [ $CONTRACT_ITEMS_LENGTH -gt 0 ]; then
                                ITEM_PAGES_REMAINING=$(echo $CONTRACT_ITEMS_RESPONSE | jq '.paginasRestantes' 2> /dev/null);
                                TABLE_CONTRACT_ITEMS=$(contract_items_to_table_format "$CONTRACT_ITEMS");
                                SQL_ITEMS=$(echo $TABLE_CONTRACT_ITEMS | jq 'foreach .[] as $item (0; [$item[]])' \
                                                                       | sed -E -e "s/(\w)'(\w)/\1\\\\'\2/" \
                                                                       | sed -e 's/^\]$/),/' -e 's/^\[$/(/' -e "s/\"/E'/" -e "s/\"/'/g");

                                if [ "${#I}" -eq 1 ]; then
                                    echo "| CONTRACT Nº${I} —————————————————————————————————————————————┤"
                                else
                                    echo "| CONTRACT Nº${I} ————————————————————————————————————————————┤"
                                fi;
                                echo "| ====v PAGE_NUMBER: $ITEM_PAGE_NUMBER v=========v REMAINING_PAGES: $ITEM_PAGES_REMAINING v==== |"
                                printf "| "
                                INSERTIONS=$(psql -h 127.0.0.1 -U svelte_user -d svelte_data -c "INSERT INTO itens_contrato (id_compra, \
                                                                                                                quantidade, \
                                                                                                                valor_unitario, \
                                                                                                                descricao, \
                                                                                                                esfera, \
                                                                                                                poder \
                                                                                                 ) VALUES ${SQL_ITEMS/%,/};");
                            if [ ${#INSERTIONS} -eq 10 ];then
                                echo "$INSERTIONS                                                |"
                            else
                                echo "$INSERTIONS                                               |"
                            fi;

                            else
                                echo "[$(date --utc '+%F %T')] WARNING: No contract items were found when updating the database" >> update_db.log
                                ITEM_PAGES_REMAINING=0;
                            fi;
                        else
                            echo "[$(date --utc '+%F %T')] ERROR: Invalid contract items API response" >> update_db.log
                            exit 1;
                        fi;
                        ITEM_PAGE_NUMBER=$[++ITEM_PAGE_NUMBER];
                     done;
                done;
                echo "┗———————————————————————————————————————————————————————————┛"
            fi;
        else
            echo "[$(date --utc '+%F %T')] WARNING: No contracts were found when updating the database" >> update_db.log
        fi;
    else
        echo "[$(date --utc '+%F %T')] ERROR: Invalid contracts API response" >> update_db.log
        exit 1;
    fi
    PAGE_NUMBER=$[++PAGE_NUMBER];
done;
echo "┗———————————————————————————————————————————————————————————┛"

if [ "$FLAG" = '--emergency' -o "$FLAG" = '-e' ]; then
    DB_CONTRACT_PURCHASES=$(psql -h 127.0.0.1 -U svelte_user -d svelte_data --csv -c "SELECT id_compra, vigencia_inicial FROM contratos;" \
                            | tail -n +2 \
                            | column -s , --table-columns id_compra,vigencia_inicial -J \
                            | jq '.table' \
                          );

    PURCHASE_TOTAL=$(echo $DB_CONTRACT_PURCHASES | jq '.|length');
    echo "┏————————————————————— CONTRACT_ITEMS ——————————————————————┓"
    for (( I=0; I < $PURCHASE_TOTAL; I++ )); do
        PURCHASE_ID=$(echo $DB_CONTRACT_PURCHASES | jq -r ".[${I}].id_compra");
        VALIDITY_DATE=$(echo $DB_CONTRACT_PURCHASES | jq ".[${I}].vigencia_inicial" | xargs date --utc '+%F' -d);

        ITEM_PAGE_NUMBER=1;
        ITEM_PAGES_REMAINING=1;
        while [ $ITEM_PAGES_REMAINING -gt 0 ]; do
            CONTRACT_ITEMS_RESPONSE=$(get_api_contract_items $PURCHASE_ID $VALIDITY_DATE $ITEM_PAGE_NUMBER);
            CONTRACT_ITEMS_REQUEST_TIME=$(date --utc '+%FT%T');
            CONTRACT_ITEMS=$(echo $CONTRACT_ITEMS_RESPONSE \
                             | tee "contract_items_invalid_response_${CONTRACT_ITEMS_REQUEST_TIME}.txt" \
                             | jq '.resultado' 2> /dev/null);

            if [ $? -eq 0 ]; then
                CONTRACT_ITEMS_LENGTH=$(echo $CONTRACT_ITEMS | jq 'length' 2> /dev/null);
                rm contract_items_invalid_response_${CONTRACT_ITEMS_REQUEST_TIME}.txt;
                if [ $CONTRACT_ITEMS_LENGTH -gt 0 ]; then
                    ITEM_PAGES_REMAINING=$(echo $CONTRACT_ITEMS_RESPONSE | jq '.paginasRestantes' 2> /dev/null);
                    TABLE_CONTRACT_ITEMS=$(contract_items_to_table_format "$CONTRACT_ITEMS");
                    SQL_ITEMS=$(echo $TABLE_CONTRACT_ITEMS | jq 'foreach .[] as $item (0; [$item[]])' \
                                                           | sed -E -e "s/(\w)'(\w)/\1\\\\'\2/" \
                                                           | sed -e 's/^\]$/),/' -e 's/^\[$/(/' -e "s/\"/E'/" -e "s/\"/'/g");

                    if [ "${#I}" -eq 1 ]; then
                        echo "| CONTRACT Nº${I} —————————————————————————————————————————————┤"
                    else
                        echo "| CONTRACT Nº${I} ————————————————————————————————————————————┤"
                    fi;
                    echo "| ====v PAGE_NUMBER: $ITEM_PAGE_NUMBER v=========v REMAINING_PAGES: $ITEM_PAGES_REMAINING v==== |"
                    printf "| "
                    INSERTIONS=$(psql -h 127.0.0.1 -U svelte_user -d svelte_data -c "INSERT INTO itens_contrato (id_compra, \
                                                                                                    quantidade, \
                                                                                                    valor_unitario, \
                                                                                                    descricao, \
                                                                                                    esfera, \
                                                                                                    poder \
                                                                        ) VALUES ${SQL_ITEMS/%,/};");
                if [ ${#INSERTIONS} -eq 10 ];then
                    echo "$INSERTIONS                                                |"
                else
                    echo "$INSERTIONS                                               |"
                fi;

                else
                    echo "[$(date --utc '+%F %T')] WARNING: No contract items were found when updating the database" >> update_db.log
                    ITEM_PAGES_REMAINING=0;
                fi;
            else
                echo "[$(date --utc '+%F %T')] ERROR: Invalid contract items API response" >> update_db.log
                exit 1;
            fi;
            ITEM_PAGE_NUMBER=$[++ITEM_PAGE_NUMBER];
        done;
    done;
    echo "┗———————————————————————————————————————————————————————————┛"
fi;
