<script lang="ts">
    import { BRLCurrencyFormatter as BRLCurrency } from "$lib/utils";
    const { value }: { value: number } = $props();
</script>

<dl class="light-theme">
    <dt>Valor Global</dt>
    <dd>{BRLCurrency.format(value)}</dd>
</dl>

<style>
    dl {
        width: max-content;
        margin: 10px;
        border: 1px solid grey;
        border-radius: var(--default-bradius);
        background-color: var(--background-10);
    }
    
    dt, dd {
        padding: 5px;
        color: var(--text-color);
    }
    
    dt {
        border-bottom: 1px solid gray;
        color: var(--accent-color);
        font-weight: bold;
    }

</style>