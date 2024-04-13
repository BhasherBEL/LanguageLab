<script lang="ts">
	import { locale, locales } from '$lib/services/i18n';
	import { get } from 'svelte/store';

	let classes = '';
	export { classes as class };

	let value = get(locale);

	function onChange() {
		if (value !== get(locale)) {
			// TODO: Should be in place
			document.cookie = `locale=${value}; path=/; max-age=31536000`;
			window.location.href = window.location.href;
		}
	}
</script>

<div class="flex-1">
	<select bind:value on:change={onChange} class="bg-transparent {classes} max-w-20">
		{#each $locales as name (name)}
			<option value={name}>{name}</option>
		{/each}
	</select>
</div>
