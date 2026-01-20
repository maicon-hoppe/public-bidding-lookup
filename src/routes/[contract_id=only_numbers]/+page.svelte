<script lang="ts">
    import MoneyDisplay from "$lib/components/MoneyDisplay.svelte";

    const { data } = $props();

    let contract_idx = $derived(+data.contract_id);
    const contract = $derived(
        data.contracts.find((contract) => contract.id === contract_idx),
    );
    const contract_info = $derived(
        contract ? Object.entries(contract) : ["nada", 0],
    );
</script>

<h1>Contrato</h1>
<a href="/{contract_idx + 1}" class="default-button">Próximo</a>
<a href="/" class="default-buttobh">Voltar</a>
<hr />
<MoneyDisplay value={+contract.valorGlobal} />
<dl>
    {#each contract_info as [chave, info]}
        <dt>{chave}</dt>
        <dd>{info}</dd>
    {/each}
</dl>
<!-- {@debug data} -->

<style>
    h1 {
        font: bold var(--heading-size) sans-serif;
    }
</style>
