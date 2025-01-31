<script lang="ts">
	import Typingtest from '$lib/components/tests/typingtest.svelte';
	import { t } from '$lib/services/i18n';

	let finished = $state(false);

	let { data } = $props();
	let user = data.user;
</script>

{#if finished}
	<p>{$t('surveys.complete')}</p>
{:else}
	<Typingtest {user} onFinish={() => (finished = true)} />
{/if}
