// Add this script to CRON
import { getAPIContracts } from "../../api/index.ts";
import { insertDBContracts } from "../../db/index.ts";
import { contractToTableFormat } from "../../../utils.ts";

const today = new Date();
today.setDate(1);
const this_month_first = new Date(today);
today.setMonth(today.getMonth() + 1)
today.setDate(0);
const this_month_last = today;

async function main()
{
    const contracts = await getAPIContracts(this_month_first, this_month_last)
    if (contracts.resultado.length > 0)
    {
        // const debtContracts = contracts.resultado.filter(contract => contract.receitaDespesa === "D");
        // const tableContracts = debtContracts.map(contract => contractToTableFormat(contract));
        // const insertedIds = await insertDBContracts(tableContracts);

        const now = new Date();
        if (true) // (insertedIds.length === tableContracts.length)
        {
            console.log(`[${now.toLocaleTimeString()}] \x1b[1;44m OK \x1b[m \x1b[1;32mAll data was inserted\x1b[m`);
        }
        else
        {
            console.log(`[${now.toLocaleTimeString()}] \x1b[1;41m FAIL \x1b[m \x1b[35mNot all data could be added\x1b[m`);
        }
    }
}

main()

