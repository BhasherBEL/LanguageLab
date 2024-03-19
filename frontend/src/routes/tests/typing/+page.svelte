<script lang="ts">
	import Header from '$lib/components/header.svelte';
	import { requireLogin } from '$lib/utils/login';
	import { onMount } from 'svelte';

	const initialDuration = 60;
	// Random french text
	let text =
		"Bonjour, je suis un long texte en français, pour tester la vitesse de frappe. Napoleon Bonaparte, né le 15 aout 1769 à Ajaccio et mort le 5 mai 1821 sur l'ile Sainte-Hélène, est un militaire et homme d'État français, premier empereur des Français, du 18 mai 1804 au 6 avril 1814 et du 20 mars 1815 au 22 juin 1815. Il est l'une des figures les plus célèbres de l'histoire de France et une des plus étudiées au monde. Il est considéré comme lun des plus grands chefs militaires de l'histoire, avec une carrière longue et brillante, mais aussi comme lun des plus grands stratèges militaires de l'histoire. Charles de Gaulle, né le 22 novembre 1890 à Lille et mort le 9 novembre 1970 à Colombey-les-Deux-Églises, est un militaire, écrivain et homme dÉtat français. Il est le chef de la France libre pendant la Seconde Guerre mondiale, le président du Gouvernement provisoire de la République française de 1944 à 1946, puis le président de la République française du 8 janvier 1959 au 28 avril 1969. Il est le fondateur de la Cinquième République française en 1958 et le seul président de la République française à avoir démissionné de ses fonctions. Il est considéré comme lun des plus grands chefs militaires de l'histoire, avec une carrière longue et brillante, mais aussi comme lun des plus grands stratèges militaires de l'histoire.";

	let duration = initialDuration;
	let inProgress = false;
	let lastInput = '';
	let input = '';

	onMount(async () => {
		if (!requireLogin()) return;
	});

	function start() {
		inProgress = true;
		const interval = setInterval(() => {
			duration--;
			if (duration <= 0) {
				clearInterval(interval);
				inProgress = false;
			}
		}, 1000);
	}

	function wpm(str: string, duration: number) {
		const n_words = str.length / 6;
		const n_minutes = duration / 60;
		return Math.round(n_words / n_minutes);
	}
</script>

<Header />

<div class=" w-full max-w-5xl m-auto mt-8">
	<div class="flex justify-between mb-2 p-2">
		<button
			class="button"
			on:click={() => {
				input = '';
				duration = initialDuration;
				start();
			}}
			disabled={inProgress}>Start</button
		>
		<div class="text-2xl font-bold">
			{duration}s
		</div>
	</div>
	<div class="relative border-2 rounded text-xl select-none">
		<div class="font-mono p-4">
			<span class="text-inherit p-0 m-0 whitespace-pre-wrap"
				><!--
			-->{#each text.slice(0, input.length) as char, i}<!--
			--><span
						class="text-gray-800 p-0 m-0"
						class:text-red-500={char !== input[i]}>{input[i]}</span
					><!--
					-->{/each}<!--
					--></span
			><span class="text-gray-400 p-0 m-0">{text.slice(input.length)}</span>
		</div>
		<textarea
			bind:value={input}
			spellcheck="false"
			disabled={!inProgress && duration <= 0}
			on:input={(e) => {
				if (!inProgress && duration > 0) {
					start();
				}
				if (inProgress) {
					// && text.toLowerCase().startsWith(input.toLowerCase())) {
					lastInput = input;
				} else {
					input = lastInput;
				}
			}}
			class="absolute top-0 resize-none font-mono p-4 w-full h-full bg-transparent select-none text-transparent"
		/>
	</div>

	{#if !inProgress && duration <= 0}
		<div class="text-2xl font-bold text-center mt-4">
			{input.length} characters in {initialDuration} seconds, resulting in {wpm(
				input,
				initialDuration
			)} WPM
		</div>
	{/if}
</div>
