function get_api_contract()
{
    local ORGAN_ID=$1;
    local CONTRACT_YEAR=$2;
    local SEQUENTIAL_NUMBER=$3;

    local CONTRACT_ENDPOINT="https://pncp.gov.br/api/pncp/v1/orgaos/${ORGAN_ID}/contratos/${CONTRACT_YEAR}/${SEQUENTIAL_NUMBER}";
    local RESPONSE=$(curl -s -X 'GET' \
                       $CONTRACT_ENDPOINT \
                         -H 'accept: application/json');

    if [ $? -eq 0 ]; then
        echo $RESPONSE;
    else
        echo "[$(date --utc '+%F %T')] ERROR: Unable to establish connection with contract API" >> update_db.log
	    exit 1;
    fi;
}


function get_api_contract_items()
{
    local ORGAN_ID=$1;
    local CONTRACT_YEAR=$2;
    local SEQUENTIAL_NUMBER=$3;
    local PAGE=$4;
    local PAGE_SIZE=200;

    local CONTRACT_ITEMS_ENDPOINT="https://pncp.gov.br/api/pncp/v1/orgaos/${ORGAN_ID}/compras/${CONTRACT_YEAR}/${SEQUENTIAL_NUMBER}/itens?pagina=${PAGE}&tamanhoPagina=${PAGE_SIZE}";
    local RESPONSE=$(curl -s -X 'GET' \
                       $CONTRACT_ITEMS_ENDPOINT \
                         -H 'accept: application/json');

    if [ $? -eq 0 ]; then
        echo $RESPONSE;
    else
        echo "[$(date --utc '+%F %T')] ERROR: Unable to establish connection with contract items API" >> update_db.log
        exit 1;
    fi;
}


function get_api_contract_items_quantity()
{
    local ORGAN_ID=$1;
    local CONTRACT_YEAR=$2;
    local SEQUENTIAL_NUMBER=$3;

    local CONTRACT_ITEMS_ENDPOINT="https://pncp.gov.br/api/pncp/v1/orgaos/${ORGAN_ID}/compras/${CONTRACT_YEAR}/${SEQUENTIAL_NUMBER}/itens/quantidade";
    local RESPONSE=$(curl -s -X 'GET' \
                       $CONTRACT_ITEMS_ENDPOINT \
                         -H 'accept: application/json');

    if [ $? -eq 0 ]; then
        echo $RESPONSE;
    else
        echo "[$(date --utc '+%F %T')] ERROR: Unable to establish connection with contract items quantity API" >> update_db.log
        exit 1;
    fi;
}


function contract_to_table_format()
{
    local API_CONTRACT_SUMMARY=$1
    local API_CONTRACT=$2

    local TABLE_CONTRACT_SUMMARY=$(echo "$API_CONTRACT_SUMMARY" | jq "{ data_inicio_vigencia: .data_inicio_vigencia } +
                                                                      { data_fim_vigencia:.data_fim_vigencia } +
                                                                      { orgao_nome: .orgao_nome } +
                                                                      { unidade_nome: .unidade_nome } +
                                                                      { modalidade_licitacao_nome: .modalidade_licitacao_nome } +
                                                                      { esfera_nome: .esfera_nome } +
                                                                      { poder_nome: .poder_nome }"
                                  );

    local TABLE_CONTRACT_DETAILS=$(echo "$API_CONTRACT" | jq "{ niFornecedor: .niFornecedor } +
                                                              { nomeRazaoSocialFornecedor: .nomeRazaoSocialFornecedor } +
                                                              { valorGlobal: .valorGlobal } +
                                                              { objetoContrato: .objetoContrato } +
                                                              { informacaoComplementar: .informacaoComplementar } +
                                                              { numeroControlePncpCompra: .numeroControlePncpCompra } +
                                                              {
                                                                   categoriaProcesso: .categoriaProcesso.nome,
                                                                   tipoContrato: .tipoContrato.nome
                                                              }"
                                 );

    local INCOMPLETE_TABLE_ENTRY=$(jq -n --argjson o1 "$TABLE_CONTRACT_SUMMARY" --argjson o2 "$TABLE_CONTRACT_DETAILS" '$o1 + $o2');
    local BUYER=$(echo $API_CONTRACT_SUMMARY | jq -r '"\(.unidade_codigo) - \(.unidade_nome)"');
    local COMPLETE_TABLE_ENTRY=$(echo $INCOMPLETE_TABLE_ENTRY | jq --arg BUYER "$BUYER" '. + {nomeUnidadeRealizadoraCompra: $BUYER}');

    echo $COMPLETE_TABLE_ENTRY;
}


