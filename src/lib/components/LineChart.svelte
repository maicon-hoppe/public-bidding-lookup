<script lang="ts">
    import { BRLCurrencyFormatter, BRLDateFormatter } from "$lib/utils";
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
    import { onMount } from "svelte";
    import type { ChartData, ChartConfiguration, Point } from "chart.js";

    const { labels, values }: { labels: string[]; values: Point[] } = $props();

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

    let chartCanvas: HTMLCanvasElement;
    let chart: Chart<"line">;
    onMount(() => {
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        const systemColors = {
            text: mq.matches ? "hsl(0 0 90)" : "hsl(0 0 10)",
            accent: mq.matches ? "hsl(37, 100%, 64%)" : "hsl(37, 100%, 34%)",
        };

        const this_month = new Date().toLocaleDateString("pt-BR", {
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
                plugins: {
                    title: {
                        display: true,
                        text: `DESPESAS DIÁRIAS EM CONTRATOS VIGENTES (${this_month.toUpperCase()})`,
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

        const handler = function (e: MediaQueryListEvent) {
            const textColor = e.matches ? "hsl(0 0 90)" : "hsl(0 0 10)";
            const accentColor = e.matches
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

            chart.update();
        };
        mq.addEventListener("change", handler);

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
            mq.removeEventListener("change", handler);
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
        height: 40dvh;
        margin: 5px 3px;
        border: 1px solid var(--text-color);
        background-color: var(--background-10);
        box-shadow: 1px 2px 2px var(--dark-text-color);
    }

    @media (769px <= width <= 1440px) {
        #chart-box {
            width: 45dvw;
        }
    }

    @media (481px <= width <= 768px) {
        #chart-box {
            height: 44dvh;
        }
    }
</style>
