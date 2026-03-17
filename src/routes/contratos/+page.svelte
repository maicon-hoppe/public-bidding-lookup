<script lang="ts">
    import { SvelteURLSearchParams } from "svelte/reactivity";
    import { page } from "$app/state";
    import { filterMaps } from "$lib/utils";
    import InfoTile from "$lib/components/InfoTile.svelte";
    import ContractsFilter from "$lib/components/ContractsFilter.svelte";
    import type {
        FilterOptions,
        TableContract,
        validURLCategory,
        validURLMode,
        validURLTitle,
        validURLType,
    } from "$lib/types";

    const { data } = $props();

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

    const expenseFilterOptions = $derived(
        filters.filterSearch.find(
            (filterOption) => filterOption.title === "Despesa",
        )!,
    );
    const dateFilterOptions = $derived(
        filters.filterSearch.find(
            (filterOptions) => filterOptions.title === "Data de Vigência",
        )!,
    );
    const categoryFilterOptions = $derived(
        filters.filterSearch.find(
            (filterOptions) => filterOptions.title === "Categoria",
        )!,
    );
    const typeFilterOptions = $derived(
        filters.filterSearch.find(
            (filterOptions) => filterOptions.title === "Tipo",
        )!,
    );
    const modeFilterOptions = $derived(
        filters.filterSearch.find(
            (filterOptions) => filterOptions.title === "Modalidade",
        )!,
    );

    const URLFilters = new SvelteURLSearchParams(page.url.searchParams);
    URLFilters.forEach((validFilter, validKey) => {
        switch (validKey as validURLTitle) {
            case "despesa_minima":
                expenseFilterOptions.selected[0] = +validFilter;
                break;

            case "despesa_maxima":
                expenseFilterOptions.selected[1] = +validFilter;
                break;

            case "vigencia_inicial":
                dateFilterOptions.selected[0] = validFilter;
                break;

            case "vigencia_final":
                dateFilterOptions.selected[1] = validFilter;
                break;

            case "categoria":
                categoryFilterOptions.selected.push(
                    filterMaps.categoryFromURL[validFilter as validURLCategory],
                );
                break;

            case "tipo":
                typeFilterOptions.selected.push(
                    filterMaps.typeFromURL[validFilter as validURLType],
                );
                break;

            case "modalidade":
                modeFilterOptions.selected.push(
                    filterMaps.modeFromURL[validFilter as validURLMode],
                );
                break;

            default:
                break;
        }
    });

    let pageStart = $state(0);
    let pageEnd = $state(9);
    let pageSelectorOffset = $state(0);

    const filterContract = function (value: TableContract) {
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

        const filterExpenses = {
            initial: Number.isNaN(expenseFilterOptions.selected[0])
                ? undefined
                : Number(expenseFilterOptions.selected[0]),
            final: Number.isNaN(expenseFilterOptions.selected[1])
                ? undefined
                : Number(expenseFilterOptions.selected[1]),
        };

        if (filterExpenses.initial && filterExpenses.initial >= 0) {
            filtersConditions.push(
                +value.valorGlobal >= filterExpenses.initial,
            );
        }
        if (filterExpenses.final && filterExpenses.final >= 0) {
            filtersConditions.push(+value.valorGlobal <= filterExpenses.final);
        }

        let datesInRange: boolean[] = [];
        const filterDates = {
            initial: dateFilterOptions.selected[0],
            final: dateFilterOptions.selected[1],
        };
        if (filterDates.initial && filterDates.final) {
            const localeInitialDate = new Date(filterDates.initial);
            datesInRange.push(value.dataVigenciaInicial >= localeInitialDate);

            const localeFinalDate = new Date(filterDates.final);
            localeFinalDate.setDate(localeFinalDate.getDate() + 1);
            if (value.dataVigenciaFinal) {
                datesInRange.push(value.dataVigenciaFinal <= localeFinalDate);
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
            categoryFilterOptions.selected.length === 0 ||
                categoryFilterOptions.selected.includes(value.nomeCategoria),
        );

        filtersConditions.push(
            typeFilterOptions.selected.length === 0 ||
                typeFilterOptions.selected.includes(value.nomeTipo),
        );

        filtersConditions.push(
            modeFilterOptions.selected.length === 0 ||
                modeFilterOptions.selected.includes(value.nomeModalidadeCompra),
        );

        return filtersConditions.every((filterPassed) => filterPassed);
    };

    const contracts = $derived(data.contracts.filter(filterContract));
    const currentPage = $derived(contracts.slice(pageStart, pageEnd));
    const contractPageNumber = $derived(
        Math.min(contracts.length / 10, 10) < 2
            ? 0
            : Math.round(Math.min(contracts.length / 10, 10)),
    );
</script>

<header>
    <a href="/">
        <h1>
            <svg
                viewBox="0 -960 960 960"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="m 240,-880 c -22,0 -40.81771,7.84896 -56.48438,23.51562 C 167.84896,-840.81771 160,-822 160,-800 v 640 c 0,22 7.84896,40.81771 23.51562,56.48438 C 199.18229,-87.848958 218,-80 240,-80 h 480 c 22,0 40.81771,-7.848958 56.48438,-23.51562 C 792.15104,-119.18229 800,-138 800,-160 V -640 L 560,-880 Z m 0,80 h 280 v 200 h 200 v 440 H 240 v -440 z"
                />
                <path
                    d="m 464.8017,-578.8553 -64.5824,-64.5824 q -7.2312,4.987 -16.8314,7.9793 -9.6,2.9922 -20.8209,2.9922 -29.4237,0 -49.9954,-20.5716 Q 292,-673.6094 292,-703.0331 q 0,-29.4237 20.5716,-49.9953 20.5717,-20.5716 49.9954,-20.5716 29.4237,0 49.9953,20.5716 20.5716,20.5716 20.5716,49.9953 0,11.4703 -2.9922,20.821 -2.9923,9.3507 -7.9794,16.3326 l 64.8319,65.0812 z M 362.567,-663.8847 q 16.4573,0 27.8028,-11.3456 11.3456,-11.3455 11.3456,-27.8028 0,-16.4573 -11.3456,-27.8029 -11.3455,-11.3455 -27.8028,-11.3455 -16.4573,0 -27.8029,11.3455 -11.3455,11.3456 -11.3455,27.8029 0,16.4573 11.3455,27.8028 11.3456,11.3456 27.8029,11.3456 z"
                    style="stroke-width:0.249352"
                />
                <g
                    transform="matrix(0.94877213,0,0,0.94877213,-205.27245,-229.01133)"
                >
                    <ellipse
                        style="fill-opacity:1;stroke-width:23.7131;stroke-dasharray:none"
                        cx="720.86206"
                        cy="-158.93512"
                        rx="29.005501"
                        ry="29.208336"
                    />
                    <rect
                        style="fill:none;fill-opacity:1;stroke-width:66.4108;stroke-dasharray:none"
                        width="212.63577"
                        height="212.06143"
                        x="468.04919"
                        y="176.31326"
                        ry="0"
                        rx="0"
                        transform="matrix(0.84250702,-0.53868537,0.8390338,0.54407929,0,0)"
                    />
                </g>
            </svg>
            Check Licitações <sup>BR</sup>
        </h1>
    </a>
    <div>
        <nav class="dark-theme" data-sveltekit-reload>
            <a href="/">Home</a>
            <a href="/contratos">Contratos</a>
        </nav>
        <button
            aria-label="Switch Theme"
            id="switch-theme-button"
            class="dark-theme"
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
                <path d="M12 2v2" />
                <path
                    d="M14.837 16.385a6 6 0 1 1-7.223-7.222c.624-.147.97.66.715 1.248a4 4 0 0 0 5.26 5.259c.589-.255 1.396.09 1.248.715"
                />
                <path d="M16 12a4 4 0 0 0-4-4" />
                <path d="m19 5-1.256 1.256" />
                <path d="M20 12h2" />
            </svg>
        </button>
    </div>
</header>

<main>
    <ContractsFilter bind:filters />
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
                        `/contratos_json?quantity=10&offset=1${10 * ++pageSelectorOffset}`,
                    );
                    ((await fetchedPage.json()) as TableContract[])
                        .filter(filterContract)
                        .forEach((newContract: TableContract) =>
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
    <div id="contract-list">
        {#each currentPage as contract}
            <InfoTile {contract} />
        {:else}
            <p id="empty-list">Nenhum contrato localmente</p>
        {/each}
    </div>
</main>

<style>
    header {
        display: flex;
        flex-flow: row nowrap;
        align-items: center;
        justify-content: space-between;
        height: 9dvh;
        width: 100%;

        background-image: linear-gradient(
            224deg,
            var(--primary-color),
            var(--secondary-color)
        );

        * {
            color: var(--dark-text-color);
        }

        a:has(h1) {
            display: contents;
            cursor: pointer;

            h1 {
                display: flex;
                align-items: flex-start;
                gap: 3px;

                svg {
                    height: 32px;
                    width: 32px;
                }
            }
        }

        div {
            display: flex;
            flex-flow: row nowrap;
            align-items: flex-end;

            nav {
                display: flex;
                font-weight: bold;
                font-size: 1.2rem;
                gap: 10px;
            }

            #switch-theme-button {
                margin: 0px 10px;
                border: none;
                background-color: transparent;

                &:hover svg {
                    fill: var(--accent-color);
                    stroke: var(--accent-color);
                }

                &:active svg {
                    fill: var(--accent-color-20);
                    stroke: var(--accent-color-20);
                }
            }
        }
    }

    main {
        display: flex;
        min-height: 91dvh;

        background-color: var(--background-10);
        box-shadow: 1px 2px 2px var(--dark-text-color);

        #contract-page-selector {
            display: flex;
            flex-flow: row nowrap;
            justify-content: space-evenly;
            padding-top: 5px;

            position: sticky;
            top: 32px;

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
            margin: auto;
            text-align: center;
        }
    }

    input[type="radio"] {
        display: none;
    }

    svg {
        height: 24px;
        width: 24px;
        stroke: var(--dark-text-color);
        fill: var(--dark-text-color);
    }

    @media (769px <= width <= 1440px) {
        main {
            flex-flow: column nowrap;

            #contract-list {
                width: 90%;
                margin: auto;
            }
        }
    }

    @media (481px <= width <= 768px) {
        header h1 {
            font-size: var(--subheading-size);
        }

        main {
            flex-flow: column nowrap;
        }
    }
</style>
