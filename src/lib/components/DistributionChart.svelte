<script lang="ts">
    import { Chart, BarController, BarElement } from "chart.js";
    import { getRelativePosition } from "chart.js/helpers";
    import { onMount } from "svelte";
    import { MediaQuery } from "svelte/reactivity";

    let {
        labels,
        values,
        selected = $bindable(),
    }: { labels: string[]; values: number[]; selected: number[] } = $props();

    Chart.register(BarController, BarElement);

    const mqTabletScreen = new MediaQuery("(481px <= width <= 768px)");
    const mqDesktopScreen = new MediaQuery("(769px <= width <= 1440px)");
    const mqDarkTheme = new MediaQuery("(prefers-color-scheme: dark)");

    let chartCanvas: HTMLCanvasElement;
    let chart: Chart<"line" | "bar">;
    onMount(() => {
        const systemColors = {
            primaryColor: "hsl(286, 61%, 29%)",
            accent: mqDarkTheme.current
                ? "hsl(37, 100%, 64%)"
                : "hsl(37, 100%, 34%)",
            text: mqDarkTheme.current ? "hsl(0 0 90)" : "hsl(0 0 10)",
        };

        chart = new Chart(chartCanvas, {
            data: {
                labels: labels,
                datasets: [
                    {
                        type: "line",
                        label: "Quantidade",
                        data: values,
                        tension: 0.25,
                    },
                    {
                        type: "bar",
                        label: "Quantidade",
                        data: values,
                    },
                ],
            },
            options: {
                maintainAspectRatio: false,
                elements: {
                    bar: {
                        backgroundColor: systemColors.primaryColor,
                    },
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
                            text: "Valor dos contratos",
                            color: systemColors.text,
                        },
                        ticks: {
                            color: systemColors.text,
                        },
                    },
                    y: {
                        title: {
                            display: true,
                            text: "Quantidade de contratos",
                            color: systemColors.text,
                        },
                        ticks: {
                            stepSize: 100,
                            color: systemColors.text,
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
                    const labelValues = chart.scales.x.getLabelForValue(
                        chart.scales.x.getValueForPixel(canvasPosition.x)!,
                    );

                    selected = labelValues.split(" à ").map((value) => {
                        const result = value.substring(3);
                        if (result.includes("M")) {
                            return +result.slice(0, -2) * 1e6;
                        }

                        return +result;
                    });
                },
                plugins: {
                    title: {
                        display: true,
                        color: systemColors.text,
                        text: "DISTRIBUIÇÃO DE CONTRATOS PÚBLICOS POR DESPESA TOTAL",
                    },
                    legend: { display: false },
                },
            },
        });

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
