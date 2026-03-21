<script lang="ts">
    import { MediaQuery } from "svelte/reactivity";
    import {
        BRLCurrencyFormatter as BRLCurrency,
        niFormatter,
    } from "$lib/utils";
    import type { TableContract } from "$lib/types";
    import Tooltip from "$lib/components/Tooltip.svelte";

    const { contract }: { contract: TableContract } = $props();

    const mqMobileScreen = new MediaQuery("(320px <= width <= 480px)");

    const describePurchaseMethod = function () {
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
                return `
                    Nas hipóteses de dispensa de licitação, admite-se que a Administração
                    contrate diretamente, ainda que seja viável a competição. Isso acontece
                    em casos em que o procedimento licitatório não é a solução mais adequada
                    para atender ao interesse público, o art. 75 da Lei 14.133/2021 lista
                    todas as hipóteses em que a licitação pode ser dispensada — alguns
                    exemplos são casos de baixo valor, que não justificam o tempo e o gasto
                    necessários, emergências/calamidades ou licitações desertas/fracassadas.
                `;

            case "Concorrência":
                return `
                    Modalidade de licitação para contratação de bens e serviços especiais e
                    de obras e serviços comuns e especiais de engenharia, sendo utilizada
                    para contratações de maior valor ou complexidade, cujo critério de
                    julgamento poderá ser menor preço, melhor técnica ou conteúdo artístico,
                    técnica e preço, maior retorno econômico ou maior desconto, e onde a
                    disputa entre interessados ocorre preferencialmente de maneira fechada,
                    para encontrar a proposta mais vantajosa para a Administração Pública.
                `;

            case "Inexigibilidade":
                return `
                    Situação legal em que a Administração Pública pode realizar a ontratação
                    direta de bens e serviços porque a competição é inviável, seja por só
                    existir um fornecedor ou representante comercial qualificado, ou pela
                    natureza do objeto do contrato necessitar de exclusividade. Essa
                    modalidade possui requisitos a serem seguidos e exige justificativa e
                    comprovação para evitar abusos.
                `;

            case "Não se Aplica":
                return "Nenhama forma de modalidade se aplica a essa contratação.";

            default:
                return "Sem descrição";
        }
    };
</script>

<a href="/{contract.id}" rel="next">
    <section>
        {#if mqMobileScreen.current}
            <h3 title={contract.nomeUnidadeRealizadoraCompra}>
                {contract.nomeUnidadeRealizadoraCompra}
            </h3>
            <p id="total_price">
                {BRLCurrency.format(+contract.valorGlobal)}
            </p>
        {:else}
            <header>
                <h3 title={contract.nomeUnidadeRealizadoraCompra}>
                    {contract.nomeUnidadeRealizadoraCompra}
                </h3>
                <p id="total_price">
                    {BRLCurrency.format(+contract.valorGlobal)}
                </p>
            </header>
        {/if}
        <main>
            <div id="catmod">
                <dl>
                    <dt>Categoria</dt>
                    <dd>{contract.nomeCategoria}</dd>
                </dl>
                {#if mqMobileScreen.current}
                    <dl>
                        <dt>Modalidade</dt>
                        <dd>{contract.nomeModalidadeCompra}</dd>
                    </dl>
                {:else}
                    <Tooltip content={describePurchaseMethod()}>
                        <dl>
                            <dt>Modalidade</dt>
                            <dd>{contract.nomeModalidadeCompra}</dd>
                        </dl>
                    </Tooltip>
                {/if}
            </div>
            <div>
                <dl>
                    <dt>Unidade Gestora</dt>
                    <dd>{contract.nomeUnidadeGestora}</dd>
                </dl>
            </div>
            <div>
                <dl>
                    {#if mqMobileScreen.current}
                        <dt>
                            <span>Fornecedor</span>
                            <span>
                                ({contract.niFornecedor
                                    ? niFormatter(contract.niFornecedor)
                                    : "N/A"})
                            </span>
                        </dt>
                        <dd>{contract.nomeRazaoSocialFornecedor ?? "N/A"}</dd>
                    {:else}
                        <dt>Fornecedor</dt>
                        <dd>{contract.nomeRazaoSocialFornecedor ?? "N/A"}</dd>
                        <br />
                        <dt>Ni Fornecedor</dt>
                        <dd>
                            {contract.niFornecedor
                                ? niFormatter(contract.niFornecedor)
                                : "N/A"}
                        </dd>
                    {/if}
                </dl>
            </div>
            {#if !mqMobileScreen.current}
                <hr />
                <p>{contract.objeto}</p>
            {/if}
        </main>
    </section>
</a>

<style>
    a {
        text-decoration: none;

        section {
            padding: 5px;
            margin: 10px;
            border-radius: var(--default-bradius);
            background-color: var(--background-20);
            box-shadow: 1px 1px 1px var(--light-text-color);

            &:hover {
                padding: 4px;
                border: 1px solid var(--accent-color);
                box-shadow: 1px 1px 3px var(--light-text-color);
            }

            &:active {
                padding: 4px;
                border: 1px solid var(--accent-color-20);
            }

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

                h3:hover {
                    color: var(--accent-color);
                }

                h3:active {
                    color: var(--accent-color-20);
                }

                #total_price {
                    padding: 5px 8px;
                    border-radius: 50px;
                    font-weight: bold;

                    color: var(--dark-text-color);
                    background-color: var(--secondary-color);
                }
            }

            main {
                margin: 0px 15px 10px;

                div {
                    margin-bottom: 10px;
                }

                #catmod {
                    display: flex;
                    flex-flow: row wrap;
                    justify-content: space-between;
                }

                dl {
                    display: inline-block;

                    dt,
                    dd {
                        display: inline;
                        color: var(--text-color-20);
                    }

                    dt {
                        font-weight: bold;

                        &::after {
                            content: ":";
                        }
                    }
                }

                p {
                    margin-top: 10px;
                    color: var(--text-color-20);
                }
            }
        }

        section:focus-visible {
            border: 1px solid var(--accent-color);
            outline: 2px solid var(--accent-color);
        }
    }

    a:hover {
        color: var(--text-color);
    }

    @media (320px <= width <= 480px) {
        a > section {
            &:hover {
                padding: 5px;
                border: none;
                box-shadow: unset;
            }

            &:active {
                padding: 4px;
                border: 1px solid var(--accent-color);
                box-shadow: 1px 1px 3px var(--light-text-color);
            }

            h3 {
                margin: 10px;
                text-wrap: nowrap;
                text-overflow: ellipsis;
                text-decoration: underline;
                overflow: hidden;
            }

            h3:active {
                color: var(--accent-color);
            }

            #total_price {
                padding: 5px 8px;
                margin: 5px 15px;
                border-radius: 50px;
                font-weight: bold;
                text-align: center;

                color: var(--dark-text-color);
                background-color: var(--secondary-color);
            }

            main {
                dl {
                    dt,
                    dd {
                        display: block;
                    }

                    dt {
                        &::after {
                            content: "";
                        }

                        span {
                            display: inline-block;
                        }
                    }

                    dd {
                        text-indent: var(--subtext-size);
                    }
                }
            }
        }
    }
</style>
