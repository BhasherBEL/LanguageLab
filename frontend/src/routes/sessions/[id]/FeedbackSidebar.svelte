<script lang="ts">
	import { t } from '$lib/services/i18n';
	import { get } from 'svelte/store';
	import type Session from '$lib/types/session';
	import type User from '$lib/types/user';
	import Message from '$lib/types/message';
	import type Feedback from '$lib/types/feedback';
	import type FeedbackReply from '$lib/types/feedbackReply';
	import { displayTime } from '$lib/utils/date';
	import {
		Icon,
		XMark,
		ArrowUturnLeft,
		ChatBubbleLeft,
		ArrowTopRightOnSquare,
		PaperAirplane,
		Pencil,
		Trash,
		ChevronDown,
		ChevronUp
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
	let replyingTo = $state<Feedback | null>(null);
	let replyContent = $state('');
	let editingReply = $state<FeedbackReply | null>(null);
	let editContent = $state('');

	// Reactive replies for each feedback
	let feedbackReplies = $state(new Map<number, FeedbackReply[]>());

	// Track collapsed state for each feedback's replies
	let collapsedReplies = $state(new Map<number, boolean>());

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

	// Track processed message IDs and feedback IDs to avoid duplicate subscriptions
	let processedMessageIds = new Set<string>();
	let processedFeedbackIds = new Set<number>();

	//Handles all feedback management
	$effect(() => {
		// Subscribe to session messages changes
		const unsubscribe = session.messages.subscribe((messages) => {
			if (messages) {
				// Filter to only Message instances for feedback extraction
				const messageObjects = messages.filter((m): m is Message => m instanceof Message);
				const newFeedbacks = extractAllFeedbacks(messageObjects);

				// Clean up replies for deleted feedbacks
				const currentFeedbackIds = new Set(newFeedbacks.map((f) => f.id));
				for (const [feedbackId] of feedbackReplies) {
					if (!currentFeedbackIds.has(feedbackId)) {
						feedbackReplies.delete(feedbackId);
						processedFeedbackIds.delete(feedbackId);
					}
				}

				allFeedbacks = newFeedbacks;
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
							const updatedFeedbacks = extractAllFeedbacks(currentMessageObjects);

							// Clean up replies for deleted feedbacks
							const updatedFeedbackIds = new Set(updatedFeedbacks.map((f) => f.id));
							for (const [feedbackId] of feedbackReplies) {
								if (!updatedFeedbackIds.has(feedbackId)) {
									feedbackReplies.delete(feedbackId);
									processedFeedbackIds.delete(feedbackId);
								}
							}

							allFeedbacks = updatedFeedbacks;
							feedbackCards = prepareFeedbackCards(allFeedbacks);
						});
					}
				});

				// Set up subscriptions for feedback replies (avoid duplicate subscriptions)
				allFeedbacks.forEach((feedback) => {
					if (!processedFeedbackIds.has(feedback.id)) {
						processedFeedbackIds.add(feedback.id);
						feedback.replies.subscribe((replies) => {
							// Sort replies by creation date (oldest first)
							const sortedReplies = [...replies].sort(
								(a, b) => a.created_at.getTime() - b.created_at.getTime()
							);
							feedbackReplies.set(feedback.id, sortedReplies);
							// Force Svelte reactivity by reassigning the Map
							feedbackReplies = new Map(feedbackReplies);
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
	async function handleReply(feedback: Feedback) {
		replyingTo = feedback;
		replyContent = '';
		// Load replies if not already loaded
		await feedback.loadReplies();
		// Set up subscription for this feedback if not already done
		if (!processedFeedbackIds.has(feedback.id)) {
			processedFeedbackIds.add(feedback.id);
			feedback.replies.subscribe((replies) => {
				// Sort replies by creation date (oldest first)
				const sortedReplies = [...replies].sort(
					(a, b) => a.created_at.getTime() - b.created_at.getTime()
				);
				feedbackReplies.set(feedback.id, sortedReplies);
				feedbackReplies = new Map(feedbackReplies);
			});
		}
		// Update the feedbackReplies map with current replies
		const replies = get(feedback.replies);
		const sortedReplies = [...replies].sort(
			(a, b) => a.created_at.getTime() - b.created_at.getTime()
		);
		feedbackReplies.set(feedback.id, sortedReplies);
		feedbackReplies = new Map(feedbackReplies);
	}

	function cancelReply() {
		replyingTo = null;
		replyContent = '';
	}

	async function submitReply() {
		if (!replyingTo || !replyContent.trim()) return;

		const success = await replyingTo.addReply(replyContent.trim(), user);

		if (success) {
			replyingTo = null;
			replyContent = '';
		}
	}

	function startEditReply(reply: FeedbackReply) {
		editingReply = reply;
		editContent = reply.content;
	}

	function cancelEditReply() {
		editingReply = null;
		editContent = '';
	}

	async function submitEditReply() {
		if (!editingReply || !editContent.trim()) return;

		const success = await editingReply.update(editContent.trim());
		if (success) {
			editingReply = null;
			editContent = '';
		}
	}

	async function deleteReply(reply: FeedbackReply) {
		if (!confirm($t('chatbox.deleteReply'))) return;
		const success = await reply.delete();
		if (success) {
			reply.feedback.deleteLocalReply(reply.id);
		}
	}

	function canEditReply(reply: FeedbackReply): boolean {
		return user.is_admin || user.is_tutor || reply.user.id === user.id;
	}

	function canDeleteReply(reply: FeedbackReply): boolean {
		return user.is_admin || user.is_tutor || reply.user.id === user.id;
	}

	// Function to toggle collapse state for replies
	function toggleRepliesCollapse(feedbackId: number) {
		const isCollapsed = collapsedReplies.get(feedbackId) || false;
		collapsedReplies.set(feedbackId, !isCollapsed);
		collapsedReplies = new Map(collapsedReplies);
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
					<div
						class="card-body"
						class:pb-12={replyingTo !== feedbackCard.feedback &&
							(feedbackReplies.get(feedbackCard.feedback.id) || []).length === 0}
						class:pb-16={(feedbackReplies.get(feedbackCard.feedback.id) || []).length > 0 ||
							replyingTo === feedbackCard.feedback}
					>
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

						<!-- Replies Section -->
						{#if (feedbackReplies.get(feedbackCard.feedback.id) || []).length > 0 || replyingTo === feedbackCard.feedback}
							<div class="mt-2" class:mb-4={!collapsedReplies.get(feedbackCard.feedback.id)}>
								<!-- Reply Counter with Collapse Button   -->
								{#if (feedbackReplies.get(feedbackCard.feedback.id) || []).length > 0}
									<button
										class="text-xs text-base-content/50 hover:text-base-content/70 font-medium flex items-center gap-1 transition-colors"
										onclick={() => toggleRepliesCollapse(feedbackCard.feedback.id)}
									>
										<span class="w-6 h-px bg-base-content/20"></span>
										{collapsedReplies.get(feedbackCard.feedback.id)
											? `View ${(feedbackReplies.get(feedbackCard.feedback.id) || []).length} ${$t('session.feedback.replies', { count: (feedbackReplies.get(feedbackCard.feedback.id) || []).length })}`
											: 'Hide replies'}
									</button>
								{/if}

								<!-- Replies List (Collapsible, Instagram style) -->
								{#if !collapsedReplies.get(feedbackCard.feedback.id)}
									<div class="space-y-2.5 mt-2">
										{#each feedbackReplies.get(feedbackCard.feedback.id) || [] as reply (reply.id)}
											<div class="flex gap-2 ml-6 relative">
												<!-- Connecting line -->
												<div
													class="absolute -left-3 top-0 w-6 h-4 border-l-2 border-b-2 border-base-content/10 rounded-bl-lg"
												></div>

												<div class="avatar flex-shrink-0">
													<div class="w-6 h-6 rounded-full">
														<img
															src={`https://gravatar.com/avatar/${reply.user.emailHash}?d=identicon`}
															alt=""
															class="w-full h-full object-cover rounded-full"
														/>
													</div>
												</div>
												<div class="flex-grow min-w-0">
													{#if editingReply === reply}
														<!-- Edit Reply Form -->
														<div class="space-y-1.5">
															<div class="relative">
																<textarea
																	bind:value={editContent}
																	class="textarea w-full text-xs border-base-300 focus:border-primary focus:outline-none rounded-lg px-3 py-2 pr-16 bg-base-50 focus:bg-white transition-colors min-h-[60px] leading-relaxed"
																	placeholder="Edit comment..."
																	rows="3"
																></textarea>
																<div class="absolute right-2 top-2 flex gap-1">
																	<button
																		class="btn btn-xs btn-primary btn-circle h-5 w-5 min-h-5 border-0"
																		onclick={submitEditReply}
																		disabled={!editContent.trim()}
																		title={$t('button.save')}
																		aria-label={$t('button.save')}
																	>
																		<Icon src={PaperAirplane} class="w-2.5 h-2.5" />
																	</button>
																	<button
																		class="btn btn-xs btn-ghost btn-circle h-5 w-5 min-h-5 hover:bg-base-200"
																		onclick={cancelEditReply}
																		title={$t('button.cancel')}
																		aria-label={$t('button.cancel')}
																	>
																		<Icon src={XMark} class="w-2.5 h-2.5" />
																	</button>
																</div>
															</div>
														</div>
													{:else}
														<!-- Reply Content   -->
														<div class="group/reply flex items-start justify-between gap-2">
															<div class="text-sm text-base-content break-words flex-grow min-w-0">
																{reply.content}
															</div>

															<!-- Reply Actions   -->
															<div
																class="flex items-center gap-1 opacity-0 group-hover/reply:opacity-100 transition-opacity flex-shrink-0"
															>
																{#if canEditReply(reply)}
																	<button
																		class="p-1 hover:bg-base-200 rounded-full transition-colors"
																		onclick={() => startEditReply(reply)}
																		aria-label={$t('button.edit')}
																	>
																		<Icon
																			src={Pencil}
																			class="w-3 h-3 text-base-content/50 hover:text-base-content/70"
																		/>
																	</button>
																{/if}
																{#if canDeleteReply(reply)}
																	<button
																		class="p-1 hover:bg-red-50 rounded-full transition-colors"
																		onclick={() => deleteReply(reply)}
																		aria-label={$t('button.delete')}
																	>
																		<Icon
																			src={Trash}
																			class="w-3 h-3 text-base-content/50 hover:text-red-500"
																		/>
																	</button>
																{/if}
															</div>
														</div>
													{/if}
												</div>
											</div>
										{/each}
									</div>
								{/if}

								<!-- Reply Form   -->
								{#if replyingTo === feedbackCard.feedback}
									<div class="flex gap-2 ml-6 mt-2 mb-4 relative">
										<!-- Connecting line for reply form -->
										<div
											class="absolute -left-3 top-0 w-6 h-4 border-l-2 border-b-2 border-base-content/10 rounded-bl-lg"
										></div>

										<div class="avatar flex-shrink-0">
											<div class="w-6 h-6 rounded-full">
												<img
													src={`https://gravatar.com/avatar/${user.emailHash}?d=identicon`}
													alt=""
													class="w-full h-full object-cover rounded-full"
												/>
											</div>
										</div>
										<div class="flex-grow">
											<div class="relative">
												<textarea
													bind:value={replyContent}
													class="textarea w-full text-xs border-base-300 focus:border-primary focus:outline-none rounded-lg px-3 py-2 pr-16 bg-base-50 focus:bg-white transition-colors min-h-[60px] leading-relaxed"
													placeholder="Add a reply..."
													rows="2"
												></textarea>
												<div class="absolute right-2 top-2 flex gap-1">
													<button
														class="btn btn-xs btn-primary btn-circle h-5 w-5 min-h-5 border-0"
														onclick={submitReply}
														disabled={!replyContent.trim()}
														title={$t('button.reply')}
														aria-label={$t('button.reply')}
													>
														<Icon src={PaperAirplane} class="w-2.5 h-2.5" />
													</button>
													<button
														class="btn btn-xs btn-ghost btn-circle h-5 w-5 min-h-5 hover:bg-base-200"
														onclick={cancelReply}
														title={$t('button.cancel')}
														aria-label={$t('button.cancel')}
													>
														<Icon src={XMark} class="w-2.5 h-2.5" />
													</button>
												</div>
											</div>
										</div>
									</div>
								{/if}
							</div>
						{/if}

						<!-- Reply button -->
						{#if replyingTo !== feedbackCard.feedback}
							<button
								class="absolute bottom-2 right-2 btn btn-primary btn-xs btn-circle shadow-sm hover:shadow-md transition-all hover:scale-105 z-10"
								onclick={() => handleReply(feedbackCard.feedback)}
								title={$t('session.feedback.reply')}
								aria-label={$t('session.feedback.reply')}
							>
								<Icon src={ArrowUturnLeft} class="w-3 h-3 text-black" />
							</button>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
