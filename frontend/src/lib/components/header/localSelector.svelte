<script lang="ts">
	import { locale, locales } from '$lib/services/i18n';
	import { get } from 'svelte/store';

	let classes = '';
	export { classes as class };

	$: value = locale;

	//value.subscribe((newLocale) => {
	//	if (newLocale !== get(locale)) {
	//		locale.set(newLocale);
	//	}
	//});
</script>

<div class=" flex-1">
	<select {value} class="bg-transparent {classes}">
		{#each Object.entries(locales) as [locale, name] (locale)}
			<option value={locale}>{name}</option>
		{/each}
	</select>
</div>
