<script lang="ts">
	import StudyForm from '$lib/components/studies/StudyForm.svelte';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let study = data.study;

	let possibleTests = data.tests;

	let mode = 'edit';
</script>

{#if study}
	<StudyForm {study} {possibleTests} {mode} {data} {form} />
{:else}
	<p>Study not found.</p>
{/if}
