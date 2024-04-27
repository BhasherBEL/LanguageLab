<script lang="ts">
	import { t } from '$lib/services/i18n';
	import Typingbox from '$lib/components/tests/typingbox.svelte';
	import { get } from 'svelte/store';
	import { createTestTypingAPI } from '$lib/api/users';
	import { user } from '$lib/types/user';
	import { toastAlert } from '$lib/utils/toasts';

	export let onFinish: Function;

	let data: typingEntry[] = [];

	$: currentExercice = 0;

	let inProgress = false;

	let exercices = [
		{
			duration: 15,
			explications: `Repetez les lettres "dk" autant de fois que possible en 15 secondes. Le chronomètre démarre dès que vous appuyez sur une touche ou sur le boutton ${get(t)('button.start')}. Une vois que vous aurez terminé, appuyez sur le bouton ${get(t)('button.next')} pour passer à l'exercice suivant.`,
			text: 'dk'.repeat(150) + '...'
		},
		{
			duration: 30,
			explications: 'Repetez la phrase suivante autant de fois que possible en 30 secondes.',
			text: 'Le chat est sur le toit.\n'.repeat(20) + '...'
		},
		{
			duration: -1,
			explications: 'Repetez 7 fois la phrase suivante le plus rapidement possible.',
			text: 'Six animaux mangent\n'.repeat(6) + 'Six animaux mangent'
		}
	];

	async function submit() {
		const user_id = $user?.id;

		if (!user_id) {
			toastAlert('Failed to get user');
			return;
		}

		const res = await createTestTypingAPI(user_id, data);

		if (!res) return;

		onFinish();
	}
</script>

{#each exercices as _, i (i)}
	{#if i === currentExercice}
		<Typingbox
			exerciceId={i}
			initialDuration={exercices[i].duration}
			explications={exercices[i].explications}
			text={exercices[i].text}
			bind:data
			bind:inProgress
		/>
	{/if}
{/each}

<div class="flex items-center mt-8">
	{#if currentExercice < exercices.length - 1}
		<button
			class="button m-auto"
			on:click={() => {
				currentExercice++;
				inProgress = false;
				console.log(data);
			}}
			disabled={inProgress}
		>
			{$t('button.next')}
		</button>
	{:else}
		<button class="button m-auto" disabled={inProgress} on:click={submit}
			>{$t('button.submit')}</button
		>
	{/if}
</div>
