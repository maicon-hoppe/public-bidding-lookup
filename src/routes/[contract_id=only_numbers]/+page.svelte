<script lang="ts">
    import {
        BRLCurrencyFormatter as BRLCurrency,
        BRLDateFormatter as BRLDate,
        niFormatter,
    } from "$lib/utils";

    const { data } = $props();

    const describePurchaseMethod = function () {
        switch (data.contract.nomeModalidadeCompra) {
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
            Despesas Públicas
        </h1>
    </a>
    <div>
        <nav data-sveltekit-reload>
            <a href="/">Home</a>
            <a href="/contratos">Contratos</a>
        </nav>
        <button
            aria-label="Switch Theme"
            id="switch-theme-button"
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
    <section id="contract-summary">
        <span id="top-row">
            <dl id="money-display" class="light-theme">
                <dt>Valor Global</dt>
                <dd>{BRLCurrency.format(+data.contract.valorGlobal)}</dd>
            </dl>
            <section id="date-display">
                <dl>
                    <dt>Vigência Inicial:</dt>
                    <dd>{BRLDate.format(data.contract.dataVigenciaInicial)}</dd>
                </dl>
                <dl>
                    <dt>Vigência Final:</dt>
                    <dd>{BRLDate.format(data.contract.dataVigenciaFinal)}</dd>
                </dl>
            </section>
        </span>
        <dl id="info-display">
            <dt>Orgão Responsável:</dt>
            <dd>{data.contract.nomeOrgao}</dd>

            <dt>Unidade Gestora:</dt>
            <dd>{data.contract.nomeUnidadeGestora}</dd>

            <dt>Fornecedor:</dt>
            <dd>{data.contract.nomeRazaoSocialFornecedor ?? "N/A"}</dd>

            <dt>NI Fornecedor:</dt>
            <dd>{data.contract.niFornecedor ? niFormatter(data.contract.niFornecedor) : "N/A"}</dd>

            <dt>Unidade Compradora:</dt>
            <dd>{data.contract.nomeUnidadeRealizadoraCompra}</dd>

            <dt>Categoria:</dt>
            <dd>{data.contract.nomeCategoria}</dd>

            <dt>Tipo:</dt>
            <dd>{data.contract.nomeTipo}</dd>

            <dt>Informações Complementares:</dt>
            <dd>{data.contract.informacoesComplementares || "N/A"}</dd>
        </dl>
        <section id="objeto">
            {data.contract.objeto}
        </section>
        <dl id="modalidade">
            <dt>{data.contract.nomeModalidadeCompra}</dt>
            <dd>{describePurchaseMethod()}</dd>
        </dl>
    </section>

    <table>
        <thead>
            <tr>
                <th scope="col">Quantidade</th>
                <th scope="col">Descrição</th>
                <th scope="col">Valor Unitário</th>
                <th scope="col">Poder</th>
                <th scope="col">Esfera</th>
            </tr>
        </thead>
        <tbody>
            {#each data.contract_items as contract_item}
                <tr>
                    <td>{contract_item.quantidadeItem}</td>
                    <td>{contract_item.descricaoIitem}</td>
                    <td
                        >{BRLCurrency.format(
                            +contract_item.valorUnitarioItem,
                        )}</td
                    >
                    <td>{contract_item.poder}</td>
                    <td>{contract_item.esfera}</td>
                </tr>
            {/each}
        </tbody>
    </table>
</main>

<style>
    header {
        display: flex;
        flex-flow: row wrap;
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
            color: var(--light-text-color);
        }

        a:has(h1) {
            display: contents;
            cursor: pointer;

            h1 {
                display: flex;
                align-items: center;
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
            }
        }
    }

    main {
        & > section#contract-summary {
            display: grid;
            grid-template:
                "a a c" auto
                "b b c" auto
                "b b c" auto
                "d d d" auto / 1fr 1fr 1fr;

            gap: 10px;
            margin: 20px auto;
            color: var(--text-color-20);

            dt {
                font-weight: bold;
            }

            dd {
                text-indent: 1rem;
            }

            #top-row {
                grid-area: a;
                display: flex;
                flex-flow: row nowrap;
                align-items: center;
                gap: 10%;

                #money-display {
                    flex: 0.5 1 20%;
                    /* width: max-content; */
                    /* margin: 10px; */

                    border: 1px solid grey;
                    border-radius: var(--default-bradius);
                    background-color: var(--background-10);

                    dt,
                    dd {
                        padding: 5px;
                        color: var(--text-color);
                    }

                    dt {
                        border-bottom: 1px solid gray;
                        text-align: center;
                    }

                    dd {
                        color: var(--accent-color);
                    }
                }

                #date-display {
                    flex: 1.5 1 80%;

                    dl {
                        display: inline-block;
                        margin: 10px;
                    }
                }
            }

            #info-display {
                grid-area: b;

                dt {
                    margin-top: 5px;
                    font-weight: bold;
                }
            }

            #objeto {
                grid-area: c;
                text-wrap-style: balance;
            }

            #modalidade {
                grid-area: d;

                dt {
                    font-weight: bold;
                }
            }
        }

        table {
            width: 96dvw;
            margin: 5px auto;
            border-collapse: collapse;
            border-radius: var(--default-bradius);
            outline: 1px solid var(--text-color-20);

            thead {
                border-bottom: 1px solid var(--text-color-20);
                background-color: var(--background-20);

                th:not(:last-child) {
                    border-right: 1px solid var(--text-color-20);
                }
            }

            tbody > tr {
                color: var(--text-color-20);

                & > td:not(:last-child) {
                    border-right: 1px solid currentColor;
                }

                & > :where(:first-child, :nth-child(3n)) {
                    text-align: right;
                }

                &:nth-child(even) {
                    background-color: var(--background-10);
                }
            }

            td,
            th {
                padding: 8px;
            }
        }
    }

    svg {
        height: 24px;
        width: 24px;
        stroke: var(--light-text-color);
        fill: var(--light-text-color);
    }
</style>
