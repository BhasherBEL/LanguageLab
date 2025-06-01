<script lang="ts">
	import { t } from '$lib/services/i18n';
	import { get } from 'svelte/store';
	import type Session from '$lib/types/session';
	import type User from '$lib/types/user';
	import Message from '$lib/types/message';
	import type Feedback from '$lib/types/feedback';
	import { displayTime } from '$lib/utils/date';
	import {
		Icon,
		XMark,
		ArrowUturnLeft,
		ChatBubbleLeft,
		ArrowTopRightOnSquare
	} from 'svelte-hero-icons';
	import { highlightedMessageId } from '$lib/stores/messageHighlight';

	let {
		session,
		user,
		isOpen = $bindable(true), // Make isOpen bindable with default true
		onToggle, // Optional callback for toggle events
		onNewFeedback = $bindable(), // Optional callback for new feedback notifications
		onScrollToMessage = $bindable() // Callback to handle message scrolling
	}: {
		session: Session;
		user: User;
		isOpen?: boolean;
		onToggle?: () => void;
		onNewFeedback?: () => void;
		onScrollToMessage?: (messageId: string) => void;
	} = $props();

	let allFeedbacks: Feedback[] = [];

	function prepareFeedbackCards(feedbacks: Feedback[]) {
		return feedbacks.map((feedback) => ({
			highlight: feedback.message.content.substring(feedback.start, feedback.end),
			messageId: feedback.message.uuid,
			feedback: feedback
		}));
	}

	let feedbackCards = $state([] as any[]);

	function toggleSidebar() {
		if (onToggle) onToggle();
	}

	async function deleteFeedback(feedback: Feedback) {
		if (!confirm($t('chatbox.deleteFeedback'))) return;
		await feedback.message.deleteFeedback(feedback);
	}

	function extractAllFeedbacks(messages: (Message | null)[]) {
		const feedbacks: Feedback[] = [];

		messages.forEach((message) => {
			if (message instanceof Message) {
				const messageFeedbacks = get(message.feedbacks);
				if (messageFeedbacks && messageFeedbacks.length > 0) {
					feedbacks.push(...messageFeedbacks);
				}
			}
		});

		return feedbacks.sort((a, b) => b.date.getTime() - a.date.getTime());
	}

	// Track processed message IDs to avoid duplicate subscriptions
	let processedMessageIds = new Set<string>();

	//Handles all feedback management
	$effect(() => {
		// Subscribe to session messages changes
		const unsubscribe = session.messages.subscribe((messages) => {
			if (messages) {
				// Filter to only Message instances for feedback extraction
				const messageObjects = messages.filter((m): m is Message => m instanceof Message);
				allFeedbacks = extractAllFeedbacks(messageObjects);
				feedbackCards = prepareFeedbackCards(allFeedbacks);

				// Set up subscriptions for new messages
				messageObjects.forEach((message) => {
					if (!processedMessageIds.has(message.uuid)) {
						processedMessageIds.add(message.uuid);
						message.feedbacks.subscribe(() => {
							const currentMessages = get(session.messages);
							const currentMessageObjects = currentMessages.filter(
								(m): m is Message => m instanceof Message
							);
							allFeedbacks = extractAllFeedbacks(currentMessageObjects);
							feedbackCards = prepareFeedbackCards(allFeedbacks);
						});
					}
				});
			}
		});

		// Cleanup function
		return () => {
			unsubscribe();
		};
	});

	// Function to handle reply to a comment
	function handleReply(feedbackCard: any) {
		// This is a placeholder - the actual implementation would depend on backend API
		console.log('Reply to comment:', feedbackCard);
	}

	// Function to scroll to message
	function scrollToMessage(messageId: string) {
		// Set the highlighted message in the store
		highlightedMessageId.set(messageId);

		// Call parent callback if provided
		if (onScrollToMessage) {
			onScrollToMessage(messageId);
		}

		// Clear highlight after animation duration
		setTimeout(() => {
			highlightedMessageId.set(null);
		}, 2000);
	}
</script>

<div
	class="h-full w-full bg-white shadow-lg overflow-y-auto"
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

	{#if feedbackCards.length === 0}
		<div class="flex flex-col items-center justify-center h-48 text-center">
			<Icon src={ChatBubbleLeft} size="48" class="text-base-300 mb-3" />
			<p class="text-base-content/60 text-sm px-6">
				{$t('session.feedback.empty')}
			</p>
		</div>
	{:else}
		<div class="p-4 space-y-4">
			{#each feedbackCards as feedbackCard}
				<div class="card card-compact bg-base-100 shadow-sm border border-base-300 relative">
					<div class="card-body">
						<div class="relative mb-2 break-words group">
							<button
								onclick={() => scrollToMessage(feedbackCard.messageId)}
								class="absolute -top-1 -right-1 btn btn-primary btn-xs px-1 py-0.5 h-6 min-h-6 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105 flex items-center gap-0.5 z-10"
							>
								<Icon src={ArrowTopRightOnSquare} size="10" class="text-black" />
								<span class="text-black text-xs font-normal"
									>{$t('session.feedback.viewMessage')}</span
								>
							</button>
							<div class="text-sm text-base-content/70 leading-tight">
								{feedbackCard.highlight}
							</div>
						</div>

						<div class="flex gap-3 group">
							<div class="avatar">
								<div class="w-8 h-8 rounded-full border-2 border-base-300">
									<img
										src={`https://gravatar.com/avatar/${feedbackCard.feedback.message.user.emailHash}?d=identicon`}
										alt=""
										class="w-full h-full object-cover rounded-full"
									/>
								</div>
							</div>
							<div class="flex-grow relative min-w-0">
								{#if feedbackCard.feedback.content}
									<div
										class="text-sm p-3 bg-base-200 rounded-lg break-words relative group/comment"
									>
										{feedbackCard.feedback.content}
										<button
											class="absolute -top-1 -right-1 opacity-0 group-hover/comment:opacity-100 transition-opacity btn btn-xs btn-circle btn-error"
											onclick={() => deleteFeedback(feedbackCard.feedback)}
											aria-label={$t('button.delete')}
										>
											<Icon src={XMark} class="w-3 h-3" />
										</button>
									</div>
								{:else}
									<div
										class="text-xs text-base-content/60 italic p-3 bg-base-200 rounded-lg relative group/comment"
									>
										{$t('session.feedback.markedText', {
											user: feedbackCard.feedback.message.user.nickname
										})}
										<button
											class="absolute -top-1 -right-1 opacity-0 group-hover/comment:opacity-100 transition-opacity btn btn-xs btn-circle btn-error"
											onclick={() => deleteFeedback(feedbackCard.feedback)}
											aria-label={$t('button.delete')}
										>
											<Icon src={XMark} class="w-3 h-3" />
										</button>
									</div>
								{/if}
							</div>
						</div>

						<!-- Reply button -->
						<button
							class="absolute bottom-3 right-3 btn btn-primary btn-xs btn-circle shadow-sm hover:shadow-md transition-all hover:scale-105 z-10"
							onclick={() => handleReply(feedbackCard)}
							title={$t('session.feedback.reply')}
							aria-label={$t('session.feedback.reply')}
						>
							<Icon src={ArrowUturnLeft} class="w-3 h-3 text-black" />
						</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
