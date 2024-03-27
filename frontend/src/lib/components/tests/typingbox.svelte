<script lang="ts">
	import { requireLogin } from '$lib/utils/login';
	import { onMount } from 'svelte';
	import { _ } from '$lib/services/i18n';
	import { createTestTypingAPI } from '$lib/api/users';
	import JWTSession from '$lib/stores/JWTSession';
	import { toastAlert } from '$lib/utils/toasts';
	import config from '$lib/config';
	import { init, t } from 'svelte-i18n';
	import { split } from 'postcss/lib/list';

	export let initialDuration: number;
	export let exerciceId: number;
	export let explications: string;
	export let text: string;
	export let data: {
		exerciceId: number;
		position: number;
		downtime: number;
		uptime: number;
		keyCode: number;
		keyValue: string;
	}[];
	let duration = initialDuration >= 0 ? initialDuration : 0;
	export let inProgress = false;
	let lastInput = '';
	let input = '';
	let textArea: HTMLTextAreaElement;
	let startTime = new Date().getTime();

	onMount(async () => {
		textArea.focus();
	});

	function start() {
		inProgress = true;
		startTime = new Date().getTime();
		const interval = setInterval(() => {
			duration += initialDuration >= 0 ? -1 : 1;
			if ((duration <= 0 && initialDuration > 0) || !inProgress) {
				clearInterval(interval);
				inProgress = false;
			}
		}, 1000);
	}
</script>

<div class=" w-full max-w-5xl m-auto mt-8">
	<div>{explications}</div>
	<div class="flex justify-between my-2 p-2">
		<button
			class="button"
			on:click={() => {
				input = '';
				duration = initialDuration >= 0 ? initialDuration : 0;
				start();
			}}
			disabled={inProgress}
		>
			{$_('button.start')}
		</button>
		<div class="text-2xl font-bold">
			{duration}s
		</div>
	</div>
	<ul class="h-10 flex justify-around border-t-2 rounded-t-lg border-x-2 divide-x-2 text-center">
		{#each config.SPECIAL_CHARS as char (char)}
			<button
				class="flex-grow"
				on:click={() => {
					input += char;
				}}
				on:mousedown={(e) => e.preventDefault()}
			>
				{char}
			</button>
		{/each}
	</ul>
	<div class="relative border-2 rounded-b-lg text-xl select-none">
		<div class="font-mono p-4 break-words">
			<span class="text-inherit p-0 m-0 whitespace-pre-wrap break-words"
				><!--
			-->{#each text.slice(0, input.length) as char, i}
					<span
						class="text-gray-800 p-0 m-0"
						class:text-red-500={char !== input[i]}
						class:bg-red-100={char !== input[i]}>{input[i]}</span
					><!--
					-->{/each}<!--
					--></span
			><span
				class="text-gray-400 p-0 m-0 underline decoration-2 underline-offset-6 decoration-black whitespace-pre-wrap"
				>{text[input.length] ?? ''}</span
			><span class="text-gray-400 p-0 m-0 whitespace-pre-wrap"
				>{text.slice(input.length + 1) ?? ''}</span
			>
		</div>
		<textarea
			bind:value={input}
			bind:this={textArea}
			spellcheck="false"
			disabled={!inProgress &&
				duration <= 0 &&
				initialDuration >= 0 &&
				duration >= 0 &&
				initialDuration < 0}
			on:keyup={(e) => {
				if (inProgress) {
					data[data.length - 1].uptime = new Date().getTime() - startTime;
				}
			}}
			on:keydown={(e) => {
				if (
					!inProgress &&
					((duration > 0 && initialDuration > 0) || (duration >= 0 && initialDuration < 0))
				) {
					start();
				}
				if (inProgress) {
					lastInput = input;

					data.push({
						exerciceId,
						position: input.length,
						downtime: new Date().getTime() - startTime,
						uptime: 0,
						keyCode: e.keyCode,
						keyValue: e.key
					});

					if (input === text || input.split('\n').length >= text.split('\n').length + 1) {
						inProgress = false;
					}
				} else {
					input = lastInput;
				}
			}}
			class="absolute top-0 resize-none font-mono p-4 w-full h-full bg-transparent select-none text-transparent"
		/>
	</div>
</div>
