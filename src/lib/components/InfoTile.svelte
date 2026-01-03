<script lang="ts">
    import { BRLCurrencyFormatter as BRLCurrency } from "$lib/utils";
    import type { Contract } from "$lib/types";

    const { contract }: { contract: Contract } = $props();
</script>

<section>
    <h3>ola</h3>
    <p>{BRLCurrency.format(contract.valorGlobal)}</p>
</section>

<style>
    section {
        padding: 5px;
        margin: 5px;
        border: 1px solid white;
        border-radius: var(--default-bradius);

        h3 { margin: var(--heading-space); }
    }
</style>