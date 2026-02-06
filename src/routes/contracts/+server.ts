import { json } from "@sveltejs/kit";
import * as DB from "$lib/server/db/index";
import * as API from "$lib/server/api/index";

import type { LocalContractRequestParameters } from "$lib/types";
import { contractToTableFormat } from "$lib/server/utils.js";

export async function GET({ request }) {
    const requestUrl = new URL(request.url);
    const requestParams = Object.fromEntries(
        requestUrl.searchParams.entries().map(
            (param) => [param[0], +(param[1])]
        )
    ) as LocalContractRequestParameters;

    const validParams = new Set(["quantity", "offset"])
    const requestParametersHaveCorrectShape =
        Object.keys(requestParams).length === validParams.size
        && Object.keys(requestParams).every(
            (param) => validParams.has(param)
        );
    if (requestParametersHaveCorrectShape) {
        const MAX_RESPONSE_SIZE = 20;
        if (1 <= requestParams.quantity && requestParams.quantity <= MAX_RESPONSE_SIZE) {
            const dbContracts = await DB.getDBContracts(requestParams.quantity, requestParams.offset);

            if (dbContracts.length === requestParams.quantity) { return json(dbContracts); }
            else if (0 < dbContracts.length && dbContracts.length < requestParams.quantity) {
                const lastcontract = dbContracts.at(-1);
                const endDate = new Date(lastcontract!.dataVigenciaInicial);
                endDate.setMonth(endDate.getMonth() + 1);

                const api_response = await API.getAPIContracts(
                    lastcontract!.dataVigenciaInicial,
                    endDate,
                    1,
                    requestParams.quantity - dbContracts.length
                );

                let contractIdOffset = 0;
                const lastContractId = (await DB.getDBContractData(-1))?.id;
                const formattedAPIContracts = api_response.resultado
                    .slice(-(requestParams.quantity - dbContracts.length))
                    .map(contract => {
                        const tableContract = contractToTableFormat(contract);
                        tableContract.id = lastContractId ?
                            lastContractId + ++contractIdOffset
                            : ++contractIdOffset;

                        return tableContract;
                    });

                return json(dbContracts.concat(formattedAPIContracts));
            }
        }

        return json(`quantity must be a value between 1 and ${MAX_RESPONSE_SIZE}.`);
    }

    return json("Request Malformed.");
}