import { writable } from 'svelte/store';

// Store for highlighted message ID
export const highlightedMessageId = writable<string | null>(null);
