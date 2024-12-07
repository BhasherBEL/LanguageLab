<script lang="ts">
	import type Session from '$lib/types/session';
	import { onDestroy, onMount } from 'svelte';
	import MessageC from './message.svelte';
	import { get } from 'svelte/store';
	import Writebox from './writebox.svelte';
	import { t } from '$lib/services/i18n';
	import { toastSuccess } from '$lib/utils/toasts';
	import { Icon, PencilSquare } from 'svelte-hero-icons';
	import Message from '$lib/types/message';
	import Feedback from '$lib/types/feedback';

	export let token: string;

	export let session: Session;
	let messages = get(session.messages);

	session.messages.subscribe((newMessages) => {
		let news = newMessages
			.filter(
				(m) =>
					!messages.find(
						(m2) => m instanceof Message && m2 instanceof Message && m2.message_id === m.message_id
					)
			)
			.at(-1);
		messages = newMessages;
		if (!news || !(news instanceof Message)) return;

		if (document.hidden) {
			new Notification(news.user.nickname, {
				body: news.content,
				icon: '/favicon.ico'
			});
			new Audio('/notification.wav').play();
		}
	});

	let wsConnected = true;
	let timeout: number;
	session.wsConnected.subscribe((newConnected) => {
		clearTimeout(timeout);

		if (newConnected === wsConnected) return;
		else if (newConnected) wsConnected = newConnected;
		else {
			timeout = setTimeout(() => {
				wsConnected = newConnected;
			}, 1000);
		}
	});

	$: isTyping = false;
	let timeoutTyping: number;

	session.lastTyping.subscribe((lastTyping) => {
		clearTimeout(timeoutTyping);
		if (!lastTyping) {
			isTyping = false;
			return;
		}

		const diff = new Date().getTime() - lastTyping.getTime();

		if (diff > 2000) {
			isTyping = false;
		}

		isTyping = true;
		timeoutTyping = setTimeout(() => {
			isTyping = false;
		}, 2000 - diff);
	});

	let presenceTimeout: number;

	function presenceIndicator() {
		clearInterval(presenceTimeout);

		presenceTimeout = setInterval(() => {
			session.sendPresence();
		}, 5000);
	}

	let satisfyTimeout: number;
	let satisfyModalElement: HTMLDialogElement;

	function satisfyModal() {
		clearTimeout(satisfyTimeout);

		const satifyTime =
			(session.end_time.getTime() - session.start_time.getTime()) / 2 +
			session.start_time.getTime();
		const timeBeforeSatify = satifyTime - new Date().getTime();

		if (timeBeforeSatify < 0) {
			return;
		}

		satisfyTimeout = setTimeout(() => {
			satisfyModalElement.showModal();
		}, timeBeforeSatify);
	}

	let satisfyQ1: number = 2;
	let satisfyQ2: number = 2;
	let satisfyQ3: string = '';

	async function submitSatisfy() {
		const res = await session.sendSatisfy(satisfyQ1, satisfyQ2, satisfyQ3);
		if (res) {
			satisfyModalElement.close();
			toastSuccess(get(t)('session.modal.satisfy.success'));
		}
	}

	onMount(async () => {
		await session.loadMessages();
		session.wsConnect(token);
		presenceIndicator();
		satisfyModal();
		Notification.requestPermission(); // Should do something with denial ?
	});

	onDestroy(() => {
		clearInterval(presenceTimeout);
	});
</script>

<div class="flex flex-col w-full h-full border-x-2 scroll-smooth">
	<div class="flex-grow h-48 overflow-auto flex-col-reverse px-4 flex mb-2">
		<div class:hidden={!isTyping}>
			<span class="loading loading-dots loading-md"></span>
		</div>
		{#each messages.sort((a, b) => b.created_at.getTime() - a.created_at.getTime()) as message (message.uuid)}
			{#if message instanceof Message}
				<MessageC {message} />
			{:else if message instanceof Feedback}
				<a class="text-center italic text-gray-500 my-2" href="#{message.message.uuid}">
					{$t('session.feedbackInline')} "{message.message.content.length > 20
						? message.message.content.substring(0, 20) + '...'
						: message.message.content}"
				</a>
			{/if}
		{/each}
	</div>
	{#if !wsConnected}
		<div
			class="bg-orange-400 h-10 text-center text-white font-bold flex justify-center items-center"
		>
			Real-time sync lost. You may need to refresh the page to see new messages.
		</div>
	{/if}
	<div class="flex flex-row h-30">
		<Writebox {session} />
	</div>
</div>

<dialog bind:this={satisfyModalElement} class="modal">
	<div class="modal-box">
		<form method="post" on:submit|preventDefault={submitSatisfy}>
			<h3 class="text-lg font-bold">{$t('session.modal.satisfy.title')}</h3>
			<p class="mt-4 mb-2">{$t('session.modal.satisfy.q1')}</p>
			<input
				bind:value={satisfyQ1}
				type="range"
				min="0"
				max="4"
				class="range range-primary"
				step="1"
			/>
			<div class="flex w-full justify-between px-2 text-xs">
				<span>{$t('inputs.range.1')}</span>
				<span>{$t('inputs.range.2')}</span>
				<span>{$t('inputs.range.3')}</span>
				<span>{$t('inputs.range.4')}</span>
				<span>{$t('inputs.range.5')}</span>
			</div>
			<p class="mt-4 mb-2">{$t('session.modal.satisfy.q2')}</p>
			<input
				bind:value={satisfyQ2}
				type="range"
				min="0"
				max="4"
				class="range range-primary"
				step="1"
			/>
			<div class="flex w-full justify-between px-2 text-xs">
				<span>{$t('inputs.range.1')}</span>
				<span>{$t('inputs.range.2')}</span>
				<span>{$t('inputs.range.3')}</span>
				<span>{$t('inputs.range.4')}</span>
				<span>{$t('inputs.range.5')}</span>
			</div>
			<p class="mt-4 mb-2">{$t('session.modal.satisfy.q3')}</p>
			<textarea bind:value={satisfyQ3} class="textarea textarea-bordered w-full"></textarea>
			<input type="submit" class="btn btn-primary mt-4 float-end" value={$t('button.submit')} />
		</form>
		<form method="dialog">
			<button class="btn btn-sm btn-circle btn-ghost absolute right-6 top-6 text-xl">✕</button>
		</form>
	</div>
</dialog>

<div class="absolute bottom-4 right-4">
	<button
		on:click={() => {
			satisfyModalElement.showModal();
		}}
		class="btn btn-primary btn-circle"
	>
		<Icon src={PencilSquare} class="icon" size="32" />
	</button>
</div>
