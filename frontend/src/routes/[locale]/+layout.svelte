<script lang="ts">
	import { SvelteToast } from '@zerodevx/svelte-toast';
	import '../../app.css';
	import { t } from '$lib/services/i18n';
</script>

<svelte:head>
	<title>{$t('header.appName')}</title>
</svelte:head>

<slot />

<SvelteToast />
