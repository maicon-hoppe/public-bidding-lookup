<script lang="ts">
    import { on } from "svelte/events";
    import { MediaQuery } from "svelte/reactivity";
    import { fly } from "svelte/transition";
    import LineChart from "$lib/components/LineChart.svelte";
    import DistributionChart from "$lib/components/DistributionChart.svelte";

    const { data } = $props();

    const mqDesktopScreen = new MediaQuery("(769px <= width <= 1440px)");
    const mqTabletScreen = new MediaQuery("(481px <= width <= 768px)");

    let headerVisible = $state(true);
    let mainElement: HTMLElement;
    $effect(() => {
        if (mqTabletScreen.current || mqDesktopScreen.current) {
            const handler = function (e: Event) {
                const scrollTarget = e.target as HTMLElement;
                headerVisible = !(scrollTarget.scrollTop >= 100);
            };
            const off = on(mainElement, "scroll", handler);

            mainElement.style.height = headerVisible ? "91dvh" : "100dvh";

            return off;
        }
    });

    let graphsCarrousel = $state<HTMLDivElement>();
    let carrouselScrollPosition: 0 | 740 = $state(0);
    $effect(() => {
        if (mqDesktopScreen.current && graphsCarrousel) {
            const scrollHandler = function () {
                carrouselScrollPosition =
                    graphsCarrousel!.scrollLeft >= graphsCarrousel!.offsetWidth
                        ? 740
                        : 0;
            };

            let scrollInterval: NodeJS.Timeout;
            const createInterval = function () {
                scrollInterval = setInterval(() => {
                    carrouselScrollPosition =
                        graphsCarrousel!.scrollLeft >=
                        graphsCarrousel!.offsetWidth
                            ? 0
                            : 740;
                }, 10000);
                graphsCarrousel!.scroll({
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
        expensesDistribution.map((dataPoint) => dataPoint.part),
    );
    const barChartValues = $derived(
        expensesDistribution.map((dataPoint) => dataPoint.quantity),
    );
</script>

{#if headerVisible}
    <header in:fly={{ y: "-9dvh", duration: 200 }}>
        <button>
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
        </button>
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
{/if}

<main bind:this={mainElement}>
    <section id="intro">
        <h2>Licitações</h2>
        <p>
            <dfn>Licitação</dfn> é o processo por meio do qual a Administração
            Pública contrata
            <strong class="colorful">obras</strong>, <strong class="colorful">serviços</strong>,
            <strong class="colorful">compras</strong>
            e <strong class="colorful">alienações</strong>. Em outras palavras, licitação é a
            forma como a Administração Pública pode comprar e vender.
        </p>
        <p>
            O governo forma um <dfn>contrato</dfn> como um acordo legal para a formação
            de vínculo e a estipulação de obrigações recíprocas.
        </p>
        <a href="/contratos" class="default-button big">Contratos</a>
    </section>
    <section id="graphs-carousel">
        <div id="graphs" bind:this={graphsCarrousel}>
            <LineChart labels={lineChartLabels} values={lineChartValues} />
            <DistributionChart
                labels={barChartLabels}
                values={barChartValues}
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
    </section>
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

        button:has(h1) {
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
                gap: 10px;
                font-weight: bold;
                font-size: 1.2rem;
            }

            #switch-theme-button {
                margin-left: 10px;
                margin-right: 10px;
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

        & > #intro {
            min-height: 41dvh;
            text-align: center;

            h2 {
                margin: var(--heading-space);
            }

            p {
                margin: 10px 25px 0px;

                color: var(--text-color-20);
                font-size: 1.2rem;
                text-indent: 15px;

                dfn {
                    font-style: normal;
                }
            }

            a {
                margin-top: 30px;
            }
        }

        & > #graphs-carousel {
            background-image: linear-gradient(
                45deg,
                var(--primary-color),
                var(--secondary-color)
            );

            #graphs {
                display: flex;
            }
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
            height: 91dvh;
            overflow-y: auto;
            scroll-snap-type: y proximity;

            #intro {
                min-height: 91dvh;
                padding: 22.5dvh 50px;
            }

            #graphs-carousel {
                min-height: 60dvh;
                width: 100%;
                margin-bottom: 20dvh;

                scroll-snap-align: center;

                #graphs {
                    flex-flow: row nowrap;
                    height: 95%;

                    overflow-x: auto;
                    scroll-snap-type: x mandatory;

                    scrollbar-width: none;
                    &::-webkit-scrollbar {
                        display: none;
                    }
                }

                #aside-scroll-dots {
                    display: inline;
                    height: 5%;

                    position: relative;
                    left: 50dvw;

                    color: var(--dark-text-color);

                    label:has(input:checked)::after {
                        content: "●";
                    }

                    label:not(:has(input:checked))::after {
                        content: "○";
                    }
                }
            }
        }
    }

    @media (481px <= width <= 768px) {
        header h1 { font-size: var(--subheading-size); }

        main {
            flex-flow: column nowrap;
            height: 100dvh;

            overflow-y: auto;
            scroll-snap-type: y mandatory;

            scrollbar-width: none;
            &::-webkit-scrollbar {
                display: none;
            }

            #intro {
                min-height: 91dvh;
                padding: 22.5dvh 50px;
                scroll-snap-align: end;
            }

            #graphs-carousel {
                padding: 5dvh 0px 5dvh;
                scroll-snap-align: start;

                #graphs {
                    flex-flow: column nowrap;
                }
            }
        }
    }
</style>
