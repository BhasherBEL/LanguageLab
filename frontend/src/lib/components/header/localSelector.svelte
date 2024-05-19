<script lang="ts">
	import { locale, locales, t } from '$lib/services/i18n';
	import { get } from 'svelte/store';

	let classes = '';
	export { classes as class };

	function onChange(value: string) {
		if (value !== get(locale)) {
			// TODO: Should be in place
			document.cookie = `locale=${value}; path=/; max-age=31536000`;
			window.location.href = window.location.href;
		}
	}
</script>

<!-- <ul class="{classes}"> -->
{#each $locales as name (name)}
	<li><button on:click={() => onChange(name)}>{name}</button></li>
{/each}
<!-- </ul> -->