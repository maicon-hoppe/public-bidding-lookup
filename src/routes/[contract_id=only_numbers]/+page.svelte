<script lang="ts">
    import {
        BRLCurrencyFormatter as BRLCurrency,
        BRLDateFormatter as BRLDate,
        niFormatter,
    } from "$lib/utils";
    import { onMount } from "svelte";

    const { data } = $props();

    let complementaryInfo: HTMLDListElement;
    onMount(() => {
        complementaryInfo.hidden =
            data.contract.informacoesComplementares !== null ||
            data.contract.informacoesComplementares !== "";
    });

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

<header class="dark-theme">
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
        <div id="title-display">
            <h2>{data.contract.nomeTipo}</h2>
            <h3>{data.contract.nomeCategoria}</h3>
            <hr />
            <span>
                <strong>
                    {BRLDate.format(data.contract.dataVigenciaInicial)}
                </strong>
                à
                <strong>
                    {BRLDate.format(data.contract.dataVigenciaFinal)}
                </strong>
            </span>
        </div>
        <dl id="money-display">
            <dt class="dark-theme">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 -960 960 960"
                >
                    <path
                        d="M444-200h70v-50q50-9 86-39t36-89q0-42-24-77t-96-61q-60-20-83-35t-23-41q0-26 18.5-41t53.5-15q32 0 50 15.5t26 38.5l64-26q-11-35-40.5-61T516-710v-50h-70v50q-50 11-78 44t-28 74q0 47 27.5 76t86.5 50q63 23 87.5 41t24.5 47q0 33-23.5 48.5T486-314q-33 0-58.5-20.5T390-396l-66 26q14 48 43.5 77.5T444-252v52Zm36 120q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"
                    />
                </svg>
                Valor Global
            </dt>
            <dd>{BRLCurrency.format(+data.contract.valorGlobal)}</dd>
        </dl>
        <dl id="info-display">
            <dt>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 -960 960 960"
                >
                    <path
                        d="M440-183v-274L200-596v274l240 139Zm80 0 240-139v-274L520-457v274Zm-40-343 237-137-237-137-237 137 237 137ZM160-252q-19-11-29.5-29T120-321v-318q0-22 10.5-40t29.5-29l280-161q19-11 40-11t40 11l280 161q19 11 29.5 29t10.5 40v318q0 22-10.5 40T800-252L520-91q-19 11-40 11t-40-11L160-252Zm320-228Z"
                    />
                </svg>
                Orgão Responsável:
            </dt>
            <dd>{data.contract.nomeOrgao}</dd>

            <dt>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 -960 960 960"
                >
                    <path
                        d="M440-183v-274L200-596v274l240 139Zm80 0 240-139v-274L520-457v274Zm-40-343 237-137-237-137-237 137 237 137ZM160-252q-19-11-29.5-29T120-321v-318q0-22 10.5-40t29.5-29l280-161q19-11 40-11t40 11l280 161q19 11 29.5 29t10.5 40v318q0 22-10.5 40T800-252L520-91q-19 11-40 11t-40-11L160-252Zm320-228Z"
                    />
                </svg>
                Unidade Gestora:
            </dt>
            <dd>{data.contract.nomeUnidadeGestora}</dd>

            <dt id="supplier">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 -960 960 960"
                >
                    <path
                        d="M664-121q-8-2-15-7l-120-70q-14-8-21.5-21.5T500-249v-141q0-16 7.5-29.5T529-441l120-70q7-5 15-7t16-2q8 0 15.5 2.5T710-511l120 70q14 8 22 21.5t8 29.5v141q0 16-8 29.5T830-198l-120 70q-7 4-14.5 6.5T680-119q-8 0-16-2ZM287-527q-47-47-47-113t47-113q47-47 113-47t113 47q47 47 47 113t-47 113q-47 47-113 47t-113-47ZM80-160v-112q0-33 17-62t47-44q51-26 115-44t141-18h14q6 0 12 2-8 18-13.5 37.5T404-360h-4q-71 0-127.5 18T180-306q-9 5-14.5 14t-5.5 20v32h252q6 21 16 41.5t22 38.5H80Zm376.5-423.5Q480-607 480-640t-23.5-56.5Q433-720 400-720t-56.5 23.5Q320-673 320-640t23.5 56.5Q367-560 400-560t56.5-23.5ZM400-640Zm12 400Zm174-166 94 55 94-55-94-54-94 54Zm124 208 90-52v-110l-90 53v109Zm-150-52 90 53v-109l-90-53v109Z"
                    />
                </svg>
                Fornecedor ({data.contract.niFornecedor
                    ? niFormatter(data.contract.niFornecedor)
                    : "N/A"}):
            </dt>
            <dd>{data.contract.nomeRazaoSocialFornecedor ?? "N/A"}</dd>

            <dt>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 -960 960 960"
                >
                    <path
                        d="M160-200h80v-320h480v320h80v-426L480-754 160-626v426Zm-80 80v-560l400-160 400 160v560H640v-320H320v320H80Zm280 0v-80h80v80h-80Zm80-120v-80h80v80h-80Zm80 120v-80h80v80h-80ZM240-520h480-480Z"
                    />
                </svg>
                Unidade Compradora:
            </dt>
            <dd>{data.contract.nomeUnidadeRealizadoraCompra}</dd>
        </dl>

        <dl hidden bind:this={complementaryInfo} id="complementary-info">
            <dt>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 -960 960 960"
                >
                    <path
                        d="M423.5-703.5Q400-727 400-760t23.5-56.5Q447-840 480-840t56.5 23.5Q560-793 560-760t-23.5 56.5Q513-680 480-680t-56.5-23.5ZM420-120v-480h120v480H420Z"
                    />
                </svg>
                Informações Complementares:
            </dt>
            <dd>{data.contract.informacoesComplementares || "N/A"}</dd>
        </dl>
        <dl id="modalidade">
            <dt>{data.contract.nomeModalidadeCompra}</dt>
            <dd>{describePurchaseMethod()}</dd>
        </dl>
    </section>
    <hr />
    <p id="objeto">
        {data.contract.objeto}
    </p>
    <div id="table-container">
        <table>
            <thead>
                <tr>
                    <th scope="colgroup" colspan="5">Despesas</th>
                </tr>
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
                        <td class="qualitative-info">
                            {contract_item.descricaoIitem}
                        </td>
                        <td>
                            {BRLCurrency.format(
                                +contract_item.valorUnitarioItem,
                            )}
                        </td>
                        <td class="qualitative-info">{contract_item.poder}</td>
                        <td class="qualitative-info">{contract_item.esfera}</td>
                    </tr>
                {/each}
            </tbody>
        </table>
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
        & > section#contract-summary {
            display: grid;
            align-items: center;
            grid-template:
                "a . b" auto
                "c c d" auto
                "c c d" auto
                "e e e" auto / 1fr 1fr 1fr;

            gap: 10px;
            padding: 10px;
            color: var(--dark-text-color-20);

            background-image: repeating-linear-gradient(
                277deg,
                var(--primary-color),
                var(--secondary-color)
            );

            dt {
                color: var(--dark-accent-color);
                font-weight: bold;

                svg {
                    height: var(--text-size);
                    width: var(--text-size);

                    fill: var(--dark-text-color);
                    stroke: var(--dark-text-color);
                }
            }

            dd {
                margin-left: calc(24px + 1rem);
            }

            #title-display {
                grid-area: a;
                margin-bottom: 5px;
                color: var(--dark-text-color);

                h3 {
                    margin-bottom: var(--text-space);
                    font-size: var(--subheading-size);
                    font-weight: normal;
                }

                hr {
                    border-color: var(--dark-text-color);
                }

                span {
                    font-size: var(--subtext-size);
                }
            }

            #money-display {
                grid-area: b;
                justify-self: right;
                margin-right: 10px;

                border-radius: var(--default-bradius);
                background-color: var(--background-20);

                dt,
                dd {
                    padding: 5px;
                    color: var(--text-color);
                }

                dt {
                    border-bottom: 1px solid var(--text-color-20);
                    border-top-left-radius: var(--default-bradius);
                    border-top-right-radius: var(--default-bradius);

                    text-align: center;

                    color: var(--text-color);
                    background-color: var(--primary-color-20);
                }
            }

            #info-display {
                grid-area: c;

                dt {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    margin: 5px 0px 3px;
                    font-weight: bold;

                    &#supplier {
                        margin-top: 15px;
                    }
                }
            }

            #complementary-info {
                grid-area: d;
                padding: 10px;
                border: 1px solid var(--text-color-20);
                border-radius: var(--default-bradius);
            }

            #modalidade {
                grid-area: e;
                margin-top: 15px;

                dt {
                    font-weight: bold;
                }

                dd {
                    margin-left: unset;
                    text-indent: calc(24px + 1rem);
                }
            }
        }

        section#contract-summary + hr {
            width: 8dvw;
            margin: 20px auto 30px;
        }

        #objeto {
            margin: 10px 10px 30px;
        }

        table {
            width: 96dvw;
            margin: 10px auto;
            border-collapse: collapse;
            border-radius: var(--default-bradius);
            outline: 1px solid var(--text-color-20);

            thead {
                background-color: var(--background-10);

                th {
                    border-bottom: 1px solid var(--text-color-20);

                    &:not(:last-child) {
                        border-right: 1px solid var(--text-color-20);
                    }
                }
            }

            tbody > tr {
                color: var(--text-color-20);

                &:nth-child(even) {
                    background-color: var(--background-20);
                }

                & > td.qualitative-info {
                    text-align: center;
                }

                & > td:not(:last-child) {
                    border-right: 1px solid currentColor;
                }

                & > td:where(:first-child, :nth-child(3n)) {
                    text-align: right;
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
        stroke: var(--text-color);
        fill: var(--text-color);
    }

    @media (481px <= width <= 768px) {
        header h1 {
            font-size: var(--subheading-size);
        }

        main > #table-container {
            overflow-x: auto;
        }
    }
</style>
