import { json } from "@sveltejs/kit";
import * as DB from "$lib/server/db/index";

import type { LocalContractRequestParameters } from "$lib/types";

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

        if (!Number.isInteger(requestParams.offset)) {
            return json("offset must be a integer.");
        }

        const MAX_RESPONSE_SIZE = 20;
        if (1 <= requestParams.quantity && requestParams.quantity <= MAX_RESPONSE_SIZE) {
            const dbContracts = await DB.getDBContracts(requestParams.quantity, requestParams.offset);

            if (dbContracts.length === requestParams.quantity) { return json(dbContracts); }
            else if (0 < dbContracts.length && dbContracts.length < requestParams.quantity) {
                return json(dbContracts);
            }
            else if (dbContracts.length === 0)
            {
                return json([]);
            }
        }

        return json(`quantity must be a value between 1 and ${MAX_RESPONSE_SIZE}.`);
    }

    return json("Request Malformed.");
}