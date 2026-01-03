<script lang="ts">
    import MoneyDisplay from '$lib/components/MoneyDisplay.svelte';

    const { data } = $props();

    let contract_idx = $state(0);
    const contract = $derived(data.contracts.resultado[contract_idx]);
    const contract_info = $derived(contract ? Object.entries(contract) : ["nada", 0]);
</script>

<h1>Contrato</h1>
<button class="default-button" onclick={() => contract_idx++}>Próximo</button>
<hr>
<MoneyDisplay value={contract.valorGlobal}/>

<dl>
    {#each contract_info as [chave, info]}
        <dt>{chave}</dt>
        <dd>{info}</dd>
    {/each}
</dl>

<style>
    h1 {
		font: bold var(--heading-size) sans-serif;
	}
</style>
<!-- {@debug data} -->