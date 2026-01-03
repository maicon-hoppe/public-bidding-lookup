<script lang="ts">
	let { children } = $props();
</script>

<svelte:head>
	<link rel="stylesheet" href="/css/global.css">
	<link rel="icon" href="/images/favicon.svg" />
	<title>Documento</title>
</svelte:head>

{@render children()}