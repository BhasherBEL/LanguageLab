<script lang="ts">
	import { _, _activeLocale, locales, setupI18n } from '../../services/i18n';

	let classes = '';
	export { classes as class };

	$: value = $_activeLocale;

	_activeLocale.subscribe((locale) => {
		value = locale;
	});

	function onChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		localStorage.setItem('locale', target.value);
		setupI18n({
			withLocale: target.value
		});
	}
</script>

<div class=" flex-1">
	<select {value} on:change={onChange} class="bg-transparent {classes}">
		{#each Object.entries(locales) as [locale, name] (locale)}
			<option value={locale}>{name}</option>
		{/each}
	</select>
</div>
