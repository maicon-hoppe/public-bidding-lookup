<script lang="ts">
    import InfoTile from "$lib/components/InfoTile.svelte";
    import LineChart from "$lib/components/LineChart.svelte";
    import DistributionChart from "$lib/components/DistributionChart.svelte";
    import type { TableContract } from "$lib/types";
    import { BRLCurrencyFormatter } from "$lib/utils";

    const { data } = $props();

    let pageStart = $state(0);
    let pageEnd = $state(9);
    let pageSelectorOffset = $state(0);
    const contracts = $derived(data.contracts);
    const currentPage = $derived(contracts.slice(pageStart, pageEnd));

    const recentExpenses = $derived(data.monthlyExpenses.filter((value) => value.dia.getDate() <= new Date().getDate()));
    const lineChartLabels = $derived(recentExpenses.map((dataPoint) => dataPoint.dia.toLocaleDateString("pt-BR")));
    const lineChartValues = $derived(recentExpenses.map(({dia, total}) => ({x: dia.getDate(), y: total})));

    const expensesDistribution = $derived(data.expensesDistribution);
    const barChartLabels = $derived(expensesDistribution.map((dataPoint) =>
    {
        const formatted: string[] = [];
        const interval_string = dataPoint.part.split(" ");
        const lowerLimit = BRLCurrencyFormatter
            .formatToParts(+(interval_string[0]))
            .slice(0, 3)
            .map(({ type, value }) => value)
            .join('');

        formatted.push(+(interval_string[0]) === 0 ? lowerLimit : lowerLimit + " M");
        formatted.push(interval_string[1]);
        formatted.push(BRLCurrencyFormatter
            .formatToParts(+(interval_string[2]))
            .slice(0, 3)
            .map(({ type, value }) => value)
            .join('')
            + " M"
        );

        return formatted.join(" ")
    }));
    const barChartValues = $derived(expensesDistribution.map((dataPoint) => dataPoint.quantity));
</script>

<header>
    <h1>Contratos</h1>
    <button class="default-button" onclick={() =>
    {
        const isDarkTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const isDarkThemeSelected = document.body.classList.contains("dark-theme");
        if (isDarkTheme || isDarkThemeSelected)
        {
            document.body.classList.toggle("light-theme");
            document.body.classList.remove("dark-theme");
        }
        else
        {
            document.body.classList.toggle("dark-theme");
        }
    }}>Fundo</button>
</header>
<hr>
<main>
    <aside>
        <LineChart labels={lineChartLabels} values={lineChartValues} />
        <DistributionChart labels={barChartLabels} values={barChartValues}/>
    </aside>
    <section>
        <div id="search-filter">
            Filtros: categoria, modalidade, fornecedor?, unidade_compradora?
        </div>
        <div id="contract-page-selector">
            {#each { length: 10 }, page}
                <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
                <label for="page{page+1}" tabindex="0">
                    {page === 0 && pageSelectorOffset ? "<<" : page+1+pageSelectorOffset}
                </label>
                <input checked={page === 0}
                    type="radio" name="page" id="page{page+1}"
                    onclick={() =>
                    {
                        pageStart = 0+10*(page+pageSelectorOffset);
                        pageEnd = 9+10*(page+pageSelectorOffset);
                    }}
                >
            {/each}
            <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
            <label for="next_page" tabindex="0">>></label>
            <input
                type="radio" name="page" id="next_page"
                onclick={async (_) =>
                {
                    const fetchedPage = await fetch(`/contracts?quantity=10&offset=${10 * ++pageSelectorOffset}`);
                    (await fetchedPage.json()).forEach((newContract: TableContract) => contracts.push(newContract));
                }}
            >
        </div>
        <div id="contract-list">
            {#each currentPage as contract}
                <InfoTile {contract} />
            {/each}
        </div>
    </section>
</main>

<style>
    header {
        display: flex;
        flex-direction: row;
        align-items: center;
        height: 8dvh;
    }

    main {
        display: flex;
        height: 90dvh;
        margin-top: 5px;

        & > section {
            background-color: var(--background-10);
            box-shadow: 1px 2px 2px var(--dark-text-color);

            #search-filter { background-color: var(--background); }

            #contract-page-selector {
                display: flex;
                flex-flow: row nowrap;
                justify-content: space-evenly;

                label {
                    width: 10%;
                    padding: 3px;
                    background-color: var(--background);
                    border-bottom: 1px solid var(--text-color);
                    text-align: center;
                }

                label:has(+input:checked) {
                    border-top: 1px solid var(--text-color);
                    border-left: 1px solid var(--text-color);
                    border-right: 1px solid var(--text-color);
                    border-bottom: none;
                    background-color: var(--background-10);
                }
            }
        }
    }

    input[type="radio"] { display: none; }

    @media (769px <= width <= 1440px) {
        main {
            flex-flow: row nowrap;
            /* height: 90dvh; */
            /* margin: auto; */

            aside {
                height: 90dvh;
                width: 35dvw;
                /* min-width: 312px; */
            }

            section {
                height: inherit;
                /* height: 90dvh; */
                min-height: 363px;
                width: 65dvw;

                #contract-list {
                    /* height: 83.2dvh; */
                    /* min-height: 0px; */
                    max-height: calc(100% - 43px);
                    overflow: auto;
                    /* height: calc(100% - 33px); */
                    /* height: 536.63px; */
                    /* scrollbar-gutter: stable; */
                }
            }
        }
    }

    @media (481px  <= width <= 768px) {
        main {
            flex-flow: column nowrap;

            /* aside {
                margin: auto;
            } */

            section {
                & > :where(#search-filter, #contract-page-selector) {
                    width: 100%;
                    position: sticky;
                }

                & > #search-filter {
                    top: 0px;
                }

                & > #contract-page-selector {
                    top: 18px;

                    & > label:has(+input:checked) {
                        box-shadow: 0px 1px 3px black;
                    }
                }
            }
        }
    }
</style>