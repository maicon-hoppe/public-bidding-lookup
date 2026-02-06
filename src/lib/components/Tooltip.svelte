<script lang="ts">
    import tippy, { type Instance, type Props } from "tippy.js";
    import { onMount, type Snippet } from "svelte";
    import 'tippy.js/dist/tippy.css';
    import 'tippy.js/themes/light.css';
    import 'tippy.js/themes/material.css';

    const { content, children }: { content: string, children: Snippet } = $props();

    let icone: SVGElement;
    let tooltip: Instance<Props>;
    onMount(() =>
    {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');

        tooltip = tippy(icone,
        {
            content: content,
            delay: 300,
            theme: mq.matches ? 'material' : 'light'
        });

        const handler = function(e: MediaQueryListEvent)
        {
            tooltip.setProps({ theme: e.matches ? 'material' : 'light' })
        };
        mq.addEventListener("change", handler);

        const observerCallback: MutationCallback = function(mutationList, observer)
        {
            for (const mutation of mutationList)
            {
                const element = mutation.target as HTMLElement;
                if (element.classList.contains('dark-theme'))
                {
                    tooltip.setProps({ theme: 'material' })
                }
                else if (element.classList.contains('light-theme'))
                {
                    tooltip.setProps({ theme:'light' })
                }
                else
                {
                    tooltip.setProps({ theme: mq.matches ? 'material' : 'light' })
                }
            }
        }
        const observer = new MutationObserver(observerCallback);
        observer.observe(document.body,
        {
            attributes: true,
            attributeFilter: ['class'],
            attributeOldValue: true
        });

        return () =>
        {
            mq.removeEventListener("change", handler);
            observer.disconnect();
            tooltip.destroy();
        }
    });
</script>

<span tabindex="-1">
    <svg bind:this={icone} xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
        <path d="M478-240q21 0 35.5-14.5T528-290q0-21-14.5-35.5T478-340q-21 0-35.5 14.5T428-290q0 21 14.5 35.5T478-240Zm-36-154h74q0-33 7.5-52t42.5-52q26-26 41-49.5t15-56.5q0-56-41-86t-97-30q-57 0-92.5 30T342-618l66 26q5-18 22.5-39t53.5-21q32 0 48 17.5t16 38.5q0 20-12 37.5T506-526q-44 39-54 59t-10 73Zm38 314q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/>
    </svg>
    {@render children()}
</span>

<style>
    svg {
        height: var(--text-size);
        width: var(--text-size);
        fill: var(--text-color);
    }
</style>