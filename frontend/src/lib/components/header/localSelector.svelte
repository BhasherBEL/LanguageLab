<script lang="ts">
	import { _, _activeLocale, locales, setupI18n } from '../../services/i18n';

	let value: string = _activeLocale;

	function onChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		setupI18n({
			withLocale: target.value
		});
	}
</script>

<div class="ml-2">
	<select {value} on:change={onChange} class="bg-transparent">
		{#each Object.entries(locales) as [locale, name] (locale)}
			<option value={locale}>{name}</option>
		{/each}
	</select>
</div>
