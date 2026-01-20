<script lang="ts">
    import { BRLCurrencyFormatter as BRLCurrency, niFormatter } from "$lib/utils";
    import type { TableContract } from "$lib/types";

    const { contract }: { contract: TableContract } = $props();
    const contract_entries = $derived(Object.entries(contract));
</script>

<section>
    <header>
        <h3><a href="/{contract.id}" rel="next" title="{contract.nomeUnidadeRealizadoraCompra}">{contract.nomeUnidadeRealizadoraCompra}</a></h3>
        <p id="total_price">{BRLCurrency.format(+(contract.valorGlobal))}</p>
    </header>
    <main>
        <div id="catmod">
            <dl>
                <dt>Categoria</dt>
                <dd>{contract.nomeCategoria}</dd>
            </dl>
            <dl>
                <dt>Modalidade</dt>
                <dd>{contract.nomeModalidadeCompra}</dd>
            </dl>
        </div>
        <div>
            <dl>
                <dt>Unidade Gestora</dt>
                <dd>{contract.nomeUnidadeGestora}</dd>
            </dl>
        </div>
        <dl>
            <dt>Fornecedor</dt>
            <dd>{contract.nomeRazaoSocialFornecedor ?? "N/A"}</dd>
            <br>
            <dt>Ni Fornecedor</dt>
            <dd>{contract.niFornecedor ? niFormatter(contract.niFornecedor) : "N/A"}</dd>
        </dl>
        <hr>
        <p>{contract.objeto}</p>
    </main>
</section>

<style>
    section {
        margin: 5px;
        border: 1px solid var(--text-color);
        border-radius: var(--default-bradius);
        background-color: var(--background-20);
        box-shadow: 1px 2px 2px var(--dark-text-color);

        header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: nowrap;

            margin: var(--heading-space);
    
            h3 {
                text-wrap: nowrap;
                text-overflow: ellipsis;
                overflow: hidden;
            }

            #total_price {
                padding: 5px 8px;
                border-radius: 50px;
                font-weight: bold;

                color: var(--light-text-color);
                background-color: var(--secondary-color);
            }
        }

        main {
            margin: 0px 15px 10px;

            #catmod {
                display: flex;
                justify-content: space-between;
            }

            dl {
                margin-bottom: 10px;

                dt, dd { display: inline; }

                dt {
                    font-weight: bold;
                
                    &::after {
                        content: ":";
                    }
                }
            }

            p { margin-top: 10px; }
        }
    }

    section:hover {
        border: 1px solid var(--accent-color);
        box-shadow: 1px 1px 1px var(--dark-text-color);
    }

    section:focus-visible {
        border: 1px solid var(--accent-color);
        outline: 2px solid var(--accent-color);
    }
</style>