<script lang="ts">
	import { locale, locales } from '$lib/services/i18n';
	import { writable, get } from 'svelte/store';

	let classes = '';
	export { classes as class };

	const value = writable($locale);

	value.subscribe((newLocale) => {
		if (newLocale !== get(locale)) {
			const path = window.location.pathname.split('/').slice(2).join('/') + window.location.search;
			window.location.href = `/${newLocale}/${path}`;
		}
	});
</script>

<div class="flex-1">
	<select bind:value={$value} class="bg-transparent {classes} max-w-20">
		{#each $locales as name (name)}
			<option value={name}>{name}</option>
		{/each}
	</select>
</div>
