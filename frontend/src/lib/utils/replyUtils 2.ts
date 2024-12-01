import type { Writable } from 'svelte/store';
import type Message from '$lib/types/message';
import { writable } from 'svelte/store';

export const replyToMessage: Writable<Message | null> = writable(null);

export function initiateReply(message: Message): void {
	replyToMessage.set(message);
}

export function clearReplyToMessage(): void {
	replyToMessage.set(null);
}

replyToMessage.subscribe((value) => {
	console.log('Updated replyToMessage:', value);
});
