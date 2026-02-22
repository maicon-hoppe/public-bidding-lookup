<script lang="ts">
    import { on } from "svelte/events";
    import { SvelteDate, MediaQuery } from "svelte/reactivity";
    import { fly } from "svelte/transition";
    import InfoTile from "$lib/components/InfoTile.svelte";
    import LineChart from "$lib/components/LineChart.svelte";
    import DistributionChart from "$lib/components/DistributionChart.svelte";
    import ContractsFilter from "$lib/components/ContractsFilter.svelte";
    import { BRLCurrencyFormatter, filterFromList } from "$lib/utils";
    import type { FilterOptions, TableContract } from "$lib/types";

    const { data } = $props();

    const mqDesktopScreen = new MediaQuery("(769px <= width <= 1440px)");
    const mqTabletScreen = new MediaQuery("(481px <= width <= 768px)");

    let mainElement: HTMLElement;
    let headerVisible = $state(true);
    $effect(() => {
        if (mqTabletScreen.current || mqDesktopScreen.current) {
            const handler = function (e: Event) {
                headerVisible = !((e.target as HTMLElement).scrollTop >= 100);
            };
            const off = on(mainElement, "scroll", handler);

            return off;
        }
    });

    let graphsCarrousel: HTMLDivElement;
    let carrouselScrollPosition: 0 | 740 = $state(0);
    $effect(() => {
        if (mqDesktopScreen.current) {
            const scrollHandler = function () {
                carrouselScrollPosition =
                    graphsCarrousel.scrollLeft >= graphsCarrousel.offsetWidth
                        ? 740
                        : 0;
            };

            let scrollInterval: NodeJS.Timeout;
            const createInterval = function () {
                scrollInterval = setInterval(() => {
                    carrouselScrollPosition =
                        graphsCarrousel.scrollLeft >=
                        graphsCarrousel.offsetWidth
                            ? 0
                            : 740;
                }, 10000);
                graphsCarrousel.scroll({
                    left: carrouselScrollPosition,
                    behavior: "smooth",
                });
            };

            const destroyInterval = function () {
                clearInterval(scrollInterval);
            };

            createInterval();
            const removeScrollendListener = on(
                graphsCarrousel,
                "scrollend",
                scrollHandler,
            );
            const removeMouseleaveListener = on(
                graphsCarrousel,
                "mouseleave",
                createInterval,
            );
            const removeMouseenterListener = on(
                graphsCarrousel,
                "mouseenter",
                destroyInterval,
            );

            return function () {
                destroyInterval();
                removeScrollendListener();
                removeMouseleaveListener();
                removeMouseenterListener();
            };
        }
    });

    let pageScrollPosition: 0 | 1 = $state(0);
    $effect(() => {
        const handler = function (e: Event) {
            const scrollTarget = e.target as HTMLElement;
            pageScrollPosition =
                scrollTarget.scrollTop >= scrollTarget.offsetHeight / 2 ? 1 : 0;
        };

        const off = on(mainElement, "scroll", handler);

        return off;
    });

    let filters: FilterOptions = $state({
        textSearch: {
            text: "",
            textOptions: ["Comprador", "Fornecedor", "Unidade Gestora"],
            selected: "Comprador",
        },
        filterSearch: [
            {
                title: "Despesa",
                type: "number",
                choices: ["Despesa mínima", "Despesa máxima"],
                selected: [],
            },
            {
                title: "Data de Vigência",
                type: "date",
                choices: ["Vigência inicial", "Vigência final"],
                selected: ["", ""],
            },
            {
                title: "Categoria",
                type: "checkbox",
                choices: [
                    "Compras",
                    "Serviços",
                    "Serviços de Engenharia",
                    "Serviços de Saúde",
                    "Obras",
                    "Mão de Obra",
                    "Informática (TIC)",
                ],
                selected: [],
            },
            {
                title: "Tipo",
                type: "checkbox",
                choices: [
                    "Contrato",
                    "Termo de Adesão",
                    "Acordo de Cooperação Técnica (ACT)",
                    "Credenciamento",
                    "Concessão",
                    "Empenho",
                    "Outros",
                ],
                selected: [],
            },
            {
                title: "Modalidade",
                type: "checkbox",
                choices: [
                    "Pregão",
                    "Concorrência",
                    "Inexigibilidade",
                    "Dispensa",
                    "Não se aplica",
                ],
                selected: [],
            },
        ],
    });

    let pageStart = $state(0);
    let pageEnd = $state(9);
    let pageSelectorOffset = $state(0);
    const contracts = $derived(
        data.contracts.filter((value) => {
            let filtersConditions: boolean[] = [];

            const filterText = filters.textSearch.text.toUpperCase();
            if (filters.textSearch.selected === "Comprador") {
                filtersConditions.push(
                    value.nomeUnidadeRealizadoraCompra
                        .toUpperCase()
                        .includes(filterText),
                );
            } else if (filters.textSearch.selected === "Fornecedor") {
                filtersConditions.push(
                    value.nomeRazaoSocialFornecedor
                        ? value.nomeRazaoSocialFornecedor
                              .toUpperCase()
                              .includes(filterText)
                        : false,
                );
            } else if (filters.textSearch.selected === "Unidade Gestora") {
                filtersConditions.push(
                    value.nomeUnidadeGestora.toUpperCase().includes(filterText),
                );
            }

            const expenseFilterOptions = filters.filterSearch.find(
                (filterOption) => filterOption.title === "Despesa",
            )!;
            const filterExpenses = {
                initial: Number(expenseFilterOptions.selected[0]),
                final: Number(expenseFilterOptions.selected[1]),
            };

            if (filterExpenses.initial && filterExpenses.initial >= 0) {
                filtersConditions.push(
                    +value.valorGlobal >= filterExpenses.initial,
                );
            }
            if (filterExpenses.final && filterExpenses.final >= 0) {
                filtersConditions.push(
                    +value.valorGlobal <= filterExpenses.final,
                );
            }

            const dateFilterOptions = filters.filterSearch.find(
                (filterOptions) => filterOptions.title === "Data de Vigência",
            )!;
            let datesInRange: boolean[] = [];
            const filterDates = {
                initial: dateFilterOptions.selected[0],
                final: dateFilterOptions.selected[1],
            };
            if (filterDates.initial && filterDates.final) {
                const localeInitialDate = new Date(filterDates.initial);
                datesInRange.push(
                    value.dataVigenciaInicial >= localeInitialDate,
                );

                const localeFinalDate = new Date(filterDates.final);
                localeFinalDate.setDate(localeFinalDate.getDate() + 1);
                if (value.dataVigenciaFinal) {
                    datesInRange.push(
                        value.dataVigenciaFinal <= localeFinalDate,
                    );
                } else {
                    datesInRange.push(false);
                }
            } else if (filterDates.initial) {
                const offsetDate = new Date(value.dataVigenciaInicial);
                offsetDate.setHours(offsetDate.getHours() - 3);
                datesInRange.push(
                    offsetDate.toISOString().substring(0, 10) ===
                        filterDates.initial,
                );
            } else if (filterDates.final) {
                if (value.dataVigenciaFinal) {
                    const offsetDate = new Date(value.dataVigenciaFinal);
                    offsetDate.setHours(offsetDate.getHours() - 3);
                    datesInRange.push(
                        offsetDate.toISOString().substring(0, 10) ===
                            filterDates.final,
                    );
                } else {
                    datesInRange.push(false);
                }
            }

            filtersConditions.push(
                datesInRange.length === 0 ||
                    datesInRange.every((dateInRange) => dateInRange),
            );

            filtersConditions.push(
                filterFromList(
                    value.nomeCategoria,
                    filters.filterSearch.find(
                        (filterOptions) => filterOptions.title === "Categoria",
                    )!.selected,
                ),
            );

            filtersConditions.push(
                filterFromList(
                    value.nomeTipo,
                    filters.filterSearch.find(
                        (filterOptions) => filterOptions.title === "Tipo",
                    )!.selected,
                ),
            );

            filtersConditions.push(
                filterFromList(
                    value.nomeModalidadeCompra,
                    filters.filterSearch.find(
                        (filterOptions) => filterOptions.title === "Modalidade",
                    )!.selected,
                ),
            );

            return filtersConditions.every((filterPassed) => filterPassed);
        }),
    );
    const currentPage = $derived(contracts.slice(pageStart, pageEnd));
    const contractPageNumber = $derived(
        Math.min(contracts.length / 10, 10) < 2
            ? 0
            : Math.round(Math.min(contracts.length / 10, 10)),
    );

    $effect(() => {
        if (contracts.length > 150) contracts.splice(0, 10);
    });

    const dateToday = new SvelteDate();
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
    let lineChartSelected = $state("");

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
    let barChartSelected: number[] = $state([]);

    $effect(() => {
        const dateFilterOptions = filters.filterSearch.find(
            (filterOption) => filterOption.title === "Data de Vigência",
        )!;
        dateFilterOptions.selected[0] = lineChartSelected;

        const expemseFilterOptions = filters.filterSearch.find(
            (filterOption) => filterOption.title === "Despesa",
        )!;
        expemseFilterOptions.selected = barChartSelected;

        if (mqTabletScreen.current) {
            if (lineChartSelected || barChartSelected.length !== 0) {
                mainElement.scrollTo({ top: 588 });
            }
        }
    });
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

