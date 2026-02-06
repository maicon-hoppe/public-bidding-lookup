<script lang="ts">
    import { Chart, BarController, BarElement } from "chart.js";
    import { onMount } from "svelte";

    const { labels, values }: { labels: string[]; values: number[] } = $props();

    Chart.register(BarController, BarElement);

    let chartCanvas: HTMLCanvasElement;
    let chart: Chart<"line" | "bar">;
    onMount(() => {
        const mqTabletScreen = window.matchMedia("(481px <= width <= 768px)");
        const mqDesktopScreen = window.matchMedia("(769px <= width <= 1440px)");
        const mqDarkTheme = window.matchMedia("(prefers-color-scheme: dark)");
        const systemColors = {
            primaryColor: "hsl(286, 61%, 29%)",
            accent: mqDarkTheme.matches
                ? "hsl(37, 100%, 64%)"
                : "hsl(37, 100%, 34%)",
            text: mqDarkTheme.matches ? "hsl(0 0 90)" : "hsl(0 0 10)",
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
                plugins: {
                    title: {
                        display: true,
                        color: systemColors.text,
                        text: "DISTRIBUIÇÃO DE CONTRATOS PÚBLICOS POR DISPESA",
                    },
                    legend: { display: false },
                },
            },
        });

        function handler(e: MediaQueryListEvent) {
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
        }
        mqDarkTheme.addEventListener("change", handler);

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
            mqDarkTheme.removeEventListener("change", handler);
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
