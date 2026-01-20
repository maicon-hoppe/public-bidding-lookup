<script lang="ts">
    import InfoTile from "$lib/components/InfoTile.svelte";
    import { Chart } from "chart.js";

    const { data } = $props();

    let page_start = $state(0);
    let page_end = $state(9);
    const contracts = $derived(data.contracts);
    const current_page = $derived(contracts.slice(page_start, page_end));
</script>

<header>
    <h1>Contratos</h1>
    <button onclick={() => { document.body.classList.toggle("light-theme") }}>Fundo</button>
</header>
<hr>

<main>
    <aside>
        <div id="graph1">foo</div>
        <div id="graph2">bar</div>
    </aside>
    <section>
        <div id="search-filter">
            Filtros: categoria, modalidade, fornecedor?, unidade_compradora?
        </div>
        <div id="contract-page-selector">
            {#each { length: 10 }, page}
                <label for="page{page+1}">{page+1}</label>
                {#if page == 0}
                    <input checked
                        type="radio" name="page" id="page{page+1}"
                        onclick={() => { page_start = 0+10*page; page_end = 9+10*page; }}
                    >
                {:else}
                    <input
                        type="radio" name="page" id="page{page+1}"
                        onclick={() => { page_start = 0+10*page; page_end = 9+10*page; }}
                    >
                {/if}
            {/each}
            <label for="next_page">>></label>
            <input
                type="radio" name="page" id="next_page"
            >
        </div>
        <div id="contract-list">
            {#each current_page as contract}
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
        max-width: fit-content;
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

        & > aside > :where(#graph1, #graph2) {
            margin: 5px;
            border: 1px solid var(--text-color);
            background-color: var(--background-10);
            box-shadow: 1px 2px 2px var(--dark-text-color);
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

                #graph1, #graph2 {
                    height: 40dvh;
                }
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

            aside > :where(#graph1, #graph2) {
                display: inline-block;
                width: 46dvw;
            }

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