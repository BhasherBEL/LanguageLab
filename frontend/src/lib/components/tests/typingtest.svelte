<script lang="ts">
	import { t } from '$lib/services/i18n';
	import Typingbox from '$lib/components/tests/typingbox.svelte';
	import type User from '$lib/types/user';
	import { toastWarning } from '$lib/utils/toasts';
	import { get } from 'svelte/store';
	import { createTestTypingAPI } from '$lib/api/studies';

	let { user, onFinish }: { user: User | null; onFinish: Function } = $props();

	let data: typingEntry[] = $state([]);

	let inProgress = $state(false);

	let exercices = [
		{
			duration: 30,
			explications: 'Repetez la phrase suivante autant de fois que possible en 30 secondes.',
			text: 'une femme folle tenait un verre dans sa main\n'.repeat(20) + '...'
		},
		{
			duration: 30,
			explications: 'Repetez la phrase suivante autant de fois que possible en 30 secondes.',
			text: 'the cat was sleeping under the apple tree\n'.repeat(20) + '...'
		},
		{
			duration: -1,
			explications: 'Repetez 7 fois la phrase suivante le plus rapidement possible.',
			text:
				'trois heures raisonnables\nhuit histoires profondes\ndeux besoins fantastiques\nsix bijoux bizarres\n'.repeat(
					6
				) +
				'trois heures raisonnables\nhuit histoires profondes\ndeux besoins fantastiques\nsix bijoux bizarres'
		},
		{
			duration: -1,
			explications: 'Repetez 7 fois la phrase suivante le plus rapidement possible.',
			text:
				'four interesting questions\nseven wonderful surprises\nfive important behaviours\nsome awkward zigzags\n'.repeat(
					6
				) +
				'four interesting questions\nseven wonderful surprises\nfive important behaviours\nsome awkward zigzags'
		},
		{
			duration: -1,
			explications: 'Écrivez aussi vite que possible la suite suivante:',
			text: 'some awkward zigzags'
		}
	];

	async function submit() {
		if (!code) return;
		const res = await createTestTypingAPI(fetch, data, code);

		if (!res) return;

		onFinish();
	}

	let step = $state(user ? 1 : 0);
	let code: string | undefined = $state(user ? user.email : undefined);

	function checkCode() {
		if (!code) {
			toastWarning(get(t)('surveys.invalidCode'));
			return;
		}
		if (code.length < 3) {
			toastWarning(get(t)('surveys.invalidCode'));
			return;
		}

		step += 1;
	}
</script>

{#if step === 0}
	<div class="max-w-screen-md mx-auto p-20 flex flex-col items-center min-h-screen">
		<h2 class="mb-10 text-xl text-center">{$t('tests.typing')}</h2>
		<p class="mb-4 text-lg font-semibold">{$t('surveys.code')}</p>
		<p class="mb-6 text-sm text-gray-600 text-center">{@html $t('surveys.codeIndication')}</p>
		<input
			type="text"
			placeholder="Code"
			class="input block mx-auto w-full max-w-xs border border-gray-300 rounded-md py-2 px-3 text-center"
			onkeydown={(e) => e.key === 'Enter' && checkCode()}
			bind:value={code}
		/>
		<button
			class="button mt-4 block bg-yellow-500 text-white rounded-md py-2 px-6 hover:bg-yellow-600 transition"
			onclick={checkCode}
		>
			{$t('button.next')}
		</button>
	</div>
{:else if step <= exercices.length}
	{@const j = step - 1}
	{#each exercices as _, i (i)}
		{#if i === j}
			<Typingbox
				exerciceId={i}
				initialDuration={exercices[i].duration}
				explications={exercices[i].explications}
				text={exercices[i].text}
				bind:data
				bind:inProgress
				onFinish={() => {
					inProgress = false;
					setTimeout(() => {
						step++;
					}, 3000);
				}}
			/>
		{/if}
	{/each}
{:else}
	<div class="flex items-center mt-8">
		<button class="button m-auto" disabled={inProgress} onclick={submit}>
			{$t('button.submit')}
		</button>
	</div>
{/if}
