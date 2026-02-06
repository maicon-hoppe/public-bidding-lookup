import * as DB from "$lib/server/db/index";

export async function load()
{
    return {
        monthlyExpenses: await DB.getDBMonthlyCurrentExpenses(),
        expensesDistribution: await DB.getDBExpensesDistribution(10)
    };
}