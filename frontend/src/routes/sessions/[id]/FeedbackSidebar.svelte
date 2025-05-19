<script lang="ts">
	import { t } from '$lib/services/i18n';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import type Session from '$lib/types/session';
	import type User from '$lib/types/user';
	import Message from '$lib/types/message';
	import type Feedback from '$lib/types/feedback';
	import { displayTime } from '$lib/utils/date';
	import { Icon, XMark } from 'svelte-hero-icons';

	export let session: Session;
	export let user: User;
	
	let isOpen = false;
	let allFeedbacks: Feedback[] = [];
	
	function toggleSidebar() {
		isOpen = !isOpen;
	}

	function extractAllFeedbacks(messages: (Message | null)[]) {
		const feedbacks: Feedback[] = [];
		
		messages.forEach(message => {
			if (message instanceof Message) {
				const messageFeedbacks = get(message.feedbacks);
				if (messageFeedbacks && messageFeedbacks.length > 0) {
					feedbacks.push(...messageFeedbacks);
				}
			}
		});
		
		return feedbacks.sort((a, b) => b.date.getTime() - a.date.getTime());
	}

	// Subscribe to messages changes
	$: {
		const messages = get(session.messages) as (Message | null)[];
		if (messages) {
			allFeedbacks = extractAllFeedbacks(messages);
		}
	}

	onMount(() => {
		const messages = get(session.messages) as (Message | null)[];
		if (messages) {
			allFeedbacks = extractAllFeedbacks(messages);
		}
	});
</script>

<!-- Button to toggle the sidebar -->
<button 
	class="fixed z-30 bottom-20 right-4 bg-primary text-white rounded-full p-3 shadow-lg hover:bg-primary-focus transition-colors duration-200"
	on:click={toggleSidebar}
	aria-label={isOpen ? $t('button.close') : $t('session.feedback.toggle')}
>
	{#if isOpen}
		<Icon src={XMark} size="20" />
	{:else}
		<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
		</svg>
	{/if}
</button>

<!-- Feedback Sidebar -->
<div 
	class="fixed top-0 right-0 h-full z-20 bg-white shadow-lg transition-transform duration-300 overflow-y-auto"
	class:translate-x-0={isOpen} 
	class:translate-x-full={!isOpen}
	style="width: 350px;"
>
	<div class="p-4 border-b">
		<h2 class="text-xl font-semibold text-center">
			{$t('session.feedback.title')}
		</h2>
	</div>

	{#if allFeedbacks.length === 0}
		<div class="flex flex-col items-center justify-center h-48">
			<p class="text-gray-500 text-center p-6">
				{$t('session.feedback.empty')}
			</p>
		</div>
	{:else}
		<div class="p-4 space-y-4">
			{#each allFeedbacks as feedback (feedback.uuid)}
				<div class="bg-gray-50 p-3 rounded-lg shadow-sm border">
					<div class="flex items-center gap-2 mb-1">
						<div class="w-8 h-8 rounded-full overflow-hidden shadow-sm">
							<img
								src={`https://gravatar.com/avatar/${feedback.message.user.emailHash}?d=identicon`}
								alt={feedback.message.user.nickname}
								class="rounded-full"
							/>
						</div>
						<span class="text-sm font-medium">{feedback.message.user.nickname}</span>
						<span class="text-xs text-gray-500 ml-auto">{displayTime(feedback.date)}</span>
					</div>
					
					<div class="text-sm mb-2 p-2 bg-white rounded break-words">
						"{feedback.message.content.substring(feedback.start, feedback.end)}"
					</div>
					
					{#if feedback.content}
						<div class="text-sm p-2 bg-blue-50 rounded break-words">
							<span class="font-medium">{$t('session.feedback.comment')}:</span> {feedback.content}
						</div>
					{:else}
						<div class="text-xs text-gray-500 italic">
							{$t('session.feedback.noComment')}
						</div>
					{/if}
					
					<a href={`#${feedback.message.uuid}`} class="text-xs text-blue-500 inline-block mt-2 hover:underline">
						{$t('session.feedback.viewMessage')}
					</a>
				</div>
			{/each}
		</div>
	{/if}
</div>
