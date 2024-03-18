<script>
	import { SvelteToast } from '@zerodevx/svelte-toast';
	import '../app.css';
	import { setupI18n, isLocaleLoaded, dir, _ } from '$lib/services/i18n';

	const locale = localStorage.getItem('locale');
	if (locale !== null) {
		setupI18n({ withLocale: locale });
	} else {
		setupI18n();
	}

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
