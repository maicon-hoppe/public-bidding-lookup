<script lang="ts">
    import {
        Chart,
        Title,
        Tooltip,
        Legend,
        CategoryScale,
        LinearScale,
        LineController,
        PointElement,
        LineElement,
    } from "chart.js";
    import { getRelativePosition } from "chart.js/helpers";
    import { onMount } from "svelte";
    import { MediaQuery, SvelteDate } from "svelte/reactivity";
    import { BRLCurrencyFormatter, BRLDateFormatter } from "$lib/utils";
    import type { ChartData, ChartConfiguration, Point } from "chart.js";

    let {
        labels,
        values,
        selected = $bindable(),
    }: { labels: string[]; values: Point[]; selected: string } = $props();

    Chart.register(
        CategoryScale,
        LinearScale,
        LineController,
        PointElement,
        LineElement,
        Title,
        Tooltip,
        Legend,
    );

    const chartData: ChartData<"line"> = $derived({
        labels: labels,
        datasets: [
            {
                label: "Gastos totais",
                data: values,
            },
        ],
    });

    const mqTabletScreen = new MediaQuery("(481px <= width <= 768px)");
    const mqDesktopScreen = new MediaQuery("(769px <= width <= 1440px)");
    const mqDarkTheme = new MediaQuery("(prefers-color-scheme: dark)");

    let chartCanvas: HTMLCanvasElement;
    let chart: Chart<"line">;
    onMount(() => {
        const systemColors = {
            text: mqDarkTheme.current ? "hsl(0 0 90)" : "hsl(0 0 10)",
            accent: mqDarkTheme.current
                ? "hsl(37, 100%, 64%)"
                : "hsl(37, 100%, 34%)",
        };

        const thisMonth = new SvelteDate().toLocaleDateString("pt-BR", {
            month: "long",
        });
        const chartConfig: ChartConfiguration<"line"> = {
            type: "line",
            data: chartData,
            options: {
                maintainAspectRatio: false,
                elements: {
                    line: {
                        borderColor: systemColors.accent,
                    },
                    point: {
                        backgroundColor: systemColors.accent,
                    },
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: "Dia",
                            color: systemColors.text,
                        },
                        ticks: {
                            color: systemColors.text,
                            maxTicksLimit: 8,
                        },
                        grid: { display: false },
                    },
                    y: {
                        title: {
                            display: true,
                            text: "Despesas",
                            color: systemColors.text,
                        },
                        ticks: {
                            color: systemColors.text,
                            stepSize: 50_000_000,
                            callback: function (value) {
                                if (typeof value === "number") {
                                    const formatted =
                                        BRLCurrencyFormatter.formatToParts(
                                            value,
                                        )
                                            .slice(0, 3)
                                            .map(({ type, value }) => value)
                                            .join("");

                                    return value === 0
                                        ? formatted
                                        : formatted + " M";
                                }

                                return value;
                            },
                        },
                        grid: {
                            color: systemColors.text,
                        },
                    },
                },
                interaction: {
                    mode: "x",
                    intersect: true,
                },
                onClick: (e) => {
                    const canvasPosition = getRelativePosition(e, chart);
                    selected = chart.scales.x
                        .getLabelForValue(
                            chart.scales.x.getValueForPixel(canvasPosition.x)!,
                        )
                        .split("/")
                        .toReversed()
                        .join("-");
                },
                plugins: {
                    title: {
                        display: true,
                        text: `DESPESAS DIÁRIAS EM CONTRATOS VIGENTES (${thisMonth.toUpperCase()})`,
                        color: systemColors.text,
                    },
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            title: function (context) {
                                const correctDate = new Date(
                                    context[0].label
                                        .split("/")
                                        .toReversed()
                                        .join("-"),
                                );
                                correctDate.setUTCHours(3);

                                return BRLDateFormatter.format(correctDate);
                            },
                            label: function (context) {
                                let label = context.dataset.label ?? "";

                                if (label) {
                                    label += ": ";
                                }
                                if (context.parsed.y) {
                                    label += BRLCurrencyFormatter.format(
                                        context.parsed.y,
                                    );
                                } else {
                                    label = "N/A";
                                }
                                return label;
                            },
                        },
                    },
                },
            },
        };

        chart = new Chart(chartCanvas, chartConfig);

        const textColor = mqDarkTheme.current ? "hsl(0 0 90)" : "hsl(0 0 10)";
        const accentColor = mqDarkTheme.current
            ? "hsl(37, 100%, 64%)"
            : "hsl(37, 100%, 34%)";

        chart.options.elements!.line!.borderColor = accentColor;
        chart.options.elements!.point!.backgroundColor = accentColor;

        chart.options.scales!.x!.title!.color = textColor;
        chart.options.scales!.y!.title!.color = textColor;
        chart.options.scales!.x!.ticks!.color = textColor;
        chart.options.scales!.y!.ticks!.color = textColor;
        chart.options.scales!.y!.grid!.color = textColor;

        chart.options.plugins!.title!.color = textColor;

        const observerCallback: MutationCallback = function (
            mutationList,
            observer,
        ) {
            let textColor;
            let accentColor;
            for (const mutation of mutationList) {
                const element = mutation.target as HTMLElement;
                if (element.classList.contains("dark-theme")) {
                    textColor = "hsl(0 0 90)";
                    accentColor = "hsl(37, 100%, 64%)";
                } else if (element.classList.contains("light-theme")) {
                    textColor = "hsl(0 0 10)";
                    accentColor = "hsl(37, 100%, 34%)";
                } else {
                    textColor = systemColors.text;
                    accentColor = systemColors.accent;
                }
            }

            chart.options.elements!.line!.borderColor = accentColor;
            chart.options.elements!.point!.backgroundColor = accentColor;

            chart.options.scales!.x!.title!.color = textColor;
            chart.options.scales!.y!.title!.color = textColor;
            chart.options.scales!.x!.ticks!.color = textColor;
            chart.options.scales!.y!.ticks!.color = textColor;
            chart.options.scales!.y!.grid!.color = textColor;

            chart.options.plugins!.title!.color = textColor;

            chart.update();
        };
        const observer = new MutationObserver(observerCallback);
        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ["class"],
            attributeOldValue: true,
        });

        return function () {
            observer.disconnect();
            chart.destroy();
        };
    });
</script>

<div id="chart-box">
    <canvas id="graph" bind:this={chartCanvas}></canvas>
</div>

<style>
    #chart-box {
        /* border: 1px solid var(--text-color); */
        border-radius: var(--default-bradius);
        background-color: var(--background-10);
        box-shadow: 1px 2px 2px var(--dark-text-color);
    }

    @media (769px <= width <= 1440px) {
        #chart-box {
            height: 80%;
            min-width: 90%;
            margin: auto 5%;
            border: none;
            scroll-snap-align: center;
        }
    }

    @media (481px <= width <= 768px) {
        #chart-box {
            height: 43dvh;
            width: 95%;
            margin: 1dvh auto;
        }
    }
</style>
