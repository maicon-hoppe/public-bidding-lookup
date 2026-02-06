<script lang="ts">
    import InfoTile from "$lib/components/InfoTile.svelte";
    import LineChart from "$lib/components/LineChart.svelte";
    import DistributionChart from "$lib/components/DistributionChart.svelte";
    import ContractsFilter from "$lib/components/ContractsFilter.svelte";
    import type { TableContract } from "$lib/types";
    import { BRLCurrencyFormatter } from "$lib/utils";
    import { fly } from "svelte/transition";

    const { data } = $props();

    let headerVisible = $state(true);

    let pageStart = $state(0);
    let pageEnd = $state(9);
    let pageSelectorOffset = $state(0);
    const contracts = $derived(data.contracts);
    const currentPage = $derived(contracts.slice(pageStart, pageEnd));

    const dateToday = new Date();
    const recentExpenses = $derived(
        data.monthlyExpenses.filter(
            (value) =>
                value.dia.getDate() <= dateToday.getDate() &&
                value.dia.getMonth() === dateToday.getMonth(),
        ),
    );
    const lineChartLabels = $derived(
        recentExpenses.map((dataPoint) =>
            dataPoint.dia.toLocaleDateString("pt-BR"),
        ),
    );
    const lineChartValues = $derived(
        recentExpenses.map(({ dia, total }) => ({
            x: dia.getDate(),
            y: total,
        })),
    );

    const expensesDistribution = $derived(data.expensesDistribution);
    const barChartLabels = $derived(
        expensesDistribution.map((dataPoint) => {
            const formatted: string[] = [];
            const interval_string = dataPoint.part.split(" ");
            const lowerLimit = BRLCurrencyFormatter.formatToParts(
                +interval_string[0],
            )
                .slice(0, 3)
                .map(({ type, value }) => value)
                .join("");

            formatted.push(
                +interval_string[0] === 0 ? lowerLimit : lowerLimit + " M",
            );
            formatted.push(interval_string[1]);
            formatted.push(
                BRLCurrencyFormatter.formatToParts(+interval_string[2])
                    .slice(0, 3)
                    .map(({ type, value }) => value)
                    .join("") + " M",
            );

            return formatted.join(" ");
        }),
    );
    const barChartValues = $derived(
        expensesDistribution.map((dataPoint) => dataPoint.quantity),
    );
</script>

