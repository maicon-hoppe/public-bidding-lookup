<script lang="ts">
	let { children } = $props();
</script>

<svelte:head>
	<link rel="stylesheet" href="/css/global.css">
	<link rel="icon" href="/images/fav_24.svg" />
	<title>Documento</title>
</svelte:head>

{@render children()}