function contract_items_to_table_format()
{
    local FOREIGN_KEY=$1;
    local API_CONTRACT_ITEMS=$2;

    local INCOMPLETE_TABLE_ENTRY=$(echo $API_CONTRACT_ITEMS | jq "[.[] | { quantidade: .quantidade } +
                                                                         { valorUnitarioEstimado: .valorUnitarioEstimado } +
                                                                         { descricao: .descricao }]");

    local COMPLETE_TABLE_ENTRY=$(echo $INCOMPLETE_TABLE_ENTRY | jq --argjson foreign_key $FOREIGN_KEY '[.[] + {idCompra: $foreign_key}]');

    echo $COMPLETE_TABLE_ENTRY;
}


DATA_FILE="./search.json";
ALL_CONTRACTS='[]';
for (( I=0 ; I < 600 ; I++ )); do
    ITEM=$(jq --argjson idx "$I" '.items[$idx]' $DATA_FILE);

    CNPJ=$(echo $ITEM | jq '.orgao_cnpj|tonumber');
    YEAR=$(echo $ITEM | jq '.ano|tonumber');
    SEQUENTIAL_NUMBER=$(echo $ITEM | jq '.numero_sequencial|tonumber');
    CONTRACT=$(get_api_contract $CNPJ $YEAR $SEQUENTIAL_NUMBER);

    echo "------------------ CONTRATO ------------------";
    echo $CONTRACT | jq
    echo;
    if [ $(echo $CONTRACT | jq '.anoContrato') != "null" ]; then
        TABLE_CONTRACT=$(contract_to_table_format "$ITEM" "$CONTRACT");
        CONTRACT_LIST=$(echo "$TABLE_CONTRACT" | jq '[.]');

        echo CONTRACTS
        SQL_CONTRACTS=$(echo $CONTRACT_LIST | jq 'foreach .[] as $item (0; [$item[]])' \
                                            | sed -E -e "s/(\w)'(\w)/\1''\2/" \
                                            | sed -e 's/^\]$/),/' -e 's/^\[$/(/' -e "s/\"/'/" -e "s/\"/'/g" \
                                            | sed -e "s/\\\\'/\"/g" -e "s/d'água/d''água/g");

        INSERTIONS=$(psql -h $ENV_DB_HOSTNAME -U $ENV_DB_USERNAME -d $ENV_DB_NAME -c "INSERT INTO contratos (vigencia_inicial, \
                                                                                                             vigencia_final, \
                                                                                                             orgao, \
                                                                                                             unidade_gestora, \
                                                                                                             modalidade_compra, \
                                                                                                             esfera, \
                                                                                                             poder, \
                                                                                                             ni_fornecedor, \
                                                                                                             fornecedor, \
                                                                                                             valor_global, \
                                                                                                             objeto, \
                                                                                                             informações_complementares, \
                                                                                                             id_compra, \
                                                                                                             categoria, \
                                                                                                             tipo, \
                                                                                                             unidade_compradora \
                                                                                      ) VALUES ${SQL_CONTRACTS/%,/}
                                                                                      ON CONFLICT DO NOTHING;");

        if [ ${#INSERTIONS} -eq 10 ];then
            echo "$INSERTIONS                                                |";
        else
            echo "$INSERTIONS                                               |";
        fi;

        echo "------------------ ITEMS ------------------";
        CONTRACT_ID=$(echo $CONTRACT | jq '.numeroControlePncpCompra');
        CONTRACT_ITEMS=$(get_api_contract_items $CNPJ $YEAR $SEQUENTIAL_NUMBER 1);
        echo $CONTRACT_ITEMS | jq
        echo
        TABLE_CONTRACT_ITEMS=$(contract_items_to_table_format "$CONTRACT_ID" "$CONTRACT_ITEMS");

        echo CONTRACT ITEMS
        SQL_CONTRACT_ITEMS=$(echo $TABLE_CONTRACT_ITEMS | jq 'foreach .[] as $item (0; [$item[]])' \
                                                        | sed -E -e "s/(\w)'(\w)/\1''\2/" \
                                                        | sed -e 's/^\]$/),/' -e 's/^\[$/(/' -e "s/\"/'/" -e "s/\"/'/g" \
                                                        | sed -e "s/\\\\'/\"/g" -e "s/d'água/d''água/g");

        INSERTIONS=$(psql -h $ENV_DB_HOSTNAME -U $ENV_DB_USERNAME -d $ENV_DB_NAME -c "INSERT INTO itens_contrato (quantidade, \
                                                                                                                  valor_unitario, \
                                                                                                                  descricao, \
                                                                                                                  id_compra \
                                                                                      ) VALUES ${SQL_CONTRACT_ITEMS/%,/}
                                                                                      ON CONFLICT DO NOTHING;");

        if [ ${#INSERTIONS} -eq 10 ];then
            echo "$INSERTIONS                                                |";
        else
            echo "$INSERTIONS                                               |";
        fi;
        echo "-------------------------------------------";
    fi;
    echo "----------------------------------------------";
done
