<script lang="ts">
	import Header from '$lib/components/header.svelte';
	import Chatbox from '$lib/components/sessions/chatbox.svelte';
	import { requireLogin } from '$lib/utils/login';
	import { onMount } from 'svelte';

	onMount(() => {
		requireLogin();
	});
</script>

<div class="container">
	<Header />
	<div class="vareas">
		<Chatbox />
	</div>
</div>

<style lang="less">
	html,
	body {
		height: 100%;
		margin: 0;
	}

	.container {
		display: flex;
		flex-direction: column;
		height: 100vh;
	}

	.vareas {
		display: flex;
		flex-direction: row;
		flex-grow: 1;
		justify-content: space-evenly;
	}
</style>
