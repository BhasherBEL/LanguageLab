<script>
	import { SvelteToast } from '@zerodevx/svelte-toast';
	import '../app.css';
	import { setupI18n, isLocaleLoaded, dir, _ } from '$lib/services/i18n';

	setupI18n();

	$: if (document.dir !== $dir) {
		document.dir = $dir;
	}

	$: if ($isLocaleLoaded) {
		document.title = $_('header.appName');
	}
</script>

{#if $isLocaleLoaded}
	<slot />
{/if}

<SvelteToast />
