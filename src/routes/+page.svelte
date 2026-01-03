<script lang="ts">
    import InfoTile from "$lib/components/InfoTile.svelte";

    const { data } = $props();

    const contract = $derived(data.contracts.resultado[0]);
</script>

<h1>Página</h1>
<hr>
<button class="default-button"><a href="/contrato">Contrato</a></button>

{#if contract}
    <InfoTile {contract} />
{/if}
