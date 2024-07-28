<script lang="ts">
	import Typingtest from '$lib/components/tests/typingtest.svelte';
	import { t } from '$lib/services/i18n';

	let finished = false;
</script>

{#if finished}
	<p>{$t('surveys.complete')}</p>
{:else}
	<Typingtest onFinish={() => (finished = true)} />
{/if}
