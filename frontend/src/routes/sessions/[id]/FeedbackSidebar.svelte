<script lang="ts">
	import { t } from '$lib/services/i18n';
	import { onMount, onDestroy } from 'svelte';
	import { get } from 'svelte/store';
	import type Session from '$lib/types/session';
	import type User from '$lib/types/user';
	import Message from '$lib/types/message';
	import type Feedback from '$lib/types/feedback';
	import { displayTime } from '$lib/utils/date';
	import { Icon, XMark, ArrowUturnLeft, ChatBubbleLeft, ArrowTopRightOnSquare } from 'svelte-hero-icons';

	let { 
		session, 
		user, 
		isOpen = $bindable(true),  // Make isOpen bindable with default true
		onToggle = $bindable(),     // Optional callback for toggle events
		onNewFeedback = $bindable() // Optional callback for new feedback notifications
	}: { 
		session: Session; 
		user: User; 
		isOpen?: boolean;
		onToggle?: () => void;
		onNewFeedback?: () => void;
	} = $props();
	
	let allFeedbacks: Feedback[] = [];
	let unsubscribers: (() => void)[] = [];
	
	// Group feedbacks by message and highlight range
	function groupFeedbacksByHighlight(feedbacks: Feedback[]) {
		const grouped = new Map();
		
		feedbacks.forEach(feedback => {
			// Used message ID + highlight range as the key
			const key = `${feedback.message.id}-${feedback.start}-${feedback.end}`;
			
			if (!grouped.has(key)) {
				grouped.set(key, {
					highlight: feedback.message.content.substring(feedback.start, feedback.end),
					messageId: feedback.message.uuid,
					comments: []
				});
			}
			
			grouped.get(key).comments.push(feedback);
		});
		
		return Array.from(grouped.values());
	}
	
	let groupedFeedbacks = $state([] as any[]);
	
	function toggleSidebar() {
		if (onToggle) onToggle();
	}

	async function deleteFeedback(feedback: Feedback) {
		if (!confirm($t('chatbox.deleteFeedback'))) return;
		await feedback.message.deleteFeedback(feedback);
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

	function setupMessageSubscriptions(messages: (Message | null)[]) {
		// Cleanup previous subscriptions
		unsubscribers.forEach(unsub => unsub());
		unsubscribers = [];

		// Subscribe to each message's feedbacks
		messages.forEach(message => {
			if (message instanceof Message) {
				const unsubscribe = message.feedbacks.subscribe(() => {
					const currentMessages = get(session.messages) as (Message | null)[];
					allFeedbacks = extractAllFeedbacks(currentMessages);
					groupedFeedbacks = groupFeedbacksByHighlight(allFeedbacks);
				});
				unsubscribers.push(unsubscribe);
			}
		});
	}

	// Subscribe to messages changes
	$effect(() => {
		const messages = get(session.messages) as (Message | null)[];
		if (messages) {
			allFeedbacks = extractAllFeedbacks(messages);
			groupedFeedbacks = groupFeedbacksByHighlight(allFeedbacks);
			setupMessageSubscriptions(messages);
		}
	});

	onMount(() => {
		const messages = get(session.messages) as (Message | null)[];
		if (messages) {
			allFeedbacks = extractAllFeedbacks(messages);
			groupedFeedbacks = groupFeedbacksByHighlight(allFeedbacks);
			setupMessageSubscriptions(messages);
		}
	});

	onDestroy(() => {
		// Cleanup all subscriptions
		unsubscribers.forEach(unsub => unsub());
	});
	
	// Function to handle reply to a comment
	function handleReply(feedbackGroup: any) {
		// This is a placeholder - the actual implementation would depend on backend API
		console.log('Reply to comment:', feedbackGroup);
	}
</script>

<div 
	class="h-full bg-white shadow-lg overflow-y-auto"
	style="width: 100%;"
	class:pointer-events-none={!isOpen}
	aria-hidden={!isOpen}
>
	<div class="p-4 border-b bg-base-200">
		<div class="flex items-center justify-between">
			<h2 class="text-lg font-semibold text-base-content flex items-center gap-2">
				<Icon src={ChatBubbleLeft} size="20" />
				{$t('session.feedback.title')}
			</h2>
			<button 
				class="btn btn-ghost btn-sm btn-circle"
				onclick={toggleSidebar}
				aria-label={$t('session.feedback.hide')}
				title={$t('session.feedback.hide')}
			>
				<Icon src={XMark} size="18" />
			</button>
		</div>
	</div>

	{#if groupedFeedbacks.length === 0}
		<div class="flex flex-col items-center justify-center h-48 text-center">
			<Icon src={ChatBubbleLeft} size="48" class="text-base-300 mb-3" />
			<p class="text-base-content/60 text-sm px-6">
				{$t('session.feedback.empty')}
			</p>
		</div>
	{:else}
		<div class="p-4 space-y-4">
			{#each groupedFeedbacks as feedbackGroup}
				<div class="card card-compact bg-base-100 shadow-sm border border-base-300 hover:shadow-md transition-shadow">
					<div class="card-body">
						<!-- Highlight text with "Voir le message" link on hover -->
						<div class="relative mb-3 p-3 pb-6 bg-warning/10 rounded-lg break-words group border-l-4 border-warning">
							<div class="text-sm font-medium text-base-content leading-relaxed">"{feedbackGroup.highlight}"</div>
							<a 
								href={`#${feedbackGroup.messageId}`} 
								class="absolute bottom-2 right-2 text-xs text-warning opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:text-warning-content flex items-center gap-1"
							>
								<Icon src={ArrowTopRightOnSquare} size="12" />
								{$t('session.feedback.viewMessage')}
							</a>
						</div>
						
						<!-- Comment thread -->
						<div class="space-y-3">
							{#each feedbackGroup.comments as feedback}
								<div class="flex gap-3 group">
									<div class="avatar">
										<div class="w-8 h-8 rounded-full border-2 border-base-300">
											<img
												src={`https://gravatar.com/avatar/${feedback.message.user.emailHash}?d=identicon`}
												alt=""
												class="w-full h-full object-cover rounded-full"
											/>
										</div>
									</div>
									<div class="flex-grow relative min-w-0">
										{#if feedback.content}
											<div class="text-sm p-3 bg-base-200 rounded-lg break-words relative group/comment">
												{feedback.content}
												<button
													class="absolute -top-1 -right-1 opacity-0 group-hover/comment:opacity-100 transition-opacity btn btn-xs btn-circle btn-error"
													onclick={() => deleteFeedback(feedback)}
													aria-label={$t('button.delete')}
												>
													<Icon src={XMark} class="w-3 h-3" />
												</button>
											</div>
										{:else}
											<div class="text-xs text-base-content/60 italic p-3 bg-base-200 rounded-lg relative group/comment">
												{$t('session.feedback.noComment')}
												<button
													class="absolute -top-1 -right-1 opacity-0 group-hover/comment:opacity-100 transition-opacity btn btn-xs btn-circle btn-error"
													onclick={() => deleteFeedback(feedback)}
													aria-label={$t('button.delete')}
												>
													<Icon src={XMark} class="w-3 h-3" />
												</button>
											</div>
										{/if}
									</div>
								</div>
							{/each}
						</div>
						
						<!-- Reply button -->
						<button 
							class="btn btn-ghost btn-sm mt-3 flex items-center gap-2 justify-start"
							onclick={() => handleReply(feedbackGroup)}
						>
							<Icon src={ArrowUturnLeft} class="w-4 h-4" />
							<span>{$t('session.feedback.reply')}</span>
						</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
