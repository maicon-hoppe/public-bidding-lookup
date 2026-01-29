<script lang="ts">
    import { BRLCurrencyFormatter as BRLCurrency, niFormatter } from "$lib/utils";
    import type { TableContract } from "$lib/types";
    import Tooltip from "$lib/components/Tooltip.svelte";

    const { contract }: { contract: TableContract } = $props();

    const describePurchaseMethod = function()
    {
        switch (contract.nomeModalidadeCompra) {
            case "Pregão":
                return `
                    Modalidade de licitação para bens e serviços comuns — padronizados, como
                    material de escritório, combustíveis, serviços de limpeza/vigilância, ou
                    serviços comuns de engenharia —, focada em menor preço ou maior desconto,
                    com disputa via lances sucessivos (geralmente eletrônicos), visando
                    agilidade e economia para a Administração Pública.
                `;
        
            case "Dispensa":
                return "CARMO";
            
            case "Concorrência":
                return "NANINO";

            case "Inexigibilidade":
                return "KIKI";

            case "Não se Aplica":
                return "Não há contexto";

            default:
                return "Sem descrição"
        };
    }
</script>

<a href="/{contract.id}" rel="next">
    <section>
        <header>
            <h3 title="{contract.nomeUnidadeRealizadoraCompra}">
                {contract.nomeUnidadeRealizadoraCompra}
            </h3>
            <p id="total_price">{BRLCurrency.format(+(contract.valorGlobal))}</p>
        </header>
        <main>
            <div id="catmod">
                <Tooltip content="FOO">
                    <dl>
                        <dt>Categoria</dt>
                        <dd>{contract.nomeCategoria}</dd>
                    </dl>
                </Tooltip>
                <Tooltip content={describePurchaseMethod()}>
                    <dl>
                        <dt>Modalidade</dt>
                        <dd>{contract.nomeModalidadeCompra}</dd>
                    </dl>
                </Tooltip>
            </div>
            <div>
                <dl>
                    <dt>Unidade Gestora</dt>
                    <dd>{contract.nomeUnidadeGestora}</dd>
                </dl>
            </div>
            <div>
                <dl>
                    <dt>Fornecedor</dt>
                    <dd>{contract.nomeRazaoSocialFornecedor ?? "N/A"}</dd>
                    <br>
                    <dt>Ni Fornecedor</dt>
                    <dd>{contract.niFornecedor ? niFormatter(contract.niFornecedor) : "N/A"}</dd>
                </dl>
            </div>
            <hr>
            <p>{contract.objeto}</p>
        </main>
    </section>
</a>

<style>
    a {
        text-decoration: none;

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
                    text-decoration: underline;
                    overflow: hidden;
                }

                h3:hover { color: var(--accent-color) }

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

                div { margin-bottom: 10px; }

                #catmod {
                    display: flex;
                    justify-content: space-between;
                }

                dl {
                    display: inline-block;

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
    }

    a:hover { color: var(--text-color) }
</style>