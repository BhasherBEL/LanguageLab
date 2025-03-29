<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from '$lib/services/i18n';
	import config from '$lib/config';
	import type { TestTyping } from '$lib/types/tests';
	import { sendTestEntryTypingAPI } from '$lib/api/tests';
	import type User from '$lib/types/user';

	const {
		typingTest,
		onFinish,
		user,
		code,
		rid
	}: {
		typingTest: TestTyping;
		onFinish: Function;
		user: User | null;
		code: string | null;
		rid: string | null;
	} = $props();

	let duration = $state(typingTest.initialDuration);
	let lastInput = '';
	let input = $state('');
	let textArea: HTMLTextAreaElement;
	let startTime = new Date().getTime();
	let isDone = $state(false);
	let inProgress = $state(false);

	let currentPressings: { [key: string]: number } = {};

	onMount(async () => {
		textArea.focus();
	});

	function start() {
		inProgress = true;
		startTime = new Date().getTime();
		const interval = setInterval(() => {
			duration += typingTest.durationStep;
			if ((duration <= 0 && typingTest.durationDirection) || !inProgress) {
				clearInterval(interval);
				inProgress = false;
				isDone = true;
				onFinish();
			}
		}, 1000);
	}

	async function sendTyping(
		position: number,
		downtime: number,
		uptime: number,
		key_code: number,
		key_value: string
	) {
		if (
			!(await sendTestEntryTypingAPI(
				fetch,
				code || user?.email || '',
				rid,
				user?.id || null,
				typingTest.id,
				user?.study_id ?? 0,
				position,
				downtime,
				uptime,
				key_code,
				key_value
			))
		) {
			return;
		}
	}
</script>

<div class=" w-full max-w-5xl m-auto mt-8">
	<div>{typingTest.explainations}</div>
	<div class="flex justify-between my-2 p-2">
		<button
			class="button"
			onclick={() => {
				input = '';
				duration = typingTest.initialDuration;
				start();
			}}
			disabled={inProgress}
		>
			{$t('button.start')}
		</button>
		<div class="text-2xl font-bold">
			{duration}s
		</div>
	</div>
	<ul class="h-10 flex justify-around border-t-2 rounded-t-lg border-x-2 divide-x-2 text-center">
		{#each config.SPECIAL_CHARS as char (char)}
			<button
				class="flex-grow"
				onclick={() => {
					input += char;
				}}
				onmousedown={(e) => e.preventDefault()}
			>
				{char}
			</button>
		{/each}
	</ul>
	<div
		class="relative border-2 rounded-b-lg text-xl select-none"
		class:border-green-500={isDone}
		class:bg-green-100={isDone}
	>
		<div class="font-mono p-4 break-words">
			<span class="text-inherit p-0 m-0 whitespace-pre-wrap break-words"
				><!--
			-->{#each typingTest.textRepeated.slice(0, input.length) as char, i}
					<span
						class="text-gray-800 p-0 m-0"
						class:text-red-500={char !== input[i]}
						class:bg-red-100={char !== input[i]}>{input[i]}</span
					><!--
					-->{/each}<!--
					--></span
			><span
				class="text-gray-400 p-0 m-0 underline decoration-2 underline-offset-6 decoration-black whitespace-pre-wrap"
				>{typingTest.textRepeated[input.length] ?? ''}</span
			><span class="text-gray-400 p-0 m-0 whitespace-pre-wrap"
				>{typingTest.textRepeated.slice(input.length + 1) ?? ''}</span
			>
		</div>
		<textarea
			bind:value={input}
			bind:this={textArea}
			spellcheck="false"
			disabled={isDone}
			onkeyup={(e) => {
				if (e.keyCode in currentPressings) {
					sendTyping(
						input.length,
						currentPressings[e.keyCode],
						new Date().getTime() - startTime,
						e.keyCode,
						e.key
					);
					delete currentPressings[e.keyCode];
				}
			}}
			onkeydown={(e) => {
				if (
					!inProgress &&
					((duration > 0 && typingTest.durationDirection) ||
						(duration >= 0 && typingTest.duration <= 0))
				) {
					start();
				}
				if (inProgress) {
					lastInput = input;

					currentPressings[e.keyCode] = new Date().getTime() - startTime;

					if (
						input === typingTest.textRepeated ||
						input.split('\n').length >= typingTest.textRepeated.split('\n').length + 1
					) {
						inProgress = false;
					}
				} else {
					input = lastInput;
				}
			}}
			class="absolute top-0 resize-none font-mono p-4 w-full h-full bg-transparent select-none text-transparent"
		></textarea>
	</div>
</div>