{#if headerVisible}
    <header transition:fly={{ y: "-9dvh", delay: 200, duration: 200 }}>
        <h1>Contratos</h1>
        <button
            aria-label="Switch Theme"
            class="default-button"
            onclick={() => {
                const isDarkTheme = window.matchMedia(
                    "(prefers-color-scheme: dark)",
                ).matches;
                const isDarkThemeSelected =
                    document.body.classList.contains("dark-theme");
                if (isDarkTheme || isDarkThemeSelected) {
                    document.body.classList.toggle("light-theme");
                    document.body.classList.remove("dark-theme");
                } else {
                    document.body.classList.toggle("dark-theme");
                }
            }}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <path d="M12 2v2" /><path
                    d="M14.837 16.385a6 6 0 1 1-7.223-7.222c.624-.147.97.66.715 1.248a4 4 0 0 0 5.26 5.259c.589-.255 1.396.09 1.248.715"
                /><path d="M16 12a4 4 0 0 0-4-4" /><path
                    d="m19 5-1.256 1.256"
                /><path d="M20 12h2" />
            </svg>
        </button>
    </header>
{/if}

<main
    onscroll={(e) => {
        headerVisible = !((e.target as HTMLElement).scrollTop >= 587);
    }}
>
    <aside>
        <LineChart labels={lineChartLabels} values={lineChartValues} />
        <DistributionChart labels={barChartLabels} values={barChartValues} />
    </aside>
    <section>
        <ContractsFilter />
        <div id="contract-page-selector">
            {#each { length: 10 }, page}
                {#if page === 0 && pageSelectorOffset}
                    <button
                        id="previous_page"
                        onclick={(_) => {
                            const selectedPage = document.querySelector(
                                "#contract-page-selector > label:has(input:checked) + label",
                            );
                            pageSelectorOffset--;

                            if (selectedPage) {
                                const element =
                                    selectedPage.firstElementChild as HTMLInputElement;
                                element.checked = true;
                            } else {
                                pageStart = 0 + 10 * 9;
                                pageEnd = 9 + 10 * 9;
                            }
                        }}
                    >
                        {"<<"}
                    </button>
                {/if}
                <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
                <label for="page{page + 1}" tabindex="0">
                    {page + 1 + pageSelectorOffset}
                    <input
                        checked={page === 0}
                        type="radio"
                        name="page"
                        id="page{page + 1}"
                        onclick={() => {
                            pageStart = 0 + 10 * (page + pageSelectorOffset);
                            pageEnd = 9 + 10 * (page + pageSelectorOffset);
                        }}
                    />
                </label>
            {/each}
            <button
                id="next_page"
                onclick={async (_) => {
                    const fetchedPage = await fetch(
                        `/contracts?quantity=10&offset=${10 * ++pageSelectorOffset}`,
                    );
                    // Filtro antes do forEach
                    (await fetchedPage.json()).forEach(
                        (newContract: TableContract) =>
                            contracts.push(newContract),
                    );

                    const selectedPage = document.querySelector(
                        "#contract-page-selector > label:has(+label > input:checked)",
                    );
                    if (selectedPage) {
                        const element =
                            selectedPage.firstElementChild as HTMLInputElement;
                        element.checked = true;
                    } else {
                        pageStart = 0 + 10 * pageSelectorOffset;
                        pageEnd = 9 + 10 * pageSelectorOffset;
                    }
                }}
            >
                {">>"}
            </button>
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
        justify-content: space-between;
        height: 9dvh;
        box-shadow: 0px 1px 1px var(--text-color);

        button {
            margin-right: 10px;
        }
    }

    main {
        display: flex;
        height: 91dvh;

        & > aside {
            display: flex;
        }

        & > section {
            background-color: var(--background-10);
            box-shadow: 1px 2px 2px var(--dark-text-color);

            #contract-page-selector {
                display: flex;
                flex-flow: row nowrap;
                justify-content: space-evenly;
                background-color: var(--background);

                label,
                #next_page,
                #previous_page {
                    width: 10%;
                    padding: 3px;
                    cursor: pointer;
                    user-select: none;
                    text-align: center;
                    border-bottom: 1px solid var(--text-color);
                }

                label:has(input:checked) {
                    border-top: 1px solid var(--text-color);
                    border-left: 1px solid var(--text-color);
                    border-right: 1px solid var(--text-color);
                    border-bottom: none;
                    background-color: var(--background-10);
                }

                #next_page,
                #previous_page {
                    border-top: none;
                    border-left: none;
                    border-right: none;
                    background-color: transparent;
                }
            }
        }
    }

    input[type="radio"] {
        display: none;
    }

    svg {
        height: 24px;
        width: 24px;
        stroke: var(--light-text-color);
        fill: var(--light-text-color);
    }

    @media (769px <= width <= 1440px) {
        main {
            flex-flow: column nowrap;
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

    @media (481px <= width <= 768px) {
        header {
            width: 100%;
            position: fixed;
            background-color: var(--background);
        }

        main {
            height: 100dvh;
            flex-flow: column nowrap;

            overflow-y: scroll;
            scroll-snap-type: y mandatory;

            &::-webkit-scrollbar {
                display: none;
            }

            aside {
                padding-top: 9dvh;
                flex-flow: column nowrap;
                scroll-snap-align: end;
            }

            section {
                scroll-snap-align: start;

                & > #contract-page-selector {
                    width: 100%;
                    padding-top: 3px;
                    position: sticky;
                    top: 32px;

                    & > label:has(input:checked) {
                        box-shadow: 0px 1px 3px black;
                    }
                }

                & > #contract-list {
                    height: 91dvh;
                    overflow-y: scroll;
                }
            }
        }
    }
</style>