<main bind:this={mainElement}>
    <aside>
        <div id="graphs" bind:this={graphsCarrousel}>
            <LineChart
                labels={lineChartLabels}
                values={lineChartValues}
                bind:selected={lineChartSelected}
            />
            <DistributionChart
                labels={barChartLabels}
                values={barChartValues}
                bind:selected={barChartSelected}
            />
        </div>
        {#if mqDesktopScreen.current}
            <div id="aside-scroll-dots">
                {#each { length: 2 }, scrollPosition}
                    <label for="aside_scroll_step_{scrollPosition}">
                        <input
                            type="radio"
                            name="scroll-steps"
                            id="aside_scroll_step_{scrollPosition}"
                            checked={carrouselScrollPosition ===
                                740 * scrollPosition}
                            bind:group={carrouselScrollPosition}
                            value={740 * scrollPosition}
                        />
                    </label>
                {/each}
            </div>
        {/if}
    </aside>
    <section>
        <ContractsFilter
            bind:filters
            onfiltermenudisplay={() => {
                mainElement.style.overflowY = "hidden";
            }}
            onfiltermenuhide={() => {
                mainElement.style.overflowY = "auto";
            }}
        />
        <div id="contract-page-selector">
            {#each { length: contractPageNumber }, page}
                {#if page === 0 && pageSelectorOffset}
                    <button
                        id="previous_page"
                        onclick={(_) => {
                            const selectedPage = document.querySelector(
                                "#contract-page-selector > label:has(input:checked) + label",
                            );
                            pageSelectorOffset--;
                            contracts.splice(-10);

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
            {#if contractPageNumber >= 10}
                <button
                    id="next_page"
                    onclick={async (_) => {
                        const fetchedPage = await fetch(
                            `/contracts?quantity=10&offset=1${10 * ++pageSelectorOffset}`,
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
            {/if}
        </div>
        <div
            id="contract-list"
            style:height={contractPageNumber >= 10 ? "91dvh" : "95dvh"}
        >
            {#each currentPage as contract}
                <InfoTile {contract} />
            {:else}
                <p id="empty-list">Nenhum contrato localmente</p>
            {/each}
        </div>
    </section>
    <div id="body-scroll-dots">
        {#each { length: 2 }, scrollPosition}
            <label for="page_scroll_step_{scrollPosition}">
                {#if pageScrollPosition === scrollPosition}
                    <svg
                        viewBox="0 -960 960 960"
                        version="1.1"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <rect
                            width="160"
                            height="3096.7742"
                            x="400"
                            y="-2000.38708"
                            ry="269.1402"
                        />
                    </svg>
                {:else}
                    <svg
                        viewBox="0 -960 960 960"
                        version="1.1"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M 352.875,-352.875 C 317.625,-388.125 300,-430.5 300,-480 c 0,-49.5 17.625,-91.875 52.875,-127.125 C 388.125,-642.375 430.5,-660 480,-660 c 49.5,0 91.875,17.625 127.125,52.875 35.25,35.25 52.875,77.625 52.875,127.125 0,49.5 -17.625,91.875 -52.875,127.125 C 571.875,-317.625 529.5,-300 480,-300 c -49.5,0 -91.875,-17.625 -127.125,-52.875 z"
                        />
                    </svg>
                {/if}
                <input
                    type="radio"
                    name="page_scroll_steps"
                    id="page_scroll_step_{scrollPosition}"
                    checked={pageScrollPosition === scrollPosition}
                    bind:group={pageScrollPosition}
                    value={scrollPosition}
                />
            </label>
        {/each}
    </div>
</main>

<style>
    header {
        display: flex;
        flex-flow: row wrap;
        align-items: center;
        justify-content: space-between;
        height: 9dvh;
        width: 100%;

        position: fixed;

        background-color: var(--background);
        box-shadow: 0px 1px 1px var(--text-color);

        button {
            margin-right: 10px;
        }
    }

    main {
        display: flex;

        &::-webkit-scrollbar {
            display: none;
        }

        & > aside {
            background-color: var(--primary-color);

            #graphs {
                display: flex;
            }
        }

        & > section {
            background-color: var(--background-10);
            box-shadow: 1px 2px 2px var(--dark-text-color);

            #contract-page-selector {
                display: flex;
                flex-flow: row nowrap;
                justify-content: space-evenly;
                padding-top: 3px;
                background-color: var(--background);

                label,
                #next_page,
                #previous_page {
                    flex: 1 1 10%;
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

            #contract-list > #empty-list {
                width: 80%;
                margin: 40% auto auto;
                text-align: center;
            }
        }

        & > #body-scroll-dots {
            display: flex;
            flex-flow: column nowrap;
            position: fixed;
            top: 50dvh;
            right: 0dvw;

            svg {
                width: 20px;

                &:has(+ input:checked) {
                    height: 80px;
                    stroke-width: 115.917;
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
            height: 100dvh;
            overflow-y: auto;
            scroll-snap-type: y proximity;

            aside {
                min-height: 80dvh;
                width: 100%;
                margin: 14.5dvh auto 5.5dvh;

                scroll-snap-align: end;

                #graphs {
                    flex-flow: row nowrap;
                    height: 95%;

                    overflow-x: auto;
                    scroll-snap-type: x mandatory;

                    &::-webkit-scrollbar {
                        display: none;
                    }
                }

                #aside-scroll-dots {
                    display: inline;
                    height: 5%;

                    position: relative;
                    left: 50dvw;

                    color: var(--light-text-color);

                    label:has(input:checked)::after {
                        content: "●";
                    }

                    label:not(:has(input:checked))::after {
                        content: "○";
                    }
                }
            }

            section {
                height: 100dvh;
                /* min-height: 91dvh; */
                /* width: 90dvw; */
                scroll-snap-align: start;

                #contract-list {
                    /* height: 91dvh; */
                    max-height: 90.7%;
                    /* max-height: calc(100% - 60px); */
                    /* width: 90dvw; */
                    padding: 0dvw 5dvw;
                    margin: auto;
                    margin-right: 20px;

                    overflow: auto;

                    /* &::-webkit-scrollbar { */
                    /* display: none; */
                    /* } */

                    /* height: calc(100% - 33px); */
                    /* height: 536.63px; */
                    /* scrollbar-gutter: stable; */
                }
            }
        }
    }

    @media (481px <= width <= 768px) {
        main {
            height: 100dvh;
            flex-flow: column nowrap;

            overflow-y: scroll;
            scroll-snap-type: y mandatory;

            &::-webkit-scrollbar {
                display: none;
            }

            aside {
                padding: 9.5dvh 0px 0.5dvh;
                scroll-snap-align: end;

                #graphs {
                    flex-flow: column nowrap;
                }
            }

            section {
                scroll-snap-align: start;

                & > #contract-page-selector {
                    width: 100%;
                    position: sticky;
                    top: 32px;

                    & > label:has(input:checked) {
                        box-shadow: 0px 1px 3px black;
                    }
                }

                & > #contract-list {
                    height: 91dvh;
                    overflow-y: auto;
                }
            }
        }
    }
</style>
